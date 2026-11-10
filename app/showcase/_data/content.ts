import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import type { Alert } from "@/components/ui/alert"
import type { badgeVariants } from "@/components/ui/badge"
import type { buttonVariants } from "@/components/ui/button"
import type { toggleVariants } from "@/components/ui/toggle"

type Variant<
  T extends (...args: never[]) => string,
  K extends string,
> = NonNullable<VariantProps<T>[K & keyof VariantProps<T>]>

export const page = {
  title: "Component showcase",
  description: "Every component in components/ui, rendered with its variants.",
  searchLabel: "Filter components",
  searchPlaceholder: "Search components…",
  noResults: "No component matches your search.",
  themeToggle: "Dark mode",
  navLabel: "Components",
} as const

export const groups = {
  actions: "Actions",
  forms: "Forms",
  overlays: "Overlays",
  navigation: "Navigation",
  display: "Data display",
  feedback: "Feedback",
  layout: "Layout",
  chat: "Chat & AI",
} as const

export type GroupId = keyof typeof groups

export const buttonVariantNames = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const satisfies readonly Variant<typeof buttonVariants, "variant">[]

export const buttonSizeNames = [
  "xs",
  "sm",
  "default",
  "lg",
] as const satisfies readonly Variant<typeof buttonVariants, "size">[]

export const buttonIconSizeNames = [
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const satisfies readonly Variant<typeof buttonVariants, "size">[]

export const badgeVariantNames = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const satisfies readonly Variant<typeof badgeVariants, "variant">[]

export const alertVariantNames = [
  "default",
  "destructive",
] as const satisfies readonly NonNullable<
  ComponentProps<typeof Alert>["variant"]
>[]

export const toggleVariantNames = [
  "default",
  "outline",
] as const satisfies readonly Variant<typeof toggleVariants, "variant">[]

export const toggleSizeNames = [
  "sm",
  "default",
  "lg",
] as const satisfies readonly Variant<typeof toggleVariants, "size">[]

export const bubbleVariantNames = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
] as const

export const markerVariantNames = ["default", "separator", "border"] as const

export const people = [
  {
    id: "ada",
    name: "Ada Lovelace",
    email: "ada@example.com",
    initials: "AL",
    role: "Admin",
  },
  {
    id: "alan",
    name: "Alan Turing",
    email: "alan@example.com",
    initials: "AT",
    role: "Editor",
  },
  {
    id: "grace",
    name: "Grace Hopper",
    email: "grace@example.com",
    initials: "GH",
    role: "Viewer",
  },
  {
    id: "linus",
    name: "Linus Torvalds",
    email: "linus@example.com",
    initials: "LT",
    role: "Editor",
  },
] as const

export const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "svelte", label: "SvelteKit" },
] as const

export const common = {
  open: "Open",
  close: "Close",
  cancel: "Cancel",
  confirm: "Confirm",
  continue: "Continue",
  save: "Save changes",
  delete: "Delete",
  edit: "Edit",
  copy: "Copy",
  share: "Share",
  loading: "Loading",
  placeholder: "Type something…",
  noResults: "No results found.",
  loremShort:
    "A short sentence used to fill the component with realistic text.",
  loremLong:
    "A longer paragraph that is only here to demonstrate how the component wraps, truncates and spaces real content when it grows beyond a single line.",
} as const

export const keyboardShortcuts = [
  { id: "save", keys: ["Ctrl", "S"], label: "Save" },
  { id: "search", keys: ["Ctrl", "K"], label: "Search" },
  { id: "undo", keys: ["Ctrl", "Z"], label: "Undo" },
] as const

export const accordion = [
  {
    value: "what",
    title: "What is this?",
    body: "A catalogue of every UI primitive in the project.",
  },
  {
    value: "why",
    title: "Why a showcase?",
    body: "It makes visual regressions and missing states easy to spot.",
  },
  {
    value: "how",
    title: "How is it built?",
    body: "Entries are registered once and rendered from data.",
  },
] as const

export const tabs = [
  { value: "account", label: "Account", body: "Manage your account details." },
  {
    value: "security",
    label: "Security",
    body: "Rotate passwords and review sessions.",
  },
  {
    value: "billing",
    label: "Billing",
    body: "View invoices and payment methods.",
  },
] as const

export const breadcrumb = [
  { id: "home", label: "Home", href: "#" },
  { id: "components", label: "Components", href: "#" },
] as const

export const breadcrumbCurrent = "Breadcrumb"

export const pagination = {
  previous: "Previous",
  next: "Next",
  pages: [1, 2, 3] as const,
  active: 2,
}

export const navigationMenu = [
  {
    id: "products",
    label: "Products",
    links: [
      {
        id: "cameras",
        label: "Cameras",
        description: "Edge devices and streams.",
      },
      {
        id: "analytics",
        label: "Analytics",
        description: "Detections and reports.",
      },
    ],
  },
  {
    id: "company",
    label: "Company",
    links: [
      { id: "about", label: "About", description: "Who we are." },
      { id: "careers", label: "Careers", description: "Join the team." },
    ],
  },
] as const

export const menu = {
  trigger: "Menu",
  label: "My account",
  items: [
    { id: "profile", label: "Profile", shortcut: "⇧P" },
    { id: "billing", label: "Billing", shortcut: "⌘B" },
    { id: "settings", label: "Settings", shortcut: "⌘," },
  ],
  checkbox: "Show status bar",
  radioLabel: "Density",
  radio: [
    { value: "compact", label: "Compact" },
    { value: "comfortable", label: "Comfortable" },
  ],
  subTrigger: "More tools",
  subItems: ["Save page as…", "Developer tools"],
  danger: "Sign out",
  contextArea: "Right click anywhere in this area",
} as const

export const menubar = [
  { id: "file", label: "File", items: ["New tab", "New window", "Print"] },
  { id: "edit", label: "Edit", items: ["Undo", "Redo", "Find"] },
] as const

export const commandGroups = [
  {
    id: "suggestions",
    heading: "Suggestions",
    items: ["Calendar", "Search emoji", "Calculator"],
  },
  {
    id: "settings",
    heading: "Settings",
    items: ["Profile", "Billing", "Preferences"],
  },
] as const

export const table = {
  caption: "A list of recent invoices.",
  columns: [
    { id: "invoice", label: "Invoice" },
    { id: "status", label: "Status" },
    { id: "method", label: "Method" },
    { id: "amount", label: "Amount" },
  ],
  rows: [
    { id: "INV001", status: "Paid", method: "Credit card", amount: "$250.00" },
    { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
    {
      id: "INV003",
      status: "Unpaid",
      method: "Bank transfer",
      amount: "$350.00",
    },
  ],
  total: { label: "Total", value: "$750.00" },
} as const

export const chart = {
  dataKeys: [
    { key: "desktop", label: "Desktop", color: "var(--chart-1)" },
    { key: "mobile", label: "Mobile", color: "var(--chart-3)" },
  ],
  xKey: "month",
  data: [
    { month: "Jan", desktop: 186, mobile: 80 },
    { month: "Feb", desktop: 305, mobile: 200 },
    { month: "Mar", desktop: 237, mobile: 120 },
    { month: "Apr", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
  ],
} as const

export const carousel = [1, 2, 3, 4, 5] as const

export const scrollArea = {
  tags: Array.from({ length: 24 }, (_, index) => `v1.2.${index}`),
} as const

export const progress = { label: "Uploading", value: 64 } as const
export const slider = { label: "Volume", value: [40] } as const
export const otp = { length: 6, groups: [3, 3] as const } as const

export const radio = [
  { value: "default", label: "Default" },
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
] as const

export const field = {
  title: "Profile",
  description: "This appears on your public profile.",
  username: {
    label: "Username",
    placeholder: "ada",
    hint: "Letters and numbers only.",
  },
  bio: { label: "Bio", placeholder: "Tell us about yourself" },
  error: "This field is required.",
  terms: "Accept terms and conditions",
}

export const inputGroup = {
  url: { prefix: "https://", suffix: ".com", placeholder: "example" },
  search: "Search…",
  results: "12 results",
}

export const dateRange = { label: "Pick a date" }

export const hoverCard = {
  trigger: "@nextjs",
  title: "Next.js",
  body: "The React framework for the web.",
}

export const tooltip = { trigger: "Hover me", body: "Add to library" }

export const popover = {
  trigger: "Dimensions",
  title: "Dimensions",
  body: "Set the dimensions for the layer.",
}

export const collapsible = {
  title: "3 starred repositories",
  items: ["next.js", "react", "tailwindcss"],
}

export const empty = {
  title: "No projects yet",
  description: "Get started by creating your first project.",
  action: "Create project",
}

export const alert = {
  default: {
    title: "Heads up!",
    body: "You can add components using the CLI.",
  },
  destructive: {
    title: "Error",
    body: "Your session has expired. Please log in again.",
  },
  action: "Undo",
}

export const dialog = {
  trigger: "Open dialog",
  title: "Edit profile",
  description:
    "Make changes to your profile here. Click save when you are done.",
}

export const alertDialog = {
  trigger: "Delete account",
  title: "Are you absolutely sure?",
  description:
    "This action cannot be undone. This permanently deletes your account.",
}

export const sheet = {
  trigger: "Open sheet",
  side: ["top", "right", "bottom", "left"] as const,
}

export const drawer = {
  trigger: "Open drawer",
  title: "Move goal",
  description: "Set your daily activity goal.",
}

export const toast = {
  triggers: [
    {
      id: "default",
      label: "Default",
      title: "Event created",
      description: "Friday at 9:00 AM",
    },
    {
      id: "success",
      label: "Success",
      title: "Saved",
      description: "Your changes were saved.",
    },
    {
      id: "info",
      label: "Info",
      title: "Heads up",
      description: "A new version is available.",
    },
    {
      id: "warning",
      label: "Warning",
      title: "Careful",
      description: "Storage is almost full.",
    },
    {
      id: "error",
      label: "Error",
      title: "Failed",
      description: "Could not reach the server.",
    },
  ],
} as const

export const toggleGroup = [
  { value: "bold", label: "Bold" },
  { value: "italic", label: "Italic" },
  { value: "underline", label: "Underline" },
] as const

export const item = {
  title: "Basic item",
  description: "A simple item with media, content and actions.",
  action: "Action",
}

export const cardContent = {
  title: "Create project",
  description: "Deploy your new project in one click.",
  nameLabel: "Name",
  namePlaceholder: "Name of your project",
  cancel: "Cancel",
  deploy: "Deploy",
}

export const resizable = { panels: ["One", "Two", "Three"] as const }
export const aspectRatio = { ratio: 16 / 9, label: "16 / 9" }

export const sidebar = {
  group: "Application",
  items: ["Home", "Inbox", "Calendar", "Search", "Settings"],
}

export const direction = {
  label: "Direction",
  options: ["ltr", "rtl"] as const,
  sample: "Hello, world",
}

export const spinner = { sizes: ["size-4", "size-6", "size-8"] as const }
export const skeleton = { lines: 3 }

export const chat = {
  messages: [
    {
      id: "m1",
      align: "start",
      variant: "secondary",
      author: "Assistant",
      text: "How can I help you today?",
    },
    {
      id: "m2",
      align: "end",
      variant: "default",
      author: "You",
      text: "Summarise last night's events.",
    },
    {
      id: "m3",
      align: "start",
      variant: "muted",
      author: "Assistant",
      text: "Three vehicles and two people were detected.",
    },
  ],
  reaction: "👍",
  marker: { text: "Today" },
  trace: {
    running: "Searching cameras",
    done: "Found 5 detections",
    error: "Camera 4 unreachable",
    pending: "Waiting for results",
    detail: "1.2s",
    collapsibleTitle: "Show reasoning",
    collapsibleBody: "Compared detections against the configured zones.",
  },
  attachments: [
    { id: "a1", state: "done", title: "report.pdf", description: "2.4 MB" },
    {
      id: "a2",
      state: "uploading",
      title: "clip.mp4",
      description: "Uploading…",
    },
    {
      id: "a3",
      state: "processing",
      title: "frame.png",
      description: "Processing…",
    },
    {
      id: "a4",
      state: "error",
      title: "broken.zip",
      description: "Upload failed",
    },
    { id: "a5", state: "idle", title: "drop.txt", description: "Waiting" },
  ],
  scroller: { count: 12, label: "Message", jump: "Jump to latest" },
  code: {
    title: "example.ts",
    language: "ts",
    value:
      "export function greet(name: string) {\n  return `Hello, ${name}!`\n}\n",
  },
  questionnaire: {
    items: [
      {
        name: "stack",
        title: "Which stack do you use?",
        description: "Pick one.",
        multiple: false,
        choices: [
          { value: "next", label: "Next.js", description: "React framework" },
          { value: "remix", label: "Remix", description: "Web standards" },
        ],
      },
      {
        name: "tools",
        title: "Which tools do you need?",
        description: "Pick any.",
        multiple: true,
        choices: [
          { value: "lint", label: "Linting", description: "" },
          { value: "test", label: "Testing", description: "" },
          { value: "ci", label: "CI", description: "" },
        ],
      },
    ],
    previous: "Back",
    next: "Next",
    skip: "Skip",
    submit: "Submit",
    error: "Please choose an option.",
  },
} as const
