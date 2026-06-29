# 📋 Sistema Kanban de Planejamento Diário

## 🎯 Visão Geral

Sistema de **Kanban interativo** para planejamento diário de obras, onde você arrasta tarefas detalhadas para slots de tempo (hora por hora), cada tarefa carregando seus equipamentos, materiais e tempo estimado.

## ✨ Funcionalidades Principais

### 1. 🎨 Interface Kanban Drag & Drop

```
┌─────────────────────────────────────────────────────────────┐
│  TAREFAS DISPONÍVEIS  │  07:00  │  08:00  │  09:00  │  ...  │
├───────────────────────┼─────────┼─────────┼─────────┼───────┤
│  🏗️ Limpeza Parede A  │         │         │         │       │
│     ⏱️ 400 min         │         │         │         │       │
│     📦 4 equipamentos  │         │         │         │       │
│     ────────────────   │         │         │         │       │
│                        │         │         │         │       │
│  🎨 Pintura Parede B   │         │         │         │       │
│     ⏱️ 180 min         │         │         │         │       │
│     📦 2 equipamentos  │         │         │       │
│                        │         │         │         │       │
└───────────────────────┴─────────┴─────────┴─────────┴───────┘

ARRASTE UMA TAREFA ────────────────────────►

┌─────────────────────────────────────────────────────────────┐
│  TAREFAS DISPONÍVEIS  │  07:00  │  08:00  │  09:00  │  ...  │
├───────────────────────┼─────────┼─────────┼─────────┼───────┤
│                        │ 🏗️ Limpeza│        │         │       │
│  🎨 Pintura Parede B   │ Parede A │        │         │       │
│     ⏱️ 180 min         │ 400 min  │        │         │       │
│     📦 2 equipamentos  │ ⚠️ 6.7h! │        │         │       │
│                        │         │         │         │       │
└───────────────────────┴─────────┴─────────┴─────────┴───────┘
```

### 2. ⏰ Slots de Tempo (Hora por Hora)

**Horário de Trabalho:**
- 07:00 - Início
- 08:00 - Trabalho
- 09:00 - Trabalho
- 10:00 - Trabalho
- 11:00 - Trabalho
- **12:00 - Almoço** (marcado especialmente)
- 13:00 - Trabalho
- 14:00 - Trabalho
- 15:00 - Trabalho
- 16:00 - Trabalho
- 17:00 - Fim

**Cada slot mostra:**
- ✅ Tarefas agendadas
- ⏱️ Tempo total alocado
- ⚠️ Alerta se exceder 60 minutos

### 3. 📦 Cartões de Tarefa Detalhados

Cada cartão de tarefa exibe:

```
┌────────────────────────────────────┐
│ ⋮⋮ Limpeza Parede Externa Bloco A │ ✓
├────────────────────────────────────┤
│ Limpeza com lavajato de 5m × 3m   │
│                                    │
│ ⏱️ 6.7h  📦 4 equip.               │
│                                    │
│ Equipamentos:                      │
│ • 3× Andaime 2m                    │
│ • 1× Lavajato                      │
│ • +2 mais...                       │
└────────────────────────────────────┘
```

**Informações Incluídas:**
- ✏️ Nome da tarefa
- 📝 Descrição curta
- ⏱️ Tempo estimado (horas e minutos)
- 📦 Quantidade de equipamentos
- 🔧 Lista de equipamentos (top 2 + contador)
- ✅ Status (concluído ou não)

### 4. 📊 Progresso da Obra em Tempo Real

```
┌─────────────────────────────────────┐
│ Progresso da Obra                   │
│ ██████████░░░░░░░░░░░░ 45%         │
│ 12 de 27 tarefas concluídas        │
└─────────────────────────────────────┘
```

**Atualização Automática:**
- ✅ Marca tarefa como concluída → progresso aumenta
- ➕ Adiciona nova tarefa → recalcula percentual
- 🗑️ Remove tarefa → recalcula percentual

### 5. 🎯 Resumo do Dia

```
┌─────────────────────────────────────┐
│ Resumo do Dia                       │
├─────────────────────────────────────┤
│ Tempo agendado:      8h 45min       │
│ Tarefas agendadas:   6              │
│ Não agendadas:       3              │
└─────────────────────────────────────┘
```

### 6. ⚠️ Validações Inteligentes

#### Alerta de Sobrecarga:
```
┌───────────────────────────────────┐
│ 09:00                             │
├───────────────────────────────────┤
│ 🏗️ Tarefa A (400 min)            │
│                                   │
│ ⚠️ Tempo excede 1 hora!          │
│    Esta slot tem 6.7h de trabalho │
└───────────────────────────────────┘
```

#### Alerta Visual:
- 🔴 Slot vermelho se > 60 min
- 🟢 Slot verde se dentro do limite
- 🟡 Slot amarelo se perto do limite

## 🔄 Fluxo de Trabalho

### Etapa 1: Selecionar Obra e Data
```
1. Escolher obra no dropdown
2. Selecionar data (hoje por padrão)
3. Sistema carrega tarefas dessa obra/data
```

### Etapa 2: Planejar o Dia
```
1. Todas as tarefas aparecem em "Tarefas Disponíveis"
2. Arrastar cada tarefa para o horário desejado
3. Sistema valida se cabe no horário
4. Reorganizar conforme necessário
```

### Etapa 3: Executar
```
1. Durante o dia, marcar tarefas como concluídas
2. Progresso atualiza automaticamente
3. Cronograma recalcula data estimada
```

### Etapa 4: Ajustar
```
1. Adicionar novas tarefas conforme necessário
2. Mover tarefas não concluídas para outro dia
3. Editar tempo/equipamentos se necessário
```

## 🎨 Componentes Principais

### 1. **DraggableTask** - Cartão Arrastável
```typescript
<DraggableTask
  task={{
    id: "1",
    taskName: "Limpeza Parede A",
    estimatedMinutes: 400,
    status: "Planejado",
    equipments: [...],
    materials: [...]
  }}
/>
```

### 2. **TimeSlotDroppable** - Slot de Horário
```typescript
<TimeSlotDroppable
  slot={{ id: "09:00", label: "09:00", hour: 9 }}
  tasks={[...tarefas...]}
/>
```

### 3. **DndContext** - Contexto de Drag & Drop
```typescript
<DndContext
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {/* Conteúdo arrastável */}
</DndContext>
```

## 📈 Cálculos Automáticos

### 1. Tempo por Slot
```javascript
const totalMinutes = tasks.reduce(
  (sum, task) => sum + task.estimatedMinutes, 
  0
);
const hours = Math.floor(totalMinutes / 60);
const minutes = totalMinutes % 60;
```

### 2. Progresso da Obra
```javascript
const completedTasks = tasks.filter(t => t.status === "Concluído").length;
const totalTasks = tasks.length;
const progress = (completedTasks / totalTasks) * 100;
```

### 3. Detecção de Sobrecarga
```javascript
const isOverloaded = totalMinutes > 60; // mais de 1 hora
```

## 🎯 Benefícios do Sistema Kanban

### ✅ Visual e Intuitivo
- Veja todo o dia de uma vez
- Arraste e solte facilmente
- Cores e ícones informativos

### ✅ Planejamento Realista
- Considera tempo real de cada tarefa
- Alerta se sobrecarregar um horário
- Equipamentos viajam com a tarefa

### ✅ Progresso em Tempo Real
- Veja quanto falta
- Recalcula estimativas automaticamente
- Ajusta cronograma conforme progresso

### ✅ Flexível
- Adicione tarefas a qualquer momento
- Mova tarefas entre dias
- Edite conforme necessário

## 🔮 Próximas Funcionalidades

### 1. 📱 Modo de Execução
```
- Iniciar/pausar/concluir tarefas
- Cronômetro por etapa
- Notificações de cooldown
```

### 2. 👥 Gestão de Equipes
```
- Atribuir tarefas a funcionários
- Ver quem faz o quê
- Evitar conflitos de recursos
```

### 3. 📊 Gráfico de Gantt
```
- Visualização timeline
- Dependências entre tarefas
- Caminho crítico
```

### 4. 🤖 Sugestões Inteligentes
```
- Sistema sugere melhor ordem
- Otimiza uso de equipamentos
- Minimiza tempo de preparação
```

### 5. 📅 Planejamento Semanal
```
- Ver semana inteira
- Distribuir tarefas automaticamente
- Balancear carga de trabalho
```

## 💡 Exemplo de Uso Real

### Cenário: Obra de Restauração - Edifício Centro

**Segunda-feira, 30/06/2026**

#### Manhã (07:00 - 12:00):
```
07:00-08:00 → Reunião de Segurança + Montagem Andaime
08:00-10:30 → Limpeza Parede A (Bloco 1)
10:30-12:00 → Limpeza Parede B (Bloco 1)
12:00-13:00 → ALMOÇO
```

#### Tarde (13:00 - 17:00):
```
13:00-14:00 → Limpeza Fuligem (Bloco 1)
14:00-15:30 → Preparação Parede C para Pintura
15:30-17:00 → Desmontagem e Organização
```

**Resultado:**
- ✅ 6 tarefas agendadas
- ⏱️ 9 horas de trabalho efetivo
- 📦 Equipamentos organizados por tarefa
- 📊 33% da obra concluída neste dia

## 🚀 Como Acessar

### Rota
```
/daily-kanban
```

### Link no Menu
```
Dashboard → Kanban Diário
```

---

**🎯 Sistema Kanban: Planejamento Visual, Execução Precisa, Progresso em Tempo Real**

*Porque planejar visualmente é mais eficiente do que listas infinitas de tarefas.*

✨ **Arraste, organize, execute, conquiste!** ✨
