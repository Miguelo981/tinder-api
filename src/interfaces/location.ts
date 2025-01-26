import type { Locale, Meta } from '@/types.ts';

export interface TinderLocationParams {
    locale?: Locale;
    lat: number;
    lon: number;
}

interface ReadReceipts {
    enabled: boolean;
}

interface BiometricConsent {
    consents: string[];
    needs_consent: boolean;
}

interface VoterRegistration {
    registration_open: boolean;
    status: string;
    state: string;
    vote_by_mail_status: string;
}

interface ProfileSettings {
    can_edit_jobs: boolean;
    can_edit_schools: boolean;
    can_edit_email: boolean;
    can_add_photos_from_facebook: boolean;
    can_show_common_connections: boolean;
    school_name_max_length: number;
    job_title_max_length: number;
    company_name_max_length: number;
}

interface SuperLike {
    enabled: boolean;
    alc_mode: number;
}

interface LocationPrechecks {
    codes: Array<{ code: number }>;
}

interface AgeVerification {
    status: string;
}

interface SexualOrientations {
    enabled: boolean;
    excluded_orientations: string[];
    orientations: string[];
    is_pride_flame_enabled: boolean;
}

interface SuperBoost {
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
}

interface SecretAdmirer {
    enabled: boolean;
    min_likes_count: number;
    max_likes_count: number;
    fetch_secret_admirer_on_card: number;
    reveal_like_variant: number;
    reveal_like_min_likes_count: number;
}

interface FastMatch {
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
    secret_admirer: SecretAdmirer;
    use_teaser_endpoint: boolean;
}

interface ClientResources {
    rate_card: {
        carousel: Array<{ slug: string }>;
    };
    plus_screen: string[];
    platinum_paywall_carousel: string[];
}

interface Boost {
    enabled: boolean;
    duration: number;
    intro_multiplier: number;
    use_new_copy: boolean;
}

interface BiometricLiveness {
    state: string;
}

interface TypingIndicator {
    typing_heartbeat: number;
    typing_ttl: number;
}

interface TopPicksOffsets {
    offset0: number;
    offset1: number;
    offset2: number;
    offset3: number;
}

interface TopPicks {
    enabled: boolean;
    local_daily_enabled: boolean;
    local_daily_msg: string;
    local_daily_offsets: TopPicksOffsets;
    free_daily: boolean;
    num_free_rated_limit: number;
    refresh_interval: number;
    lookahead: number;
    post_swipe_paywall: boolean;
    top_picks_categories_enabled: boolean;
}

interface Account {
    email_prompt_required: boolean;
    email_prompt_dismissible: boolean;
    email_prompt_show_marketing_opt_in: boolean;
    email_prompt_show_strict_opt_in: boolean;
    fireboarding: boolean;
}

interface CrmInbox {
    enabled: boolean;
}

interface ChatSuggestionConsent {
    consents: string[];
    needs_consent: boolean;
}

export interface TinderLocationResponse {
    meta: Meta;
    data: {
        readreceipts: ReadReceipts;
        biometric_consent: BiometricConsent;
        voter_registration: VoterRegistration;
        profile: ProfileSettings;
        super_like: SuperLike;
        location_prechecks: LocationPrechecks;
        age_verification: AgeVerification;
        sexual_orientations: SexualOrientations;
        gold_homepage: { enabled: boolean };
        super_boost: SuperBoost;
        intro_pricing: { enabled: boolean };
        multi_photo: { enabled: boolean };
        message_consent: BiometricConsent;
        terms_of_service: {
            enabled: boolean;
            needs_accept: boolean;
            version: string;
        };
        fast_match: FastMatch;
        client_resources: ClientResources;
        levers: Record<string, {
            value: any;
            p_id: string;
        }>;
        boost: Boost;
        biometric_liveness: BiometricLiveness;
        typing_indicator: TypingIndicator;
        top_picks: TopPicks;
        account: Account;
        crm_inbox: CrmInbox;
        chat_suggestion_consent: ChatSuggestionConsent;
    };
}
