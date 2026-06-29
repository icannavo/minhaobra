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
    ] 
  }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity", { enum: ["info", "warning", "error"] }).default("warning"),
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
