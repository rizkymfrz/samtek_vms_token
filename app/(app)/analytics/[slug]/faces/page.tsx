import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import {
  FACE_RECOGNITION_SLUG,
  findAnalyticGroup,
} from "@/features/analytics/lib/analytic-groups";
import { FacesSkeleton } from "@/features/faces/components/faces-skeleton";
import { FacesView } from "@/features/faces/components/faces-view";
import { getFaces } from "@/features/faces/services/get-faces";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

export const generateStaticParams = () => [{ slug: FACE_RECOGNITION_SLUG }];

export const generateMetadata = async ({
  params,
}: PageProps<"/analytics/[slug]/faces">): Promise<Metadata> => {
  const { slug } = await params;
  const group = findAnalyticGroup(slug);
  return { title: group ? `Manage faces · ${group.title}` : "Manage faces" };
};

const FacesContent = async ({
  params,
}: {
  params: PageProps<"/analytics/[slug]/faces">["params"];
}) => {
  await connection();
  const { slug } = await params;
  if (slug !== FACE_RECOGNITION_SLUG) notFound();
  const data = await redirectIfUnauthorized(getFaces());
  return <FacesView data={data} isLive={isLiveSource} />;
};

const Page = ({ params }: PageProps<"/analytics/[slug]/faces">) => {
  return (
    <Suspense fallback={<FacesSkeleton />}>
      <FacesContent params={params} />
    </Suspense>
  );
};

export default Page;
