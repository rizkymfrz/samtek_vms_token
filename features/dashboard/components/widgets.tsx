import {
  BellRingIcon,
  HardHatIcon,
  ScanFaceIcon,
  ScanLineIcon,
  TriangleAlertIcon,
  UserCheckIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { AccessTrend } from "./access-trend";
import { AlarmsTimeline } from "./alarms-timeline";
import { BarList } from "./bar-list";
import { CountingTrend } from "./counting-trend";
import { CrowdBullets } from "./crowd-bullets";
import { DustTrend } from "./dust-trend";
import { EmotionRadar } from "./emotion-radar";
import { FireStatus } from "./fire-status";
import { Heatmap } from "./heatmap";
import { KpiCard } from "./kpi-card";
import { NewPersons } from "./new-persons";
import { NoData } from "./no-data";
import { Panel } from "./panel";
import { PpeTrend } from "./ppe-trend";
import { RecentAlarms } from "./recent-alarms";
import { RecentFaces, RecentPlates } from "./recent-recognitions";
import { RiskDonut } from "./risk-donut";
import { Stats } from "./stats";
import { VehicleDonut } from "./vehicle-donut";
import { duration } from "../lib/format";
import type { Dashboard } from "../services/build-dashboard";

export type Widget = {
  id: string;
  section: (typeof SECTIONS)[number];
  group: string;
  span: number;
  when: (data: Dashboard) => boolean;
  render: (data: Dashboard) => ReactNode;
};

export const SECTIONS = [
  "Overview",
  "Safety",
  "Security",
  "Operations",
  "Vehicles",
] as const;

const always = () => true;

export const WIDGETS: Widget[] = [
  {
    id: "kpi-alarms",
    section: "Overview",
    group: "kpi",
    span: 3,
    when: always,
    render: (d) => (
      <KpiCard
        label="Alarms (24h)"
        value={d.kpis.alarms.value}
        change={d.kpis.alarms.change}
        icon={BellRingIcon}
        spark={d.timeline.map((b) => b.medium + b.high)}
      />
    ),
  },
  {
    id: "kpi-high",
    section: "Overview",
    group: "kpi",
    span: 3,
    when: always,
    render: (d) => (
      <KpiCard
        label="High risk"
        value={d.kpis.severe.value}
        change={d.kpis.severe.change}
        icon={TriangleAlertIcon}
        spark={d.timeline.map((b) => b.high)}
      />
    ),
  },
  {
    id: "kpi-counting",
    section: "Overview",
    group: "kpi",
    span: 3,
    when: (d) => d.modules.counting,
    render: (d) => (
      <KpiCard
        label="Objects counted (24h)"
        value={d.counting.total}
        change={d.counting.change}
        icon={ScanLineIcon}
        spark={d.counting.hourly}
      />
    ),
  },
  {
    id: "kpi-ppe",
    section: "Overview",
    group: "kpi",
    span: 3,
    when: (d) => d.modules.ppe,
    render: (d) => (
      <KpiCard
        label="PPE violations (24h)"
        value={d.ppe.total}
        change={d.ppe.change}
        icon={HardHatIcon}
        spark={d.ppe.timeline.map((b) => b.violations)}
      />
    ),
  },
  {
    id: "kpi-visitors",
    section: "Overview",
    group: "kpi",
    span: 3,
    when: (d) => d.modules.visitors,
    render: (d) => (
      <KpiCard
        label="New visitors (24h)"
        value={d.visitors.value}
        change={d.visitors.change}
        icon={UserCheckIcon}
        spark={d.visitors.hourly}
      />
    ),
  },
  {
    id: "kpi-recognitions",
    section: "Overview",
    group: "kpi",
    span: 3,
    when: (d) => d.hasRecognition,
    render: (d) => (
      <KpiCard
        label="Recognitions (24h)"
        value={d.kpis.recognitions.value}
        change={d.kpis.recognitions.change}
        icon={ScanFaceIcon}
        spark={d.recognitionsTimeline}
      />
    ),
  },
  {
    id: "new-persons",
    section: "Overview",
    group: "kpi",
    span: 3,
    when: (d) => d.modules.reid,
    render: (d) => (
      <Panel title="New persons">
        <NewPersons
          value={d.kpis.newPersons.value}
          total={d.kpis.newPersons.total}
        />
      </Panel>
    ),
  },
  {
    id: "alarms-timeline",
    section: "Overview",
    group: "main",
    span: 8,
    when: always,
    render: (d) => (
      <Panel title="Alarms per hour" description="Last 24 hours, by risk level">
        <AlarmsTimeline data={d.timeline} />
      </Panel>
    ),
  },
  {
    id: "risk",
    section: "Overview",
    group: "main",
    span: 4,
    when: always,
    render: (d) => (
      <Panel title="Risk levels" description="Share of alarms, last 24 hours">
        {d.kpis.alarms.value ? (
          <RiskDonut data={d.riskTotals} />
        ) : (
          <NoData>No alarms.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "heatmap",
    section: "Overview",
    group: "breakdown",
    span: 6,
    when: always,
    render: (d) => (
      <Panel title="Activity by camera" description="Alarms per hour">
        {d.heatmap.length ? (
          <Heatmap rows={d.heatmap} hours={d.timeline.map((b) => b.label)} />
        ) : (
          <NoData>No cameras raising alarms.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "alarms-by-type",
    section: "Overview",
    group: "breakdown",
    span: 3,
    when: always,
    render: (d) => (
      <Panel title="Alarms by type">
        {d.alarmsByKind.length ? (
          <BarList items={d.alarmsByKind} />
        ) : (
          <NoData>No alarms.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "recognitions-by-type",
    section: "Overview",
    group: "breakdown",
    span: 3,
    when: (d) => d.hasRecognition,
    render: (d) => (
      <Panel title="Recognitions" description="By analytic">
        {d.recognitionsByType.length ? (
          <BarList items={d.recognitionsByType} />
        ) : (
          <NoData />
        )}
      </Panel>
    ),
  },
  {
    id: "recent-alarms",
    section: "Overview",
    group: "recent",
    span: 12,
    when: always,
    render: (d) => (
      <Panel title="Recent alarms">
        {d.recentAlarms.length ? (
          <RecentAlarms alarms={d.recentAlarms} />
        ) : (
          <NoData>No alarms.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "ppe-trend",
    section: "Safety",
    group: "ppe",
    span: 7,
    when: (d) => d.modules.ppe,
    render: (d) => (
      <Panel title="PPE violations per hour" description="Last 24 hours">
        <PpeTrend data={d.ppe.timeline} />
      </Panel>
    ),
  },
  {
    id: "ppe-items",
    section: "Safety",
    group: "ppe",
    span: 5,
    when: (d) => d.modules.ppe,
    render: (d) => (
      <Panel title="Missing PPE" description="By item, last 24 hours">
        {d.ppe.byItem.length ? (
          <BarList items={d.ppe.byItem} />
        ) : (
          <NoData>No violations.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "fire",
    section: "Safety",
    group: "hazards",
    span: 4,
    when: (d) => d.modules.fire,
    render: (d) => <FireStatus fire={d.fire} />,
  },
  {
    id: "crowd",
    section: "Safety",
    group: "hazards",
    span: 4,
    when: (d) => d.modules.crowd,
    render: (d) => (
      <Panel
        title="Crowd density"
        description="Peak headcount at alarm vs limit"
      >
        {d.crowd.areas.length ? (
          <CrowdBullets areas={d.crowd.areas} />
        ) : (
          <NoData>No crowd alarms.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "dust",
    section: "Safety",
    group: "hazards",
    span: 4,
    when: (d) => d.modules.dust,
    render: (d) => (
      <Panel
        title="Dust level"
        description="Highest level per hour, while above the alarm threshold"
      >
        {d.dust.total ? (
          <DustTrend data={d.dust.timeline} />
        ) : (
          <NoData>No dust alarms.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "access",
    section: "Security",
    group: "people",
    span: 4,
    when: (d) => d.modules.access,
    render: (d) => (
      <Panel
        title="Access security"
        description="Face alarms per hour, last 24 hours"
      >
        <div className="flex flex-col gap-4">
          <Stats
            items={[
              [d.access.stranger, "Strangers"],
              [d.access.outside, "Outside whitelist"],
            ]}
          />
          {d.access.stranger + d.access.outside ? (
            <>
              <AccessTrend data={d.access.timeline} />
              <BarList items={d.access.byCamera} />
            </>
          ) : (
            <NoData>No access alarms.</NoData>
          )}
        </div>
      </Panel>
    ),
  },
  {
    id: "faces",
    section: "Security",
    group: "people",
    span: 4,
    when: (d) => d.modules.faceRecognition,
    render: (d) => (
      <Panel title="Recognized faces">
        <RecentFaces faces={d.recentFaces} deviceNames={d.deviceNames} />
      </Panel>
    ),
  },
  {
    id: "reid",
    section: "Security",
    group: "people",
    span: 4,
    when: (d) => d.modules.reid,
    render: (d) => (
      <Panel
        title="Person re-identification"
        description="Sightings, last 24 hours"
      >
        <div className="flex flex-col gap-4">
          <Stats
            items={[
              [d.reid.sightings, "Sightings"],
              [d.reid.people, "Different people"],
            ]}
          />
          {d.reid.byCamera.length ? (
            <BarList items={d.reid.byCamera} />
          ) : (
            <NoData />
          )}
        </div>
      </Panel>
    ),
  },
  {
    id: "face-attributes",
    section: "Security",
    group: "faces",
    span: 8,
    when: (d) => d.modules.faceAttribute,
    render: (d) => {
      const attributes = Object.entries(d.attributes).filter(
        ([name]) => name !== "Emotion",
      );
      return (
        <Panel
          title="Face attributes"
          description="Detected faces, last 24 hours"
        >
          <div className="grid gap-8 sm:grid-cols-2">
            {attributes.map(([name, items]) => (
              <div key={name} className="flex flex-col gap-4">
                <span className="text-xs font-medium text-muted-foreground">
                  {name}
                </span>
                {items.length ? <BarList items={items} /> : <NoData />}
              </div>
            ))}
          </div>
        </Panel>
      );
    },
  },
  {
    id: "emotions",
    section: "Security",
    group: "faces",
    span: 4,
    when: (d) => d.modules.faceAttribute,
    render: (d) => (
      <Panel title="Emotions" description="Detected faces, last 24 hours">
        {d.attributes.Emotion.length ? (
          <EmotionRadar items={d.attributes.Emotion} />
        ) : (
          <NoData />
        )}
      </Panel>
    ),
  },
  {
    id: "counting-trend",
    section: "Operations",
    group: "counting",
    span: 7,
    when: (d) => d.modules.counting,
    render: (d) => (
      <Panel
        title="Counting per hour"
        description="Objects crossing counting lines"
      >
        {d.counting.series.length ? (
          <CountingTrend series={d.counting.series} data={d.counting.data} />
        ) : (
          <NoData />
        )}
      </Panel>
    ),
  },
  {
    id: "avg-stay",
    section: "Operations",
    group: "counting",
    span: 5,
    when: (d) => d.modules.counting,
    render: (d) => (
      <Panel title="Average stay" description="Seconds per object, by area">
        {d.counting.avgStay.length ? (
          <BarList
            items={d.counting.avgStay}
            format={(seconds) => `${seconds}s`}
          />
        ) : (
          <NoData />
        )}
      </Panel>
    ),
  },
  {
    id: "worker-absence",
    section: "Operations",
    group: "workforce",
    span: 6,
    when: (d) => d.modules.worker,
    render: (d) => (
      <Panel
        title="Worker absence"
        description="Time away from the area, last 24 hours"
      >
        {d.absence.areas.length ? (
          <BarList
            items={d.absence.areas.map((a) => ({
              label: `${a.area} · ${a.events} ${a.events === 1 ? "absence" : "absences"}`,
              value: a.seconds,
            }))}
            format={duration}
          />
        ) : (
          <NoData>No absences.</NoData>
        )}
      </Panel>
    ),
  },
  {
    id: "behavior",
    section: "Operations",
    group: "workforce",
    span: 6,
    when: (d) => d.modules.behavior,
    render: (d) => (
      <Panel
        title="Workplace behavior"
        description="Phone and sleep alarms, last 24 hours"
      >
        <div className="flex flex-col gap-4">
          <Stats
            items={[
              [d.behavior.phone, "Phone calls"],
              [d.behavior.sleep, "Asleep on duty"],
            ]}
          />
          {d.behavior.byCamera.length ? (
            <BarList items={d.behavior.byCamera} />
          ) : (
            <NoData>No alarms.</NoData>
          )}
        </div>
      </Panel>
    ),
  },
  {
    id: "vehicles",
    section: "Vehicles",
    group: "plates",
    span: 8,
    when: (d) => d.modules.licensePlate,
    render: (d) => (
      <Panel title="Vehicles" description="Plate reads, last 24 hours">
        {d.vehicles.total ? (
          <div className="grid gap-8 sm:grid-cols-3">
            <VehicleDonut types={d.vehicles.types} />
            <div className="flex flex-col gap-4">
              <span className="text-xs font-medium text-muted-foreground">
                Color
              </span>
              <BarList items={d.vehicles.colors} />
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-medium text-muted-foreground">
                Most seen plates
              </span>
              <BarList items={d.vehicles.topPlates} />
            </div>
          </div>
        ) : (
          <NoData />
        )}
      </Panel>
    ),
  },
  {
    id: "plates",
    section: "Vehicles",
    group: "plates",
    span: 4,
    when: (d) => d.modules.licensePlate,
    render: (d) => (
      <Panel title="License plates">
        <RecentPlates plates={d.recentPlates} deviceNames={d.deviceNames} />
      </Panel>
    ),
  },
];
