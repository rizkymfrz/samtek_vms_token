import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { BreadcrumbTitle } from "@/components/shared/breadcrumb-title";
import { Button } from "@/components/ui/button";
import { analyticLabel } from "@/config/analytics-catalog";
import type { AnalyticGroup } from "../lib/analytic-groups";

export const AnalyticDetailView = ({ group }: { group: AnalyticGroup }) => {
  const Icon = group.icon;
  return (
    <div className="flex flex-col gap-4 p-4">
      <BreadcrumbTitle href={`/analytics/${group.slug}`} label={group.title} />
      <div>
        <Button
          variant="secondary"
          size="sm"
          nativeButton={false}
          render={<Link href="/analytics" />}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Analytics
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Icon className="size-8 text-primary" aria-hidden />
        <div className="flex flex-col">
          <h1 className="font-heading text-sm font-medium">{group.title}</h1>
          <p className="text-xs text-muted-foreground">{group.description}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Covers {group.analyticIds.map(analyticLabel).join(", ")}.
      </p>
    </div>
  );
};
