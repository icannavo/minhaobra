# 🏗️ ERP Restauro - Sistema de Gerenciamento de Tarefas Detalhadas

## 🎯 Visão Geral

Sistema completo de gerenciamento de obras de restauração que calcula **tempo real de trabalho**, considerando **TODAS as etapas** desde preparação até finalização, incluindo equipamentos, materiais e segurança.

## 💡 O Problema Que Resolvemos

### ❌ Sistemas Tradicionais:
```
Tarefa: "Lavar parede"
Tempo: 30 minutos
```

**Resultado:** Cronograma irreal, custos subestimados, obras atrasadas.

### ✅ Nosso Sistema:
```
Tarefa: "Limpeza Parede Externa 5m×3m com Lavajato"

BREAKDOWN COMPLETO:
├─ 15min  → Reunião de Segurança
├─ 90min  → Montagem de Andaime (3 andares)
├─ 10min  → Vestir EPIs
├─ 20min  → Preparar Equipamentos
├─ 30min  → Limpeza (execução)
├─ 60min  → Almoço
├─ 60min  → Limpeza da Fuligem
├─ 25min  → Limpar Equipamentos
├─ 60min  → Desmontagem
└─ 30min  → Inspeção Final

TOTAL: 400 minutos (6.7 horas) ✅
```

**Resultado:** Cronograma realista, custos precisos, obras no prazo.

## 🚀 Funcionalidades Principais

### 1. 📋 Templates de Tarefas
- **Classes** (categorias amplas): "Limpeza de Fachada", "Pintura Externa"
- **Subclasses** (métodos específicos): "Com Lavajato", "Manual", "Com Produto Químico"
- **Etapas** (breakdown detalhado): 10 tipos de etapas configuráveis

### 2. ⏱️ Cálculo Inteligente de Tempo
Considera múltiplos fatores:
- **Fixo**: Reunião (15 min), Almoço (60 min)
- **Por m²**: Limpeza (2 min/m²), Pintura (3 min/m²)
- **Por Andar**: Andaime (30 min/andar para montar)
- **Cooldown**: Lavajato (30 min trabalho + 10 min descanso)

### 3. 📦 Gestão Automática de Recursos

#### Equipamentos:
```
Para parede 5m×3m, 3 andares:
├─ 3× Andaime 2m        → R$ 240,00
├─ 1× Lavajato          → R$   7,50
├─ 1× Mangueira 15m     → R$   8,00
└─ 1× Extensão 20m      → R$   5,00
   TOTAL EQUIPAMENTOS   → R$ 260,50
```

#### Materiais:
```
├─ 12× Buxas de Aço (4 por andar × 3)
├─ 12× Ganchos (4 por andar × 3)
├─ 24m Corda de Segurança (8m × 3)
├─ 5× EPIs Completos
│  ├─ Luvas
│  ├─ Óculos
│  ├─ Roupa Impermeável
│  ├─ Colete com Linha de Vida
│  └─ Bota de Segurança
└─ 3× Sacos de Lixo 100L
```

### 4. 🔒 Segurança Integrada
- ✅ Reunião de segurança obrigatória
- ✅ Checklist de EPIs por tarefa
- ✅ Procedimentos de montagem/desmontagem
- ✅ Linha de vida para trabalhos em altura
- ✅ Restrições de equipamentos documentadas

### 5. 📊 Rastreabilidade Completa
- Log de início/fim de cada etapa
- Tempo real vs estimado
- Problemas encontrados
- Ações corretivas
- Histórico de produtividade

## 🎨 Interface do Sistema

### Tela 1: Templates de Tarefas (`/task-templates`)
```
┌─────────────────────────────────────────────────────────┐
│  Templates de Tarefas          [Criar Tarefa Detalhada] │
├─────────────┬─────────────────┬─────────────────────────┤
│  CLASSES    │  SUBCLASSES     │  ETAPAS (10)            │
├─────────────┼─────────────────┼─────────────────────────┤
│ ✓ Limpeza   │ ✓ Com Lavajato  │ 1. Reunião (15min)      │
│   Fachada   │   Manual        │ 2. Andaime (90min)      │
│             │   Química       │ 3. EPIs (10min)         │
│ Pintura     │                 │ 4. Equipamentos (20min) │
│   Externa   │                 │ 5. Execução (30min)     │
│             │                 │ 6. Almoço (60min)       │
│ Textura     │                 │ 7. Limpar Chão (60min)  │
│             │                 │ 8. Equipamentos (25min) │
│             │                 │ 9. Desmontar (60min)    │
│             │                 │ 10. Inspeção (30min)    │
│             │                 ├─────────────────────────┤
│             │                 │ TOTAL: ~6.7 horas       │
└─────────────┴─────────────────┴─────────────────────────┘
```

### Tela 2: Criar Tarefa Detalhada (`/create-detailed-task`)
```
┌─────────────────────────────────────────────────────────┐
│ Nova Tarefa Detalhada                    [← Voltar]     │
├────────────────────────┬────────────────────────────────┤
│  FORMULÁRIO            │  CÁLCULOS AUTOMÁTICOS          │
├────────────────────────┼────────────────────────────────┤
│ Obra: Edifício Centro  │ ⏱️ TEMPO TOTAL                 │
│ Data: 30/06/2026       │    6.7 horas (400 min)        │
│                        │                                │
│ Classe: Limpeza        │ 📋 BREAKDOWN:                  │
│ Subclasse: Lavajato    │    ✓ Reunião: 15min           │
│                        │    ✓ Andaime: 90min           │
│ Dimensões:             │    ✓ EPIs: 10min              │
│  Altura: 5m            │    ... (ver todas)            │
│  Largura: 3m           │                                │
│  Área: 15m² ✓          │ 📦 EQUIPAMENTOS (4):           │
│  Andares: 3 ✓          │    • 3× Andaime 2m            │
│                        │    • 1× Lavajato              │
│ Equipe: Alpha          │    • 1× Mangueira             │
│ Funcionários: 1        │    • 1× Extensão              │
│                        │                                │
│ Clima: ☀️ Ensolarado   │ 📋 MATERIAIS (15):             │
│ Temperatura: 25°C      │    • 12× Buxas                │
│                        │    • 12× Ganchos              │
│ [     Criar Tarefa    ]│    • 24m Corda                │
│                        │    ... (ver todos)            │
└────────────────────────┴────────────────────────────────┘
```

## 🔧 Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: tRPC + Express
- **Banco de Dados**: SQLite + Drizzle ORM
- **Animações**: Framer Motion
- **UI Components**: Radix UI + shadcn/ui

## 📥 Instalação e Uso

### 1. Instalar Dependências
```bash
npm install
```

### 2. Rodar Migrações
```bash
npm run db:push
```

### 3. Popular Banco com Exemplos
```bash
npx tsx scripts/seed-task-classes.ts
```

### 4. Iniciar Servidor
```bash
npm run dev
```

### 5. Acessar Sistema
```
http://localhost:5000
```

## 📖 Guia de Uso Rápido

### Passo 1: Explorar Templates
1. Acesse `/task-templates`
2. Navegue pelas classes disponíveis
3. Veja as subclasses e etapas
4. Entenda o breakdown de tempo

### Passo 2: Criar Tarefa
1. Clique em "Criar Tarefa Detalhada"
2. Selecione obra e data
3. Escolha classe e subclasse
4. Informe dimensões
5. Veja cálculos em tempo real
6. Confirme e crie

### Passo 3: Executar
1. Tarefa aparece no dashboard
2. Inicie cada etapa
3. Sistema rastreia tempo
4. Marque como concluído
5. Compare real vs estimado

## 📊 Exemplos de Tarefas Pré-Configuradas

### 1. Limpeza de Fachada com Lavajato
- **Área**: 15m² (5m × 3m)
- **Andares**: 3
- **Tempo Total**: 6.7 horas
- **Equipamentos**: 4 itens
- **Materiais**: 15+ itens
- **Custo Equipamentos**: R$ 260,50

### 2. Pintura Externa com Rolo (exemplo futuro)
- **Área**: 30m²
- **Demãos**: 2
- **Tempo Total**: 8+ horas
- **Inclui**: Preparação, lixamento, selador, tinta

### 3. Aplicação de Textura (exemplo futuro)
- **Área**: 20m²
- **Tipo**: Grafiato
- **Tempo Total**: 5+ horas

## 🎯 Tipos de Etapas Suportados

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| 🗣️ **SAFETY_MEETING** | Reunião de segurança | 15 min fixo |
| 🔧 **PREPARATION** | Preparação geral | Variável |
| ⚙️ **EQUIPMENT_SETUP** | Montar equipamentos | 20 min fixo |
| 🏗️ **SCAFFOLDING** | Andaime | 30 min/andar |
| 🦺 **EPIs** | Vestir EPIs | 10 min fixo |
| ⚡ **EXECUTION** | Execução principal | 2 min/m² |
| ☕ **BREAK** | Pausa/almoço | 60 min fixo |
| 🧹 **CLEANUP** | Limpeza | Variável |
| 🔍 **INSPECTION** | Inspeção | 30 min fixo |
| 📦 **EQUIPMENT_TEARDOWN** | Desmontagem | 20 min/andar |

## 💰 Benefícios Financeiros

### Planejamento Preciso
- ✅ Cronograma realista
- ✅ Sem surpresas de atraso
- ✅ Custos de mão de obra corretos

### Controle de Recursos
- ✅ Lista exata de materiais
- ✅ Quantidades calculadas
- ✅ Redução de desperdício

### Custos de Equipamentos
- ✅ Cálculo automático
- ✅ Locação por tempo real
- ✅ Orçamento preciso

### Produtividade
- ✅ Sem subestimação
- ✅ Buffer para imprevistos
- ✅ Histórico de performance

## 📈 Roadmap Futuro

### Fase 1 (Atual) ✅
- [x] Schema completo
- [x] Backend funcional
- [x] Interface de templates
- [x] Interface de criação
- [x] Cálculos automáticos
- [x] Seed com exemplos

### Fase 2 (Próximo)
- [ ] Execução em tempo real
- [ ] Dashboard de tarefas do dia
- [ ] Cronômetro por etapa
- [ ] Alertas de cooldown

### Fase 3
- [ ] Relatórios de performance
- [ ] Gráficos de produtividade
- [ ] Comparação estimado vs real
- [ ] Análise de desvios

### Fase 4
- [ ] Biblioteca expandida de templates
- [ ] Importação/exportação
- [ ] Templates personalizados
- [ ] Integração com cronograma Gantt

## 🤝 Contribuindo

Este sistema foi projetado para crescer. Sugestões de novos templates, tipos de etapas ou melhorias são bem-vindas!

## 📄 Licença

MIT License - Livre para uso e modificação

## 📞 Suporte

Para dúvidas sobre o sistema:
1. Leia `TASK_SYSTEM_README.md` (documentação detalhada)
2. Leia `IMPLEMENTATION_SUMMARY.md` (resumo técnico)
3. Veja os exemplos em `scripts/seed-task-classes.ts`

---

**🏗️ Sistema Profissional de Gerenciamento de Obras**

*Porque trabalhar em uma obra é muito mais do que apenas executar a tarefa principal.*

✨ **Desenvolvido com precisão, pensando na realidade das obras.** ✨
