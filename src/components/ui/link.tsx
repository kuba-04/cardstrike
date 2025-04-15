import * as React from "react"
import { type AnchorHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    className?: string
    underline?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
    ({ className, underline = true, ...props }, ref) => {
        const isExternal = props.href?.startsWith("http")
        const linkClassName = cn(
            "text-primary transition-colors hover:text-primary/80",
            underline && "underline-offset-4 hover:underline",
            className
        )

        if (isExternal) {
            return (
                <a
                    ref={ref}
                    className={linkClassName}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                />
            )
        }

        return <a ref={ref} className={linkClassName} {...props} />
    }
)
Link.displayName = "Link"

export { Link } 