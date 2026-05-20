import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

const storage = await import("../app/_lib/storage.js");

afterEach(() => {
  delete globalThis.window;
});

function installStorage(initialEntries = []) {
  const values = new Map(initialEntries);

  globalThis.window = {
    localStorage: {
      getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      removeItem(key) {
        values.delete(key);
      },
      setItem(key, value) {
        values.set(key, value);
      },
    },
  };

  return values;
}

test("storage helpers tolerate server and unavailable browser storage", () => {
  assert.equal(storage.getStorageItem("missing", "fallback"), "fallback");
  assert.equal(storage.setStorageItem("key", "value"), false);
  assert.equal(storage.removeStorageItem("key"), false);
  assert.deepEqual(storage.getJsonStorageItem("missing", { ok: true }), { ok: true });

  globalThis.window = {
    localStorage: {
      getItem() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    },
  };

  assert.equal(storage.getStorageItem("key", "fallback"), "fallback");
  assert.equal(storage.setStorageItem("key", "value"), false);
  assert.equal(storage.removeStorageItem("key"), false);
});

test("storage helpers read, write, remove, and parse JSON values", () => {
  const values = installStorage([
    ["plain", "value"],
    ["json", JSON.stringify({ theme: "dark" })],
    ["bad", "{nope"],
  ]);

  assert.equal(storage.getStorageItem("plain"), "value");
  assert.deepEqual(storage.getJsonStorageItem("json"), { theme: "dark" });
  assert.deepEqual(storage.getJsonStorageItem("bad", { fallback: true }), {
    fallback: true,
  });

  assert.equal(storage.setStorageItem("plain", "next"), true);
  assert.equal(values.get("plain"), "next");
  assert.equal(storage.setJsonStorageItem("json", { theme: "light" }), true);
  assert.deepEqual(JSON.parse(values.get("json")), { theme: "light" });
  assert.equal(storage.removeStorageItem("plain"), true);
  assert.equal(values.has("plain"), false);
});
