// src/ai-tools/create-followup-message.ts
import { ToolResult } from './types';

export const createFollowupMessageDefinition = {
  name: 'create_followup_message',
  description: 'Gera uma mensagem médica personalizada e empática para acompanhamento do paciente via WhatsApp ou E-mail.',
  parameters: {
    type: 'object',
    properties: {
      patient_id: { type: 'string', description: 'UUID do paciente' },
      channel: { type: 'string', enum: ['whatsapp', 'email', 'sms'], description: 'Canal de envio' },
      message: { type: 'string', description: 'Conteúdo da mensagem a ser enviada' }
    },
    required: ['patient_id', 'channel', 'message']
  }
};

export async function createFollowupMessage(
  params: {
    patient_id: string;
    channel: 'whatsapp' | 'email' | 'sms';
    message: string;
  },
  db: any
): Promise<ToolResult<{ id: string; message: string; channel: string; status: string }>> {
  try {
    const followup = await db.createFollowupMessage({
      patient_id: params.patient_id,
      channel: params.channel,
      message: params.message,
      status: 'draft'
    });
    return { success: true, data: followup };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao gerar mensagem de follow-up' };
  }
}
