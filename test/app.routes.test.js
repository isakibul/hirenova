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

function routeExists(path, method, router = app.router) {
  return getRouteLayers(router).some(
    (layer) => layer.route.path === path && layer.route.methods[method],
  );
}

function routeHandlerCount(path, method, router = app.router) {
  const layer = getRouteLayers(router).find(
    (routeLayer) =>
      routeLayer.route.path === path && routeLayer.route.methods[method],
  );

  return layer?.route.stack.length ?? 0;
}

function loadFreshV1Router(nodeEnv) {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = nodeEnv;
  delete require.cache[require.resolve("../src/routes/v1")];

  try {
    return require("../src/routes/v1");
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
    delete require.cache[require.resolve("../src/routes/v1")];
  }
}

test("app exposes the health check route", () => {
  assert.equal(routeExists("/health", "get"), true);
});

test("core v1 routes are wired", () => {
  assert.equal(routeExists("/signup", "post"), true);
  assert.equal(routeExists("/session", "get"), true);
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

test("e2e seed route is available only in test environment", () => {
  const testRouter = loadFreshV1Router("test");
  const productionRouter = loadFreshV1Router("production");

  assert.equal(routeExists("/seed", "post", testRouter), true);
  assert.equal(routeExists("/seed", "post", productionRouter), false);
});
