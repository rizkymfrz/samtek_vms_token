export type SamtekDesktop = {
  minimize: () => void;
  toggleFullscreen: () => void;
  close: () => void;
  isFullscreen: () => Promise<boolean>;
  onFullscreenChange: (listener: (value: boolean) => void) => () => void;
};

declare global {
  interface Window {
    samtekDesktop?: SamtekDesktop;
  }
}
