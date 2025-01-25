import { Locale } from '@/types.ts';

export interface TinderLocationParams {
    locale?: Locale;
    lat: number;
    lon: number;
}

export interface TinderLocationResponse {
    meta: {
        status: number;
    };
    data: {
        readreceipts: {
            enabled: boolean;
        };
        biometric_consent: {
            consents: string[];
            needs_consent: boolean;
        };
        voter_registration: {
            registration_open: boolean;
            status: string;
            state: string;
            vote_by_mail_status: string;
        };
        profile: {
            can_edit_jobs: boolean;
            can_edit_schools: boolean;
            can_edit_email: boolean;
            can_add_photos_from_facebook: boolean;
            can_show_common_connections: boolean;
            school_name_max_length: number;
            job_title_max_length: number;
            company_name_max_length: number;
        };
        super_like: {
            enabled: boolean;
            alc_mode: number;
        };
        location_prechecks: {
            codes: Array<{
                code: number;
            }>;
        };
        age_verification: {
            status: string;
        };
        sexual_orientations: {
            enabled: boolean;
            excluded_orientations: string[];
            orientations: string[];
            is_pride_flame_enabled: boolean;
        };
        gold_homepage: {
            enabled: boolean;
        };
        super_boost: {
            enabled: boolean;
            duration: number;
            intro_multiplier: number;
            peak_hours_start_h: number;
            peak_hours_start_m: number;
            peak_hours_duration: number;
            variant: number;
            members_only_text: string;
            p1: boolean;
            entry_gold_home: boolean;
            entry_upgrade: boolean;
            show_discount: boolean;
            show_per_hour: boolean;
        };
        intro_pricing: {
            enabled: boolean;
        };
        multi_photo: {
            enabled: boolean;
        };
        message_consent: {
            consents: string[];
            needs_consent: boolean;
        };
        terms_of_service: {
            enabled: boolean;
            needs_accept: boolean;
            version: string;
        };
        fast_match: {
            enabled: boolean;
            preview_minimum_time: number;
            notif_options: number[];
            notif_defaults: number;
            new_count_fetch_interval: number;
            boost_new_count_fetch_interval: number;
            new_count_threshold: number;
            polling_mode: number;
            entry_point: boolean;
            controlla_optimization: boolean;
            secret_admirer: {
                enabled: boolean;
                min_likes_count: number;
                max_likes_count: number;
                fetch_secret_admirer_on_card: number;
                reveal_like_variant: number;
                reveal_like_min_likes_count: number;
            };
            use_teaser_endpoint: boolean;
        };
        client_resources: {
            rate_card: {
                carousel: Array<{
                    slug: string;
                }>;
            };
            plus_screen: string[];
            platinum_paywall_carousel: string[];
        };
        levers: Record<
            string,
            {
                value: any;
                p_id: string;
            }
        >;
        boost: {
            enabled: boolean;
            duration: number;
            intro_multiplier: number;
            use_new_copy: boolean;
        };
        biometric_liveness: {
            state: string;
        };
        typing_indicator: {
            typing_heartbeat: number;
            typing_ttl: number;
        };
        top_picks: {
            enabled: boolean;
            local_daily_enabled: boolean;
            local_daily_msg: string;
            local_daily_offsets: {
                offset0: number;
                offset1: number;
                offset2: number;
                offset3: number;
            };
            free_daily: boolean;
            num_free_rated_limit: number;
            refresh_interval: number;
            lookahead: number;
            post_swipe_paywall: boolean;
            top_picks_categories_enabled: boolean;
        };
        account: {
            email_prompt_required: boolean;
            email_prompt_dismissible: boolean;
            email_prompt_show_marketing_opt_in: boolean;
            email_prompt_show_strict_opt_in: boolean;
            fireboarding: boolean;
        };
        crm_inbox: {
            enabled: boolean;
        };
        chat_suggestion_consent: {
            consents: string[];
            needs_consent: boolean;
        };
    };
}
