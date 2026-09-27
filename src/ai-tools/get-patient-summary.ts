// src/ai-tools/get-patient-summary.ts
import { ToolResult, PatientSummary } from './types';

export const getPatientSummaryDefinition = {
  name: 'get_patient_summary',
  description: 'Retorna os dados completos do paciente, perfil metabólico, última anamnese e agendamentos recentes.',
  parameters: {
    type: 'object',
    properties: {
      patient_id: {
        type: 'string',
        description: 'UUID do paciente no sistema'
      }
    },
    required: ['patient_id']
  }
};

export async function getPatientSummary(
  patientId: string,
  db: any
): Promise<ToolResult<PatientSummary>> {
  try {
    const patient = await db.getPatientById(patientId);
    if (!patient) {
      return { success: false, error: `Paciente com ID ${patientId} não encontrado.` };
    }

    const [latestAnamnese, recentAppointments, recentExams] = await Promise.all([
      db.getLatestAnamnese(patientId),
      db.getRecentAppointments(patientId, 3),
      db.getRecentExams(patientId, 5)
    ]);

    return {
      success: true,
      data: {
        patient,
        latest_anamnese: latestAnamnese,
        recent_appointments: recentAppointments,
        recent_exams: recentExams
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Erro ao buscar resumo do paciente: ${err?.message || err}`
    };
  }
}
