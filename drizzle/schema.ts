import {
  integer,
  sqliteTable,
  text,
  real,
} from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * OBRAS - Projetos/Obras em andamento
 */
export const works = sqliteTable("works", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(), // ex: "OBRA-001"
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  status: text("status", { enum: ["Planejamento", "Em Andamento", "Concluído", "Pausada"] }).default("Planejamento"),
  startDate: text("startDate"), // formato ISO date string
  estimatedEndDate: text("estimatedEndDate"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Work = typeof works.$inferSelect;
export type InsertWork = typeof works.$inferInsert;

/**
 * EQUIPAMENTOS - Catálogo de equipamentos disponíveis
 */
export const equipments = sqliteTable("equipments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // ex: "Lava Jato", "Andaime", "Compressor"
  category: text("category").notNull(), // ex: "Limpeza", "Segurança", "Compressão"
  costPerDay: real("costPerDay"),
  costPerHour: real("costPerHour"),
  quantity: integer("quantity").default(1), // quantidade disponível
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Equipment = typeof equipments.$inferSelect;
export type InsertEquipment = typeof equipments.$inferInsert;

/**
 * EPIs - Catálogo de Equipamentos de Proteção Individual
 */
export const epis = sqliteTable("epis", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // ex: "Capacete de Segurança", "Luva de Nitrila"
  category: text("category").notNull(), // ex: "Proteção Cabeça", "Proteção Mãos"
  unit: text("unit").notNull(), // ex: "unidade", "par"
  costPerUnit: real("costPerUnit"),
  quantityInStock: integer("quantityInStock").default(0), // INTEGER: não existe 0.5 capacete
  minStockLevel: integer("minStockLevel"), // INTEGER: alerta com números inteiros
  description: text("description"),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Epi = typeof epis.$inferSelect;
export type InsertEpi = typeof epis.$inferInsert;

/**
 * TAREFAS DIÁRIAS - O foco principal
 * Registro de tarefas planejadas e executadas por dia
 */
export const dailyTasks = sqliteTable("daily_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workId: integer("workId").notNull(), // referência à obra
  date: text("date").notNull(), // formato ISO date string
  taskName: text("taskName").notNull(), // ex: "Limpeza de fachada"
  description: text("description"),
  team: text("team"), // nome da equipe
  numberOfEmployees: integer("numberOfEmployees").default(1), // quantidade de funcionários
  
  // Metas e realizado
  targetArea: real("targetArea"), // m² meta
  completedArea: real("completedArea").default(0), // m² realizado
  deviation: real("deviation"), // calculado: completedArea - targetArea
  
  // Status
  isCompleted: integer("isCompleted", { mode: "boolean" }).default(false),
  status: text("status", { enum: ["Planejado", "Em Execução", "Concluído", "Adiado"] }).default("Planejado"),
  
  // Observações
  notes: text("notes"),
  correctionAction: text("correctionAction"), // ação corretiva se houver desvio
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = typeof dailyTasks.$inferInsert;

/**
 * TAREFAS-EQUIPAMENTOS - Associação entre tarefas e equipamentos necessários
 */
export const taskEquipments = sqliteTable("task_equipments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("taskId").notNull(), // referência à tarefa diária
  equipmentId: integer("equipmentId").notNull(), // referência ao equipamento
  quantity: integer("quantity").default(1), // quantidade necessária
  hoursNeeded: real("hoursNeeded"), // horas de uso estimado
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type TaskEquipment = typeof taskEquipments.$inferSelect;
export type InsertTaskEquipment = typeof taskEquipments.$inferInsert;

/**
 * CRONOGRAMA DINÂMICO - Planejamento que se ajusta automaticamente
 */
export const scheduleItems = sqliteTable("schedule_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workId: integer("workId").notNull(),
  date: text("date").notNull(), // formato ISO date string
  taskName: text("taskName").notNull(),
  plannedArea: real("plannedArea"), // m² planejado
  actualArea: real("actualArea"), // m² realizado (atualizado após execução)
  numberOfEmployees: integer("numberOfEmployees").default(1),
  productivityPerDay: real("productivityPerDay"), // m²/dia esperado
  actualProductivity: real("actualProductivity"), // m²/dia realizado
  status: text("status", { enum: ["Planejado", "Em Execução", "Concluído", "Adiado", "Atrasado"] }).default("Planejado"),
  predecessorId: integer("predecessorId"), // tarefa anterior (dependência)
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ScheduleItem = typeof scheduleItems.$inferSelect;
export type InsertScheduleItem = typeof scheduleItems.$inferInsert;

/**
 * HISTÓRICO DE PRODUTIVIDADE - Para análise e ajustes futuros
 */
export const productivityHistory = sqliteTable("productivity_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workId: integer("workId").notNull(),
  date: text("date").notNull(), // formato ISO date string
  taskName: text("taskName").notNull(),
  targetArea: real("targetArea"),
  completedArea: real("completedArea"),
  deviation: real("deviation"), // desvio em m²
  deviationPercent: real("deviationPercent"), // desvio em %
  numberOfEmployees: integer("numberOfEmployees"),
  productivity: real("productivity"), // m²/pessoa/dia
  weather: text("weather"), // clima (pode afetar produtividade)
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ProductivityHistory = typeof productivityHistory.$inferSelect;
export type InsertProductivityHistory = typeof productivityHistory.$inferInsert;

/**
 * ALERTAS - Notificações automáticas
 */
export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workId: integer("workId"),
  type: text("type", { 
    enum: [
      "TAREFA_DESVIO_NEGATIVO",
      "TAREFA_ATRASADA",
      "EQUIPAMENTO_INDISPONIVEL",
      "CRONOGRAMA_AFETADO",
      "META_NAO_ATINGIDA",
      "STOCK_LOW", // Estoque baixo (genérico)
      "MATERIAL_LOW_STOCK", // Material com estoque baixo
      "EPI_LOW_STOCK", // EPI com estoque baixo
      "WEATHER_WARNING", // Alerta de clima
      "TASK_DELAYED", // Tarefa atrasada (tempo > estimado)
      "GOAL_NOT_MET", // Meta diária não atingida
    ] 
  }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity", { enum: ["low", "medium", "high", "critical"] }).default("medium"),
  relatedId: integer("relatedId"), // ID da entidade relacionada (material, tarefa, etc)
  metadata: text("metadata"), // JSON com dados adicionais
  isRead: integer("isRead", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * CLASSES DE TAREFAS - Templates de tarefas com configuração completa
 * Ex: "Limpeza de Fachada", "Pintura Externa", "Aplicação de Textura"
 */
export const taskClasses = sqliteTable("task_classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // ex: "Limpeza de Fachada"
  code: text("code").notNull().unique(), // ex: "LF-001"
  category: text("category").notNull(), // ex: "Limpeza", "Pintura", "Preparação"
  description: text("description"),
  
  // Configurações padrão
  requiresScaffolding: integer("requiresScaffolding", { mode: "boolean" }).default(false),
  requiresSafetyMeeting: integer("requiresSafetyMeeting", { mode: "boolean" }).default(true),
  safetyMeetingMinutes: integer("safetyMeetingMinutes").default(15), // reunião de segurança
  
  // Produtividade base (m² por pessoa por dia)
  baseProductivity: real("baseProductivity").default(20),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type TaskClass = typeof taskClasses.$inferSelect;
export type InsertTaskClass = typeof taskClasses.$inferInsert;

/**
 * SUBCLASSES DE TAREFAS - Variações específicas dentro de uma classe
 * Ex: "Limpeza com Lavajato", "Limpeza Manual", "Limpeza com Produto Químico"
 */
export const taskSubclasses = sqliteTable("task_subclasses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  classId: integer("classId").notNull(), // referência à classe
  name: text("name").notNull(), // ex: "Limpeza com Lavajato"
  code: text("code").notNull().unique(), // ex: "LF-LJ-001"
  description: text("description"),
  
  // Ajustes de produtividade (multiplier da classe base)
  productivityMultiplier: real("productivityMultiplier").default(1.0), // 1.0 = mesmo da classe, 0.8 = 20% mais lento
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type TaskSubclass = typeof taskSubclasses.$inferSelect;
export type InsertTaskSubclass = typeof taskSubclasses.$inferInsert;

/**
 * ETAPAS DE TAREFAS - Breakdown detalhado de uma tarefa
 * Ex: "Montar Andaime", "Vestir EPIs", "Preparar Equipamentos", etc.
 */
export const taskSteps = sqliteTable("task_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subclassId: integer("subclassId").notNull(), // referência à subclasse
  name: text("name").notNull(), // ex: "Montagem de Andaime"
  stepOrder: integer("stepOrder").notNull(), // ordem da etapa
  stepType: text("stepType", {
    enum: [
      "SAFETY_MEETING", // reunião de segurança
      "PREPARATION", // preparação geral
      "EQUIPMENT_SETUP", // montagem/preparação de equipamento
      "SCAFFOLDING", // montagem de andaime
      "EPIs", // vestir EPIs
      "EXECUTION", // execução principal
      "BREAK", // pausa/descanso
      "CLEANUP", // limpeza
      "INSPECTION", // inspeção/correção
      "EQUIPMENT_TEARDOWN", // desmontagem
    ]
  }).notNull(),
  
  // Tempo base em minutos
  baseTimeMinutes: integer("baseTimeMinutes").default(0),
  
  // Cálculo de tempo
  timeCalculationType: text("timeCalculationType", {
    enum: [
      "FIXED", // tempo fixo
      "PER_M2", // por m²
      "PER_FLOOR", // por andar (andaime)
      "PER_EQUIPMENT", // por equipamento
      "PERCENTAGE_EXECUTION", // percentual do tempo de execução
    ]
  }).default("FIXED"),
  timeCalculationValue: real("timeCalculationValue").default(0), // valor para cálculo
  
  // Restrições
  requiresCooldown: integer("requiresCooldown", { mode: "boolean" }).default(false), // ex: máquina precisa esfriar
  cooldownMinutes: integer("cooldownMinutes").default(0),
  maxContinuousMinutes: integer("maxContinuousMinutes").default(0), // ex: máquina só funciona 30min
  
  description: text("description"),
  notes: text("notes"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type TaskStep = typeof taskSteps.$inferSelect;
export type InsertTaskStep = typeof taskSteps.$inferInsert;

/**
 * EQUIPAMENTOS DAS ETAPAS - Equipamentos necessários por etapa
 */
export const stepEquipments = sqliteTable("step_equipments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stepId: integer("stepId").notNull(),
  equipmentId: integer("equipmentId").notNull(),
  quantity: integer("quantity").default(1),
  required: integer("required", { mode: "boolean" }).default(true),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type StepEquipment = typeof stepEquipments.$inferSelect;
export type InsertStepEquipment = typeof stepEquipments.$inferInsert;

/**
 * MATERIAIS DAS ETAPAS - Materiais necessários por etapa
 */
export const stepMaterials = sqliteTable("step_materials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stepId: integer("stepId").notNull(),
  materialName: text("materialName").notNull(), // nome do material
  materialCategory: text("materialCategory"), // categoria
  quantity: real("quantity").default(1),
  unit: text("unit"), // unidade (L, kg, m, unidade)
  calculationType: text("calculationType", {
    enum: [
      "FIXED", // quantidade fixa
      "PER_M2", // por m²
      "PER_FLOOR", // por andar
    ]
  }).default("FIXED"),
  required: integer("required", { mode: "boolean" }).default(true),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type StepMaterial = typeof stepMaterials.$inferSelect;
export type InsertStepMaterial = typeof stepMaterials.$inferInsert;

/**
 * TAREFAS DETALHADAS - Tarefas baseadas em classes/subclasses
 * Substitui/complementa as dailyTasks com informações completas
 */
export const detailedTasks = sqliteTable("detailed_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workId: integer("workId").notNull(),
  date: text("date").notNull(),
  
  // Referências
  classId: integer("classId").notNull(),
  subclassId: integer("subclassId").notNull(),
  
  // Identificação
  taskName: text("taskName").notNull(),
  description: text("description"),
  
  // Dimensões
  area: real("area").default(0), // m²
  height: real("height").default(0), // altura em metros
  width: real("width").default(0), // largura em metros
  floors: integer("floors").default(1), // número de andares (para andaime)
  
  // Equipe
  team: text("team"),
  numberOfEmployees: integer("numberOfEmployees").default(1),
  
  // Tempos calculados (em minutos)
  estimatedTotalMinutes: integer("estimatedTotalMinutes").default(0),
  actualTotalMinutes: integer("actualTotalMinutes").default(0),
  
  // Status
  status: text("status", {
    enum: ["Planejado", "Em Preparação", "Em Execução", "Pausada", "Concluído", "Adiado"]
  }).default("Planejado"),
  
  // Progresso
  currentStepId: integer("currentStepId"), // etapa atual
  completedSteps: text("completedSteps"), // JSON array de IDs de etapas concluídas
  
  // Observações
  notes: text("notes"),
  issues: text("issues"), // problemas encontrados
  correctionAction: text("correctionAction"),
  
  // Condições
  weather: text("weather"), // clima
  temperature: real("temperature"), // temperatura
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  completedAt: integer("completedAt", { mode: "timestamp" }),
});

export type DetailedTask = typeof detailedTasks.$inferSelect;
export type InsertDetailedTask = typeof detailedTasks.$inferInsert;

/**
 * REGISTRO DE EXECUÇÃO DE ETAPAS - Log de execução de cada etapa
 */
export const stepExecutions = sqliteTable("step_executions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  detailedTaskId: integer("detailedTaskId").notNull(),
  stepId: integer("stepId").notNull(),
  
  // Tempos
  startTime: integer("startTime", { mode: "timestamp" }),
  endTime: integer("endTime", { mode: "timestamp" }),
  durationMinutes: integer("durationMinutes").default(0),
  
  // Status
  status: text("status", {
    enum: ["Pendente", "Em Execução", "Concluído", "Pausado", "Cancelado"]
  }).default("Pendente"),
  
  // Observações
  notes: text("notes"),
  issues: text("issues"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type StepExecution = typeof stepExecutions.$inferSelect;
export type InsertStepExecution = typeof stepExecutions.$inferInsert;

/**
 * CRONOGRAMAS DIÁRIOS - Planejamento agregado por dia
 * Sumariza todas as tarefas de um dia específico
 */
export const dailySchedules = sqliteTable("daily_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workId: integer("workId").notNull(),
  date: text("date").notNull(), // formato ISO date string
  
  // Resumo do dia
  totalTasks: integer("totalTasks").default(0),
  completedTasks: integer("completedTasks").default(0),
  totalEstimatedMinutes: integer("totalEstimatedMinutes").default(0),
  totalActualMinutes: integer("totalActualMinutes").default(0),
  
  // Metas do dia
  targetArea: real("targetArea").default(0), // meta de m² para o dia
  completedArea: real("completedArea").default(0), // m² realizado
  
  // Recursos do dia
  numberOfEmployees: integer("numberOfEmployees").default(0),
  totalEquipmentCost: real("totalEquipmentCost").default(0),
  
  // Status geral do dia
  status: text("status", {
    enum: ["Planejado", "Em Andamento", "Concluído", "Parcialmente Concluído", "Cancelado"]
  }).default("Planejado"),
  
  // Observações
  notes: text("notes"),
  weather: text("weather"),
  temperature: real("temperature"),
  issues: text("issues"), // problemas do dia
  achievements: text("achievements"), // conquistas/destaques
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DailySchedule = typeof dailySchedules.$inferSelect;
export type InsertDailySchedule = typeof dailySchedules.$inferInsert;

/**
 * TAREFAS AGENDADAS - Relacionamento entre tarefas detalhadas e horários do dia
 * Para o sistema Kanban de arrastar tarefas para horários
 */
export const scheduledTasks = sqliteTable("scheduled_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dailyScheduleId: integer("dailyScheduleId").notNull(),
  detailedTaskId: integer("detailedTaskId").notNull(),
  
  // Horário agendado
  scheduledStartTime: text("scheduledStartTime"), // formato HH:mm (ex: "08:00")
  scheduledEndTime: text("scheduledEndTime"), // calculado automaticamente
  slotOrder: integer("slotOrder").default(0), // ordem no slot de tempo
  
  // Tempos reais
  actualStartTime: integer("actualStartTime", { mode: "timestamp" }),
  actualEndTime: integer("actualEndTime", { mode: "timestamp" }),
  
  // Status
  status: text("status", {
    enum: ["Agendado", "Em Execução", "Concluído", "Adiado", "Cancelado"]
  }).default("Agendado"),
  
  notes: text("notes"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ScheduledTask = typeof scheduledTasks.$inferSelect;
export type InsertScheduledTask = typeof scheduledTasks.$inferInsert;

/**
 * METAS DIÁRIAS - Metas específicas editáveis por dia
 */
export const dailyGoals = sqliteTable("daily_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dailyScheduleId: integer("dailyScheduleId").notNull(),
  
  goalType: text("goalType", {
    enum: ["AREA", "TASKS", "PRODUCTIVITY", "CUSTOM"]
  }).notNull(),
  
  description: text("description").notNull(),
  targetValue: real("targetValue").notNull(),
  achievedValue: real("achievedValue").default(0),
  unit: text("unit"), // m², tarefas, etc
  
  priority: text("priority", {
    enum: ["low", "medium", "high", "critical"]
  }).default("medium"),
  
  isAchieved: integer("isAchieved", { mode: "boolean" }).default(false),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = typeof dailyGoals.$inferInsert;

/**
 * MEMBROS DA EQUIPE - Cadastro de funcionários
 */
export const teamMembers = sqliteTable("team_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role"), // Pintor, Pedreiro, Encarregado, etc
  specialty: text("specialty"), // Fachadas, Estruturas, etc
  phone: text("phone"),
  email: text("email"),
  
  // Produtividade individual
  avgProductivity: real("avgProductivity"), // m²/dia médio
  
  // Status
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * ALOCAÇÃO DE EQUIPE - Quem trabalha em qual tarefa
 */
export const taskTeamAllocations = sqliteTable("task_team_allocations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  detailedTaskId: integer("detailedTaskId").notNull(),
  teamMemberId: integer("teamMemberId").notNull(),
  
  role: text("role"), // função específica nesta tarefa
  hoursAllocated: real("hoursAllocated"),
  hoursWorked: real("hoursWorked").default(0),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type TaskTeamAllocation = typeof taskTeamAllocations.$inferSelect;
export type InsertTaskTeamAllocation = typeof taskTeamAllocations.$inferInsert;

/**
 * MATERIAIS - Catálogo de materiais disponíveis
 */
export const materials = sqliteTable("materials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(), // Tinta, Massa, Selante, etc
  type: text("type"), // Acrílico, Epóxi, etc
  brand: text("brand"),
  
  unit: text("unit").notNull(), // L, kg, m, unidade
  costPerUnit: real("costPerUnit"),
  
  // Estoque
  quantityInStock: real("quantityInStock").default(0),
  minStockLevel: real("minStockLevel"),
  
  // Especificações
  yieldPerUnit: real("yieldPerUnit"), // rendimento (ex: 12 m²/L)
  color: text("color"),
  
  description: text("description"),
  notes: text("notes"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

/**
 * CONSUMO DE MATERIAIS - Registro de uso real de materiais em tarefas
 */
export const materialConsumptions = sqliteTable("material_consumptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  detailedTaskId: integer("detailedTaskId").notNull(),
  materialId: integer("materialId").notNull(),
  
  plannedQuantity: real("plannedQuantity").default(0),
  actualQuantity: real("actualQuantity").default(0),
  
  cost: real("cost"),
  
  notes: text("notes"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type MaterialConsumption = typeof materialConsumptions.$inferSelect;
export type InsertMaterialConsumption = typeof materialConsumptions.$inferInsert;

/**
 * LOGS DE ALTERAÇÕES - Auditoria de mudanças
 */
export const changeLogs = sqliteTable("change_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entityType: text("entityType").notNull(), // work, task, schedule, etc
  entityId: integer("entityId").notNull(),
  
  action: text("action", {
    enum: ["CREATE", "UPDATE", "DELETE"]
  }).notNull(),
  
  fieldChanged: text("fieldChanged"),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  
  changedBy: text("changedBy"), // usuário que fez a mudança
  reason: text("reason"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ChangeLog = typeof changeLogs.$inferSelect;
export type InsertChangeLog = typeof changeLogs.$inferInsert;

/**
 * RASCUNHOS DE OBRAS - Salvamento de progresso da criação de obras
 * Permite continuar a criação depois se necessário
 */
export const workDrafts = sqliteTable("work_drafts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Status do rascunho
  status: text("status", {
    enum: ["draft", "completed", "abandoned"]
  }).default("draft"),
  
  // Dados do formulário (JSON)
  formData: text("formData").notNull(), // JSON do estado completo
  
  // Controle de etapa
  currentStep: integer("currentStep").default(1),
  
  // Metadados
  lastSavedAt: integer("lastSavedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  
  // Identificação do usuário (opcional)
  userId: integer("userId"),
});

export type WorkDraft = typeof workDrafts.$inferSelect;
export type InsertWorkDraft = typeof workDrafts.$inferInsert;

/**
 * PROJETOS - Base hierárquica completa de tarefas
 * Quando um projeto é criado, gera automaticamente centenas de tarefas baseadas em WBS
 */
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workId: integer("workId").notNull(), // referência à obra
  name: text("name").notNull(),
  description: text("description"),
  
  // Dimensões totais
  totalArea: real("totalArea").default(0),
  totalFloors: integer("totalFloors").default(1),
  
  // Progresso geral
  totalTasks: integer("totalTasks").default(0),
  completedTasks: integer("completedTasks").default(0),
  progressPercent: real("progressPercent").default(0),
  
  // Datas
  startDate: text("startDate"),
  estimatedEndDate: text("estimatedEndDate"),
  actualEndDate: text("actualEndDate"),
  
  // Status
  status: text("status", {
    enum: ["Planejamento", "Em Andamento", "Concluído", "Pausado", "Cancelado"]
  }).default("Planejamento"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * FASES DO PROJETO - Grandes etapas (ex: Preparação, Execução, Acabamento)
 */
export const projectPhases = sqliteTable("project_phases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId").notNull(),
  name: text("name").notNull(), // ex: "Fase 1: Preparação de Superfície"
  description: text("description"),
  phaseOrder: integer("phaseOrder").notNull(),
  
  // Progresso da fase
  totalTasks: integer("totalTasks").default(0),
  completedTasks: integer("completedTasks").default(0),
  progressPercent: real("progressPercent").default(0),
  
  // Status
  status: text("status", {
    enum: ["Pendente", "Em Andamento", "Concluído", "Bloqueado"]
  }).default("Pendente"),
  
  // Dependências
  dependsOnPhaseId: integer("dependsOnPhaseId"), // fase anterior necessária
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ProjectPhase = typeof projectPhases.$inferSelect;
export type InsertProjectPhase = typeof projectPhases.$inferInsert;

/**
 * TAREFAS DO PROJETO - Nível intermediário (ex: "Limpeza Fachada Norte")
 * Estas são as tarefas que aparecem no Kanban para serem arrastadas
 */
export const projectTasks = sqliteTable("project_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId").notNull(),
  phaseId: integer("phaseId").notNull(),
  
  // Identificação
  code: text("code").notNull(), // ex: "F1-T001"
  name: text("name").notNull(),
  description: text("description"),
  
  // Referência ao template
  classId: integer("classId"), // classe de tarefa (opcional)
  subclassId: integer("subclassId"), // subclasse (opcional)
  
  // Dimensões específicas
  area: real("area").default(0),
  height: real("height").default(0),
  width: real("width").default(0),
  floors: integer("floors").default(1),
  
  // Estimativas
  estimatedDurationMinutes: integer("estimatedDurationMinutes").default(0),
  estimatedEmployees: integer("estimatedEmployees").default(1),
  estimatedCost: real("estimatedCost").default(0),
  
  // Prioridade e ordem
  priority: text("priority", {
    enum: ["low", "medium", "high", "critical"]
  }).default("medium"),
  taskOrder: integer("taskOrder").default(0),
  
  // Dependências
  dependsOnTaskIds: text("dependsOnTaskIds"), // JSON array de IDs de tarefas
  blockedBy: text("blockedBy"), // motivo se bloqueada
  
  // Status no Kanban
  kanbanStatus: text("kanbanStatus", {
    enum: ["backlog", "scheduled", "in_progress", "completed", "cancelled"]
  }).default("backlog"),
  
  // Agendamento
  scheduledDate: text("scheduledDate"), // data agendada quando arrastada no calendário
  scheduledStartTime: text("scheduledStartTime"), // horário no dia (HH:mm)
  scheduledEndTime: text("scheduledEndTime"),
  
  // Execução real
  actualStartTime: integer("actualStartTime", { mode: "timestamp" }),
  actualEndTime: integer("actualEndTime", { mode: "timestamp" }),
  actualDurationMinutes: integer("actualDurationMinutes").default(0),
  
  // Progresso
  progressPercent: real("progressPercent").default(0),
  completedArea: real("completedArea").default(0),
  
  // Status
  status: text("status", {
    enum: ["Pendente", "Agendado", "Em Preparação", "Em Execução", "Pausada", "Concluído", "Cancelado"]
  }).default("Pendente"),
  
  // Subtarefas
  totalSubtasks: integer("totalSubtasks").default(0),
  completedSubtasks: integer("completedSubtasks").default(0),
  
  // Observações
  notes: text("notes"),
  issues: text("issues"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  completedAt: integer("completedAt", { mode: "timestamp" }),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

/**
 * SUBTAREFAS - Breakdown detalhado de cada tarefa
 */
export const projectSubtasks = sqliteTable("project_subtasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectTaskId: integer("projectTaskId").notNull(),
  
  name: text("name").notNull(),
  description: text("description"),
  subtaskOrder: integer("subtaskOrder").notNull(),
  
  // Tipo de subtarefa (baseado em taskSteps)
  stepType: text("stepType", {
    enum: [
      "SAFETY_MEETING",
      "PREPARATION",
      "EQUIPMENT_SETUP",
      "SCAFFOLDING",
      "EPIs",
      "EXECUTION",
      "BREAK",
      "CLEANUP",
      "INSPECTION",
      "EQUIPMENT_TEARDOWN",
    ]
  }).notNull(),
  
  // Tempo estimado
  estimatedMinutes: integer("estimatedMinutes").default(0),
  actualMinutes: integer("actualMinutes").default(0),
  
  // Status
  status: text("status", {
    enum: ["Pendente", "Em Execução", "Concluído", "Pausado", "Cancelado"]
  }).default("Pendente"),
  
  // Checklist (opcional)
  checklistItems: text("checklistItems"), // JSON array de items
  
  // Observações
  notes: text("notes"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  completedAt: integer("completedAt", { mode: "timestamp" }),
});

export type ProjectSubtask = typeof projectSubtasks.$inferSelect;
export type InsertProjectSubtask = typeof projectSubtasks.$inferInsert;

/**
 * KANBAN COLUMNS - Colunas personalizáveis do Kanban
 */
export const kanbanColumns = sqliteTable("kanban_columns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId").notNull(),
  
  name: text("name").notNull(), // ex: "Backlog", "Esta Semana", "Em Andamento"
  description: text("description"),
  columnType: text("columnType", {
    enum: ["backlog", "scheduled", "in_progress", "review", "completed"]
  }).notNull(),
  
  color: text("color").default("#gray"), // cor da coluna
  columnOrder: integer("columnOrder").notNull(),
  
  // Limites (WIP - Work In Progress)
  maxTasks: integer("maxTasks"), // limite de tarefas nesta coluna
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type KanbanColumn = typeof kanbanColumns.$inferSelect;
export type InsertKanbanColumn = typeof kanbanColumns.$inferInsert;

/**
 * CALENDAR SLOTS - Slots de tempo no calendário diário
 */
export const calendarSlots = sqliteTable("calendar_slots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId").notNull(),
  date: text("date").notNull(), // formato ISO date
  
  // Horário do slot
  startTime: text("startTime").notNull(), // formato HH:mm
  endTime: text("endTime").notNull(),
  
  // Capacidade
  maxTasks: integer("maxTasks").default(1), // quantas tarefas paralelas
  currentTasks: integer("currentTasks").default(0),
  
  // Status
  isAvailable: integer("isAvailable", { mode: "boolean" }).default(true),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type CalendarSlot = typeof calendarSlots.$inferSelect;
export type InsertCalendarSlot = typeof calendarSlots.$inferInsert;

/**
 * TASK ASSIGNMENTS - Tarefas atribuídas a slots de calendário
 * Para o sistema de arrastar tarefas para horários
 */
export const taskAssignments = sqliteTable("task_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectTaskId: integer("projectTaskId").notNull(),
  calendarSlotId: integer("calendarSlotId").notNull(),
  
  // Posição no slot (se múltiplas tarefas paralelas)
  slotPosition: integer("slotPosition").default(0),
  
  // Status da atribuição
  status: text("status", {
    enum: ["Agendado", "Confirmado", "Em Execução", "Concluído", "Cancelado"]
  }).default("Agendado"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = typeof taskAssignments.$inferInsert;

/**
 * PROJECT TEMPLATES - Templates de projeto para geração rápida
 */
export const projectTemplates = sqliteTable("project_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // ex: "Restauração Completa de Fachada"
  description: text("description"),
  category: text("category"), // ex: "Restauração", "Pintura", "Impermeabilização"
  
  // Template de fases e tarefas (JSON)
  phasesTemplate: text("phasesTemplate"), // JSON com estrutura de fases
  tasksTemplate: text("tasksTemplate"), // JSON com estrutura de tarefas
  
  // Estimativas base
  baseAreaMultiplier: real("baseAreaMultiplier").default(1.0), // ajuste por m²
  baseDurationDays: integer("baseDurationDays").default(30),
  
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = typeof projectTemplates.$inferInsert;

/**
 * DISPONIBILIDADE DE RECURSOS - Controle diário de equipamentos e equipe
 */
export const resourceAvailability = sqliteTable("resource_availability", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  resourceType: text("resourceType", { enum: ["equipment", "team_member", "material"] }).notNull(),
  resourceId: integer("resourceId").notNull(), // ID do equipamento/membro/material
  date: text("date").notNull(), // formato ISO date
  workId: integer("workId"), // Obra onde está alocado
  taskId: integer("taskId"), // Tarefa onde está alocado
  isAvailable: integer("isAvailable", { mode: "boolean" }).default(true),
  allocatedQuantity: real("allocatedQuantity").default(0), // Quantidade alocada
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ResourceAvailability = typeof resourceAvailability.$inferSelect;
export type InsertResourceAvailability = typeof resourceAvailability.$inferInsert;

/**
 * ALOCAÇÃO DIÁRIA DE EQUIPE - Quem trabalha onde e quando
 */
export const dailyTeamAllocations = sqliteTable("daily_team_allocations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamMemberId: integer("teamMemberId").notNull(),
  workId: integer("workId").notNull(),
  taskId: integer("taskId"), // Tarefa específica (opcional)
  date: text("date").notNull(),
  
  // Horário
  startTime: text("startTime"), // HH:mm
  endTime: text("endTime"),
  
  // Status
  status: text("status", {
    enum: ["scheduled", "working", "completed", "absent"]
  }).default("scheduled"),
  
  // Observações
  notes: text("notes"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DailyTeamAllocation = typeof dailyTeamAllocations.$inferSelect;
export type InsertDailyTeamAllocation = typeof dailyTeamAllocations.$inferInsert;

/**
 * ALOCAÇÃO DIÁRIA DE EQUIPAMENTOS
 */
export const dailyEquipmentAllocations = sqliteTable("daily_equipment_allocations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  equipmentId: integer("equipmentId").notNull(),
  workId: integer("workId").notNull(),
  taskId: integer("taskId"),
  date: text("date").notNull(),
  
  quantity: integer("quantity").default(1),
  
  status: text("status", {
    enum: ["allocated", "in_use", "returned", "maintenance"]
  }).default("allocated"),
  
  notes: text("notes"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DailyEquipmentAllocation = typeof dailyEquipmentAllocations.$inferSelect;
export type InsertDailyEquipmentAllocation = typeof dailyEquipmentAllocations.$inferInsert;

/**
 * ALOCAÇÃO DIÁRIA DE MATERIAIS
 */
export const dailyMaterialAllocations = sqliteTable("daily_material_allocations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  materialId: integer("materialId").notNull(),
  workId: integer("workId").notNull(),
  taskId: integer("taskId"),
  date: text("date").notNull(),
  
  plannedQuantity: real("plannedQuantity").default(0),
  allocatedQuantity: real("allocatedQuantity").default(0),
  consumedQuantity: real("consumedQuantity").default(0),
  
  status: text("status", {
    enum: ["planned", "allocated", "consumed", "returned"]
  }).default("planned"),
  
  notes: text("notes"),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DailyMaterialAllocation = typeof dailyMaterialAllocations.$inferSelect;
export type InsertDailyMaterialAllocation = typeof dailyMaterialAllocations.$inferInsert;
