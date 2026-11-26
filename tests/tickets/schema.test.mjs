import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LINK_ACTIONS,
  linkDeliveryResponseSchema,
  ticketActionInputSchemas,
  ticketDetailSchema,
  ticketListQuerySchema,
  ticketUpdatedMessageSchema,
  updateTicketRuleInputSchema,
} from "../../features/tickets/schemas/ticket.ts";

const MINUTE_MS = 60_000;

const at = (minutesAgo) =>
  new Date(Date.now() - minutesAgo * MINUTE_MS).toISOString();

const ticket = (patch = {}) => ({
  id: "1",
  edgeServerId: "1",
  deviceId: "1",
  deviceName: "Lobby",
  analyticId: "line_crossing",
  kind: "line_cross",
  perimeterName: "Entrance line",
  title: "Line crossing",
  description: "A person crossed the entrance line",
  riskLevel: "medium",
  status: "open",
  assigneeId: "1",
  assigneeUsername: "Rizky Maulana",
  assignedAt: at(2),
  ackDeadlineAt: at(-3),
  acknowledgedAt: null,
  escalatedAt: null,
  reassignCount: 0,
  alertCount: 1,
  firstAlertAt: at(2),
  lastAlertAt: at(2),
  hasImage: false,
  resolutionType: null,
  resolutionNote: null,
  resolveRequestedAt: null,
  closedAt: null,
  createdAt: at(2),
  updatedAt: null,
  alerts: [],
  evidence: [],
  events: [
    { id: "11", type: "created", actorUserId: null, createdAt: at(2) },
    { id: "12", type: "assigned", actorUserId: null, createdAt: at(2) },
  ],
  ...patch,
});

test("central sends BIGINT ids as strings and the schema keeps them", () => {
  const parsed = ticketDetailSchema.parse(ticket({ id: 5, assigneeId: 7 }));
  assert.equal(parsed.id, "5");
  assert.equal(parsed.assigneeId, "7");
});

test("requesting a resolution needs a type and a note", () => {
  const schema = ticketActionInputSchemas["request-resolution"];
  assert.equal(
    schema.safeParse({ type: "resolved", note: "Done" }).success,
    true,
  );
  assert.equal(schema.safeParse({ type: "resolved" }).success, false);
  assert.equal(
    schema.safeParse({ type: "resolved", note: "  " }).success,
    false,
  );
  assert.equal(schema.safeParse({ type: "other", note: "x" }).success, false);
});

test("a note is trimmed and capped at 2000 characters", () => {
  const schema = ticketActionInputSchemas.reject;
  assert.equal(schema.parse({ note: "  no  " }).note, "no");
  assert.equal(schema.safeParse({ note: "x".repeat(2001) }).success, false);
  assert.equal(schema.safeParse({}).success, false);
});

test("approving takes an optional note and nothing else", () => {
  const schema = ticketActionInputSchemas.approve;
  assert.equal(schema.safeParse({}).success, true);
  assert.equal(schema.safeParse({ note: "ok" }).success, true);
  assert.equal(schema.safeParse({ note: "ok", extra: 1 }).success, false);
});

test("acknowledge and start reject unexpected fields", () => {
  assert.equal(
    ticketActionInputSchemas.acknowledge.safeParse({}).success,
    true,
  );
  assert.equal(
    ticketActionInputSchemas.start.safeParse({ note: "x" }).success,
    false,
  );
});

test("the list query defaults and rejects bad values", () => {
  assert.deepEqual(ticketListQuerySchema.parse({}), { page: 1, pageSize: 20 });
  assert.equal(ticketListQuerySchema.parse({ page: "3" }).page, 3);
  assert.equal(
    ticketListQuerySchema.safeParse({ status: "nope" }).success,
    false,
  );
  assert.equal(
    ticketListQuerySchema.safeParse({ edgeServerId: "1;x" }).success,
    false,
  );
  assert.equal(
    ticketListQuerySchema.safeParse({ pageSize: "101" }).success,
    false,
  );
});

test("a rule update needs a boolean", () => {
  assert.equal(
    updateTicketRuleInputSchema.safeParse({ isEnabled: true }).success,
    true,
  );
  assert.equal(
    updateTicketRuleInputSchema.safeParse({ isEnabled: "yes" }).success,
    false,
  );
  assert.equal(updateTicketRuleInputSchema.safeParse({}).success, false);
});

test("ticket.updated is read from the payload and ignores the rest", () => {
  const message = {
    v: 1,
    type: "ticket.updated",
    id: "01J",
    ts: "2026-11-17T08:00:00.000Z",
    data: {
      change: "created",
      ticket_id: "5",
      edge_server_id: "3",
      status: "open",
      risk_level: "high",
      assignee_id: "7",
      escalated: false,
    },
  };
  const parsed = ticketUpdatedMessageSchema.parse(message);
  assert.equal(parsed.data.ticket_id, "5");
  assert.equal(parsed.data.edge_server_id, "3");
  assert.equal(
    ticketUpdatedMessageSchema.safeParse({ ...message, type: "edge.state" })
      .success,
    false,
  );
});

test("the detail carries the evidence photos", () => {
  const withPhoto = ticket({
    evidence: [
      {
        id: "31",
        uploadedById: "1",
        uploadedByUsername: "Rizky Maulana",
        createdAt: at(30),
      },
    ],
  });
  const parsed = ticketDetailSchema.parse(withPhoto);
  assert.equal(parsed.evidence.length, 1);
  assert.equal(parsed.evidence[0].uploadedByUsername, "Rizky Maulana");
  assert.equal(
    ticketDetailSchema.safeParse({ ...withPhoto, evidence: undefined }).success,
    false,
  );
});

test("a link can only run the three officer actions", () => {
  assert.deepEqual(
    [...LINK_ACTIONS],
    ["acknowledge", "start", "request-resolution"],
  );
  assert.ok(LINK_ACTIONS.every((action) => action in ticketActionInputSchemas));
});

test("a resent link answers with its delivery", () => {
  const body = {
    data: { id: 1, ticketId: 5, status: "pending", createdAt: "x" },
  };
  assert.equal(linkDeliveryResponseSchema.parse(body).data.ticketId, "5");
});
