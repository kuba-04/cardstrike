import * as React from "react";
import { type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  underline?: boolean;
  children: React.ReactNode;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, underline = true, children, ...props }, ref) => {
    const isExternal = props.href?.startsWith("http");
    const linkClassName = cn(
      "text-primary transition-colors hover:text-primary/80",
      underline && "underline-offset-4 hover:underline",
      className
    );

    if (isExternal) {
      return (
        <a ref={ref} className={linkClassName} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    }

    return (
      <a ref={ref} className={linkClassName} {...props}>
        {children}
      </a>
    );
  }
);
Link.displayName = "Link";

export { Link };
