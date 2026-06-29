# Sistema Detalhado de Gerenciamento de Tarefas

## 📋 Visão Geral

Este sistema implementa uma solução completa para gerenciamento de tarefas de restauração e obras, considerando **TODOS** os aspectos da realidade de uma obra, desde a preparação até a finalização.

## 🏗️ Arquitetura do Sistema

### 1. **Classes de Tarefas** (`taskClasses`)
Templates principais de categorias de trabalho.

**Exemplo:** "Limpeza de Fachada"

**Campos:**
- `name`: Nome da classe
- `code`: Código único (ex: LF-001)
- `category`: Categoria geral
- `requiresScaffolding`: Necessita andaime?
- `requiresSafetyMeeting`: Necessita reunião de segurança?
- `safetyMeetingMinutes`: Duração da reunião
- `baseProductivity`: Produtividade base (m²/pessoa/dia)

### 2. **Subclasses de Tarefas** (`taskSubclasses`)
Variações específicas dentro de uma classe.

**Exemplo:** "Limpeza com Lavajato" (dentro de "Limpeza de Fachada")

**Campos:**
- `classId`: Referência à classe pai
- `name`: Nome da subclasse
- `code`: Código único (ex: LF-LJ-001)
- `productivityMultiplier`: Ajuste de produtividade (1.0 = padrão, 1.2 = 20% mais rápido)

### 3. **Etapas de Tarefas** (`taskSteps`)
Breakdown detalhado de cada etapa necessária.

**Tipos de Etapas:**
- ✅ `SAFETY_MEETING` - Reunião de segurança
- 🔧 `PREPARATION` - Preparação geral
- ⚙️ `EQUIPMENT_SETUP` - Montagem de equipamentos
- 🏗️ `SCAFFOLDING` - Montagem/desmontagem de andaime
- 🦺 `EPIs` - Vestir EPIs
- ⚡ `EXECUTION` - Execução principal da tarefa
- ☕ `BREAK` - Pausas e descanso
- 🧹 `CLEANUP` - Limpeza pós-execução
- 🔍 `INSPECTION` - Inspeção e correção
- 📦 `EQUIPMENT_TEARDOWN` - Desmontagem e guarda

**Cálculo de Tempo:**
- `FIXED`: Tempo fixo (ex: 15 minutos)
- `PER_M2`: Por metro quadrado (ex: 2 min/m²)
- `PER_FLOOR`: Por andar (ex: 30 min/andar para andaime)
- `PER_EQUIPMENT`: Por equipamento
- `PERCENTAGE_EXECUTION`: Percentual do tempo de execução

**Restrições:**
- `requiresCooldown`: Equipamento precisa esfriar?
- `maxContinuousMinutes`: Tempo máximo contínuo (ex: 30 min)
- `cooldownMinutes`: Tempo de resfriamento (ex: 10 min)

### 4. **Equipamentos por Etapa** (`stepEquipments`)
Equipamentos necessários em cada etapa.

**Exemplo:** Etapa "Preparar Equipamentos" precisa de:
- 1x Lavajato
- 1x Mangueira 15m
- 1x Extensão Elétrica

### 5. **Materiais por Etapa** (`stepMaterials`)
Materiais consumidos em cada etapa.

**Exemplo:** Etapa "Montagem de Andaime" precisa de:
- 4x Buxas de Aço (por andar)
- 4x Ganchos (por andar)
- 8m Corda de Segurança (por andar)

**Cálculo de Quantidade:**
- `FIXED`: Quantidade fixa
- `PER_M2`: Por metro quadrado
- `PER_FLOOR`: Por andar

## 📊 Exemplo Real: Limpeza de Parede Externa

### Cenário
- **Parede:** 5m (altura) × 3m (largura) = 15m²
- **Andares necessários:** 3 (5m ÷ 2m por módulo ≈ 3)
- **Funcionários:** 1

### Breakdown Completo de Tempo

| # | Etapa | Tipo | Cálculo | Tempo |
|---|-------|------|---------|-------|
| 1 | Reunião de Segurança | SAFETY_MEETING | Fixo | 15 min |
| 2 | Montagem do Andaime | SCAFFOLDING | 3 andares × 30 min | 90 min |
| 3 | Vestir EPIs | EPIs | Fixo | 10 min |
| 4 | Preparar Equipamentos | EQUIPMENT_SETUP | Fixo | 20 min |
| 5 | Limpeza da Parede | EXECUTION | 15m² × 2 min/m² | 30 min |
| - | *(sem cooldown)* | - | (< 30 min contínuos) | 0 min |
| 6 | Almoço | BREAK | Fixo | 60 min |
| 7 | Limpeza da Fuligem | CLEANUP | Fixo | 60 min |
| 8 | Limpar Equipamentos | EQUIPMENT_TEARDOWN | Fixo | 25 min |
| 9 | Desmontagem Andaime | SCAFFOLDING | 3 andares × 20 min | 60 min |
| 10 | Inspeção Final | INSPECTION | Fixo | 30 min |
| **TOTAL** | | | | **~400 min (~6.7h)** |

### Materiais Necessários

**EPIs:**
- 1× Luva de Proteção
- 1× Óculos de Proteção
- 1× Roupa de Proteção Impermeável
- 1× Colete com Linha de Vida
- 1× Bota de Segurança

**Fixação do Andaime:**
- 12× Buxas de Aço (4 por andar × 3 andares)
- 12× Ganchos de Aço (4 por andar × 3 andares)
- 24m Corda de Segurança (8m por andar × 3 andares)

**Limpeza:**
- 3× Saco de Lixo Industrial 100L
- 1× Vassoura
- 1× Pá de Lixo

**Equipamentos:**
- 3× Módulos de Andaime 2m
- 1× Lava-Jato Profissional
- 1× Mangueira Alta Pressão 15m
- 1× Extensão Elétrica 20m

### Custos de Equipamentos (exemplo)
- Andaime: R$ 80/dia × 3 módulos = R$ 240
- Lavajato: R$ 15/hora × ~0.5h = R$ 7.50
- Mangueira: R$ 8/dia = R$ 8
- Extensão: R$ 5/dia = R$ 5
- **Total Equipamentos: ~R$ 260.50**

## 🚀 Como Usar o Sistema

### 1. Criar uma Nova Classe de Tarefa

```typescript
await db.createTaskClass({
  name: "Pintura de Fachada",
  code: "PF-001",
  category: "Pintura",
  description: "Pintura completa de fachadas externas",
  requiresScaffolding: true,
  requiresSafetyMeeting: true,
  safetyMeetingMinutes: 15,
  baseProductivity: 15, // 15 m²/pessoa/dia
});
```

### 2. Criar uma Subclasse

```typescript
await db.createTaskSubclass({
  classId: 1,
  name: "Pintura com Rolo",
  code: "PF-RL-001",
  description: "Pintura manual com rolo de alta qualidade",
  productivityMultiplier: 1.0, // Produtividade padrão
});
```

### 3. Criar Etapas Detalhadas

```typescript
// Etapa de Preparação da Superfície
await db.createTaskStep({
  subclassId: 1,
  name: "Preparação da Superfície",
  stepOrder: 1,
  stepType: "PREPARATION",
  baseTimeMinutes: 5,
  timeCalculationType: "PER_M2",
  timeCalculationValue: 5, // 5 min por m²
  description: "Lixamento e limpeza da superfície",
});

// Etapa de Pintura
await db.createTaskStep({
  subclassId: 1,
  name: "Aplicação da Tinta",
  stepOrder: 2,
  stepType: "EXECUTION",
  baseTimeMinutes: 3,
  timeCalculationType: "PER_M2",
  timeCalculationValue: 3, // 3 min por m²
  description: "Aplicação de duas demãos de tinta",
});
```

### 4. Criar uma Tarefa Detalhada na Obra

```typescript
await db.createDetailedTask({
  workId: 1,
  date: "2026-06-30",
  classId: 1,
  subclassId: 1,
  taskName: "Limpeza Parede Externa Bloco A",
  description: "Limpeza da parede externa do bloco A",
  area: 15, // 15 m²
  height: 5, // 5 metros
  width: 3, // 3 metros
  floors: 3, // 3 andares de andaime
  team: "Equipe Alpha",
  numberOfEmployees: 1,
  weather: "Ensolarado",
  temperature: 25,
});
```

### 5. Calcular Requisitos Automaticamente

```typescript
const requirements = await db.calculateTaskRequirements(
  subclassId: 1,
  area: 15,
  floors: 3
);

console.log(requirements);
// {
//   equipments: [...],
//   materials: [...],
//   totalTime: 400, // minutos
//   breakdown: [...]
// }
```

### 6. Executar e Rastrear Etapas

```typescript
// Iniciar uma etapa
const execution = await db.startStepExecution(
  detailedTaskId: 1,
  stepId: 1
);

// ... trabalho sendo realizado ...

// Concluir a etapa
await db.completeStepExecution(
  executionId: execution.id,
  notes: "Etapa concluída sem problemas",
  issues: null
);
```

## 🎯 Benefícios do Sistema

### ✅ Planejamento Preciso
- Tempo estimado real considerando TODAS as etapas
- Não apenas "lavar parede = 30 min", mas todo o processo completo

### ✅ Gestão de Recursos
- Lista automática de materiais necessários
- Cálculo de equipamentos por área/andar
- Controle de custos de equipamentos

### ✅ Segurança
- Checklist de EPIs por tarefa
- Reunião de segurança integrada
- Procedimentos de montagem/desmontagem

### ✅ Realismo
- Considera tempo de montagem de andaime por andar
- Restrições de equipamentos (cooldown de máquinas)
- Tempo de limpeza e organização
- Buffer para imprevistos

### ✅ Rastreabilidade
- Registro de execução de cada etapa
- Tempo real vs estimado
- Problemas encontrados
- Histórico completo

## 📈 Próximos Passos

1. **Interface de Criação de Tarefas**
   - Formulário wizard para criar tarefas detalhadas
   - Seleção de classe → subclasse → dimensões
   - Cálculo automático de tempo e materiais

2. **Execução em Tempo Real**
   - Cronômetro por etapa
   - Marcação de conclusão
   - Alertas de cooldown

3. **Relatórios e Análises**
   - Tempo real vs estimado
   - Produtividade por tipo de tarefa
   - Custos reais de equipamentos

4. **Templates Expandidos**
   - Mais classes pré-configuradas
   - Biblioteca de tarefas comuns
   - Personalização por empresa

5. **Integração com Cronograma**
   - Tarefas detalhadas no planejamento do dia
   - Redistribuição automática considerando todas as etapas
   - Previsão realista de conclusão

## 🎓 Conceitos Chave

**Classe → Subclasse → Etapas → Execução**

1. **Classe** = Tipo geral de trabalho (ex: "Limpeza")
2. **Subclasse** = Método específico (ex: "Com Lavajato")
3. **Etapas** = Passos detalhados (reunião, montagem, execução, limpeza...)
4. **Execução** = Registro real do que aconteceu

**Cada etapa considera:**
- ⏱️ Tempo (fixo, por m², por andar, etc.)
- 🔧 Equipamentos necessários
- 📦 Materiais consumidos
- ❄️ Restrições (cooldown, segurança)
- 📝 Notas e observações

**O sistema calcula automaticamente:**
- ✅ Tempo total realista
- ✅ Lista completa de materiais
- ✅ Equipamentos necessários por quantidade
- ✅ Custos de equipamentos
- ✅ Número de andares/módulos de andaime

## 🏆 Resultado Final

Um sistema que entende que **"lavar uma parede"** não são apenas 30 minutos, mas sim:
- Planejamento e segurança
- Preparação e acesso
- Execução com restrições
- Limpeza e organização
- Tempo real de trabalho

**~6.7 horas** para um trabalho que muitos sistemas simplificados marcariam como "30 minutos" ou "1 hora".
