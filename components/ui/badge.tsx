import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-1 focus-visible:ring-ring has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-primary/15 text-[color-mix(in_oklch,var(--primary),var(--foreground)_35%)] [a]:hover:bg-primary/25",
        secondary:
          "bg-secondary-foreground/10 text-secondary-foreground [a]:hover:bg-secondary-foreground/15",
        destructive:
          "bg-destructive/15 text-[color-mix(in_oklch,var(--destructive),var(--foreground)_25%)] [a]:hover:bg-destructive/25",
        outline:
          "bg-muted-foreground/10 text-muted-foreground [a]:hover:bg-muted-foreground/15",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        overlay: "bg-background text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Badge = ({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) => {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
};

export { Badge, badgeVariants };
