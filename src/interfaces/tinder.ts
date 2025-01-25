import type { TinderSearchParams, TinderSearchResponse } from "@/interfaces/search.ts";
import type { TinderLikeParams, TinderLikeResponse } from "@/interfaces/like.ts";
import type { TinderDislikeParams, TinderDislikeResponse } from "@/interfaces/dislike.ts";
import type { TinderProfileParams, TinderProfileResponse } from "@/interfaces/profile.ts";
import type { TinderMatchesParams, TinderMatchesResponse } from "@/interfaces/matches.ts";
import type { TinderLocationParams, TinderLocationResponse } from "@/interfaces/location.ts";
import type { TinderSendMessageParams, TinderSendMessaResponse, TinderChatMessagesParams, TinderChatMessagesResponse } from "@/interfaces/chat.ts";
import type { TinderResponse } from "@/types.ts";

export interface ITinderAPI {
    search(params?: TinderSearchParams): Promise<TinderResponse<TinderSearchResponse>>;
    like(params?: TinderLikeParams): Promise<TinderResponse<TinderLikeResponse>>;
    dislike(params?: TinderDislikeParams): Promise<TinderResponse<TinderDislikeResponse>>;
    profile(params?: TinderProfileParams): Promise<TinderResponse<TinderProfileResponse>>
    getMatches(params?: TinderMatchesParams): Promise<TinderResponse<TinderMatchesResponse>>
    getChatMessages(params?: TinderChatMessagesParams): Promise<TinderResponse<TinderChatMessagesResponse>>
    sendChatMessage(params?: TinderSendMessageParams): Promise<TinderResponse<TinderSendMessaResponse>>
    setLocation(params?: TinderLocationParams): Promise<TinderResponse<TinderLocationResponse>>;
}