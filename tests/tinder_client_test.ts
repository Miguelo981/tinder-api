import {
  assert,
  assertEquals,
  assertExists,
  assertObjectMatch,
  assertRejects,
} from "@std/assert";
import { jsonResponse, makeClient, mockFetch } from "./test_helpers.ts";
import { Descriptor, LookingFor, UserInterest } from "@/enums.ts";

Deno.test("search - GET /v2/recs/core with locale and duos", async () => {
  const mock = mockFetch(() => jsonResponse({ data: { results: [] } }));
  try {
    const res = await makeClient().search();
    assertEquals(mock.calls.length, 1);
    const call = mock.calls[0];
    const url = new URL(call.url);
    assertEquals(call.method, "GET");
    assertEquals(url.pathname, "/v2/recs/core");
    assertEquals(url.searchParams.get("locale"), "es-ES");
    assertEquals(url.searchParams.get("duos"), "0");
    assertEquals(call.body, undefined);
    assertEquals(res.data as unknown, { data: { results: [] } });
  } finally {
    mock.restore();
  }
});

Deno.test("like - POST /like/{userId} with like body", async () => {
  const mock = mockFetch(() => jsonResponse({ match: true }));
  try {
    const res = await makeClient().like({
      userId: "user-1",
      s_number: 123,
      liked_content_id: "photo-1",
      liked_content_type: "photo",
    });
    const call = mock.calls[0];
    const url = new URL(call.url);
    assertEquals(call.method, "POST");
    assertEquals(url.pathname, "/like/user-1");
    assertEquals(url.searchParams.get("locale"), "es-ES");
    assertEquals(call.body, {
      s_number: 123,
      liked_content_id: "photo-1",
      liked_content_type: "photo",
    });
    assertEquals(res.data as unknown, { match: true });
  } finally {
    mock.restore();
  }
});

Deno.test("superLike - POST /like/{userId}/super with like body", async () => {
  const mock = mockFetch(() => jsonResponse({ match: false }));
  try {
    await makeClient().superLike({
      userId: "user-2",
      s_number: 456,
      liked_content_id: "photo-2",
      liked_content_type: "photo",
    });
    const call = mock.calls[0];
    const url = new URL(call.url);
    assertEquals(call.method, "POST");
    assertEquals(url.pathname, "/like/user-2/super");
    assertEquals(call.body, {
      s_number: 456,
      liked_content_id: "photo-2",
      liked_content_type: "photo",
    });
  } finally {
    mock.restore();
  }
});

Deno.test("dislike - GET /pass/{userId} with s_number query", async () => {
  const mock = mockFetch(() => jsonResponse({ status: 200 }));
  try {
    await makeClient().dislike({ userId: "user-3", s_number: 789 });
    const call = mock.calls[0];
    const url = new URL(call.url);
    assertEquals(call.method, "GET");
    assertEquals(url.pathname, "/pass/user-3");
    assertEquals(url.searchParams.get("locale"), "es-ES");
    assertEquals(url.searchParams.get("s_number"), "789");
    assertEquals(call.body, undefined);
  } finally {
    mock.restore();
  }
});

Deno.test("sendChatMessage - POST /user/matches/{matchId} with message", async () => {
  const mock = mockFetch(() => jsonResponse({ _id: "m-1", message: "hi" }));
  try {
    await makeClient().sendChatMessage({ matchId: "match-1", message: "hi" });
    const call = mock.calls[0];
    const url = new URL(call.url);
    assertEquals(call.method, "POST");
    assertEquals(url.pathname, "/user/matches/match-1");
    assertEquals(call.body, { message: "hi" });
  } finally {
    mock.restore();
  }
});

Deno.test("setLocation - POST /v2/meta with lat/lon", async () => {
  const mock = mockFetch(() => jsonResponse({ meta: { status: 200 } }));
  try {
    await makeClient().setLocation({ lat: 40.4, lon: -3.7 });
    const call = mock.calls[0];
    const url = new URL(call.url);
    assertEquals(call.method, "POST");
    assertEquals(url.pathname, "/v2/meta");
    assertEquals(call.body, { lat: 40.4, lon: -3.7 });
  } finally {
    mock.restore();
  }
});

Deno.test("updateProfile - POST /v2/profile with { user } body", async () => {
  const mock = mockFetch(() =>
    jsonResponse({ data: { user: { age_filter_max: 40 } } })
  );
  try {
    await makeClient().updateProfile({
      ageFilterMax: 40,
      distanceFilterKm: 30,
    });
    const call = mock.calls[0];
    const url = new URL(call.url);
    assertEquals(call.method, "POST");
    assertEquals(url.pathname, "/v2/profile");
    // distanceFilterKm (30) -> miles (19); ageFilterMax passthrough.
    assertEquals(call.body, {
      user: { age_filter_max: 40, distance_filter: 19 },
    });
  } finally {
    mock.restore();
  }
});

Deno.test("updateUserProfile - POST /v2/profile/user with { preference_filters }", async () => {
  const mock = mockFetch(() =>
    jsonResponse({ data: { preference_filters: {} } })
  );
  try {
    await makeClient().updateUserProfile({
      userInterests: [UserInterest.ElectronicMusic],
      descriptors: [
        {
          id: Descriptor.LookingFor,
          selectedChoices: [LookingFor.ShortTermFun],
        },
      ],
      hasBio: true,
      numberOfPhotos: 2,
    });
    const call = mock.calls[0];
    const url = new URL(call.url);
    assertEquals(call.method, "POST");
    assertEquals(url.pathname, "/v2/profile/user");
    assertEquals(call.body, {
      preference_filters: {
        preference_user_interests_filter: ["it_6056"],
        preference_descriptors_filter: [
          { id: "de_29", selected_choices: ["4"] },
        ],
        preference_has_bio_filter: true,
        preference_number_of_photos_filter: 2,
      },
    });
  } finally {
    mock.restore();
  }
});

Deno.test("updateProfilePreferences - profile-only input hits /v2/profile once", async () => {
  const mock = mockFetch(() => jsonResponse({ data: { user: {} } }));
  try {
    const res = await makeClient().updateProfilePreferences({
      ageFilterMax: 50,
    });
    assertEquals(mock.calls.length, 1);
    assertEquals(new URL(mock.calls[0].url).pathname, "/v2/profile");
    assertExists(res.profile);
    assertEquals(res.user, undefined);
  } finally {
    mock.restore();
  }
});

Deno.test("updateProfilePreferences - preference-only input hits /v2/profile/user once", async () => {
  const mock = mockFetch(() => jsonResponse({ data: {} }));
  try {
    const res = await makeClient().updateProfilePreferences({ hasBio: true });
    assertEquals(mock.calls.length, 1);
    assertEquals(new URL(mock.calls[0].url).pathname, "/v2/profile/user");
    assertExists(res.user);
    assertEquals(res.profile, undefined);
  } finally {
    mock.restore();
  }
});

Deno.test("updateProfilePreferences - both kinds of input hit both endpoints", async () => {
  const mock = mockFetch(() => jsonResponse({ data: {} }));
  try {
    const res = await makeClient().updateProfilePreferences({
      distanceFilterKm: 30,
      hasBio: true,
    });
    assertEquals(mock.calls.length, 2);
    const paths = mock.calls.map((c) => new URL(c.url).pathname);
    assert(paths.includes("/v2/profile"));
    assert(paths.includes("/v2/profile/user"));
    assertExists(res.profile);
    assertExists(res.user);
  } finally {
    mock.restore();
  }
});

Deno.test("updateProfilePreferences - empty input performs no requests", async () => {
  const mock = mockFetch(() => jsonResponse({ data: {} }));
  try {
    const res = await makeClient().updateProfilePreferences({});
    assertEquals(mock.calls.length, 0);
    assertEquals(res, {});
  } finally {
    mock.restore();
  }
});

Deno.test("requests send auth + device + content-type headers", async () => {
  const mock = mockFetch(() => jsonResponse({ data: {} }));
  try {
    await makeClient().setLocation({ lat: 1, lon: 2 });
    const { headers } = mock.calls[0];
    assertEquals(headers.get("X-AUTH-TOKEN"), "test-token");
    assertEquals(headers.get("persistent-device-id"), "test-device");
    assertEquals(headers.get("Content-Type"), "application/json");
  } finally {
    mock.restore();
  }
});

Deno.test("default locale falls back to the client defaultLocale", async () => {
  const mock = mockFetch(() => jsonResponse({ data: {} }));
  try {
    await makeClient().updateProfile({ ageFilterMax: 30 });
    assertEquals(
      new URL(mock.calls[0].url).searchParams.get("locale"),
      "es-ES",
    );
  } finally {
    mock.restore();
  }
});

Deno.test("explicit locale overrides the default", async () => {
  const mock = mockFetch(() => jsonResponse({ data: {} }));
  try {
    await makeClient().setLocation({ lat: 1, lon: 2, locale: "en-US" });
    assertEquals(
      new URL(mock.calls[0].url).searchParams.get("locale"),
      "en-US",
    );
  } finally {
    mock.restore();
  }
});

Deno.test("non-ok responses reject with the HTTP status", async () => {
  const mock = mockFetch(() => jsonResponse({ error: "unauthorized" }, 401));
  try {
    await assertRejects(
      () => makeClient().search(),
      Error,
      "HTTP error! status: 401",
    );
  } finally {
    mock.restore();
  }
});

Deno.test("response shape exposes parsed data and the raw Response", async () => {
  const mock = mockFetch(() => jsonResponse({ likes_remaining: 99 }));
  try {
    const res = await makeClient().like({
      userId: "u",
      s_number: 1,
      liked_content_id: "p",
      liked_content_type: "photo",
    });
    assertObjectMatch(res.data as unknown as Record<string, unknown>, {
      likes_remaining: 99,
    });
    assertEquals(res.response.ok, true);
    assertEquals(res.response.status, 200);
  } finally {
    mock.restore();
  }
});
