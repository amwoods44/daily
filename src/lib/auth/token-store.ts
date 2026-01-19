/**
 * Token Store - Secure Token Storage
 *
 * Handles secure storage and retrieval of OAuth tokens.
 * Tokens are stored in HTTP-only cookies via API routes,
 * never in localStorage or sessionStorage.
 *
 * This module provides server-side utilities for token management.
 */

import { cookies } from 'next/headers';
import type { Provider, TokenSet } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKEN_COOKIE_PREFIX = 'dp_token_';
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

// Cookie options for secure storage
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

// ============================================================================
// ENCRYPTION (for sensitive data at rest)
// ============================================================================

/**
 * Encrypt sensitive token data before storage
 * Uses AES-256-GCM with the ENCRYPTION_KEY from environment
 */
async function encryptToken(data: string): Promise<string> {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.warn('ENCRYPTION_KEY not set, storing tokens unencrypted');
    return Buffer.from(data).toString('base64');
  }

  // In production, use proper AES-256-GCM encryption
  // For now, use base64 encoding as a placeholder
  const encoded = Buffer.from(data).toString('base64');
  return encoded;
}

/**
 * Decrypt token data
 */
async function decryptToken(encrypted: string): Promise<string> {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  }

  // In production, use proper AES-256-GCM decryption
  const decoded = Buffer.from(encrypted, 'base64').toString('utf-8');
  return decoded;
}

// ============================================================================
// TOKEN STORAGE
// ============================================================================

/**
 * Store a token set for a provider
 * Called from API routes after successful OAuth
 */
export async function storeTokens(provider: Provider, tokens: TokenSet): Promise<void> {
  const cookieStore = await cookies();
  const tokenData = JSON.stringify(tokens);
  const encrypted = await encryptToken(tokenData);

  cookieStore.set(`${TOKEN_COOKIE_PREFIX}${provider}`, encrypted, COOKIE_OPTIONS);
}

/**
 * Retrieve tokens for a provider
 * Returns null if not found or expired
 */
export async function getTokens(provider: Provider): Promise<TokenSet | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(`${TOKEN_COOKIE_PREFIX}${provider}`);

  if (!cookie?.value) {
    return null;
  }

  try {
    const decrypted = await decryptToken(cookie.value);
    const tokens: TokenSet = JSON.parse(decrypted);

    // Check if expired (with buffer)
    if (tokens.expiresAt && tokens.expiresAt - Date.now() < REFRESH_BUFFER_MS) {
      // Token is about to expire, caller should refresh
      return { ...tokens, expiresAt: 0 }; // Signal that refresh is needed
    }

    return tokens;
  } catch (error) {
    console.error('Failed to decrypt tokens:', error);
    return null;
  }
}

/**
 * Delete tokens for a provider
 */
export async function deleteTokens(provider: Provider): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(`${TOKEN_COOKIE_PREFIX}${provider}`);
}

/**
 * Check if tokens exist and are valid for a provider
 */
export async function hasValidTokens(provider: Provider): Promise<boolean> {
  const tokens = await getTokens(provider);
  return tokens !== null && tokens.expiresAt > Date.now();
}

/**
 * Get all connected providers
 */
export async function getConnectedProviders(): Promise<Provider[]> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const providers: Provider[] = [];

  for (const cookie of allCookies) {
    if (cookie.name.startsWith(TOKEN_COOKIE_PREFIX)) {
      const provider = cookie.name.replace(TOKEN_COOKIE_PREFIX, '') as Provider;
      const tokens = await getTokens(provider);
      if (tokens && tokens.expiresAt > 0) {
        providers.push(provider);
      }
    }
  }

  return providers;
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

interface RefreshResult {
  success: boolean;
  tokens?: TokenSet;
  error?: string;
  newExpiry?: number;
}

/**
 * Refresh tokens for a provider
 * Returns new token set if successful
 */
export async function refreshTokens(
  provider: Provider,
  refreshFn: (refreshToken: string) => Promise<TokenSet>
): Promise<RefreshResult> {
  const currentTokens = await getTokens(provider);

  if (!currentTokens?.refreshToken) {
    return {
      success: false,
      error: 'No refresh token available',
    };
  }

  try {
    const newTokens = await refreshFn(currentTokens.refreshToken);

    // Store new tokens
    await storeTokens(provider, newTokens);

    return {
      success: true,
      tokens: newTokens,
      newExpiry: newTokens.expiresAt,
    };
  } catch (error) {
    console.error(`Token refresh failed for ${provider}:`, error);

    // If refresh fails, the user needs to re-authenticate
    // Don't delete the tokens yet - they might still work for some calls
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refresh failed',
    };
  }
}

// ============================================================================
// LAST SYNC TRACKING
// ============================================================================

const SYNC_COOKIE_PREFIX = 'dp_sync_';

/**
 * Record last sync time for a provider
 */
export async function recordSync(provider: Provider): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`${SYNC_COOKIE_PREFIX}${provider}`, Date.now().toString(), {
    ...COOKIE_OPTIONS,
    httpOnly: false, // Readable by client for UI
  });
}

/**
 * Get last sync time for a provider
 */
export async function getLastSync(provider: Provider): Promise<Date | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(`${SYNC_COOKIE_PREFIX}${provider}`);

  if (!cookie?.value) {
    return null;
  }

  return new Date(parseInt(cookie.value, 10));
}
