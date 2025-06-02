import { GoogleOAuthProvider } from '@react-oauth/google';
import type { PropsWithChildren } from 'react';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export default function GoogleAuthProviderWrapper({ children }: PropsWithChildren) {
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
