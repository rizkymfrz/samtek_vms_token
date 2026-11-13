let page = 0;

const listeners = new Set<() => void>();

export const subscribeOverviewPage = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getOverviewPage = () => page;
export const getServerOverviewPage = () => 0;

export const setOverviewPage = (next: number) => {
  if (next === page) return;
  page = next;
  for (const listener of listeners) listener();
};
