// public/app.js - Lógica Client-Side do Lucci Clinic OS
// Conecta todas as APIs, gerencia a máquina de estados do Copiloto IA e a SPA

let state = {
  currentView: 'dashboard',
  patients: [],
  filteredPatients: [],
  activePatientId: 'pat-001',
  activePatientData: null,
  appointments: [],
  doctor: null,
  currentAnamneseDraft: null,
  currentPrescriptionDraft: null,
  currentFollowupDraft: null,
  activePepTab: 'historico'
};

// =========================================================================
// INICIALIZAÇÃO
// =========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadDoctorProfile();
  await loadPatients();
  await loadDashboardData();
  await loadAppointments();
  await loadFinance();
  await loadProductsAndLeads();
  await loadPatientInPep(state.activePatientId);

  lucide.createIcons();
});

// =========================================================================
// NAVEGAÇÃO ENTRE TELAS (SPA)
// =========================================================================
function navigateTo(viewName) {
  state.currentView = viewName;

  // Esconde todas as views
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));

  // Mostra a view alvo
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove('hidden');

  // Atualiza classes na sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('bg-dark-card', 'text-white');
    item.classList.add('text-slate-300');
  });

  const activeBtn = document.getElementById(`nav-${viewName}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-dark-card', 'text-white');
    activeBtn.classList.remove('text-slate-300');
  }

  lucide.createIcons();
}

function showToast(title, message, isSuccess = true) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  toastTitle.textContent = title;
  toastMsg.textContent = message;
  toastIcon.innerHTML = isSuccess 
    ? '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>'
    : '<i data-lucide="alert-triangle" class="w-5 h-5 text-rose-400"></i>';

  lucide.createIcons();

  toast.classList.remove('translate-y-[-150%]', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-[-150%]', 'opacity-0', 'pointer-events-none');
  }, 4000);
}

// =========================================================================
// 1. DASHBOARD
// =========================================================================
async function loadDashboardData() {
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();

    document.getElementById('kpi-total-patients').textContent = data.kpis.total_patients;
    document.getElementById('kpi-today-appointments').textContent = data.kpis.today_appointments;
    document.getElementById('kpi-income').textContent = `R$ ${data.kpis.month_income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('kpi-risk').textContent = data.kpis.patients_at_risk;
    document.getElementById('badge-patient-count').textContent = data.kpis.total_patients;

    renderDashboardAppointments(data.today_appointments);
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
}

function renderDashboardAppointments(appointments) {
  const container = document.getElementById('dashboard-appointments-list');
  if (!appointments || appointments.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500">Nenhum atendimento agendado para hoje.</td></tr>`;
    return;
  }

  container.innerHTML = appointments.map(app => {
    let statusClass = 'bg-slate-800 text-slate-300';
    let statusLabel = app.status;

    if (app.status === 'confirmado') { statusClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'; statusLabel = 'Confirmado'; }
    if (app.status === 'em_espera') { statusClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20'; statusLabel = 'Na Recepção'; }
    if (app.status === 'em_atendimento') { statusClass = 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'; statusLabel = 'Em Consulta'; }

    return `
      <tr class="hover:bg-dark-card/40 transition-colors">
        <td class="py-3 font-mono font-bold text-white">${app.appointment_time}</td>
        <td class="py-3 font-semibold text-slate-200">${app.patient_name}</td>
        <td class="py-3 text-slate-400">${app.type}</td>
        <td class="py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">${statusLabel}</span></td>
        <td class="py-3 text-right">
          <button onclick="openPatientPepDirect('${app.patient_id}')" class="px-2.5 py-1 bg-dark-card hover:bg-dark-border border border-dark-border text-dark-accent rounded text-[11px] font-semibold transition-all">
            Abrir no PEP
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// =========================================================================
// 2. PACIENTES
// =========================================================================
async function loadPatients() {
  try {
    const res = await fetch('/api/patients');
    state.patients = await res.json();
    state.filteredPatients = [...state.patients];
    renderPatientsGrid();
    populatePatientSelects();
  } catch (err) {
    console.error('Erro ao carregar pacientes:', err);
  }
}

function renderPatientsGrid() {
  const container = document.getElementById('patients-grid');
  if (state.filteredPatients.length === 0) {
    container.innerHTML = `<div class="col-span-2 p-8 text-center text-slate-500 bg-dark-surface rounded-2xl border border-dark-border">Nenhum paciente encontrado com os filtros selecionados.</div>`;
    return;
  }

  container.innerHTML = state.filteredPatients.map(p => {
    let statusBadge = 'bg-slate-800 text-slate-300';
    if (p.status === 'em_tratamento') statusBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (p.status === 'em_risco') statusBadge = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

    const initials = p.full_name.split(' ').map(n => n[0]).slice(0, 2).join('');
    const weight = p.profile?.weight_kg || '-';
    const bmi = p.profile?.bmi ? p.profile.bmi.toFixed(1) : '-';
    const protocol = p.profile?.current_protocol || 'Avaliação Inicial';

    return `
      <div class="p-5 rounded-2xl bg-dark-surface border border-dark-border hover:border-slate-700 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-dark-accent flex items-center justify-center font-bold text-white shadow-md">
                ${initials}
              </div>
              <div>
                <h3 class="font-bold text-white text-sm">${p.full_name}</h3>
                <div class="text-[11px] text-slate-400 font-mono">CPF: ${p.cpf}</div>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}">${p.status.replace('_', ' ')}</span>
          </div>

          <div class="grid grid-cols-3 gap-2 my-4 text-center">
            <div class="p-2 rounded-lg bg-dark-card border border-dark-border">
              <div class="text-[10px] text-slate-400 uppercase font-semibold">Peso</div>
              <div class="text-xs font-bold text-white mt-0.5">${weight} kg</div>
            </div>
            <div class="p-2 rounded-lg bg-dark-card border border-dark-border">
              <div class="text-[10px] text-slate-400 uppercase font-semibold">IMC</div>
              <div class="text-xs font-bold text-white mt-0.5">${bmi}</div>
            </div>
            <div class="p-2 rounded-lg bg-dark-card border border-dark-border">
              <div class="text-[10px] text-slate-400 uppercase font-semibold">Gordura</div>
              <div class="text-xs font-bold text-white mt-0.5">${p.profile?.body_fat_pct || '-'} %</div>
            </div>
          </div>

          <div class="p-2.5 rounded-lg bg-dark-card/50 border border-dark-border text-xs">
            <span class="text-[10px] text-dark-accent font-semibold uppercase block">Protocolo Atual:</span>
            <div class="text-slate-200 font-medium truncate mt-0.5">${protocol}</div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-dark-border/60 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-mono">${p.phone}</span>
          <button onclick="openPatientPepDirect('${p.id}')" class="px-3 py-1.5 bg-dark-accent/20 hover:bg-dark-accent/30 text-dark-accent text-xs font-bold rounded-lg border border-dark-accent/30 transition-all flex items-center gap-1.5">
            <i data-lucide="stethoscope" class="w-3.5 h-3.5"></i> Abrir no PEP
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function filterPatients() {
  const query = document.getElementById('patient-search-input').value.toLowerCase();
  state.filteredPatients = state.patients.filter(p =>
    p.full_name.toLowerCase().includes(query) ||
    p.cpf.includes(query) ||
    p.phone.includes(query)
  );
  renderPatientsGrid();
}

function filterByStatus(status) {
  document.querySelectorAll('.status-filter-btn').forEach(btn => {
    btn.classList.remove('bg-dark-border', 'text-white');
    btn.classList.add('bg-dark-card', 'text-slate-400');
  });
  event.target.classList.add('bg-dark-border', 'text-white');
  event.target.classList.remove('bg-dark-card', 'text-slate-400');

  if (!status) {
    state.filteredPatients = [...state.patients];
  } else {
    state.filteredPatients = state.patients.filter(p => p.status === status);
  }
  renderPatientsGrid();
}

function populatePatientSelects() {
  const pepSelect = document.getElementById('pep-patient-select');
  const naSelect = document.getElementById('na-patient');

  const options = state.patients.map(p => `<option value="${p.id}">${p.full_name}</option>`).join('');

  if (pepSelect) pepSelect.innerHTML = options;
  if (naSelect) naSelect.innerHTML = options;
}

// =========================================================================
// 3. PEP INTELIGENTE (SPA DO PRONTUÁRIO ELETRÔNICO)
// =========================================================================
function openPatientPepDirect(patientId) {
  loadPatientInPep(patientId);
  navigateTo('pep');
}

async function loadPatientInPep(patientId) {
  state.activePatientId = patientId;
  const select = document.getElementById('pep-patient-select');
  if (select) select.value = patientId;

  try {
    const res = await fetch(`/api/patients/${patientId}`);
    const data = await res.json();
    state.activePatientData = data;

    const p = data.patient;
    const initials = p.full_name.split(' ').map(n => n[0]).slice(0, 2).join('');
    document.getElementById('pep-avatar').textContent = initials;
    document.getElementById('pep-patient-name').textContent = p.full_name;
    document.getElementById('pep-patient-status').textContent = p.status.replace('_', ' ');
    document.getElementById('pep-patient-cpf').textContent = p.cpf;
    document.getElementById('pep-patient-phone').textContent = p.phone;
    document.getElementById('pep-patient-allergies').textContent = p.allergies || 'Nenhuma informada';

    // Calcula idade
    const birthYear = new Date(p.birth_date).getFullYear();
    const age = 2026 - birthYear;
    document.getElementById('pep-patient-age').textContent = `${age} anos`;

    // Métricas
    document.getElementById('pep-metric-weight').textContent = `${p.profile?.weight_kg || '-'} kg`;
    document.getElementById('pep-metric-bmi').textContent = `${p.profile?.height_cm || '-'} cm (${p.profile?.bmi?.toFixed(1) || '-'})`;
    document.getElementById('pep-metric-fat').textContent = `${p.profile?.body_fat_pct || '-'} %`;
    document.getElementById('pep-metric-protocol').textContent = p.profile?.current_protocol || 'Não definido';

    // Renderiza abas
    renderPepAnamneses(data.anamneses);
    renderPepExams(data.exams);
    renderPepPrescriptions(data.prescriptions);
    renderPepCarePlans(data.care_plans);

    // Reseta estado do copiloto para idle
    resetCopilotState();

    // Carrega dados da receita VIDAS SC
    prepareVidasRecipePreview(p, data.prescriptions);

  } catch (err) {
    console.error('Erro ao carregar dados do paciente no PEP:', err);
  }
}

function switchPepTab(tabName) {
  state.activePepTab = tabName;

  document.querySelectorAll('.pep-tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(`pep-tab-${tabName}`).classList.remove('hidden');

  document.querySelectorAll('.pep-tab-btn').forEach(btn => {
    btn.classList.remove('text-brand-500', 'border-brand-500', 'text-dark-accent', 'border-dark-accent');
    btn.classList.add('text-slate-400', 'border-transparent');
  });

  const activeBtn = document.getElementById(`pep-tab-btn-${tabName}`);
  if (tabName === 'assinar') {
    activeBtn.classList.add('text-dark-accent', 'border-dark-accent');
  } else {
    activeBtn.classList.add('text-brand-500', 'border-brand-500');
  }

  lucide.createIcons();
}

// -------------------------------------------------------------------------
// COPILOTO DE IA - MÁQUINA DE ESTADOS & ANÁLISE AGÊNTICA
// -------------------------------------------------------------------------
function resetCopilotState() {
  document.getElementById('copilot-state-idle').classList.remove('hidden');
  document.getElementById('copilot-state-loading').classList.add('hidden');
  document.getElementById('copilot-state-result').classList.add('hidden');
}

async function runAiCopilotAnalysis() {
  document.getElementById('copilot-state-idle').classList.add('hidden');
  document.getElementById('copilot-state-loading').classList.remove('hidden');
  document.getElementById('copilot-state-result').classList.add('hidden');

  const stepsList = document.getElementById('copilot-steps-list');
  stepsList.innerHTML = '';

  const steps = [
    'Carregando dados metabólicos, histórico e exames...',
    'Correlacionando biomarcadores laboratoriais com queixa principal...',
    'Aplicando protocolos médicos (Tirzepatida / Hormônios / Peptídeos)...',
    'Formulando evolução estruturada no modelo SOAP...',
    'Gerando rascunho de receituário médico e mensagem de WhatsApp...'
  ];

  for (let i = 0; i < steps.length; i++) {
    stepsList.innerHTML += `<div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-dark-accent animate-ping"></span>${steps[i]}</div>`;
    await new Promise(r => setTimeout(r, 600));
  }

  try {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: state.activePatientId })
    });
    const result = await res.json();

    state.currentAnamneseDraft = result.draft_anamnese;
    state.currentPrescriptionDraft = result.draft_prescription;
    state.currentFollowupDraft = result.draft_followup;

    document.getElementById('copilot-state-loading').classList.add('hidden');
    document.getElementById('copilot-state-result').classList.remove('hidden');

    // Popula campos SOAP
    document.getElementById('draft-view-s').textContent = result.draft_anamnese.soap_subjective;
    document.getElementById('draft-view-o').textContent = result.draft_anamnese.soap_objective;
    document.getElementById('draft-view-a').textContent = result.draft_anamnese.soap_assessment;
    document.getElementById('draft-view-p').textContent = result.draft_anamnese.soap_plan;

    showToast('Copiloto IA Concluído', 'Rascunhos clínicos criados em modo draft para sua revisão.');
    lucide.createIcons();
  } catch (err) {
    console.error('Erro na análise da IA:', err);
    showToast('Falha na IA', 'Não foi possível completar a análise.', false);
    resetCopilotState();
  }
}

function toggleEditDraft(isEditing) {
  const viewBox = document.getElementById('draft-soap-view');
  const editBox = document.getElementById('draft-soap-edit');

  if (isEditing && state.currentAnamneseDraft) {
    document.getElementById('edit-soap-s').value = state.currentAnamneseDraft.soap_subjective;
    document.getElementById('edit-soap-o').value = state.currentAnamneseDraft.soap_objective;
    document.getElementById('edit-soap-a').value = state.currentAnamneseDraft.soap_assessment;
    document.getElementById('edit-soap-p').value = state.currentAnamneseDraft.soap_plan;

    viewBox.classList.add('hidden');
    editBox.classList.remove('hidden');
  } else {
    viewBox.classList.remove('hidden');
    editBox.classList.add('hidden');
  }
}

async function saveDraftEdits() {
  if (!state.currentAnamneseDraft) return;

  const payload = {
    anamnese_id: state.currentAnamneseDraft.id,
    soap_subjective: document.getElementById('edit-soap-s').value,
    soap_objective: document.getElementById('edit-soap-o').value,
    soap_assessment: document.getElementById('edit-soap-a').value,
    soap_plan: document.getElementById('edit-soap-p').value
  };

  try {
    const res = await fetch('/api/ai/save-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    state.currentAnamneseDraft = data.anamnese;

    document.getElementById('draft-view-s').textContent = data.anamnese.soap_subjective;
    document.getElementById('draft-view-o').textContent = data.anamnese.soap_objective;
    document.getElementById('draft-view-a').textContent = data.anamnese.soap_assessment;
    document.getElementById('draft-view-p').textContent = data.anamnese.soap_plan;

    toggleEditDraft(false);
    showToast('Alterações Salvas', 'Rascunho atualizado com sucesso.');
  } catch (err) {
    console.error('Erro ao salvar edições:', err);
  }
}

async function approveCurrentDraft() {
  if (!state.currentAnamneseDraft) return;

  try {
    const res = await fetch('/api/ai/approve-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anamnese_id: state.currentAnamneseDraft.id })
    });
    const data = await res.json();

    showToast('Prontuário Aprovado!', 'A evolução clínica foi validada e consolidada pelo Dr. Lucas Lucci.');
    await loadPatientInPep(state.activePatientId);
  } catch (err) {
    console.error('Erro ao aprovar draft:', err);
  }
}

// -------------------------------------------------------------------------
// RENDERIZAÇÃO DAS ABAS DO PEP
// -------------------------------------------------------------------------
function renderPepAnamneses(anamneses) {
  const container = document.getElementById('pep-anamneses-list');
  const countEl = document.getElementById('anamneses-count');

  if (!anamneses || anamneses.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-slate-500 bg-dark-surface rounded-xl border border-dark-border">Nenhuma evolução registrada ainda. Use o Copiloto IA acima para iniciar.</div>`;
    countEl.textContent = '0 registros';
    return;
  }

  countEl.textContent = `${anamneses.length} ${anamneses.length === 1 ? 'registro' : 'registros'}`;

  container.innerHTML = anamneses.map(a => {
    const dateFormatted = new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const isApproved = a.status === 'approved' || a.status === 'finalized';

    return `
      <div class="p-5 rounded-2xl bg-dark-surface border border-dark-border space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'} uppercase">
              ${isApproved ? 'Aprovado pelo Médico' : 'Rascunho (Draft)'}
            </span>
            <span class="text-xs text-slate-400 font-mono">${dateFormatted}</span>
          </div>
          <span class="text-xs text-slate-400 font-medium">Médico: <strong>Dr. Lucas Lucci (CRM-SC 28419)</strong></span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-lg bg-dark-card border border-dark-border">
            <span class="text-[10px] font-bold text-dark-accent uppercase">Subjetivo:</span>
            <p class="text-slate-300 mt-1">${a.soap_subjective || a.symptoms_summary || '-'}</p>
          </div>
          <div class="p-3 rounded-lg bg-dark-card border border-dark-border">
            <span class="text-[10px] font-bold text-dark-accent uppercase">Objetivo:</span>
            <p class="text-slate-300 mt-1">${a.soap_objective || '-'}</p>
          </div>
          <div class="p-3 rounded-lg bg-dark-card border border-dark-border">
            <span class="text-[10px] font-bold text-dark-accent uppercase">Avaliação:</span>
            <p class="text-slate-300 mt-1">${a.soap_assessment || '-'}</p>
          </div>
          <div class="p-3 rounded-lg bg-dark-card border border-dark-border">
            <span class="text-[10px] font-bold text-dark-accent uppercase">Plano:</span>
            <p class="text-slate-300 mt-1 whitespace-pre-line">${a.soap_plan || a.clinical_notes || '-'}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------------------
// VISÃO COMPUTACIONAL & SEGURANÇA CLÍNICA (FASES 5 E 6)
// -------------------------------------------------------------------------
async function triggerExamVision(simulateThirdParty) {
  const resultBox = document.getElementById('vision-result-container');
  const alertBox = document.getElementById('vision-security-alert');
  const successBox = document.getElementById('vision-success-box');
  const alertText = document.getElementById('vision-security-text');

  resultBox.classList.remove('hidden');

  try {
    const res = await fetch('/api/exams/analyze-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: state.activePatientId,
        simulate_third_party: simulateThirdParty,
        file_name: simulateThirdParty ? 'Exame_Laboratorial_Terceiro.pdf' : 'Laudo_Laboratorial_Oficial.pdf'
      })
    });
    const data = await res.json();

    if (!data.verified) {
      // ERRO DE SEGURANÇA: EXAME DE TERCEIRO IDENTIFICADO
      alertBox.classList.remove('hidden');
      successBox.classList.add('hidden');
      alertText.textContent = data.security_alert;
      showToast('Alerta de Segurança', 'Exame de terceiro bloqueado com sucesso.', false);
    } else {
      // EXAME VÁLIDO E PROCESSADO
      alertBox.classList.add('hidden');
      successBox.classList.remove('hidden');
      document.getElementById('vision-verified-name').textContent = state.activePatientData.patient.full_name;

      const tbody = document.getElementById('biomarkers-table-body');
      tbody.innerHTML = data.biomarkers.map(b => {
        let badge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
        let label = 'Normal';
        if (b.status === 'attention') { badge = 'bg-amber-500/10 text-amber-400 border border-amber-500/30'; label = 'Atenção'; }
        if (b.status === 'altered') { badge = 'bg-rose-500/10 text-rose-400 border border-rose-500/30'; label = 'Alterado'; }

        return `
          <tr class="hover:bg-dark-card/40 transition-colors">
            <td class="p-3 font-semibold text-slate-200">${b.name}</td>
            <td class="p-3 font-mono font-bold text-white">${b.value} <span class="text-[10px] text-slate-400 font-normal">${b.unit}</span></td>
            <td class="p-3 text-slate-400">${b.reference}</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}">${label}</span></td>
          </tr>
        `;
      }).join('');

      showToast('Visão Computacional', 'Laudo processado e biomarcadores extraídos com sucesso.');
    }

    await loadPatientInPep(state.activePatientId);
    lucide.createIcons();
  } catch (err) {
    console.error('Erro na visão computacional:', err);
  }
}

function renderPepExams(exams) {
  const container = document.getElementById('exams-history-list');
  if (!exams || exams.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-slate-500 bg-dark-surface rounded-xl border border-dark-border">Nenhum exame catalogado.</div>`;
    return;
  }

  container.innerHTML = exams.map(ex => {
    const isSecurityAlert = Boolean(ex.security_alert);
    return `
      <div class="p-4 rounded-xl ${isSecurityAlert ? 'bg-rose-500/10 border-rose-500/30' : 'bg-dark-surface border-dark-border'} border flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg ${isSecurityAlert ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/10 text-cyan-400'} flex items-center justify-center">
            <i data-lucide="${isSecurityAlert ? 'shield-x' : 'file-text'}" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-white">${ex.file_name}</div>
            <div class="text-[11px] text-slate-400">${ex.vision_analysis_summary}</div>
          </div>
        </div>
        <span class="text-[10px] font-mono ${isSecurityAlert ? 'text-rose-400 font-bold' : 'text-slate-400'}">${ex.exam_date}</span>
      </div>
    `;
  }).join('');
}

function renderPepPrescriptions(prescriptions) {
  const container = document.getElementById('prescriptions-list');
  if (!prescriptions || prescriptions.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-slate-500 bg-dark-surface rounded-xl border border-dark-border">Nenhuma prescrição ativa. Gere uma sugestão pelo Copiloto IA ou emita pelo padrão VIDAS SC.</div>`;
    return;
  }

  container.innerHTML = prescriptions.map(pr => {
    const isSigned = pr.status === 'signed';
    return `
      <div class="p-5 rounded-2xl bg-dark-surface border border-dark-border space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isSigned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'} uppercase">
              ${isSigned ? 'Assinada (VIDAS SC)' : 'Rascunho (Draft)'}
            </span>
            ${pr.vidas_sc_code ? `<span class="font-mono text-xs text-dark-accent font-bold">${pr.vidas_sc_code}</span>` : ''}
          </div>
          <span class="text-xs text-slate-400 font-mono">${new Date(pr.created_at).toLocaleDateString('pt-BR')}</span>
        </div>

        <div class="space-y-2">
          ${(pr.items || []).map((it, idx) => `
            <div class="p-3 rounded-xl bg-dark-card border border-dark-border">
              <div class="font-bold text-xs text-white">${idx + 1}. ${it.medication} - <span class="text-dark-accent">${it.dosage}</span></div>
              <div class="text-xs text-slate-300 mt-0.5">${it.instructions}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">Frequência: ${it.frequency} ${it.duration ? `• Duração: ${it.duration}` : ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderPepCarePlans(plans) {
  if (!plans || plans.length === 0) return;
  const cp = plans[0];
  document.getElementById('careplan-protocol-name').textContent = cp.protocol_name;
  document.getElementById('careplan-calories').textContent = `${cp.caloric_target} kcal`;
  document.getElementById('careplan-protein').textContent = `${cp.protein_target_g} g`;
  document.getElementById('careplan-carbs').textContent = `${cp.carb_target_g} g`;
  document.getElementById('careplan-fats').textContent = `${cp.fat_target_g} g`;
  if (cp.supplementation) document.getElementById('careplan-supplements').textContent = cp.supplementation;
  if (cp.workout_summary) document.getElementById('careplan-workout').textContent = cp.workout_summary;
}

// -------------------------------------------------------------------------
// FASE 7 - RECEITUÁRIO OFICIAL VIDAS SC & WHATSAPP
// -------------------------------------------------------------------------
function prepareVidasRecipePreview(patient, prescriptions) {
  if (state.doctor) {
    document.getElementById('recipe-doc-name').textContent = state.doctor.name;
    document.getElementById('recipe-doc-crm').textContent = `${state.doctor.crm} • ${state.doctor.rqe || 'RQE Ativo'}`;
    document.getElementById('recipe-doc-clinic').textContent = `${state.doctor.clinic} • ${state.doctor.address}`;
  }

  document.getElementById('recipe-patient-name').textContent = patient.full_name;
  document.getElementById('recipe-patient-cpf').textContent = patient.cpf;

  const signedPresc = prescriptions.find(p => p.status === 'signed');
  if (signedPresc) {
    document.getElementById('recipe-code').textContent = signedPresc.vidas_sc_code || 'VIDAS-SC-482910';
    document.getElementById('recipe-hash').textContent = signedPresc.digital_signature_hash || 'SHA256:dGhpc19pc19h';

    if (signedPresc.items && signedPresc.items.length > 0) {
      document.getElementById('recipe-items-container').innerHTML = signedPresc.items.map((it, idx) => `
        <div class="p-4 rounded-xl bg-dark-card/40 border border-dark-border">
          <div class="font-bold text-sm text-emerald-400">${idx + 1}. ${it.medication} (${it.dosage})</div>
          <div class="text-xs text-slate-300 mt-1">${it.instructions}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Frequência: ${it.frequency} ${it.duration ? `• Duração: ${it.duration}` : ''}</div>
        </div>
      `).join('');
    }
  }

  // Prepara link WhatsApp
  const cleanPhone = patient.phone.replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(`Olá, ${patient.full_name}! Sua receita médica digital padrão VIDAS SC do Dr. Lucas Lucci já está disponível para validação.`);
  document.getElementById('btn-send-whatsapp').href = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${waText}`;
}

async function generateOfficialVidasRecipe() {
  try {
    const res = await fetch('/api/prescriptions/generate-vidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: state.activePatientId,
        items: state.currentPrescriptionDraft?.items || undefined
      })
    });
    const data = await res.json();

    document.getElementById('recipe-code').textContent = data.prescription.vidas_sc_code;
    document.getElementById('recipe-hash').textContent = data.prescription.digital_signature_hash;
    document.getElementById('btn-send-whatsapp').href = data.whatsapp_url;

    showToast('Receita VIDAS SC Emitida!', 'Assinatura digital ICP-Brasil concluída e link do WhatsApp gerado.');
    await loadPatientInPep(state.activePatientId);
  } catch (err) {
    console.error('Erro ao emitir receita VIDAS SC:', err);
  }
}

// =========================================================================
// 4. AGENDA
// =========================================================================
async function loadAppointments() {
  try {
    const res = await fetch('/api/appointments');
    state.appointments = await res.json();
    renderAgendaTable();
  } catch (err) {
    console.error('Erro ao carregar agenda:', err);
  }
}

function renderAgendaTable() {
  const container = document.getElementById('agenda-table-body');
  if (state.appointments.length === 0) {
    container.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500">Nenhum atendimento cadastrado.</td></tr>`;
    return;
  }

  container.innerHTML = state.appointments.map(app => {
    let statusBadge = 'bg-slate-800 text-slate-300';
    if (app.status === 'confirmado') statusBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (app.status === 'em_espera') statusBadge = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (app.status === 'em_atendimento') statusBadge = 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    if (app.status === 'concluido') statusBadge = 'bg-brand-500/10 text-brand-500 border border-brand-500/20';

    return `
      <tr class="hover:bg-dark-card/40 transition-colors">
        <td class="py-3.5 font-mono text-slate-300">${app.appointment_date}</td>
        <td class="py-3.5 font-mono font-bold text-white">${app.appointment_time}</td>
        <td class="py-3.5 font-semibold text-white">${app.patient_name}</td>
        <td class="py-3.5 text-slate-400">${app.type}</td>
        <td class="py-3.5">
          <select onchange="updateAppointmentStatus('${app.id}', this.value)" class="bg-dark-card border border-dark-border text-xs rounded px-2 py-1 text-white">
            <option value="agendado" ${app.status === 'agendado' ? 'selected' : ''}>Agendado</option>
            <option value="confirmado" ${app.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
            <option value="em_espera" ${app.status === 'em_espera' ? 'selected' : ''}>Na Recepção</option>
            <option value="em_atendimento" ${app.status === 'em_atendimento' ? 'selected' : ''}>Em Consulta</option>
            <option value="concluido" ${app.status === 'concluido' ? 'selected' : ''}>Concluído</option>
            <option value="cancelado" ${app.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
        <td class="py-3.5 text-slate-400">${app.notes || '-'}</td>
        <td class="py-3.5 text-right">
          <button onclick="openPatientPepDirect('${app.patient_id}')" class="px-3 py-1 bg-dark-card hover:bg-dark-border border border-dark-border text-dark-accent rounded text-xs font-semibold transition-all">
            Atender no PEP
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function updateAppointmentStatus(appId, newStatus) {
  try {
    await fetch(`/api/appointments/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    showToast('Status Atualizado', `Consulta alterada para "${newStatus}".`);
    await loadAppointments();
    await loadDashboardData();
  } catch (err) {
    console.error('Erro ao atualizar status do agendamento:', err);
  }
}

// =========================================================================
// 5. FINANCEIRO
// =========================================================================
async function loadFinance() {
  try {
    const res = await fetch('/api/finance');
    const data = await res.json();

    document.getElementById('fin-income').textContent = `R$ ${data.snapshot.total_income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('fin-expense').textContent = `R$ ${data.snapshot.total_expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    const net = data.snapshot.total_income - data.snapshot.total_expense;
    document.getElementById('fin-net').textContent = `R$ ${net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const tbody = document.getElementById('finance-table-body');
    tbody.innerHTML = data.transactions.map(t => {
      const isIncome = t.type === 'income';
      return `
        <tr class="hover:bg-dark-card/40 transition-colors">
          <td class="py-3 font-mono text-slate-400">${t.transaction_date}</td>
          <td class="py-3 font-semibold text-white">${t.description}</td>
          <td class="py-3 text-slate-400">${t.category}</td>
          <td class="py-3 text-slate-400">${t.payment_method}</td>
          <td class="py-3 font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}">
            ${isIncome ? '+' : '-'} R$ ${Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </td>
          <td class="py-3 text-right">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Pago</span>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Erro ao carregar financeiro:', err);
  }
}

// =========================================================================
// 6. PRODUTOS & LEADS (ECOSSISTEMA LUCCI CLINIC)
// =========================================================================
async function loadProductsAndLeads() {
  try {
    const res = await fetch('/api/leads');
    const data = await res.json();

    const pGrid = document.getElementById('products-grid');
    pGrid.innerHTML = data.products.map(p => `
      <div class="p-5 rounded-2xl bg-dark-surface border border-dark-border flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${p.type === 'Digital' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">${p.type}</span>
            <span class="text-xs font-mono font-bold text-emerald-400">${p.price}</span>
          </div>
          <h3 class="font-bold text-white text-sm">${p.name}</h3>
        </div>
        <div class="mt-4 pt-4 border-t border-dark-border/60 flex items-center justify-between text-xs text-slate-400">
          <span>${p.sales_count ? `${p.sales_count} Vendas (Kiwify)` : `${p.active_patients || p.downloads} em andamento`}</span>
          <span class="text-brand-500 font-semibold flex items-center gap-1">Ativo <i data-lucide="check" class="w-3.5 h-3.5"></i></span>
        </div>
      </div>
    `).join('');

    const lTbody = document.getElementById('leads-table-body');
    lTbody.innerHTML = data.leads.map(l => `
      <tr class="hover:bg-dark-card/40 transition-colors">
        <td class="py-3 font-semibold text-white">${l.full_name}</td>
        <td class="py-3 font-mono text-slate-300">${l.phone}</td>
        <td class="py-3 text-slate-400">${l.source_funnel}</td>
        <td class="py-3 text-dark-accent font-medium">${l.product_interest}</td>
        <td class="py-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${l.status === 'convertido' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'} uppercase">${l.status}</span>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Erro ao carregar produtos e leads:', err);
  }
}

// =========================================================================
// 7. PERFIL MÉDICO
// =========================================================================
async function loadDoctorProfile() {
  try {
    const res = await fetch('/api/doctor');
    const doc = await res.json();
    state.doctor = doc;

    document.getElementById('side-doc-name').textContent = doc.name;
    document.getElementById('side-doc-crm').textContent = doc.crm;

    document.getElementById('doc-input-name').value = doc.name;
    document.getElementById('doc-input-crm').value = doc.crm;
    document.getElementById('doc-input-rqe').value = doc.rqe || '';
    document.getElementById('doc-input-email').value = doc.email;
    document.getElementById('doc-input-clinic').value = doc.clinic;
    document.getElementById('doc-input-address').value = doc.address;
    document.getElementById('doc-input-phone').value = doc.phone;
    document.getElementById('doc-input-token').value = doc.digital_cert_token;
  } catch (err) {
    console.error('Erro ao carregar perfil médico:', err);
  }
}

async function saveDoctorSettings(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('doc-input-name').value,
    crm: document.getElementById('doc-input-crm').value,
    rqe: document.getElementById('doc-input-rqe').value,
    email: document.getElementById('doc-input-email').value,
    clinic: document.getElementById('doc-input-clinic').value,
    address: document.getElementById('doc-input-address').value,
    phone: document.getElementById('doc-input-phone').value,
    digital_cert_token: document.getElementById('doc-input-token').value
  };

  try {
    const res = await fetch('/api/doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    state.doctor = await res.json();

    document.getElementById('side-doc-name').textContent = state.doctor.name;
    document.getElementById('side-doc-crm').textContent = state.doctor.crm;

    showToast('Configurações Salvas', 'Perfil do Dr. Lucas Lucci atualizado.');
  } catch (err) {
    console.error('Erro ao salvar perfil:', err);
  }
}

// =========================================================================
// MODAIS: CADASTROS
// =========================================================================
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function openNewPatientModal() { openModal('modal-patient'); }
function openNewAppointmentModal() { openModal('modal-appointment'); }

async function submitNewPatient(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById('np-name').value,
    cpf: document.getElementById('np-cpf').value,
    birth_date: document.getElementById('np-birth').value,
    phone: document.getElementById('np-phone').value,
    weight_kg: Number(document.getElementById('np-weight').value),
    height_cm: Number(document.getElementById('np-height').value),
    current_protocol: document.getElementById('np-protocol').value,
    main_complaint: document.getElementById('np-complaint').value
  };

  try {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const newPat = await res.json();
    closeModal('modal-patient');
    showToast('Paciente Cadastrado', `${newPat.full_name} inserido no sistema.`);
    await loadPatients();
    await loadDashboardData();
    openPatientPepDirect(newPat.id);
  } catch (err) {
    console.error('Erro ao cadastrar paciente:', err);
  }
}

async function submitNewAppointment(e) {
  e.preventDefault();
  const payload = {
    patient_id: document.getElementById('na-patient').value,
    appointment_date: document.getElementById('na-date').value,
    appointment_time: document.getElementById('na-time').value,
    type: document.getElementById('na-type').value,
    notes: document.getElementById('na-notes').value
  };

  try {
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    closeModal('modal-appointment');
    showToast('Atendimento Agendado', 'Novo horário registrado na agenda médica.');
    await loadAppointments();
    await loadDashboardData();
  } catch (err) {
    console.error('Erro ao agendar consulta:', err);
  }
}
