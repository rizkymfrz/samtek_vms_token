import { z } from "zod";

export const TICKET_STATUSES = [
  "open",
  "acknowledged",
  "in_progress",
  "resolve_requested",
  "resolved",
  "false_alarm",
] as const;

const RISK_LEVELS = ["low", "medium", "high"] as const;
export const RESOLUTION_TYPES = ["resolved", "false_alarm"] as const;

export const TICKET_ACTIONS = [
  "acknowledge",
  "start",
  "request-resolution",
  "approve",
  "reject",
] as const;

export const NOTE_MAX_LENGTH = 2000;
export const MAX_EVIDENCE_PER_TICKET = 10;
export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
export const EVIDENCE_STATUSES = ["acknowledged", "in_progress"] as const;

export const LINK_ACTIONS = [
  "acknowledge",
  "start",
  "request-resolution",
] as const;

const date = z.iso.datetime();
const id = z.coerce.string();

export const ticketSchema = z.object({
  id,
  edgeServerId: id,
  deviceId: id,
  deviceName: z.string(),
  analyticId: z.string(),
  kind: z.string(),
  perimeterName: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  riskLevel: z.enum(RISK_LEVELS),
  status: z.enum(TICKET_STATUSES),
  assigneeId: id.nullable(),
  assigneeUsername: z.string().nullable(),
  assignedAt: date.nullable(),
  ackDeadlineAt: date.nullable(),
  acknowledgedAt: date.nullable(),
  escalatedAt: date.nullable(),
  reassignCount: z.number().int(),
  alertCount: z.number().int(),
  firstAlertAt: date,
  lastAlertAt: date,
  hasImage: z.boolean(),
  resolutionType: z.enum(RESOLUTION_TYPES).nullable(),
  resolutionNote: z.string().nullable(),
  resolveRequestedAt: date.nullable(),
  closedAt: date.nullable(),
  createdAt: date,
  updatedAt: date.nullable(),
});

const ticketAlertSchema = z.object({
  eventId: z.string(),
  occurredAt: date,
  analyticId: z.string(),
  kind: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  riskLevel: z.enum(RISK_LEVELS),
  perimeterName: z.string().nullable(),
  objectLabel: z.string(),
  objectConfidence: z.number(),
  hasImage: z.boolean(),
});

const ticketEventSchema = z.object({
  id,
  type: z.string(),
  actorUserId: id.nullable(),
  createdAt: date,
});

export const ticketEvidenceSchema = z.object({
  id,
  uploadedById: id,
  uploadedByUsername: z.string(),
  createdAt: date,
});

export const ticketDetailSchema = ticketSchema.extend({
  alerts: z.array(ticketAlertSchema),
  events: z.array(ticketEventSchema),
  evidence: z.array(ticketEvidenceSchema),
});

export const ticketEvidenceResponseSchema = z.object({
  data: ticketEvidenceSchema,
});

export const linkDeliveryResponseSchema = z.object({
  data: z.object({ id, ticketId: id, status: z.string() }),
});

export const ticketRuleSchema = z.object({
  id,
  edgeServerId: id,
  analyticId: z.string(),
  kind: z.string(),
  isEnabled: z.boolean(),
  isReviewed: z.boolean(),
  firstSeenAt: date,
  lastSeenAt: date,
});

const pageMetaSchema = z.object({ total: z.number().int() });

export const ticketListSchema = z.object({
  data: z.array(ticketSchema),
  meta: pageMetaSchema,
});

export const ticketResponseSchema = z.object({ data: ticketSchema });

export const ticketDetailResponseSchema = z.object({
  data: ticketDetailSchema,
});

export const ticketRuleListSchema = z.object({
  data: z.array(ticketRuleSchema),
  meta: pageMetaSchema,
});

export const ticketRuleResponseSchema = z.object({ data: ticketRuleSchema });

export const ticketListQuerySchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  edgeServerId: z
    .string()
    .regex(/^[0-9]+$/)
    .optional(),
  assigneeId: z
    .string()
    .regex(/^[0-9]+$/)
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const note = z.string().trim().min(1).max(NOTE_MAX_LENGTH);

export const ticketActionInputSchemas = {
  acknowledge: z.strictObject({}),
  start: z.strictObject({}),
  "request-resolution": z.strictObject({
    type: z.enum(RESOLUTION_TYPES),
    note,
  }),
  approve: z.strictObject({ note: note.optional() }),
  reject: z.strictObject({ note }),
} as const;

export const updateTicketRuleInputSchema = z.strictObject({
  isEnabled: z.boolean(),
});

export const ticketUpdatedMessageSchema = z.object({
  type: z.literal("ticket.updated"),
  data: z.object({
    ticket_id: z.coerce.string(),
    edge_server_id: z.coerce.string(),
  }),
});
