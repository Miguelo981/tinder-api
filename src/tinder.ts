import {
  DEFAULT_CHAT_MESSAGES_COUNT,
  DEFAULT_DUOS,
  DEFAULT_LOCALE,
  DEFAULT_MATCHES_COUNT,
  DEFAULT_SCOPES,
  TINDER_API_URL,
  TINDER_ROUTER,
} from "@/constants.ts";
import type {
  ConfigurationParameters,
  Endpoint,
  RequestParams,
  TinderResponse,
} from "@/types.ts";
import type { ITinderAPI } from "@/interfaces/tinder.ts";
import type { ConfigurationOptions } from "@/types.ts";
import type {
  TinderSearchParams,
  TinderSearchResponse,
} from "@/interfaces/search.ts";
import type {
  TinderLikeParams,
  TinderLikeResponse,
} from "@/interfaces/like.ts";
import type {
  TinderSuperLikeParams,
  TinderSuperLikeResponse,
} from "@/interfaces/superlike.ts";
import type {
  TinderDislikeParams,
  TinderDislikeResponse,
} from "@/interfaces/dislike.ts";
import type {
  TinderProfileParams,
  TinderProfileResponse,
} from "@/interfaces/profile.ts";
import type {
  TinderMatchesParams,
  TinderMatchesResponse,
} from "@/interfaces/matches.ts";
import type {
  TinderChatMessagesParams,
  TinderChatMessagesResponse,
  TinderSendMessageParams,
  TinderSendMessaResponse,
} from "@/interfaces/chat.ts";
import type {
  TinderLocationParams,
  TinderLocationResponse,
} from "@/interfaces/location.ts";
import type {
  TinderUpdateProfileParams,
  TinderUpdateProfilePreferencesParams,
  TinderUpdateProfileResponse,
  TinderUpdateUserProfileParams,
  TinderUpdateUserProfileResponse,
} from "@/interfaces/update-profile.ts";
import {
  hasProfileFields,
  hasUserProfileFields,
  type ProfileBody,
  toProfileBody,
  toRestoreParams,
  toUserProfileBody,
  type UserProfileBody,
} from "@/adapters/update-profile.ts";
import { TinderHttpError, TinderPremiumRequiredError } from "@/auth.ts";
import type { UpdatedProfileUser } from "@/interfaces/update-profile.ts";

export class TinderAPI implements ITinderAPI {
  private baseUrl: URL = TINDER_API_URL;
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
    | ((name: string) => Promise<string>);
  /**
   * base options for axios calls
   *
   * @type {ConfigurationOptions}
   * @memberof TinderAPI
   */
  private baseOptions?: ConfigurationOptions;

  constructor(param: ConfigurationParameters = { xAuthToken: "" }) {
    this.xAuthToken = param.xAuthToken;

    if (!this.baseOptions) {
      this.baseOptions = param.baseOptions ?? { defaultLocale: DEFAULT_LOCALE };
    }

    this.baseOptions.headers = {
      "X-AUTH-TOKEN": this.xAuthToken,
      ...this.baseOptions.headers,
    };
  }

  private async request({ method, endpoint, ...rest }: RequestParams) {
    try {
      const url = new URL(endpoint, this.baseUrl);
      const headers = this.getHeaders();
      const options: RequestInit = {
        headers,
        method,
      };

      if ("params" in rest && rest.params?.size! > 0) {
        for (const key of rest.params?.keys() ?? []) {
          url.searchParams.append(key, rest.params?.get(key)!);
        }
      }

      const data = "data" in rest ? rest.data : {};
      const response = await this.sendRequest(url.toString(), options, data);

      return this.processResponse(response);
    } catch (error) {
      // Preserve typed HTTP errors so callers can branch on the status code.
      if (error instanceof TinderHttpError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to make request: ${message}`);
    }
  }

  private get<T>(endpoint: Endpoint, params?: URLSearchParams): Promise<T> {
    return this.request({ endpoint, params, method: "GET" }) as Promise<T>;
  }

  private post<T>(
    endpoint: Endpoint,
    data = {},
    params?: URLSearchParams,
  ): Promise<T> {
    return this.request({ endpoint, data, params, method: "POST" }) as Promise<
      T
    >;
  }

  private getHeaders(): Headers {
    return new Headers({
      "Content-Type": "application/json",
      ...this.baseOptions!.headers,
    });
  }

  private async sendRequest(url: string, options: RequestInit, data = {}) {
    if (options.method === "POST" && Object.keys(data).length) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      throw new TinderHttpError(response.status, body);
    }

    return response;
  }

  private async processResponse<T>(
    response: Response,
  ): Promise<TinderResponse<T>> {
    let data: T;
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      data = await response.json() as T;
    } else {
      data = await response.text() as T;
    }

    return {
      data,
      response,
    };
  }

  /**
   * @summary Get core search results
   * @param {TinderSearchParams} params
   * @returns {Promise<TinderResponse<TinderSearchResponse>>}
   */
  async search(
    params: TinderSearchParams = {
      locale: this.baseOptions?.defaultLocale,
      duos: DEFAULT_DUOS,
    },
  ): Promise<TinderResponse<TinderSearchResponse>> {
    const query = new URLSearchParams({ ...params, duos: String(params.duos) });
    const data = await this.get<TinderResponse<TinderSearchResponse>>(
      TINDER_ROUTER.search,
      query,
    );

    return data;
  }

  /**
   * @summary Search applying discovery filters as a self-contained transaction.
   *
   * @remarks
   * The recs endpoint cannot be filtered directly, so this method:
   *  1. reads the current profile to snapshot the preferences it will change,
   *  2. applies `filters` via {@link TinderAPI.updateProfilePreferences} and
   *     waits for them to be saved,
   *  3. runs a normal {@link TinderAPI.search}, then
   *  4. restores the original preferences (always, even if the search fails).
   *
   * Editing preferences is a premium feature: if the account is not premium the
   * apply step throws {@link TinderPremiumRequiredError} and nothing is changed
   * (so no restore is attempted). If the search succeeds but the restore fails,
   * the restore error is surfaced so the caller knows preferences were left
   * modified.
   *
   * @param {TinderUpdateProfilePreferencesParams} filters
   * @param {TinderSearchParams} [searchParams]
   * @returns {Promise<TinderResponse<TinderSearchResponse>>}
   */
  async searchWithFilters(
    filters: TinderUpdateProfilePreferencesParams,
    searchParams?: TinderSearchParams,
  ): Promise<TinderResponse<TinderSearchResponse>> {
    // 1. Snapshot the current preferences so we can restore them later.
    const profileRes = await this.profile({
      scopes: ["user"],
      locale: filters.locale,
    });
    const user = profileRes.data.data.user as UpdatedProfileUser;
    const restore = toRestoreParams(user, filters);

    let applied = false;
    let result: TinderResponse<TinderSearchResponse> | undefined;
    let mainError: unknown;

    try {
      // 2. Apply the filters (throws TinderPremiumRequiredError if not premium).
      await this.updateProfilePreferences(filters);
      applied = true;
      // 3. Run the normal search with the filters in effect.
      result = await this.search(searchParams);
    } catch (error) {
      mainError = error;
    }

    // 4. Restore the original preferences, but only if we actually changed them.
    if (applied) {
      try {
        await this.updateProfilePreferences(restore);
      } catch (restoreError) {
        if (mainError === undefined) throw restoreError;
      }
    }

    if (mainError !== undefined) throw mainError;
    return result!;
  }

  /**
   * @summary Likes a profile
   * @param {TinderLikeParams} params
   * @returns {Promise<TinderResponse<TinderLikeResponse>>}
   */
  async like(
    params: TinderLikeParams,
  ): Promise<TinderResponse<TinderLikeResponse>> {
    const query = new URLSearchParams({
      locale: params.locale ?? this.baseOptions?.defaultLocale!,
    });
    const url = `${TINDER_ROUTER.like}/${params?.userId}` as Endpoint;
    const body = {
      s_number: params?.s_number,
      liked_content_id: params?.liked_content_id,
      liked_content_type: params?.liked_content_type,
    };
    const data = await this.post<TinderResponse<TinderLikeResponse>>(
      url,
      body,
      query,
    );

    return data;
  }

  /**
   * @summary Super likes a profile
   * @param {TinderSuperLikeParams} params
   * @returns {Promise<TinderResponse<TinderSuperLikeResponse>>}
   */
  async superLike(
    params: TinderSuperLikeParams,
  ): Promise<TinderResponse<TinderSuperLikeResponse>> {
    const query = new URLSearchParams({
      locale: params.locale ?? this.baseOptions?.defaultLocale!,
    });
    const url = `${TINDER_ROUTER.like}/${params.userId}/super` as Endpoint;
    const body = {
      s_number: params.s_number,
      liked_content_id: params.liked_content_id,
      liked_content_type: params.liked_content_type,
    };
    const data = await this.post<TinderResponse<TinderSuperLikeResponse>>(
      url,
      body,
      query,
    );

    return data;
  }

  /**
   * @summary Dislikes a profile
   * @param {TinderDislikeParams} params
   * @returns {Promise<TinderResponse<TinderDislikeResponse>>}
   */
  async dislike(
    params: TinderDislikeParams,
  ): Promise<TinderResponse<TinderDislikeResponse>> {
    const query = new URLSearchParams({
      locale: params.locale ?? this.baseOptions?.defaultLocale ??
        DEFAULT_LOCALE,
      s_number: String(params.s_number),
    });
    const url = `${TINDER_ROUTER.dislike}/${params.userId}` as Endpoint;
    const data = await this.get<TinderResponse<TinderDislikeResponse>>(
      url,
      query,
    );

    return data;
  }

  /**
   * @summary Get authenticated profile
   * @param {TinderProfileParams} params
   * @returns {Promise<TinderResponse<TinderProfileResponse>>}
   */
  async profile(
    params?: TinderProfileParams,
  ): Promise<TinderResponse<TinderProfileResponse>> {
    const query = new URLSearchParams({
      locale: params?.locale ?? this.baseOptions?.defaultLocale ??
        DEFAULT_LOCALE,
      include: (params?.scopes ?? DEFAULT_SCOPES).join(","),
    });
    const data = await this.get<TinderResponse<TinderProfileResponse>>(
      TINDER_ROUTER.profile,
      query,
    );

    return data;
  }

  /**
   * @summary Get authenticated matches
   * @param {TinderMatchesParams} params
   * @returns {Promise<TinderResponse<TinderMatchesResponse>>}
   */
  async getMatches(
    params?: TinderMatchesParams,
  ): Promise<TinderResponse<TinderMatchesResponse>> {
    const query = new URLSearchParams({
      locale: params?.locale ?? this.baseOptions?.defaultLocale ??
        DEFAULT_LOCALE,
      count: String(params?.count ?? DEFAULT_MATCHES_COUNT),
      message: String(params?.message ?? 1),
      is_tinder_u: String(params?.isTinderU ?? false),
    });
    const data = await this.get<TinderResponse<TinderMatchesResponse>>(
      TINDER_ROUTER.matches,
      query,
    );

    return data;
  }

  /**
   * @summary Get match's chat messages
   * @param {TinderChatMessagesParams} params
   * @returns {Promise<TinderResponse<TinderChatMessagesResponse>>}
   */
  async getChatMessages(
    { matchId, count = DEFAULT_CHAT_MESSAGES_COUNT, ...params }:
      TinderChatMessagesParams,
  ): Promise<TinderResponse<TinderChatMessagesResponse>> {
    const query = new URLSearchParams({
      locale: params?.locale ?? this.baseOptions?.defaultLocale ??
        DEFAULT_LOCALE,
      count: String(count),
    });
    const url = `${TINDER_ROUTER.chatMessages}/${matchId}/messages` as Endpoint;
    const data = await this.get<TinderResponse<TinderChatMessagesResponse>>(
      url,
      query,
    );

    return data;
  }

  /**
   * @summary Get authenticated matches
   * @param {TinderSendMessageParams} params
   * @returns {Promise<TinderResponse<TinderSendMessaResponse>>}
   */
  async sendChatMessage(
    params: TinderSendMessageParams,
  ): Promise<TinderResponse<TinderSendMessaResponse>> {
    const query = new URLSearchParams({
      locale: params?.locale ?? this.baseOptions?.defaultLocale ??
        DEFAULT_LOCALE,
    });
    const url = `${TINDER_ROUTER.sendMessage}/${params?.matchId}` as Endpoint;
    const body = {
      message: params.message,
    };
    const data = await this.post<TinderResponse<TinderSendMessaResponse>>(
      url,
      body,
      query,
    );

    return data;
  }

  /**
   * @summary Sets the user's location using a latitude and longitude.
   *
   * @remarks
   * IMPORTANT: This request can only be made once every 10 minutes.
   * Any requests during the 10-minute wait period will not change the location.
   *
   * Note: The "current location" section in your profile will not update to
   * reflect the meta location, but matches will be served based on that meta location.
   * @param {TinderLocationParams} params
   * @returns {Promise<TinderResponse<TinderLocationResponse>>}
   */
  async setLocation(
    params: TinderLocationParams,
  ): Promise<TinderResponse<TinderLocationResponse>> {
    const query = new URLSearchParams({
      locale: params?.locale ?? this.baseOptions?.defaultLocale ??
        DEFAULT_LOCALE,
    });
    const body = {
      lat: params.lat,
      lon: params.lon,
    };
    const data = await this.post<TinderResponse<TinderLocationResponse>>(
      TINDER_ROUTER.location,
      body,
      query,
    );

    return data;
  }

  /**
   * @summary Update profile / discovery settings (age & distance filters,
   * auto-expansion, bio, gender filter, ...) via `POST /v2/profile`.
   * @param {TinderUpdateProfileParams} params
   * @returns {Promise<TinderResponse<TinderUpdateProfileResponse>>}
   */
  async updateProfile(
    params: TinderUpdateProfileParams,
  ): Promise<TinderResponse<TinderUpdateProfileResponse>> {
    const query = new URLSearchParams({
      locale: params?.locale ?? this.baseOptions?.defaultLocale ??
        DEFAULT_LOCALE,
    });
    const body = toProfileBody(params);
    const data = await this.postPreferences<TinderUpdateProfileResponse>(
      TINDER_ROUTER.profile,
      body,
      query,
    );

    return data;
  }

  /**
   * POST a preference-editing request, mapping a premium-gated rejection
   * (HTTP 403) to {@link TinderPremiumRequiredError}. All other failures
   * propagate unchanged.
   */
  private async postPreferences<T>(
    endpoint: Endpoint,
    body: ProfileBody | UserProfileBody,
    query: URLSearchParams,
  ): Promise<TinderResponse<T>> {
    try {
      return await this.post<TinderResponse<T>>(endpoint, body, query);
    } catch (error) {
      if (error instanceof TinderHttpError && error.status === 403) {
        throw new TinderPremiumRequiredError(
          undefined,
          error.status,
          error.body,
        );
      }
      throw error;
    }
  }

  /**
   * @summary Update recommendation preference filters (interests, descriptors,
   * has-bio, number of photos) via `POST /v2/profile/user`.
   * @param {TinderUpdateUserProfileParams} params
   * @returns {Promise<TinderResponse<TinderUpdateUserProfileResponse>>}
   */
  async updateUserProfile(
    params: TinderUpdateUserProfileParams,
  ): Promise<TinderResponse<TinderUpdateUserProfileResponse>> {
    const query = new URLSearchParams({
      locale: params?.locale ?? this.baseOptions?.defaultLocale ??
        DEFAULT_LOCALE,
    });
    const body = toUserProfileBody(params);
    const data = await this.postPreferences<TinderUpdateUserProfileResponse>(
      TINDER_ROUTER.profileUser,
      body,
      query,
    );

    return data;
  }

  /**
   * @summary Update profile settings and preference filters in one call.
   *
   * @remarks
   * Internally calls {@link TinderAPI.updateProfile} (`/v2/profile`) and
   * {@link TinderAPI.updateUserProfile} (`/v2/profile/user`), but only hits an
   * endpoint when the input actually contains fields for it.
   * @param {TinderUpdateProfilePreferencesParams} params
   * @returns {Promise<{ profile?: TinderResponse<TinderUpdateProfileResponse>; user?: TinderResponse<TinderUpdateUserProfileResponse> }>}
   */
  async updateProfilePreferences(
    params: TinderUpdateProfilePreferencesParams,
  ): Promise<{
    profile?: TinderResponse<TinderUpdateProfileResponse>;
    user?: TinderResponse<TinderUpdateUserProfileResponse>;
  }> {
    const result: {
      profile?: TinderResponse<TinderUpdateProfileResponse>;
      user?: TinderResponse<TinderUpdateUserProfileResponse>;
    } = {};

    if (hasProfileFields(params)) {
      result.profile = await this.updateProfile(params);
    }
    if (hasUserProfileFields(params)) {
      result.user = await this.updateUserProfile(params);
    }

    return result;
  }
}
