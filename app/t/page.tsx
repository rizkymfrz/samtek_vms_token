import type { Metadata } from "next";
import { TicketLinkView } from "@/features/tickets/components/ticket-link-view";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "Ticket",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const Page = () => {
  return (
    <QueryProvider>
      <TicketLinkView />
    </QueryProvider>
  );
};

export default Page;
