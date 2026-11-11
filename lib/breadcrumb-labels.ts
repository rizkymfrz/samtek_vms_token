type Labels = Readonly<Record<string, string>>;

const EMPTY: Labels = {};

let labels = EMPTY;

const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

export const subscribeBreadcrumbLabels = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getBreadcrumbLabels = () => labels;
export const getServerBreadcrumbLabels = () => EMPTY;

export const setBreadcrumbLabel = (href: string, label: string) => {
  if (labels[href] === label) return;
  labels = { ...labels, [href]: label };
  emit();
};

export const clearBreadcrumbLabel = (href: string) => {
  if (!(href in labels)) return;
  labels = Object.fromEntries(
    Object.entries(labels).filter(([key]) => key !== href),
  );
  emit();
};
