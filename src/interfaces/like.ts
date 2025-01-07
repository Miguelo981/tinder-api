import type { Locale } from "@/types.ts";

export type ContentType = 'photo'

export interface TinderLikeParams {
    locale?: Locale
    userId: string
    liked_content_id: string
    liked_content_type: ContentType
    s_number: number
}

export interface TinderLikeResponse {
    match: boolean,
    likes_remaining: number,
    'X-Padding': string
    status: number
}