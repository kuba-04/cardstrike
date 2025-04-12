import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-4 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <h2 className="text-2xl font-semibold">Something went wrong</h2>
                    <p className="text-muted-foreground max-w-md">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <Button onClick={this.handleRetry} size="lg">
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
} 