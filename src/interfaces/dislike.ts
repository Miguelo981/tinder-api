import type { Locale } from '@/types.ts';

export interface TinderDislikeParams {
    locale?: Locale;
    userId: string;
    s_number: number;
}

export interface TinderDislikeResponse {
    'X-Padding': string;
    status: number;
}
