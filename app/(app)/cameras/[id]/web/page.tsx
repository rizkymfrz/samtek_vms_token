import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getCameraDetail } from "@/features/camera-detail";
import { CameraWebFrame } from "@/features/camera-web";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

export const instant = false;
export const metadata: Metadata = { title: "Camera web page" };

const Content = async ({
  params,
}: {
  params: PageProps<"/cameras/[id]/web">["params"];
}) => {
  await connection();
  const { id } = await params;
  const detail = await redirectIfUnauthorized(getCameraDetail(id));
  if (!detail) notFound();
  return <CameraWebFrame id={detail.id} name={detail.name} />;
};

const Page = ({ params }: PageProps<"/cameras/[id]/web">) => {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
};

export default Page;
