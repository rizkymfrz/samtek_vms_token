import { ToggleRightIcon, UserCheckIcon, UserXIcon } from "lucide-react";
import type { ReactNode } from "react";
import { MultiSelect } from "@/components/shared/multi-select";
import { Pick } from "@/components/shared/pick";
import { TimePicker } from "@/components/shared/time-picker";
import { ToggleCard } from "@/components/shared/toggle-card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { ParamSpec } from "@/features/edge-status";
import type { AnalyticParams, ParamValue } from "@/lib/api/analytic-params";
import { paramError, paramLabel, setParam } from "../lib/edit-analytic-params";

const DEFAULT = "__default";

const DEFAULT_HINT = {
  icon: <ToggleRightIcon />,
  description: "Turn this option on or off.",
};

const BOOLEAN_HINTS: Record<string, { icon: ReactNode; description: string }> =
  {
    recognized_alarm: {
      icon: <UserCheckIcon />,
      description: "Raise an alarm when a known face is recognized.",
    },
    stranger_alarm: {
      icon: <UserXIcon />,
      description: "Raise an alarm when an unknown face is seen.",
    },
  };

const fallbackText = (spec: ParamSpec) =>
  spec.fallback === null ? "" : String(spec.fallback);

const ListControl = ({
  spec,
  value,
  onChange,
}: {
  spec: ParamSpec;
  value: string[];
  onChange: (value: ParamValue | undefined) => void;
}) => {
  if (spec.options.length > 0) {
    return (
      <MultiSelect options={spec.options} value={value} onChange={onChange} />
    );
  }
  return (
    <Input
      placeholder="Comma separated"
      value={value.join(", ")}
      onChange={(event) =>
        onChange(
          event.target.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }
    />
  );
};

const Control = ({
  spec,
  id,
  value,
  onChange,
}: {
  spec: ParamSpec;
  id: string;
  value: ParamValue | undefined;
  onChange: (value: ParamValue | undefined) => void;
}) => {
  const isInvalid = paramError(spec, value) !== null;
  switch (spec.kind) {
    case "boolean": {
      const hint = BOOLEAN_HINTS[spec.key] ?? DEFAULT_HINT;
      return (
        <ToggleCard
          id={id}
          icon={hint.icon}
          label={paramLabel(spec.key)}
          description={hint.description}
          checked={typeof value === "boolean" ? value : spec.fallback === true}
          onCheckedChange={onChange}
        />
      );
    }
    case "range": {
      const current =
        typeof value === "number"
          ? value
          : typeof spec.fallback === "number"
            ? spec.fallback
            : (spec.min ?? 0);
      return (
        <div className="flex items-center gap-4">
          <Slider
            aria-label={paramLabel(spec.key)}
            min={spec.min ?? 0}
            max={spec.max ?? 100}
            step={1}
            value={[current]}
            onValueChange={(next) =>
              onChange(Array.isArray(next) ? next[0] : next)
            }
          />
          <span className="w-8 text-right text-xs tabular-nums">{current}</span>
        </div>
      );
    }
    case "integer":
    case "number":
      return (
        <Input
          id={id}
          type="number"
          min={spec.min ?? undefined}
          max={spec.max ?? undefined}
          step={spec.kind === "integer" ? 1 : "any"}
          placeholder={fallbackText(spec)}
          aria-invalid={isInvalid}
          value={typeof value === "number" ? value : ""}
          onChange={(event) =>
            onChange(
              event.target.value === ""
                ? undefined
                : Number(event.target.value),
            )
          }
        />
      );
    case "time":
      return (
        <TimePicker
          label={paramLabel(spec.key)}
          value={typeof value === "string" ? value : fallbackText(spec)}
          onChange={onChange}
        />
      );
    case "choice":
      return (
        <Pick
          label={paramLabel(spec.key)}
          className="w-full"
          items={[
            {
              value: DEFAULT,
              label:
                spec.fallback === null
                  ? "Default"
                  : `Default (${fallbackText(spec)})`,
            },
            ...spec.options.map((option) => ({ value: option, label: option })),
          ]}
          value={typeof value === "string" ? value : DEFAULT}
          onChange={(next) => onChange(next === DEFAULT ? undefined : next)}
        />
      );
    case "list":
      return (
        <ListControl
          spec={spec}
          value={
            Array.isArray(value)
              ? value
              : Array.isArray(spec.fallback)
                ? spec.fallback
                : []
          }
          onChange={onChange}
        />
      );
    case "date":
    case "datetime":
      return (
        <Input
          id={id}
          type={spec.kind === "date" ? "date" : "datetime-local"}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value || undefined)}
        />
      );
    default:
      return (
        <Input
          id={id}
          placeholder={fallbackText(spec)}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value || undefined)}
        />
      );
  }
};

export const AnalyticParamFields = ({
  specs,
  params,
  idPrefix,
  onChange,
}: {
  specs: ParamSpec[];
  params: AnalyticParams;
  idPrefix: string;
  onChange: (params: AnalyticParams) => void;
}) => {
  return specs.map((spec) => {
    const id = `${idPrefix}-${spec.key}`;
    const error = paramError(spec, params[spec.key]);
    const isInline = spec.kind === "boolean";
    return (
      <Field key={spec.key} data-invalid={error !== null}>
        {!isInline && (
          <FieldLabel htmlFor={id}>{paramLabel(spec.key)}</FieldLabel>
        )}
        <Control
          spec={spec}
          id={id}
          value={params[spec.key]}
          onChange={(value) => onChange(setParam(params, spec.key, value))}
        />
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  });
};
