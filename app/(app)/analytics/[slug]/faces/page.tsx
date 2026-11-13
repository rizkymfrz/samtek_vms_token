import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { FACE_RECOGNITION_SLUG } from "@/features/analytics/lib/analytic-groups";
import { FacesSkeleton } from "@/features/faces/components/faces-skeleton";
import { FacesView } from "@/features/faces/components/faces-view";
import { getFaces } from "@/features/faces/services/get-faces";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

export const generateStaticParams = () => [{ slug: FACE_RECOGNITION_SLUG }];

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
