import { BrandLogo } from "./brand-logo";
import { ThemeSwitcher } from "./theme-switcher";
import { WindowControls } from "./window-controls";

export const AuthHeader = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-(--header-height) items-center gap-2 px-4">
      <BrandLogo className="size-6" />
      <span className="font-semibold tracking-wide">SAMTEK</span>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
        <WindowControls />
      </div>
    </header>
  );
};
