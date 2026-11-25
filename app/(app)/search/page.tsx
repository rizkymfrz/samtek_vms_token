import type { Metadata } from "next";
import { ObjectSearchView } from "@/features/object-search/components/object-search-view";

export const metadata: Metadata = { title: "Object search" };

const Page = () => {
  return <ObjectSearchView />;
};

export default Page;
