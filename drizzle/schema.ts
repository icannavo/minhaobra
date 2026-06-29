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
