import type { Locale, Meta } from "@/types.ts";
import type { User } from "@/interfaces/search.ts";
import type { LegacyGender } from "@/dictionaries.ts";
import type {
  DescriptorFilterInput,
  GlobalModeLanguage,
  InterestInput,
} from "@/enums.ts";

/**
 * Camel-cased input for {@link TinderAPI.updateProfile} (`POST /v2/profile`).
 * All fields are optional so partial updates are possible.
 */
export interface TinderUpdateProfileParams {
  locale?: Locale;
  /** Minimum age shown in recommendations. */
  ageFilterMin?: number;
  /** Maximum age shown in recommendations. */
  ageFilterMax?: number;
  /**
   * Maximum distance shown in recommendations, in **miles** (raw API value).
   * Tinder stores this in miles regardless of the locale shown in the app
   * (e.g. `36` ≈ 58 km). Prefer {@link TinderUpdateProfileParams.distanceFilterKm}
   * to pass kilometers. If both are set, `distanceFilter` (miles) wins.
   */
  distanceFilter?: number;
  /**
   * Maximum distance shown in recommendations, in **kilometers**. Converted to
   * miles (rounded) before being sent to the API. Ignored if
   * {@link TinderUpdateProfileParams.distanceFilter} is also provided.
   */
  distanceFilterKm?: number;
  /** Auto-expand age / distance when running low on recommendations. */
  autoExpansion?: {
    ageToggle?: boolean;
    distanceToggle?: boolean;
  };
  /** Profile bio text. */
  bio?: string;
  /** Whether the profile is shown in recommendations. */
  discoverable?: boolean;
  /** Gender to show recommendations for (man = 0, woman = 1, everyone = -1). */
  genderFilter?: LegacyGender;
  /** Whether the gender is displayed on the profile. */
  showGenderOnProfile?: boolean;
  /**
   * Global mode — show recommendations from around the world and control the
   * languages you want to match with.
   */
  globalMode?: {
    /** Enable/disable global mode. */
    isEnabled?: boolean;
    /** Display language (locale, e.g. `'es-ES'`). */
    displayLanguage?: Locale | string;
    /** Languages you want to match with (ISO 639-1 codes, e.g. `'es'`). */
    languagePreferences?: Array<
      { language: GlobalModeLanguage; isSelected: boolean }
    >;
  };
}

/**
 * Camel-cased input for {@link TinderAPI.updateUserProfile}
 * (`POST /v2/profile/user`) — the recommendation preference filters.
 * All fields are optional so partial updates are possible.
 */
export interface TinderUpdateUserProfileParams {
  locale?: Locale;
  /** Only show profiles sharing these interests ({@link UserInterest} or `it_*`). */
  userInterests?: InterestInput[];
  /** Only show profiles matching these descriptor choices ({@link Descriptor} or `de_*`). */
  descriptors?: DescriptorFilterInput[];
  /** Only show profiles that have a bio. */
  hasBio?: boolean;
  /** Only show profiles with at least this many photos. */
  numberOfPhotos?: number;
}

/**
 * Combined input for {@link TinderAPI.updateProfilePreferences}, which applies
 * profile settings and preference filters in a single call.
 */
export type TinderUpdateProfilePreferencesParams =
  & TinderUpdateProfileParams
  & TinderUpdateUserProfileParams;

/** Recommendation preference filters as echoed back by the API (snake_case). */
export interface PreferenceFilters {
  preference_user_interests_filter?: string[];
  preference_descriptors_filter?: Array<
    { id: string; selected_choices: string[] }
  >;
  preference_has_bio_filter?: boolean;
  preference_number_of_photos_filter?: number;
}

/** The user object echoed back by the update endpoints (profile + discovery fields). */
export type UpdatedProfileUser = User & {
  age_filter_min?: number;
  age_filter_max?: number;
  distance_filter?: number;
  auto_expansion?: { age_toggle: boolean; distance_toggle: boolean };
  gender_filter?: number;
  preference_filters?: PreferenceFilters;
};

/**
 * Response of `POST /v2/profile`.
 *
 * @remarks This endpoint nests the echoed user under `data.user`.
 */
export interface TinderUpdateProfileResponse {
  meta: Meta;
  data: {
    user: UpdatedProfileUser;
  };
}

/**
 * Response of `POST /v2/profile/user`.
 *
 * @remarks Unlike `POST /v2/profile`, this endpoint returns the echoed user
 * **directly** under `data` (not nested under `data.user`).
 */
export interface TinderUpdateUserProfileResponse {
  meta: Meta;
  data: UpdatedProfileUser;
}
