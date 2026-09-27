// src/ai-tools/save-anamnese-draft.ts
import { ToolResult, Anamnese } from './types';

export const saveAnamneseDraftDefinition = {
  name: 'save_anamnese_draft',
  description: 'Salva um rascunho de anamnese e evolução clínica estruturada no padrão SOAP para posterior revisão e aprovação médica.',
  parameters: {
    type: 'object',
    properties: {
      patient_id: { type: 'string', description: 'UUID do paciente' },
      symptoms_summary: { type: 'string', description: 'Resumo dos sintomas e queixas' },
      clinical_notes: { type: 'string', description: 'Notas clínicas detalhadas' },
      soap_subjective: { type: 'string', description: 'Subjetivo: queixas e relatos do paciente' },
      soap_objective: { type: 'string', description: 'Objetivo: dados vitais, exames e observações' },
      soap_assessment: { type: 'string', description: 'Avaliação: hipóteses diagnósticas e correlações' },
      soap_plan: { type: 'string', description: 'Plano: conduta terapêutica, metas e exames propostos' }
    },
    required: ['patient_id', 'clinical_notes', 'symptoms_summary']
  }
};

export async function saveAnamneseDraft(
  params: {
    patient_id: string;
    clinical_notes: string;
    symptoms_summary: string;
    soap_subjective?: string;
    soap_objective?: string;
    soap_assessment?: string;
    soap_plan?: string;
  },
  db: any
): Promise<ToolResult<Anamnese>> {
  try {
    const draft = await db.createAnamnese({
      patient_id: params.patient_id,
      clinical_notes: params.clinical_notes,
      symptoms_summary: params.symptoms_summary,
      soap_subjective: params.soap_subjective || '',
      soap_objective: params.soap_objective || '',
      soap_assessment: params.soap_assessment || '',
      soap_plan: params.soap_plan || '',
      status: 'draft'
    });
    return { success: true, data: draft };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao salvar rascunho de anamnese' };
  }
}
