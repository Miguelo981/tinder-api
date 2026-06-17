import type {
    TinderUpdateProfileParams,
    TinderUpdateUserProfileParams,
} from '@/interfaces/update-profile.ts';

/** The `{ user: {...} }` body sent to `POST /v2/profile`. */
export interface ProfileBody {
    user: Record<string, unknown>;
}

/** The `{ preference_filters: {...} }` body sent to `POST /v2/profile/user`. */
export interface UserProfileBody {
    preference_filters: Record<string, unknown>;
}

/** Whether any field handled by {@link toProfileBody} is present. */
/** Kilometers per mile, used to convert {@link TinderUpdateProfileParams.distanceFilterKm}. */
const KM_PER_MILE = 1.609344;

export function hasProfileFields(params: TinderUpdateProfileParams): boolean {
    return params.ageFilterMin !== undefined ||
        params.ageFilterMax !== undefined ||
        params.distanceFilter !== undefined ||
        params.distanceFilterKm !== undefined ||
        params.autoExpansion !== undefined ||
        params.bio !== undefined ||
        params.discoverable !== undefined ||
        params.genderFilter !== undefined ||
        params.showGenderOnProfile !== undefined ||
        params.globalMode !== undefined;
}

/** Whether any field handled by {@link toUserProfileBody} is present. */
export function hasUserProfileFields(
    params: TinderUpdateUserProfileParams,
): boolean {
    return params.userInterests !== undefined ||
        params.descriptors !== undefined ||
        params.hasBio !== undefined ||
        params.numberOfPhotos !== undefined;
}

/**
 * Adapt camel-cased profile params into the snake_case `{ user: {...} }` body
 * for `POST /v2/profile`. Only defined fields are emitted (partial updates).
 */
export function toProfileBody(params: TinderUpdateProfileParams): ProfileBody {
    const user: Record<string, unknown> = {};

    if (params.ageFilterMin !== undefined) user.age_filter_min = params.ageFilterMin;
    if (params.ageFilterMax !== undefined) user.age_filter_max = params.ageFilterMax;
    // The API expects distance_filter in miles. `distanceFilter` is the raw miles
    // value and wins; otherwise convert `distanceFilterKm` to miles (rounded).
    if (params.distanceFilter !== undefined) {
        user.distance_filter = params.distanceFilter;
    } else if (params.distanceFilterKm !== undefined) {
        user.distance_filter = Math.round(params.distanceFilterKm / KM_PER_MILE);
    }
    if (params.bio !== undefined) user.bio = params.bio;
    if (params.discoverable !== undefined) user.discoverable = params.discoverable;
    if (params.genderFilter !== undefined) user.gender_filter = params.genderFilter;
    if (params.showGenderOnProfile !== undefined) {
        user.show_gender_on_profile = params.showGenderOnProfile;
    }

    if (params.autoExpansion !== undefined) {
        const autoExpansion: Record<string, unknown> = {};
        if (params.autoExpansion.ageToggle !== undefined) {
            autoExpansion.age_toggle = params.autoExpansion.ageToggle;
        }
        if (params.autoExpansion.distanceToggle !== undefined) {
            autoExpansion.distance_toggle = params.autoExpansion.distanceToggle;
        }
        user.auto_expansion = autoExpansion;
    }

    if (params.globalMode !== undefined) {
        const globalMode: Record<string, unknown> = {};
        if (params.globalMode.isEnabled !== undefined) {
            globalMode.is_enabled = params.globalMode.isEnabled;
        }
        if (params.globalMode.displayLanguage !== undefined) {
            globalMode.display_language = params.globalMode.displayLanguage;
        }
        if (params.globalMode.languagePreferences !== undefined) {
            globalMode.language_preferences = params.globalMode.languagePreferences.map(
                (pref) => ({ language: pref.language, is_selected: pref.isSelected }),
            );
        }
        user.global_mode = globalMode;
    }

    return { user };
}

/**
 * Adapt camel-cased preference params into the snake_case
 * `{ preference_filters: {...} }` body for `POST /v2/profile/user`.
 * Only defined fields are emitted (partial updates).
 */
export function toUserProfileBody(
    params: TinderUpdateUserProfileParams,
): UserProfileBody {
    const preferenceFilters: Record<string, unknown> = {};

    if (params.userInterests !== undefined) {
        preferenceFilters.preference_user_interests_filter = params.userInterests;
    }
    if (params.descriptors !== undefined) {
        preferenceFilters.preference_descriptors_filter = params.descriptors.map(
            (descriptor) => ({
                id: descriptor.id,
                selected_choices: descriptor.selectedChoices,
            }),
        );
    }
    if (params.hasBio !== undefined) {
        preferenceFilters.preference_has_bio_filter = params.hasBio;
    }
    if (params.numberOfPhotos !== undefined) {
        preferenceFilters.preference_number_of_photos_filter = params.numberOfPhotos;
    }

    return { preference_filters: preferenceFilters };
}
