import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MOCK_LINK_TOKEN,
  mockAddEvidence,
  MockConflictError,
  mockGetTicket,
  mockLinkTicketId,
  mockListRules,
  mockListTickets,
  mockRunAction,
  mockSetRule,
  MockUnprocessableError,
} from "../../features/tickets/services/build-tickets.ts";

const FILTERS = { status: null, edgeServerId: null, assigneeId: null, page: 1 };

test("the list is newest alarm first and hides alerts and events", () => {
  const { items, total } = mockListTickets(FILTERS, 20);
  assert.equal(total, 5);
  const times = items.map((item) => item.lastAlertAt);
  assert.deepEqual(times, times.toSorted().toReversed());
  assert.ok(items.every((item) => !("events" in item) && !("alerts" in item)));
});

test("the list filters by status, server and assignee", () => {
  const open = mockListTickets({ ...FILTERS, status: "open" }, 20);
  assert.ok(open.items.every((item) => item.status === "open"));
  const server = mockListTickets({ ...FILTERS, edgeServerId: "2" }, 20);
  assert.deepEqual(
    server.items.map((item) => item.id),
    ["2"],
  );
  const mine = mockListTickets({ ...FILTERS, assigneeId: "1" }, 20);
  assert.ok(mine.items.every((item) => item.assigneeId === "1"));
  assert.equal(mockListTickets({ ...FILTERS, assigneeId: "99" }, 20).total, 0);
});

test("the list pages and still reports the full total", () => {
  const second = mockListTickets({ ...FILTERS, page: 2 }, 2);
  assert.equal(second.total, 5);
  assert.equal(second.items.length, 2);
  assert.equal(mockListTickets({ ...FILTERS, page: 4 }, 2).items.length, 0);
});

test("acknowledging clears the deadline and logs the event", () => {
  const ticket = mockRunAction("1", "acknowledge", {});
  assert.equal(ticket.status, "acknowledged");
  assert.equal(ticket.ackDeadlineAt, null);
  assert.notEqual(ticket.acknowledgedAt, null);
  assert.equal(mockGetTicket("1").events[0].type, "acknowledged");
});

test("an action outside its source status is a conflict", () => {
  assert.throws(() => mockRunAction("1", "acknowledge", {}), MockConflictError);
  assert.throws(() => mockRunAction("1", "approve", {}), MockConflictError);
  assert.equal(mockGetTicket("1").status, "acknowledged");
});

test("an unknown ticket returns null", () => {
  assert.equal(mockRunAction("999", "start", {}), null);
});

test("asking to close needs a photo first", () => {
  assert.throws(
    () =>
      mockRunAction("1", "request-resolution", { type: "resolved", note: "x" }),
    (error) =>
      error instanceof MockUnprocessableError &&
      error.code === "EVIDENCE_REQUIRED",
  );
  assert.equal(mockGetTicket("1").status, "acknowledged");
});

test("photos only attach while the ticket is being worked", () => {
  assert.throws(() => mockAddEvidence("4"), MockConflictError);
  assert.throws(() => mockAddEvidence("5"), MockConflictError);
  assert.equal(mockAddEvidence("999"), null);
});

test("a ticket takes at most 10 photos", () => {
  for (let count = 0; count < 10; count++) mockAddEvidence("2");
  assert.equal(mockGetTicket("2").evidence.length, 10);
  assert.throws(
    () => mockAddEvidence("2"),
    (error) =>
      error instanceof MockUnprocessableError &&
      error.code === "EVIDENCE_LIMIT_REACHED",
  );
});

test("a ticket goes from start to approval and closes as asked", () => {
  assert.equal(mockAddEvidence("1").uploadedById, "1");
  const requested = mockRunAction("1", "request-resolution", {
    type: "false_alarm",
    note: "Cleaning crew",
  });
  assert.equal(requested.status, "resolve_requested");
  assert.equal(requested.resolutionType, "false_alarm");
  assert.equal(requested.resolutionNote, "Cleaning crew");
  const closed = mockRunAction("1", "approve", {});
  assert.equal(closed.status, "false_alarm");
  assert.notEqual(closed.closedAt, null);
  assert.throws(() => mockRunAction("1", "start", {}), MockConflictError);
});

test("only the demo token opens a ticket, and not once it is closed", () => {
  assert.equal(mockLinkTicketId("nope"), null);
  assert.equal(mockLinkTicketId(MOCK_LINK_TOKEN), null);
});

test("rejecting sends the ticket back to in_progress", () => {
  const ticket = mockRunAction("3", "reject", { note: "Show a photo" });
  assert.equal(ticket.status, "in_progress");
  assert.equal(ticket.resolveRequestedAt, null);
  assert.equal(mockGetTicket("3").events[0].type, "rejected");
});

test("rules list undecided kinds first and per server", () => {
  const { items, total } = mockListRules("1");
  assert.equal(total, 3);
  assert.equal(items[0].isReviewed, false);
  assert.ok(items.every((rule) => rule.edgeServerId === "1"));
});

test("deciding a rule marks it reviewed and rejects another server", () => {
  const rule = mockSetRule("1", "3", true);
  assert.equal(rule.isEnabled, true);
  assert.equal(rule.isReviewed, true);
  assert.equal(mockSetRule("2", "3", true), null);
});
