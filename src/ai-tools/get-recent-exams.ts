// src/ai-tools/get-recent-exams.ts
import { ToolResult, Exam } from './types';

export const getRecentExamsDefinition = {
  name: 'get_recent_exams',
  description: 'Retorna a lista de exames laboratoriais, bioimpedâncias e laudos recentes com dados extraídos por visão computacional.',
  parameters: {
    type: 'object',
    properties: {
      patient_id: { type: 'string', description: 'UUID do paciente' },
      limit: { type: 'number', description: 'Quantidade máxima de exames (padrão 5)' }
    },
    required: ['patient_id']
  }
};

export async function getRecentExams(
  patientId: string,
  limit: number = 5,
  db: any
): Promise<ToolResult<Exam[]>> {
  try {
    const exams = await db.getRecentExams(patientId, limit);
    return { success: true, data: exams };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao buscar exames recentes' };
  }
}
