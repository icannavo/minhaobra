# 🚀 Quick Start - ERP de Gestão de Obras

## ⚡ Começar em 5 Minutos

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
```bash
# Criar as tabelas
npx drizzle-kit push:sqlite

# Popular com dados de exemplo
npm run seed
```

### 3. Iniciar Servidor
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📊 Dados de Exemplo (Seed)

Após rodar `npm run seed`, você terá:

### Obras:
- **OBRA-001**: Restauração Edifício Central (Em Andamento)
- **OBRA-002**: Pintura Prédio Comercial (Planejamento)

### Funcionários:
- João Silva (Encarregado - Fachadas)
- Maria Santos (Pintora - Pintura Externa)
- Pedro Costa (Pintor - Pintura e Textura)
- Ana Paula (Pintora - Acabamento)
- Carlos Mendes (Pedreiro - Massa e Reboco)
- Lucas Oliveira (Ajudante - Preparação)
- Fernanda Lima (Pintora - Pintura Externa)
- Roberto Alves (Encarregado - Limpeza Industrial)

### Equipamentos:
- Lavajato Profissional
- Andaime Metálico
- Compressor de Ar
- Pistola de Pintura
- Lixadeira Orbital
- Escada Extensível
- Betoneira
- Martelete

### Templates de Tarefas:
- **Limpeza de Fachada**
  - Com Lavajato (9 etapas detalhadas)
  - Manual com Produto Químico
- **Preparação de Superfície**
  - Lixamento e Massa Corrida
- **Aplicação de Pintura**
  - Pintura com Pistola (2 demãos)

### Tarefas Agendadas:
- 7 tarefas para os próximos 7 dias
- Histórico de produtividade dos últimos 7 dias

---

## 🔍 Testar Funcionalidades

### 1. Ver Todas as Obras
```typescript
// No seu componente React
const { data: obras } = trpc.works.getAll.useQuery();
console.log(obras);
```

### 2. Calcular Progresso de uma Obra
```typescript
const { data: progress } = trpc.reports.workProgress.useQuery({
  workId: 1
});
console.log(`Progresso: ${progress.percentage}%`);
```

### 3. Ver Tarefas de Hoje
```typescript
const today = new Date().toISOString().slice(0, 10);
const { data: tasks } = trpc.detailedTasks.getByWork.useQuery({
  workId: 1,
  date: today
});
console.log(`${tasks.length} tarefas para hoje`);
```

### 4. Previsão de Término
```typescript
const { data: estimate } = trpc.reports.estimateCompletion.useQuery({
  workId: 1
});
console.log(`Termina em ${estimate.daysNeeded} dias`);
console.log(`Data prevista: ${estimate.estimatedCompletionDate}`);
```

### 5. Relatório do Dia
```typescript
const { data: report } = trpc.reports.dailyReport.useQuery({
  workId: 1,
  date: "2026-06-29"
});
console.log(report.summary); // Resumo do dia
console.log(report.area); // Estatísticas de área
console.log(report.tasks); // Lista de tarefas
```

---

## 🎯 Fluxo Completo de Uso

### Cenário: Gerente de Obra

#### 1. Ver Dashboard
```typescript
// Dashboard principal
const progress = await trpc.reports.workProgress.query({ workId: 1 });
const estimate = await trpc.reports.estimateCompletion.query({ workId: 1 });

// Exibir:
// - Progresso: 45.5%
// - Previsão: Termina em 4 dias
// - Alertas pendentes
```

#### 2. Criar Nova Tarefa
```typescript
// Wizard de criação
const taskClass = await trpc.taskClasses.getAll.query();
// Usuário escolhe: "Limpeza de Fachada"

const subclasses = await trpc.taskSubclasses.getByClass.query({
  classId: 1
});
// Usuário escolhe: "Limpeza com Lavajato"

// Calcular requisitos
const requirements = await trpc.detailedTasks.calculateRequirements.query({
  subclassId: 1,
  area: 50,
  floors: 3
});
// Mostra: tempo estimado, equipamentos, materiais

// Criar tarefa
await trpc.detailedTasks.create.mutate({
  workId: 1,
  date: "2026-06-30",
  classId: 1,
  subclassId: 1,
  taskName: "Limpeza Parede Norte",
  area: 50,
  floors: 3,
  numberOfEmployees: 2,
  team: "Equipe A"
});
```

#### 3. Alocar Equipe
```typescript
// Buscar funcionários disponíveis
const team = await trpc.teamMembers.getAll.query();

// Alocar funcionários específicos
await trpc.taskTeamAllocations.allocate.mutate({
  detailedTaskId: 1,
  teamMemberId: 1, // João Silva
  role: "Encarregado",
  hoursAllocated: 8
});

await trpc.taskTeamAllocations.allocate.mutate({
  detailedTaskId: 1,
  teamMemberId: 2, // Maria Santos
  role: "Operadora",
  hoursAllocated: 8
});
```

#### 4. Planejar Dia (Kanban)
```typescript
// Buscar cronograma do dia
const schedule = await trpc.dailySchedules.getByDate.query({
  workId: 1,
  date: "2026-06-30"
});

// Criar agendamentos de horário
await trpc.scheduledTasks.create.mutate({
  dailyScheduleId: schedule.id,
  detailedTaskId: 1,
  scheduledStartTime: "08:00",
  slotOrder: 0
});

await trpc.scheduledTasks.create.mutate({
  dailyScheduleId: schedule.id,
  detailedTaskId: 2,
  scheduledStartTime: "14:00",
  slotOrder: 0
});
```

---

### Cenário: Funcionário no Campo

#### 1. Ver Minhas Tarefas de Hoje
```typescript
const today = new Date().toISOString().slice(0, 10);
const myTasks = await trpc.detailedTasks.getByWork.query({
  workId: 1,
  date: today
});

// Interface mostra para o funcionário:
myTasks.forEach(task => {
  console.log(`📋 ${task.taskName}`);
  console.log(`📏 Área: ${task.area} m²`);
  console.log(`👷 Equipe: ${task.numberOfEmployees} pessoas`);
  
  // Buscar etapas
  const steps = await trpc.taskSteps.getBySubclass.query({
    subclassId: task.subclassId
  });
  
  console.log(`📝 Etapas:`);
  steps.forEach(step => {
    console.log(`  ${step.stepOrder}. ${step.name}`);
  });
});
```

#### 2. Executar Tarefa (Marcar Etapas)
```typescript
// Iniciar etapa "Reunião de Segurança"
await trpc.stepExecutions.start.mutate({
  detailedTaskId: 1,
  stepId: 1 // DDS
});

// ... 15 minutos depois ...

// Concluir etapa
await trpc.stepExecutions.complete.mutate({
  executionId: 1,
  notes: "Todos os procedimentos de segurança foram revisados"
});

// Iniciar próxima etapa "Montagem de Andaime"
await trpc.stepExecutions.start.mutate({
  detailedTaskId: 1,
  stepId: 2
});

// ... executa trabalho ...
```

#### 3. Finalizar Dia (Relatório)
```typescript
// Marcar tarefa como concluída (ou não)
await trpc.detailedTasks.update.mutate({
  id: 1,
  status: "Concluído",
  actualTotalMinutes: 420, // 7 horas
  notes: "Tarefa concluída sem problemas"
});

// OU se não foi concluída
await trpc.detailedTasks.update.mutate({
  id: 2,
  status: "Em Execução",
  actualTotalMinutes: 180, // 3 horas
  notes: "Chuva interrompeu trabalho às 15h",
  issues: "Clima desfavorável"
});
```

---

### Cenário: Fim do Dia (Sistema Automático)

#### Reagendar Tarefas Não Concluídas
```typescript
// Chamar no fim do dia (pode ser automatizado)
const today = new Date().toISOString().slice(0, 10);
const movedCount = await trpc.reports.rescheduleIncomplete.mutate({
  workId: 1,
  fromDate: today
});

console.log(`${movedCount} tarefas foram reagendadas para amanhã`);

// Sistema automaticamente:
// 1. Move tarefas não concluídas para o próximo dia
// 2. Atualiza status para "Adiado"
// 3. Cria alertas
// 4. Recalcula cronograma
```

---

## 📱 Exemplos de Interface (Código React)

### Dashboard Widget de Progresso
```tsx
import { trpc } from '@/lib/trpc';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function WorkProgressWidget({ workId }: { workId: number }) {
  const { data: progress } = trpc.reports.workProgress.useQuery({ workId });

  if (!progress) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso da Obra</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{progress.percentage}%</span>
            <span className="text-sm text-muted-foreground">
              {progress.completedTasks} / {progress.totalTasks} tarefas
            </span>
          </div>
          
          <Progress value={progress.percentage} />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Área Concluída</p>
              <p className="font-semibold">{progress.completedArea} m²</p>
            </div>
            <div>
              <p className="text-muted-foreground">Área Total</p>
              <p className="font-semibold">{progress.totalArea} m²</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Lista de Tarefas do Dia
```tsx
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';

export function TodayTasksList({ workId }: { workId: number }) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: tasks } = trpc.detailedTasks.getByWork.useQuery({
    workId,
    date: today
  });

  const statusColors = {
    'Planejado': 'bg-blue-100 text-blue-800',
    'Em Execução': 'bg-yellow-100 text-yellow-800',
    'Concluído': 'bg-green-100 text-green-800',
    'Adiado': 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Tarefas de Hoje</h2>
      {tasks?.map(task => (
        <Card key={task.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{task.taskName}</h3>
              <p className="text-sm text-muted-foreground">
                Área: {task.area} m² | Equipe: {task.numberOfEmployees} pessoas
              </p>
            </div>
            <Badge className={statusColors[task.status as keyof typeof statusColors]}>
              {task.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### Botão de Reagendar
```tsx
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function RescheduleButton({ workId }: { workId: number }) {
  const { toast } = useToast();
  const utils = trpc.useContext();
  
  const reschedule = trpc.reports.rescheduleIncomplete.useMutation({
    onSuccess: (count) => {
      toast({
        title: "Tarefas Reagendadas",
        description: `${count} tarefas foram movidas para o próximo dia.`,
      });
      // Recarregar dados
      utils.detailedTasks.invalidate();
      utils.dailySchedules.invalidate();
    }
  });

  const handleReschedule = () => {
    const today = new Date().toISOString().slice(0, 10);
    reschedule.mutate({
      workId,
      fromDate: today
    });
  };

  return (
    <Button 
      onClick={handleReschedule}
      disabled={reschedule.isLoading}>
      {reschedule.isLoading ? 'Reagendando...' : 'Finalizar Dia e Reagendar'}
    </Button>
  );
}
```

---

## 🧪 Testar via Console do Navegador

Abra o console (F12) e execute:

```javascript
// Ver todas as obras
await fetch('/api/trpc/works.getAll').then(r => r.json())

// Calcular progresso da obra 1
await fetch('/api/trpc/reports.workProgress?input={"workId":1}')
  .then(r => r.json())

// Ver tarefas de hoje da obra 1
const today = new Date().toISOString().slice(0, 10);
await fetch(`/api/trpc/detailedTasks.getByWork?input={"workId":1,"date":"${today}"}`)
  .then(r => r.json())
```

---

## 📚 Endpoints Principais

### Leitura (GET):
```
✅ works.getAll - Listar obras
✅ works.getById - Detalhes de obra
✅ teamMembers.getAll - Listar funcionários
✅ equipments.getAll - Listar equipamentos
✅ taskClasses.getAll - Listar templates
✅ detailedTasks.getByWork - Tarefas de uma obra/dia
✅ dailySchedules.getByDate - Cronograma de um dia
✅ reports.workProgress - Progresso da obra
✅ reports.dailyReport - Relatório completo do dia
✅ reports.estimateCompletion - Previsão de término
```

### Escrita (POST/PUT):
```
✅ works.create - Criar obra
✅ teamMembers.create - Adicionar funcionário
✅ detailedTasks.create - Criar tarefa
✅ taskTeamAllocations.allocate - Alocar funcionário
✅ scheduledTasks.create - Agendar tarefa (Kanban)
✅ stepExecutions.start - Iniciar etapa
✅ stepExecutions.complete - Concluir etapa
✅ detailedTasks.update - Atualizar tarefa
✅ reports.rescheduleIncomplete - Reagendar automático
```

---

## 🎓 Próximos Passos para Desenvolvimento

### Semana 1: Fundações
- [ ] Criar componente ProjectDetails completo
- [ ] Implementar gestão de equipe (adicionar/remover/editar)
- [ ] Widget de progresso visual
- [ ] Lista de equipamentos com calendário de uso

### Semana 2: Criação de Tarefas
- [ ] Wizard de 4 passos para criar tarefa
- [ ] Auto-complete de templates
- [ ] Cálculo automático de requisitos (visualização)
- [ ] Preview antes de criar

### Semana 3: Visualização
- [ ] Calendário mensal com react-big-calendar
- [ ] Modal de detalhes do dia
- [ ] Lista de tarefas filtrada por data
- [ ] Status visual por dia

### Semana 4: Kanban
- [ ] Implementar @dnd-kit/core
- [ ] Colunas de horários
- [ ] Drag-and-drop funcional
- [ ] Salvar posições automaticamente

### Semana 5: Relatório do Funcionário
- [ ] Interface mobile-first
- [ ] Checklist interativo de etapas
- [ ] Formulário de relatório
- [ ] Botão "Enviar e Reagendar"

### Semana 6: Dashboard
- [ ] Widgets de resumo
- [ ] Gráfico de produtividade (Recharts)
- [ ] Lista de alertas
- [ ] Previsão de término visual

---

## 🐛 Troubleshooting

### Erro: "Database not found"
```bash
# Criar o banco novamente
npx drizzle-kit push:sqlite
npm run seed
```

### Erro: "tRPC endpoint not found"
```bash
# Verificar se o servidor está rodando
npm run dev
```

### Erro: "Invalid date format"
```typescript
// Use sempre formato ISO
const date = new Date().toISOString().slice(0, 10);
// Resultado: "2026-06-29"
```

---

## 📞 Ajuda

- **Documentação Completa**: Ver `PLANO_IMPLEMENTACAO_ERP.md`
- **Arquitetura**: Ver `ARQUITETURA_SISTEMA.md`
- **Funcionalidades**: Ver `FUNCIONALIDADES_IMPLEMENTADAS.md`

---

**Última atualização:** 29/06/2026  
**Versão:** 1.0  
**Status:** Sistema Backend Funcional ✅
