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
  TinderLocationParams,
  TinderLocationResponse,
} from "@/interfaces/location.ts";
import type {
  TinderChatMessagesParams,
  TinderChatMessagesResponse,
  TinderSendMessageParams,
  TinderSendMessaResponse,
} from "@/interfaces/chat.ts";
import type {
  TinderUpdateProfileParams,
  TinderUpdateProfilePreferencesParams,
  TinderUpdateProfileResponse,
  TinderUpdateUserProfileParams,
  TinderUpdateUserProfileResponse,
} from "@/interfaces/update-profile.ts";
import type { TinderResponse } from "@/types.ts";

export interface ITinderAPI {
  search(
    params?: TinderSearchParams,
  ): Promise<TinderResponse<TinderSearchResponse>>;
  like(params?: TinderLikeParams): Promise<TinderResponse<TinderLikeResponse>>;
  superLike(
    params?: TinderSuperLikeParams,
  ): Promise<TinderResponse<TinderSuperLikeResponse>>;
  dislike(
    params?: TinderDislikeParams,
  ): Promise<TinderResponse<TinderDislikeResponse>>;
  profile(
    params?: TinderProfileParams,
  ): Promise<TinderResponse<TinderProfileResponse>>;
  getMatches(
    params?: TinderMatchesParams,
  ): Promise<TinderResponse<TinderMatchesResponse>>;
  getChatMessages(
    params?: TinderChatMessagesParams,
  ): Promise<TinderResponse<TinderChatMessagesResponse>>;
  sendChatMessage(
    params?: TinderSendMessageParams,
  ): Promise<TinderResponse<TinderSendMessaResponse>>;
  setLocation(
    params?: TinderLocationParams,
  ): Promise<TinderResponse<TinderLocationResponse>>;
  updateProfile(
    params: TinderUpdateProfileParams,
  ): Promise<TinderResponse<TinderUpdateProfileResponse>>;
  updateUserProfile(
    params: TinderUpdateUserProfileParams,
  ): Promise<TinderResponse<TinderUpdateUserProfileResponse>>;
  updateProfilePreferences(
    params: TinderUpdateProfilePreferencesParams,
  ): Promise<{
    profile?: TinderResponse<TinderUpdateProfileResponse>;
    user?: TinderResponse<TinderUpdateUserProfileResponse>;
  }>;
}
