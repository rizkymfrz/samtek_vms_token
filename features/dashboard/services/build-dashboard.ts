import {
  canRaiseAlarms,
  COUNTING_ANALYTICS,
  type DeviceInfo,
  FACE_ANALYTICS,
  generateAnalytics,
  PLATE_ANALYTICS,
  PPE_ANALYTICS,
} from "@/app/(app)/_data/dashboard-source";
import { countBy, withOther } from "../lib/aggregate";
import {
  clock,
  clockSeconds,
  DAY,
  delta,
  HOUR,
  plainLabel,
  titleCase,
} from "../lib/format";

export const buildDashboard = (devices: DeviceInfo[], now = Date.now()) => {
  const data = generateAnalytics(now, devices);
  const deviceName = new Map(devices.map((d) => [d.device_id, d.name]));
  const inWindow = (at: Date, from: number, to: number) =>
    at.getTime() > from && at.getTime() <= to;
  const last = (at: Date) => inWindow(at, now - DAY, now);
  const before = (at: Date) => inWindow(at, now - 2 * DAY, now - DAY);
  const alarms = data.alarm_events.filter((a) => last(a.occurred_at));
  const alarmsPrev = data.alarm_events.filter((a) => before(a.occurred_at));
  const recognitions = data.recognition_events.filter((r) =>
    last(r.occurred_at),
  );
  const recognitionsPrev = data.recognition_events.filter((r) =>
    before(r.occurred_at),
  );
  const recognitionIds = new Set(recognitions.map((r) => r.event_id));
  const recognitionById = new Map(
    data.recognition_events.map((r) => [r.event_id, r]),
  );
  const currentHour = Math.floor(now / HOUR) * HOUR;
  const hourStarts = Array.from(
    { length: 24 },
    (_, index) => currentHour - (23 - index) * HOUR,
  );
  const perHour = <T extends { occurred_at: Date }>(
    items: T[],
    extra: (item: T) => boolean = () => true,
  ) =>
    hourStarts.map(
      (start) =>
        items.filter((item) => {
          const at = item.occurred_at.getTime();
          return at >= start && at < start + HOUR && extra(item);
        }).length,
    );
  const enabledAnalytics = new Set(
    devices.filter((d) => d.is_enabled).flatMap((d) => d.analytics),
  );
  const has = (ids: string[]) => ids.some((id) => enabledAnalytics.has(id));
  const modules = {
    counting: has(COUNTING_ANALYTICS),
    ppe: has(PPE_ANALYTICS),
    fire: enabledAnalytics.has("fire_smoke"),
    access: enabledAnalytics.has("face_recognition"),
    crowd: enabledAnalytics.has("people_crowd_monitoring"),
    dust: enabledAnalytics.has("dust_spreading"),
    worker: enabledAnalytics.has("people_worker_dwelling"),
    behavior: has(["phone_calling", "people_sleep_on_duty"]),
    visitors: enabledAnalytics.has("face_visitor_attendance"),
    faceRecognition: has(FACE_ANALYTICS),
    faceAttribute: enabledAnalytics.has("face_attribute"),
    licensePlate: has(PLATE_ANALYTICS),
    reid: enabledAnalytics.has("people_reidentification"),
  };
  const hasRecognition =
    modules.faceRecognition ||
    modules.faceAttribute ||
    modules.licensePlate ||
    modules.reid;
  const hourly = (level: "medium" | "high") =>
    perHour(alarms, (a) => a.risk_level === level);
  const medium = hourly("medium");
  const high = hourly("high");
  const timeline = hourStarts.map((start, index) => ({
    label: clock.format(start),
    medium: medium[index],
    high: high[index],
  }));
  const riskTotals = (["medium", "high"] as const).map((level) => ({
    level,
    count: alarms.filter((a) => a.risk_level === level).length,
  }));
  const detailsByEvent = new Map<string, typeof data.alarm_details>();
  for (const detail of data.alarm_details) {
    detailsByEvent.set(detail.event_id, [
      ...(detailsByEvent.get(detail.event_id) ?? []),
      detail,
    ]);
  }
  const numberDetail = (id: string, key: string) =>
    detailsByEvent.get(id)?.find((d) => d.detail_key === key)?.number_value ??
    null;
  const describe = (alarm: (typeof alarms)[number]) => {
    const details = detailsByEvent.get(alarm.event_id) ?? [];
    switch (alarm.kind) {
      case "ppe_missing":
        return `Missing ${details
          .filter((d) => d.detail_key === "missing_items")
          .map((d) => d.text_value)
          .join(", ")}`;
      case "area_dwell":
        return `${alarm.perimeter_name} · ${numberDetail(alarm.event_id, "stay_seconds")}s`;
      case "crowd_limit_exceeded":
        return `${numberDetail(alarm.event_id, "people_count")}/${numberDetail(alarm.event_id, "max_people")} people · ${alarm.perimeter_name}`;
      case "worker_absent":
        return `Absent ${numberDetail(alarm.event_id, "absent_seconds")}s · ${alarm.perimeter_name}`;
      case "face_not_in_whitelist":
        return (
          details.find((d) => d.detail_key === "person_name")?.text_value ?? ""
        );
      case "dust_detected":
        return `Dust level ${Math.round((numberDetail(alarm.event_id, "dust_score") ?? 0) * 100)}%`;
      default:
        return alarm.perimeter_name;
    }
  };
  const recentAlarms = [...alarms]
    .sort((a, b) => b.occurred_at.getTime() - a.occurred_at.getTime())
    .slice(0, 8)
    .map((alarm) => ({
      id: alarm.event_id,
      time: clockSeconds.format(alarm.occurred_at),
      device: deviceName.get(alarm.device_id) ?? alarm.device_id,
      title: alarm.title,
      detail: describe(alarm),
      object: titleCase(alarm.object_label),
      risk: alarm.risk_level,
      score: alarm.score,
    }));
  const heatmap = devices
    .filter((d) => d.is_enabled && canRaiseAlarms(d))
    .map((device) => ({
      device: device.name,
      hours: perHour(alarms, (a) => a.device_id === device.device_id),
    }));
  const ppeAlarms = alarms.filter((a) => a.kind === "ppe_missing");
  const ppeAlarmsPrev = alarmsPrev.filter((a) => a.kind === "ppe_missing");
  const ppeIds = new Set(ppeAlarms.map((a) => a.event_id));
  const ppeHours = perHour(ppeAlarms);
  const ppe = {
    total: ppeAlarms.length,
    change: delta(ppeAlarms.length, ppeAlarmsPrev.length),
    timeline: hourStarts.map((start, index) => ({
      label: clock.format(start),
      violations: ppeHours[index],
    })),
    byItem: countBy(
      data.alarm_details.filter(
        (d) =>
          d.detail_key === "missing_items" &&
          d.text_value &&
          ppeIds.has(d.event_id),
      ),
      (d) => d.text_value!,
    ),
  };
  const ofKind = (...kinds: string[]) =>
    alarms.filter((a) => kinds.includes(a.kind));
  const newest = <T extends { occurred_at: Date }>(items: T[]) =>
    [...items].sort(
      (a, b) => b.occurred_at.getTime() - a.occurred_at.getTime(),
    )[0];
  const fireAlarms = ofKind("fire_smoke_detected");
  const lastFire = newest(fireAlarms);
  const fire = {
    total: fireAlarms.length,
    fire: fireAlarms.filter((a) => a.object_label === "fire").length,
    smoke: fireAlarms.filter((a) => a.object_label === "smoke").length,
    last: lastFire
      ? {
          device: deviceName.get(lastFire.device_id) ?? lastFire.device_id,
          time: clock.format(lastFire.occurred_at),
        }
      : null,
    events: fireAlarms.map((alarm) => ({
      id: alarm.event_id,
      kind:
        alarm.object_label === "smoke" ? ("smoke" as const) : ("fire" as const),
      position: Math.min(
        1,
        Math.max(0, (alarm.occurred_at.getTime() - (now - DAY)) / DAY),
      ),
      device: deviceName.get(alarm.device_id) ?? alarm.device_id,
      time: clock.format(alarm.occurred_at),
    })),
    axis: [clock.format(now - DAY), clock.format(now - DAY / 2), "Now"],
  };
  const accessAlarms = ofKind("face_stranger", "face_not_in_whitelist");
  const strangerHours = perHour(
    accessAlarms,
    (a) => a.kind === "face_stranger",
  );
  const outsideHours = perHour(
    accessAlarms,
    (a) => a.kind === "face_not_in_whitelist",
  );
  const access = {
    stranger: accessAlarms.filter((a) => a.kind === "face_stranger").length,
    outside: accessAlarms.filter((a) => a.kind === "face_not_in_whitelist")
      .length,
    timeline: hourStarts.map((start, index) => ({
      label: clock.format(start),
      stranger: strangerHours[index],
      outside: outsideHours[index],
    })),
    byCamera: countBy(
      accessAlarms,
      (a) => deviceName.get(a.device_id) ?? a.device_id,
      3,
      (name) => name,
    ),
  };
  const crowdAreas = new Map<
    string,
    { alarms: number; peak: number; max: number }
  >();
  for (const alarm of ofKind("crowd_limit_exceeded")) {
    const area = crowdAreas.get(alarm.perimeter_name) ?? {
      alarms: 0,
      peak: 0,
      max: 0,
    };
    area.alarms += 1;
    area.peak = Math.max(
      area.peak,
      numberDetail(alarm.event_id, "people_count") ?? 0,
    );
    area.max = numberDetail(alarm.event_id, "max_people") ?? area.max;
    crowdAreas.set(alarm.perimeter_name, area);
  }
  const crowd = {
    total: ofKind("crowd_limit_exceeded").length,
    areas: [...crowdAreas]
      .map(([area, value]) => ({ area, ...value }))
      .sort((a, b) => b.alarms - a.alarms),
  };
  const dustAlarms = ofKind("dust_detected");
  const dust = {
    total: dustAlarms.length,
    timeline: hourStarts.map((start) => {
      const scores = dustAlarms
        .filter(
          (a) =>
            a.occurred_at.getTime() >= start &&
            a.occurred_at.getTime() < start + HOUR,
        )
        .map((a) => numberDetail(a.event_id, "dust_score") ?? 0);
      return {
        label: clock.format(start),
        level: scores.length ? Math.max(...scores) : null,
      };
    }),
  };
  const absenceAreas = new Map<string, { events: number; seconds: number }>();
  for (const alarm of ofKind("worker_absent")) {
    const entry = absenceAreas.get(alarm.perimeter_name) ?? {
      events: 0,
      seconds: 0,
    };
    entry.events += 1;
    entry.seconds += numberDetail(alarm.event_id, "absent_seconds") ?? 0;
    absenceAreas.set(alarm.perimeter_name, entry);
  }
  const absence = {
    events: ofKind("worker_absent").length,
    areas: [...absenceAreas]
      .map(([area, value]) => ({ area, ...value }))
      .sort((a, b) => b.seconds - a.seconds),
  };
  const behaviorAlarms = ofKind("phone_call", "sleep_on_duty");
  const behavior = {
    phone: behaviorAlarms.filter((a) => a.kind === "phone_call").length,
    sleep: behaviorAlarms.filter((a) => a.kind === "sleep_on_duty").length,
    byCamera: countBy(
      behaviorAlarms,
      (a) => deviceName.get(a.device_id) ?? a.device_id,
      4,
      (name) => name,
    ),
  };
  const countRows = data.object_counts.filter(
    (c) => c.end_date.getTime() > now - DAY && c.start_date.getTime() <= now,
  );
  const directions = countBy(countRows, (c) => c.direction).map((d) => d.label);
  const rowsFor = (direction: string) =>
    countRows.filter((c) => titleCase(c.direction) === direction);
  const countedIn = (rows: typeof countRows, start: number) =>
    rows
      .filter((c) => c.start_date.getTime() === start)
      .reduce((sum, c) => sum + c.counted_object, 0);
  const series = directions.slice(0, 2);
  const countingTimeline = hourStarts.map((start) => ({
    label: clock.format(start),
    ...Object.fromEntries(
      series.map((direction, index) => [
        `s${index}`,
        countedIn(rowsFor(direction), start),
      ]),
    ),
  })) as ({ label: string } & Record<string, number | string>)[];
  const countedTotal = countRows.reduce((sum, c) => sum + c.counted_object, 0);
  const countedPrev = data.object_counts
    .filter(
      (c) =>
        c.end_date.getTime() > now - 2 * DAY &&
        c.end_date.getTime() <= now - DAY,
    )
    .reduce((sum, c) => sum + c.counted_object, 0);
  const dwellRows = data.object_dwellings.filter(
    (d) => d.end_date.getTime() > now - DAY && d.start_date.getTime() <= now,
  );
  const dwellByArea = new Map<string, { stay: number; objects: number }>();
  for (const row of dwellRows) {
    const entry = dwellByArea.get(row.perimeter_name) ?? {
      stay: 0,
      objects: 0,
    };
    entry.stay += row.total_stay_time;
    entry.objects += row.total_object;
    dwellByArea.set(row.perimeter_name, entry);
  }
  const counting = {
    total: countedTotal,
    change: delta(countedTotal, countedPrev),
    series,
    data: countingTimeline,
    hourly: countingTimeline.map((bucket) =>
      series.reduce(
        (sum, _, index) => sum + (bucket[`s${index}`] as number),
        0,
      ),
    ),
    avgStay: [...dwellByArea]
      .map(([label, { stay, objects }]) => ({
        label,
        value: objects ? Math.round(stay / objects) : 0,
      }))
      .sort((a, b) => b.value - a.value),
  };
  const recentFor = <R extends { event_id: string }>(results: R[]) =>
    results
      .filter((r) => recognitionIds.has(r.event_id))
      .map((result) => ({
        result,
        event: recognitionById.get(result.event_id)!,
      }))
      .sort(
        (a, b) => b.event.occurred_at.getTime() - a.event.occurred_at.getTime(),
      )
      .slice(0, 5);
  const recentPlates = recentFor(data.license_plate_results).map(
    ({ result, event }) => ({
      id: result.event_id,
      plate: result.plate_number,
      vehicle:
        result.vehicle_type === "-"
          ? "Unknown vehicle"
          : `${result.vehicle_color === "-" ? "" : `${titleCase(result.vehicle_color)} `}${result.vehicle_type}`,
      device: deviceName.get(event.device_id) ?? event.device_id,
      time: clock.format(event.occurred_at),
    }),
  );
  const recentFaces = recentFor(data.face_recognition_results).map(
    ({ result, event }) => ({
      id: result.event_id,
      name: result.person_name,
      group: result.person_group,
      similarity: result.similarity,
      device: deviceName.get(event.device_id) ?? event.device_id,
      time: clock.format(event.occurred_at),
      visitor: event.kind === "face_visitor_registered",
    }),
  );
  const vehicleResults = data.license_plate_results.filter((p) =>
    recognitionIds.has(p.event_id),
  );
  const vehicleTypeKey = (type: string) => (type === "-" ? "unknown" : type);
  const vehicles = {
    total: vehicleResults.length,
    types: ["car", "motorbike", "unknown"]
      .map((key) => ({
        key,
        count: vehicleResults.filter(
          (p) => vehicleTypeKey(p.vehicle_type) === key,
        ).length,
      }))
      .filter((type) => type.count > 0),
    colors: countBy(vehicleResults, (p) =>
      p.vehicle_color === "-" ? "unknown" : p.vehicle_color,
    ),
    topPlates: countBy(
      vehicleResults,
      (p) => p.plate_number,
      5,
      (plate) => plate,
    ),
  };
  const visitorEvents = (list: typeof recognitions) =>
    list.filter((r) => r.kind === "face_visitor_registered");
  const visitors = {
    value: visitorEvents(recognitions).length,
    change: delta(
      visitorEvents(recognitions).length,
      visitorEvents(recognitionsPrev).length,
    ),
    hourly: perHour(visitorEvents(recognitions)),
  };
  const sightings = data.person_sightings.filter((s) => last(s.seen_at));
  const reid = {
    sightings: sightings.length,
    people: new Set(sightings.map((s) => s.person_id)).size,
    byCamera: countBy(
      sightings,
      (s) => deviceName.get(s.device_id) ?? s.device_id,
      4,
      (name) => name,
    ),
  };
  const attributes = data.face_attribute_results.filter((a) =>
    recognitionIds.has(a.event_id),
  );
  const seen = data.person_seen_results.filter((s) =>
    recognitionIds.has(s.event_id),
  );
  return {
    kpis: {
      alarms: {
        value: alarms.length,
        change: delta(alarms.length, alarmsPrev.length),
      },
      severe: {
        value: alarms.filter((a) => a.risk_level === "high").length,
        change: delta(
          alarms.filter((a) => a.risk_level === "high").length,
          alarmsPrev.filter((a) => a.risk_level === "high").length,
        ),
      },
      recognitions: {
        value: recognitions.length,
        change: delta(recognitions.length, recognitionsPrev.length),
      },
      newPersons: {
        value: seen.filter((s) => s.new_person).length,
        total: seen.length,
      },
    },
    modules,
    hasRecognition,
    ppe,
    fire,
    access,
    crowd,
    dust,
    absence,
    behavior,
    vehicles,
    visitors,
    reid,
    counting,
    timeline,
    recognitionsTimeline: perHour(recognitions),
    heatmap,
    riskTotals,
    alarmsByKind: withOther(
      countBy(
        alarms,
        (a) => a.title,
        undefined,
        (title) => title,
      ),
      5,
      "types",
    ),
    recognitionsByType: countBy(recognitions, (r) => r.recognizer),
    recentAlarms,
    recentPlates,
    recentFaces,
    attributes: {
      Gender: countBy(
        attributes,
        (a) => a.person_gender,
        undefined,
        plainLabel,
      ),
      "Age group": countBy(
        attributes,
        (a) => a.person_age_group,
        undefined,
        plainLabel,
      ),
      Mask: countBy(attributes, (a) => a.person_mask, undefined, plainLabel),
      Glasses: countBy(
        attributes,
        (a) => a.person_glasses,
        undefined,
        plainLabel,
      ),
      Emotion: countBy(
        attributes,
        (a) => a.person_emotion,
        undefined,
        plainLabel,
      ),
    },
  };
};
export type Dashboard = ReturnType<typeof buildDashboard>;
