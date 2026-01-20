'use client';

import React from 'react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import type { LabResult, NutritionDay, Workout, BodySpecResult } from '@/lib/health-mock-data';

interface HealthDetailsSectionsProps {
  labs: LabResult[];
  nutrition: NutritionDay[];
  workouts: Workout[];
  bodyspec: BodySpecResult[];
}

// ============================================================================
// LAB RESULTS
// ============================================================================

function LabResultsContent({ labs }: { labs: LabResult[] }) {
  if (labs.length === 0) {
    return (
      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
        No lab results available. Upload results to track trends.
      </p>
    );
  }

  return (
    <div className="stack-md">
      {labs.map((lab) => (
        <div
          key={lab.id}
          style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-muted)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span
              className="text-label-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {lab.type}
            </span>
            <span
              className="text-mono-sm"
              style={{
                color: 'var(--text-quaternary)',
                marginLeft: 'var(--space-3)',
              }}
            >
              {lab.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="stack-sm">
            {lab.metrics.map((metric, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className="text-body-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {metric.name}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span
                    className="text-mono-sm"
                    style={{
                      color:
                        metric.status === 'normal'
                          ? 'var(--text-primary)'
                          : metric.status === 'low'
                            ? 'var(--semantic-warning)'
                            : 'var(--semantic-error)',
                      fontWeight: 'var(--weight-medium)',
                    }}
                  >
                    {metric.value} {metric.unit}
                  </span>
                  <span
                    className="text-body-sm"
                    style={{
                      color: 'var(--text-tertiary)',
                      marginLeft: 'var(--space-2)',
                    }}
                  >
                    ({metric.range})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// NUTRITION
// ============================================================================

function NutritionContent({ nutrition }: { nutrition: NutritionDay[] }) {
  if (nutrition.length === 0) {
    return (
      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
        Start tracking nutrition to see daily macros.
      </p>
    );
  }

  const recent = nutrition.slice(-7); // Last 7 days

  return (
    <div className="stack-sm">
      {recent.map((day, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-muted)',
          }}
        >
          <span
            className="text-mono-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
            }}
          >
            <span className="text-mono-sm" style={{ color: 'var(--text-secondary)' }}>
              {day.calories} cal
            </span>
            <span className="text-mono-sm" style={{ color: 'var(--text-secondary)' }}>
              P: {day.protein}g
            </span>
            <span className="text-mono-sm" style={{ color: 'var(--text-secondary)' }}>
              C: {day.carbs}g
            </span>
            <span className="text-mono-sm" style={{ color: 'var(--text-secondary)' }}>
              F: {day.fat}g
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// WORKOUTS
// ============================================================================

function WorkoutsContent({ workouts }: { workouts: Workout[] }) {
  if (workouts.length === 0) {
    return (
      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
        No workouts logged. Start tracking your exercise.
      </p>
    );
  }

  return (
    <div className="stack-sm">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-muted)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: 'var(--space-2)',
            }}
          >
            <div>
              <span
                className="text-body"
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                {workout.type}
              </span>
              <div
                className="text-mono-sm"
                style={{
                  color: 'var(--text-tertiary)',
                  marginTop: 'var(--space-1)',
                }}
              >
                {workout.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                className="text-mono-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {workout.duration} min
              </div>
              {workout.distance && (
                <div
                  className="text-mono-sm"
                  style={{
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-1)',
                  }}
                >
                  {workout.distance} mi
                </div>
              )}
            </div>
          </div>
          {workout.notes && (
            <p
              className="text-body-sm"
              style={{
                color: 'var(--text-tertiary)',
                fontStyle: 'italic',
              }}
            >
              {workout.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// BODYSPEC
// ============================================================================

function BodySpecContent({ bodyspec }: { bodyspec: BodySpecResult[] }) {
  if (bodyspec.length === 0) {
    return (
      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
        No BodySpec scans available. Book a DEXA scan to track body composition.
      </p>
    );
  }

  return (
    <div className="stack-md">
      {bodyspec.map((scan) => (
        <div
          key={scan.id}
          style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-muted)',
          }}
        >
          <div
            className="text-mono-sm"
            style={{
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {scan.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
            <div>
              <div
                className="text-label-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Body Fat
              </div>
              <div
                className="text-heading-md"
                style={{
                  color: 'var(--text-primary)',
                  marginTop: 'var(--space-1)',
                }}
              >
                {scan.bodyFat.toFixed(1)}%
              </div>
            </div>
            <div>
              <div
                className="text-label-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Lean Mass
              </div>
              <div
                className="text-heading-md"
                style={{
                  color: 'var(--text-primary)',
                  marginTop: 'var(--space-1)',
                }}
              >
                {scan.leanMass.toFixed(1)} lbs
              </div>
            </div>
            <div>
              <div
                className="text-label-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Bone Density
              </div>
              <div
                className="text-heading-md"
                style={{
                  color: 'var(--text-primary)',
                  marginTop: 'var(--space-1)',
                }}
              >
                {scan.boneDensity.toFixed(2)}
              </div>
            </div>
            <div>
              <div
                className="text-label-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Visceral Fat
              </div>
              <div
                className="text-heading-md"
                style={{
                  color: 'var(--text-primary)',
                  marginTop: 'var(--space-1)',
                }}
              >
                {scan.visceralFat.toFixed(1)} cm²
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HealthDetailsSections({
  labs,
  nutrition,
  workouts,
  bodyspec,
}: HealthDetailsSectionsProps) {
  return (
    <div className="stack-lg" style={{ marginTop: 'var(--space-12)' }}>
      {/* Divider */}
      <div className="divider-subtle" />

      {/* Lab Results */}
      <CollapsibleSection
        id="health-labs"
        title={`Lab Results (${labs.length})`}
        defaultExpanded={false}
      >
        <LabResultsContent labs={labs} />
      </CollapsibleSection>

      {/* Nutrition Tracking */}
      <CollapsibleSection
        id="health-nutrition"
        title="Nutrition Tracking"
        defaultExpanded={false}
      >
        <NutritionContent nutrition={nutrition} />
      </CollapsibleSection>

      {/* Workout History */}
      <CollapsibleSection
        id="health-workouts"
        title={`Workout History (${workouts.length})`}
        defaultExpanded={false}
      >
        <WorkoutsContent workouts={workouts} />
      </CollapsibleSection>

      {/* BodySpec / DEXA */}
      <CollapsibleSection
        id="health-bodyspec"
        title={`BodySpec Results (${bodyspec.length})`}
        defaultExpanded={false}
      >
        <BodySpecContent bodyspec={bodyspec} />
      </CollapsibleSection>
    </div>
  );
}

export default HealthDetailsSections;
