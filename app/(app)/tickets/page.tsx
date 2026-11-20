import type { Metadata } from "next";
import { TicketsView } from "@/features/tickets/components/tickets-view";

export const metadata: Metadata = { title: "Tickets" };

const Page = () => {
  return <TicketsView />;
};

export default Page;
