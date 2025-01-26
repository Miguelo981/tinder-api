import { Locale } from '@/types.ts';
import type { Algo, AllInGender, Asset, Badge, City, CropInfo, Image, Job, Photo, School, User } from '@/interfaces/shared.ts';

type EditableUserFields = Pick<
    User,
    | 'bio'
    | 'gender'
    | 'show_gender_on_profile'
    | 'custom_gender'
>;

export interface TinderEditProfileParams {
    locale?: Locale;
    user: EditableUserFields & {
        distance_filter?: number;
        age_filter_min?: number;
        age_filter_max?: number;
        discoverable?: boolean;
        photo_optimizer_enabled?: boolean;
        global_mode?: {
            is_enabled: boolean;
        };
    };
    plus_control?: {
        hide_age: boolean;
        hide_distance: boolean;
        // recency Shows more recently active users
        // optimal Scientifically proven to get you more matches
        blend: 'optimal' | 'recency';
        hide_ads: boolean;
        // discovery settings to only people who already liked you
        discoverable_party: 'liked';
    };
}

type ExtendedPhoto = Photo & {
    fbId: string;
    faces_count?: number;
    processed_by_yolo?: boolean;
};

export interface TinderEditProfileResponse {
    meta: {
        status: number;
    };
    data: {
        user: {
            _id: string;
            age_filter_max: number;
            age_filter_min: number;
            birth_date: string;
            create_date: string;
            crm_id: string;
            pos_info: {
                state: {
                    name: string;
                    code: string;
                };
                country: {
                    name: string;
                    cc: string;
                    alpha3: string;
                };
                timezone: string;
            };
            discoverable: boolean;
            distance_filter: number;
            global_mode: {
                is_enabled: boolean;
                display_language: string;
                language_preferences: Array<{
                    language: string;
                    is_selected: boolean;
                }>;
            };
            auto_expansion: {
                age_toggle: boolean;
                distance_toggle: boolean;
            };
            gender: -1 | 0 | 1;
            all_in_gender: AllInGender[];
            gender_filter: number;
            show_gender_on_profile: boolean;
            name: string;
            photos: ExtendedPhoto[];
            photos_processing: boolean;
            photo_optimizer_enabled: boolean;
            ping_time: string;
            jobs: Job[];
            schools: School[];
            badges: Badge[];
            phone_id: string;
            interested_in: number[];
            interested_in_genders: number[];
            pos: {
                lat: number;
                lon: number;
            };
            billing_info: {
                supported_payment_methods: string[];
            };
            autoplay_video: string;
            top_picks_discoverable: boolean;
            photo_tagging_enabled: boolean;
            city: City & {
                coords: {
                    lat: number;
                    lon: number;
                };
            };
            show_orientation_on_profile: boolean;
            show_same_orientation_first: {
                checked: boolean;
                should_show_option: boolean;
            };
            sexual_orientations: AllInGender[];
            recommended_sort_discoverable: boolean;
            selfie_verification: string;
            id_dob_verification: string;
            noonlight_protected: boolean;
            sync_swipe_enabled: boolean;
            sparks_quizzes: Array<{
                section_id: string;
                section_name: string;
                quizzes: Array<{
                    id: string;
                    name: string;
                    answer_details: any[];
                    answers: any[];
                    image_url: string;
                }>;
            }>;
            selected_descriptors: Array<{
                id: string;
                name?: string;
                type: string;
                visibility: string;
                icon_url: string;
                icon_urls: Image[];
                section_id: string;
                section_name: string;
                measurable_selection?: {
                    value: number;
                    unit_of_measure: string;
                };
                choice_selections?: Array<{
                    id: string;
                    name: string;
                    style?: string;
                    emoji?: string;
                    icon_urls?: Image[];
                    match_group_key?: string;
                }>;
            }>;
            preference_filters: Record<string, any>;
            mm_enabled: boolean;
            user_prompts: {
                section_name: string;
                max_prompts: number;
                prompts: any[];
            };
            has_face_photos: boolean;
            has_redacted_enabled: boolean;
            profile_image_tags: any[];
            image_tags_excluded: any[];
        };
    };
}
