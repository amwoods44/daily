'use client';

import { DataSourcesPanel } from '@/components/dev';

/**
 * Client-side dev tools wrapper
 * Only renders when NEXT_PUBLIC_SHOW_MOCK_INDICATORS=true
 */
export function DevTools() {
  return <DataSourcesPanel />;
}
