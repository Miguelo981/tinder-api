import { assert, assertEquals } from "@std/assert";
import {
  fromProfileUser,
  hasProfileFields,
  hasUserProfileFields,
  toProfileBody,
  toRestoreParams,
  toUserProfileBody,
} from "@/adapters/update-profile.ts";
import type {
  TinderUpdateProfilePreferencesParams,
  UpdatedProfileUser,
} from "@/interfaces/update-profile.ts";

Deno.test("hasProfileFields - false when empty, true for any profile field", () => {
  assertEquals(hasProfileFields({}), false);
  assert(hasProfileFields({ ageFilterMin: 18 }));
  assert(hasProfileFields({ distanceFilterKm: 30 }));
  assert(hasProfileFields({ autoExpansion: { ageToggle: false } }));
  assert(hasProfileFields({ globalMode: { isEnabled: true } }));
  // Preference-only fields must NOT count as profile fields.
  const prefOnly: TinderUpdateProfilePreferencesParams = { hasBio: true };
  assertEquals(hasProfileFields(prefOnly), false);
});

Deno.test("hasUserProfileFields - false when empty, true for any preference field", () => {
  assertEquals(hasUserProfileFields({}), false);
  assert(hasUserProfileFields({ hasBio: true }));
  assert(hasUserProfileFields({ numberOfPhotos: 2 }));
  assert(hasUserProfileFields({ userInterests: ["it_1"] }));
  assert(hasUserProfileFields({ descriptors: [] }));
  // Profile-only fields must NOT count as preference fields.
  const profileOnly: TinderUpdateProfilePreferencesParams = {
    ageFilterMax: 40,
  };
  assertEquals(hasUserProfileFields(profileOnly), false);
});

Deno.test("toProfileBody - only emits defined keys (partial updates)", () => {
  assertEquals(toProfileBody({}), { user: {} });
  assertEquals(toProfileBody({ ageFilterMin: 18, ageFilterMax: 40 }), {
    user: { age_filter_min: 18, age_filter_max: 40 },
  });
});

Deno.test("toProfileBody - maps camelCase to snake_case", () => {
  assertEquals(
    toProfileBody({
      bio: "hi",
      discoverable: true,
      genderFilter: 1,
      showGenderOnProfile: false,
    }),
    {
      user: {
        bio: "hi",
        discoverable: true,
        gender_filter: 1,
        show_gender_on_profile: false,
      },
    },
  );
});

Deno.test("toProfileBody - nests auto_expansion", () => {
  assertEquals(
    toProfileBody({
      autoExpansion: { ageToggle: true, distanceToggle: false },
    }),
    { user: { auto_expansion: { age_toggle: true, distance_toggle: false } } },
  );
});

Deno.test("toProfileBody - nests global_mode and language_preferences", () => {
  assertEquals(
    toProfileBody({
      globalMode: {
        isEnabled: true,
        displayLanguage: "es-ES",
        languagePreferences: [
          { language: "es", isSelected: true },
          { language: "en", isSelected: false },
        ],
      },
    }),
    {
      user: {
        global_mode: {
          is_enabled: true,
          display_language: "es-ES",
          language_preferences: [
            { language: "es", is_selected: true },
            { language: "en", is_selected: false },
          ],
        },
      },
    },
  );
});

Deno.test("toProfileBody - distanceFilter (miles) is passed through verbatim", () => {
  assertEquals(toProfileBody({ distanceFilter: 25 }), {
    user: { distance_filter: 25 },
  });
});

Deno.test("toProfileBody - distanceFilterKm converts to rounded miles", () => {
  assertEquals(
    toProfileBody({ distanceFilterKm: 30 }).user.distance_filter,
    19,
  );
  assertEquals(
    toProfileBody({ distanceFilterKm: 80 }).user.distance_filter,
    50,
  );
});

Deno.test("toProfileBody - distanceFilter wins over distanceFilterKm", () => {
  assertEquals(
    toProfileBody({ distanceFilter: 25, distanceFilterKm: 100 }).user
      .distance_filter,
    25,
  );
});

Deno.test("toUserProfileBody - only emits defined keys", () => {
  assertEquals(toUserProfileBody({}), { preference_filters: {} });
  assertEquals(toUserProfileBody({ hasBio: true }), {
    preference_filters: { preference_has_bio_filter: true },
  });
});

Deno.test("toUserProfileBody - maps filters and descriptor choices", () => {
  assertEquals(
    toUserProfileBody({
      userInterests: ["it_6056", "it_1"],
      descriptors: [
        { id: "de_29", selectedChoices: ["3", "4"] },
        { id: "de_1", selectedChoices: ["11"] },
      ],
      hasBio: true,
      numberOfPhotos: 4,
    }),
    {
      preference_filters: {
        preference_user_interests_filter: ["it_6056", "it_1"],
        preference_descriptors_filter: [
          { id: "de_29", selected_choices: ["3", "4"] },
          { id: "de_1", selected_choices: ["11"] },
        ],
        preference_has_bio_filter: true,
        preference_number_of_photos_filter: 4,
      },
    },
  );
});

Deno.test("fromProfileUser - inverts present preference fields only", () => {
  const user = {
    _id: "u1",
    age_filter_min: 21,
    age_filter_max: 35,
    distance_filter: 25,
    gender_filter: 1,
    preference_filters: {
      preference_user_interests_filter: ["it_6056"],
      preference_descriptors_filter: [
        { id: "de_29", selected_choices: ["4"] },
      ],
      preference_has_bio_filter: true,
      preference_number_of_photos_filter: 3,
    },
  } as unknown as UpdatedProfileUser;

  assertEquals(fromProfileUser(user), {
    ageFilterMin: 21,
    ageFilterMax: 35,
    distanceFilter: 25,
    genderFilter: 1,
    userInterests: ["it_6056"],
    descriptors: [{ id: "de_29", selectedChoices: ["4"] }],
    hasBio: true,
    numberOfPhotos: 3,
  });
});

Deno.test("fromProfileUser - omits fields absent on the user", () => {
  const user = {
    _id: "u1",
    age_filter_max: 40,
  } as unknown as UpdatedProfileUser;
  assertEquals(fromProfileUser(user), { ageFilterMax: 40 });
});

Deno.test("toRestoreParams - re-sends the captured snapshot", () => {
  const user = {
    _id: "u1",
    age_filter_min: 18,
    age_filter_max: 30,
    distance_filter: 25,
  } as unknown as UpdatedProfileUser;
  assertEquals(toRestoreParams(user, { ageFilterMax: 55 }), {
    ageFilterMin: 18,
    ageFilterMax: 30,
    distanceFilter: 25,
  });
});

Deno.test("toRestoreParams - clears filters the caller added that had no initial value", () => {
  const user = {
    _id: "u1",
    age_filter_max: 30,
  } as unknown as UpdatedProfileUser;
  const applied: TinderUpdateProfilePreferencesParams = {
    userInterests: ["it_6056"],
    hasBio: true,
    numberOfPhotos: 2,
  };
  assertEquals(toRestoreParams(user, applied), {
    ageFilterMax: 30,
    userInterests: [],
    hasBio: false,
    numberOfPhotos: 0,
  });
});
