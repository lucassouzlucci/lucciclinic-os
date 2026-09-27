// src/ai-tools/save-prescription-draft.ts
import { ToolResult, Prescription, PrescriptionItem } from './types';

export const savePrescriptionDraftDefinition = {
  name: 'save_prescription_draft',
  description: 'Gera e salva um rascunho de prescrição médica com dosagens, posologia e orientações para revisão do Dr. Lucas Lucci.',
  parameters: {
    type: 'object',
    properties: {
      patient_id: { type: 'string', description: 'UUID do paciente' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            medication: { type: 'string', description: 'Nome do fármaco ou composto (ex: Tirzepatida, Enantato de Testosterona, BPC-157)' },
            dosage: { type: 'string', description: 'Dosagem (ex: 2.5mg, 100mg/sem, 500mcg/dia)' },
            instructions: { type: 'string', description: 'Via e modo de administração (ex: Subcutâneo, 1x por semana à noite)' },
            frequency: { type: 'string', description: 'Frequência de uso' },
            duration: { type: 'string', description: 'Tempo total do ciclo ou tratamento (ex: 4 semanas)' }
          },
          required: ['medication', 'dosage', 'instructions', 'frequency']
        }
      }
    },
    required: ['patient_id', 'items']
  }
};

export async function savePrescriptionDraft(
  params: {
    patient_id: string;
    items: PrescriptionItem[];
  },
  db: any
): Promise<ToolResult<Prescription>> {
  try {
    const prescription = await db.createPrescription({
      patient_id: params.patient_id,
      items: params.items,
      status: 'draft'
    });
    return { success: true, data: prescription };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao salvar rascunho de prescrição' };
  }
}
