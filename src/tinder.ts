import { DEFAULT_CHAT_MESSAGES_COUNT, DEFAULT_LOCALE, DEFAULT_MATCHES_COUNT, DEFAULT_SCOPES, TINDER_API_URL, TINDER_ROUTER } from "@/constants.ts";
import type { ConfigurationParameters, Endpoint, TinderResponse, RequestParams } from "@/types.ts";
import type { ITinderAPI } from "@/interfaces/tinder.ts";
import type { ConfigurationOptions } from "@/types.ts";
import type { TinderSearchParams, TinderSearchResponse } from "@/interfaces/search.ts";
import type { TinderLikeParams, TinderLikeResponse } from "@/interfaces/like.ts";
import type { TinderDislikeParams, TinderDislikeResponse } from "@/interfaces/dislike.ts";
import type { TinderProfileParams, TinderProfileResponse } from "./interfaces/profile.ts";
import type { TinderMatchesParams, TinderMatchesResponse } from "@/interfaces/matches.ts";
import type { TinderChatMessagesParams, TinderChatMessagesResponse, TinderSendMessageParams, TinderSendMessaResponse } from "./interfaces/chat.ts";

export class TinderAPI implements ITinderAPI {
    private baseUrl: URL = TINDER_API_URL
    /**
   * parameter for grant type
   *
   * @type name security name
   * @memberof TinderAPI
   */
    private xAuthToken?:
        | string
        | Promise<string>
        | ((name: string) => string)
        | ((name: string) => Promise<string>)
    /**
   * base options for axios calls
   *
   * @type {ConfigurationOptions}
   * @memberof TinderAPI
   */
    private baseOptions?: ConfigurationOptions

    constructor(param: ConfigurationParameters = { xAuthToken: '' }) {
        this.xAuthToken = param.xAuthToken;

        if (!this.baseOptions) {
            this.baseOptions = {
                defaultLocale: DEFAULT_LOCALE
            }
        }

        this.baseOptions.headers = {
            'X-AUTH-TOKEN': this.xAuthToken,
            ...this.baseOptions.headers,
        }
    }

    private async request({ method, endpoint, ...rest }: RequestParams) {
        try {
            const url = new URL(endpoint, this.baseUrl);
            const headers = this.getHeaders();
            const options: RequestInit = {
                headers,
                method,
            }

            if ('params' in rest && rest.params?.size! > 0) {
                for (const key of rest.params?.keys() ?? []) {
                    url.searchParams.append(key, rest.params?.get(key)!);
                }
            }

            const data = 'data' in rest ? rest.data : {};

            const response = await this.sendRequest(url.toString(), options, data);

            return this.processResponse(response)
        } catch (error: any) {
            throw new Error(`Failed to make request: ${error.message}`);
        }
    }

    private get<T>(endpoint: Endpoint, params?: URLSearchParams): Promise<T> {
        return this.request({ endpoint, params, method: 'GET' }) as Promise<T>;
    }

    private post<T>(endpoint: Endpoint, data = {}, params?: URLSearchParams): Promise<T> {
        return this.request({ endpoint, data, params, method: 'POST' }) as Promise<T>;
    }

    private getHeaders(): Headers {
        return new Headers({
            'Content-Type': 'application/json',
            ...this.baseOptions!.headers,
        });
    }

    private async sendRequest(url: string, options: RequestInit, data = {}) {
        if (options.method === 'POST' && Object.keys(data).length) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response
    }

    private async processResponse<T>(response: Response): Promise<TinderResponse<T>> {
        let data: any
        const contentType = response.headers.get('content-type') ?? '';

        if (contentType.includes('application/json')) {
            data = await response.json()
        } else {
            data = await response.text()
        }

        return {
            data,
            response,
        }
    }

    /**
     *
     * @summary Get core search results
     * @param {TinderSearchParams} params
     * @returns {Promise<TinderResponse<TinderSearchResponse>>}
     */
    async search(params: TinderSearchParams = { locale: this.baseOptions?.defaultLocale }): Promise<TinderResponse<TinderSearchResponse>> {
        const query = new URLSearchParams({ ...params })
        const data = await this.get<TinderResponse<TinderSearchResponse>>(TINDER_ROUTER.search, query);

        return data
    }

    /**
     * 
     * @summary Likes a profile
     * @param {TinderLikeParams} params 
     * @returns {Promise<TinderResponse<TinderLikeResponse>>}
     */
    async like(params: TinderLikeParams): Promise<TinderResponse<TinderLikeResponse>> {
        const query = new URLSearchParams({ locale: params.locale ?? this.baseOptions?.defaultLocale! })
        const url = `${TINDER_ROUTER.like}/${params?.userId}` as Endpoint
        const body = {
            s_number: params?.s_number,
            liked_content_id: params?.liked_content_id,
            liked_content_type: params?.liked_content_type,
        }
        const data = await this.post<TinderResponse<TinderLikeResponse>>(url, body, query);

        return data
    }

    /**
     * 
     * @summary Dislikes a profile
     * @param {TinderDislikeParams} params 
     * @returns {Promise<TinderResponse<TinderDislikeResponse>>}
     */
    async dislike(params: TinderDislikeParams): Promise<TinderResponse<TinderDislikeResponse>> {
        const query = new URLSearchParams({
            locale: params.locale ?? this.baseOptions?.defaultLocale ?? DEFAULT_LOCALE,
            s_number: String(params.s_number)
        })
        const url = `${TINDER_ROUTER.dislike}/${params.userId}` as Endpoint
        const data = await this.get<TinderResponse<TinderDislikeResponse>>(url, query);

        return data
    }

    /**
     * 
     * @summary Get authenticated profile
     * @param {TinderProfileParams} params 
     * @returns {Promise<TinderResponse<TinderProfileResponse>>}
     */
    async profile(params?: TinderProfileParams): Promise<TinderResponse<TinderProfileResponse>> {
        const query = new URLSearchParams({
            locale: params?.locale ?? this.baseOptions?.defaultLocale ?? DEFAULT_LOCALE,
            include: (params?.scopes ?? DEFAULT_SCOPES).join(','),
        });
        const data = await this.get<TinderResponse<TinderProfileResponse>>(TINDER_ROUTER.profile, query);

        return data
    }

    /**
     * @summary Get authenticated matches
     * @param {TinderMatchesParams} params 
     * @returns {Promise<TinderResponse<TinderMatchesResponse>>}
     */
    async getMatches(params?: TinderMatchesParams): Promise<TinderResponse<TinderMatchesResponse>> {
        const query = new URLSearchParams({
            locale: params?.locale ?? this.baseOptions?.defaultLocale ?? DEFAULT_LOCALE,
            count: String(params?.count ?? DEFAULT_MATCHES_COUNT),
            message: String(params?.message ?? 1),
            is_tinder_u: String(params?.isTinderU ?? false),
        });
        const data = await this.get<TinderResponse<TinderMatchesResponse>>(TINDER_ROUTER.matches, query);

        return data
    }

    /**
     * @summary Get match's chat messages
     * @param {TinderChatMessagesParams} params 
     * @returns {Promise<TinderResponse<TinderChatMessagesResponse>>}
     */
    async getChatMessages({ matchId, count = DEFAULT_CHAT_MESSAGES_COUNT, ...params }: TinderChatMessagesParams): Promise<TinderResponse<TinderChatMessagesResponse>> {
        const query = new URLSearchParams({
            locale: params?.locale ?? this.baseOptions?.defaultLocale ?? DEFAULT_LOCALE,
            count: String(count),
        });
        const url = `${TINDER_ROUTER.chatMessages}/${matchId}/messages` as Endpoint
        const data = await this.get<TinderResponse<TinderChatMessagesResponse>>(url, query);

        return data
    }

    /**
     * @summary Get authenticated matches
     * @param {TinderSendMessageParams} params 
     * @returns {Promise<TinderResponse<TinderSendMessaResponse>>}
     */
    async sendChatMessage(params: TinderSendMessageParams): Promise<TinderResponse<TinderSendMessaResponse>> {
        const query = new URLSearchParams({
            locale: params?.locale ?? this.baseOptions?.defaultLocale ?? DEFAULT_LOCALE,
        });
        const url = `${TINDER_ROUTER.sendMessage}/${params?.matchId}` as Endpoint
        const body = {
            message: params.message
        }
        const data = await this.post<TinderResponse<TinderSendMessaResponse>>(url, body, query);

        return data
    }
}
