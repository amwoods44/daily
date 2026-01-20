'use client';

import { useState } from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { mockBriefing } from '@/lib/mock-data';
import { buildExtendedFinanceData } from '@/lib/finance-data';
import { NetWorthDashboard } from '@/components/finance/NetWorthDashboard';
import { AgentActivityFeed } from '@/components/finance/AgentActivityFeed';
import { SpendingInsights } from '@/components/finance/SpendingInsights';

export default function FinancePage() {
  // Build extended finance data from existing mock data
  const [data] = useState(() => buildExtendedFinanceData(mockBriefing.finance));

  return (
    <div
      className="min-h-screen grain-overlay"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      {/* Header */}
      <header className="masthead">
        <div className="masthead-inner">
          <div
            className="masthead-top"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link href="/" className="btn btn-ghost btn-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <TrendingUp
                className="w-5 h-5"
                style={{ color: 'var(--brand-primary)' }}
              />
              <span
                className="text-label-md"
                style={{ color: 'var(--text-primary)' }}
              >
                Finance
              </span>
            </div>
            <div style={{ width: '72px' }} /> {/* Spacer for centering */}
          </div>
          <div className="masthead-center">
            <h1
              className="text-display-md"
              style={{ color: 'var(--text-primary)' }}
            >
              Financial Overview
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="container-premium"
        style={{
          paddingTop: 'var(--space-12)',
          paddingBottom: 'var(--space-20)',
        }}
      >
        {/* Hero: Net Worth Dashboard */}
        <section
          className="animate-slide-up stagger-1 opacity-0"
          style={{ animationFillMode: 'forwards' }}
        >
          <NetWorthDashboard
            netWorth={data.netWorth}
            netWorthChange={data.netWorthChange}
            accounts={data.accounts}
          />
        </section>

        {/* Grid: Spending Analysis (60%) + Agent Activity (40%) */}
        <div
          className="grid-premium grid-asymmetric-2-1"
          style={{ marginTop: 'var(--space-12)' }}
        >
          {/* Left: Spending Analysis */}
          <section
            className="animate-slide-up stagger-2 opacity-0"
            style={{ animationFillMode: 'forwards' }}
          >
            <SpendingInsights finance={data} />
          </section>

          {/* Right: Agent Activity */}
          <section
            className="animate-slide-up stagger-3 opacity-0"
            style={{ animationFillMode: 'forwards' }}
          >
            <AgentActivityFeed activities={data.agentActivities} />
          </section>
        </div>
      </main>
    </div>
  );
}
