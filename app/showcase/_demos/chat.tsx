"use client"
import {
  AlertCircleIcon,
  CheckIcon,
  FileIcon,
  LoaderIcon,
  XIcon,
} from "lucide-react"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"
import { Caption, Labelled, Row, Stack } from "../_components/layout"
import { bubbleVariantNames, chat, markerVariantNames } from "../_data/content"

type BubbleVariant = (typeof bubbleVariantNames)[number]

export const BubbleDemo = () => {
  return (
    <BubbleGroup className="max-w-md">
      {bubbleVariantNames.map((variant: BubbleVariant, index) => (
        <Bubble
          key={variant}
          variant={variant}
          align={index % 2 === 0 ? "start" : "end"}
        >
          <BubbleContent>{variant}</BubbleContent>
          {index === 0 && <BubbleReactions>{chat.reaction}</BubbleReactions>}
        </Bubble>
      ))}
    </BubbleGroup>
  )
}

export const MessageDemo = () => {
  return (
    <MessageGroup className="max-w-md">
      {chat.messages.map((message) => (
        <Message key={message.id} align={message.align}>
          <MessageAvatar>
            <Avatar size="sm">
              <AvatarFallback>{message.author.slice(0, 1)}</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>{message.author}</MessageHeader>
            <Bubble variant={message.variant} align={message.align}>
              <BubbleContent>{message.text}</BubbleContent>
            </Bubble>
            <MessageFooter>{chat.marker.text}</MessageFooter>
          </MessageContent>
        </Message>
      ))}
    </MessageGroup>
  )
}

export const MarkerDemo = () => {
  return (
    <Stack className="max-w-md">
      {markerVariantNames.map((variant) => (
        <Marker key={variant} variant={variant}>
          <MarkerIcon>
            <CheckIcon />
          </MarkerIcon>
          <MarkerContent>
            {chat.marker.text} · {variant}
          </MarkerContent>
        </Marker>
      ))}
    </Stack>
  )
}

export const TraceDemo = () => {
  const { trace } = chat
  return (
    <Trace className="max-w-md">
      <TraceLine status="running">
        <TraceIcon>
          <LoaderIcon />
        </TraceIcon>
        <TraceTitle>{trace.running}</TraceTitle>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <CheckIcon />
        </TraceIcon>
        <TraceTitle>{trace.done}</TraceTitle>
        <TraceDescription>{trace.detail}</TraceDescription>
      </TraceLine>
      <TraceLine status="error">
        <TraceIcon>
          <XIcon />
        </TraceIcon>
        <TraceTitle>{trace.error}</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceTitle>{trace.pending}</TraceTitle>
      </TraceLine>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>{trace.collapsibleTitle}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Caption>{trace.collapsibleBody}</Caption>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}

const attachmentIcons = {
  done: FileIcon,
  uploading: LoaderIcon,
  processing: LoaderIcon,
  error: AlertCircleIcon,
  idle: FileIcon,
} as const

export const AttachmentDemo = () => {
  return (
    <div className="flex flex-col gap-8">
      <Labelled label="horizontal">
        <AttachmentGroup>
          {chat.attachments.map((attachment) => {
            const Icon = attachmentIcons[attachment.state]
            return (
              <Attachment key={attachment.id} state={attachment.state}>
                <AttachmentMedia>
                  <Icon />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{attachment.title}</AttachmentTitle>
                  <AttachmentDescription>
                    {attachment.description}
                  </AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction aria-label={attachment.title}>
                    <XIcon />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            )
          })}
        </AttachmentGroup>
      </Labelled>
      <Labelled label="vertical">
        <Row>
          {chat.attachments.slice(0, 2).map((attachment) => (
            <Attachment
              key={attachment.id}
              orientation="vertical"
              state={attachment.state}
            >
              <AttachmentMedia>
                <FileIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{attachment.title}</AttachmentTitle>
                <AttachmentDescription>
                  {attachment.description}
                </AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          ))}
        </Row>
      </Labelled>
    </div>
  )
}

export const MessageScrollerDemo = () => {
  const { scroller } = chat
  const rows = Array.from({ length: scroller.count }, (_, index) => index + 1)
  return (
    <div className="h-64 w-full max-w-md border">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="flex flex-col gap-2 p-4">
              {rows.map((row) => (
                <MessageScrollerItem key={row} messageId={String(row)}>
                  <Bubble variant="muted">
                    <BubbleContent>
                      {scroller.label} {row}
                    </BubbleContent>
                  </Bubble>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton aria-label={scroller.jump} />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  )
}

export const QuestionnaireDemo = () => {
  const { questionnaire } = chat
  const items = questionnaire.items.map((item) => ({
    name: item.name,
    required: true,
    choices: item.choices.map(({ value }) => ({ value })),
  }))
  return (
    <Questionnaire items={items} shortcuts="numbers" className="max-w-md">
      <QuestionnaireProgress />
      {questionnaire.items.map((item) => (
        <QuestionnaireItem
          key={item.name}
          name={item.name}
          multiple={item.multiple}
          required
        >
          <QuestionnaireTitle>{item.title}</QuestionnaireTitle>
          <QuestionnaireDescription>
            {item.description}
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            {item.choices.map((choice) => (
              <QuestionnaireChoice key={choice.value} value={choice.value}>
                {choice.label}
                {choice.description && (
                  <QuestionnaireChoiceDescription>
                    {choice.description}
                  </QuestionnaireChoiceDescription>
                )}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>{questionnaire.error}</QuestionnaireError>
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions>
        <QuestionnairePrevious>{questionnaire.previous}</QuestionnairePrevious>
        <QuestionnaireSkip>{questionnaire.skip}</QuestionnaireSkip>
        <QuestionnaireNext>{questionnaire.next}</QuestionnaireNext>
        <QuestionnaireSubmit>{questionnaire.submit}</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  )
}

export const CodeBlockDemo = () => {
  const { code } = chat
  return (
    <CodeBlock className="max-w-md">
      <CodeBlockHeader>
        <CodeBlockTitle>{code.title}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code.value} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{code.value}</CodeBlockContent>
    </CodeBlock>
  )
}
