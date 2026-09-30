import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
}

/** Max 1280px content column with fluid 16→32px gutters (`container-site`). */
export function Container({ as: Tag = "div", className, children, id }: ContainerProps) {
  return (
    <Tag id={id} className={cn("container-site", className)}>
      {children}
    </Tag>
  );
}
