'use client';

import { useState } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { mockBriefing } from '@/lib/mock-data';
import {
  mockSleepTrend,
  mockActivityTrend,
  mockHealthInsights,
  mockLabResults,
  mockNutritionData,
  mockWorkouts,
  mockBodySpecResults,
} from '@/lib/health-mock-data';
import { HealthDashboard } from '@/components/health/HealthDashboard';
import { SleepDeepDive } from '@/components/health/SleepDeepDive';
import { ActivityTracker } from '@/components/health/ActivityTracker';
import { AgentHealthFeed } from '@/components/health/AgentHealthFeed';
import { HealthDetailsSections } from '@/components/health/HealthDetailsSections';

export default function HealthPage() {
  const [health] = useState(mockBriefing.health);

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
              <Heart
                className="w-5 h-5"
                style={{ color: 'var(--brand-primary)' }}
              />
              <span
                className="text-label-md"
                style={{ color: 'var(--text-primary)' }}
              >
                Health & Fitness
              </span>
            </div>
            <div style={{ width: '72px' }} /> {/* Spacer for centering */}
          </div>
          <div className="masthead-center">
            <h1
              className="text-display-md"
              style={{ color: 'var(--text-primary)' }}
            >
              Health Overview
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
        {/* Hero: Health Dashboard */}
        <section
          className="animate-slide-up stagger-1 opacity-0"
          style={{ animationFillMode: 'forwards' }}
        >
          <HealthDashboard health={health} />
        </section>

        {/* Grid: Sleep + Activity */}
        <div
          className="grid-premium grid-premium-2"
          style={{ marginTop: 'var(--space-12)' }}
        >
          {/* Left: Sleep Deep-Dive */}
          <section
            className="animate-slide-up stagger-2 opacity-0"
            style={{ animationFillMode: 'forwards' }}
          >
            <SleepDeepDive sleepData={mockSleepTrend} />
          </section>

          {/* Right: Activity Tracker */}
          <section
            className="animate-slide-up stagger-3 opacity-0"
            style={{ animationFillMode: 'forwards' }}
          >
            <ActivityTracker
              activityData={mockActivityTrend}
              currentSteps={health.steps}
              stepsGoal={health.stepsGoal}
              activeMinutes={health.activeMinutes}
            />
          </section>
        </div>

        {/* Agent Health Feed */}
        <section
          className="animate-slide-up stagger-4 opacity-0"
          style={{ animationFillMode: 'forwards' }}
        >
          <AgentHealthFeed insights={mockHealthInsights} />
        </section>

        {/* Health Details Sections (Collapsible) */}
        <section
          className="animate-slide-up stagger-5 opacity-0"
          style={{ animationFillMode: 'forwards' }}
        >
          <HealthDetailsSections
            labs={mockLabResults}
            nutrition={mockNutritionData}
            workouts={mockWorkouts}
            bodyspec={mockBodySpecResults}
          />
        </section>
      </main>
    </div>
  );
}
