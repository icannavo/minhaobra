# Sistema Kanban para ERP de Restauração

## 📋 Visão Geral

Sistema completo de gestão de projetos baseado na metodologia Kanban, inspirado nas melhores práticas de ERPs de construção civil e sistemas como Jira, Trello e Monday.com, adaptado especificamente para projetos de restauração de fachadas.

## 🎯 Funcionalidades Principais

### 1. **Geração Automática de Tarefas**
Ao criar um projeto, o sistema gera **centenas de tarefas hierárquicas** automaticamente baseado em:
- **WBS (Work Breakdown Structure)**: Estrutura hierárquica de decomposição do trabalho
- **Fases do Projeto**: Grandes etapas (Preparação, Execução, Acabamento, etc.)
- **Tarefas**: Atividades específicas por área/setor
- **Subtarefas**: Breakdown detalhado (montagem andaime, EPIs, execução, limpeza, etc.)

### 2. **Sistema Kanban Drag-and-Drop**
- **5 colunas padrão**: Backlog, Agendado, Em Andamento, Revisão, Concluído
- **Arrastar tarefas** entre colunas
- **Filtros avançados**: Por prioridade, fase, área, duração
- **Indicadores visuais**: Prioridade por cores, progresso em tempo real

### 3. **Calendário Semanal**
- **Vista semanal**: 7 dias em colunas
- **Drag-and-drop**: Arraste tarefas do backlog para dias específicos
- **Indicadores por dia**: Total de tarefas, horas estimadas, m² de trabalho
- **Navegação**: Anterior/Próxima semana, "Ir para Hoje"

### 4. **Timeline Diária (Planejamento de Horários)**
- **Cronograma por hora**: 7h às 18h em slots de 1 hora
- **Arrastar tarefas para horários específicos**
- **Intervalo de almoço**: Marcado automaticamente (12h)
- **Sidebar de tarefas não agendadas**: Fácil acesso para agendar
- **Cálculo automático**: Duração total do dia

### 5. **Progresso do Projeto**
- **Progresso em tempo real**: Baseado em tarefas completadas
- **Métricas visuais**: Total, Backlog, Agendado, Em Andamento, Concluído
- **Progresso por fase**: Cada fase tem seu próprio progresso
- **Bloqueio de dependências**: Tarefas dependentes ficam bloqueadas até predecessoras serem concluídas

## 📊 Estrutura de Dados

### Hierarquia do Projeto

```
Projeto
  └─ Fases (ex: Preparação de Superfície)
      └─ Tarefas (ex: Limpeza Fachada Norte)
          └─ Subtarefas (ex: Montagem Andaime, Limpeza, Desmontagem)
```

### Tabelas Principais

**projects**
- Projeto base
- Progresso geral (totalTasks, completedTasks, progressPercent)
- Datas estimadas

**project_phases**
- Fases do projeto
- Dependências entre fases
- Progresso por fase

**project_tasks**
- Tarefas individuais do Kanban
- Status do Kanban (backlog, scheduled, in_progress, completed)
- Agendamento (scheduledDate, scheduledStartTime)
- Estimativas (duração, custo, pessoas)
- Dependências entre tarefas

**project_subtasks**
- Breakdown detalhado de cada tarefa
- Tipos: SAFETY_MEETING, PREPARATION, EQUIPMENT_SETUP, SCAFFOLDING, EPIs, EXECUTION, BREAK, CLEANUP, INSPECTION, EQUIPMENT_TEARDOWN
- Checklist por subtarefa

**calendar_slots**
- Slots de tempo no calendário
- Capacidade máxima de tarefas paralelas

**task_assignments**
- Relacionamento entre tarefas e slots de calendário

## 🔄 Fluxo de Trabalho

### 1. Criação do Projeto

```typescript
// Quando um projeto é criado:
1. Criar registro do projeto
2. Gerar fases automaticamente baseado no template
3. Para cada fase, gerar tarefas baseadas nas dimensões do projeto
4. Para cada tarefa, gerar subtarefas baseadas no tipo de trabalho
5. Calcular estimativas (duração, custo, recursos)
6. Definir dependências entre tarefas
7. Todas as tarefas começam no estado "backlog"
```

### 2. Planejamento com Kanban

```
BACKLOG → Arrasta para CALENDÁRIO → Define HORÁRIO → Status: AGENDADO
```

### 3. Execução

```
AGENDADO → Click "Iniciar" → EM ANDAMENTO → Marca subtarefas → CONCLUÍDO
```

### 4. Atualização de Progresso

```typescript
// Ao completar uma tarefa:
1. Marcar task.status = "Concluído"
2. Atualizar project.completedTasks++
3. Recalcular project.progressPercent
4. Atualizar projectPhase.completedTasks++
5. Verificar dependências e desbloquear próximas tarefas
6. Gerar alertas se necessário
```

## 🎨 Componentes React

### Páginas

**ProjectKanban.tsx**
- Página principal do sistema Kanban
- 3 vistas: Kanban Board, Calendário Semanal, Timeline Diária
- Gerenciamento de estado das tarefas
- Drag-and-drop entre colunas e calendário

### Componentes

**KanbanColumn.tsx**
- Coluna individual do Kanban
- Área de drop para receber tarefas
- Lista de tarefas com scroll

**KanbanTaskCard.tsx**
- Card de tarefa arrastável
- Indicadores de prioridade, duração, área, equipe
- Progresso e subtarefas
- Estados visuais (dragging, hover)

**WeekCalendarView.tsx**
- Vista semanal em grid
- Navegação entre semanas
- Drag-and-drop de tarefas para dias
- Indicadores de carga de trabalho por dia

**DayTimelineView.tsx**
- Cronograma horário do dia
- Slots de 1 hora
- Drag-and-drop para horários específicos
- Sidebar com tarefas não agendadas

**TaskBacklog.tsx**
- Lista completa de tarefas não agendadas
- Filtros: prioridade, fase, busca por texto
- Ordenação: prioridade, duração, área, nome
- Agrupamento por fase

## 🚀 Geração Automática de Tarefas

### Template de Projeto

```typescript
// Exemplo: Template "Restauração Completa de Fachada"
const projectTemplate = {
  name: "Restauração Completa de Fachada",
  phases: [
    {
      name: "Fase 1: Preparação de Superfície",
      tasks: [
        {
          name: "Limpeza de Fachada {orientação}",
          type: "Limpeza com Lavajato",
          estimatedProductivity: 20, // m²/pessoa/dia
          subtasks: [
            { type: "SAFETY_MEETING", duration: 15 },
            { type: "SCAFFOLDING", durationPerFloor: 120 },
            { type: "EPIs", duration: 10 },
            { type: "EQUIPMENT_SETUP", duration: 30 },
            { type: "EXECUTION", durationPerM2: 0.5 },
            { type: "BREAK", duration: 60 },
            { type: "CLEANUP", duration: 30 },
            { type: "EQUIPMENT_TEARDOWN", duration: 30 },
          ]
        }
      ]
    },
    {
      name: "Fase 2: Reparos Estruturais",
      tasks: [
        {
          name: "Reparo de Fissuras {setor}",
          type: "Reparo Estrutural",
          // ...
        }
      ]
    },
    {
      name: "Fase 3: Impermeabilização",
      // ...
    },
    {
      name: "Fase 4: Pintura",
      // ...
    }
  ]
};
```

### Algoritmo de Geração

```typescript
function generateProjectTasks(project: Project, template: ProjectTemplate) {
  const { totalArea, totalFloors } = project;
  
  // Para cada fase do template
  for (const phaseTemplate of template.phases) {
    const phase = createPhase(project.id, phaseTemplate);
    
    // Para cada tarefa da fase
    for (const taskTemplate of phaseTemplate.tasks) {
      
      // Dividir por orientação/setor se necessário
      const sectors = calculateSectors(totalArea); // Norte, Sul, Leste, Oeste
      
      for (const sector of sectors) {
        // Criar tarefa principal
        const task = {
          name: taskTemplate.name.replace("{orientação}", sector.name),
          area: sector.area,
          estimatedDurationMinutes: calculateDuration(
            sector.area,
            taskTemplate.estimatedProductivity
          ),
          estimatedEmployees: calculateEmployees(sector.area),
          phaseId: phase.id,
          kanbanStatus: "backlog",
        };
        
        const createdTask = createTask(task);
        
        // Gerar subtarefas
        for (const subtaskTemplate of taskTemplate.subtasks) {
          const subtask = {
            projectTaskId: createdTask.id,
            name: getSubtaskName(subtaskTemplate.type),
            stepType: subtaskTemplate.type,
            estimatedMinutes: calculateSubtaskDuration(
              subtaskTemplate,
              task.area,
              totalFloors
            ),
            subtaskOrder: subtaskTemplate.order,
          };
          
          createSubtask(subtask);
        }
      }
    }
  }
}
```

## 📝 Exemplos de Uso

### 1. Criar Projeto e Gerar Tarefas

```typescript
// POST /api/projects
const newProject = await trpc.projects.create.mutate({
  workId: 1,
  name: "Restauração Edifício Central",
  totalArea: 500, // m²
  totalFloors: 4,
  templateId: 1, // "Restauração Completa de Fachada"
});

// Sistema gera automaticamente:
// - 4 fases
// - ~50-100 tarefas (dependendo do template e divisões)
// - ~500-800 subtarefas
```

### 2. Arrastar Tarefa para o Calendário

```typescript
// Componente detecta drag-end
function handleDragEnd(event: DragEndEvent) {
  const taskId = event.active.id;
  const dateString = event.over.id; // "2026-07-01"
  
  // Atualizar no backend
  await trpc.projectTasks.schedule.mutate({
    taskId,
    scheduledDate: dateString,
    scheduledStartTime: "08:00",
    kanbanStatus: "scheduled",
  });
}
```

### 3. Planejar Horário do Dia

```typescript
// Arrastar tarefa para slot de horário
function handleTimeSlotDrop(taskId: number, time: string) {
  await trpc.projectTasks.schedule.mutate({
    taskId,
    scheduledStartTime: time, // "09:00"
  });
  
  // Criar assignment no slot
  await trpc.taskAssignments.create.mutate({
    projectTaskId: taskId,
    calendarSlotId: getSlotId(date, time),
  });
}
```

### 4. Completar Tarefa e Atualizar Progresso

```typescript
function completeTask(taskId: number) {
  // Marcar todas subtarefas como concluídas
  await trpc.projectSubtasks.completeAll.mutate({ projectTaskId: taskId });
  
  // Atualizar tarefa
  await trpc.projectTasks.complete.mutate({
    taskId,
    status: "Concluído",
    kanbanStatus: "completed",
    completedAt: new Date(),
  });
  
  // Sistema recalcula automaticamente:
  // - project.completedTasks++
  // - project.progressPercent
  // - phase.completedTasks++
  // - phase.progressPercent
  // - Desbloquear próximas tarefas dependentes
}
```

## 🎯 Próximos Passos

### Backend (tRPC)

1. **Criar rotas tRPC** para todas as operações
2. **Implementar lógica de geração** de tarefas automáticas
3. **Sistema de templates** de projeto
4. **Cálculo de dependências** e desbloqueio automático
5. **Recálculo de progresso** em tempo real

### Frontend

1. **Integração com backend** real (substituir mock data)
2. **Animações suaves** para drag-and-drop
3. **Notificações** de atualização de progresso
4. **Filtros avançados** persistentes
5. **Export de cronograma** (PDF, Excel)

### Features Avançadas

1. **Colaboração em tempo real** (WebSockets)
2. **Histórico de alterações** (auditoria)
3. **AI para estimativas** mais precisas
4. **Otimização automática** de cronograma
5. **Relatórios de produtividade**

## 🔗 Navegação

Para acessar o Kanban de um projeto:
```
/project/{projectId}/kanban
```

Exemplo:
```
/project/1/kanban
```

## 📚 Referências

- [dnd-kit Documentation](https://dndkit.com/)
- [Kanban Methodology](https://kanbanguides.org/)
- [Construction WBS Guide](https://www.projectmanager.com/blog/work-breakdown-structure-wbs)
- [Jira Kanban Board](https://www.atlassian.com/agile/kanban/boards)
- [GIF de referência](https://sigasw.com.br/wp-content/themes/siga-2020/assets/images/lp-kanban/pauta-kanban-siga.gif)
