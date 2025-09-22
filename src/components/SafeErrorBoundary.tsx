import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { isIOSDevice, isIOSSafari, getIOSContext, logIOSError } from '@/utils/iosDetection';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level: 'page' | 'section' | 'component';
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class SafeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logIOSError(error, `${this.props.name} (${this.props.level})`);
    
    this.setState({ error, errorInfo });

    // Auto-retry for iOS Safari connection issues
    if (isIOSSafari() && this.state.retryCount < 2) {
      const isConnectionError = error.message.includes('NetworkError') || 
                               error.message.includes('fetch') ||
                               error.message.includes('AbortError');
      
      if (isConnectionError) {
        setTimeout(() => {
          this.setState(prev => ({ 
            hasError: false, 
            error: null, 
            errorInfo: null,
            retryCount: prev.retryCount + 1 
          }));
        }, 1000);
      }
    }
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: this.state.retryCount + 1 
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Component-level errors get minimal fallback
      if (this.props.level === 'component') {
        return this.props.fallback || (
          <div className="p-2 text-center text-muted-foreground">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
            <p className="text-xs">Component unavailable</p>
            <Button size="sm" variant="ghost" onClick={this.handleRetry} className="mt-1">
              Retry
            </Button>
          </div>
        );
      }

      // Section-level errors get more context
      if (this.props.level === 'section') {
        return this.props.fallback || (
          <Card className="m-4">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-warning" />
              <p className="text-sm text-muted-foreground mb-3">
                {this.props.name} temporarily unavailable
              </p>
              <Button size="sm" onClick={this.handleRetry}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        );
      }

      // Page-level errors get full error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {isIOSDevice() ? 'iOS Loading Issue' : 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {isIOSSafari() ? (
                  <>Having trouble loading on iOS Safari. This can happen with poor connectivity or background app limits.</>
                ) : (
                  <>We're sorry, but something unexpected happened while loading {this.props.name}.</>
                )}
              </p>
              
              {navigator.onLine ? (
                <div className="flex items-center gap-2 text-success text-sm">
                  <Wifi className="h-4 w-4" />
                  Connected to internet
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <WifiOff className="h-4 w-4" />
                  No internet connection
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button variant="outline" onClick={this.handleReload} className="flex-1">
                  Reload Page
                </Button>
              </div>
              
              {isIOSDevice() && (
                <p className="text-xs text-muted-foreground">
                  iOS tip: Try closing other Safari tabs or using Chrome browser
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}