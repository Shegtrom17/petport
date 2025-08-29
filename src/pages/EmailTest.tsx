import React from 'react';
import { MetaTags } from '@/components/MetaTags';
import EmailTestUtility from '@/components/EmailTestUtility';

const EmailTest = () => {
  return (
    <>
      <MetaTags 
        title="Email Test - PetPort"
        description="Test email configuration and sending functionality"
        url="/email-test"
      />
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Email Testing</h1>
            <p className="text-muted-foreground text-lg">
              Test your email configuration and verify domain setup
            </p>
          </div>
          
          <EmailTestUtility />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              After sending a test email, check your spam folder if you don't see it in your inbox.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailTest;