import type {
  ActionBody,
  TicketAction,
  TicketDetail,
  TicketFilters,
  TicketPage,
  TicketRecord,
  TicketRule,
  TicketStatus,
} from "../types";

const MINUTE_MS = 60_000;
const MOCK_USER = { id: "1", username: "Rizky Maulana" };

const at = (now: number, minutesAgo: number) =>
  new Date(now - minutesAgo * MINUTE_MS).toISOString();

const photo = (id: string, createdAt: string) => ({
  id,
  uploadedById: MOCK_USER.id,
  uploadedByUsername: MOCK_USER.username,
  createdAt,
});

const seed = (now: number): TicketDetail[] => {
  const base = (id: string, patch: Partial<TicketDetail>): TicketDetail => ({
    id,
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
    assigneeId: MOCK_USER.id,
    assigneeUsername: MOCK_USER.username,
    assignedAt: at(now, 2),
    ackDeadlineAt: at(now, -3),
    acknowledgedAt: null,
    escalatedAt: null,
    reassignCount: 0,
    alertCount: 1,
    firstAlertAt: at(now, 2),
    lastAlertAt: at(now, 2),
    hasImage: false,
    resolutionType: null,
    resolutionNote: null,
    resolveRequestedAt: null,
    closedAt: null,
    createdAt: at(now, 2),
    updatedAt: null,
    alerts: [],
    evidence: [],
    events: [
      {
        id: `${id}1`,
        type: "created",
        actorUserId: null,
        createdAt: at(now, 2),
      },
      {
        id: `${id}2`,
        type: "assigned",
        actorUserId: null,
        createdAt: at(now, 2),
      },
    ],
    ...patch,
  });
  return [
    base("1", {
      riskLevel: "high",
      alertCount: 4,
      title: "Intrusion in restricted area",
      deviceName: "Server room",
      perimeterName: "Restricted zone",
      analyticId: "intrusion",
      kind: "area_intrusion",
      firstAlertAt: at(now, 6),
      lastAlertAt: at(now, 1),
      ackDeadlineAt: at(now, -4),
    }),
    base("2", {
      edgeServerId: "2",
      deviceName: "Parking gate",
      title: "Loitering",
      kind: "loitering",
      analyticId: "loitering",
      perimeterName: null,
      status: "in_progress",
      acknowledgedAt: at(now, 12),
      ackDeadlineAt: null,
      assignedAt: at(now, 15),
      firstAlertAt: at(now, 15),
      lastAlertAt: at(now, 9),
      createdAt: at(now, 15),
    }),
    base("3", {
      edgeServerId: "3",
      deviceName: "Warehouse door",
      title: "Vehicle in no-parking area",
      riskLevel: "low",
      status: "resolve_requested",
      acknowledgedAt: at(now, 40),
      ackDeadlineAt: null,
      resolutionType: "false_alarm",
      resolutionNote: "Delivery truck, authorised by the warehouse lead.",
      resolveRequestedAt: at(now, 5),
      evidence: [photo("3-1", at(now, 8))],
      firstAlertAt: at(now, 45),
      lastAlertAt: at(now, 30),
      createdAt: at(now, 45),
    }),
    base("4", {
      title: "Person detected after hours",
      status: "open",
      assigneeId: null,
      assigneeUsername: null,
      assignedAt: null,
      ackDeadlineAt: null,
      escalatedAt: at(now, 1),
      reassignCount: 2,
      riskLevel: "high",
      firstAlertAt: at(now, 20),
      lastAlertAt: at(now, 20),
      createdAt: at(now, 20),
    }),
    base("5", {
      status: "resolved",
      resolutionType: "resolved",
      resolutionNote: "Checked on site, nothing found.",
      acknowledgedAt: at(now, 200),
      closedAt: at(now, 180),
      evidence: [photo("5-1", at(now, 190))],
      ackDeadlineAt: null,
      firstAlertAt: at(now, 210),
      lastAlertAt: at(now, 205),
      createdAt: at(now, 210),
    }),
  ];
};

const RULES: TicketRule[] = [
  ["1", "1", "line_crossing", "line_cross", true, true],
  ["2", "1", "intrusion", "area_intrusion", true, true],
  ["3", "1", "loitering", "loitering", false, false],
  ["4", "2", "loitering", "loitering", true, true],
  ["5", "3", "vehicle", "no_parking", false, false],
].map(([id, edgeServerId, analyticId, kind, isEnabled, isReviewed]) => ({
  id: String(id),
  edgeServerId: String(edgeServerId),
  analyticId: String(analyticId),
  kind: String(kind),
  isEnabled: Boolean(isEnabled),
  isReviewed: Boolean(isReviewed),
  firstSeenAt: "2026-11-01T08:00:00.000Z",
  lastSeenAt: "2026-11-17T08:00:00.000Z",
}));

let tickets: TicketDetail[] | null = null;
let rules: TicketRule[] | null = null;

const store = () => (tickets ??= seed(Date.now()));
const ruleStore = () => (rules ??= RULES.map((rule) => ({ ...rule })));

const summary = (detail: TicketDetail): TicketRecord => {
  const { alerts, events, ...ticket } = detail;
  void alerts;
  void events;
  return ticket;
};

const newestFirst = (a: TicketRecord, b: TicketRecord) =>
  b.lastAlertAt.localeCompare(a.lastAlertAt);

export const mockListTickets = (
  filters: TicketFilters,
  pageSize: number,
): TicketPage => {
  const matches = store()
    .filter(
      (ticket) =>
        (!filters.status || ticket.status === filters.status) &&
        (!filters.edgeServerId ||
          ticket.edgeServerId === filters.edgeServerId) &&
        (!filters.assigneeId || ticket.assigneeId === filters.assigneeId),
    )
    .map(summary)
    .toSorted(newestFirst);
  const start = (filters.page - 1) * pageSize;
  return {
    items: matches.slice(start, start + pageSize),
    total: matches.length,
  };
};

export const mockGetTicket = (id: string) =>
  store().find((ticket) => ticket.id === id) ?? null;

const TRANSITIONS: Record<
  TicketAction,
  { from: TicketRecord["status"][]; to: TicketRecord["status"] }
> = {
  acknowledge: { from: ["open"], to: "acknowledged" },
  start: { from: ["acknowledged"], to: "in_progress" },
  "request-resolution": {
    from: ["acknowledged", "in_progress"],
    to: "resolve_requested",
  },
  approve: { from: ["resolve_requested"], to: "resolved" },
  reject: { from: ["resolve_requested"], to: "in_progress" },
};

const EVENT_TYPE: Record<TicketAction, string> = {
  acknowledge: "acknowledged",
  start: "started",
  "request-resolution": "resolution_requested",
  approve: "approved",
  reject: "rejected",
};

export class MockConflictError extends Error {}

export class MockUnprocessableError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export const MOCK_LINK_TOKEN = "demo";
const MAX_EVIDENCE = 10;
const EVIDENCE_STATUSES: TicketStatus[] = ["acknowledged", "in_progress"];

export const mockLinkTicketId = (token: string) => {
  if (token !== MOCK_LINK_TOKEN) return null;
  const ticket = mockGetTicket("1");
  const isClosed =
    ticket?.status === "resolved" || ticket?.status === "false_alarm";
  return ticket && !isClosed ? ticket.id : null;
};

export const mockAddEvidence = (id: string) => {
  const ticket = mockGetTicket(id);
  if (!ticket) return null;
  if (!EVIDENCE_STATUSES.includes(ticket.status)) {
    throw new MockConflictError("The ticket cannot take a photo now");
  }
  if (ticket.evidence.length >= MAX_EVIDENCE) {
    throw new MockUnprocessableError(
      "The ticket already has the maximum number of photos",
      "EVIDENCE_LIMIT_REACHED",
    );
  }
  const evidence = photo(
    `${ticket.id}-${ticket.evidence.length + 1}`,
    new Date().toISOString(),
  );
  ticket.evidence.push(evidence);
  return evidence;
};

export const mockRunAction = (
  id: string,
  action: TicketAction,
  body: ActionBody,
) => {
  const ticket = mockGetTicket(id);
  if (!ticket) return null;
  const transition = TRANSITIONS[action];
  if (!transition.from.includes(ticket.status)) {
    throw new MockConflictError("The ticket cannot take this action now");
  }
  if (action === "request-resolution" && ticket.evidence.length === 0) {
    throw new MockUnprocessableError(
      "Add at least one photo before asking to close the ticket",
      "EVIDENCE_REQUIRED",
    );
  }
  const now = new Date().toISOString();
  ticket.status = transition.to;
  ticket.updatedAt = now;
  if (action === "acknowledge") {
    ticket.acknowledgedAt = now;
    ticket.ackDeadlineAt = null;
  }
  if (action === "request-resolution") {
    ticket.resolutionType =
      body.type === "false_alarm" ? "false_alarm" : "resolved";
    ticket.resolutionNote = body.note ?? null;
    ticket.resolveRequestedAt = now;
  }
  if (action === "approve") {
    ticket.status = ticket.resolutionType ?? "resolved";
    ticket.closedAt = now;
  }
  if (action === "reject") {
    ticket.resolveRequestedAt = null;
  }
  ticket.events.unshift({
    id: `${ticket.id}-${ticket.events.length + 1}`,
    type: EVENT_TYPE[action],
    actorUserId: MOCK_USER.id,
    createdAt: now,
  });
  return summary(ticket);
};

export const mockListRules = (serverId: string) => {
  const items = ruleStore()
    .filter((rule) => rule.edgeServerId === serverId)
    .toSorted(
      (a, b) =>
        Number(a.isReviewed) - Number(b.isReviewed) ||
        b.lastSeenAt.localeCompare(a.lastSeenAt),
    );
  return { items, total: items.length };
};

export const mockSetRule = (
  serverId: string,
  id: string,
  isEnabled: boolean,
) => {
  const rule = ruleStore().find(
    (item) => item.id === id && item.edgeServerId === serverId,
  );
  if (!rule) return null;
  rule.isEnabled = isEnabled;
  rule.isReviewed = true;
  return { ...rule };
};
