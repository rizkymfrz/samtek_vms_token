import assert from "node:assert/strict";
import { test } from "node:test";
import {
  emptyDraft,
  userDraftSchema,
} from "../../features/users/lib/edit-user.ts";

const valid = {
  ...emptyDraft(),
  username: "security",
  email: "security@samtek.id",
  password: "longenough",
};

const messages = (draft, editingId = null) => {
  const result = userDraftSchema([], editingId).safeParse(draft);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

test("a new user must pick a server and a role on it", () => {
  assert.deepEqual(messages(valid), [
    "Edge server is required.",
    "Edge server role is required.",
  ]);
});

test("a new user with a server and role is accepted", () => {
  assert.deepEqual(
    messages({ ...valid, serverId: "1", serverRoleId: "2" }),
    [],
  );
});

test("editing a user does not ask for a server", () => {
  assert.deepEqual(messages({ ...valid, password: "" }, "7"), []);
});
