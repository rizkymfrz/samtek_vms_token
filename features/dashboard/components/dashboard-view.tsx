import { isShown, SECTIONS, WIDGETS } from "./widgets";
import { packRows } from "../lib/layout";
import type { Dashboard } from "../services/build-dashboard";

export const DashboardView = ({ data }: { data: Dashboard }) => {
  const visible = WIDGETS.filter(
    (widget) => isShown(widget) && widget.when(data),
  );
  return (
    <div className="flex min-h-full flex-col gap-8 p-4">
      {SECTIONS.map((section) => {
        const inSection = visible.filter(
          (widget) => widget.section === section,
        );
        if (inSection.length === 0) return null;
        const groups = [...new Set(inSection.map((widget) => widget.group))];
        const rows = groups.flatMap((group) =>
          packRows(inSection.filter((widget) => widget.group === group)),
        );
        return (
          <section key={section} className="flex flex-1 flex-col gap-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              {section}
            </h2>
            {rows.map((row) => (
              <div
                key={row.map((widget) => widget.id).join()}
                className="flex flex-1 flex-wrap gap-4"
              >
                {row.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex min-w-0 flex-1 basis-72 flex-col *:flex-1"
                  >
                    {widget.render(data)}
                  </div>
                ))}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
};
