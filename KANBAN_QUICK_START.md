# 🚀 Quick Start - Sistema Kanban

## ✅ O Que Foi Implementado

### 📦 Pacotes Instalados
- ✅ `@dnd-kit/core` - Drag and drop core
- ✅ `@dnd-kit/sortable` - Ordenação e reordenamento
- ✅ `@dnd-kit/utilities` - Utilitários CSS
- ✅ `date-fns` - Manipulação de datas

### 🗄️ Schema do Banco de Dados
Novas tabelas adicionadas em `drizzle/schema.ts`:

1. **projects** - Projetos base
2. **project_phases** - Fases do projeto (Preparação, Reparos, etc.)
3. **project_tasks** - Tarefas do Kanban (arrastar/soltar)
4. **project_subtasks** - Breakdown detalhado de cada tarefa
5. **kanban_columns** - Colunas personalizáveis do Kanban
6. **calendar_slots** - Slots de tempo no calendário
7. **task_assignments** - Tarefas atribuídas a slots
8. **project_templates** - Templates para geração automática

### 🎨 Componentes React Criados

#### Páginas
- ✅ `ProjectKanban.tsx` - Página principal com 3 vistas

#### Componentes
- ✅ `KanbanColumn.tsx` - Coluna do quadro Kanban
- ✅ `KanbanTaskCard.tsx` - Card de tarefa arrastável
- ✅ `WeekCalendarView.tsx` - Calendário semanal
- ✅ `DayTimelineView.tsx` - Cronograma por hora
- ✅ `TaskBacklog.tsx` - Lista de tarefas não agendadas

### 🛠️ Serviços Backend
- ✅ `projectGenerator.ts` - Geração automática de tarefas

### 📚 Documentação
- ✅ `SISTEMA_KANBAN.md` - Documentação completa
- ✅ `EXEMPLO_USO_KANBAN.md` - Exemplos práticos
- ✅ `KANBAN_QUICK_START.md` - Este arquivo

## 🎯 Como Funciona

### 1️⃣ Criar Projeto → Gera Centenas de Tarefas

```typescript
const projeto = {
  nome: "Restauração Edifício",
  area: 500m²,
  andares: 4,
  template: "Restauração Completa"
};

// Sistema gera automaticamente:
✓ 4 fases
✓ 48 tarefas principais
✓ 432 subtarefas
✓ Dependências configuradas
✓ Estimativas calculadas
```

### 2️⃣ Kanban Board → Organizar Fluxo

```
Backlog (40) → Agendado (5) → Em Andamento (2) → Revisão (1) → Concluído (0)
    ↓ arrastar        ↓              ↓                ↓              ↓
  Espera         Planejado      Executando       Verificando    Pronto
```

### 3️⃣ Calendário Semanal → Planejar Semana

```
[DOM] [SEG] [TER] [QUA] [QUI] [SEX] [SÁB]
       ↓     ↓     ↓
  Arraste tarefas do backlog para dias específicos
```

### 4️⃣ Timeline Diária → Definir Horários

```
08:00 ┌────────────────┐
      │ Tarefa 1       │
09:00 │ (8 horas)      │
      └────────────────┘
13:00 ┌────────────────┐
      │ Tarefa 2       │
14:00 │ (6 horas)      │
      └────────────────┘
```

### 5️⃣ Progresso Atualiza Automaticamente

```
Concluir tarefa → Atualiza:
✓ Progresso do projeto (48/48 = 100%)
✓ Progresso da fase (4/4 = 100%)
✓ Desbloqueia próximas tarefas
✓ Gera alertas
```

## 🔧 Próximos Passos para Integração

### 1. Banco de Dados

```bash
# Aplicar migrations
npm run db:push

# Ou gerar migration
npm run db:generate
npm run db:migrate
```

### 2. Criar Rotas tRPC

```typescript
// server/routes.ts
export const projectRouter = router({
  // Criar projeto e gerar tarefas
  create: publicProcedure
    .input(z.object({
      workId: z.number(),
      name: z.string(),
      totalArea: z.number(),
      totalFloors: z.number(),
      templateId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const generated = await generateProject(input);
      // Inserir no banco
      // ...
      return generated;
    }),

  // Listar tarefas do projeto
  getTasks: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const tasks = await db.select()
        .from(projectTasks)
        .where(eq(projectTasks.projectId, input.projectId));
      return tasks;
    }),

  // Agendar tarefa
  scheduleTask: publicProcedure
    .input(z.object({
      taskId: z.number(),
      scheduledDate: z.string(),
      scheduledStartTime: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.update(projectTasks)
        .set({
          scheduledDate: input.scheduledDate,
          scheduledStartTime: input.scheduledStartTime,
          kanbanStatus: "scheduled",
          updatedAt: new Date(),
        })
        .where(eq(projectTasks.id, input.taskId));
    }),

  // Completar tarefa
  completeTask: publicProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ input }) => {
      // 1. Marcar tarefa como concluída
      await db.update(projectTasks)
        .set({
          status: "Concluído",
          kanbanStatus: "completed",
          completedAt: new Date(),
          progressPercent: 100,
        })
        .where(eq(projectTasks.id, input.taskId));

      // 2. Atualizar progresso do projeto
      const task = await db.select()
        .from(projectTasks)
        .where(eq(projectTasks.id, input.taskId))
        .limit(1);

      if (task.length > 0) {
        await updateProjectProgress(task[0].projectId);
      }

      // 3. Desbloquear tarefas dependentes
      // ...
    }),
});

async function updateProjectProgress(projectId: number) {
  const allTasks = await db.select()
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId));

  const completedCount = allTasks.filter(t => t.kanbanStatus === "completed").length;
  const progressPercent = (completedCount / allTasks.length) * 100;

  await db.update(projects)
    .set({
      completedTasks: completedCount,
      progressPercent,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}
```

### 3. Integrar Frontend com Backend

```typescript
// ProjectKanban.tsx
import { trpc } from "@/lib/trpc";

export default function ProjectKanban() {
  const { projectId } = useParams();

  // Carregar tarefas
  const { data: tasks, isLoading } = trpc.projects.getTasks.useQuery({
    projectId: Number(projectId),
  });

  // Mutation para agendar
  const scheduleTask = trpc.projects.scheduleTask.useMutation({
    onSuccess: () => {
      // Invalidar cache para recarregar
      queryClient.invalidateQueries(["projects.getTasks"]);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const taskId = Number(event.active.id);
    const dateString = String(event.over.id);

    scheduleTask.mutate({
      taskId,
      scheduledDate: dateString,
      scheduledStartTime: "08:00",
    });
  };

  // ...resto do componente
}
```

### 4. Testar Fluxo Completo

```typescript
// 1. Criar projeto
const projeto = await trpc.projects.create.mutate({
  workId: 1,
  name: "Teste Kanban",
  totalArea: 500,
  totalFloors: 4,
  templateId: 1,
});

// 2. Verificar tarefas geradas
const tarefas = await trpc.projects.getTasks.query({
  projectId: projeto.id,
});
console.log(`${tarefas.length} tarefas geradas`); // ~48

// 3. Navegar para Kanban
// http://localhost:5000/project/{projeto.id}/kanban

// 4. Arrastar tarefas
// (interface gráfica)

// 5. Completar tarefa
await trpc.projects.completeTask.mutate({ taskId: 1 });

// 6. Verificar progresso
const summary = await trpc.projects.getSummary.query({
  projectId: projeto.id,
});
console.log(summary.progressPercent); // 2.08%
```

## 🎨 Customização

### Adicionar Nova Coluna no Kanban

```typescript
// No banco de dados
await db.insert(kanbanColumns).values({
  projectId: 1,
  name: "Aguardando Material",
  columnType: "scheduled",
  color: "#9333ea",
  columnOrder: 2,
});
```

### Criar Template Customizado

```typescript
const TEMPLATE_PINTURA_SIMPLES = {
  id: 2,
  name: "Pintura Simples",
  phases: [
    {
      name: "Preparação",
      tasks: [/* ... */]
    },
    {
      name: "Pintura",
      tasks: [/* ... */]
    }
  ]
};
```

### Ajustar Horários do Timeline

```typescript
// Em DayTimelineView.tsx
const timeSlots = useMemo(() => {
  const slots = [];
  // Alterar range: 6h às 20h
  for (let hour = 6; hour <= 20; hour++) {
    // ...
  }
  return slots;
}, []);
```

## 📱 Acessar Sistema

```bash
# 1. Iniciar servidor
npm run dev

# 2. Navegar no browser
http://localhost:5000/project/1/kanban

# 3. Vistas disponíveis:
# - Quadro Kanban
# - Calendário Semanal
# - Linha do Tempo Diária
```

## 🎯 Features Principais

### ✅ Implementado
- [x] Drag and drop entre colunas
- [x] Arrastar para calendário semanal
- [x] Arrastar para horários específicos
- [x] 3 vistas diferentes (Kanban, Calendário, Timeline)
- [x] Filtros avançados
- [x] Indicadores visuais de progresso
- [x] Geração automática de tarefas
- [x] Hierarquia (Projeto > Fases > Tarefas > Subtarefas)
- [x] Cálculo de estimativas

### 🔄 Pendente (Backend)
- [ ] Rotas tRPC completas
- [ ] Inserção no banco de dados
- [ ] Cálculo de dependências
- [ ] Sistema de alertas
- [ ] Recálculo de progresso
- [ ] WebSockets para tempo real
- [ ] Exportação de relatórios

## 💡 Dicas

### Performance
```typescript
// Use memo para listas grandes
const filteredTasks = useMemo(() => {
  return tasks.filter(/* ... */);
}, [tasks, filters]);

// Use virtual scroll para 100+ tarefas
import { VirtualScroll } from "@/components/ui/virtual-scroll";
```

### UX
```typescript
// Adicione confirmação para ações importantes
const handleCompleteTask = async (taskId: number) => {
  const confirmed = await confirm("Tem certeza que deseja concluir esta tarefa?");
  if (confirmed) {
    await completeTask.mutate({ taskId });
  }
};

// Toast notifications
import { toast } from "sonner";
toast.success("Tarefa agendada com sucesso!");
```

### Mobile
```typescript
// Detectar toque vs mouse
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px antes de arrastar (evita clicks acidentais)
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
);
```

## 📞 Suporte

Dúvidas ou problemas? Consulte:
- 📖 `SISTEMA_KANBAN.md` - Documentação completa
- 💼 `EXEMPLO_USO_KANBAN.md` - Casos de uso
- 🔧 `projectGenerator.ts` - Lógica de geração

## 🎉 Pronto!

Seu sistema Kanban está pronto para uso! Basta integrar com o backend e começar a gerenciar projetos de forma profissional. 🚀

**Features Inspiradas Por:**
- Jira Kanban Board
- Monday.com Timeline
- Trello Drag-and-Drop
- Asana Calendar View
- Sistemas ERP de Construção Civil

**Construído Com:**
- React + TypeScript
- @dnd-kit (Drag and Drop)
- Tailwind CSS + shadcn/ui
- date-fns
- tRPC + Drizzle ORM
