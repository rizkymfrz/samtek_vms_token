import {
  CctvIcon,
  ChevronDownIcon,
  MapPinIcon,
  SearchXIcon,
  ServerIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { PanelEmpty, PanelSearch } from "@/components/layout/side-panel";
import { StatusDot } from "@/components/shared/status-dot";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { deviceDot, type DeviceState } from "@/lib/device-state";
import { cn } from "@/lib/utils";

const ICON = { group: MapPinIcon, server: ServerIcon, device: CctvIcon };

export type DeviceTreeNode = {
  id: string;
  kind: keyof typeof ICON;
  title: string;
  subtitle?: ReactNode;
  state?: DeviceState;
  isSelected?: boolean;
  isMuted?: boolean;
  onSelect?: () => void;
  actions?: ReactNode;
  badge?: ReactNode;
  children?: DeviceTreeNode[];
};

const NodeButton = ({
  node,
  isTitle,
}: {
  node: DeviceTreeNode;
  isTitle?: boolean;
}) => {
  return (
    <button
      type="button"
      disabled={!node.onSelect}
      aria-pressed={node.isSelected ?? false}
      onClick={node.onSelect}
      className="flex min-w-0 flex-1 flex-col text-left outline-none enabled:hover:underline focus-visible:underline"
    >
      <span
        className={cn(
          "truncate",
          isTitle ? "text-sm font-medium" : "text-xs",
          node.isSelected && "font-medium",
          node.isMuted && "text-muted-foreground",
        )}
      >
        {node.title}
      </span>
      {node.subtitle && (
        <span className="truncate text-xs font-normal text-muted-foreground">
          {node.subtitle}
        </span>
      )}
    </button>
  );
};

const Leaf = ({ node }: { node: DeviceTreeNode }) => {
  const Icon = ICON[node.kind];
  return (
    <li className="flex items-center gap-2 py-1 pl-8">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <NodeButton node={node} />
      {node.actions}
      {node.badge}
      {node.state && <StatusDot status={deviceDot(node.state)} />}
    </li>
  );
};

const Branch = ({ node }: { node: DeviceTreeNode }) => {
  const Icon = ICON[node.kind];
  const children = node.children ?? [];
  const isNested = children.some((child) => child.children);
  return (
    <Collapsible defaultOpen className="border-b last:border-b-0">
      <div className="flex items-center gap-2 py-2">
        <CollapsibleTrigger
          aria-label={`Toggle ${node.title}`}
          className="group flex size-4 shrink-0 items-center justify-center outline-none focus-visible:text-foreground"
        >
          <ChevronDownIcon className="size-4 -rotate-90 text-muted-foreground transition-transform group-aria-expanded:rotate-0" />
        </CollapsibleTrigger>
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <NodeButton node={node} isTitle />
        {node.actions}
        {node.badge}
        {node.state && <StatusDot status={deviceDot(node.state)} />}
      </div>
      <CollapsibleContent>
        {isNested ? (
          <div className="pl-4">
            {children.map((child) => (
              <TreeItem key={child.id} node={child} />
            ))}
          </div>
        ) : (
          <ul className="flex flex-col pb-2">
            {children.map((child) => (
              <Leaf key={child.id} node={child} />
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

const TreeItem = ({ node }: { node: DeviceTreeNode }) => {
  return node.children ? (
    <Branch node={node} />
  ) : (
    <ul className="flex flex-col">
      <Leaf node={node} />
    </ul>
  );
};

export const matchesQuery = (query: string, ...fields: (string | null)[]) => {
  const needle = query.trim().toLowerCase();
  return (
    !needle ||
    fields.some((field) => field?.toLowerCase().includes(needle) ?? false)
  );
};

export const DeviceTree = ({
  nodes,
  query,
  onQuery,
  noun,
  emptyIcon = <CctvIcon />,
}: {
  nodes: DeviceTreeNode[];
  query: string;
  onQuery: (query: string) => void;
  noun: string;
  emptyIcon?: ReactNode;
}) => {
  const isSearching = query.trim() !== "";
  return (
    <>
      <PanelSearch
        value={query}
        onChange={onQuery}
        placeholder={`Search ${noun}…`}
      />
      <div className="flex flex-col">
        {nodes.map((node) => (
          <TreeItem key={node.id} node={node} />
        ))}
        {nodes.length === 0 && (
          <PanelEmpty
            icon={isSearching ? <SearchXIcon /> : emptyIcon}
            title={isSearching ? `No ${noun} found.` : `No ${noun}.`}
            description={isSearching ? "Try a different search." : undefined}
          />
        )}
      </div>
    </>
  );
};
