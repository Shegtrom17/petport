import { useAuthKeepAlive } from '@/hooks/useAuthKeepAlive';

interface AuthKeepAliveWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that activates the auth keep-alive functionality
 * Place this high in your component tree to ensure sessions stay fresh on iOS
 */
export const AuthKeepAliveWrapper = ({ children }: AuthKeepAliveWrapperProps) => {
  useAuthKeepAlive();
  return <>{children}</>;
};