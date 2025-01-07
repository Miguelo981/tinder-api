import type { TinderSearchParams, TinderSearchResponse } from "@/interfaces/search.ts";
import type { TinderLikeParams, TinderLikeResponse } from "@/interfaces/like.ts";
import type { TinderDislikeParams, TinderDislikeResponse } from "@/interfaces/dislike.ts";
import type { TinderProfileParams, TinderProfileResponse } from "@/interfaces/profile.ts";
import type { TinderResponse } from "@/types.ts";


export interface ITinderAPI {
    search(params?: TinderSearchParams): Promise<TinderResponse<TinderSearchResponse>>;
    like(params?: TinderLikeParams): Promise<TinderResponse<TinderLikeResponse>>;
    dislike(params?: TinderDislikeParams): Promise<TinderResponse<TinderDislikeResponse>>;
    profile(params?: TinderProfileParams): Promise<TinderResponse<TinderProfileResponse>>
}