const assert = require("node:assert/strict");
const { test } = require("node:test");

const app = require("../src/app");

function getRouteLayers(router = app.router) {
  return router.stack.flatMap((layer) => {
    if (layer.route) {
      return [layer];
    }

    if (layer.handle?.stack) {
      return getRouteLayers(layer.handle);
    }

    return [];
  });
}

function routeExists(path, method) {
  return getRouteLayers().some(
    (layer) => layer.route.path === path && layer.route.methods[method],
  );
}

test("app exposes the health check route", () => {
  assert.equal(routeExists("/health", "get"), true);
});

test("core v1 routes are wired", () => {
  assert.equal(routeExists("/signup", "post"), true);
  assert.equal(routeExists("/", "get"), true);
  assert.equal(routeExists("/:id/apply", "post"), true);
  assert.equal(routeExists("/users", "get"), true);
  assert.equal(routeExists("/conversations", "get"), true);
});
