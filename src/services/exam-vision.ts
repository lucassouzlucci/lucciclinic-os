// src/services/exam-vision.ts
// Módulo de Visão Computacional Médica & Validação de Segurança Clínica (Fases 5 e 6)
import { Patient, Exam } from '../ai-tools/types';

export interface ExamVisionResult {
  verified: boolean;
  security_alert?: string;
  extracted_patient_name: string;
  extracted_birth_date: string;
  lab_name: string;
  exam_date: string;
  biomarkers: Array<{
    name: string;
    value: string;
    unit: string;
    reference: string;
    status: 'normal' | 'altered' | 'attention';
  }>;
  clinical_impression: string;
}

export function analyzeExamWithComputerVision(
  fileName: string,
  targetPatient: Patient,
  simulateThirdParty: boolean = false
): ExamVisionResult {
  // Simulação / Processamento do arquivo de laudo (PDF/Imagem)
  const isTarget = !simulateThirdParty;
  const extractedName = isTarget ? targetPatient.full_name : 'Carlos Eduardo da Silva (Terceiro)';
  const extractedBirth = isTarget ? targetPatient.birth_date : '1982-03-12';

  // Regra de Ouro da Fase 6: Validação de Segurança Clínica
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const nameMatch = normalize(extractedName) === normalize(targetPatient.full_name);
  const birthMatch = extractedBirth === targetPatient.birth_date;

  if (!nameMatch || !birthMatch) {
    return {
      verified: false,
      security_alert: `ERRO DE SEGURANÇA: EXAME DE TERCEIRO IDENTIFICADO! O laudo pertence a "${extractedName}" (Nasc: ${extractedBirth}), enquanto a ficha ativa é de "${targetPatient.full_name}" (Nasc: ${targetPatient.birth_date}). O processamento foi imediatamente bloqueado para proteger a integridade clínica.`,
      extracted_patient_name: extractedName,
      extracted_birth_date: extractedBirth,
      lab_name: 'Laboratório Santa Luzia / DASA - Balneário Camboriú',
      exam_date: '2026-09-15',
      biomarkers: [],
      clinical_impression: 'BLOQUEADO: Incompatibilidade de titularidade no laudo.'
    };
  }

  // Laudo validado com sucesso - extração de biomarcadores
  return {
    verified: true,
    extracted_patient_name: targetPatient.full_name,
    extracted_birth_date: targetPatient.birth_date,
    lab_name: 'Laboratório Santa Luzia / DASA - Balneário Camboriú',
    exam_date: '2026-09-15',
    biomarkers: [
      { name: 'Glicemia de Jejum', value: '104', unit: 'mg/dL', reference: '70 - 99 mg/dL', status: 'attention' },
      { name: 'Hemoglobina Glicada (HbA1c)', value: '5.8', unit: '%', reference: '< 5.7 %', status: 'attention' },
      { name: 'Insulina Basal', value: '14.2', unit: 'µUI/mL', reference: '2.6 - 24.9 µUI/mL', status: 'normal' },
      { name: 'HOMA-IR', value: '3.65', unit: 'índice', reference: '< 2.15', status: 'altered' },
      { name: 'Testosterona Total', value: '340', unit: 'ng/dL', reference: '300 - 890 ng/dL', status: 'attention' },
      { name: 'Testosterona Livre Calculada', value: '6.8', unit: 'ng/dL', reference: '8.8 - 27.0 ng/dL', status: 'altered' },
      { name: 'Estradiol (E2)', value: '28', unit: 'pg/mL', reference: '11 - 44 pg/mL', status: 'normal' },
      { name: 'TSH Ultra Sensível', value: '2.1', unit: 'mUI/L', reference: '0.4 - 4.5 mUI/L', status: 'normal' },
      { name: 'T4 Livre', value: '1.15', unit: 'ng/dL', reference: '0.8 - 1.8 ng/dL', status: 'normal' },
      { name: 'Triglicerídeos', value: '165', unit: 'mg/dL', reference: '< 150 mg/dL', status: 'attention' },
      { name: 'Colesterol HDL', value: '42', unit: 'mg/dL', reference: '> 40 mg/dL', status: 'normal' }
    ],
    clinical_impression: 'Quadro compatível com resistência insulínica subclínica (HOMA-IR elevado) associado a níveis subótimos de testosterona livre. Excelente candidato ao protocolo metabólico integrado e acompanhamento pelo Dr. Lucas Lucci.'
  };
}
