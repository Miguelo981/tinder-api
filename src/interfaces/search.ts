import type { Locale, Meta } from '@/types.ts';
import type { Spotify, User } from '@/interfaces/shared.ts';

export interface TinderSearchParams {
    locale?: Locale;
}

export interface TinderSearchResponse {
    meta: Meta;
    data: TinderSearchData;
}

export interface TinderSearchData {
    results: TinderProfile[];
}

export interface TinderProfile {
    type: ResultType;
    user: User;
    facebook: Facebook;
    spotify: Spotify;
    distance_mi: number;
    content_hash: string;
    s_number: number;
    teaser: ResultTeaser;
    teasers: ResultTeaser[];
    experiment_info?: ExperimentInfo;
    is_superlike_upsell: boolean;
    live_ops?: LiveOps;
    tappy_content: TappyContent[];
    profile_detail_content: ProfileDetailContent[];
    ui_configuration: UIConfiguration;
    user_posts: any[];
    mutuals?: Mutuals;
}

export interface ExperimentInfo {
    user_interests: UserInterests;
}

export interface UserInterests {
    selected_interests: SelectedInterest[];
}

export interface SelectedInterest {
    id: string;
    name: string;
    is_common: boolean;
}

export interface Facebook {
    common_connections: any[];
    connection_count: number;
    common_interests: any[];
}

export interface LiveOps {
    template_name: string;
    teaser: LiveOpsTeaser;
    vibes: Vibe[];
}

export interface LiveOpsTeaser {
    type: string;
    string: string;
    sub_string: string;
    response_id: string;
}

export interface Vibe {
    round: number;
    prompts: VibePrompt[];
}

export interface VibePrompt {
    is_mutual: boolean;
    prompt: string;
    response: string;
    response_id: string;
}

export interface Mutuals {
    mutuals_count: number;
    user_opt_in: boolean;
    rec_opt_in: boolean;
    mutuals: any[];
    mystery_mutuals: MysteryMutuals;
}

export interface MysteryMutuals {
    count: number;
}

export interface ProfileDetailContent {
    content: any[];
    page_content_id: string;
}

export interface TappyContent {
    content: Content[];
}

export interface Content {
    id: LocalAssetEnum;
    type?: string;
}

export enum LocalAssetEnum {
    Anthem = 'anthem',
    Bio = 'bio',
    City = 'city',
    Descriptors = 'descriptors',
    Distance = 'distance',
    Job = 'job',
    LiveOps = 'live_ops',
    Passions = 'passions',
    School = 'school',
    TopArtists = 'top_artists',
}

export interface ResultTeaser {
    string: string;
    type?: TeaserType;
}

export enum TeaserType {
    Job = 'job',
    JobPosition = 'jobPosition',
    School = 'school',
}

export enum ResultType {
    User = 'user',
}

export interface UIConfiguration {
    id_to_component_map: IDToComponentMap;
}

export interface IDToComponentMap {
    distance: Distance;
}

export interface Distance {
    text_v1: TextV1;
}

export interface TextV1 {
    content: string;
    icon: Icon;
    style: TextV1Style;
}

export interface Icon {
    local_asset: LocalAssetEnum;
}

export enum TextV1Style {
    IdentityV1 = 'identity_v1',
}

export enum Emoji {
    Empty = '\ud83d\udc40',
}
