import { Incident, RepairEvent } from '../../types';
import { ConfidenceLevel, MemoryConfidence, RelationshipSignals } from './types';

/**
 * Transparent confidence scoring engine.
 * Never invents a universal opaque score; breaks into 3 verifiable dimensions.
 */
export function evaluateMemoryConfidence(
  incidents: Incident[],
  repairs: RepairEvent[],
  dominantSignal?: RelationshipSignals
): MemoryConfidence {
  // 1. Data Coverage
  let coverageLevel: ConfidenceLevel = 'LOW';
  let coverageLabel = 'Limited Dataset';
  let coverageDesc = 'Single incident record with no antecedent repair or historical context.';

  if (incidents.length >= 3 && repairs.length >= 1) {
    coverageLevel = 'HIGH';
    coverageLabel = 'Extensive Lineage';
    coverageDesc = `${incidents.length} incidents and ${repairs.length} repair work orders provide verifiable longitudinal evidence.`;
  } else if (incidents.length >= 2 || repairs.length >= 1) {
    coverageLevel = 'MODERATE';
    coverageLabel = 'Moderate Registry Record';
    coverageDesc = 'Multi-incident reports with emerging recurrence patterns.';
  }

  // 2. Relationship Strength
  let relLevel: ConfidenceLevel = 'LOW';
  let relLabel = 'Weak Spatial Link';
  let relDesc = 'No strong spatial or category connection identified.';

  if (dominantSignal) {
    if (dominantSignal.overallScore >= 0.70) {
      relLevel = 'HIGH';
      relLabel = 'Strong Empirical Signal';
      relDesc = 'High coordinate proximity, matching defect category, and explicit temporal correlation.';
    } else if (dominantSignal.overallScore >= 0.45) {
      relLevel = 'MODERATE';
      relLabel = 'Moderate Signal';
      relDesc = 'Meaningful proximity and category affinity within the municipal corridor.';
    } else {
      relLevel = 'LOW';
      relLabel = 'Tentative Signal';
      relDesc = 'Broad spatial proximity with partial category correlation.';
    }
  } else if (incidents.length >= 2) {
    relLevel = 'MODERATE';
    relLabel = 'Corridor Affinity';
    relDesc = 'Multiple records clustered within 250m radius.';
  }

  // 3. Interpretation Uncertainty
  let uncLevel: ConfidenceLevel = 'LOW';
  let uncLabel = 'Low Uncertainty';
  let uncDesc = 'Defect categories match and historical sequence is consistent.';

  if (incidents.length === 1) {
    uncLevel = 'LOW';
    uncLabel = 'Isolated Record';
    uncDesc = 'Single baseline incident without conflicting history.';
  } else {
    // Check if category discrepancy exists
    const categories = new Set(incidents.map((i) => i.category));
    if (categories.size > 1) {
      uncLevel = 'MODERATE';
      uncLabel = 'Moderate Uncertainty';
      uncDesc = `Mixed defect categories (${Array.from(categories).join(', ')}) in the same physical corridor.`;
    }
  }

  return {
    dataCoverage: {
      level: coverageLevel,
      label: coverageLabel,
      description: coverageDesc,
    },
    relationshipStrength: {
      level: relLevel,
      label: relLabel,
      description: relDesc,
    },
    interpretationUncertainty: {
      level: uncLevel,
      label: uncLabel,
      description: uncDesc,
    },
  };
}
