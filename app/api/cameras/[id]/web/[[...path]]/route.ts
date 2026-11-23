import { proxyCameraWeb } from "@/features/camera-web";

const proxy = async (
  request: Request,
  { params }: RouteContext<"/api/cameras/[id]/web/[[...path]]">,
) => {
  const { id, path = [] } = await params;
  return proxyCameraWeb(request, id, path);
};

export {
  proxy as DELETE,
  proxy as GET,
  proxy as HEAD,
  proxy as PATCH,
  proxy as POST,
  proxy as PUT,
};
