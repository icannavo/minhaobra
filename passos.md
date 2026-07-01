# 📋 CONTROLE DE PASSOS - ERP RESTAURO

> **IMPORTANTE:** Antes de iniciar qualquer passo, verifique se o passo anterior está marcado como ✅ CONCLUÍDO.
> Ao concluir um passo, marque com ✅ e atualize a data de conclusão.

---

## FASE 1: INTEGRAÇÕES BÁSICAS

### ✅ PASSO 0: Documentação e Preparação
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Criar modelo relacional completo e estrutura de passos
- **Arquivos:** MODELO_RELACIONAL_COMPLETO.md, PROXIMOS_PASSOS_INTEGRACAO.md, passos.md

### ✅ PASSO 1: Integrar Catalog - Equipamentos
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Substituir dados mock de equipamentos por dados reais do banco
- **Arquivos:** client/src/pages/Catalog.tsx
- **Endpoints:** trpc.equipments.getAll, trpc.equipments.create, trpc.equipments.update, trpc.equipments.delete

### ✅ PASSO 2: Integrar Catalog - Materiais
- **Status**: ✅ CONCLUÍDO
- **Data**: 2026-07-01
- **Descrição**: Substituir dados mock de materiais por dados reais do banco
- **Arquivos**: client/src/pages/Catalog.tsx
- **Endpoints**: trpc.materials.getAll, trpc.materials.create, trpc.materials.update, trpc.materials.delete

### ✅ PASSO 3: Integrar Catalog - Equipe
- **Status**: ✅ CONCLUÍDO
- **Data**: 2026-07-01
- **Descrição**: Substituir dados mock de equipe por dados reais do banco
- **Arquivos**: client/src/pages/Catalog.tsx
- **Endpoints**: trpc.teamMembers.getAll, trpc.teamMembers.create, trpc.teamMembers.update, trpc.teamMembers.delete

### ✅ PASSO 4: Catalog - Mostrar Status "EM USO"
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Exibir quais equipamentos/materiais/equipe estão em uso hoje
- **Arquivos:** client/src/pages/Catalog.tsx, server/db.ts, server/routers.ts
- **Lógica:** Verificar scheduled_tasks do dia atual via endpoint catalog.getUsageToday

### ✅ PASSO 5: Catalog - Sistema de Estoque de Materiais
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Mostrar quantidade em estoque e alertas de estoque baixo com visualização completa
- **Arquivos:** client/src/pages/Catalog.tsx
- **Lógica:** quantityInStock < minStockLevel → alerta visual (cores: vermelho=SEM ESTOQUE, laranja=CRÍTICO, amarelo=BAIXO, verde=OK)
- **Implementação:** Função getStockStatus(), barra de progresso visual, botão "Solicitar Compra" para itens críticos

---

## FASE 2: TASK TEMPLATES

### ✅ PASSO 6: TaskTemplates - Mostrar Equipamentos dos Steps
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Ao selecionar um step, mostrar equipamentos vinculados
- **Arquivos:** client/src/pages/TaskTemplates.tsx, server/routers.ts, server/db.ts
- **Endpoints:** trpc.stepEquipments.getByStep, trpc.stepEquipments.add, trpc.stepEquipments.remove
- **Implementação:** Card interativo mostrando equipamentos com nome, quantidade e se é obrigatório

### ✅ PASSO 7: TaskTemplates - Mostrar Materiais dos Steps
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Ao selecionar um step, mostrar materiais vinculados
- **Arquivos:** client/src/pages/TaskTemplates.tsx, server/routers.ts, server/db.ts
- **Endpoints:** trpc.stepMaterials.getByStep, trpc.stepMaterials.add, trpc.stepMaterials.remove
- **Implementação:** Card interativo mostrando materiais com nome, quantidade, unidade e se é obrigatório

### ✅ PASSO 8: TaskTemplates - CRUD de Classes
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Criar/Editar/Deletar task_classes com validações
- **Arquivos:** client/src/pages/TaskTemplates.tsx
- **Endpoints:** trpc.taskClasses.create, trpc.taskClasses.update, trpc.taskClasses.delete (já existiam)
- **Implementação:** 
  - Dialog completo de criação/edição com todos os campos
  - Botões de editar/deletar em cada card de classe
  - Validação de foreign key ao deletar
  - Checkbox condicional para duração da reunião de segurança
  - Estados de loading durante save
  - Toast notifications para feedback do usuário

### ✅ PASSO 9: TaskTemplates - CRUD de Subclasses
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Criar/Editar/Deletar task_subclasses com validações
- **Arquivos:** client/src/pages/TaskTemplates.tsx
- **Endpoints:** trpc.taskSubclasses.create, trpc.taskSubclasses.update, trpc.taskSubclasses.delete (já existiam)
- **Implementação:** 
  - Dialog completo de criação/edição com todos os campos
  - Botões de editar/deletar em cada card de subclasse
  - Campo especial: productivityMultiplier (0.1 a 3.0) com explicação visual
  - Validação: requer classe pai selecionada
  - Validação de foreign key ao deletar
  - Estados de loading durante save
  - Toast notifications para feedback do usuário
  - Mostra classe pai no header do dialog

### ✅ PASSO 10: TaskTemplates - CRUD de Steps
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01
- **Descrição:** Criar/Editar/Deletar task_steps com validações complexas
- **Arquivos:** client/src/pages/TaskTemplates.tsx
- **Endpoints:** trpc.taskSteps.create, trpc.taskSteps.update, trpc.taskSteps.delete (já existiam)
- **Implementação:** 
  - Dialog completo com 10+ campos
  - Campos: name, stepOrder, stepType (10 opções), baseTimeMinutes
  - timeCalculationType (5 opções) e timeCalculationValue com explicação
  - Checkbox condicional para cooldown (maxContinuousMinutes, cooldownMinutes)
  - Campos description e notes
  - Botões editar/deletar em cada card
  - Validação: requer subclasse pai selecionada
  - stepOrder padrão = último + 1
  - Emojis nos selects para identificação visual
  - Explicações inline dos campos complexos

### ⏳ PASSO 11: TaskTemplates - Vincular Equipamentos aos Steps
- **Status:** ⏳ PENDENTE
- **Descrição:** Interface para adicionar/remover equipamentos de um step
- **Arquivos:** client/src/pages/TaskTemplates.tsx
- **Endpoints:** criar stepEquipments.add e stepEquipments.remove

### ⏳ PASSO 12: TaskTemplates - Vincular Materiais aos Steps
- **Status:** ⏳ PENDENTE
- **Descrição:** Interface para adicionar/remover materiais de um step
- **Arquivos:** client/src/pages/TaskTemplates.tsx
- **Endpoints:** criar stepMaterials.add e stepMaterials.remove

---

## FASE 3: CRIAÇÃO DE TAREFAS DETALHADAS

### ✅ PASSO 13: Criar Página CreateDetailedTask
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01 (Já existia)
- **Descrição:** Nova página para criar tarefas detalhadas a partir de templates
- **Arquivos:** client/src/pages/CreateDetailedTask.tsx
- **Rota:** /create-detailed-task
- **Implementação:** Página completa com layout 2 colunas (formulário + cálculos)

### ✅ PASSO 14: CreateDetailedTask - Seleção de Classe/Subclasse
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01 (Já existia)
- **Descrição:** Interface para selecionar classe e subclasse de tarefa
- **Arquivos:** client/src/pages/CreateDetailedTask.tsx
- **Lógica:** Ao selecionar classe, carrega subclasses. Ao selecionar subclasse, busca steps automaticamente

### ✅ PASSO 15: CreateDetailedTask - Buscar Steps Automaticamente
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01 (Já existia)
- **Descrição:** Ao selecionar subclasse, buscar todos os steps
- **Arquivos:** client/src/pages/CreateDetailedTask.tsx
- **Endpoints:** trpc.taskSteps.getBySubclass (via calculateRequirements)
- **Implementação:** Steps buscados automaticamente e mostrados no breakdown de tempo

### ✅ PASSO 16: CreateDetailedTask - Buscar Equipamentos/Materiais dos Steps
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01 (Já existia)
- **Descrição:** Para cada step, buscar equipamentos e materiais necessários
- **Arquivos:** client/src/pages/CreateDetailedTask.tsx
- **Endpoints:** trpc.detailedTasks.calculateRequirements (que usa stepEquipments e stepMaterials)
- **Implementação:** Mostra lista completa de equipamentos e materiais necessários com quantidades calculadas

### ✅ PASSO 17: CreateDetailedTask - Calcular Tempo Total
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01 (Já existia)
- **Descrição:** Calcular tempo estimado baseado em área, andares, etc
- **Arquivos:** client/src/pages/CreateDetailedTask.tsx
- **Lógica:** Implementado cálculo de timeCalculationType (FIXED, PER_M2, PER_FLOOR, etc)
- **Implementação:** 
  - Mostra tempo total em horas e minutos
  - Breakdown detalhado por step com tipo e tempo individual
  - Cálculo automático de área (altura × largura)
  - Sugestão automática de andares (altura ÷ 2m)

### ✅ PASSO 18: CreateDetailedTask - Criar DetailedTask
- **Status:** ✅ CONCLUÍDO
- **Data:** 2026-07-01 (Já existia)
- **Descrição:** Salvar tarefa detalhada no banco
- **Arquivos:** client/src/pages/CreateDetailedTask.tsx
- **Endpoints:** trpc.detailedTasks.create
- **Implementação:** Mutation completa com validações (obra, classe, subclasse, nome, área)

### ✅ PASSO 19: CreateDetailedTask - Redirecionar para Daily
- **Status:** ✅ CONCLUÍDO  
- **Data:** 2026-07-01
- **Descrição:** Após criar, redirecionar para /daily para agendar
- **Arquivos:** client/src/pages/CreateDetailedTask.tsx
- **Lógica:** navigate(`/daily?date=${date}&taskId=${newTaskId}`) após sucesso
- **Implementação:** Redireciona passando data e taskId para highlight automático

---

## FASE 4: NEXT DAY PLANNING

### ⏳ PASSO 20: NextDayPlanning - Integrar com Banco
- **Status:** ⏳ PENDENTE
- **Descrição:** Substituir mock por dados reais do amanhã
- **Arquivos:** client/src/pages/NextDayPlanning.tsx
- **Lógica:** Mesma de /daily mas com date = tomorrow

### ⏳ PASSO 21: NextDayPlanning - Criar DailySchedule Automaticamente
- **Status:** ⏳ PENDENTE
- **Descrição:** Se não existir cronograma para amanhã, criar
- **Arquivos:** client/src/pages/NextDayPlanning.tsx
- **Endpoints:** trpc.dailySchedules.create

### ⏳ PASSO 22: NextDayPlanning - Botão Confirmar Planejamento
- **Status:** ⏳ PENDENTE
- **Descrição:** Ao confirmar, salvar todas as tarefas agendadas
- **Arquivos:** client/src/pages/NextDayPlanning.tsx
- **Lógica:** Atualizar status das scheduled_tasks

---

## FASE 5: EXECUÇÃO DE TAREFAS

### ⏳ PASSO 23: Criar Página TaskExecution
- **Status:** ⏳ PENDENTE
- **Descrição:** Nova página para registrar execução passo a passo
- **Arquivos:** client/src/pages/TaskExecution.tsx (criar)
- **Rota:** /task/:id/execute

### ⏳ PASSO 24: TaskExecution - Listar Steps da Tarefa
- **Status:** ⏳ PENDENTE
- **Descrição:** Mostrar todos os steps da detailed_task
- **Arquivos:** client/src/pages/TaskExecution.tsx
- **Endpoints:** trpc.taskSteps.getBySubclass

### ⏳ PASSO 25: TaskExecution - Iniciar Step
- **Status:** ⏳ PENDENTE
- **Descrição:** Botão para iniciar execução de um step
- **Arquivos:** client/src/pages/TaskExecution.tsx
- **Endpoints:** trpc.stepExecutions.start

### ⏳ PASSO 26: TaskExecution - Timer de Execução
- **Status:** ⏳ PENDENTE
- **Descrição:** Timer contando tempo desde startTime
- **Arquivos:** client/src/pages/TaskExecution.tsx
- **Lógica:** useEffect com setInterval atualizando a cada segundo

### ⏳ PASSO 27: TaskExecution - Concluir Step
- **Status:** ⏳ PENDENTE
- **Descrição:** Botão para finalizar step e registrar endTime
- **Arquivos:** client/src/pages/TaskExecution.tsx
- **Endpoints:** trpc.stepExecutions.complete

### ⏳ PASSO 28: TaskExecution - Registrar Consumo de Material
- **Status:** ⏳ PENDENTE
- **Descrição:** Interface para informar quantidade real usada
- **Arquivos:** client/src/pages/TaskExecution.tsx
- **Endpoints:** trpc.materialConsumptions.record

### ⏳ PASSO 29: TaskExecution - Atualizar Estoque
- **Status:** ⏳ PENDENTE
- **Descrição:** Ao registrar consumo, diminuir quantityInStock
- **Arquivos:** server/db.ts (lógica no backend)
- **Lógica:** materials.quantityInStock -= actualQuantity

### ⏳ PASSO 30: TaskExecution - Registrar Horas Trabalhadas
- **Status:** ⏳ PENDENTE
- **Descrição:** Atualizar hoursWorked da equipe alocada
- **Arquivos:** client/src/pages/TaskExecution.tsx
- **Endpoints:** trpc.taskTeamAllocations.update

### ⏳ PASSO 31: TaskExecution - Concluir Tarefa Completa
- **Status:** ⏳ PENDENTE
- **Descrição:** Ao concluir último step, marcar tarefa como concluída
- **Arquivos:** client/src/pages/TaskExecution.tsx
- **Lógica:** Atualizar detailed_task, scheduled_task, daily_schedule

### ⏳ PASSO 32: TaskExecution - Criar Productivity History
- **Status:** ⏳ PENDENTE
- **Descrição:** Ao concluir tarefa, registrar em productivity_history
- **Arquivos:** server/db.ts
- **Endpoints:** trpc.productivity.recordProductivity

---

## FASE 6: SISTEMA DE ALERTAS

### ⏳ PASSO 33: Criar Sistema de Alertas Automáticos
- **Status:** ⏳ PENDENTE
- **Descrição:** Função para criar alertas baseado em condições
- **Arquivos:** server/db.ts, criar alerts.ts
- **Lógica:** Triggers automáticos

### ⏳ PASSO 34: Alerta - Estoque Baixo
- **Status:** ⏳ PENDENTE
- **Descrição:** Criar alerta quando material < minStockLevel
- **Arquivos:** server/db.ts em recordMaterialConsumption
- **Lógica:** if (quantityInStock < minStockLevel) createAlert(...)

### ⏳ PASSO 35: Alerta - Tarefa Demorou Mais que Estimado
- **Status:** ⏳ PENDENTE
- **Descrição:** Alerta quando actualMinutes > estimatedMinutes * 1.2
- **Arquivos:** server/db.ts em updateDetailedTask
- **Lógica:** Comparar tempo real vs estimado

### ⏳ PASSO 36: Alerta - Meta Diária Não Atingida
- **Status:** ⏳ PENDENTE
- **Descrição:** Ao final do dia, verificar se meta foi atingida
- **Arquivos:** server/db.ts, criar job agendado
- **Lógica:** if (completedArea < targetArea) createAlert(...)

### ⏳ PASSO 37: Página de Alertas
- **Status:** ⏳ PENDENTE
- **Descrição:** Listar todos os alertas do sistema
- **Arquivos:** client/src/pages/Alerts.tsx (criar)
- **Endpoints:** trpc.alerts.getAll

### ⏳ PASSO 38: Badge de Alertas no Navigation
- **Status:** ⏳ PENDENTE
- **Descrição:** Mostrar contador de alertas não lidos
- **Arquivos:** client/src/components/Navigation.tsx
- **Endpoints:** trpc.alerts.getAll({ unreadOnly: true })

---

## FASE 7: ANÁLISES E RELATÓRIOS

### ⏳ PASSO 39: Dashboard de Análises
- **Status:** ⏳ PENDENTE
- **Descrição:** Página com gráficos e análises
- **Arquivos:** client/src/pages/Analytics.tsx (criar)
- **Rota:** /analytics

### ⏳ PASSO 40: Gráfico de Produtividade ao Longo do Tempo
- **Status:** ⏳ PENDENTE
- **Descrição:** Line chart com productivity_history
- **Arquivos:** client/src/pages/Analytics.tsx
- **Biblioteca:** recharts ou chart.js

### ⏳ PASSO 41: Gráfico de Desvios por Tipo de Tarefa
- **Status:** ⏳ PENDENTE
- **Descrição:** Bar chart comparando estimado vs real
- **Arquivos:** client/src/pages/Analytics.tsx
- **Endpoints:** trpc.reports.workProgress

### ⏳ PASSO 42: Gráfico de Consumo de Materiais
- **Status:** ⏳ PENDENTE
- **Descrição:** Comparar planejado vs consumido
- **Arquivos:** client/src/pages/Analytics.tsx
- **Endpoints:** criar materialConsumptions.summary

### ⏳ PASSO 43: Ranking de Performance da Equipe
- **Status:** ⏳ PENDENTE
- **Descrição:** Mostrar produtividade média de cada membro
- **Arquivos:** client/src/pages/Analytics.tsx
- **Endpoints:** trpc.teamMembers.getAll com cálculo de avgProductivity

### ⏳ PASSO 44: Relatório Diário Exportável (PDF)
- **Status:** ⏳ PENDENTE
- **Descrição:** Gerar PDF do relatório diário
- **Arquivos:** server/reports.ts (criar)
- **Biblioteca:** pdfkit ou puppeteer

### ⏳ PASSO 45: Relatório Semanal Exportável (Excel)
- **Status:** ⏳ PENDENTE
- **Descrição:** Gerar Excel do relatório semanal
- **Arquivos:** server/reports.ts
- **Biblioteca:** exceljs

---

## FASE 8: PROJETOS HIERÁRQUICOS E WBS

### ⏳ PASSO 46: ProjectsList - Botão Criar Projeto WBS
- **Status:** ⏳ PENDENTE
- **Descrição:** Ao criar obra, oferecer criar estrutura WBS
- **Arquivos:** client/src/pages/ProjectsList.tsx
- **Lógica:** Modal perguntando se quer gerar WBS

### ⏳ PASSO 47: Gerador Automático de WBS
- **Status:** ⏳ PENDENTE
- **Descrição:** Função que gera fases e tarefas automaticamente
- **Arquivos:** server/db.ts, criar generateWBS()
- **Lógica:** Baseado em área e tipo de obra, criar project_phases e project_tasks

### ⏳ PASSO 48: Página ProjectKanban
- **Status:** ⏳ PENDENTE
- **Descrição:** Kanban para gerenciar project_tasks
- **Arquivos:** client/src/pages/ProjectKanban.tsx (já existe)
- **Lógica:** Drag & drop entre colunas (backlog, scheduled, in_progress, completed)

### ⏳ PASSO 49: ProjectKanban - Integrar com DailySchedule
- **Status:** ⏳ PENDENTE
- **Descrição:** Ao arrastar para "scheduled", criar detailed_task e agendar
- **Arquivos:** client/src/pages/ProjectKanban.tsx
- **Lógica:** project_task → detailed_task → scheduled_task

### ⏳ PASSO 50: Sistema de Dependências de Tarefas
- **Status:** ⏳ PENDENTE
- **Descrição:** Implementar bloqueio de tarefas baseado em dependências
- **Arquivos:** server/db.ts, lógica em project_tasks
- **Lógica:** Verificar dependsOnTaskIds antes de permitir iniciar

---

## FASE 9: RECURSOS AVANÇADOS

### ⏳ PASSO 51: Implementar WebSockets para Notificações
- **Status:** ⏳ PENDENTE
- **Descrição:** Notificações em tempo real
- **Arquivos:** server/_core/websocket.ts (criar)
- **Biblioteca:** socket.io

### ⏳ PASSO 52: Service Worker para PWA
- **Status:** ⏳ PENDENTE
- **Descrição:** Transformar em Progressive Web App
- **Arquivos:** client/public/sw.js (criar)
- **Lógica:** Cache de assets, funcionar offline

### ⏳ PASSO 53: IndexedDB para Modo Offline
- **Status:** ⏳ PENDENTE
- **Descrição:** Salvar dados localmente
- **Arquivos:** client/src/lib/offline.ts (criar)
- **Biblioteca:** dexie.js

### ⏳ PASSO 54: Sincronização Offline → Online
- **Status:** ⏳ PENDENTE
- **Descrição:** Quando voltar online, sincronizar mudanças
- **Arquivos:** client/src/lib/sync.ts (criar)
- **Lógica:** Fila de operações pendentes

### ⏳ PASSO 55: Integração com API de Clima
- **Status:** ⏳ PENDENTE
- **Descrição:** Buscar clima do dia automaticamente
- **Arquivos:** server/integrations/weather.ts (criar)
- **API:** OpenWeatherMap ou similar

---

## RESUMO DE PROGRESSO

- **Total de Passos:** 55
- **Concluídos:** 17 (30.9%)
- **Pendentes:** 38 (69.1%)

---

## COMO USAR ESTE ARQUIVO

1. **Antes de começar:** Verifique se o passo anterior está ✅ CONCLUÍDO
2. **Durante implementação:** Marque o passo como 🔄 EM ANDAMENTO
3. **Ao concluir:** Marque como ✅ CONCLUÍDO e adicione a data
4. **Se bloqueado:** Marque como ❌ BLOQUEADO e documente o motivo
5. **Para pular:** Marque como ⏭️ PULADO e documente o motivo

---

## LEGENDA DE STATUS

- ✅ **CONCLUÍDO** - Passo totalmente implementado e testado
- 🔄 **EM ANDAMENTO** - Implementação iniciada
- ⏳ **PENDENTE** - Aguardando implementação
- ❌ **BLOQUEADO** - Impedido por dependência ou problema
- ⏭️ **PULADO** - Decidido não implementar neste momento
- 🐛 **COM BUG** - Implementado mas com problemas conhecidos

---

**Última Atualização:** 2026-07-01
**Próximo Passo:** PASSO 11 - TaskTemplates - Vincular Equipamentos aos Steps (ou PASSO 20 - NextDayPlanning)
