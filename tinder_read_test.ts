import { TinderAPI } from "@/tinder.ts";
import "@std/dotenv/load";
import { assert, assertEquals, assertExists } from "@std/assert";

function createClient() {
  const authToken = Deno.env.get("AUTH_TOKEN");
  if (!authToken) {
    throw new Error(
      "Missing AUTH_TOKEN environment variable. " +
      "Set it in your .env file and run tests with `--env-file=.env --allow-env --allow-net`.",
    );
  }

  const deviceId = Deno.env.get("DEVICE_ID");
  if (!deviceId) {
    throw new Error("DEVICE_ID is not set");
  }

  return new TinderAPI({
    xAuthToken: authToken, baseOptions: {
      defaultLocale: 'es-ES',
      headers: {
        'persistent-device-id': deviceId,
      }
    }
  });
}

const api = createClient();

Deno.test("profile returns authenticated user data", async () => {
  const result = await api.profile();

  assertEquals(result.response.ok, true);
  assertEquals(result.response.status, 206);
  assertExists(result.data);
  // Tinder typically returns the user data under `data.user`, but we only check that the payload is an object.
  assert(typeof result.data === "object");
});

Deno.test("search returns results", async () => {
  const result = await api.search();

  assertEquals(result.response.ok, true);
  assertEquals(result.response.status, 200);
  assertExists(result.data);
  assert(typeof result.data === "object");
});

Deno.test("getMatches returns a list (may be empty)", async () => {
  const result = await api.getMatches({ message: 1 });

  assertEquals(result.response.ok, true);
  assertEquals(result.response.status, 200);
  assertExists(result.data);

  const payload: unknown = result.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data?: { matches?: unknown } }).data;
    if (inner && "matches" in inner) {
      const matches = inner.matches as unknown;
      assert(Array.isArray(matches));
    }
  }
});

Deno.test("getChatMessages returns messages for first match when available", async () => {
  const matchesResult = await api.getMatches({ message: 1 });
  const payload: unknown = matchesResult.data;

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    // If the structure is not as expected, do not attempt messages request.
    return;
  }

  const inner = (payload as { data?: { matches?: unknown[] } }).data;
  const matches = inner?.matches;

  if (!Array.isArray(matches) || matches.length === 0) {
    // No matches available for this account; nothing to test here.
    return;
  }

  const firstMatch = matches[0] as { id?: string };
  if (!firstMatch?.id) {
    return;
  }

  const messagesResult = await api.getChatMessages({ matchId: firstMatch.id });

  assertEquals(messagesResult.response.ok, true);
  assertEquals(messagesResult.response.status, 200);
  assertExists(messagesResult.data);
});

