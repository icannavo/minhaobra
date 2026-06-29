# ERP Ultra Master - TODO

## Fase 1: Arquitetura e Banco de Dados
- [x] Planejar schema Drizzle com todas as tabelas
- [x] Definir relações entre tabelas
- [x] Implementar schema Drizzle completo
- [x] Gerar e aplicar migrations SQL

## Fase 2: Backend - Procedimentos tRPC
- [x] Criar routers para Restauro Técnico (CRUD + queries)
- [x] Criar routers para Pintura (CRUD + cálculos)
- [x] Criar routers para Tarefas Diárias (CRUD + alertas)
- [x] Criar routers para Cronograma (CRUD + Gantt)
- [x] Criar routers para Financeiro (CRUD + BDI)
- [x] Criar routers para Estoque (CRUD + alertas)
- [x] Criar routers para Dashboard (KPIs e agregações)
- [x] Criar routers para Notificações (alertas)

## Fase 3: Lógica de Cálculos
- [x] Implementar cálculo automático de desvio (Realizado - Meta)
- [x] Implementar cálculo de litros consumidos (Área / Rendimento * Demãos)
- [x] Implementar cálculo de custo total de material
- [x] Implementar cálculo de duração de atividades
- [x] Implementar cálculo de lucro líquido (BDI + Impostos + Lucro)
- [x] Implementar lógica de status de estoque (OK, Crítico, Abaixo do mínimo)

## Fase 4: Frontend - Layout e Navegação
- [x] Configurar tema escuro profissional
- [x] Criar sidebar com navegação
- [x] Criar layout principal com ERPLayout
- [x] Implementar tipografia e espaçamento

## Fase 5: Dashboard Master
- [x] Criar componente KPI para indicadores
- [x] Implementar gráfico de trincas tratadas
- [x] Implementar gráfico de consumo de tinta
- [x] Implementar gráfico de progresso global
- [x] Implementar gráfico de lucro líquido
- [x] Criar alertas visuais para desvios

## Fase 6: Módulo Restauro Técnico
- [x] Criar página de listagem de patologias
- [x] Criar formulário de cadastro de patologias
- [ ] Implementar edição de patologias
- [ ] Implementar exclusão de patologias
- [x] Criar tabela com patologias cadastradas
- [x] Implementar filtros por status

## Fase 7: Módulo Pintura
- [ ] Criar página de listagem de obras
- [ ] Criar formulário de cadastro de obras
- [ ] Implementar cálculos automáticos de litros
- [ ] Implementar cálculos automáticos de custo
- [ ] Criar tabela com obras cadastradas
- [ ] Implementar edição e exclusão

## Fase 8: Módulo Tarefas Diárias
- [ ] Criar página de tarefas diárias
- [ ] Criar formulário de registro de tarefa
- [ ] Implementar checkbox de conclusão
- [ ] Implementar cálculo automático de desvio
- [ ] Criar alertas visuais para desvio negativo
- [ ] Implementar filtros por data e obra

## Fase 9: Módulo Cronograma
- [ ] Criar página de cronograma
- [ ] Criar formulário de atividades
- [ ] Implementar visualização Gantt simplificada
- [ ] Implementar cálculo de duração
- [ ] Implementar predecessoras e dependências
- [ ] Criar barra de progresso visual

## Fase 10: Módulo Financeiro
- [ ] Criar página de precificação
- [ ] Criar formulário com campos BDI, Impostos, Lucro
- [ ] Implementar cálculos automáticos de preço e lucro
- [ ] Criar tabela de itens financeiros
- [ ] Implementar alertas para itens sem identificação
- [ ] Criar resumo de lucro total

## Fase 11: Módulo Estoque
- [ ] Criar página de estoque
- [ ] Criar formulário de cadastro de materiais
- [ ] Implementar lógica de status (OK, Crítico, Abaixo do mínimo)
- [ ] Criar alertas visuais para estoque crítico
- [ ] Implementar edição de saldo
- [ ] Criar relatório de estoque

## Fase 12: Sistema de Alertas e Notificações
- [ ] Criar painel de notificações
- [ ] Implementar alerta de estoque crítico
- [ ] Implementar alerta de tarefas com desvio negativo
- [ ] Implementar alerta de atividades atrasadas
- [ ] Implementar alerta de itens financeiros sem identificação
- [ ] Criar badge de notificações no sidebar

## Fase 13: Testes e Validações
- [ ] Escrever testes para cálculos automáticos
- [ ] Escrever testes para CRUD de cada módulo
- [ ] Testar validações de formulários
- [ ] Testar alertas e notificações
- [ ] Testar persistência em SQLite

## Fase 14: Entrega
- [ ] Revisar visual e UX
- [ ] Criar checkpoint final
- [ ] Documentar uso do sistema
- [ ] Entregar projeto funcional


## Fase 15: Dashboard Diário (NOVO FOCO)
- [x] Criar página de tarefas do dia
- [x] Implementar visualização de metas vs realizado
- [x] Implementar cálculo de desvios em tempo real
- [x] Criar dialog para marcar conclusão de tarefas
- [x] Mostrar equipamentos necessários por tarefa
- [x] Mostrar número de funcionários e produtividade

## Fase 16: Planejamento do Próximo Dia
- [x] Criar página de planejamento
- [x] Implementar cálculo de produtividade média
- [x] Estimar duração baseado em produtividade
- [x] Permitir criação de novas tarefas
- [x] Mostrar cronograma dinâmico

## Fase 17: Catálogo de Recursos
- [x] Criar página de EPIs (Equipamentos de Proteção Individual)
- [x] Criar seção de Ferramentas (pincéis, rolos, espátulas, lixadeiras)
- [x] Criar seção de Materiais (tintas, primers, massas, selantes, argamassas)
- [x] Criar seção de Equipamentos (andaimes com tempos de montagem/desmontagem)
- [x] Implementar tabs para navegação entre categorias

## Fase 18: Tarefas Especializadas
- [x] Criar página de tarefas com tempos padrão
- [x] Implementar seção de Montagem (andaimes, lava-jato, compressor)
- [x] Implementar seção de Limpeza (lava-jato, manual, final do dia)
- [x] Implementar seção de Preparação (lixamento, remoção de mofo, massa)
- [x] Implementar seção de Pintura (primer, 1ª demão, 2ª demão)
- [x] Implementar seção de Desmontagem
- [x] Mostrar EPIs necessários e equipamentos por tarefa

## Fase 19: Navegação e Interface
- [x] Criar componente Navigation com links para todas as páginas
- [x] Implementar rotas para: Dashboard, Próximo Dia, Catálogo, Tarefas
- [x] Adicionar ícones e visual profissional
- [x] Corrigir CSS e tema escuro

## Recursos Implementados

### EPIs (Equipamentos de Proteção Individual)
- Capacete de Segurança
- Óculos de Proteção
- Luva de Nitrila
- Luva de Couro
- Máscara Respiratória N95
- Máscara Respiratória PFF2
- Colete de Segurança
- Avental de Proteção
- Bota de Segurança
- Protetor Auricular

### Ferramentas
- Lava-Jato (30 min de setup)
- Pincéis (Pequeno, Médio, Grande)
- Rolos de Pintura (10cm, 20cm)
- Espátulas (Pequena, Grande)
- Lixadeira Orbital (15 min de setup)
- Escadas Alumínio (3m, 5m)

### Materiais de Construção
- Tintas: Acrílica Fosca, Acrílica Brilho, Epóxi, Poliuretano
- Primers: Acrílico, Epóxi
- Massas: Acrílica, Epóxi
- Selantes: Poliuretano
- Argamassas: Cal
- Resinas: Injeção

### Equipamentos Grandes
- Andaime Metálico 5m (120 min montagem, 90 min desmontagem)
- Andaime Metálico 10m (180 min montagem, 120 min desmontagem)
- Andaime Suspenso (240 min montagem, 180 min desmontagem)
- Compressor de Ar (15 min montagem)
- Gerador Elétrico (20 min montagem)
- Bomba de Água (30 min montagem)

### Tarefas Especializadas com Tempos Padrão
**Montagem:**
- Montagem de Andaime 5m: 120 min, 2 pessoas
- Montagem de Andaime 10m: 180 min, 3 pessoas
- Preparação de Lava-Jato: 30 min, 1 pessoa
- Montagem de Compressor: 15 min, 1 pessoa

**Limpeza:**
- Limpeza com Lava-Jato: 480 min, até 100 m²
- Limpeza Manual com Escova: 480 min, até 50 m²
- Limpeza Final do Dia: 60 min, 2 pessoas

**Preparação:**
- Remoção de Tinta Antiga: 480 min, até 80 m²
- Remoção de Mofo e Algas: 240 min, até 100 m²
- Aplicação de Massa Reparadora: 480 min, até 60 m²
- Lixamento de Massa: 240 min, até 80 m²

**Pintura:**
- Aplicação de Primer: 480 min, até 100 m²
- Aplicação de Tinta (1ª Demão): 480 min, até 120 m²
- Aplicação de Tinta (2ª Demão): 480 min, até 120 m²

**Desmontagem:**
- Desmontagem de Andaime 5m: 90 min, 2 pessoas
- Desmontagem de Andaime 10m: 120 min, 3 pessoas
- Limpeza e Guarda de Equipamentos: 45 min, 2 pessoas
