/**
 * Provider Manager - Central OAuth Orchestration
 *
 * Handles OAuth flows for all providers with:
 * - PKCE support for enhanced security
 * - Automatic token refresh
 * - Secure token storage (HTTP-only cookies via API)
 * - Provider-agnostic interface
 */

import type { Provider, TokenSet, IntegrationConnection, ConnectionStatus } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface OAuthProvider {
  id: Provider;
  name: string;
  clientId: string;
  scopes: string[];
  authEndpoint: string;
  tokenEndpoint: string;
  revokeEndpoint?: string;
  color: string;
  icon: string;
}

interface AuthState {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
  provider: Provider;
  redirectUri: string;
}

// ============================================================================
// PROVIDER CONFIGURATIONS
// ============================================================================

export const PROVIDERS: Record<Provider, OAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/contacts.readonly',
    ],
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
    color: '#4285F4',
    icon: 'google',
  },
  plaid: {
    id: 'plaid',
    name: 'Plaid',
    clientId: process.env.NEXT_PUBLIC_PLAID_CLIENT_ID || '',
    scopes: ['transactions', 'accounts', 'auth'],
    authEndpoint: '', // Plaid uses Link, not standard OAuth
    tokenEndpoint: '',
    color: '#00D09C',
    icon: 'bank',
  },
  healthkit: {
    id: 'healthkit',
    name: 'Apple Health',
    clientId: '',
    scopes: ['steps', 'sleep', 'heart_rate', 'activity'],
    authEndpoint: '', // HealthKit requires iOS app
    tokenEndpoint: '',
    color: '#FF2D55',
    icon: 'heart',
  },
  fitbit: {
    id: 'fitbit',
    name: 'Fitbit',
    clientId: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID || '',
    scopes: ['activity', 'sleep', 'heartrate', 'profile'],
    authEndpoint: 'https://www.fitbit.com/oauth2/authorize',
    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
    revokeEndpoint: 'https://api.fitbit.com/oauth2/revoke',
    color: '#00B0B9',
    icon: 'activity',
  },
  oura: {
    id: 'oura',
    name: 'Oura',
    clientId: process.env.NEXT_PUBLIC_OURA_CLIENT_ID || '',
    scopes: ['personal', 'daily', 'heartrate', 'sleep'],
    authEndpoint: 'https://cloud.ouraring.com/oauth/authorize',
    tokenEndpoint: 'https://api.ouraring.com/oauth/token',
    color: '#000000',
    icon: 'ring',
  },
  whoop: {
    id: 'whoop',
    name: 'WHOOP',
    clientId: process.env.NEXT_PUBLIC_WHOOP_CLIENT_ID || '',
    scopes: ['read:recovery', 'read:cycles', 'read:sleep', 'read:workout'],
    authEndpoint: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenEndpoint: 'https://api.prod.whoop.com/oauth/oauth2/token',
    color: '#2ECC71',
    icon: 'activity',
  },
};

// ============================================================================
// PKCE UTILITIES
// ============================================================================

/**
 * Generate a cryptographically random string for PKCE
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((v) => charset[v % charset.length])
    .join('');
}

/**
 * Generate SHA-256 hash for PKCE code challenge
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64 URL encode for PKCE
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Generate PKCE code verifier and challenge
 */
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(64);
  const hashed = await sha256(verifier);
  const challenge = base64UrlEncode(hashed);
  return { verifier, challenge };
}

// ============================================================================
// AUTH STATE MANAGEMENT
// ============================================================================

const AUTH_STATE_KEY = 'daily_pulse_auth_state';

function saveAuthState(state: AuthState): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state));
  }
}

function getAuthState(): AuthState | null {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(AUTH_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
}

function clearAuthState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(AUTH_STATE_KEY);
  }
}

// ============================================================================
// PROVIDER MANAGER CLASS
// ============================================================================

class ProviderManager {
  private connections: Map<Provider, IntegrationConnection> = new Map();

  /**
   * Initialize OAuth flow for a provider
   * Returns the authorization URL to redirect to
   */
  async initiateAuth(provider: Provider): Promise<string> {
    const config = PROVIDERS[provider];
    if (!config) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // Plaid uses Link, not standard OAuth
    if (provider === 'plaid') {
      return this.initiatePlaidLink();
    }

    // HealthKit requires iOS app
    if (provider === 'healthkit') {
      throw new Error('HealthKit requires the iOS companion app');
    }

    // Generate PKCE values
    const { verifier, challenge } = await generatePKCE();
    const state = generateRandomString(32);
    const redirectUri = `${window.location.origin}/api/auth/${provider}/callback`;

    // Save state for callback verification
    saveAuthState({
      codeVerifier: verifier,
      codeChallenge: challenge,
      state,
      provider,
      redirectUri,
    });

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      access_type: 'offline', // For refresh tokens (Google)
      prompt: 'consent', // Force consent to get refresh token
    });

    return `${config.authEndpoint}?${params.toString()}`;
  }

  /**
   * Initialize Plaid Link flow
   */
  private async initiatePlaidLink(): Promise<string> {
    // In production, this would call your backend to create a link token
    // For now, return a placeholder
    const response = await fetch('/api/auth/plaid/link-token', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create Plaid link token');
    }

    const { linkToken } = await response.json();
    return linkToken;
  }

  /**
   * Handle OAuth callback
   * Called by the callback route after redirect
   */
  async handleCallback(code: string, state: string): Promise<boolean> {
    const authState = getAuthState();

    if (!authState) {
      throw new Error('No auth state found. Please start the flow again.');
    }

    if (authState.state !== state) {
      throw new Error('State mismatch. Possible CSRF attack.');
    }

    // Exchange code for tokens via backend
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: authState.provider,
        code,
        codeVerifier: authState.codeVerifier,
        redirectUri: authState.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    // Tokens are stored in HTTP-only cookies by the backend
    clearAuthState();

    // Update connection status
    this.connections.set(authState.provider, {
      provider: authState.provider,
      status: 'connected',
      connectedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Disconnect a provider
   */
  async disconnect(provider: Provider): Promise<void> {
    const response = await fetch(`/api/auth/${provider}/disconnect`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect');
    }

    this.connections.set(provider, {
      provider,
      status: 'disconnected',
    });
  }

  /**
   * Get connection status for all providers
   */
  async getConnectionStatus(): Promise<IntegrationConnection[]> {
    const response = await fetch('/api/auth/status');

    if (!response.ok) {
      // Return cached status if API fails
      return Array.from(this.connections.values());
    }

    const status = await response.json();

    // Update cache
    for (const conn of status.connections) {
      this.connections.set(conn.provider, conn);
    }

    return status.connections;
  }

  /**
   * Check if a specific provider is connected
   */
  async isConnected(provider: Provider): Promise<boolean> {
    const status = await this.getConnectionStatus();
    const conn = status.find((c) => c.provider === provider);
    return conn?.status === 'connected';
  }

  /**
   * Refresh token for a provider (called automatically by API routes)
   */
  async refreshToken(provider: Provider): Promise<boolean> {
    const response = await fetch(`/api/auth/${provider}/refresh`, {
      method: 'POST',
    });

    return response.ok;
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: Provider): OAuthProvider | undefined {
    return PROVIDERS[provider];
  }

  /**
   * Get all available providers
   */
  getAllProviders(): OAuthProvider[] {
    return Object.values(PROVIDERS);
  }
}

// Export singleton instance
export const providerManager = new ProviderManager();

// ============================================================================
// HOOKS
// ============================================================================

export function useProviderStatus() {
  // This would be implemented with React Query or SWR in production
  // For now, return a simple interface
  return {
    connections: [] as IntegrationConnection[],
    isLoading: false,
    refetch: async () => providerManager.getConnectionStatus(),
  };
}
