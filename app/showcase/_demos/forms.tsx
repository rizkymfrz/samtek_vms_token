"use client"
import { SearchIcon } from "lucide-react"
import { Fragment, useState, useSyncExternalStore } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Stack } from "../_components/layout"
import {
  common,
  field,
  frameworks,
  inputGroup,
  otp,
  radio,
  slider,
} from "../_data/content"

const frameworkLabels = frameworks.map((framework) => framework.label)

export const InputDemo = () => {
  return (
    <Stack>
      <Input placeholder={common.placeholder} />
      <Input defaultValue={common.loremShort} />
      <Input disabled placeholder={common.placeholder} />
      <Input aria-invalid placeholder={common.placeholder} />
    </Stack>
  )
}

export const TextareaDemo = () => {
  return (
    <Stack>
      <Textarea placeholder={common.placeholder} />
      <Textarea disabled placeholder={common.placeholder} />
    </Stack>
  )
}

export const LabelDemo = () => {
  return (
    <Stack>
      <Label htmlFor="showcase-label-input">{field.username.label}</Label>
      <Input
        id="showcase-label-input"
        placeholder={field.username.placeholder}
      />
    </Stack>
  )
}

export const FieldDemo = () => {
  return (
    <Stack>
      <FieldSet>
        <FieldLegend>{field.title}</FieldLegend>
        <FieldDescription>{field.description}</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="showcase-field-username">
              {field.username.label}
            </FieldLabel>
            <Input
              id="showcase-field-username"
              placeholder={field.username.placeholder}
            />
            <FieldDescription>{field.username.hint}</FieldDescription>
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="showcase-field-bio">
              {field.bio.label}
            </FieldLabel>
            <Textarea
              id="showcase-field-bio"
              aria-invalid
              placeholder={field.bio.placeholder}
            />
            <FieldError>{field.error}</FieldError>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="showcase-field-terms" />
            <FieldLabel htmlFor="showcase-field-terms">
              {field.terms}
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </Stack>
  )
}

export const InputGroupDemo = () => {
  return (
    <Stack>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>{inputGroup.url.prefix}</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder={inputGroup.url.placeholder} />
        <InputGroupAddon align="inline-end">
          <InputGroupText>{inputGroup.url.suffix}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder={inputGroup.search} />
        <InputGroupAddon align="inline-end">
          <InputGroupText>{inputGroup.results}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </Stack>
  )
}

export const InputOTPDemo = () => {
  const slots = otp.groups.reduce<number[][]>((acc, size) => {
    const start = acc.flat().length
    acc.push(Array.from({ length: size }, (_, index) => start + index))
    return acc
  }, [])
  return (
    <InputOTP maxLength={otp.length}>
      {slots.map((group, groupIndex) => (
        <Fragment key={group[0]}>
          {groupIndex > 0 && <InputOTPSeparator />}
          <InputOTPGroup>
            {group.map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </Fragment>
      ))}
    </InputOTP>
  )
}

export const CheckboxDemo = () => {
  return (
    <Stack>
      <Label>
        <Checkbox defaultChecked />
        {field.terms}
      </Label>
      <Label>
        <Checkbox />
        {field.terms}
      </Label>
      <Label>
        <Checkbox disabled />
        {field.terms}
      </Label>
    </Stack>
  )
}

export const RadioGroupDemo = () => {
  return (
    <RadioGroup defaultValue={radio[0].value}>
      {radio.map((option) => (
        <Label key={option.value}>
          <RadioGroupItem value={option.value} />
          {option.label}
        </Label>
      ))}
    </RadioGroup>
  )
}

export const SwitchDemo = () => {
  return (
    <Stack>
      <Label>
        <Switch defaultChecked />
        {common.open}
      </Label>
      <Label>
        <Switch />
        {common.close}
      </Label>
      <Label>
        <Switch disabled />
        {common.loading}
      </Label>
    </Stack>
  )
}

export const SliderDemo = () => {
  return (
    <Stack>
      <Label>{slider.label}</Label>
      <Slider defaultValue={slider.value} />
      <Slider defaultValue={slider.value} disabled />
    </Stack>
  )
}

export const SelectDemo = () => {
  return (
    <Stack>
      <Select items={frameworks} defaultValue={frameworks[0].value}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {frameworks.map((framework) => (
              <SelectItem key={framework.value} value={framework.value}>
                {framework.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Stack>
  )
}

export const NativeSelectDemo = () => {
  return (
    <Stack>
      <NativeSelect defaultValue={frameworks[0].value}>
        {frameworks.map((framework) => (
          <NativeSelectOption key={framework.value} value={framework.value}>
            {framework.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Stack>
  )
}

export const ComboboxDemo = () => {
  return (
    <Stack>
      <Combobox items={frameworkLabels}>
        <ComboboxInput placeholder={common.placeholder} />
        <ComboboxContent>
          <ComboboxEmpty>{common.noResults}</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Stack>
  )
}

const subscribeNever = () => () => {}

export const CalendarDemo = () => {
  const [date, setDate] = useState<Date | undefined>()
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  if (!mounted) return null
  return <Calendar mode="single" selected={date} onSelect={setDate} />
}
