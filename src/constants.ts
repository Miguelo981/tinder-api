import type { Endpoint, Locale } from "@/types.ts";
import type { ProfileScope } from "@/interfaces/profile.ts";

export const BASE_PATH = "https://api.gotinder.com".replace(/\/+$/, "");
export const API_V = "/v2"

export const TINDER_API_URL = new URL(BASE_PATH)

type TinderRoute = 'profile' | 'search' | 'like' | 'dislike'

export const TINDER_ROUTER: Record<TinderRoute, Endpoint> = {
    profile: `${API_V}/profile`,
    search: `${API_V}/recs/core`,
    like: '/like',
    dislike: '/pass'
}

export const DEFAULT_LOCALE: Locale = 'es-ES'
export const DEFAULT_SCOPES: ProfileScope[] = ['account', 'available_descriptors', 'boost', 'bouncerbypass', 'contact_cards', 'email_settings', 'feature_access', 'instagram', 'likes', 'profile_meter', 'notifications', 'misc_merchandising', 'offerings', 'onboarding', 'paywalls', 'plus_control', 'purchase', 'readreceipts', 'spotify', 'super_likes', 'tinder_u', 'travel', 'tutorials', 'user', 'all_in_gender']