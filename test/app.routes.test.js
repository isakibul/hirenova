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

function routeHandlerCount(path, method) {
  const layer = getRouteLayers().find(
    (routeLayer) =>
      routeLayer.route.path === path && routeLayer.route.methods[method],
  );

  return layer?.route.stack.length ?? 0;
}

test("app exposes the health check route", () => {
  assert.equal(routeExists("/health", "get"), true);
});

test("core v1 routes are wired", () => {
  assert.equal(routeExists("/signup", "post"), true);
  assert.equal(routeExists("/", "get"), true);
  assert.equal(routeExists("/smart-match/recommendations", "get"), true);
  assert.equal(routeExists("/recommended", "get"), true);
  assert.equal(routeExists("/:id/apply", "post"), true);
  assert.equal(routeExists("/users", "get"), true);
  assert.equal(routeExists("/conversations", "get"), true);
});

test("smart match is restricted by authentication, not by role authorization", () => {
  assert.equal(routeHandlerCount("/smart-match/recommendations", "get"), 4);
  assert.equal(routeHandlerCount("/recommended", "get"), 4);
});
