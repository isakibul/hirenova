const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");

const removeUser = require("../src/api/v1/admin/controllers/removeUser");
const updateUser = require("../src/api/v1/admin/controllers/updateUser");
const userService = require("../src/lib/user");

const originalFindUserById = userService.findUserById;
const originalRemoveUser = userService.removeUser;
const originalUpdateUserByAdmin = userService.updateUserByAdmin;

afterEach(() => {
  userService.findUserById = originalFindUserById;
  userService.removeUser = originalRemoveUser;
  userService.updateUserByAdmin = originalUpdateUserByAdmin;
});

const createResponse = () => ({
  statusCode: undefined,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  end() {
    return this;
  },
});

test("admin removeUser rejects deleting your own account", async () => {
  userService.findUserById = async () => ({
    id: "admin-1",
    role: "superadmin",
  });
  userService.removeUser = async () => {
    throw new Error("removeUser should not be called");
  };

  let error;
  await removeUser(
    { params: { id: "admin-1" }, user: { id: "admin-1", role: "superadmin" } },
    createResponse(),
    (nextError) => {
      error = nextError;
    },
  );

  assert.equal(error.status, 403);
  assert.equal(error.message, "You cannot delete your own account.");
});

test("admin updateUser rejects changing your own role", async () => {
  userService.findUserById = async () => ({
    id: "admin-1",
    role: "superadmin",
  });
  userService.updateUserByAdmin = async () => {
    throw new Error("updateUserByAdmin should not be called");
  };

  const res = createResponse();
  await updateUser(
    {
      params: { id: "admin-1" },
      body: { role: "employer" },
      user: { id: "admin-1", role: "superadmin" },
    },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "You cannot change your own role.");
});
