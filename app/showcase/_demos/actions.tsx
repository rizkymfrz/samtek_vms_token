"use client"
import { ChevronDownIcon, MailIcon, PlusIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Labelled, Row } from "../_components/layout"
import {
  badgeVariantNames,
  buttonIconSizeNames,
  buttonSizeNames,
  buttonVariantNames,
  common,
  keyboardShortcuts,
  toggleGroup,
  toggleSizeNames,
  toggleVariantNames,
} from "../_data/content"

export const ButtonDemo = () => {
  return (
    <div className="flex flex-col gap-8">
      <Labelled label="variant">
        <Row>
          {buttonVariantNames.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </Row>
      </Labelled>
      <Labelled label="size">
        <Row>
          {buttonSizeNames.map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
        </Row>
      </Labelled>
      <Labelled label="icon size">
        <Row>
          {buttonIconSizeNames.map((size) => (
            <Button key={size} size={size} variant="outline" aria-label={size}>
              <PlusIcon />
            </Button>
          ))}
        </Row>
      </Labelled>
      <Labelled label="with icon / disabled">
        <Row>
          <Button>
            <MailIcon data-icon="inline-start" />
            {common.continue}
          </Button>
          <Button variant="outline">
            {common.continue}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
          <Button disabled>{common.loading}</Button>
        </Row>
      </Labelled>
    </div>
  )
}

export const ButtonGroupDemo = () => {
  return (
    <Row>
      <ButtonGroup>
        <Button variant="outline">{common.edit}</Button>
        <Button variant="outline">{common.copy}</Button>
        <Button variant="outline">{common.share}</Button>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroupText>{common.open}</ButtonGroupText>
        <ButtonGroupSeparator />
        <Button variant="outline" size="icon" aria-label={common.open}>
          <ChevronDownIcon />
        </Button>
      </ButtonGroup>
    </Row>
  )
}

export const ToggleDemo = () => {
  return (
    <div className="flex flex-col gap-4">
      {toggleVariantNames.map((variant) => (
        <Row key={variant}>
          {toggleSizeNames.map((size) => (
            <Toggle key={size} variant={variant} size={size}>
              {variant} / {size}
            </Toggle>
          ))}
        </Row>
      ))}
    </div>
  )
}

export const ToggleGroupDemo = () => {
  return (
    <div className="flex flex-col gap-4">
      {toggleVariantNames.map((variant) => (
        <ToggleGroup key={variant} variant={variant} multiple defaultValue={[toggleGroup[0].value]}>
          {toggleGroup.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value}>
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ))}
    </div>
  )
}

export const BadgeDemo = () => {
  return (
    <Row>
      {badgeVariantNames.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </Row>
  )
}

export const KbdDemo = () => {
  return (
    <Row>
      {keyboardShortcuts.map((shortcut) => (
        <KbdGroup key={shortcut.id}>
          {shortcut.keys.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </KbdGroup>
      ))}
    </Row>
  )
}
