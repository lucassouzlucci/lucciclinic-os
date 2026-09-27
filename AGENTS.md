# AGENTS.md - Lucci Clinic OS

## Identidade e Propósito
Este repositório contém o **Lucci Clinic OS**, a plataforma de Prontuário Eletrônico do Paciente (PEP), Gestão Clínica, Copiloto Clínico de Inteligência Artificial e Receituário Digital da **Lucci Clinic**, liderada pelo **Dr. Lucas Lucci** (CRM-SC, Balneário Camboriú - SC).

## Diretrizes de Arquitetura e Engenharia
1. **O Médico é o Decisor Final**: A IA atua estritamente como copiloto clínico consultivo e assistente operacional. Nenhuma conduta ou receita é emitida autonomamente sem revisão e aprovação do médico.
2. **Modo Draft Obrigatório**: Toda anamnese, evolução, prescrição e mensagem gerada pela IA é gravada como rascunho (`status: 'draft'`) para validação clínica.
3. **Visão Computacional & Segurança de Exames (Fases 5 e 6)**: Antes de inferir condutas sobre exames laboratoriais/imagem, o sistema obrigatoriamente valida o cruzamento de Nome Completo e Data de Nascimento entre o laudo e o paciente ativo para prevenir contaminação de dados por exames de terceiros.
4. **Prescrição VIDAS SC (Fase 7)**: Os receituários gerados devem seguir o padrão oficial de Santa Catarina (VIDAS SC), contendo identificação do médico (CRM-SC), chave hash de assinatura digital ICP-Brasil e QR Code de autenticação.
5. **Estética de UI**: Design minimalista masculino premium, palette Slate/Zinc escuro (`#09090b`, `#0f172a`) com acentos em Esmeralda, Ciano e Dourado sutil.

## Estrutura do Repositório
- `src/app/`: Páginas do sistema via App Router (Dashboard, Pacientes, PEP SPA, Agenda, Financeiro, Produtos, Configurações).
- `src/ai-tools/`: Definições e implementações de ferramentas para o copiloto de IA.
- `src/database/`: Camada de persistência e repositórios (Supabase / PostgreSQL).
- `src/services/`: Serviços de inteligência clínica, visão computacional e gerador de receituário VIDAS SC.
- `src/components/`: Componentes modulares de UI (CopilotPanel, VidasPrescription, ExamViewer, etc.).
- `supabase/`: Migrações e esquemas relacionais com Row Level Security (RLS).
