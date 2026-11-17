import assert from "node:assert/strict";
import { test } from "node:test";
import {
  availableActions,
  canAddEvidence,
  eventLabel,
  isFinal,
} from "../../features/tickets/lib/ticket-status.ts";

const ticket = (status, assigneeId = "7") => ({ status, assigneeId });

test("an open ticket can only be acknowledged by its assignee", () => {
  assert.deepEqual(availableActions(ticket("open"), "7"), ["acknowledge"]);
  assert.deepEqual(availableActions(ticket("open"), "8"), []);
  assert.deepEqual(availableActions(ticket("open"), null), []);
});

test("an unassigned ticket offers no officer action", () => {
  assert.deepEqual(availableActions(ticket("open", null), "7"), []);
});

test("an acknowledged ticket can be started or sent for resolution", () => {
  assert.deepEqual(availableActions(ticket("acknowledged"), "7"), [
    "start",
    "request-resolution",
  ]);
});

test("an in-progress ticket can only be sent for resolution", () => {
  assert.deepEqual(availableActions(ticket("in_progress"), "7"), [
    "request-resolution",
  ]);
  assert.deepEqual(availableActions(ticket("in_progress"), "8"), []);
});

test("a requested resolution is approved or rejected by anyone", () => {
  for (const userId of ["7", "8", null]) {
    assert.deepEqual(availableActions(ticket("resolve_requested"), userId), [
      "approve",
      "reject",
    ]);
  }
});

test("a closed ticket offers nothing", () => {
  assert.deepEqual(availableActions(ticket("resolved"), "7"), []);
  assert.deepEqual(availableActions(ticket("false_alarm"), "7"), []);
});

test("only resolved and false_alarm are final", () => {
  assert.equal(isFinal("resolved"), true);
  assert.equal(isFinal("false_alarm"), true);
  assert.equal(isFinal("resolve_requested"), false);
  assert.equal(isFinal("open"), false);
});

test("timeline labels fall back to a readable form", () => {
  assert.equal(eventLabel("escalated"), "Escalated to a supervisor");
  assert.equal(eventLabel("something_new"), "Something new");
});

test("photos can be added only while the ticket is being worked", () => {
  assert.equal(canAddEvidence("acknowledged"), true);
  assert.equal(canAddEvidence("in_progress"), true);
  for (const status of [
    "open",
    "resolve_requested",
    "resolved",
    "false_alarm",
  ]) {
    assert.equal(canAddEvidence(status), false);
  }
});
