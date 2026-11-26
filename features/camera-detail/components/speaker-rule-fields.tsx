"use client";
import { useMutation } from "@tanstack/react-query";
import { PlayIcon, Volume2Icon } from "lucide-react";
import { useId } from "react";
import { Controller, type UseFormReturn, useWatch } from "react-hook-form";
import { MultiSelect } from "@/components/shared/multi-select";
import { Pick } from "@/components/shared/pick";
import { ToggleCard } from "@/components/shared/toggle-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ALARM_KIND_LABEL, alarmKindLabel } from "@/config/display-labels";
import type { ParamSpec } from "@/features/edge-status";
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

const toggled = (list: string[], item: string) =>
  list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item];

const NumberField = ({
  form,
  name,
  label,
  hint,
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
  hint?: string;
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
    {error ? (
      <FieldError>{error}</FieldError>
    ) : (
      hint && <span className="text-xs text-muted-foreground">{hint}</span>
    )}
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
    detail.isServerOnline &&
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
          <Field data-invalid={!!errors?.speakerIds}>
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
                  <ul className="flex flex-col gap-2">
                    {(speakers.data ?? []).map((speaker) => (
                      <li key={speaker.id}>
                        <label className="flex cursor-pointer items-center gap-2 text-xs">
                          <Checkbox
                            checked={field.value.includes(speaker.id)}
                            onCheckedChange={() =>
                              field.onChange(toggled(field.value, speaker.id))
                            }
                          />
                          <span>{speaker.name}</span>
                          {!speaker.isEnabled && (
                            <span className="text-muted-foreground">
                              (disabled)
                            </span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              />
            )}
            {errors?.speakerIds && (
              <FieldError>{errors.speakerIds.message}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!errors?.audioId}>
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
              hint="The audio is cut after this time."
              min={1}
              max={MAX_DURATION_SECONDS}
              error={errors?.maxDurationSeconds?.message}
            />
          </div>
          <Field data-invalid={!!errors?.kinds}>
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
          <Field>
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
            <span className="text-xs text-muted-foreground">
              Choose alarm types, labels, or both. With both, an alarm must
              match both.
            </span>
          </Field>
          <NumberField
            form={form}
            id={`${formId}-cooldown`}
            name="speakerRule.cooldownSeconds"
            label="Cooldown (seconds)"
            hint="The least time between two plays."
            min={0}
            max={MAX_COOLDOWN_SECONDS}
            error={errors?.cooldownSeconds?.message}
          />
          <Controller
            control={control}
            name="speakerRule.hasSchedule"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                Only play on a schedule
              </label>
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
                    <div className="flex flex-wrap gap-2">
                      {SPEAKER_DAYS.map((day) => (
                        <Button
                          key={day}
                          type="button"
                          size="sm"
                          variant={
                            field.value.includes(day) ? "default" : "secondary"
                          }
                          aria-pressed={field.value.includes(day)}
                          onClick={() =>
                            field.onChange(toggled(field.value, day))
                          }
                        >
                          {DAY_LABEL[day]}
                        </Button>
                      ))}
                    </div>
                  )}
                />
                {errors?.days && <FieldError>{errors.days.message}</FieldError>}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors?.start}>
                  <FieldLabel htmlFor={`${formId}-start`}>From</FieldLabel>
                  <Input
                    id={`${formId}-start`}
                    type="time"
                    aria-invalid={!!errors?.start}
                    {...form.register("speakerRule.start")}
                  />
                  {errors?.start && (
                    <FieldError>{errors.start.message}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!errors?.end}>
                  <FieldLabel htmlFor={`${formId}-end`}>Until</FieldLabel>
                  <Input
                    id={`${formId}-end`}
                    type="time"
                    aria-invalid={!!errors?.end}
                    {...form.register("speakerRule.end")}
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
                {errors?.timezone ? (
                  <FieldError>{errors.timezone.message}</FieldError>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    An end earlier than the start runs past midnight.
                  </span>
                )}
              </Field>
            </>
          )}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              disabled={!canTest}
              onClick={() => test.mutate()}
            >
              <PlayIcon />
              {test.isPending ? "Playing…" : "Test rule"}
            </Button>
            {!canTest && !test.isPending && (
              <span className="text-xs text-muted-foreground">
                {detail.speakerRule === null ||
                form.formState.dirtyFields.speakerRule
                  ? "Save the rule to test it."
                  : "The edge server is offline."}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
