const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");

const removeUser = require("../src/modules/admin/controllers/removeUser");
const updateUser = require("../src/modules/admin/controllers/updateUser");
const reviewRoleChangeRequest = require("../src/modules/admin/controllers/reviewRoleChangeRequest");
const userService = require("../src/modules/users/users.service");

const originalFindUserById = userService.findUserById;
const originalRemoveUser = userService.removeUser;
const originalUpdateUserByAdmin = userService.updateUserByAdmin;
const originalReviewRoleChangeRequest = userService.reviewRoleChangeRequest;

afterEach(() => {
  userService.findUserById = originalFindUserById;
  userService.removeUser = originalRemoveUser;
  userService.updateUserByAdmin = originalUpdateUserByAdmin;
  userService.reviewRoleChangeRequest = originalReviewRoleChangeRequest;
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

test("admin reviewRoleChangeRequest passes reviewer and decision to service", async () => {
  let captured;
  userService.reviewRoleChangeRequest = async (payload) => {
    captured = payload;
    return {
      id: "user-1",
      username: "jobseeker1",
      role: "employer",
      roleChangeRequest: { status: "approved" },
    };
  };

  const res = createResponse();
  await reviewRoleChangeRequest(
    {
      params: { id: "user-1" },
      body: { decision: "approved" },
      user: { id: "admin-1", role: "admin" },
      protocol: "http",
      get: () => "localhost:4000",
      originalUrl: "/api/v1/admin/role-requests/user-1",
    },
    res,
    (error) => {
      throw error;
    },
  );

  assert.deepEqual(captured, {
    id: "user-1",
    reviewerId: "admin-1",
    decision: "approved",
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Employer access approved.");
});
