import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';

interface StaticFallbackProps {
  error?: Error;
  context?: string;
}

export const StaticFallback: React.FC<StaticFallbackProps> = ({ error, context }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '2rem',
        backgroundColor: '#ffffff'
      }}>
        <AlertTriangle 
          style={{ 
            width: '48px', 
            height: '48px', 
            color: '#ef4444',
            margin: '0 auto 1rem'
          }} 
        />
        
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#111827'
        }}>
          PetPort Temporarily Unavailable
        </h1>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          We're having trouble loading the app. This sometimes happens on iOS Safari with poor connectivity.
          {context && <><br />Error in: {context}</>}
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          flexDirection: 'column'
        }}>
          <Button 
            onClick={handleReload}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Reload App
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="outline"
            style={{
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Go to Homepage
          </Button>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: navigator.onLine ? '#10b981' : '#ef4444'
        }}>
          <Wifi style={{ width: '14px', height: '14px' }} />
          {navigator.onLine ? 'Connected' : 'No internet connection'}
        </div>
        
        <p style={{ 
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#9ca3af'
        }}>
          Having trouble? Try using Chrome browser or closing other Safari tabs.
        </p>
      </div>
    </div>
  );
};