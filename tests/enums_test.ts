import { assert, assertEquals } from "@std/assert";
import {
  Descriptor,
  GLOBAL_MODE_LANGUAGES,
  LookingFor,
  UserInterest,
} from "@/enums.ts";
import { DESCRIPTORS, GENDERS, INTERESTS } from "@/dictionaries.ts";

Deno.test("enum members resolve to their raw Tinder ids", () => {
  assertEquals(UserInterest.ElectronicMusic, "it_6056");
  assertEquals(UserInterest.Coffee, "it_1");
  assertEquals(Descriptor.LookingFor, "de_29");
  assertEquals(Descriptor.Zodiac, "de_1");
  assertEquals(LookingFor.ShortTermFun, "4");
});

Deno.test("INTERESTS has no duplicate ids", () => {
  const ids = INTERESTS.map((i) => i.id);
  assertEquals(new Set(ids).size, ids.length);
});

Deno.test("every DESCRIPTORS key is a de_* id with at least one choice", () => {
  const keys = Object.keys(DESCRIPTORS);
  assert(keys.length > 0);
  for (const key of keys) {
    assert(/^de_\d+$/.test(key), `unexpected descriptor key: ${key}`);
    assert(
      DESCRIPTORS[key as keyof typeof DESCRIPTORS].choices.length > 0,
      `descriptor ${key} has no choices`,
    );
  }
});

Deno.test("descriptor choice ids are unique within each descriptor", () => {
  for (const [key, descriptor] of Object.entries(DESCRIPTORS)) {
    const ids = descriptor.choices.map((c) => c.id);
    assertEquals(new Set(ids).size, ids.length, `duplicate choice in ${key}`);
  }
});

Deno.test("GENDERS expose the three top-level gen_* options", () => {
  assertEquals(GENDERS.map((g) => g.id), ["gen_1", "gen_2", "gen_3"]);
});

Deno.test("GLOBAL_MODE_LANGUAGES contains common codes and no duplicates", () => {
  assert(GLOBAL_MODE_LANGUAGES.includes("es"));
  assert(GLOBAL_MODE_LANGUAGES.includes("en"));
  assertEquals(
    new Set(GLOBAL_MODE_LANGUAGES).size,
    GLOBAL_MODE_LANGUAGES.length,
  );
});
