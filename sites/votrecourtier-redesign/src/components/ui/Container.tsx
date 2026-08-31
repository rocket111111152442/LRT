import { cn } from "@/lib/utils/cn";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  narrow?: boolean;
  as?: "div" | "section" | "header" | "footer" | "nav" | "main" | "article";
};

export function Container({ narrow, as: Tag = "div", className, ...props }: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-6 sm:px-8 lg:px-12",
        narrow ? "max-w-[46rem]" : "max-w-[88rem]",
        className,
      )}
      {...props}
    />
  );
}
