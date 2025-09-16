import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ReportIssueModal } from './ReportIssueModal';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Enhanced iOS-specific error logging
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
      // Log iOS-specific context
      console.error('iOS Error Context:', {
        userAgent: navigator.userAgent,
        memory: 'memory' in performance ? (performance as any).memory : null,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        devicePixelRatio: window.devicePixelRatio,
        error: error.message,
        stack: error.stack
      });
      
      // Check for common iOS Safari issues
      if (error.message.includes('out of memory') || 
          error.message.includes('Maximum call stack') ||
          error.name === 'RangeError') {
        console.warn('Detected iOS Safari memory issue');
      }
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. 
                {this.isIOSMemoryError() && (
                  <> This appears to be a memory-related issue on iOS. Try closing other browser tabs and refreshing.</>
                )}
                {!this.isIOSMemoryError() && (
                  <> You can try refreshing the page or report this issue to help us fix it.</>
                )}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-2 rounded">
                  <summary className="cursor-pointer mb-2">Error Details (Development)</summary>
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                
                <ReportIssueModal>
                  <Button variant="outline" className="flex-1">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </ReportIssueModal>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }

  private isIOSMemoryError(): boolean {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (!isIOS || !this.state.error) return false;
    
    const errorMessage = this.state.error.message.toLowerCase();
    return errorMessage.includes('out of memory') || 
           errorMessage.includes('maximum call stack') ||
           this.state.error.name === 'RangeError';
  }
}