import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('Error caught by boundary:', {
            error: error.toString(),
            errorInfo: errorInfo.componentStack,
            timestamp: new Date().toISOString()
        });

        // TODO: Send to error tracking service
        // if (import.meta.env.PROD) {
        //     Sentry.captureException(error, { extra: errorInfo });
        // }

        // Track error count to detect error loops
        this.setState(prevState => ({
            errorInfo,
            errorCount: prevState.errorCount + 1
        }), () => {
            // Check overflow inside callback with the updated state
            if (this.state.errorCount > 5) {
                console.error('Too many errors detected. Possible error loop.');
            }
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 text-center mb-4">
                            Oops! Something went wrong
                        </h1>

                        {/* Error Description */}
                        <p className="text-gray-600 text-center mb-8 text-lg">
                            We're sorry for the inconvenience. An unexpected error has occurred.
                        </p>

                        {/* Development Error Details */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                                <p className="text-sm font-mono text-red-800 mb-2">
                                    <strong>Error:</strong> {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-red-700 hover:text-red-900">
                                            View stack trace
                                        </summary>
                                        <pre className="mt-2 text-xs overflow-auto max-h-40 bg-red-100 p-2 rounded">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                            >
                                Refresh Page
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-sm text-gray-500 text-center mt-8">
                            If this problem persists, please contact support or try again later.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
