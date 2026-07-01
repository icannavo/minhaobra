# 🏗️ Sistema de Tarefas Detalhadas - ERP Restauro

## 📋 Visão Geral

Este sistema foi projetado para gerenciar obras de restauração com **granularidade de minutos**, considerando **todas as etapas**, equipamentos, materiais, tempos de montagem, intervalos de máquinas e procedimentos de segurança.

## 🎯 Objetivo

Permitir o planejamento preciso de um dia de trabalho, onde você arrasta tarefas para cada hora do dia e o sistema calcula automaticamente:

- ⏱️ **Tempo total real** (incluindo montagem, preparação, execução, limpeza)
- 📦 **Equipamentos necessários**
- 🛠️ **Materiais consumidos**
- 🔄 **Intervalos de máquinas** (ex: lavajato trabalha 30min, descansa 10min)
- 👷 **Procedimentos de segurança**
- 📊 **Percentual de conclusão da obra** em tempo real

---

## 🏗️ Estrutura do Sistema

### 1. **Classes de Tarefas**
Templates gerais de tarefas. Ex: "Limpeza de Fachada"

**Campos:**
- Nome e código
- Categoria (Limpeza, Pintura, Revestimento, etc.)
- Produtividade base (m²/dia)
- Requer andaime?
- Requer reunião de segurança?
- Tempo padrão de reunião

### 2. **Subclasses**
Variações específicas de uma classe. Ex: "Limpeza com Lavajato"

**Campos:**
- Nome e código
- Multiplicador de produtividade (1.0 = igual classe, 0.8 = 20% mais lento)
- Descrição

### 3. **Etapas**
Breakdown detalhado de cada subclasse. Ex: "Montar Andaime", "Vestir EPIs", "Executar Limpeza"

**Campos:**
- Nome e ordem de execução
- Tipo de etapa (Segurança, Preparação, Execução, Limpeza, etc.)
- Tempo base em minutos
- Tipo de cálculo de tempo:
  - **FIXED**: Tempo fixo (ex: reunião sempre 15min)
  - **PER_M2**: Por área (ex: 3min por m²)
  - **PER_FLOOR**: Por andar de andaime (ex: 45min por andar)
  - **PER_EQUIPMENT**: Por quantidade de equipamento
  - **PERCENTAGE_EXECUTION**: Percentual do tempo de execução

**Restrições de Máquinas:**
- Requer cooldown? (máquina precisa esfriar)
- Tempo máximo contínuo (ex: 30min)
- Tempo de cooldown (ex: 10min)

### 4. **Equipamentos por Etapa**
Lista de equipamentos necessários para cada etapa
- Quantidade
- Obrigatório ou opcional
- Notas

### 5. **Materiais por Etapa**
Lista de materiais consumidos
- Quantidade e unidade (L, kg, m, unidade)
- Tipo de cálculo (fixo, por m², por andar)
- Obrigatório ou opcional

---

## 📝 Exemplo Completo: "Lavar Parede com Lavajato"

### 📐 Especificações
- **Parede**: 5m largura × 3m altura = 15m²
- **Andaime**: 3 andares (cada um com 2m de altura)
- **Equipe**: 2 funcionários

### 🔧 Etapas Detalhadas

| Ordem | Etapa | Tipo | Tempo | Cálculo |
|-------|-------|------|-------|---------|
| 1 | Reunião de Segurança | SAFETY_MEETING | 15 min | FIXED |
| 2 | Montagem do Andaime | SCAFFOLDING | 135 min | 3 andares × 45min |
| 3 | Furar e Instalar Buchas | EQUIPMENT_SETUP | 45 min | 3 andares × 15min |
| 4 | Vestir EPIs | EPIs | 10 min | FIXED |
| 5 | Trazer Equipamentos | EQUIPMENT_SETUP | 20 min | FIXED |
| 6 | Instalar Mangueiras/Extensões | EQUIPMENT_SETUP | 15 min | FIXED |
| 7 | **Limpeza com Lavajato** | EXECUTION | **45 min** | 15m² × 3min/m² |
| | ↳ Ciclo 1: Trabalho | | 30 min | |
| | ↳ Descanso máquina | | 10 min | |
| | ↳ Ciclo 2: Trabalho | | 15 min | |
| 8 | Limpar Fuligem do Chão | CLEANUP | 60 min | FIXED |
| 9 | Limpar Equipamentos | CLEANUP | 25 min | FIXED |
| 10 | Enrolar Fios/Mangueiras | EQUIPMENT_TEARDOWN | 15 min | FIXED |
| 11 | Desmontar Andaime | EQUIPMENT_TEARDOWN | 90 min | 3 andares × 30min |
| 12 | Guardar Equipamentos | EQUIPMENT_TEARDOWN | 20 min | FIXED |

### ⏱️ **TEMPO TOTAL: 8 horas e 10 minutos (490 minutos)**

### 📦 Equipamentos Necessários
- ✅ Lavajato Profissional (1 unidade)
- ✅ Andaime Metálico 2m (3 módulos)
- ✅ Compressor de Ar (1 unidade)
- ✅ Extensão Elétrica 50m (1 unidade)
- ✅ Mangueira Industrial 30m (1 unidade)

### 👷 EPIs Obrigatórios
- Luvas de Proteção
- Óculos de Proteção
- Roupa de Proteção Impermeável
- Colete de Linha de Vida
- Capacete de Segurança
- Botas de Segurança

### 💧 Materiais
- Detergente Industrial (opcional): 7.5L (0.5L por m²)

---

## 🚀 Como Usar

### 1. **Popular o Banco de Dados**

Execute o seed para criar dados de exemplo:

```bash
npm run db:seed
```

Isso criará:
- ✅ 6 equipamentos
- ✅ 1 classe de tarefa (Limpeza de Fachada)
- ✅ 1 subclasse (Limpeza com Lavajato)
- ✅ 12 etapas detalhadas
- ✅ Equipamentos e materiais associados
- ✅ 1 obra de exemplo
- ✅ 1 tarefa detalhada calculada

### 2. **Acessar o Sistema**

```bash
npm run dev
```

Navegue para:
- **Templates de Tarefas**: `/task-templates`
- **Criar Tarefa Detalhada**: `/create-detailed-task`
- **Daily Kanban**: `/daily-kanban`

### 3. **Criar uma Nova Tarefa Detalhada**

1. Acesse **"Criar Tarefa Detalhada"**
2. Selecione a **Obra**
3. Escolha a **Classe** e **Subclasse**
4. Informe as **Dimensões** (área, altura, largura, andares)
5. O sistema calcula automaticamente:
   - ⏱️ Tempo total estimado
   - 📦 Lista de equipamentos
   - 💧 Lista de materiais
   - 📋 Breakdown de todas as etapas

### 4. **Planejar o Dia no Kanban**

1. Acesse **"Daily Kanban"**
2. Selecione a **Obra** e a **Data**
3. **Arraste** as tarefas disponíveis para os **slots de hora**
4. O sistema mostra:
   - ⏰ Tempo total por hora
   - ⚠️ Alertas de sobrecarga (> 60min)
   - 📊 Resumo do dia
   - 📈 Progresso da obra

### 5. **Acompanhar Execução**

Durante a execução, você pode:
- ✅ Marcar etapas como concluídas
- 📝 Adicionar observações
- ⚠️ Registrar problemas
- 🔄 Recalcular cronograma automaticamente

---

## 📊 Cálculos Automáticos

### Tempo com Ciclos de Cooldown

Para etapas que **requerem cooldown** (ex: lavajato):

```javascript
// Exemplo: Limpar 15m² (3min/m² = 45min total)
// Máquina trabalha 30min, descansa 10min

Ciclo 1: 30min trabalho
Descanso: 10min
Ciclo 2: 15min trabalho (restantes)

Tempo Total = 30 + 10 + 15 = 55min
```

### Tempo de Montagem de Andaime

```javascript
// 5m de altura = 3 andares (cada um com 2m)
3 andares × 45min por andar = 135min de montagem
3 andares × 30min por andar = 90min de desmontagem
```

### Percentual de Conclusão da Obra

```javascript
% Conclusão = (Tarefas Concluídas / Total de Tarefas) × 100

// Atualizado em tempo real conforme tarefas são marcadas como concluídas
```

### Recálculo de Cronograma

Quando uma tarefa não é concluída ou leva mais tempo:
1. Sistema redistribui automaticamente para próximos dias
2. Recalcula data de conclusão da obra
3. Gera alertas de atraso

---

## 🎨 Interface do Usuário

### Daily Kanban

```
┌─────────────────────────────────────────────────────────────┐
│  TAREFAS DISPONÍVEIS    │    07:00    08:00    09:00  ...   │
│                         │                                     │
│  🔲 Limpeza Parede 1    │  [────────────────]               │
│     ⏱️ 490min           │  Limpeza Parede 1                 │
│     📦 5 equipamentos   │  07:00 - 15:10                    │
│                         │                                     │
│  🔲 Pintura Parede 2    │  [──────]                         │
│     ⏱️ 360min           │                                     │
│                         │                                     │
└─────────────────────────────────────────────────────────────┘
```

### Detalhamento de Tarefa

```
╔═══════════════════════════════════════════════════════════╗
║  Limpeza Parede Externa Leste - Lavajato                 ║
║  📐 15m² (5m × 3m) • 3 andares • 2 funcionários          ║
╠═══════════════════════════════════════════════════════════╣
║  ⏱️ TEMPO ESTIMADO: 8h 10min (490 minutos)              ║
╠═══════════════════════════════════════════════════════════╣
║  📋 ETAPAS:                                               ║
║  ✅ 1. Reunião Segurança (15min)                         ║
║  ⬜ 2. Montar Andaime (135min)                           ║
║  ⬜ 3. Furar/Instalar Buchas (45min)                     ║
║  ⬜ 4. Vestir EPIs (10min)                               ║
║  ⬜ 5. Trazer Equipamentos (20min)                       ║
║  ⬜ 6. Instalar Mangueiras (15min)                       ║
║  ⬜ 7. Limpeza Lavajato (45min + 10min cooldown)        ║
║  ⬜ 8. Limpar Fuligem (60min)                            ║
║  ⬜ 9. Limpar Equipamentos (25min)                       ║
║  ⬜ 10. Enrolar Fios (15min)                             ║
║  ⬜ 11. Desmontar Andaime (90min)                        ║
║  ⬜ 12. Guardar Equipamentos (20min)                     ║
╠═══════════════════════════════════════════════════════════╣
║  📦 EQUIPAMENTOS:                                         ║
║  • Lavajato Profissional (1x)                            ║
║  • Andaime Metálico (3x)                                 ║
║  • Compressor de Ar (1x)                                 ║
║  • Extensão Elétrica 50m (1x)                            ║
║  • Mangueira Industrial 30m (1x)                         ║
╠═══════════════════════════════════════════════════════════╣
║  👷 EPIs: 6 itens obrigatórios                           ║
║  💧 MATERIAIS: Detergente Industrial (7.5L)              ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🔄 Fluxo de Trabalho Completo

### Fase 1: Configuração (uma vez)
1. Criar **Classes de Tarefas**
2. Criar **Subclasses** para cada classe
3. Definir **Etapas** detalhadas
4. Associar **Equipamentos** e **Materiais**

### Fase 2: Planejamento de Obra
1. Criar **Obra** nova
2. Criar **Tarefas Detalhadas** baseadas em templates
3. Sistema calcula automaticamente tempos

### Fase 3: Planejamento Diário (Kanban Developer)
1. Abrir **Daily Kanban**
2. Selecionar obra e data
3. **Arrastar** tarefas para os horários do dia
4. Sistema alerta sobre sobrecargas
5. Visualizar resumo do dia

### Fase 4: Execução
1. Equipe segue o planejamento
2. Marcar etapas como concluídas
3. Registrar tempo real vs estimado
4. Adicionar observações e problemas

### Fase 5: Atualização Automática
1. Sistema recalcula **% de conclusão da obra**
2. Ajusta **cronograma** automaticamente
3. Gera **alertas** de atrasos
4. Redistribui tarefas não concluídas

---

## 🎯 Benefícios

✅ **Planejamento Realístico**: Considera TODOS os tempos (montagem, limpeza, intervalos)  
✅ **Zero Surpresas**: Equipamentos e materiais são listados automaticamente  
✅ **Segurança**: Procedimentos de segurança são parte do processo  
✅ **Visibilidade Total**: Você sabe exatamente quanto tempo leva cada tarefa  
✅ **Cronograma Dinâmico**: Ajusta automaticamente quando algo muda  
✅ **Histórico**: Aprende com execuções passadas para melhorar estimativas  

---

## 📚 Próximos Passos

1. ✅ Executar `npm run db:seed`
2. ✅ Explorar os templates em `/task-templates`
3. ✅ Criar sua primeira tarefa detalhada
4. ✅ Planejar um dia no Kanban
5. ⬜ Criar suas próprias classes e subclasses
6. ⬜ Adicionar mais obras
7. ⬜ Acompanhar evolução real vs planejado

---

## 🤝 Suporte

Este sistema foi projetado especificamente para obras de restauração, considerando a complexidade real do dia a dia de trabalho.

Cada tarefa, por mais simples que pareça, envolve múltiplas etapas. Este sistema garante que nada seja esquecido.

**Bom trabalho! 🏗️**
