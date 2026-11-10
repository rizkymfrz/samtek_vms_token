"use client"
import * as React from "react"
import { InboxIcon, InfoIcon, TriangleAlertIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DirectionProvider } from "@/components/ui/direction"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast as toastManager, Toaster } from "@/components/ui/toast"
import { Labelled, Row, Stack } from "../_components/layout"
import {
  alert,
  alertVariantNames,
  aspectRatio,
  cardContent,
  carousel,
  chart,
  common,
  direction,
  empty,
  item,
  people,
  progress,
  resizable,
  scrollArea,
  skeleton,
  spinner,
  table,
  toast,
} from "../_data/content"

const chartConfig = Object.fromEntries(
  chart.dataKeys.map(({ key, label, color }) => [key, { label, color }])
) satisfies ChartConfig

export const CardDemo = () => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{cardContent.title}</CardTitle>
        <CardDescription>{cardContent.description}</CardDescription>
        <CardAction>
          <Button variant="ghost" size="xs">
            {common.edit}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Label htmlFor="showcase-card-name">{cardContent.nameLabel}</Label>
        <Input id="showcase-card-name" placeholder={cardContent.namePlaceholder} />
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline">{cardContent.cancel}</Button>
        <Button>{cardContent.deploy}</Button>
      </CardFooter>
    </Card>
  )
}

export const TableDemo = () => {
  return (
    <Table>
      <TableCaption>{table.caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {table.columns.map((column) => (
            <TableHead key={column.id}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {table.rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell>{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={table.columns.length - 1}>{table.total.label}</TableCell>
          <TableCell>{table.total.value}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export const AvatarDemo = () => {
  const sizes = ["sm", "default", "lg"] as const
  return (
    <div className="flex flex-col gap-4">
      <Row>
        {sizes.map((size) => (
          <Avatar key={size} size={size}>
            <AvatarFallback>{people[0].initials}</AvatarFallback>
            <AvatarBadge />
          </Avatar>
        ))}
      </Row>
      <AvatarGroup>
        {people.slice(0, 3).map((person) => (
          <Avatar key={person.id}>
            <AvatarFallback>{person.initials}</AvatarFallback>
          </Avatar>
        ))}
        <AvatarGroupCount>+{people.length - 3}</AvatarGroupCount>
      </AvatarGroup>
    </div>
  )
}

export const ItemDemo = () => {
  return (
    <ItemGroup className="max-w-md">
      {people.slice(0, 3).map((person, index) => (
        <React.Fragment key={person.id}>
          {index > 0 && <ItemSeparator />}
          <Item variant="outline">
            <ItemMedia variant="icon">
              <InboxIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{person.name}</ItemTitle>
              <ItemDescription>{person.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="xs" variant="outline">
                {item.action}
              </Button>
            </ItemActions>
          </Item>
        </React.Fragment>
      ))}
    </ItemGroup>
  )
}

export const EmptyDemo = () => {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>{empty.title}</EmptyTitle>
        <EmptyDescription>{empty.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>{empty.action}</Button>
      </EmptyContent>
    </Empty>
  )
}

export const SeparatorDemo = () => {
  return (
    <Stack>
      <Separator />
      <div className="flex h-8 items-center gap-4 text-sm">
        {people.slice(0, 3).map((person, index) => (
          <React.Fragment key={person.id}>
            {index > 0 && <Separator orientation="vertical" />}
            <span>{person.role}</span>
          </React.Fragment>
        ))}
      </div>
    </Stack>
  )
}

export const SkeletonDemo = () => {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: skeleton.lines }, (_, index) => (
          <Skeleton key={index} className="h-4 w-48" />
        ))}
      </div>
    </div>
  )
}

export const ProgressDemo = () => {
  return (
    <Stack>
      <Progress value={progress.value}>
        <ProgressLabel>{progress.label}</ProgressLabel>
        <ProgressValue />
      </Progress>
    </Stack>
  )
}

export const SpinnerDemo = () => {
  return (
    <Row>
      {spinner.sizes.map((size) => (
        <Spinner key={size} className={size} />
      ))}
    </Row>
  )
}

export const AspectRatioDemo = () => {
  return (
    <div className="w-full max-w-sm">
      <AspectRatio ratio={aspectRatio.ratio} className="flex items-center justify-center bg-muted">
        <span className="text-sm text-muted-foreground">{aspectRatio.label}</span>
      </AspectRatio>
    </div>
  )
}

export const ScrollAreaDemo = () => {
  return (
    <ScrollArea className="h-48 w-48 border">
      <div className="flex flex-col gap-2 p-4">
        {scrollArea.tags.map((tag) => (
          <span key={tag} className="text-sm">
            {tag}
          </span>
        ))}
      </div>
    </ScrollArea>
  )
}

export const CarouselDemo = () => {
  return (
    <div className="w-full max-w-xs px-8">
      <Carousel>
        <CarouselContent>
          {carousel.map((slide) => (
            <CarouselItem key={slide}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center text-3xl font-semibold">
                  {slide}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export const ChartDemo = () => {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full max-w-lg">
      <BarChart data={chart.data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.dataKeys.map(({ key }) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

export const ResizableDemo = () => {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-32 max-w-md border">
      {resizable.panels.map((label, index) => (
        <React.Fragment key={label}>
          {index > 0 && <ResizableHandle withHandle />}
          <ResizablePanel defaultSize={100 / resizable.panels.length}>
            <div className="flex h-full items-center justify-center text-sm">{label}</div>
          </ResizablePanel>
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  )
}

export const AlertDemo = () => {
  const icons = { default: InfoIcon, destructive: TriangleAlertIcon } as const
  return (
    <Stack className="max-w-md">
      {alertVariantNames.map((variant) => {
        const Icon = icons[variant]
        const copy = alert[variant]
        return (
          <Alert key={variant} variant={variant}>
            <Icon />
            <AlertTitle>{copy.title}</AlertTitle>
            <AlertDescription>{copy.body}</AlertDescription>
            <AlertAction>
              <Button size="xs" variant="outline">
                {alert.action}
              </Button>
            </AlertAction>
          </Alert>
        )
      })}
    </Stack>
  )
}

export const ToastDemo = () => {
  return (
    <Toaster>
      <Row>
        {toast.triggers.map(({ id, label, title, description }) => (
          <Button
            key={id}
            variant="outline"
            onClick={() =>
              toastManager.add({
                title,
                description,
                type: id === "default" ? undefined : id,
              })
            }
          >
            {label}
          </Button>
        ))}
      </Row>
    </Toaster>
  )
}

export const DirectionDemo = () => {
  return (
    <Row>
      {direction.options.map((dir) => (
        <DirectionProvider key={dir} direction={dir}>
          <Labelled label={`${direction.label}: ${dir}`}>
            <p dir={dir} className="border px-4 py-2 text-sm">
              {direction.sample}
            </p>
          </Labelled>
        </DirectionProvider>
      ))}
    </Row>
  )
}
