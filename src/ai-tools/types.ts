// src/ai-tools/types.ts
// Tipos padronizados compartilhados para a camada de IA e banco do Lucci Clinic OS

export interface Patient {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  gender: 'M' | 'F' | 'Outro';
  phone: string;
  email?: string;
  blood_type?: string;
  allergies?: string;
  emergency_contact?: string;
  status: 'ativo' | 'em_tratamento' | 'em_risco' | 'inativo';
  created_at: string;
  profile?: PatientProfile;
}

export interface PatientProfile {
  weight_kg: number;
  height_cm: number;
  bmi: number;
  body_fat_pct?: number;
  main_complaint?: string;
  current_protocol?: string;
  notes?: string;
}

export interface Anamnese {
  id: string;
  patient_id: string;
  doctor_id?: string;
  symptoms_summary: string;
  clinical_notes: string;
  soap_subjective?: string;
  soap_objective?: string;
  soap_assessment?: string;
  soap_plan?: string;
  status: 'draft' | 'approved' | 'finalized';
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  type: string;
  status: 'agendado' | 'confirmado' | 'em_espera' | 'em_atendimento' | 'concluido' | 'cancelado';
  notes?: string;
}

export interface Exam {
  id: string;
  patient_id: string;
  file_name: string;
  file_url?: string;
  exam_type: string;
  exam_date: string;
  extracted_data?: Record<string, any>;
  vision_analysis_summary?: string;
  patient_name_verified: boolean;
  birth_date_verified: boolean;
  security_alert?: string;
}

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  instructions: string;
  frequency: string;
  duration?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  items: PrescriptionItem[];
  vidas_sc_code?: string;
  digital_signature_hash?: string;
  status: 'draft' | 'signed' | 'sent';
  signature_date?: string;
  created_at: string;
}

export interface PatientSummary {
  patient: Patient;
  latest_anamnese?: Anamnese | null;
  recent_appointments: Appointment[];
  recent_exams: Exam[];
}

export interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
