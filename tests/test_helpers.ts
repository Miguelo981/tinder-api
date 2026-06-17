import { TinderAPI } from "@/tinder.ts";

/** Build a JSON `Response` with the `application/json` content-type. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** A request captured by {@link mockFetch}. */
export interface CapturedCall {
  url: string;
  method: string;
  headers: Headers;
  /** Parsed JSON body (or the raw string if not JSON, `undefined` if none). */
  body: unknown;
}

export type FetchResponder =
  | Response
  | ((url: string, init?: RequestInit) => Response);

/**
 * Swap `globalThis.fetch` for a spy that records every call and returns a
 * controlled response. Call `restore()` (in a `finally`) to put `fetch` back.
 */
export function mockFetch(responder: FetchResponder): {
  calls: CapturedCall[];
  restore: () => void;
} {
  const calls: CapturedCall[] = [];
  const original = globalThis.fetch;

  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    let body: unknown;
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }
    calls.push({
      url,
      method: init?.method ?? "GET",
      headers: new Headers(init?.headers),
      body,
    });
    const res = typeof responder === "function"
      ? responder(url, init)
      : responder;
    // Return the Response as-is: returning a clone from an overridden `fetch`
    // drops its headers in Deno. Pass a factory for multi-call tests.
    return Promise.resolve(res);
  }) as typeof fetch;

  return {
    calls,
    restore() {
      globalThis.fetch = original;
    },
  };
}

/** A `TinderAPI` client with fixed, predictable credentials for assertions. */
export function makeClient(): TinderAPI {
  return new TinderAPI({
    xAuthToken: "test-token",
    baseOptions: {
      defaultLocale: "es-ES",
      headers: { "persistent-device-id": "test-device" },
    },
  });
}
