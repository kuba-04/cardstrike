import { type FieldValues, type UseFormReturn } from 'react-hook-form'
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from '@/components/ui/form'

interface AuthFormProps<T extends FieldValues> {
    form: UseFormReturn<T>
    onSubmit: () => Promise<void>
    children: React.ReactNode
    title: string
    description?: string
    footer?: React.ReactNode
    className?: string
    isSubmitting?: boolean
}

export function AuthForm<T extends FieldValues>({
    form,
    onSubmit,
    children,
    title,
    description,
    footer,
    className,
    isSubmitting
}: AuthFormProps<T>) {
    return (
        <Card className={cn("w-full max-w-md mx-auto", className)}>
            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit()
                }}>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        {children}
                    </CardContent>
                    {footer && <CardFooter>{footer}</CardFooter>}
                </form>
            </Form>
        </Card>
    )
} 