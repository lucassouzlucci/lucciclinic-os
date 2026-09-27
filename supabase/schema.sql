-- =====================================================================
-- Lucci Clinic OS - Esquema Completo de Banco de Dados (Supabase / PostgreSQL)
-- Médico Responsável: Dr. Lucas Lucci - CRM-SC
-- Especialidades: Emagrecimento, Metabolismo, Hormônios, Peptídeos
-- =====================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE USUÁRIOS / MÉDICOS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    crm TEXT NOT NULL,
    clinic_name TEXT DEFAULT 'Lucci Clinic',
    clinic_address TEXT DEFAULT 'Av. Atlântica, Balneário Camboriú - SC',
    phone TEXT,
    role TEXT DEFAULT 'doctor',
    digital_signature_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE PACIENTES
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F', 'Outro')),
    phone TEXT NOT NULL,
    email TEXT,
    blood_type TEXT,
    allergies TEXT,
    emergency_contact TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'em_tratamento', 'em_risco', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PERFIS CLÍNICOS E METABÓLICOS
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    weight_kg NUMERIC(5,2),
    height_cm NUMERIC(5,2),
    bmi NUMERIC(4,2),
    body_fat_pct NUMERIC(4,2),
    main_complaint TEXT,
    current_protocol TEXT,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ANAMNESES E EVOLUÇÕES CLÍNICAS (SOAP)
CREATE TABLE IF NOT EXISTS anamneses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    symptoms_summary TEXT,
    clinical_notes TEXT,
    soap_subjective TEXT,
    soap_objective TEXT,
    soap_assessment TEXT,
    soap_plan TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'finalized')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. EXAMES E VISÃO COMPUTACIONAL
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT,
    exam_type TEXT, -- 'laboratorial', 'bioimpedancia', 'imagem'
    exam_date DATE,
    extracted_data JSONB, -- Marcadores: Insulina, Glicemia, Testosterona, TSH, etc.
    vision_analysis_summary TEXT,
    patient_name_verified BOOLEAN DEFAULT false,
    birth_date_verified BOOLEAN DEFAULT false,
    security_alert TEXT, -- Bloqueio se pertencer a terceiros
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RECEITUÁRIOS E PRESCRIÇÕES (VIDAS SC)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    items JSONB NOT NULL, -- [{ medication, dosage, instructions, frequency }]
    vidas_sc_code TEXT UNIQUE,
    digital_signature_hash TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'sent')),
    signature_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PLANOS DE CUIDADO, DIETAS E PROTOCOLOS
CREATE TABLE IF NOT EXISTS care_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    protocol_name TEXT, -- 'Plano Metabólico Inicial', 'Tirzepatida na Prática', 'Peptide Protocol'
    caloric_target INT,
    protein_target_g INT,
    carb_target_g INT,
    fat_target_g INT,
    supplementation TEXT,
    workout_summary TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. AGENDAMENTOS E CONSULTAS
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 45,
    type TEXT DEFAULT 'Primeira Consulta' CHECK (type IN ('Primeira Consulta', 'Retorno', 'Acompanhamento Hormonal', 'Aplicação Peptídeos', 'Bioimpedância')),
    status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_espera', 'em_atendimento', 'concluido', 'cancelado')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. MENSAGENS DE FOLLOW-UP (WHATSAPP / CRM)
CREATE TABLE IF NOT EXISTS followup_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'sms')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TRANSAÇÕES FINANCEIRAS (CONSULTAS, PROTOCOLOS E PRODUTOS DIGITAIS)
CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL, -- 'Consulta', 'Protocolo Tirzepatida', 'Plano Metabólico', 'Kiwify Digital', 'Despesa Operacional'
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    payment_method TEXT,
    transaction_date DATE NOT NULL,
    status TEXT DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. LEADS E FUNIS COMERCIAIS
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source_funnel TEXT, -- 'Guia Tirzepatida Gratuito', 'Ebook Hormônios', 'Instagram', 'Kiwify'
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'convertido')),
    product_interest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SEED DATA DE INICIALIZAÇÃO
INSERT INTO users (id, email, full_name, crm, clinic_name, clinic_address, phone, role, digital_signature_token)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'lucciclinic@gmail.com',
    'Dr. Lucas Lucci',
    'CRM-SC 28419',
    'Lucci Clinic - Medicina & Alta Performance',
    'Av. Atlântica, Balneário Camboriú - SC',
    '(47) 99876-5432',
    'doctor',
    'ICP-BR-SC-9981-VIDAS-2026'
) ON CONFLICT (email) DO NOTHING;
