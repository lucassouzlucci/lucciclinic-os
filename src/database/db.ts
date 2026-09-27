// src/database/db.ts
// Camada de persistência relacional do Lucci Clinic OS
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  doctor: any;
  patients: any[];
  anamneses: any[];
  exams: any[];
  prescriptions: any[];
  care_plans: any[];
  appointments: any[];
  followup_messages: any[];
  finance_transactions: any[];
  leads: any[];
}

function getInitialData(): DatabaseSchema {
  return {
    doctor: {
      name: 'Dr. Lucas Lucci',
      crm: 'CRM-SC 28419',
      rqe: 'RQE 19284',
      email: 'lucciclinic@gmail.com',
      clinic: 'Lucci Clinic - Medicina & Alta Performance',
      address: 'Av. Atlântica, 2400 - Centro',
      city: 'Balneário Camboriú',
      state: 'SC',
      phone: '(47) 99876-5432',
      digital_cert_token: 'ICP-BR-SC-9981-VIDAS-2026'
    },
    patients: [
      {
        id: 'pat-001',
        full_name: 'Rodrigo Santoro Alencar',
        cpf: '084.219.542-88',
        birth_date: '1987-05-14',
        gender: 'M',
        phone: '(47) 99123-4567',
        email: 'rodrigo.alencar@email.com',
        blood_type: 'O+',
        allergies: 'Dipirona',
        emergency_contact: 'Mariana (Esposa) - (47) 99123-4568',
        status: 'em_tratamento',
        created_at: '2026-03-10T10:00:00Z',
        profile: {
          weight_kg: 94.5,
          height_cm: 181,
          bmi: 28.8,
          body_fat_pct: 26.4,
          main_complaint: 'Dificuldade para perder gordura abdominal, cansaço no meio da tarde e lentidão metabólica.',
          current_protocol: 'Tirzepatida 2.5mg + Plano Metabólico Inicial',
          notes: 'Pratica musculação 3x/semana. Excelente adesão alimentar inicial.'
        }
      },
      {
        id: 'pat-002',
        full_name: 'Fernanda Meirelles Prado',
        cpf: '341.872.190-21',
        birth_date: '1992-11-28',
        gender: 'F',
        phone: '(47) 99234-5678',
        email: 'fernanda.prado@email.com',
        blood_type: 'A+',
        allergies: 'Frutos do mar',
        emergency_contact: 'Lucas Prado (Irmão) - (47) 99234-5679',
        status: 'ativo',
        created_at: '2026-03-15T14:30:00Z',
        profile: {
          weight_kg: 68.2,
          height_cm: 167,
          bmi: 24.4,
          body_fat_pct: 23.1,
          main_complaint: 'Otimização metabólica, disposição para treinos de corrida e definição muscular.',
          current_protocol: 'Peptide Protocol + Otimização Hormonal',
          notes: 'Corredora amadora de 10km. Exames inflamatórios ótimos.'
        }
      },
      {
        id: 'pat-003',
        full_name: 'Marcos Vinicius Rezende',
        cpf: '729.114.650-04',
        birth_date: '1981-08-03',
        gender: 'M',
        phone: '(47) 99345-6789',
        email: 'marcos.rezende@email.com',
        blood_type: 'B+',
        allergies: 'Nenhuma conhecida',
        emergency_contact: 'Claudia Rezende - (47) 99345-6780',
        status: 'em_risco',
        created_at: '2026-02-20T09:15:00Z',
        profile: {
          weight_kg: 106.0,
          height_cm: 178,
          bmi: 33.5,
          body_fat_pct: 32.8,
          main_complaint: 'Esteatose hepática grau 2, queixa de apneia do sono e resistência insulínica severa.',
          current_protocol: 'Tirzepatida 5.0mg + Acompanhamento Intensivo',
          notes: 'Paciente em monitoramento prioritário. Próximo check-in em 15 dias.'
        }
      },
      {
        id: 'pat-004',
        full_name: 'Juliana Camargo Neves',
        cpf: '912.445.871-33',
        birth_date: '1995-02-19',
        gender: 'F',
        phone: '(47) 99456-7890',
        email: 'juliana.neves@email.com',
        blood_type: 'O-',
        allergies: 'Penicilina',
        emergency_contact: 'Paulo Neves - (47) 99456-7891',
        status: 'ativo',
        created_at: '2026-04-02T16:00:00Z',
        profile: {
          weight_kg: 61.0,
          height_cm: 165,
          bmi: 22.4,
          body_fat_pct: 20.5,
          main_complaint: 'Ajuste de suplementação anti-aging e controle do cortisol.',
          current_protocol: 'Plano Metabólico Inicial',
          notes: 'Excelente resposta terapêutica.'
        }
      }
    ],
    anamneses: [
      {
        id: 'ana-001',
        patient_id: 'pat-001',
        doctor_id: 'doc-001',
        symptoms_summary: 'Ganho de peso progressivo nos últimos 2 anos, queixa de compulsão noturna.',
        clinical_notes: 'Paciente com indicação de protocolo duplo com Tirzepatida. Exames cardiovasculares sem anormalidades.',
        soap_subjective: 'Relata fome constante a partir das 18h, episódios de compulsão por doces e sonolência pós-almoço.',
        soap_objective: 'PA 120/80 mmHg. FC 72 bpm. Peso: 94.5 kg. Circunferência abdominal: 99 cm.',
        soap_assessment: 'Sobrepeso metabólico com resistência periférica à insulina.',
        soap_plan: '1. Iniciar Tirzepatida 2.5mg SC semanal.\n2. Dieta hiperproteica com 190g proteína/dia.\n3. Suplementação de CoQ10 e Cromo Quelato.\n4. Retorno em 30 dias.',
        status: 'approved',
        created_at: '2026-03-10T10:30:00Z'
      }
    ],
    exams: [
      {
        id: 'ex-001',
        patient_id: 'pat-001',
        file_name: 'Laudo_Laboratorial_Rodrigo_Alencar_Mar2026.pdf',
        file_url: '/exams/laudo_rodrigo.pdf',
        exam_type: 'laboratorial',
        exam_date: '2026-03-08',
        extracted_data: {
          glicemia_jejum: 104,
          hba1c: 5.8,
          insulina_basal: 14.2,
          homa_ir: 3.65,
          testosterona_total: 340,
          testosterona_livre: 6.8,
          triglicerideos: 165
        },
        vision_analysis_summary: 'Laudo analisado com Visão Computacional Médica: Titularidade confirmada (Rodrigo Santoro Alencar). Indicadores de resistência insulínica e perfil androgênico no tercil inferior.',
        patient_name_verified: true,
        birth_date_verified: true,
        security_alert: null
      }
    ],
    prescriptions: [
      {
        id: 'presc-001',
        patient_id: 'pat-001',
        items: [
          {
            medication: 'Tirzepatida (Injetável)',
            dosage: '2.5 mg / 0.5 mL',
            instructions: 'Aplicar 0,5 mL por via subcutânea no abdômen ou coxa, 1 vez por semana, preferencialmente à noite.',
            frequency: '1x por semana',
            duration: '4 semanas'
          },
          {
            medication: 'Cloridrato de Ondansetrona',
            dosage: '4 mg',
            instructions: 'Tomar 1 comprimido VO se houver náuseas leves no dia da aplicação.',
            frequency: 'Se necessário',
            duration: 'Uso pontual'
          }
        ],
        vidas_sc_code: 'VIDAS-SC-482910',
        digital_signature_hash: 'SHA256:dGhpc19pc19hX3ByZXZpZXdfc2lnbmF0dXJlX2x1Y2FzX2x1Y2Np',
        status: 'signed',
        signature_date: '2026-03-10T10:45:00Z',
        created_at: '2026-03-10T10:40:00Z'
      }
    ],
    care_plans: [
      {
        id: 'cp-001',
        patient_id: 'pat-001',
        protocol_name: 'Plano Metabólico Inicial (PMI)',
        caloric_target: 2100,
        protein_target_g: 190,
        carb_target_g: 160,
        fat_target_g: 65,
        supplementation: 'Whey Isolate 30g pós-treino, Creatina 5g/dia, Magnésio Dimalato 400mg à noite.',
        workout_summary: 'Musculação ABC (Empurrar/Puxar/Pernas) 4x por semana + 30 min cardio moderado.',
        status: 'active',
        created_at: '2026-03-10T10:50:00Z'
      }
    ],
    appointments: [
      {
        id: 'app-001',
        patient_id: 'pat-001',
        appointment_date: '2026-09-28',
        appointment_time: '14:00',
        duration_minutes: 45,
        type: 'Retorno',
        status: 'confirmado',
        notes: 'Avaliação de 30 dias do protocolo Tirzepatida e pesagem de bioimpedância.'
      },
      {
        id: 'app-002',
        patient_id: 'pat-002',
        appointment_date: '2026-09-28',
        appointment_time: '15:00',
        duration_minutes: 45,
        type: 'Acompanhamento Hormonal',
        status: 'agendado',
        notes: 'Ajuste de dosagens e renovação de receita VIDAS SC.'
      },
      {
        id: 'app-003',
        patient_id: 'pat-003',
        appointment_date: '2026-09-28',
        appointment_time: '16:00',
        duration_minutes: 60,
        type: 'Primeira Consulta',
        status: 'em_espera',
        notes: 'Paciente na recepção. Prioridade metabólica.'
      },
      {
        id: 'app-004',
        patient_id: 'pat-004',
        appointment_date: '2026-09-29',
        appointment_time: '10:30',
        duration_minutes: 45,
        type: 'Bioimpedância',
        status: 'agendado',
        notes: 'Check de composição corporal e controle de cortisol.'
      }
    ],
    followup_messages: [
      {
        id: 'fol-001',
        patient_id: 'pat-001',
        channel: 'whatsapp',
        message: 'Olá Rodrigo! Aqui é da Lucci Clinic. Passando para confirmar sua consulta de retorno amanhã às 14:00 com o Dr. Lucas Lucci.',
        status: 'sent',
        sent_at: '2026-09-27T09:00:00Z',
        created_at: '2026-09-27T08:50:00Z'
      }
    ],
    finance_transactions: [
      {
        id: 'tx-001',
        type: 'income',
        category: 'Protocolo Tirzepatida',
        description: 'Ciclo Trimestral Emagrecimento - Rodrigo Santoro',
        amount: 3800.0,
        patient_id: 'pat-001',
        payment_method: 'Cartão de Crédito 3x',
        transaction_date: '2026-09-10',
        status: 'pago'
      },
      {
        id: 'tx-002',
        type: 'income',
        category: 'Consulta',
        description: 'Consulta Médica de Otimização - Fernanda Prado',
        amount: 850.0,
        patient_id: 'pat-002',
        payment_method: 'PIX',
        transaction_date: '2026-09-15',
        status: 'pago'
      },
      {
        id: 'tx-003',
        type: 'income',
        category: 'Kiwify Digital',
        description: 'Vendas Ebook: Tirzepatida na Prática Clínica (Hub)',
        amount: 1410.0,
        patient_id: null,
        payment_method: 'Kiwify Pagamentos',
        transaction_date: '2026-09-22',
        status: 'pago'
      },
      {
        id: 'tx-004',
        type: 'income',
        category: 'Kiwify Digital',
        description: 'Vendas Ebook: Plano Metabólico Inicial (PMI)',
        amount: 940.0,
        patient_id: null,
        payment_method: 'Kiwify Pagamentos',
        transaction_date: '2026-09-25',
        status: 'pago'
      },
      {
        id: 'tx-005',
        type: 'expense',
        category: 'Despesa Operacional',
        description: 'Insumos Clínicos e Manutenção Balneário Camboriú',
        amount: 1250.0,
        patient_id: null,
        payment_method: 'Boleto',
        transaction_date: '2026-09-18',
        status: 'pago'
      }
    ],
    leads: [
      {
        id: 'lead-001',
        full_name: 'Gabriel Menezes',
        phone: '(47) 98811-2233',
        email: 'gabriel.m@gmail.com',
        source_funnel: 'Guia Tirzepatida Gratuito',
        status: 'qualificado',
        product_interest: 'Protocolo Emagrecimento Lucci Clinic',
        created_at: '2026-09-26T18:20:00Z'
      },
      {
        id: 'lead-002',
        full_name: 'Carla Beatriz Souza',
        phone: '(47) 98722-3344',
        email: 'carla.bsouza@hotmail.com',
        source_funnel: 'Instagram @drlucaslucci',
        status: 'novo',
        product_interest: 'Consulta Médica de Rotina',
        created_at: '2026-09-27T11:45:00Z'
      }
    ]
  };
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Erro ao ler database.json, inicializando dados padrão:', e);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erro ao salvar database.json:', e);
    }
  }

  // Métodos de Pacientes
  async getPatients() {
    return this.data.patients;
  }

  async getPatientById(id: string) {
    return this.data.patients.find(p => p.id === id) || null;
  }

  async createPatient(payload: any) {
    const newPat = {
      id: `pat-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      status: 'ativo',
      ...payload
    };
    this.data.patients.unshift(newPat);
    this.saveData(this.data);
    return newPat;
  }

  async updatePatient(id: string, payload: any) {
    const idx = this.data.patients.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.data.patients[idx] = { ...this.data.patients[idx], ...payload };
      this.saveData(this.data);
      return this.data.patients[idx];
    }
    return null;
  }

  // Métodos de Anamnese
  async getLatestAnamnese(patientId: string) {
    const list = this.data.anamneses.filter(a => a.patient_id === patientId);
    return list.length ? list[list.length - 1] : null;
  }

  async getAnamneseHistory(patientId: string) {
    return this.data.anamneses
      .filter(a => a.patient_id === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createAnamnese(payload: any) {
    const newAna = {
      id: `ana-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      status: 'draft',
      ...payload
    };
    this.data.anamneses.push(newAna);
    this.saveData(this.data);
    return newAna;
  }

  async updateAnamnese(id: string, payload: any) {
    const idx = this.data.anamneses.findIndex(a => a.id === id);
    if (idx >= 0) {
      this.data.anamneses[idx] = { ...this.data.anamneses[idx], ...payload };
      this.saveData(this.data);
      return this.data.anamneses[idx];
    }
    return null;
  }

  // Métodos de Exames
  async getRecentExams(patientId: string, limit: number = 5) {
    return this.data.exams
      .filter(e => e.patient_id === patientId)
      .slice(0, limit);
  }

  async createExam(payload: any) {
    const newExam = {
      id: `ex-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      ...payload
    };
    this.data.exams.unshift(newExam);
    this.saveData(this.data);
    return newExam;
  }

  // Métodos de Prescrições
  async getPrescriptions(patientId: string) {
    return this.data.prescriptions.filter(p => p.patient_id === patientId);
  }

  async createPrescription(payload: any) {
    const newPresc = {
      id: `presc-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      status: 'draft',
      ...payload
    };
    this.data.prescriptions.push(newPresc);
    this.saveData(this.data);
    return newPresc;
  }

  async updatePrescription(id: string, payload: any) {
    const idx = this.data.prescriptions.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.data.prescriptions[idx] = { ...this.data.prescriptions[idx], ...payload };
      this.saveData(this.data);
      return this.data.prescriptions[idx];
    }
    return null;
  }

  // Métodos de Agendamentos
  async getAppointments() {
    return this.data.appointments;
  }

  async getRecentAppointments(patientId: string, limit: number = 3) {
    return this.data.appointments
      .filter(a => a.patient_id === patientId)
      .slice(0, limit);
  }

  async createAppointment(payload: any) {
    const newApp = {
      id: `app-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      status: 'agendado',
      ...payload
    };
    this.data.appointments.push(newApp);
    this.saveData(this.data);
    return newApp;
  }

  async updateAppointmentStatus(id: string, status: string) {
    const idx = this.data.appointments.findIndex(a => a.id === id);
    if (idx >= 0) {
      this.data.appointments[idx].status = status;
      this.saveData(this.data);
      return this.data.appointments[idx];
    }
    return null;
  }

  // Follow-up
  async createFollowupMessage(payload: any) {
    const newFollowup = {
      id: `fol-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      ...payload
    };
    this.data.followup_messages.push(newFollowup);
    this.saveData(this.data);
    return newFollowup;
  }

  // Financeiro
  async getFinanceTransactions() {
    return this.data.finance_transactions;
  }

  async getFinancialSnapshot() {
    const txs = this.data.finance_transactions;
    let income = 0;
    let expenses = 0;
    txs.forEach(t => {
      if (t.status === 'pago') {
        if (t.type === 'income') income += Number(t.amount);
        if (t.type === 'expense') expenses += Number(t.amount);
      }
    });
    return {
      total_income: income,
      total_expenses: expenses,
      net_balance: income - expenses,
      transaction_count: txs.length
    };
  }

  // Leads
  async getLeads() {
    return this.data.leads;
  }

  // Perfil Médico
  async getDoctorProfile() {
    return this.data.doctor;
  }

  async updateDoctorProfile(payload: any) {
    this.data.doctor = { ...this.data.doctor, ...payload };
    this.saveData(this.data);
    return this.data.doctor;
  }
}

export const db = new DatabaseService();
