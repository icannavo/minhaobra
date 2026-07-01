# MODELO RELACIONAL 100% INTEGRADO - ERP RESTAURO

## VISÃO GERAL
Este documento descreve o modelo de dados completamente relacional do sistema, onde TUDO está interligado.

## TABELAS PRINCIPAIS E SUAS RELAÇÕES

### 1. OBRAS (works)
**Tabela central** - Tudo gira em torno de uma obra específica

**Relacionamentos:**
- `daily_schedules` → Cronogramas diários da obra
- `detailed_tasks` → Tarefas detalhadas da obra
- `daily_tasks` → Tarefas simples da obra  
- `schedule_items` → Itens de cronograma
- `productivity_history` → Histórico de produtividade
- `projects` → Projetos hierárquicos da obra
- `alerts` → Alertas relacionados à obra

---

### 2. CATÁLOGO (Materiais, Equipamentos, Membros da Equipe)

#### 2.1 EQUIPAMENTOS (equipments)
- Usado em `task_equipments` (relação com tarefas diárias antigas)
- Usado em `step_equipments` (relação com etapas de templates)
- **Status de uso**: Quantidade disponível vs em uso

#### 2.2 MATERIAIS (materials)
- Usado em `step_materials` (materiais necessários por etapa de template)
- Usado em `material_consumptions` (consumo real em tarefas detalhadas)
- **Estoque**: `quantityInStock` diminui conforme consumo
- **Alertas**: Quando `quantityInStock < minStockLevel`

#### 2.3 MEMBROS DA EQUIPE (team_members)
- Usado em `task_team_allocations` (alocação em tarefas detalhadas)
- **Status**: `isActive` true/false
- **Produtividade**: `avgProductivity` atualizada conforme histórico

---

### 3. TEMPLATES DE TAREFAS (TaskClasses → Subclasses → Steps)

#### 3.1 CLASSES DE TAREFAS (task_classes)
- Ex: "Limpeza de Fachada", "Pintura Externa"
- Tem muitas `task_subclasses`
- **Configurações globais**: `requiresScaffolding`, `baseProductivity`

#### 3.2 SUBCLASSES (task_subclasses)
- Ex: "Limpeza com Lavajato", "Limpeza Manual"
- Pertence a uma `task_classes` (classId)
- Tem muitas `task_steps`
- **Multiplicador de produtividade**: Ajusta a produtividade base da classe

#### 3.3 ETAPAS (task_steps)
- Ex: "Montagem de Andaime", "Aplicar Primer"
- Pertence a uma `task_subclasses` (subclassId)
- Tem muitos `step_equipments` (equipamentos necessários)
- Tem muitos `step_materials` (materiais necessários)
- **Cálculo de tempo**: Baseado em área, andares, etc
- Usado para criar `detailed_tasks`

---

### 4. CRONOGRAMA DIÁRIO (Daily Schedules → Scheduled Tasks → Detailed Tasks)

#### 4.1 CRONOGRAMAS DIÁRIOS (daily_schedules)
- Um por **obra + data**
- Agregação de todas as tarefas do dia
- Relaciona-se com:
  - `scheduled_tasks` (tarefas agendadas nos horários)
  - `daily_goals` (metas do dia)

#### 4.2 TAREFAS AGENDADAS (scheduled_tasks)
- **Relacionamento N:N** entre `daily_schedules` e `detailed_tasks`
- Define o **horário** em que uma tarefa detalhada será executada
- `scheduledStartTime`: "08:00", "09:00", etc
- **Status**: Agendado → Em Execução → Concluído

#### 4.3 TAREFAS DETALHADAS (detailed_tasks)
- Baseadas em `task_classes` + `task_subclasses`
- Pertencem a uma `works` (workId)
- Relacionam-se com:
  - `scheduled_tasks` (quando agendadas)
  - `step_executions` (execução de cada etapa)
  - `task_team_allocations` (membros alocados)
  - `material_consumptions` (materiais usados)

---

### 5. EXECUÇÃO DE TAREFAS (Step Executions)

#### 5.1 EXECUÇÕES DE ETAPAS (step_executions)
- Cada **etapa** de uma **tarefa detalhada** tem um registro de execução
- Liga `detailed_tasks` com `task_steps`
- Registra tempo real: `startTime`, `endTime`, `durationMinutes`
- **Status**: Pendente → Em Execução → Concluído

---

### 6. ALOCAÇÃO DE RECURSOS

#### 6.1 ALOCAÇÃO DE EQUIPE (task_team_allocations)
- Liga `detailed_tasks` com `team_members`
- Define quem trabalha em qual tarefa
- `hoursAllocated` vs `hoursWorked`

#### 6.2 CONSUMO DE MATERIAIS (material_consumptions)
- Liga `detailed_tasks` com `materials`
- Registra uso real vs planejado
- **Atualiza estoque**: Diminui `materials.quantityInStock`

---

### 7. PROJETOS HIERÁRQUICOS (Projects → Phases → Tasks → Subtasks)

#### 7.1 PROJETOS (projects)
- Ligado a uma `works` (workId)
- Gera automaticamente estrutura hierárquica de tarefas
- Tem muitas `project_phases`

#### 7.2 FASES DO PROJETO (project_phases)
- Ex: "Preparação", "Execução", "Acabamento"
- Tem muitas `project_tasks`
- Dependências: `dependsOnPhaseId`

#### 7.3 TAREFAS DO PROJETO (project_tasks)
- Tarefa intermediária no Kanban
- Pode referenciar `task_classes` e `task_subclasses`
- Tem `kanbanStatus`: backlog → scheduled → in_progress → completed
- Quando agendada, vira `detailed_tasks`
- Tem muitas `project_subtasks`

#### 7.4 SUBTAREFAS (project_subtasks)
- Breakdown fino de `project_tasks`
- Tem muitos `task_assignments` (atribuições a pessoas)

---

## FLUXOS DE INTEGRAÇÃO

### FLUXO 1: Criar Tarefa Detalhada a partir de Template
```
1. Usuário seleciona CLASS (task_classes)
2. Seleciona SUBCLASS (task_subclasses)
3. Sistema busca STEPS (task_steps) da subclass
4. Para cada STEP:
   - Busca EQUIPMENTS (step_equipments → equipments)
   - Busca MATERIALS (step_materials)
5. Calcula tempo total baseado em área/andares
6. Cria DETAILED_TASK com tudo pre-populado
```

### FLUXO 2: Agendar Tarefa no Cronograma Diário
```
1. Existe DAILY_SCHEDULE para obra + data? Se não, cria
2. Arrasta DETAILED_TASK para slot de horário
3. Cria SCHEDULED_TASK ligando:
   - dailyScheduleId
   - detailedTaskId  
   - scheduledStartTime (ex: "08:00")
4. Atualiza agregações em DAILY_SCHEDULE:
   - totalTasks++
   - totalEstimatedMinutes += detailedTask.estimatedTotalMinutes
```

### FLUXO 3: Executar Tarefa (com Registro de Etapas)
```
1. Usuário inicia DETAILED_TASK
2. Para cada STEP da tarefa:
   - Cria STEP_EXECUTION
   - Marca startTime
   - Usuário conclui
   - Marca endTime e calcula durationMinutes
3. Ao concluir todas as etapas:
   - DETAILED_TASK.status = "Concluído"
   - SCHEDULED_TASK.status = "Concluído"
   - DAILY_SCHEDULE.completedTasks++
```

### FLUXO 4: Consumir Material
```
1. Durante execução de DETAILED_TASK
2. Cria MATERIAL_CONSUMPTION:
   - detailedTaskId
   - materialId
   - actualQuantity
3. Atualiza MATERIALS:
   - quantityInStock -= actualQuantity
4. Se quantityInStock < minStockLevel:
   - Cria ALERT de estoque baixo
```

### FLUXO 5: Alocar Equipe
```
1. Ao criar/editar DETAILED_TASK
2. Adiciona TEAM_MEMBERS via TASK_TEAM_ALLOCATIONS
3. Define:
   - hoursAllocated (estimativa)
   - role (função específica)
4. Ao executar, atualiza:
   - hoursWorked (real)
```

### FLUXO 6: Catálogo → Templates → Tarefas Reais
```
CATALOG (equipments, materials)
   ↓
TEMPLATES (task_classes → task_subclasses → task_steps)
   ↓ (usa step_equipments, step_materials)
   ↓
REAL TASKS (detailed_tasks)
   ↓ (usa task_team_allocations, material_consumptions)
   ↓
EXECUTION (step_executions, scheduled_tasks)
```

---

## PÁGINAS E SUAS INTEGRAÇÕES

### /catalog (Catálogo)
**Mostra:**
- `equipments` - com status "em uso" se em `step_equipments` de tarefas ativas
- `materials` - com quantidade em estoque e consumo previsto
- `team_members` - com status de alocação

**CRUD:**
- Create/Update/Delete em `equipments`, `materials`, `team_members`

### /task-templates (Templates)
**Mostra:**
- `task_classes` → `task_subclasses` → `task_steps`
- Para cada step: `step_equipments` + `step_materials`

**CRUD:**
- Create/Update/Delete em todas as tabelas de templates
- Ao deletar, verifica se está sendo usado em `detailed_tasks`

### /daily (Dashboard Diário)
**Mostra:**
- `daily_schedules` filtrado por workId + date
- `scheduled_tasks` com suas `detailed_tasks`
- Backlog: `detailed_tasks` NÃO em `scheduled_tasks`

**Operações:**
- Drag & Drop: Cria/Atualiza `scheduled_tasks`
- Ao trocar de obra: Carrega dados específicos da obra

### /next-day (Planejamento Próximo Dia)
**Igual a /daily** mas para data = tomorrow
- Mesmo modelo de dados
- Mesmas operações

### /projects (Lista de Obras)
**Mostra:**
- `works` com agregações de:
  - Total de `detailed_tasks`
  - Total de `daily_schedules`
  - Progresso geral

**CRUD:**
- Create/Update/Delete `works`

### /project/:id (Detalhes da Obra)
**Mostra:**
- `works` específica
- `daily_schedules` agrupados por data
- `detailed_tasks` agrupadas por status
- `productivity_history` em gráficos

### /tasks (Tarefas Especializadas)
**Mostra:**
- Templates prontos de `task_classes` + `task_subclasses`
- Ao selecionar, cria `detailed_tasks`

---

## QUERIES CRÍTICAS PARA RELACIONAMENTO

### 1. Buscar Tarefas Agendadas de uma Obra em uma Data
```sql
SELECT 
  st.*,
  dt.*,
  tc.name as className,
  ts.name as subclassName
FROM scheduled_tasks st
INNER JOIN daily_schedules ds ON st.dailyScheduleId = ds.id
INNER JOIN detailed_tasks dt ON st.detailedTaskId = dt.id
INNER JOIN task_classes tc ON dt.classId = tc.id
INNER JOIN task_subclasses ts ON dt.subclassId = ts.id
WHERE ds.workId = ? AND ds.date = ?
ORDER BY st.scheduledStartTime
```

### 2. Equipamentos em Uso em uma Data
```sql
SELECT 
  e.*,
  COUNT(st.id) as timesUsed
FROM equipments e
INNER JOIN step_equipments se ON e.id = se.equipmentId
INNER JOIN task_steps ts ON se.stepId = ts.id
INNER JOIN detailed_tasks dt ON dt.subclassId = ts.subclassId
INNER JOIN scheduled_tasks st ON st.detailedTaskId = dt.id
INNER JOIN daily_schedules ds ON st.dailyScheduleId = ds.id
WHERE ds.workId = ? AND ds.date = ? AND st.status IN ('Agendado', 'Em Execução')
GROUP BY e.id
```

### 3. Materiais com Estoque Baixo
```sql
SELECT 
  m.*,
  (m.minStockLevel - m.quantityInStock) as deficit
FROM materials m
WHERE m.quantityInStock < m.minStockLevel
ORDER BY deficit DESC
```

### 4. Produtividade da Equipe
```sql
SELECT 
  tm.*,
  AVG(dt.actualTotalMinutes / dt.area) as avgMinutesPerM2
FROM team_members tm
INNER JOIN task_team_allocations tta ON tm.id = tta.teamMemberId
INNER JOIN detailed_tasks dt ON tta.detailedTaskId = dt.id
WHERE dt.status = 'Concluído'
GROUP BY tm.id
```

---

## AÇÕES QUE DISPARAM ATUALIZAÇÕES EM CASCATA

### Quando CONCLUIR uma DETAILED_TASK:
1. Atualiza `detailed_tasks.status = 'Concluído'`
2. Atualiza `scheduled_tasks.status = 'Concluído'`
3. Atualiza `daily_schedules.completedTasks++`
4. Atualiza `daily_schedules.completedArea += detailed_tasks.area`
5. Cria registro em `productivity_history`
6. Verifica metas em `daily_goals` e atualiza `isAchieved`

### Quando CONSUMIR MATERIAL:
1. Cria `material_consumptions`
2. Atualiza `materials.quantityInStock -= quantity`
3. Se `quantityInStock < minStockLevel`:
   - Cria `alerts` tipo "ESTOQUE_BAIXO"

### Quando ALOCAR EQUIPE:
1. Cria `task_team_allocations`
2. Verifica se `team_members.isActive`
3. Calcula carga de trabalho do membro

### Quando DELETAR OBRA:
1. Deleta em cascata:
   - `daily_schedules` → `scheduled_tasks`
   - `detailed_tasks` → `step_executions`, `task_team_allocations`, `material_consumptions`
   - `projects` → `project_phases` → `project_tasks` → `project_subtasks`
   - `productivity_history`
   - `alerts`

---

## PRÓXIMOS PASSOS DE IMPLEMENTAÇÃO

1. ✅ Schema de dados completo
2. ✅ Routers tRPC com todos os endpoints
3. 🔄 Integrar Catalog com uso real (em andamento)
4. 🔄 Integrar TaskTemplates com DetailedTasks (em andamento)
5. 🔄 Integrar DailyDashboard completamente (em andamento)
6. ⏳ Integrar NextDayPlanning
7. ⏳ Integrar ProjectsList com hierarquia completa
8. ⏳ Implementar cálculos automáticos (produtividade, alertas, etc)
9. ⏳ Implementar cascata de atualizações
10. ⏳ Implementar sistema de alertas automáticos

---

## CONCLUSÃO

Este sistema é 100% relacional onde:
- **Catalog** alimenta **Templates**
- **Templates** geram **Tarefas Reais**
- **Tarefas Reais** são agendadas em **Cronogramas**
- **Cronogramas** registram **Execuções**
- **Execuções** consomem **Recursos** (materiais, equipamentos, equipe)
- **Tudo** é rastreado e auditado
- **Mudanças** propagam automaticamente pelo sistema
