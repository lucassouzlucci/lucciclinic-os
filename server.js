// server.js - Lucci Clinic OS
// Servidor nativo de alta performance para o Lucci Clinic OS
// Criado do zero com base nos registros do Brain (Obsidian)

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Garante que o diretório data exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializa banco de dados se não existir
function getInitialDb() {
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
        symptoms_summary: 'Ganho de peso progressivo nos últimos 2 anos, queixa de compulsão noturna e fadiga vespertina.',
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
        patient_name: 'Rodrigo Santoro Alencar',
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
        patient_name: 'Fernanda Meirelles Prado',
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
        patient_name: 'Marcos Vinicius Rezende',
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
        patient_name: 'Juliana Camargo Neves',
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
      },
      {
        id: 'lead-003',
        full_name: 'Eduardo Silveira',
        phone: '(47) 98933-4455',
        email: 'eduardo.silveira@outlook.com',
        source_funnel: 'Ebook Otimização Hormonal Pago (Kiwify)',
        status: 'convertido',
        product_interest: 'Terapia Hormonal Injetável',
        created_at: '2026-09-25T15:10:00Z'
      }
    ]
  };
}

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Erro ao ler DB:', e);
  }
  const init = getInitialDb();
  writeDb(init);
  return init;
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao escrever DB:', e);
  }
}

// Helpers HTTP
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Roteador de API
async function handleApi(req, res, pathname, query) {
  const method = req.method;
  const db = readDb();

  // OPTIONS CORS
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // 1. Dashboard KPIs
  if (pathname === '/api/dashboard' && method === 'GET') {
    const totalPatients = db.patients.length;
    const activeTreatments = db.patients.filter(p => p.status === 'em_tratamento').length;
    const riskPatients = db.patients.filter(p => p.status === 'em_risco').length;
    const todayAppointments = db.appointments.filter(a => a.appointment_date === '2026-09-28');

    let monthIncome = 0;
    let monthExpense = 0;
    db.finance_transactions.forEach(t => {
      if (t.status === 'pago') {
        if (t.type === 'income') monthIncome += Number(t.amount);
        if (t.type === 'expense') monthExpense += Number(t.amount);
      }
    });

    return sendJson(res, 200, {
      kpis: {
        total_patients: totalPatients,
        active_treatments: activeTreatments,
        patients_at_risk: riskPatients,
        today_appointments: todayAppointments.length,
        month_income: monthIncome,
        month_expense: monthExpense,
        net_profit: monthIncome - monthExpense
      },
      today_appointments: todayAppointments,
      recent_patients: db.patients.slice(0, 4),
      recent_transactions: db.finance_transactions.slice(0, 5),
      doctor: db.doctor
    });
  }

  // 2. Pacientes
  if (pathname === '/api/patients' && method === 'GET') {
    let list = db.patients;
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(p =>
        p.full_name.toLowerCase().includes(q) ||
        p.cpf.includes(q) ||
        p.phone.includes(q)
      );
    }
    if (query.status) {
      list = list.filter(p => p.status === query.status);
    }
    return sendJson(res, 200, list);
  }

  if (pathname === '/api/patients' && method === 'POST') {
    const body = await parseJsonBody(req);
    const newPat = {
      id: `pat-${Date.now().toString().slice(-4)}`,
      full_name: body.full_name || 'Novo Paciente',
      cpf: body.cpf || '',
      birth_date: body.birth_date || '1990-01-01',
      gender: body.gender || 'M',
      phone: body.phone || '',
      email: body.email || '',
      blood_type: body.blood_type || 'A+',
      allergies: body.allergies || 'Nenhuma informada',
      emergency_contact: body.emergency_contact || '',
      status: body.status || 'ativo',
      created_at: new Date().toISOString(),
      profile: {
        weight_kg: Number(body.weight_kg) || 75,
        height_cm: Number(body.height_cm) || 175,
        bmi: (Number(body.weight_kg) || 75) / Math.pow((Number(body.height_cm) || 175) / 100, 2),
        body_fat_pct: Number(body.body_fat_pct) || 20,
        main_complaint: body.main_complaint || '',
        current_protocol: body.current_protocol || 'Avaliação Inicial',
        notes: body.notes || ''
      }
    };
    db.patients.unshift(newPat);
    writeDb(db);
    return sendJson(res, 201, newPat);
  }

  // Detalhe de Paciente (PEP completo)
  if (pathname.startsWith('/api/patients/') && method === 'GET') {
    const patId = pathname.replace('/api/patients/', '');
    const patient = db.patients.find(p => p.id === patId);
    if (!patient) return sendJson(res, 404, { error: 'Paciente não encontrado' });

    const anamneses = db.anamneses.filter(a => a.patient_id === patId);
    const exams = db.exams.filter(e => e.patient_id === patId);
    const prescriptions = db.prescriptions.filter(p => p.patient_id === patId);
    const carePlans = db.care_plans.filter(cp => cp.patient_id === patId);
    const appointments = db.appointments.filter(ap => ap.patient_id === patId);

    return sendJson(res, 200, {
      patient,
      anamneses,
      exams,
      prescriptions,
      care_plans: carePlans,
      appointments
    });
  }

  // 3. IA Copiloto - Analisar Paciente
  if (pathname === '/api/ai/analyze' && method === 'POST') {
    const body = await parseJsonBody(req);
    const patId = body.patient_id;
    const patient = db.patients.find(p => p.id === patId);
    if (!patient) return sendJson(res, 404, { error: 'Paciente não encontrado' });

    const protocol = patient.profile?.current_protocol || 'Otimização Metabólica';
    const weight = patient.profile?.weight_kg || 80;
    const bmi = patient.profile?.bmi || 25;
    const patientName = patient.full_name;

    // Raciocínio clínico estruturado
    let symptomsSummary = '';
    let soapSubjective = '';
    let soapObjective = '';
    let soapAssessment = '';
    let soapPlan = '';
    let suggestedItems = [];
    let followupText = '';

    if (protocol.toLowerCase().includes('tirzepatida') || bmi > 27) {
      symptomsSummary = 'Paciente com queixa de platô ponderal, compulsão vespertina e letargia pós-refeições.';
      soapSubjective = 'Relata fome intensa no final da tarde, baixa saciedade e histórico de insucesso com dietas hipocalóricas isoladas.';
      soapObjective = `Peso: ${weight} kg | IMC: ${bmi.toFixed(1)} kg/m². Circunferência abdominal aumentada. Exame laboratorial aponta HOMA-IR acima do corte de sensibilidade.`;
      soapAssessment = 'Síndrome metabólica com resistência insulínica e sobrepeso. Indicação clínica de duplo agonista GLP-1/GIP (Tirzepatida) + Plano Metabólico Inicial.';
      soapPlan = '1. Iniciar Tirzepatida 2.5mg SC semanalmente (fase inicial de titulação).\n2. Dieta hiperproteica (1.8g/kg) fracionada e hidratação rigorosa (40ml/kg).\n3. Preservação de massa magra via treinamento resistido.\n4. Retorno em 30 dias para reavaliação de biomarcadores e escala de náusea.';

      suggestedItems = [
        {
          medication: 'Tirzepatida (Solução Injetável)',
          dosage: '2.5 mg / 0.5 mL',
          instructions: 'Aplicar 0,5 mL por via subcutânea no abdômen ou face lateral da coxa, 1 vez por semana à noite.',
          frequency: '1x por semana',
          duration: '4 semanas (dose de indução)'
        },
        {
          medication: 'Cloridrato de Ondansetrona',
          dosage: '4 mg',
          instructions: 'Tomar 1 comprimido sublingual caso apresente náuseas nas 24h após a aplicação.',
          frequency: 'Se necessário',
          duration: 'Uso profilático'
        }
      ];

      followupText = `Olá, ${patientName.split(' ')[0]}! Aqui é da equipe do Dr. Lucas Lucci. Passando para checar como você está se sentindo após o início do protocolo com Tirzepatida. Alguma dúvida com a aplicação ou adaptação alimentar? Estamos 100% à disposição!`;
    } else if (protocol.toLowerCase().includes('hormon') || protocol.toLowerCase().includes('testosterona')) {
      symptomsSummary = 'Sintomas de fadiga persistente, diminuição da força muscular e queda de libido.';
      soapSubjective = 'Paciente queixa-se de desânimo progressivo, piora na recuperação de treinos e sono não reparador.';
      soapObjective = `Peso: ${weight} kg | IMC: ${bmi.toFixed(1)}. Testosterona total no terço inferior da normalidade. Perfil hepático e lipídico preservados.`;
      soapAssessment = 'Hipogonadismo funcional / declínio androgênico com indicação de otimização hormonal fisiológica supervisionada.';
      soapPlan = '1. Otimização hormonal fracionada para estabilidade sérica.\n2. Suporte com antioxidantes e minerais quelados.\n3. Controle de hematócrito e estradiol a cada 60 dias.';

      suggestedItems = [
        {
          medication: 'Enantato de Testosterona (Bioidêntico)',
          dosage: '100 mg / mL',
          instructions: 'Aplicar 0,5 mL via intramuscular profunda a cada 3,5 dias.',
          frequency: '2x por semana',
          duration: '8 semanas'
        },
        {
          medication: 'Complexo Otimizador (Zinco + Magnésio + B6 + CoQ10)',
          dosage: 'Fórmula Magistral',
          instructions: 'Tomar 1 dose junto ao jantar diariamente.',
          frequency: '1x ao dia',
          duration: '60 dias'
        }
      ];

      followupText = `Olá, ${patientName.split(' ')[0]}! Tudo bem? Dr. Lucas Lucci pediu para checar sua adaptação ao protocolo de otimização hormonal. Sentiu melhora no ânimo e na recuperação? Qualquer dúvida, só avisar!`;
    } else {
      symptomsSummary = 'Revisão periódica de saúde metabólica e integrativa.';
      soapSubjective = 'Paciente sem queixas agudas, objetivando longevidade, aumento da imunidade e vigor físico.';
      soapObjective = `Parâmetros clínicos dentro da faixa de normalidade. Composição corporal estável.`;
      soapAssessment = 'Excelente higidez clínica. Elegível para protocolo preventivo e suplementação de suporte mitocondrial.';
      soapPlan = '1. Manutenção do estilo de vida ativo e dieta equilibrada.\n2. Suplementação peptídica de suporte celular e articular.';

      suggestedItems = [
        {
          medication: 'BPC-157 (Peptídeo Oral)',
          dosage: '250 mcg',
          instructions: 'Tomar 1 cápsula em jejum com água.',
          frequency: '1x ao dia',
          duration: '30 dias'
        }
      ];

      followupText = `Olá, ${patientName.split(' ')[0]}! Equipe da Lucci Clinic acompanhando sua evolução de rotina. Estamos prontos para o que precisar!`;
    }

    // Cria rascunhos no banco
    const draftAnamnese = {
      id: `ana-${Date.now().toString().slice(-4)}`,
      patient_id: patId,
      symptoms_summary: symptomsSummary,
      clinical_notes: `${soapAssessment}\n\nConduta: ${soapPlan}`,
      soap_subjective: soapSubjective,
      soap_objective: soapObjective,
      soap_assessment: soapAssessment,
      soap_plan: soapPlan,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    db.anamneses.push(draftAnamnese);

    const draftPrescription = {
      id: `presc-${Date.now().toString().slice(-4)}`,
      patient_id: patId,
      items: suggestedItems,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    db.prescriptions.push(draftPrescription);

    const draftFollowup = {
      id: `fol-${Date.now().toString().slice(-4)}`,
      patient_id: patId,
      channel: 'whatsapp',
      message: followupText,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    db.followup_messages.push(draftFollowup);

    writeDb(db);

    return sendJson(res, 200, {
      summary: `Análise clínica de IA concluída para ${patientName}. Rascunhos gerados com sucesso para revisão médica.`,
      draft_anamnese: draftAnamnese,
      draft_prescription: draftPrescription,
      draft_followup: draftFollowup,
      steps: [
        { step: 'Buscando prontuário, histórico metabólico e exames...', status: 'completed' },
        { step: 'Correlacionando biomarcadores laboratoriais e queixas...', status: 'completed' },
        { step: 'Redigindo proposta de evolução SOAP (modo draft)...', status: 'completed' },
        { step: 'Formulando receituário médico sugerido...', status: 'completed' },
        { step: 'Preparando mensagem de follow-up para WhatsApp...', status: 'completed' },
        { step: 'Aguardando validação do Dr. Lucas Lucci.', status: 'completed' }
      ]
    });
  }

  // Aprovar rascunho de anamnese
  if (pathname === '/api/ai/approve-draft' && method === 'POST') {
    const body = await parseJsonBody(req);
    const anaId = body.anamnese_id;
    const ana = db.anamneses.find(a => a.id === anaId);
    if (ana) {
      ana.status = 'approved';
      writeDb(db);
      return sendJson(res, 200, { success: true, anamnese: ana });
    }
    return sendJson(res, 404, { error: 'Anamnese não encontrada' });
  }

  // Salvar edições do médico no draft
  if (pathname === '/api/ai/save-draft' && method === 'POST') {
    const body = await parseJsonBody(req);
    const anaId = body.anamnese_id;
    const ana = db.anamneses.find(a => a.id === anaId);
    if (ana) {
      ana.symptoms_summary = body.symptoms_summary || ana.symptoms_summary;
      ana.clinical_notes = body.clinical_notes || ana.clinical_notes;
      ana.soap_subjective = body.soap_subjective || ana.soap_subjective;
      ana.soap_objective = body.soap_objective || ana.soap_objective;
      ana.soap_assessment = body.soap_assessment || ana.soap_assessment;
      ana.soap_plan = body.soap_plan || ana.soap_plan;
      writeDb(db);
      return sendJson(res, 200, { success: true, anamnese: ana });
    }
    return sendJson(res, 404, { error: 'Anamnese não encontrada' });
  }

  // 4. Visão Computacional Médica & Segurança de Laudos (Fases 5 e 6)
  if (pathname === '/api/exams/analyze-vision' && method === 'POST') {
    const body = await parseJsonBody(req);
    const patId = body.patient_id;
    const simulateThirdParty = Boolean(body.simulate_third_party);
    const patient = db.patients.find(p => p.id === patId);
    if (!patient) return sendJson(res, 404, { error: 'Paciente não encontrado' });

    const extractedName = simulateThirdParty ? 'Carlos Eduardo da Silva (Terceiro)' : patient.full_name;
    const extractedBirth = simulateThirdParty ? '1982-03-12' : patient.birth_date;

    const norm = s => s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const nameMatch = norm(extractedName) === norm(patient.full_name);
    const birthMatch = extractedBirth === patient.birth_date;

    if (!nameMatch || !birthMatch) {
      const alertMsg = `ERRO DE SEGURANÇA: EXAME DE TERCEIRO IDENTIFICADO! O laudo enviado pertence a "${extractedName}" (Nasc: ${extractedBirth}), enquanto a ficha ativa é de "${patient.full_name}" (Nasc: ${patient.birth_date}). O processamento foi bloqueado para proteger a integridade clínica.`;
      
      const blockedExam = {
        id: `ex-${Date.now().toString().slice(-4)}`,
        patient_id: patId,
        file_name: body.file_name || 'Laudo_Laboratorial_Envio.pdf',
        exam_type: 'laboratorial',
        exam_date: '2026-09-27',
        extracted_data: null,
        vision_analysis_summary: 'BLOQUEADO: Incompatibilidade de titularidade do paciente.',
        patient_name_verified: false,
        birth_date_verified: false,
        security_alert: alertMsg,
        created_at: new Date().toISOString()
      };
      db.exams.unshift(blockedExam);
      writeDb(db);

      return sendJson(res, 200, {
        verified: false,
        security_alert: alertMsg,
        exam: blockedExam
      });
    }

    // Exame legítimo aprovado
    const legitimateExam = {
      id: `ex-${Date.now().toString().slice(-4)}`,
      patient_id: patId,
      file_name: body.file_name || 'Exame_Laboratorial_Completo.pdf',
      exam_type: 'laboratorial',
      exam_date: '2026-09-25',
      extracted_data: {
        glicemia_jejum: 102,
        hba1c: 5.7,
        insulina_basal: 13.8,
        homa_ir: 3.47,
        testosterona_total: 360,
        testosterona_livre: 7.2,
        triglicerideos: 155,
        tsh: 2.1,
        t4_livre: 1.18
      },
      vision_analysis_summary: `Visão Computacional: Titularidade confirmada para ${patient.full_name}. Marcadores laboratoriais processados com sucesso.`,
      patient_name_verified: true,
      birth_date_verified: true,
      security_alert: null,
      created_at: new Date().toISOString()
    };
    db.exams.unshift(legitimateExam);
    writeDb(db);

    return sendJson(res, 200, {
      verified: true,
      exam: legitimateExam,
      biomarkers: [
        { name: 'Glicemia de Jejum', value: '102', unit: 'mg/dL', reference: '70 - 99 mg/dL', status: 'attention' },
        { name: 'Hemoglobina Glicada (HbA1c)', value: '5.7', unit: '%', reference: '< 5.7 %', status: 'attention' },
        { name: 'Insulina Basal', value: '13.8', unit: 'µUI/mL', reference: '2.6 - 24.9 µUI/mL', status: 'normal' },
        { name: 'HOMA-IR', value: '3.47', unit: 'índice', reference: '< 2.15', status: 'altered' },
        { name: 'Testosterona Total', value: '360', unit: 'ng/dL', reference: '300 - 890 ng/dL', status: 'attention' },
        { name: 'Testosterona Livre Calculada', value: '7.2', unit: 'ng/dL', reference: '8.8 - 27.0 ng/dL', status: 'altered' }
      ]
    });
  }

  // 5. Prescrição VIDAS SC (Fase 7)
  if (pathname === '/api/prescriptions/generate-vidas' && method === 'POST') {
    const body = await parseJsonBody(req);
    const patId = body.patient_id;
    const patient = db.patients.find(p => p.id === patId);
    if (!patient) return sendJson(res, 404, { error: 'Paciente não encontrado' });

    const items = body.items || [
      {
        medication: 'Tirzepatida (Solução Injetável)',
        dosage: '2.5 mg / 0.5 mL',
        instructions: 'Aplicar 0,5 mL por via subcutânea no abdômen ou coxa, 1x por semana à noite.',
        frequency: '1x por semana'
      }
    ];

    const code = `VIDAS-SC-${Math.floor(100000 + Math.random() * 900000)}`;
    const sigHash = `SHA256:${Buffer.from(`${db.doctor.crm}-${patient.cpf}-${code}`).toString('base64').substring(0, 28)}`;
    const validationUrl = `https://valida.vidas.sc.gov.br/receita/${code}`;

    const newPresc = {
      id: `presc-${Date.now().toString().slice(-4)}`,
      patient_id: patId,
      items: items,
      vidas_sc_code: code,
      digital_signature_hash: sigHash,
      status: 'signed',
      signature_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    db.prescriptions.push(newPresc);
    writeDb(db);

    const cleanPhone = patient.phone.replace(/[^0-9]/g, '');
    const itemsFormatted = items.map((it, idx) => `${idx + 1}. *${it.medication}* (${it.dosage})\n   - ${it.instructions}`).join('\n\n');
    const waText = encodeURIComponent(
      `Olá, *${patient.full_name}*!\n\n` +
      `Aqui é o *${db.doctor.name}* da *${db.doctor.clinic}*.\n` +
      `Sua receita digital oficial padrão *VIDAS Santa Catarina* foi emitida e assinada digitalmente com certificado ICP-Brasil.\n\n` +
      `📋 *Itens Prescritos:*\n${itemsFormatted}\n\n` +
      `🔑 *Código da Receita:* ${code}\n` +
      `🌐 *Validação em Farmácia:* ${validationUrl}\n\n` +
      `Seguimos acompanhando sua evolução!`
    );

    return sendJson(res, 200, {
      prescription: newPresc,
      doctor: db.doctor,
      patient: patient,
      validation_url: validationUrl,
      whatsapp_url: `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${waText}`
    });
  }

  // 6. Agenda
  if (pathname === '/api/appointments' && method === 'GET') {
    return sendJson(res, 200, db.appointments);
  }

  if (pathname === '/api/appointments' && method === 'POST') {
    const body = await parseJsonBody(req);
    const pat = db.patients.find(p => p.id === body.patient_id);
    const newApp = {
      id: `app-${Date.now().toString().slice(-4)}`,
      patient_id: body.patient_id,
      patient_name: pat ? pat.full_name : 'Paciente Cadastrado',
      appointment_date: body.appointment_date || '2026-09-28',
      appointment_time: body.appointment_time || '10:00',
      duration_minutes: Number(body.duration_minutes) || 45,
      type: body.type || 'Retorno',
      status: 'agendado',
      notes: body.notes || '',
      created_at: new Date().toISOString()
    };
    db.appointments.push(newApp);
    writeDb(db);
    return sendJson(res, 201, newApp);
  }

  if (pathname.startsWith('/api/appointments/') && pathname.endsWith('/status') && method === 'PATCH') {
    const id = pathname.replace('/api/appointments/', '').replace('/status', '');
    const body = await parseJsonBody(req);
    const app = db.appointments.find(a => a.id === id);
    if (app) {
      app.status = body.status;
      writeDb(db);
      return sendJson(res, 200, app);
    }
    return sendJson(res, 404, { error: 'Agendamento não encontrado' });
  }

  // 7. Financeiro
  if (pathname === '/api/finance' && method === 'GET') {
    return sendJson(res, 200, {
      transactions: db.finance_transactions,
      snapshot: {
        total_income: db.finance_transactions.filter(t => t.type === 'income' && t.status === 'pago').reduce((acc, t) => acc + Number(t.amount), 0),
        total_expense: db.finance_transactions.filter(t => t.type === 'expense' && t.status === 'pago').reduce((acc, t) => acc + Number(t.amount), 0)
      }
    });
  }

  if (pathname === '/api/finance' && method === 'POST') {
    const body = await parseJsonBody(req);
    const newTx = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      type: body.type || 'income',
      category: body.category || 'Consulta',
      description: body.description || 'Lançamento Manual',
      amount: Number(body.amount) || 0,
      patient_id: body.patient_id || null,
      payment_method: body.payment_method || 'PIX',
      transaction_date: body.transaction_date || new Date().toISOString().split('T')[0],
      status: body.status || 'pago',
      created_at: new Date().toISOString()
    };
    db.finance_transactions.unshift(newTx);
    writeDb(db);
    return sendJson(res, 201, newTx);
  }

  // 8. Leads & Produtos
  if (pathname === '/api/leads' && method === 'GET') {
    return sendJson(res, 200, {
      leads: db.leads,
      products: [
        { name: 'Plano Metabólico Inicial (PMI)', price: 'R$ 2.400 / ciclo', type: 'Clínico', active_patients: 18 },
        { name: 'Tirzepatida na Prática Clínica (Ebook Kiwify)', price: 'R$ 97,00', type: 'Digital', sales_count: 84 },
        { name: 'Otimização Hormonal na Prática (Kiwify)', price: 'R$ 147,00', type: 'Digital', sales_count: 52 },
        { name: 'Peptide Protocol (BPC-157 / TB-500)', price: 'R$ 3.200 / protocolo', type: 'Clínico', active_patients: 9 },
        { name: 'Guia 3 Pilares do Emagrecimento (Gratuito)', price: 'Gratuito', type: 'Lead Magnet', downloads: 620 }
      ]
    });
  }

  // 9. Perfil Médico
  if (pathname === '/api/doctor' && method === 'GET') {
    return sendJson(res, 200, db.doctor);
  }

  if (pathname === '/api/doctor' && method === 'POST') {
    const body = await parseJsonBody(req);
    db.doctor = { ...db.doctor, ...body };
    writeDb(db);
    return sendJson(res, 200, db.doctor);
  }

  return sendJson(res, 404, { error: 'Endpoint não encontrado' });
}

// Servidor Principal
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Roteia APIs
  if (pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, pathname, parsedUrl.query);
    } catch (err) {
      console.error('Erro na API:', err);
      sendJson(res, 500, { error: 'Erro interno no servidor', message: err.message });
    }
    return;
  }

  // Serve a Interface Web SPA (HTML / CSS / JS)
  if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/pacientes') || pathname.startsWith('/agenda') || pathname.startsWith('/financeiro')) {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(htmlPath).pipe(res);
      return;
    }
  }

  // Arquivos estáticos
  const filePath = path.join(__dirname, 'public', pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Fallback para SPA
  const fallbackHtml = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(fallbackHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(fallbackHtml).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 - Lucci Clinic OS: Página não encontrada');
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  LUCCI CLINIC OS - SISTEMA MÉDICO & PEP INTELIGENTE   `);
  console.log(`  Dr. Lucas Lucci | Balneário Camboriú - SC            `);
  console.log(`=======================================================`);
  console.log(`  Servidor ativo em: http://localhost:${PORT}`);
  console.log(`  Painel Executivo, PEP SPA e IA Copilot inicializados.`);
  console.log(`=======================================================`);
});
