import type { Locale } from "@/types.ts";
import type { ContentType } from "@/interfaces/like.ts";

export interface TinderSuperLikeParams {
    locale?: Locale
    userId: string
    liked_content_id: string
    liked_content_type: ContentType
    s_number: number
}

export interface TinderSuperLikeConsumptionExpiry {
    amount: number
    timestamp_ms: number
    grant_type: string
}

export interface TinderSuperLikes {
    remaining: number
    alc_remaining: number
    new_alc_remaining: number
    allotment: number
    superlike_refresh_amount: number
    superlike_refresh_interval: number
    superlike_refresh_interval_unit: string
    resets_at: string
    consumption_expiry: TinderSuperLikeConsumptionExpiry[]
}

export interface TinderSuperLikeResponse {
    status: number
    match: boolean
    super_likes: TinderSuperLikes
    'X-Padding': string
}
