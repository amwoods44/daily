export {
  detectCollisions,
  categorizeCollisions,
  calculateCollisionImpact,
  prioritizeResolutions,
} from './collision-detector';

export {
  detectProductivityPatterns,
  detectSpendingPatterns,
  detectCommunicationPatterns as detectCommunicationPatternsFromHistory,
  detectHealthPatterns,
  detectCorrelations,
  generatePatternInsights,
  type Pattern,
  type ProductivityPattern,
  type SpendingPattern,
  type CommunicationPattern,
  type HealthPattern,
  type BehaviorCorrelation,
} from './patterns';

export {
  generateSuggestions,
  filterSuggestionsByContext,
  groupSuggestionsBySource,
  type Suggestion,
  type SuggestionContext,
} from './suggestions';
