type AudioFocus = {
  activeId: string | null;
  available: ReadonlySet<string>;
};

const EMPTY: AudioFocus = { activeId: null, available: new Set() };

let state = EMPTY;

const listeners = new Set<() => void>();

const set = (next: AudioFocus) => {
  state = next;
  for (const listener of listeners) listener();
};

export const setAudioAvailable = (id: string, isAvailable: boolean) => {
  if (state.available.has(id) === isAvailable) return;
  const available = new Set(state.available);
  if (isAvailable) available.add(id);
  else available.delete(id);
  set({ ...state, available });
};

export const releaseAudio = (id: string) => {
  const available = new Set(state.available);
  available.delete(id);
  set({
    activeId: state.activeId === id ? null : state.activeId,
    available,
  });
};

export const setAudioActive = (id: string, isActive: boolean) => {
  if (isActive) {
    if (state.activeId !== id) set({ ...state, activeId: id });
  } else if (state.activeId === id) set({ ...state, activeId: null });
};

export const subscribeAudioFocus = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getAudioFocus = () => state;
export const getServerAudioFocus = () => EMPTY;
