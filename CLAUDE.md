# CLAUDE.md - Diretrizes de Desenvolvimento Lucci Clinic OS

## Comandos Principais
- Iniciar ambiente de desenvolvimento: `node server.js` ou `npm run dev`
- Porta padrão: `http://localhost:3000`
- Banco de dados: Supabase PostgreSQL (esquema em `supabase/schema.sql`)

## Padrões de Código
- **Framework**: Next.js 16 com App Router e React 19.
- **Server Actions**: Usar Server Actions para mutações de dados e chamadas de IA.
- **Estilo**: Tailwind CSS (Dark/Minimalista Masculino Premium).
- **Tratamento de Erros**: As ferramentas de IA e serviços nunca devem emitir `throw` não capturado; retornar sempre o envelope `ToolResult<T> { success: boolean, data?: T, error?: string }`.
- **Camada de IA**:
  - Todas as tools em `src/ai-tools/`
  - Orquestrador em `src/services/ai-copilot.ts`
  - Modelo de referência: Claude 3.5/3.7 Sonnet ou Gemini 2.5/3.8 Flash
- **Regra de Segurança de Laudos**: Todo processamento de exames deve executar checagem estrita de titularidade do paciente antes de consolidar laudos ou gerar prescrições.
