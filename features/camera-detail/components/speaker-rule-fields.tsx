"use client";
import { useMutation } from "@tanstack/react-query";
import { CalendarClockIcon, PlayIcon, Volume2Icon } from "lucide-react";
import { useId } from "react";
import { Controller, type UseFormReturn, useWatch } from "react-hook-form";
import { MultiSelect } from "@/components/shared/multi-select";
import { Pick } from "@/components/shared/pick";
import { TimePicker } from "@/components/shared/time-picker";
import { ToggleCard } from "@/components/shared/toggle-card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ALARM_KIND_LABEL, alarmKindLabel } from "@/config/display-labels";
import { type ParamSpec, useServerOnline } from "@/features/edge-status";
import {
  testSpeakerRule,
  useEdgeSpeakers,
  useSpeakerAudio,
} from "@/features/speakers";
import {
  MAX_COOLDOWN_SECONDS,
  MAX_DURATION_SECONDS,
  MAX_REPEAT_COUNT,
  SPEAKER_DAYS,
} from "@/lib/api/speaker-rule";
import { messageOf } from "@/lib/axios/browser-client";
import { labelOptions } from "./search-index-fields";
import type { DetailDraft } from "../lib/detail-draft";
import type { CameraDetail } from "../types";

const NO_AUDIO = "none";

const DAY_LABEL: Record<(typeof SPEAKER_DAYS)[number], string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const NumberField = ({
  form,
  name,
  label,
  min,
  max,
  error,
  id,
}: {
  form: UseFormReturn<DetailDraft>;
  name:
    | "speakerRule.repeatCount"
    | "speakerRule.maxDurationSeconds"
    | "speakerRule.cooldownSeconds";
  label: string;
  min: number;
  max: number;
  error?: string;
  id: string;
}) => (
  <Field data-invalid={!!error}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          value={Number.isNaN(field.value) ? "" : String(field.value)}
          aria-invalid={!!error}
          onChange={(event) => field.onChange(event.target.valueAsNumber)}
        />
      )}
    />
    {error && <FieldError>{error}</FieldError>}
  </Field>
);

export const SpeakerRuleFields = ({
  detail,
  form,
  specs,
}: {
  detail: CameraDetail;
  form: UseFormReturn<DetailDraft>;
  specs: ParamSpec[];
}) => {
  const formId = useId();
  const { control } = form;
  const rule = useWatch({ control, name: "speakerRule" });
  const params = useWatch({ control, name: "analyticParams" });
  const serverOnline = useServerOnline();
  const speakers = useEdgeSpeakers(detail.edgeServerId);
  const audio = useSpeakerAudio();
  const test = useMutation({
    mutationFn: () => testSpeakerRule(detail.edgeServerId, detail.id),
    onSuccess: (calls) => {
      const played = calls.filter((call) => call.status === "success").length;
      const failed = calls.find((call) => call.status !== "success");
      toast.add({
        title:
          played === calls.length
            ? `The rule played on ${played} ${played === 1 ? "speaker" : "speakers"}`
            : `The rule played on ${played} of ${calls.length} speakers`,
        description: failed?.reason ?? failed?.status,
        type: played === calls.length ? "success" : "warning",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Failed to test the rule",
        description: messageOf(error),
        type: "error",
      }),
  });
  if (detail.speakerRule === undefined) return null;
  const errors = form.formState.errors.speakerRule;
  const files = (audio.data?.audios ?? []).filter(
    (item) => item.edgeId === detail.edgeServerId,
  );
  const audioItems = [
    { value: NO_AUDIO, label: "Select an audio file" },
    ...files.map((item) => ({ value: item.id, label: item.name })),
  ];
  if (rule.audioId && !files.some((item) => item.id === rule.audioId)) {
    audioItems.push({
      value: rule.audioId,
      label: audio.isPending ? "Loading…" : `Unknown file (ID ${rule.audioId})`,
    });
  }
  const speakerById = new Map(
    (speakers.data ?? []).map((item) => [item.id, item]),
  );
  const kindOptions = [
    ...new Set([...Object.keys(ALARM_KIND_LABEL), ...rule.kinds]),
  ];
  const labels = [...new Set([...labelOptions(specs, params), ...rule.labels])];
  const applyError =
    detail.applyError?.field?.startsWith("speaker_rule") === true
      ? detail.applyError.message
      : null;
  const canTest =
    detail.speakerRule !== null &&
    !form.formState.dirtyFields.speakerRule &&
    serverOnline(
      { id: detail.edgeServerId, isActive: detail.isServerActive },
      detail.isServerOnline,
    ) &&
    !test.isPending;
  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={control}
        name="speakerRule.isOn"
        render={({ field }) => (
          <ToggleCard
            id={`${formId}-speaker`}
            icon={<Volume2Icon />}
            label="Speaker"
            description="Play an audio file on the speakers of this edge server when an alarm matches."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      {applyError && (
        <span role="alert" className="text-xs text-destructive">
          {applyError}
        </span>
      )}
      {rule.isOn && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Field
              data-invalid={!!errors?.speakerIds}
              className="min-w-0 flex-1"
            >
              <FieldLabel>Speakers</FieldLabel>
              {speakers.isError ? (
                <span className="text-xs text-muted-foreground">
                  You do not have permission to view speakers.
                </span>
              ) : (speakers.data ?? []).length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  {speakers.isPending
                    ? "Loading speakers…"
                    : "This edge server has no speakers. Add one on the Speakers page."}
                </span>
              ) : (
                <Controller
                  control={control}
                  name="speakerRule.speakerIds"
                  render={({ field }) => (
                    <MultiSelect
                      options={(speakers.data ?? []).map((item) => item.id)}
                      format={(id) => {
                        const speaker = speakerById.get(id);
                        if (!speaker) return id;
                        return speaker.isEnabled
                          ? speaker.name
                          : `${speaker.name} (disabled)`;
                      }}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add speaker…"
                    />
                  )}
                />
              )}
              {errors?.speakerIds && (
                <FieldError>{errors.speakerIds.message}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors?.audioId} className="min-w-0 flex-1">
              <FieldLabel>Audio file</FieldLabel>
              <Controller
                control={control}
                name="speakerRule.audioId"
                render={({ field }) => (
                  <Pick
                    label="Audio file"
                    items={audioItems}
                    value={field.value || NO_AUDIO}
                    onChange={(value) =>
                      field.onChange(value === NO_AUDIO ? "" : value)
                    }
                    className="w-full"
                  />
                )}
              />
              {errors?.audioId ? (
                <FieldError>{errors.audioId.message}</FieldError>
              ) : (
                files.length === 0 &&
                !audio.isPending && (
                  <span className="text-xs text-muted-foreground">
                    Upload an audio file on the Speakers page first.
                  </span>
                )
              )}
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              form={form}
              id={`${formId}-repeat`}
              name="speakerRule.repeatCount"
              label="Repeat"
              min={1}
              max={MAX_REPEAT_COUNT}
              error={errors?.repeatCount?.message}
            />
            <NumberField
              form={form}
              id={`${formId}-duration`}
              name="speakerRule.maxDurationSeconds"
              label="Maximum duration (seconds)"
              min={1}
              max={MAX_DURATION_SECONDS}
              error={errors?.maxDurationSeconds?.message}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors?.kinds} className="min-w-0">
              <FieldLabel>Alarm types</FieldLabel>
              <Controller
                control={control}
                name="speakerRule.kinds"
                render={({ field }) => (
                  <MultiSelect
                    options={kindOptions}
                    format={(kind) => alarmKindLabel(kind)}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add alarm type…"
                  />
                )}
              />
              {errors?.kinds && <FieldError>{errors.kinds.message}</FieldError>}
            </Field>
            <Field className="min-w-0">
              <FieldLabel>Labels</FieldLabel>
              <Controller
                control={control}
                name="speakerRule.labels"
                render={({ field }) => (
                  <MultiSelect
                    options={labels}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add label…"
                  />
                )}
              />
            </Field>
          </div>
          <NumberField
            form={form}
            id={`${formId}-cooldown`}
            name="speakerRule.cooldownSeconds"
            label="Cooldown (seconds)"
            min={0}
            max={MAX_COOLDOWN_SECONDS}
            error={errors?.cooldownSeconds?.message}
          />
          <Controller
            control={control}
            name="speakerRule.hasSchedule"
            render={({ field }) => (
              <ToggleCard
                id={`${formId}-schedule`}
                icon={<CalendarClockIcon />}
                label="Only play on a schedule"
                description="Play only on the chosen days and times."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          {rule.hasSchedule && (
            <>
              <Field data-invalid={!!errors?.days}>
                <FieldLabel>Days</FieldLabel>
                <Controller
                  control={control}
                  name="speakerRule.days"
                  render={({ field }) => (
                    <MultiSelect
                      options={[...SPEAKER_DAYS]}
                      format={(day) =>
                        DAY_LABEL[day as (typeof SPEAKER_DAYS)[number]]
                      }
                      value={field.value}
                      onChange={(days) =>
                        field.onChange(
                          SPEAKER_DAYS.filter((day) => days.includes(day)),
                        )
                      }
                      placeholder="Add day…"
                    />
                  )}
                />
                {errors?.days && <FieldError>{errors.days.message}</FieldError>}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors?.start}>
                  <FieldLabel>From</FieldLabel>
                  <Controller
                    control={control}
                    name="speakerRule.start"
                    render={({ field }) => (
                      <TimePicker
                        label="From"
                        hasSeconds={false}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors?.start && (
                    <FieldError>{errors.start.message}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!errors?.end}>
                  <FieldLabel>Until</FieldLabel>
                  <Controller
                    control={control}
                    name="speakerRule.end"
                    render={({ field }) => (
                      <TimePicker
                        label="Until"
                        hasSeconds={false}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors?.end && <FieldError>{errors.end.message}</FieldError>}
                </Field>
              </div>
              <Field data-invalid={!!errors?.timezone}>
                <FieldLabel htmlFor={`${formId}-timezone`}>
                  Time zone
                </FieldLabel>
                <Input
                  id={`${formId}-timezone`}
                  autoComplete="off"
                  placeholder="e.g. Asia/Jakarta"
                  aria-invalid={!!errors?.timezone}
                  {...form.register("speakerRule.timezone")}
                />
                {errors?.timezone && (
                  <FieldError>{errors.timezone.message}</FieldError>
                )}
              </Field>
            </>
          )}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={!canTest}
            onClick={() => test.mutate()}
          >
            <PlayIcon />
            {test.isPending ? "Playing…" : "Test rule"}
          </Button>
        </>
      )}
    </div>
  );
};
