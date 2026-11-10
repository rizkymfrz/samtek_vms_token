export const NoData = ({
  children = "No detections in the last 24 hours.",
}: {
  children?: React.ReactNode;
}) => {
  return (
    <p className="py-8 text-center text-xs text-muted-foreground">{children}</p>
  );
};
