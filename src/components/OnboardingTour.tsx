import React, { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, ACTIONS } from 'react-joyride';
import { ONBOARDING_STEPS } from '@/config/tourSteps';
import { useOverlayOpen } from '@/stores/overlayStore';

interface OnboardingTourProps {
  runTour: boolean;
  tourKey: number;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  runTour,
  tourKey,
  onComplete,
  onSkip,
}) => {
  const isOverlayOpen = useOverlayOpen();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [internalRun, setInternalRun] = React.useState(runTour);

  // ✅ Pause tour if any overlay/modal is open
  useEffect(() => {
    if (isOverlayOpen && internalRun) {
      console.log('⏸️ Pausing tour due to open overlay');
      setInternalRun(false);
    } else if (!isOverlayOpen && runTour && !internalRun) {
      console.log('▶️ Resuming tour');
      setInternalRun(true);
    }
  }, [isOverlayOpen, runTour, internalRun]);

  // Sync external runTour prop
  useEffect(() => {
    if (runTour !== internalRun && !isOverlayOpen) {
      setInternalRun(runTour);
    }
  }, [runTour, isOverlayOpen, internalRun]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    console.log('🎯 Tour callback:', { status, action, type, index });

    // Update current step
    if (type === 'step:after') {
      setCurrentStep(index + 1);
    }

    // Tour completed successfully
    if (status === STATUS.FINISHED) {
      console.log('✅ Tour completed');
      onComplete();
    }

    // User closed/skipped tour
    if (status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      console.log('⏭️ Tour skipped');
      onSkip();
    }

    // Handle errors gracefully
    if (status === STATUS.ERROR) {
      console.error('❌ Tour error:', data);
      onSkip(); // Fail gracefully
    }
  };

  // Validate steps before rendering
  const validSteps = ONBOARDING_STEPS.filter((step) => {
    const target = document.querySelector(step.target as string);
    if (!target) {
      console.warn(`⚠️ Tour target not found: ${step.target}`);
      return false;
    }
    return true;
  });

  // Don't render if no valid steps
  if (validSteps.length === 0) {
    console.warn('❌ No valid tour steps found, skipping tour');
    return null;
  }

  return (
    <Joyride
      key={tourKey}
      steps={validSteps}
      run={internalRun}
      continuous
      showProgress
      showSkipButton
      spotlightPadding={8}
      disableOverlayClose
      scrollToFirstStep
      scrollOffset={100}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#5691af',
          zIndex: 10000, // Above all modals
          arrowColor: '#ffffff',
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          fontSize: 15,
        },
        tooltipTitle: {
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 8,
        },
        buttonNext: {
          backgroundColor: '#5691af',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 500,
        },
        buttonBack: {
          color: '#5691af',
          marginRight: 12,
          fontSize: 15,
        },
        buttonSkip: {
          color: '#94a3b8',
          fontSize: 14,
        },
        spotlight: {
          borderRadius: 8,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Got it! 🎉',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};
