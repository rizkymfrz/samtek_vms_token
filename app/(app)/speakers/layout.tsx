import { PageShell } from "@/components/layout/page-shell";
import { SpeakerNavPanel } from "@/features/speakers/components/speaker-nav-panel";

const SpeakersLayout = ({ children }: LayoutProps<"/speakers">) => {
  return (
    <PageShell>
      <SpeakerNavPanel />
      {children}
    </PageShell>
  );
};

export default SpeakersLayout;
