import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthFormProps {
    onSubmit: (data: FormData) => Promise<void>
    children: React.ReactNode
    title: string
    description?: string
    footer?: React.ReactNode
    className?: string
}

export function AuthForm({
    onSubmit,
    children,
    title,
    description,
    footer,
    className
}: AuthFormProps) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        await onSubmit(formData)
    }

    return (
        <Card className={cn("w-full max-w-md mx-auto", className)}>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
                {footer && <CardFooter>{footer}</CardFooter>}
            </form>
        </Card>
    )
} 