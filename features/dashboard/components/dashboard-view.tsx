import { SECTIONS, WIDGETS } from "./widgets";
import { packRows, spanClass } from "../lib/layout";
import type { Dashboard } from "../services/build-dashboard";

export const DashboardView = ({ data }: { data: Dashboard }) => {
  const visible = WIDGETS.filter((widget) => widget.when(data));
  return (
    <div className="flex flex-col gap-8 p-4">
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
          <section key={section} className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              {section}
            </h2>
            {rows.map((row) => (
              <div
                key={row.map((widget) => widget.id).join()}
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-12"
              >
                {row.map((widget) => (
                  <div
                    key={widget.id}
                    className={`flex min-w-0 flex-col ${spanClass(widget.cols)}`}
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
