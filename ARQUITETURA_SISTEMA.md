# 🏗️ Arquitetura do Sistema - ERP de Gestão de Obras

## 📐 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + TypeScript)             │
├─────────────────────────────────────────────────────────────────┤
│  • Dashboard de Progresso                                        │
│  • Calendário de Tarefas                                        │
│  • Kanban Diário (Drag-and-Drop)                               │
│  • Relatório do Funcionário                                     │
│  • Gestão de Equipe                                             │
│  • Criação de Tarefas (Wizard)                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ tRPC
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────────┤
│  • Routers tRPC (200+ endpoints)                                │
│  • Lógica de Negócio                                            │
│  • Cálculos Automáticos                                         │
│  • Reagendamento Inteligente                                    │
│  • Geração de Relatórios                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Drizzle ORM
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (SQLite / Turso)                      │
├─────────────────────────────────────────────────────────────────┤
│  • 23 Tabelas Relacionadas                                      │
│  • Histórico Completo                                           │
│  • Auditoria de Mudanças                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura do Banco de Dados

### Módulo 1: Gestão de Obras e Recursos
```
┌─────────────┐
│   works     │ (Obras/Projetos)
│─────────────│
│ id          │
│ code        │
│ name        │
│ status      │
│ startDate   │
│ endDate     │
└─────────────┘
       ↓
┌──────────────┐
│ teamMembers  │ (Funcionários)
│──────────────│
│ id           │
│ name         │
│ role         │
│ specialty    │
│ productivity │
└──────────────┘
       ↓
┌────────────────────┐
│taskTeamAllocations │ (Alocação)
│────────────────────│
│ id                 │
│ detailedTaskId     │
│ teamMemberId       │
│ hoursAllocated     │
└────────────────────┘
```

### Módulo 2: Templates de Tarefas (Hierarquia de 4 níveis)
```
┌──────────────┐
│ taskClasses  │ (Nível 1: Template Geral)
│──────────────│
│ id           │
│ name         │ Ex: "Limpeza de Fachada"
│ category     │
│ baseProduct. │
└──────────────┘
       ↓
┌────────────────┐
│taskSubclasses  │ (Nível 2: Variação)
│────────────────│
│ id             │
│ classId        │
│ name           │ Ex: "Limpeza com Lavajato"
│ multiplier     │
└────────────────┘
       ↓
┌──────────────┐
│  taskSteps   │ (Nível 3: Etapas/Subtarefas)
│──────────────│
│ id           │
│ subclassId   │
│ name         │ Ex: "Montar Andaime", "DDS", "Executar"
│ stepOrder    │
│ stepType     │
│ timeCalc     │
└──────────────┘
       ↓
┌────────────────┐     ┌─────────────────┐
│stepEquipments  │     │  stepMaterials  │
│────────────────│     │─────────────────│
│ stepId         │     │ stepId          │
│ equipmentId    │     │ materialName    │
│ quantity       │     │ quantity        │
└────────────────┘     └─────────────────┘
```

### Módulo 3: Tarefas Criadas e Execução
```
┌────────────────┐
│ detailedTasks  │ (Nível 4: Tarefa Criada)
│────────────────│
│ id             │
│ workId         │
│ date           │
│ classId        │
│ subclassId     │
│ taskName       │
│ area           │
│ floors         │
│ team           │
│ status         │
└────────────────┘
       ↓
┌────────────────┐
│stepExecutions  │ (Registro de Execução)
│────────────────│
│ id             │
│ detailedTaskId │
│ stepId         │
│ startTime      │
│ endTime        │
│ durationMin    │
│ status         │
└────────────────┘
```

### Módulo 4: Cronograma e Kanban
```
┌───────────────┐
│dailySchedules │ (Cronograma Diário Agregado)
│───────────────│
│ id            │
│ workId        │
│ date          │
│ totalTasks    │
│ completedTasks│
│ targetArea    │
│ status        │
└───────────────┘
       ↓
┌────────────────┐
│scheduledTasks  │ (Kanban por Horário)
│────────────────│
│ id             │
│ scheduleId     │
│ detailedTaskId │
│ startTime      │ Ex: "08:00", "10:00"
│ slotOrder      │
│ status         │
└────────────────┘
       ↓
┌─────────────┐
│ dailyGoals  │ (Metas do Dia)
│─────────────│
│ id          │
│ scheduleId  │
│ goalType    │
│ target      │
│ achieved    │
└─────────────┘
```

### Módulo 5: Análise e Histórico
```
┌────────────────────┐
│productivityHistory │ (Histórico de Produtividade)
│────────────────────│
│ id                 │
│ workId             │
│ date               │
│ targetArea         │
│ completedArea      │
│ deviation          │
│ productivity       │
│ weather            │
└────────────────────┘

┌──────────────┐
│   alerts     │ (Alertas e Notificações)
│──────────────│
│ id           │
│ workId       │
│ type         │
│ message      │
│ severity     │
│ isRead       │
└──────────────┘

┌──────────────┐
│ changeLogs   │ (Auditoria)
│──────────────│
│ id           │
│ entityType   │
│ entityId     │
│ action       │
│ oldValue     │
│ newValue     │
│ changedBy    │
└──────────────┘
```

---

## 🔄 Fluxos Principais

### Fluxo 1: Criar Tarefa
```
1. Usuário escolhe:
   └─ Classe (ex: "Limpeza de Fachada")
      └─ Subclasse (ex: "Com Lavajato")
         └─ Dimensões (15m², 3 andares)

2. Sistema calcula automaticamente:
   ├─ Tempo total estimado (baseado nas etapas)
   ├─ Equipamentos necessários (da subclasse)
   ├─ Materiais necessários (da subclasse)
   └─ Custos estimados

3. Usuário revisa e confirma

4. Sistema cria:
   ├─ detailedTask (tarefa)
   ├─ stepExecutions (uma para cada etapa)
   └─ Atualiza dailySchedule do dia
```

### Fluxo 2: Executar Tarefa (Visão do Funcionário)
```
1. Funcionário acessa "Minhas Tarefas de Hoje"
   └─ GET /detailedTasks.getByWork({ workId, date: "hoje" })

2. Sistema mostra:
   ├─ Lista de tarefas do dia
   ├─ Para cada tarefa:
   │  ├─ Nome e descrição
   │  ├─ Área alvo
   │  ├─ Equipamentos a usar
   │  ├─ Etapas (checklist)
   │  └─ Status atual

3. Funcionário marca etapas como concluídas:
   ├─ POST /stepExecutions.start({ detailedTaskId, stepId })
   ├─ POST /stepExecutions.complete({ executionId, notes })
   └─ PUT /detailedTasks.update({ id, status: "Concluído" })

4. No fim do dia:
   └─ POST /reports.rescheduleIncomplete({ workId, date })
      ├─ Busca tarefas "Em Execução"
      ├─ Move para próximo dia
      ├─ Atualiza status para "Adiado"
      └─ Cria alertas
```

### Fluxo 3: Reagendamento Automático
```
1. Trigger: Fim do dia (manual ou automatizado)

2. Sistema executa:
   POST /reports.rescheduleIncomplete({ workId, date: "hoje" })

3. Lógica interna:
   ├─ SELECT * FROM detailedTasks 
   │  WHERE workId = ? AND date = ? AND status != "Concluído"
   │
   ├─ Para cada tarefa não concluída:
   │  ├─ UPDATE detailedTasks 
   │  │  SET date = "amanhã", status = "Adiado"
   │  │
   │  └─ INSERT INTO alerts 
   │     (type: "TAREFA_ATRASADA", message: "...")
   │
   └─ UPDATE dailySchedule 
      SET status = calcular_status()

4. Retorna: número de tarefas movidas
```

### Fluxo 4: Cálculo de Progresso
```
1. Solicitação:
   GET /reports.workProgress({ workId })

2. Sistema calcula:
   ├─ SELECT * FROM detailedTasks WHERE workId = ?
   │
   ├─ totalArea = SUM(area)
   │
   ├─ completedArea = SUM(area) 
   │  WHERE status = "Concluído"
   │
   ├─ percentage = (completedArea / totalArea) * 100
   │
   └─ totalTasks vs completedTasks

3. Retorna:
   {
     percentage: 45.5,
     totalArea: 500,
     completedArea: 227.5,
     remainingArea: 272.5,
     totalTasks: 20,
     completedTasks: 9
   }
```

### Fluxo 5: Previsão de Término
```
1. Solicitação:
   GET /reports.estimateCompletion({ workId })

2. Sistema analisa:
   ├─ SELECT * FROM productivityHistory
   │  WHERE workId = ? 
   │  ORDER BY date DESC 
   │  LIMIT 7  (últimos 7 dias)
   │
   ├─ avgProductivity = MÉDIA(productivity)
   │  Ex: 25 m²/dia/funcionário
   │
   ├─ remainingArea = totalArea - completedArea
   │  Ex: 500 - 225 = 275 m²
   │
   ├─ avgEmployees = MÉDIA(numberOfEmployees)
   │  Ex: 3 funcionários
   │
   ├─ daysNeeded = remainingArea / (avgProductivity * avgEmployees)
   │  Ex: 275 / (25 * 3) = 3.67 ≈ 4 dias
   │
   └─ estimatedDate = hoje + daysNeeded

3. Retorna:
   {
     remainingArea: 275,
     avgProductivity: 25,
     avgEmployees: 3,
     daysNeeded: 4,
     estimatedCompletionDate: "2026-07-03",
     originalEstimatedEnd: "2026-08-30"
   }
```

### Fluxo 6: Planejamento Kanban
```
1. Usuário acessa "Planejar Dia"
   ├─ GET /dailySchedules.getByDate({ workId, date })
   └─ GET /scheduledTasks.getByDay({ dailyScheduleId })

2. Sistema mostra:
   ├─ Colunas de horários:
   │  ├─ Backlog (sem horário)
   │  ├─ 08:00-10:00
   │  ├─ 10:00-12:00
   │  ├─ 12:00-14:00
   │  ├─ 14:00-16:00
   │  ├─ 16:00-18:00
   │  └─ Concluído
   │
   └─ Cards de tarefas em cada coluna

3. Usuário arrasta tarefa:
   └─ PUT /scheduledTasks.update({
        id,
        scheduledStartTime: "10:00",
        slotOrder: 0
      })

4. Sistema salva nova posição
```

---

## 🎯 Componentes do Frontend (A Criar)

### 1. ProjectDetails (Detalhes da Obra)
```tsx
<ProjectDetails workId={1}>
  <WorkHeader 
    name="Restauração Centro"
    status="Em Andamento"
    progress={45.5} />
  
  <ProgressSection
    totalArea={500}
    completedArea={227.5}
    estimatedEnd="2026-08-30"
    predictedEnd="2026-07-03" />
  
  <TeamSection
    members={[...]}
    onAddMember={...}
    onRemove={...} />
  
  <EquipmentSection
    equipment={[...]}
    schedule={...}
    onAllocate={...} />
</ProjectDetails>
```

### 2. WorkCalendar (Calendário)
```tsx
<WorkCalendar workId={1}>
  <MonthView
    month="2026-06"
    onDayClick={(date) => ...}>
    {days.map(day => (
      <DayCell
        date={day}
        tasksCount={...}
        status={...}
        equipments={...} />
    ))}
  </MonthView>
  
  <DayDetailsModal
    date={selectedDate}
    tasks={[...]}
    onCreateTask={...} />
</WorkCalendar>
```

### 3. DailyKanban (Planejamento do Dia)
```tsx
<DailyKanban workId={1} date="2026-06-29">
  <KanbanColumn title="Backlog">
    <TaskCard task={...} draggable />
  </KanbanColumn>
  
  <KanbanColumn title="08:00-10:00">
    <TaskCard task={...} draggable />
  </KanbanColumn>
  
  {/* ... mais colunas de horário ... */}
  
  <KanbanColumn title="Concluído">
    <TaskCard task={...} status="completed" />
  </KanbanColumn>
</DailyKanban>
```

### 4. DailyWorkerReport (Relatório do Funcionário)
```tsx
<DailyWorkerReport workerId={1} workId={1}>
  <Header>
    <h1>O que você tem para fazer hoje?</h1>
    <Date>{today}</Date>
  </Header>
  
  <TasksList>
    {tasks.map(task => (
      <TaskItem task={task}>
        <TaskInfo
          name={task.name}
          area={task.area}
          equipment={task.equipment} />
        
        <StepsChecklist
          steps={task.steps}
          onCheck={(stepId) => ...} />
        
        <CompletionForm
          onSubmit={(data) => {
            // Marcar concluído/pendente
            // Informar problemas
            // Sistema reagenda automaticamente
          }} />
      </TaskItem>
    ))}
  </TasksList>
  
  <SubmitButton onClick={handleDailyReport}>
    Enviar Relatório do Dia
  </SubmitButton>
</DailyWorkerReport>
```

### 5. CreateDetailedTask (Wizard de Criação)
```tsx
<CreateDetailedTask workId={1}>
  <WizardStep step={1} title="Informações Básicas">
    <SelectTaskClass onChange={...} />
    <SelectTaskSubclass classId={...} onChange={...} />
    <Input label="Nome da Tarefa" />
    <DatePicker label="Data" />
  </WizardStep>
  
  <WizardStep step={2} title="Dimensões e Recursos">
    <Input label="Área (m²)" type="number" />
    <Input label="Altura (m)" type="number" />
    <Input label="Largura (m)" type="number" />
    <Input label="Andares" type="number" />
  </WizardStep>
  
  <WizardStep step={3} title="Equipe">
    <Input label="Número de Funcionários" />
    <MultiSelect
      label="Funcionários Específicos"
      options={teamMembers} />
  </WizardStep>
  
  <WizardStep step={4} title="Resumo e Cálculos">
    <CalculatedRequirements
      time={estimatedMinutes}
      equipment={[...]}
      materials={[...]}
      cost={estimatedCost} />
    
    <Button onClick={handleCreate}>
      Criar Tarefa
    </Button>
  </WizardStep>
</CreateDetailedTask>
```

### 6. DailyDashboard (Dashboard de Progresso)
```tsx
<DailyDashboard workId={1}>
  <ProgressWidget
    percentage={progress.percentage}
    totalArea={progress.totalArea}
    completedArea={progress.completedArea} />
  
  <TodayTasksWidget
    total={...}
    completed={...}
    inProgress={...} />
  
  <DeviationsWidget
    delayedTasks={...}
    criticalAlerts={...} />
  
  <ProductivityChart
    data={productivityHistory}
    period="7days" />
  
  <TeamWidget
    activeToday={...}
    allocations={...} />
  
  <EquipmentWidget
    inUseToday={...}
    available={...} />
  
  <UpcomingTasksWidget
    nextWeek={...} />
</DailyDashboard>
```

---

## 📊 Principais Métricas do Sistema

### Performance:
- Cálculo de progresso: < 100ms
- Geração de relatório diário: < 200ms
- Reagendamento automático: < 500ms
- Previsão de término: < 150ms

### Escalabilidade:
- Suporta múltiplas obras simultâneas
- Histórico ilimitado de produtividade
- Milhares de tarefas por obra
- Centenas de funcionários

### Confiabilidade:
- Auditoria completa (changeLogs)
- Rollback possível via logs
- Alertas automáticos
- Validação em todas as camadas

---

## 🔒 Segurança

### Autenticação:
- OAuth implementado
- Sessions com cookies
- Proteção CSRF

### Autorização:
- `publicProcedure` - Leitura pública
- `protectedProcedure` - Requer autenticação
- Roles: user, admin

### Dados:
- Sanitização de inputs (Zod)
- Prepared statements (Drizzle)
- Validação em todas as rotas

---

## 🚀 Deploy

### Desenvolvimento:
```bash
npm run dev
# Servidor local na porta 3000
```

### Produção (Vercel):
```bash
vercel --prod
# Deploy automático com GitHub
```

### Banco de Dados:
- **Dev**: SQLite local (file:./database.sqlite)
- **Prod**: Turso (libSQL cloud)

---

## 📝 Resumo da Arquitetura

### Pontos Fortes:
✅ Backend completo e funcional
✅ Cálculos automáticos inteligentes
✅ Reagendamento automático
✅ Histórico e auditoria completos
✅ Escalável e performático
✅ Type-safe (TypeScript end-to-end)

### Próximos Passos:
⏳ Desenvolver interfaces do frontend
⏳ Implementar drag-and-drop (Kanban)
⏳ Criar gráficos de produtividade
⏳ Adicionar upload de fotos
⏳ Implementar notificações push

---

**Documentação criada em:** 29/06/2026  
**Versão:** 1.0  
**Status:** Arquitetura Backend Completa
