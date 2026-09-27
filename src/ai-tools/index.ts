// src/ai-tools/index.ts
export * from './types';
export * from './get-patient-summary';
export * from './get-patient-history';
export * from './get-recent-exams';
export * from './save-anamnese-draft';
export * from './save-prescription-draft';
export * from './create-followup-message';

import { getPatientSummaryDefinition } from './get-patient-summary';
import { getPatientHistoryDefinition } from './get-patient-history';
import { getRecentExamsDefinition } from './get-recent-exams';
import { saveAnamneseDraftDefinition } from './save-anamnese-draft';
import { savePrescriptionDraftDefinition } from './save-prescription-draft';
import { createFollowupMessageDefinition } from './create-followup-message';

export const allToolDefinitions = [
  getPatientSummaryDefinition,
  getPatientHistoryDefinition,
  getRecentExamsDefinition,
  saveAnamneseDraftDefinition,
  savePrescriptionDraftDefinition,
  createFollowupMessageDefinition
];
