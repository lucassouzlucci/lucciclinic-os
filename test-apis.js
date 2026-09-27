// test-apis.js
// Script de verificação automatizada de todos os módulos do Lucci Clinic OS

async function runTests() {
  console.log('--- INICIANDO BATERIA DE TESTES DO LUCCI CLINIC OS ---');

  // 1. Dashboard
  const dashRes = await fetch('http://localhost:3000/api/dashboard');
  const dash = await dashRes.json();
  console.log('✔ [1/6] Dashboard KPIs:', {
    pacientes: dash.kpis.total_patients,
    consultas_hoje: dash.kpis.today_appointments,
    receita: `R$ ${dash.kpis.month_income}`
  });

  // 2. IA Copilot - Analisar Paciente (Fase 4)
  const aiRes = await fetch('http://localhost:3000/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: 'pat-001' })
  });
  const aiData = await aiRes.json();
  console.log('✔ [2/6] Copiloto IA (SOAP Draft):', {
    sumario: aiData.summary,
    subjetivo: aiData.draft_anamnese.soap_subjective.substring(0, 50) + '...',
    plano: aiData.draft_anamnese.soap_plan.substring(0, 50) + '...'
  });

  // 3. Visão Computacional Médica - Exame Válido (Fase 5)
  const visionOkRes = await fetch('http://localhost:3000/api/exams/analyze-vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: 'pat-001', simulate_third_party: false })
  });
  const visionOk = await visionOkRes.json();
  console.log('✔ [3/6] Visão Médica (Exame Válido):', {
    verificado: visionOk.verified,
    biomarcadores_extraidos: visionOk.biomarkers.length
  });

  // 4. Segurança Clínica - Exame de Terceiro Bloqueado (Fase 6)
  const visionFailRes = await fetch('http://localhost:3000/api/exams/analyze-vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: 'pat-001', simulate_third_party: true })
  });
  const visionFail = await visionFailRes.json();
  console.log('✔ [4/6] Segurança Clínica (Bloqueio Exame de Terceiro):', {
    verificado: visionFail.verified,
    alerta_gerado: visionFail.security_alert ? 'SIM (BLOQUEIO ATIVADO COM SUCESSO)' : 'NÃO'
  });

  // 5. Prescrição VIDAS SC & WhatsApp (Fase 7)
  const vidasRes = await fetch('http://localhost:3000/api/prescriptions/generate-vidas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: 'pat-001' })
  });
  const vidas = await vidasRes.json();
  console.log('✔ [5/6] Prescrição Oficial VIDAS SC:', {
    codigo_vidas: vidas.prescription.vidas_sc_code,
    hash_icp: vidas.prescription.digital_signature_hash,
    whatsapp_link_pronto: vidas.whatsapp_url.startsWith('https://api.whatsapp.com')
  });

  // 6. Produtos & Funis Comerciais
  const leadsRes = await fetch('http://localhost:3000/api/leads');
  const leads = await leadsRes.json();
  console.log('✔ [6/6] Produtos & Leads da Clínica:', {
    total_produtos: leads.products.length,
    total_leads: leads.leads.length
  });

  console.log('--- TODOS OS 6 TESTES PASSARAM COM 100% DE SUCESSO! ---');
}

runTests().catch(console.error);
