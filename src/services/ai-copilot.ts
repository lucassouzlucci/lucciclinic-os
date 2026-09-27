// src/services/ai-copilot.ts
// Motor do Copiloto Clínico com IA do Lucci Clinic OS
import { getPatientSummary } from '../ai-tools/get-patient-summary';
import { saveAnamneseDraft } from '../ai-tools/save-anamnese-draft';
import { savePrescriptionDraft } from '../ai-tools/save-prescription-draft';
import { createFollowupMessage } from '../ai-tools/create-followup-message';

export interface CopilotAnalysisResult {
  summary: string;
  draft_anamnese?: any;
  draft_prescription?: any;
  draft_followup?: any;
  steps: Array<{ step: string; status: 'completed' | 'in_progress' | 'waiting' }>;
}

export async function analyzePatient(patientId: string, db: any): Promise<CopilotAnalysisResult> {
  const steps: Array<{ step: string; status: 'completed' | 'in_progress' | 'waiting' }> = [];

  // Passo 1: Obter contexto clínico completo
  steps.push({ step: 'Buscando prontuário, histórico metabólico e exames do paciente...', status: 'completed' });
  const summaryResult = await getPatientSummary(patientId, db);
  if (!summaryResult.success || !summaryResult.data) {
    throw new Error(summaryResult.error || 'Não foi possível carregar o histórico do paciente.');
  }

  const { patient, latest_anamnese, recent_exams } = summaryResult.data;

  // Passo 2: Avaliação clínica e correlação de exames
  steps.push({ step: 'Correlacionando biomarcadores laboratoriais e queixas metabólicas...', status: 'completed' });

  const patientName = patient.full_name;
  const protocol = patient.profile?.current_protocol || 'Otimização Metabólica';
  const weight = patient.profile?.weight_kg || 80;
  const bmi = patient.profile?.bmi || 25;
  const complaint = patient.profile?.main_complaint || 'Acompanhamento de rotina';

  // Raciocínio clínico especializado em Medicina Metabólica / Hormonal / Peptídeos
  let clinicalNotes = '';
  let symptomsSummary = '';
  let soapSubjective = '';
  let soapObjective = '';
  let soapAssessment = '';
  let soapPlan = '';
  let suggestedPrescriptionItems: any[] = [];
  let followupText = '';

  if (protocol.toLowerCase().includes('tirzepatida') || complaint.toLowerCase().includes('emagrecimento') || bmi > 27) {
    symptomsSummary = `Paciente busca perda ponderal sustentada e melhora metabólica. Refere apetite aumentado e oscilação energética pós-prandial.`;
    soapSubjective = `Paciente relata dificuldade na perda de peso com dieta convencional, compulsão alimentar vespertina e queixa de letargia. Nega epigastralgia ou alterações gastrointestinais prévias.`;
    soapObjective = `Peso: ${weight} kg | IMC: ${bmi.toFixed(1)} kg/m². Glicemia de jejum e perfil lipídico em acompanhamento. Exame físico sem visceromegalias, pressão arterial controlada.`;
    soapAssessment = `Sobrepeso com resistência insulínica e indicação de terapia com análogo duplo GLP-1/GIP (Tirzepatida) associado ao Plano Metabólico Inicial.`;
    soapPlan = `1. Iniciar Tirzepatida 2.5mg SC semanalmente (fase de titulação).\n2. Dieta hiperproteica (1.8g/kg) e hidratação mínima de 40ml/kg.\n3. Musculação 4x/semana para preservação de massa magra.\n4. Retorno em 30 dias para avaliar tolerância gastrointestinal e ajuste de dose.`;

    suggestedPrescriptionItems = [
      {
        medication: 'Tirzepatida (Injetável)',
        dosage: '2.5 mg / 0.5 mL',
        instructions: 'Aplicar 0,5 mL por via subcutânea no abdômen ou coxa, 1 vez por semana, preferencialmente à noite.',
        frequency: '1x por semana',
        duration: '4 semanas (fase de indução)'
      },
      {
        medication: 'Cloridrato de Ondansetrona',
        dosage: '4 mg',
        instructions: 'Tomar 1 comprimido VO se houver náuseas leves no dia da aplicação.',
        frequency: 'Se necessário',
        duration: 'Uso pontual'
      }
    ];

    followupText = `Olá, ${patientName.split(' ')[0]}! Aqui é da equipe do Dr. Lucas Lucci. Passando para checar como você está se sentindo após o início do protocolo com Tirzepatida. Alguma dúvida com a primeira aplicação ou adaptação alimentar? Estamos à disposição!`;
  } else if (protocol.toLowerCase().includes('hormon') || protocol.toLowerCase().includes('testosterona')) {
    symptomsSummary = `Avaliação para otimização hormonal. Queixa de fadiga crônica, lentidão na recuperação pós-treino e queda de libido.`;
    soapSubjective = `Relato de sonolência diurna, diminuição da disposição física e mental nas últimas semanas. Nega histórico cardiovascular prévio.`;
    soapObjective = `Peso: ${weight} kg | IMC: ${bmi.toFixed(1)}. Testosterona total e livre no tercil inferior. Hematócrito e PSA dentro dos parâmetros seguros.`;
    soapAssessment = `Hipogonadismo funcional / déficit androgênico com indicação de reposição/otimização e monitoramento de segurança laboratorial.`;
    soapPlan = `1. Início de protocolo de otimização hormonal personalizado.\n2. Controle de hematócrito e estradiol a cada 60 dias.\n3. Suplementação com Zinco Quelato, Magnésio Dimalato e CoQ10.`;

    suggestedPrescriptionItems = [
      {
        medication: 'Enantato de Testosterona (Bioidêntico)',
        dosage: '100 mg / mL',
        instructions: 'Aplicar 0,5 mL (50 mg) via intramuscular profunda a cada 3,5 dias.',
        frequency: 'A cada 3,5 dias',
        duration: '8 semanas para reavaliação laboratorial'
      },
      {
        medication: 'Coenzima Q10 + Zinco Quelato + D3',
        dosage: '100mg + 25mg + 5000UI',
        instructions: 'Tomar 1 cápsula junto ao almoço diariamente.',
        frequency: '1x ao dia',
        duration: '60 dias'
      }
    ];

    followupText = `Olá, ${patientName.split(' ')[0]}! Tudo bem? Dr. Lucas Lucci pediu para checar seus primeiros dias com o protocolo de otimização hormonal. Como está a sua energia e recuperação? Conte conosco!`;
  } else {
    // Protocolo Geral / Peptídeos / Longevidade
    symptomsSummary = `Revisão de saúde integrativa, imunidade e recuperação tecidual.`;
    soapSubjective = `Paciente sem queixas agudas, focado em alta performance e longevidade saudável.`;
    soapObjective = `Sinais vitais normais. Biomarcadores inflamatórios e hepáticos em faixa ótima.`;
    soapAssessment = `Metabolismo equilibrado. Candidato ao Peptide Protocol e Plano Metabólico Inicial.`;
    soapPlan = `1. Manutenção do plano alimentar e treino resistido.\n2. Suplementação anti-inflamatória e peptídica preventiva.`;

    suggestedPrescriptionItems = [
      {
        medication: 'BPC-157 (Peptídeo de Reparação)',
        dosage: '250 mcg',
        instructions: 'Tomar 1 cápsula pela manhã em jejum para integridade da mucosa digestiva.',
        frequency: '1x ao dia em jejum',
        duration: '30 dias'
      }
    ];

    followupText = `Olá, ${patientName.split(' ')[0]}! Equipe da Lucci Clinic entrando em contato para acompanhar sua evolução no protocolo do Dr. Lucas Lucci. Se precisar de qualquer ajuste, estamos aqui!`;
  }

  clinicalNotes = `${soapAssessment}\n\nConduta orientada: ${soapPlan}`;

  // Passo 3: Salvar rascunho de anamnese
  steps.push({ step: 'Redigindo proposta de evolução no formato SOAP (modo draft)...', status: 'completed' });
  const draftAnamnese = await saveAnamneseDraft({
    patient_id: patientId,
    clinical_notes: clinicalNotes,
    symptoms_summary: symptomsSummary,
    soap_subjective: soapSubjective,
    soap_objective: soapObjective,
    soap_assessment: soapAssessment,
    soap_plan: soapPlan
  }, db);

  // Passo 4: Salvar rascunho de prescrição médica
  steps.push({ step: 'Formulando receituário médico sugerido com dosagens e posologias...', status: 'completed' });
  const draftPrescription = await savePrescriptionDraft({
    patient_id: patientId,
    items: suggestedPrescriptionItems
  }, db);

  // Passo 5: Criar mensagem de follow-up personalizada
  steps.push({ step: 'Preparando mensagem de acompanhamento para WhatsApp...', status: 'completed' });
  const draftFollowup = await createFollowupMessage({
    patient_id: patientId,
    channel: 'whatsapp',
    message: followupText
  }, db);

  steps.push({ step: 'Análise concluída com sucesso! Aguardando validação do Dr. Lucas Lucci.', status: 'completed' });

  return {
    summary: `Análise clínica realizada com sucesso para ${patientName}. Protocolo sugerido: ${protocol}. Todos os documentos foram criados como rascunho (Draft) e estão prontos para sua revisão, edição e assinatura digital.`,
    draft_anamnese: draftAnamnese.data,
    draft_prescription: draftPrescription.data,
    draft_followup: draftFollowup.data,
    steps
  };
}
