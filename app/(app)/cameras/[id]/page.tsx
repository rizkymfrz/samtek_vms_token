import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { isLiveSource } from "@/config/env";
import { CameraDetailSkeleton } from "@/features/camera-detail/components/camera-detail-skeleton";
import { CameraDetailView } from "@/features/camera-detail/components/camera-detail-view";
import { getCameraDetail } from "@/features/camera-detail/services/get-camera-detail";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

export const instant = false;
const loadDetail = cache(getCameraDetail);

export const generateMetadata = async ({
  params,
}: PageProps<"/cameras/[id]">): Promise<Metadata> => {
  await connection();
  const { id } = await params;
  const detail = await loadDetail(id).catch(() => null);
  return { title: detail?.name ?? "Camera" };
};

const Connection = async () => {
  await connection();
  return null;
};

const CameraDetailContent = async ({
  params,
  searchParams,
}: {
  params: PageProps<"/cameras/[id]">["params"];
  searchParams: PageProps<"/cameras/[id]">["searchParams"];
}) => {
  await connection();
  const { id } = await params;
  const { tab } = await searchParams;
  const detail = await redirectIfUnauthorized(loadDetail(id));
  if (!detail) notFound();
  return (
    <CameraDetailView
      detail={detail}
      isLive={isLiveSource}
      initialTab={tab === "playback" ? "playback" : "configuration"}
    />
  );
};

const Page = ({ params, searchParams }: PageProps<"/cameras/[id]">) => {
  return (
    <>
      <Suspense fallback={<CameraDetailSkeleton />}>
        <CameraDetailContent params={params} searchParams={searchParams} />
      </Suspense>
      <Suspense>
        <Connection />
      </Suspense>
    </>
  );
};

export default Page;
