// src/ai-tools/get-patient-history.ts
import { ToolResult, Anamnese } from './types';

export const getPatientHistoryDefinition = {
  name: 'get_patient_history',
  description: 'Recupera o histórico completo cronológico de anamneses e evoluções do paciente.',
  parameters: {
    type: 'object',
    properties: {
      patient_id: { type: 'string', description: 'UUID do paciente' }
    },
    required: ['patient_id']
  }
};

export async function getPatientHistory(
  patientId: string,
  db: any
): Promise<ToolResult<Anamnese[]>> {
  try {
    const history = await db.getAnamneseHistory(patientId);
    return { success: true, data: history };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao buscar histórico de anamneses' };
  }
}
