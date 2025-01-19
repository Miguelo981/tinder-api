import type { Locale, Meta } from "@/types.ts";

export interface TinderMatchesParams {
    locale?: Locale
    count?: number
    message?: number // 0 or 1, 0: no message, 1: message
    isTinderU?: boolean
}

export interface TinderMatchesResponse {
    meta: Meta;
    data: {
        matches: TinderMatch[];
    }
}

export interface TinderMatch {
    seen:                       Seen;
    _id:                        string;
    id:                         string;
    closed:                     boolean;
    common_friend_count:        number;
    common_like_count:          number;
    created_date:               Date;
    dead:                       boolean;
    last_activity_date:         Date;
    message_count:              number;
    messages:                   Message[];
    participants:               string[];
    pending:                    boolean;
    is_super_like:              boolean;
    is_boost_match:             boolean;
    is_super_boost_match:       boolean;
    is_primetime_boost_match:   boolean;
    is_experiences_match:       boolean;
    is_fast_match:              boolean;
    is_preferences_match:       boolean;
    is_matchmaker_match:        boolean;
    is_lets_meet_match:         boolean;
    is_opener:                  boolean;
    has_shown_initial_interest: boolean;
    person:                     Person;
    following:                  boolean;
    following_moments:          boolean;
    readreceipt:                Readreceipt;
    subscription_tier?:         string;
    liked_content?:             LikedContent;
    explore_attribution?:       ExploreAttribution;
}

export interface ExploreAttribution {
    catalog_id:           string;
    catalog_feature_type: string;
    catalog_type:         string;
    experience_title:     string;
    logo_url:             string;
    background_url:       string;
}

export interface LikedContent {
    by_closer?: ByCloser;
    by_opener?: ByOpener;
}

export interface ByCloser {
    user_id:       string;
    type:          string;
    photo?:        PhotoElement;
    is_swipe_note: boolean;
}

export interface PhotoElement {
    id:                 string;
    crop_info:          CropInfo;
    url:                string;
    processedFiles:     Processed[];
    fileName?:          string;
    extension:          Extension;
    webp_qf?:           number[];
    rank?:              number;
    score?:             number;
    win_count?:         number;
    assets:             any[];
    type:               MediaTypeEnum;
    media_type?:        MediaTypeEnum;
    selfie_verified?:   boolean;
    replaced_media_id?: string;
    processedVideos?:   Processed[];
}

export interface CropInfo {
    processed_by_bullseye: boolean;
    user_customized:       boolean;
    user?:                 Algo;
    algo?:                 Algo;
    faces?:                Face[];
}

export interface Algo {
    width_pct:    number;
    x_offset_pct: number;
    height_pct:   number;
    y_offset_pct: number;
}

export interface Face {
    algo:                    Algo;
    bounding_box_percentage: number;
}

export enum Extension {
    Jpg = "jpg",
    JpgWebp = "jpg,webp",
}

export enum MediaTypeEnum {
    Image = "image",
    Video = "video",
}

export interface Processed {
    url:    string;
    height: number;
    width:  number;
}

export interface ByOpener {
    user_id:       string;
    type:          string;
    photo?:        ByOpenerPhoto;
    is_swipe_note: boolean;
}

export interface ByOpenerPhoto {
    id:             string;
    crop_info:      CropInfo;
    url:            string;
    processedFiles: Processed[];
    fileName?:      string;
    extension:      Extension;
    webp_qf:        number[];
    rank:           number;
    score:          number;
    win_count:      number;
    assets:         any[];
    type:           MediaTypeEnum;
}

export interface Message {
    _id:       string;
    match_id:  string;
    sent_date: Date;
    message:   string;
    to:        string;
    from:      string;
    timestamp: number;
    matchId:   string;
}

export interface Person {
    _id:            string;
    badges?:        Badge[];
    bio?:           string;
    birth_date:     Date;
    gender:         number;
    name:           string;
    ping_time:      Date;
    photos:         PhotoElement[];
    hide_distance?: boolean;
    hide_age?:      boolean;
}

export interface Badge {
    type: BadgeType;
}

export enum BadgeType {
    SelfieVerified = "selfie_verified",
}

export interface Readreceipt {
    enabled: boolean;
}

export interface Seen {
    match_seen:        boolean;
    last_seen_msg_id?: string;
}
