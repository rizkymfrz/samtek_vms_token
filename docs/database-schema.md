# Database schema (reference for the UI)

Two databases feed this app. Build pages and dummy data against these field names; do not
invent columns. When a real API replaces the dummy data, keep these names.

| | Profile database | Analytics database |
|---|---|---|
| Owner | the VMS backend | each edge (`samtek_edge_new`) |
| Engine | MySQL, through Prisma | DuckDB (`<SAMTEK_STATS_DIR>/stats.duckdb`) |
| Holds | users, roles, edge servers, devices (cameras), layouts, floor plans | alarms, recognitions, counting statistics |
| Naming | Prisma camelCase fields, snake_case columns | snake_case |
| Keys | PK/FK/UNIQUE as in the schema below | **none**: no PK, FK or UNIQUE; relations only by `event_id` |

Dummy data in this repo: `app/(app)/dashboard/_data/` (analytics) and `app/(app)/live/_data/` (profile).

---

## 1. Profile database (Prisma, MySQL)

IDs are `BigInt` in Prisma. They are not JSON-serializable, so send them to the browser as strings.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/infrastructure/database/generated"
}

datasource db {
  provider = "mysql"
}

model User {
  id                 BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  username           String    @db.VarChar(100)
  email              String    @db.VarChar(255)
  whatsapp           String?   @db.VarChar(20)
  password           String    @db.VarChar(255)
  avatar             String?   @db.Text
  platformRoleId     BigInt?   @map("platform_role_id") @db.UnsignedBigInt
  emailVerifiedAt    DateTime? @map("email_verified_at") @db.Timestamp(0)
  whatsappVerifiedAt DateTime? @map("whatsapp_verified_at") @db.Timestamp(0)
  isActive           Boolean   @default(true) @map("is_active")
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt          DateTime? @updatedAt @map("updated_at") @db.Timestamp(0)
  deletedAt          DateTime? @map("deleted_at") @db.Timestamp(0)

  platformRole  Role?            @relation(fields: [platformRoleId], references: [id], onDelete: Restrict, map: "fk_users_platform_role_id")
  serverRoles   UserServerRole[]
  layouts       Layout[]
  activities    UserActivity[]
  refreshTokens RefreshToken[]

  @@unique([username], map: "uq_users_username")
  @@unique([email], map: "uq_users_email")
  @@map("users")
}

model EdgeServerGroup {
  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  parentId    BigInt?   @map("parent_id") @db.UnsignedBigInt
  name        String    @db.VarChar(100)
  code        String    @db.VarChar(100)
  description String?   @db.Text
  latitude  Decimal?  @db.Decimal(10, 7)
  longitude Decimal?  @db.Decimal(10, 7)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt   DateTime? @updatedAt @map("updated_at") @db.Timestamp(0)
  deletedAt   DateTime? @map("deleted_at") @db.Timestamp(0)

  parent      EdgeServerGroup?  @relation("EdgeServerGroupHierarchy", fields: [parentId], references: [id], onDelete: Restrict, map: "fk_edge_server_groups_parent_id")
  children    EdgeServerGroup[] @relation("EdgeServerGroupHierarchy")
  edgeServers EdgeServer[]
  floorplans  Floorplan[]

  @@unique([code], map: "uq_edge_server_groups_code")
  @@map("edge_server_groups")
}

model EdgeServer {
  id                 BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  groupId            BigInt?   @map("group_id") @db.UnsignedBigInt
  name               String    @db.VarChar(100)
  description        String?   @db.Text
  webrtcUrl          String?   @map("webrtc_url") @db.VarChar(2048)
  hostAddress        String?   @map("host_address") @db.VarChar(255)
  localHostAddress   String?   @map("local_host_address") @db.VarChar(255)
  webrtcUrlLocal     String?   @map("webrtc_url_local") @db.VarChar(2048)
  macAddress         String?   @map("mac_address") @db.VarChar(32)
  credentialKey      String?   @map("credential_key") @db.VarChar(255)
  isActive           Boolean   @default(true) @map("is_active")
  lastSeenAt         DateTime? @map("last_seen_at") @db.Timestamp(0)
  latitude           Decimal?  @db.Decimal(10, 7)
  longitude          Decimal?  @db.Decimal(10, 7)
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt          DateTime? @updatedAt @map("updated_at") @db.Timestamp(0)
  deletedAt          DateTime? @map("deleted_at") @db.Timestamp(0)

  group           EdgeServerGroup? @relation(fields: [groupId], references: [id], onDelete: Restrict, map: "fk_edge_servers_group_id")
  userServerRoles UserServerRole[]
  devices         Device[]

  @@map("edge_servers")
}

model Role {
  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  name        String    @db.VarChar(100)
  description String?   @db.Text
  isSystem    Boolean   @default(false) @map("is_system")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt   DateTime? @updatedAt @map("updated_at") @db.Timestamp(0)
  deletedAt   DateTime? @map("deleted_at") @db.Timestamp(0)

  platformUsers   User[]
  permissions     RolePermission[]
  userServerRoles UserServerRole[]

  @@unique([name], map: "uq_roles_name")
  @@map("roles")
}

model Permission {
  id          BigInt  @id @default(autoincrement()) @db.UnsignedBigInt
  code        String  @db.VarChar(150)
  description String? @db.Text

  roles RolePermission[]

  @@unique([code], map: "uq_permissions_code")
  @@map("permissions")
}

model RolePermission {
  roleId       BigInt @map("role_id") @db.UnsignedBigInt
  permissionId BigInt @map("permission_id") @db.UnsignedBigInt

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade, map: "fk_role_permissions_role_id")
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade, map: "fk_role_permissions_permission_id")

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

model UserServerRole {
  id           BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  userId       BigInt   @map("user_id") @db.UnsignedBigInt
  edgeServerId BigInt   @map("edge_server_id") @db.UnsignedBigInt
  roleId       BigInt   @map("role_id") @db.UnsignedBigInt
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamp(0)

  user       User       @relation(fields: [userId], references: [id], onDelete: Restrict, map: "fk_user_server_roles_user_id")
  edgeServer EdgeServer @relation(fields: [edgeServerId], references: [id], onDelete: Restrict, map: "fk_user_server_roles_edge_server_id")
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Restrict, map: "fk_user_server_roles_role_id")

  @@unique([userId, edgeServerId], map: "uq_user_server_roles_user_id_edge_server_id")
  @@map("user_server_roles")
}

model Device {
  id                 BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  edgeServerId       BigInt    @map("edge_server_id") @db.UnsignedBigInt
  name               String    @db.VarChar(100)
  isEnabled          Boolean   @default(true) @map("is_enabled")
  sourceMain         String    @map("source_main") @db.Text
  sourceSub          String?   @map("source_sub") @db.Text
  sourceThird        String?   @map("source_third") @db.Text
  analyticId         String?   @map("analytic_id") @db.VarChar(64)
  analyticParams     Json?     @map("analytic_params")
  perimeters         Json?
  isRecordingEnabled Boolean   @default(false) @map("is_recording_enabled")
  applyStatus        String?   @map("apply_status") @db.VarChar(16)
  applyErrorCode     String?   @map("apply_error_code") @db.VarChar(64)
  applyErrorField    String?   @map("apply_error_field") @db.VarChar(128)
  applyErrorMessage  String?   @map("apply_error_message") @db.VarChar(512)
  applyReportedAt    DateTime? @map("apply_reported_at") @db.Timestamp(0)
  latitude           Decimal?  @db.Decimal(10, 7)
  longitude          Decimal?  @db.Decimal(10, 7)
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt          DateTime? @updatedAt @map("updated_at") @db.Timestamp(0)
  deletedAt          DateTime? @map("deleted_at") @db.Timestamp(0)

  edgeServer    EdgeServer     @relation(fields: [edgeServerId], references: [id], onDelete: Restrict, map: "fk_devices_edge_server_id")
  layoutDevices    LayoutDevice[]
  floorplanDevices FloorplanDevice[]

  @@map("devices")
}

model Layout {
  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  userId      BigInt    @map("user_id") @db.UnsignedBigInt
  name        String    @db.VarChar(100)
  description String?   @db.Text
  rows        Int       @db.UnsignedSmallInt
  columns     Int       @db.UnsignedSmallInt
  isDefault   Boolean   @default(false) @map("is_default")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt   DateTime? @updatedAt @map("updated_at") @db.Timestamp(0)
  deletedAt   DateTime? @map("deleted_at") @db.Timestamp(0)

  user    User           @relation(fields: [userId], references: [id], onDelete: Restrict, map: "fk_layouts_user_id")
  devices LayoutDevice[]

  @@map("layouts")
}

model LayoutDevice {
  id             BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  layoutId       BigInt   @map("layout_id") @db.UnsignedBigInt
  deviceRecordId BigInt   @map("device_record_id") @db.UnsignedBigInt
  position       Int      @db.UnsignedSmallInt
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamp(0)

  layout Layout @relation(fields: [layoutId], references: [id], onDelete: Cascade, map: "fk_layout_devices_layout_id")
  device Device @relation(fields: [deviceRecordId], references: [id], onDelete: Restrict, map: "fk_layout_devices_device_record_id")

  @@unique([layoutId, position], map: "uq_layout_devices_layout_id_position")
  @@unique([layoutId, deviceRecordId], map: "uq_layout_devices_layout_id_device_record_id")
  @@map("layout_devices")
}

model Floorplan {
  id        BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  groupId   BigInt    @map("group_id") @db.UnsignedBigInt
  parentId  BigInt?   @map("parent_id") @db.UnsignedBigInt
  name      String    @db.VarChar(100)
  imageKey  String?   @map("image_key") @db.VarChar(255)
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt DateTime? @updatedAt @map("updated_at") @db.Timestamp(0)
  deletedAt DateTime? @map("deleted_at") @db.Timestamp(0)

  group    EdgeServerGroup   @relation(fields: [groupId], references: [id], onDelete: Restrict, map: "fk_floorplans_group_id")
  parent   Floorplan?        @relation("FloorplanHierarchy", fields: [parentId], references: [id], onDelete: Restrict, map: "fk_floorplans_parent_id")
  children Floorplan[]       @relation("FloorplanHierarchy")
  devices  FloorplanDevice[]

  @@index([groupId], map: "idx_floorplans_group_id")
  @@index([parentId], map: "idx_floorplans_parent_id")
  @@map("floorplans")
}

model FloorplanDevice {
  id             BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  floorplanId    BigInt    @map("floorplan_id") @db.UnsignedBigInt
  deviceRecordId BigInt    @map("device_record_id") @db.UnsignedBigInt
  xPosition      Decimal   @map("x_position") @db.Decimal(7, 6)
  yPosition      Decimal   @map("y_position") @db.Decimal(7, 6)
  rotationDegrees    Int       @default(0) @map("rotation_degrees") @db.UnsignedSmallInt
  fieldOfViewDegrees Int       @default(90) @map("field_of_view_degrees") @db.UnsignedSmallInt
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt      DateTime? @updatedAt @map("updated_at") @db.Timestamp(0)

  floorplan Floorplan @relation(fields: [floorplanId], references: [id], onDelete: Cascade, map: "fk_floorplan_devices_floorplan_id")
  device    Device    @relation(fields: [deviceRecordId], references: [id], onDelete: Restrict, map: "fk_floorplan_devices_device_record_id")

  @@unique([floorplanId, deviceRecordId], map: "uq_floorplan_devices_floorplan_id_device_record_id")
  @@index([deviceRecordId], map: "idx_floorplan_devices_device_record_id")
  @@map("floorplan_devices")
}

model UserActivity {
  id        BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  userId    BigInt   @map("user_id") @db.UnsignedBigInt
  action    String   @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(0)

  user User @relation(fields: [userId], references: [id], onDelete: Restrict, map: "fk_user_activities_user_id")

  @@map("user_activities")
}

model RefreshToken {
  id        BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  userId    BigInt    @map("user_id") @db.UnsignedBigInt
  tokenHash String    @map("token_hash") @db.Char(64)
  expiresAt DateTime  @map("expires_at") @db.Timestamp(0)
  revokedAt DateTime? @map("revoked_at") @db.Timestamp(0)
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamp(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade, map: "fk_refresh_tokens_user_id")

  @@unique([tokenHash], map: "uq_refresh_tokens_token_hash")
  @@map("refresh_tokens")
}
```

### Things to remember when building on it

- **A camera is a `Device`.** It belongs to one `EdgeServer`. Its identity is `Device.id`. The edge-side `device_id` (stream
  names `dev{id}_main|sub`, MQTT messages, the analytics tables) is `String(Device.id)`. Central assigns it; nobody types it.
- **An edge server is identified by `EdgeServer.id`**, also in MQTT: `samtek/v1/{id}/down` and `samtek/v1/{id}/up`. Topics are
  computed, not stored. The UI shows the id on the server detail so it can be copied into the edge config.
- **Analytics history**: rows written before the id switch keep the old edge `device_id` (e.g. `cam-001`) and no longer match any
  device. Central pushes `device.apply` to the edge; the result of the last apply is stored on the device (`apply*` columns).
- **One analytic per camera**: `Device.analyticId` is a single value (nullable = no analytic). `analyticParams` and
  `perimeters` are JSON blobs validated by the edge (see section 3).
- **Streams per camera:** `sourceMain` (required), `sourceSub` and `sourceThird` (optional). Prefer the sub stream for grids
  and the main stream for a single large view. The frontend only uses main and sub.
- **Live video** is delivered per edge server through `EdgeServer.webrtcUrl` (public) or `webrtcUrlLocal` (LAN).
- **Online state:** `EdgeServer.isActive` is the switch, `EdgeServer.lastSeenAt` is the heartbeat. A camera is only
  watchable when `Device.isEnabled`, its server `isActive`, and `lastSeenAt` is recent.
- **Soft delete:** most tables have `deletedAt`. Hide rows where it is not null.
- **Layouts are per user.** `Layout.rows × Layout.columns` is the grid; `LayoutDevice.position` is the slot (unique per layout,
  and a camera can appear once per layout). `isDefault` marks the layout opened first.
  **Unconfirmed:** whether `position` starts at 0 or 1 is not in the schema. The UI assumes 0-based, row by row
  (`app/(app)/live/_data/types.ts`); confirm with the backend before wiring real data.
- **Geographic position** is stored directly on `EdgeServerGroup`, `EdgeServer` and `Device` as `latitude` / `longitude`
  (nullable, one current position, no history). Either both are set or both are `null` (a database CHECK enforces it);
  latitude is -90..90, longitude -180..180, at most 7 decimals. Prisma returns them as `Decimal`; the API sends plain numbers.
- **Floor plans** (section below) are an image of a building or floor owned by one `EdgeServerGroup`. A camera is placed on a
  plan by relative `x` / `y`, never by pixels.
- **Never send** `User.password`, `RefreshToken.tokenHash` or `EdgeServer.credentialKey` to the browser.

---

### Floor plans

A floor plan is the image of a building or a floor, with cameras placed on it. It is not a geographic map: geographic
positions are the `latitude` / `longitude` columns above. The models are in the schema (`Floorplan`, `FloorplanDevice`).

- **Owner and hierarchy.** Every plan belongs to one `EdgeServerGroup` (`groupId`, required, cannot change). `parentId` nests plans
  inside the same group, up to 10 levels: `Main Building` (no image needed) -> `Floor 1`, `Floor 2`. A parent must be in the same group.
- **Image.** Uploaded through the API (PNG, JPEG or WebP, up to 10 MB), stored on the backend disk. The database holds only
  `imageKey` (an internal file key), which is never sent to the browser. The API sends `hasImage` and serves the file at
  `GET /v1/floorplans/{id}/image`, which needs the `Authorization` header, so fetch it with the token and show it from a blob URL
  instead of putting the URL in an `<img src>`. A plan without an image is valid (`hasImage: false`).
- **Placement.** `FloorplanDevice` links a `Device` to a plan with `xPosition` / `yPosition`, each 0..1 (share of the image width and
  height; 0 is left / top). The API calls them `x` and `y`.
  `rotationDegrees` (0..359, 0 = up, 90 = right, default 0) and `fieldOfViewDegrees` (1..360, default 90) are whole degrees;
  the API calls them `rotation` and `fieldOfView`, both optional on write. A camera appears at most once per plan but may be on several plans.
  The cameras must belong to an edge server in the plan's group or its subgroups. The list is replaced as a whole
  (`PUT /v1/floorplans/{id}/devices`).
- **Access.** Plans use platform permissions `floorplans.read|create|update|delete`, like groups; a role on one server does not
  grant them. Cameras the user cannot read come back as `"device": null`.
- **Deleting** a plan soft-deletes it with all child plans and their placements. Deleting a device removes its placements.

**Differences from the UI types** (`features/floorplan/types.ts`). The UI was built before the backend and still expects fields
the database does not have. Decide per field before wiring real data:

| UI field | Backend |
|---|---|
| `Floorplan.building` | Not stored. Use the parent plan's `name`, or the group's `name`. |
| `Floorplan.level` | Not stored. Use `name` (`Floor 1`) and put the building in the parent plan. |
| `Floorplan.width`, `height` | Not stored. Read the size from the loaded image. Only the proportions matter. |
| `FloorplanDevice.id`, `floorplanId` | Not in the placement list; the plan detail returns `devices: [{ x, y, device }]`. |
| `FloorplanDevice.rotation`, `fov` | Stored as `rotationDegrees` and `fieldOfViewDegrees`; the API names are `rotation` and `fieldOfView`. Rename `fov` to `fieldOfView` in the UI types. |
| "A camera is on at most one plan" | The backend allows several plans per camera. |

## 2. Analytics database (DuckDB, written by the edge)

Source of truth for the shape is the edge's DDL (`src/adapters/outbound/external/duckdb/duckdb_database.cpp` in
`samtek_edge_new`). The UI types are in `app/(app)/dashboard/_data/types.ts`.

### Alarms

`alarm_events`: one row per alarm.

| Field | Type |
|---|---|
| `event_id`, `device_id`, `analytic_id` | VARCHAR |
| `kind`, `title`, `description`, `risk_level` | VARCHAR |
| `perimeter_shape`, `perimeter_name` | VARCHAR (default `''`) |
| `object_label` | VARCHAR |
| `occurred_at` | TIMESTAMP (UTC, no zone) |
| `track_id` | INTEGER (default 0) |
| `score` | FLOAT |
| `frame_width`, `frame_height` | INTEGER |
| `image_path` | VARCHAR (default `''`), relative to `<stats>/evidence`, may have been rotated away |
| `created_at` | TIMESTAMP |

`alarm_details`: extra key/value pairs per alarm, joined by `event_id`.

| Field | Type |
|---|---|
| `event_id`, `detail_key` | VARCHAR |
| `text_value` | VARCHAR, nullable |
| `number_value` | DOUBLE, nullable |
| `item_index` | INTEGER, nullable (only for list values such as `missing_items`; added by the edge migration `addAlarmItemIndex`. **Unconfirmed:** whether it is 0-based) |

Exactly one of `text_value` / `number_value` is set; the other is NULL. `text_value` also carries booleans as `true` / `false`.

### Recognition

`recognition_events`: one row per recognized detection.

| Field | Type |
|---|---|
| `event_id`, `device_id` | VARCHAR |
| `recognizer`, `kind`, `object_label` | VARCHAR |
| `occurred_at` | TIMESTAMP |
| `track_id` | INTEGER (default 0) |
| `score` | FLOAT |
| `x1`, `y1`, `x2`, `y2` | FLOAT (bounding box, **pixels** of `frame_width × frame_height`) |
| `frame_width`, `frame_height` | INTEGER |
| `crop_path` | VARCHAR (default `''`), relative to `<stats>/crops` |
| `created_at` | TIMESTAMP |

Result tables, all joined to `recognition_events` by `event_id`:

- `face_recognition_results`: `person_id`, `person_name`, `person_group` (VARCHAR), `similarity` (FLOAT)
- `face_attribute_results`: `person_gender`, `person_age_group`, `person_mask`, `person_glasses`, `person_emotion` (VARCHAR)
- `license_plate_results`: `plate_number`, `vehicle_type`, `vehicle_color` (VARCHAR)
- `person_seen_results`: `person_id` (VARCHAR), `similarity` (FLOAT), `new_person` (BOOLEAN)

### Other tables the edge writes

- `person_sightings`: `person_id`, `device_id`, `seen_at`, `similarity`, `track_id`, `crop_path`, `created_at`
- `object_counts`: `device_id`, `perimeter_type` (always `'line'`), `perimeter_name`, `direction`, `object_label`,
  `counted_object` (BIGINT), `start_date`, `end_date`, `created_at`. One row per line/direction/class per window; **a window
  with no activity has no row**, so fill zeros in the UI.
- `object_dwellings`: `device_id`, `perimeter_name`, `object_label`, `total_stay_time` (seconds), `total_object`,
  `average_stay_time`, `start_date`, `end_date`, `created_at`
- Embeddings (`face_embeddings`, `person_embeddings`, `person_clip_embeddings`) exist but are not for the UI.

### Indexes

Defined in `duckdb_database.cpp:78-92`. They are plain indexes, not constraints. Filter by these columns first.

- `object_counts (device_id, start_date)`
- `object_dwellings (device_id, start_date)`
- `recognition_events (device_id, occurred_at)`
- `alarm_events (device_id, occurred_at)`
- `person_sightings (person_id)`
- `alarm_events (event_id)`
- `recognition_events (event_id)`

### Value sets

- `risk_level`: `low` | `medium` | `high`. Alarms are only `medium` or `high` (`low` is recognition-internal). There is **no `critical`**.
- `perimeter_shape`: `area` | `line` | `''` (never `polygon`).
- Alarm `kind`: `area_dwell`, `ppe_missing`, `fire_smoke_detected`, `crowd_limit_exceeded`, `worker_absent`, `cat_detected`,
  `phone_call`, `sleep_on_duty`, `motion_detected`, `dust_detected`, `face_not_in_whitelist`, `face_stranger`.
  (`line_cross` exists in the edge code but is never written.)
- Recognition `kind`: `face_recognized`, `face_visitor_registered`, `face_attribute`, `license_plate`, `person_seen`.
- Enums: gender `Male|Female`; age group `Child|Teenager|Adult|Elder`; mask/glasses `Yes|No`; emotion `ANGER|DISGUST|FEAR|HAPPINESS|NEUTRAL|SADNESS|SURPRISE`;
  vehicle type `car|motorbike|-`; vehicle color `black|blue|green|red|silver|yellow|-`. `person_group` is free text (`nogroup` for visitors).
- Time: `occurred_at` is processing time in UTC; the app shows Asia/Jakarta. Use `occurred_at`, not `created_at`, for analysis.

---

## 3. Analytics the edge can run

18 analytic ids; the list with labels is `config/analytics-catalog.ts`. Each camera runs exactly one
(`devices.json` -> `analytic.id`, mirrored in `Device.analyticId`).

`people_counting_dwelling`, `vehicle_counting_dwelling`, `ppe_violation`, `ppe_violation_advance`, `fire_smoke`,
`people_crowd_monitoring`, `people_worker_dwelling`, `cat_detection`, `phone_calling`, `people_sleep_on_duty`, `motion`,
`dust_spreading`, `face_recognition`, `face_visitor_attendance`, `face_attribute`, `license_plate_recognition`,
`vehicle_license_plate_recognition`, `people_reidentification`.

- `analyticParams` (JSON): flat object of bool, number, string or list of strings. Unknown keys are rejected by the edge.
  Every parameter has a default, so none is required.
- `perimeters` (JSON): `{ areas: [{ name, polygon: [{x, y}, ...], max_stay_seconds? }], lines: [{ name, line: {x1, y1, x2, y2},
  direction_a_name, direction_b_name }] }`. Coordinates are normalized 0..1. At most 32 areas and 32 lines; a polygon has 3 to 256 points.
- Not stored anywhere (so not available to the UI): PPE "people checked" denominators, real-time occupancy per area,
  heatmap positions, and alarm bounding boxes (`alarm_events` has none).
