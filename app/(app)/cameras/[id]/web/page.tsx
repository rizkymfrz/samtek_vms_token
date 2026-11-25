import { CctvOffIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { getCameraDetail } from "@/features/camera-detail";
import { CameraWebFrame, getWebTarget } from "@/features/camera-web";
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
  if (!(await getWebTarget(id))) {
    return (
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <EmptyState
          icon={<CctvOffIcon />}
          title="No web page"
          description={`${detail.name} has no web page to open.`}
        />
      </div>
    );
  }
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
