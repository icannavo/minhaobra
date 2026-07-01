# 📋 Plano de Implementação - ERP de Gestão de Obras

## 🎯 Objetivos do Sistema

Sistema completo de gestão de obras de restauração com foco em:
- **Produtividade**: Acompanhamento diário do que foi feito e o que falta fazer
- **Planejamento Dinâmico**: Cronograma que se ajusta automaticamente
- **Relatórios Diários**: Funcionários marcam tarefas concluídas/pendentes
- **Reagendamento Automático**: Tarefas não concluídas migram para o próximo dia
- **Gestão de Equipe**: Trabalhadores com especialidades e alocação por tarefa
- **Controle de Equipamentos**: Equipamentos alocados por dia/tarefa
- **Sistema Kanban**: Arrastar tarefas para horários específicos
- **Cálculo de Progresso**: Percentual de conclusão em tempo real

---

## ✅ Já Implementado (Backend Completo)

### 1. **Banco de Dados (Schema)**
Todas as tabelas necessárias já estão criadas:

#### 📦 Tabelas Principais:
- **works** - Obras/Projetos
- **teamMembers** - Funcionários (nome, especialidade, produtividade)
- **taskTeamAllocations** - Alocação de equipe por tarefa
- **equipments** - Catálogo de equipamentos
- **materials** - Catálogo de materiais

#### 📅 Sistema de Tarefas:
- **taskClasses** - Templates de tarefas (ex: "Limpeza de Fachada")
- **taskSubclasses** - Variações (ex: "Limpeza com Lavajato")
- **taskSteps** - Etapas detalhadas (ex: "Montagem de Andaime", "Reunião de Segurança")
- **stepEquipments** - Equipamentos necessários por etapa
- **stepMaterials** - Materiais necessários por etapa
- **detailedTasks** - Tarefas criadas a partir de templates
- **stepExecutions** - Registro de execução de cada etapa

#### 📊 Sistema de Cronograma:
- **dailySchedules** - Cronogramas diários agregados
- **scheduledTasks** - Tarefas agendadas para horários específicos (Kanban)
- **dailyGoals** - Metas editáveis por dia

#### 📈 Análise e Histórico:
- **productivityHistory** - Histórico de produtividade
- **materialConsumptions** - Consumo real de materiais
- **alerts** - Notificações e alertas
- **changeLogs** - Auditoria de mudanças

### 2. **Endpoints (tRPC)**
Todos os endpoints necessários estão implementados:

#### Works (Obras):
- `works.getAll()` - Listar todas
- `works.getById()` - Detalhes de uma obra
- `works.create()` - Criar nova
- `works.update()` - Atualizar
- `works.delete()` - Deletar

#### Team Members (Funcionários):
- `teamMembers.getAll()` - Listar todos
- `teamMembers.getById()` - Detalhes
- `teamMembers.create()` - Adicionar funcionário
- `teamMembers.update()` - Editar (nome, especialidade, etc)
- `teamMembers.delete()` - Remover

#### Task Team Allocations (Alocação):
- `taskTeamAllocations.getByTask()` - Quem está alocado em uma tarefa
- `taskTeamAllocations.allocate()` - Alocar funcionário
- `taskTeamAllocations.update()` - Atualizar horas trabalhadas
- `taskTeamAllocations.remove()` - Remover alocação

#### Detailed Tasks (Tarefas Detalhadas):
- `detailedTasks.getByWork()` - Tarefas de uma obra (filtro por data opcional)
- `detailedTasks.getById()` - Detalhes completos
- `detailedTasks.create()` - Criar nova tarefa
- `detailedTasks.update()` - Atualizar status, notas, etc
- `detailedTasks.delete()` - Deletar
- `detailedTasks.calculateRequirements()` - Calcular equipamentos/materiais necessários

#### Daily Schedules (Cronogramas Diários):
- `dailySchedules.getByWork()` - Todos os dias de uma obra
- `dailySchedules.getByDate()` - Cronograma de um dia específico
- `dailySchedules.create()` - Criar cronograma manual
- `dailySchedules.update()` - Atualizar (clima, metas, notas)
- `dailySchedules.generate()` - **Gerar cronograma automaticamente**

#### Scheduled Tasks (Kanban):
- `scheduledTasks.getByDay()` - Tarefas agendadas de um dia
- `scheduledTasks.create()` - Agendar tarefa para horário
- `scheduledTasks.update()` - Mudar horário/status
- `scheduledTasks.delete()` - Remover agendamento

#### Daily Goals (Metas Diárias):
- `dailyGoals.getBySchedule()` - Metas de um dia
- `dailyGoals.create()` - Criar meta
- `dailyGoals.update()` - Atualizar progresso
- `dailyGoals.delete()` - Remover meta

#### Reports (Relatórios e Análises):
- `reports.workProgress()` - **Progresso da obra (% concluído)**
- `reports.dailyReport()` - **Relatório completo do dia**
- `reports.estimateCompletion()` - **Previsão de término**
- `reports.rescheduleIncomplete()` - **Reagendar tarefas não concluídas**

#### Equipments & Materials:
- `equipments.*` - CRUD completo
- `materials.*` - CRUD completo
- `materialConsumptions.*` - Registro de consumo

---

## 🔧 Próximas Etapas - Frontend

### **PRIORIDADE 1: Detalhes da Obra**
Criar página `ProjectDetails.tsx` melhorada com:

#### Seção 1: Cabeçalho com Informações Gerais
```tsx
- Nome da Obra
- Status (Planejamento, Em Andamento, Concluído, Pausada)
- Progresso: Barra visual + percentual
- Área Total vs Área Concluída
- Data de início e previsão de término
- Botões: Editar Obra, Configurações
```

#### Seção 2: Equipe da Obra
```tsx
- Lista de funcionários alocados
- Nome, Especialidade, Produtividade média
- Botão: + Adicionar Funcionário
- Botão: Editar/Remover da equipe
```

#### Seção 3: Equipamentos em Uso
```tsx
- Lista de equipamentos utilizados
- Nome, Categoria, Quantidade disponível
- Calendário de uso (quais dias estão reservados)
- Botão: Alocar Equipamento para Dia Específico
```

### **PRIORIDADE 2: Calendário de Tarefas**
Criar página `WorkCalendar.tsx`:

#### Visualização Mensal
```tsx
- Calendário com todos os dias do mês
- Cada dia mostra:
  * Número de tarefas planejadas
  * Status visual (Verde=completo, Amarelo=parcial, Vermelho=atrasado)
  * Ícones de equipamentos alocados
- Clicar em um dia abre o "Dia Detalhado"
```

#### Dia Detalhado (Modal ou Página)
```tsx
- Data
- Resumo: X tarefas planejadas, Y concluídas, Z pendentes
- Lista de tarefas do dia com:
  * Nome da tarefa
  * Área alvo vs realizada
  * Equipe alocada (nomes e especialidades)
  * Equipamentos necessários
  * Status: Planejado/Em Execução/Concluído/Adiado
  * Horário estimado
- Botão: + Criar Nova Tarefa
- Botão: Gerar Relatório do Dia
```

### **PRIORIDADE 3: Criação de Tarefas**
Melhorar `CreateDetailedTask.tsx`:

#### Wizard de Criação:
```tsx
Passo 1: Informações Básicas
- Nome da tarefa
- Descrição
- Data
- Classe de tarefa (dropdown)
- Subclasse (dropdown dependente)

Passo 2: Dimensões e Recursos
- Área (m²)
- Altura, Largura (opcional)
- Número de andares (se aplicável)
- Clima esperado
- Temperatura

Passo 3: Equipe
- Número de funcionários
- Selecionar funcionários específicos (multi-select)
- Alocar horas por funcionário

Passo 4: Resumo e Cálculos Automáticos
- Tempo estimado (calculado automaticamente)
- Equipamentos necessários (lista automática)
- Materiais necessários (lista automática)
- Custo estimado
- Botão: Criar Tarefa
```

### **PRIORIDADE 4: Kanban Diário**
Criar página `DailyKanban.tsx`:

#### Layout Kanban:
```tsx
Colunas:
1. Não Agendado (Backlog do Dia)
2. 08:00-10:00
3. 10:00-12:00
4. 12:00-14:00
5. 14:00-16:00
6. 16:00-18:00
7. Concluído

Funcionalidades:
- Arrastar tarefas entre colunas
- Cada card mostra:
  * Nome da tarefa
  * Tempo estimado
  * Equipe alocada
  * Equipamentos
  * Status
- Botão: Salvar Planejamento
```

### **PRIORIDADE 5: Relatório Diário do Trabalhador**
Criar página `DailyWorkerReport.tsx`:

#### Interface do Funcionário:
```tsx
Cabeçalho:
- "O que você tem para fazer hoje?"
- Data
- Nome do funcionário

Lista de Tarefas:
Para cada tarefa:
- Nome e descrição
- Área alvo
- Equipamentos que deve usar
- Materiais disponíveis
- Etapas da tarefa (checklist)
- Checkbox: "Concluído?"
- Se não concluído:
  * Área realizada (input)
  * Motivo do não cumprimento (textarea)
  * Problemas enfrentados (textarea)

Botão Final:
- "Enviar Relatório do Dia"
- Ao enviar:
  * Marca tarefas como concluídas
  * Registra área realizada
  * Reagenda tarefas não concluídas automaticamente
  * Atualiza cronograma do dia seguinte
  * Cria alertas se houver grandes desvios
```

### **PRIORIDADE 6: Dashboard de Progresso**
Melhorar `DailyDashboard.tsx`:

#### Widgets:
```tsx
1. Card de Progresso Geral
   - Percentual da obra
   - Barra de progresso visual
   - Área concluída / Área total
   - Previsão de término

2. Card de Tarefas Hoje
   - X tarefas para hoje
   - Y concluídas
   - Z em andamento

3. Card de Desvios
   - Tarefas atrasadas
   - Diferença entre planejado e realizado
   - Alertas críticos

4. Gráfico de Produtividade
   - Linha do tempo (últimos 7-14 dias)
   - Área planejada vs realizada por dia
   - Tendência de produtividade

5. Card de Equipe
   - Funcionários ativos hoje
   - Alocação por tarefa

6. Card de Equipamentos
   - Equipamentos em uso hoje
   - Disponibilidade

7. Próximas Tarefas (Semana)
   - Lista de tarefas dos próximos dias
   - Status e prioridades
```

---

## 🚀 Funcionalidades Especiais Já Implementadas

### 1. **Cálculo Automático de Requisitos**
Ao criar uma tarefa detalhada, o sistema calcula automaticamente:
- ✅ Tempo total estimado baseado nas etapas
- ✅ Equipamentos necessários (lista completa)
- ✅ Materiais necessários com quantidades calculadas por m²
- ✅ Custos estimados

### 2. **Reagendamento Inteligente**
Endpoint `reports.rescheduleIncomplete()`:
- ✅ Busca tarefas não concluídas de um dia
- ✅ Move automaticamente para o próximo dia
- ✅ Atualiza status para "Adiado"
- ✅ Cria alertas automáticos

### 3. **Geração de Cronograma Diário**
Endpoint `dailySchedules.generate()`:
- ✅ Agrega todas as tarefas do dia
- ✅ Calcula totais (tempo, área, recursos)
- ✅ Atualiza status do dia automaticamente

### 4. **Cálculo de Progresso da Obra**
Endpoint `reports.workProgress()`:
- ✅ Percentual de conclusão baseado em área
- ✅ Total de tarefas vs concluídas
- ✅ Área total vs área concluída

### 5. **Previsão de Término**
Endpoint `reports.estimateCompletion()`:
- ✅ Analisa produtividade dos últimos 7 dias
- ✅ Calcula média de m²/dia/funcionário
- ✅ Estima dias necessários para conclusão
- ✅ Calcula data prevista de término

### 6. **Relatório Diário Completo**
Endpoint `reports.dailyReport()`:
- ✅ Resumo de tarefas (total, concluídas, pendentes)
- ✅ Estatísticas de área (alvo, realizada, taxa de conclusão)
- ✅ Análise de tempo (estimado vs real, variação)
- ✅ Metas do dia e progresso
- ✅ Lista completa de tarefas com detalhes

---

## 📊 Funcionalidades Adicionais Sugeridas (Baseadas em Pesquisas)

### **Implementadas no Backend:**
1. ✅ **DDS (Diálogo Diário de Segurança)** - Etapa de reunião de segurança nas tarefas
2. ✅ **Registro de Clima** - Campo `weather` e `temperature` nos cronogramas
3. ✅ **Alertas Automáticos** - Sistema de notificações por tipo
4. ✅ **Histórico de Produtividade** - Tabela dedicada com análises
5. ✅ **Consumo de Materiais** - Rastreamento de uso vs planejado
6. ✅ **Custos por Tarefa** - Equipamentos e materiais com custos
7. ✅ **Auditoria (Change Logs)** - Registro de todas as mudanças

### **Ainda Não Implementadas (Frontend/UX):**
1. ⏳ **Fotos e Documentação** - Upload de fotos do progresso diário
2. ⏳ **Assinaturas Digitais** - Funcionário assina relatório do dia
3. ⏳ **Notificações Push** - Alertas em tempo real
4. ⏳ **Modo Offline** - Funcionário preenche relatório mesmo sem internet
5. ⏳ **Gráficos de Gantt** - Visualização de cronograma estilo Gantt
6. ⏳ **Comparação de Versões** - Ver mudanças no cronograma ao longo do tempo
7. ⏳ **Exportação de Relatórios** - PDF, Excel
8. ⏳ **Dashboard de Custos** - Controle financeiro da obra

---

## 🎨 Componentes UI Necessários

Para implementar todas as páginas, você precisará criar/usar:

### **Componentes Básicos (já existem):**
- ✅ Button, Input, Select, Textarea
- ✅ Dialog, Card, Badge, Avatar
- ✅ Calendar, DatePicker
- ✅ Progress Bar, Chart

### **Componentes Customizados a Criar:**
1. **TaskCard** - Card de tarefa com todas as informações
2. **TeamMemberSelector** - Multi-select com busca de funcionários
3. **EquipmentAllocator** - Componente para alocar equipamentos por dia
4. **KanbanBoard** - Sistema drag-and-drop de tarefas
5. **ProgressRing** - Anel de progresso circular
6. **DailyTimeline** - Timeline de tarefas do dia
7. **ProductivityChart** - Gráfico de linha de produtividade
8. **WorkProgressWidget** - Widget de resumo de progresso
9. **StepChecklist** - Checklist interativo de etapas
10. **DailyReportForm** - Formulário estruturado de relatório

---

## 🔐 Segurança e Permissões

### **Níveis de Acesso:**
1. **Administrador** - Acesso total, edição de obras, equipe, equipamentos
2. **Encarregado** - Criar tarefas, alocar equipe, aprovar relatórios
3. **Funcionário** - Ver suas tarefas, preencher relatório diário

### **A Implementar:**
- Middleware de autorização por rota
- Campos de assinatura digital
- Histórico de quem fez cada mudança

---

## 📱 Responsividade

Todas as páginas devem funcionar bem em:
- **Desktop** - Interface completa com drag-and-drop
- **Tablet** - Layout adaptado, funcionalidade total
- **Mobile** - Foco no relatório diário do funcionário (modo simplificado)

---

## 🧪 Testes e Validação

### **Fluxos Críticos a Testar:**
1. Criar obra → Alocar equipe → Criar tarefas → Gerar cronograma
2. Funcionário acessa → Vê tarefas do dia → Preenche relatório → Sistema reagenda
3. Administrador vê dashboard → Analisa desvios → Ajusta cronograma
4. Calcular progresso → Comparar com meta → Ajustar previsão de término

---

## 📦 Dados Seed (Para Testes)

Criar arquivo `seed.ts` com:
- 2-3 obras de exemplo
- 5-10 funcionários com especialidades variadas
- 10-15 equipamentos comuns
- 5-10 classes de tarefas pré-configuradas
- 20-30 subclasses com etapas detalhadas
- Tarefas de exemplo para os próximos 7 dias
- Histórico de produtividade dos últimos 7 dias

---

## 🎯 Resumo das Páginas a Criar/Melhorar

### **Páginas Novas:**
1. ✅ `ProjectsList.tsx` (já existe) - Lista de obras
2. 🔧 `ProjectDetails.tsx` (melhorar) - Detalhes completos da obra
3. 🆕 `WorkCalendar.tsx` - Calendário mensal de tarefas
4. 🆕 `DayDetails.tsx` - Detalhes de um dia específico
5. 🔧 `CreateDetailedTask.tsx` (melhorar) - Wizard de criação
6. 🆕 `DailyKanban.tsx` - Kanban de horários do dia
7. 🆕 `DailyWorkerReport.tsx` - Relatório do funcionário
8. 🔧 `DailyDashboard.tsx` (melhorar) - Dashboard de progresso
9. 🆕 `TeamManager.tsx` - Gestão de funcionários
10. 🆕 `WorkProgress.tsx` - Visualização de progresso detalhada

---

## 🚦 Ordem de Implementação Recomendada

1. **Semana 1**: ProjectDetails + TeamManager (Gestão de Equipe)
2. **Semana 2**: CreateDetailedTask (Wizard completo)
3. **Semana 3**: WorkCalendar + DayDetails (Visualização)
4. **Semana 4**: DailyKanban (Sistema drag-and-drop)
5. **Semana 5**: DailyWorkerReport (Interface do funcionário)
6. **Semana 6**: DailyDashboard + WorkProgress (Analytics)
7. **Semana 7**: Testes, ajustes, polish

---

## 📚 Recursos e Bibliotecas Recomendadas

### **Para Drag-and-Drop (Kanban):**
- `@dnd-kit/core` - Moderna, performática, acessível
- `react-beautiful-dnd` - Alternativa mais simples

### **Para Calendário:**
- `react-big-calendar` - Calendário completo
- `date-fns` - Manipulação de datas

### **Para Gráficos:**
- `recharts` (já em uso) - Gráficos responsivos
- `@tremor/react` - Dashboards prontos

### **Para Formulários:**
- `react-hook-form` + `zod` - Validação poderosa

### **Para Upload de Fotos:**
- `react-dropzone` - Drag-and-drop de arquivos

---

## 💡 Dicas de UX

1. **Cores por Status:**
   - Verde: Concluído
   - Azul: Em Execução
   - Amarelo: Planejado
   - Laranja: Atrasado
   - Vermelho: Crítico

2. **Feedback Visual:**
   - Loading skeletons
   - Toast de sucesso/erro
   - Animações suaves de transição

3. **Otimistic Updates:**
   - UI responde antes do servidor
   - Reverte se houver erro

4. **Atalhos de Teclado:**
   - Ctrl+N: Nova tarefa
   - Ctrl+S: Salvar
   - Esc: Fechar modal

5. **Tutoriais:**
   - Primeiro acesso mostra tour guiado
   - Tooltips em funcionalidades complexas

---

## ✅ Checklist de Conclusão

### Backend:
- [x] Schema do banco completo
- [x] Endpoints CRUD de todas as entidades
- [x] Funções de cálculo (progresso, previsão)
- [x] Sistema de reagendamento
- [x] Relatórios automatizados
- [x] Alertas e notificações

### Frontend (A Fazer):
- [ ] Detalhes da obra com equipe e equipamentos
- [ ] Calendário de tarefas
- [ ] Criação de tarefas (wizard completo)
- [ ] Kanban diário com drag-and-drop
- [ ] Relatório diário do funcionário
- [ ] Dashboard de progresso melhorado
- [ ] Gestão de funcionários
- [ ] Gestão de materiais
- [ ] Sistema de alertas (UI)
- [ ] Exportação de relatórios

### Extras:
- [ ] Upload de fotos
- [ ] Assinaturas digitais
- [ ] Notificações push
- [ ] Modo offline
- [ ] Gráfico de Gantt
- [ ] Controle financeiro

---

## 🎉 Resultado Final Esperado

Um sistema completo onde:

1. **Administrador:**
   - Cria obras e aloca equipe
   - Define tarefas baseadas em templates
   - Visualiza progresso em tempo real
   - Recebe alertas de atrasos
   - Analisa produtividade histórica
   - Ajusta cronograma dinamicamente

2. **Encarregado:**
   - Planeja tarefas diárias
   - Aloca equipe e equipamentos
   - Ajusta o Kanban do dia
   - Aprova relatórios dos funcionários

3. **Funcionário:**
   - Acessa pelo celular
   - Vê suas tarefas do dia
   - Marca o que foi concluído
   - Informa problemas e desvios
   - Sistema reagenda automaticamente o que não foi feito

4. **Sistema:**
   - Calcula progresso automaticamente
   - Reagenda tarefas não concluídas
   - Ajusta previsão de término
   - Gera relatórios diários
   - Cria alertas inteligentes
   - Histórico completo de mudanças

---

**Documentação criada em:** 29/06/2026
**Versão:** 1.0
**Status:** Backend completo, Frontend em desenvolvimento
