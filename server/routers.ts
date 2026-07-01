import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

/**
 * OBRAS ROUTER
 */
const worksRouter = router({
  getAll: publicProcedure.query(() => db.getAllWorks()),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getWorkById(input.id)),
  create: publicProcedure
    .input(
      z.object({
        code: z.string(),
        name: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        estimatedEndDate: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createWork(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        code: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(["Planejamento", "Em Andamento", "Concluído", "Pausada"]).optional(),
        startDate: z.string().optional(),
        estimatedEndDate: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateWork(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteWork(input.id)),
});

/**
 * EQUIPAMENTOS ROUTER
 */
const equipmentsRouter = router({
  getAll: publicProcedure.query(() => db.getAllEquipments()),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getEquipmentById(input.id)),
  create: publicProcedure // Temporariamente público até OAuth configurado
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        costPerDay: z.string().optional(),
        costPerHour: z.string().optional(),
        quantity: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createEquipment(input)),
  update: publicProcedure // Temporariamente público até OAuth configurado
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        costPerDay: z.string().optional(),
        costPerHour: z.string().optional(),
        quantity: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateEquipment(id, data);
    }),
  delete: publicProcedure // Temporariamente público até OAuth configurado
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteEquipment(input.id)),
});

/**
 * EPIs ROUTER
 */
const episRouter = router({
  getAll: publicProcedure.query(() => db.getAllEpis()),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getEpiById(input.id)),
  create: publicProcedure // Temporariamente público até OAuth configurado
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        unit: z.string(),
        costPerUnit: z.number().optional(),
        quantityInStock: z.number().optional(),
        minStockLevel: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createEpi(input)),
  update: publicProcedure // Temporariamente público até OAuth configurado
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        unit: z.string().optional(),
        costPerUnit: z.number().optional(),
        quantityInStock: z.number().optional(),
        minStockLevel: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateEpi(id, data);
    }),
  delete: publicProcedure // Temporariamente público até OAuth configurado
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteEpi(input.id)),
});

/**
 * TAREFAS DIÁRIAS ROUTER - FOCO PRINCIPAL
 */
const dailyTasksRouter = router({
  getByDate: publicProcedure
    .input(z.object({ date: z.string() }))
    .query(({ input }) => db.getDailyTasksByDate(input.date)),

  getByWork: publicProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string().optional(),
      })
    )
    .query(({ input }) => db.getDailyTasksByWork(input.workId, input.date)),

  create: protectedProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string(),
        taskName: z.string(),
        description: z.string().optional(),
        team: z.string().optional(),
        numberOfEmployees: z.number().optional(),
        targetArea: z.string(),
        completedArea: z.string().optional(),
        status: z.enum(["Planejado", "Em Execução", "Concluído", "Adiado"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createDailyTask(input)),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        completedArea: z.string().optional(),
        isCompleted: z.boolean().optional(),
        status: z.enum(["Planejado", "Em Execução", "Concluído", "Adiado"]).optional(),
        notes: z.string().optional(),
        correctionAction: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateDailyTask(id, data);
    }),
});

/**
 * TAREFAS-EQUIPAMENTOS ROUTER
 */
const taskEquipmentsRouter = router({
  getByTask: publicProcedure
    .input(z.object({ taskId: z.number() }))
    .query(({ input }) => db.getEquipmentsByTask(input.taskId)),

  addEquipment: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        equipmentId: z.number(),
        quantity: z.number().optional(),
        hoursNeeded: z.string().optional(),
      })
    )
    .mutation(({ input }) =>
      db.addEquipmentToTask(input.taskId, input.equipmentId, input.quantity, input.hoursNeeded)
    ),
});

/**
 * CRONOGRAMA DINÂMICO ROUTER
 */
const scheduleRouter = router({
  getByWork: publicProcedure
    .input(z.object({ workId: z.number() }))
    .query(({ input }) => db.getScheduleByWork(input.workId)),

  getByDate: publicProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string(),
      })
    )
    .query(({ input }) => db.getScheduleByDate(input.workId, input.date)),

  create: protectedProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string(),
        taskName: z.string(),
        plannedArea: z.string().optional(),
        numberOfEmployees: z.number().optional(),
        productivityPerDay: z.string().optional(),
        status: z.enum(["Planejado", "Em Execução", "Concluído", "Adiado", "Atrasado"]).optional(),
        predecessorId: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createScheduleItem(input)),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        actualArea: z.string().optional(),
        status: z.enum(["Planejado", "Em Execução", "Concluído", "Adiado", "Atrasado"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateScheduleItem(id, data);
    }),

  // Recalcular cronograma baseado em produtividade
  calculateNextSchedule: publicProcedure
    .input(
      z.object({
        workId: z.number(),
        currentDate: z.string(),
      })
    )
    .query(({ input }) => db.calculateNextSchedule(input.workId, input.currentDate)),

  // Redistribuir tarefas não concluídas
  redistributeUncompleted: protectedProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string(),
      })
    )
    .mutation(({ input }) => db.redistributeUncompletedTasks(input.workId, input.date)),
});

/**
 * HISTÓRICO DE PRODUTIVIDADE ROUTER
 */
const productivityRouter = router({
  getHistory: publicProcedure
    .input(z.object({ workId: z.number() }))
    .query(({ input }) => db.getProductivityHistory(input.workId)),

  recordProductivity: protectedProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string(),
        taskName: z.string(),
        targetArea: z.string().optional(),
        completedArea: z.string(),
        numberOfEmployees: z.number(),
        weather: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createProductivityRecord(input)),
});

/**
 * ALERTAS ROUTER
 */
const alertsRouter = router({
  getAll: publicProcedure
    .input(z.object({ unreadOnly: z.boolean().optional() }).optional())
    .query(({ input }) => db.getAllAlerts(input?.unreadOnly)),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.markAlertAsRead(input.id)),
});

/**
 * CLASSES E SUBCLASSES DE TAREFAS ROUTER - NOVO SISTEMA DETALHADO
 */
const taskClassesRouter = router({
  getAll: publicProcedure.query(() => db.getAllTaskClasses()),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getTaskClassById(input.id)),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        code: z.string(),
        category: z.string(),
        description: z.string().optional(),
        requiresScaffolding: z.boolean().optional(),
        requiresSafetyMeeting: z.boolean().optional(),
        safetyMeetingMinutes: z.number().optional(),
        baseProductivity: z.number().optional(),
      })
    )
    .mutation(({ input }) => db.createTaskClass(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        requiresScaffolding: z.boolean().optional(),
        requiresSafetyMeeting: z.boolean().optional(),
        safetyMeetingMinutes: z.number().optional(),
        baseProductivity: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateTaskClass(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteTaskClass(input.id)),
});

const taskSubclassesRouter = router({
  getByClass: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(({ input }) => db.getSubclassesByClass(input.classId)),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getTaskSubclassById(input.id)),
  create: protectedProcedure
    .input(
      z.object({
        classId: z.number(),
        name: z.string(),
        code: z.string(),
        description: z.string().optional(),
        productivityMultiplier: z.number().optional(),
      })
    )
    .mutation(({ input }) => db.createTaskSubclass(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        productivityMultiplier: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateTaskSubclass(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteTaskSubclass(input.id)),
});

const taskStepsRouter = router({
  getBySubclass: publicProcedure
    .input(z.object({ subclassId: z.number() }))
    .query(({ input }) => db.getStepsBySubclass(input.subclassId)),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getTaskStepById(input.id)),
  create: protectedProcedure
    .input(
      z.object({
        subclassId: z.number(),
        name: z.string(),
        stepOrder: z.number(),
        stepType: z.enum([
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
        ]),
        baseTimeMinutes: z.number().optional(),
        timeCalculationType: z.enum(["FIXED", "PER_M2", "PER_FLOOR", "PER_EQUIPMENT", "PERCENTAGE_EXECUTION"]).optional(),
        timeCalculationValue: z.number().optional(),
        requiresCooldown: z.boolean().optional(),
        cooldownMinutes: z.number().optional(),
        maxContinuousMinutes: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createTaskStep(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        stepOrder: z.number().optional(),
        baseTimeMinutes: z.number().optional(),
        timeCalculationType: z.enum(["FIXED", "PER_M2", "PER_FLOOR", "PER_EQUIPMENT", "PERCENTAGE_EXECUTION"]).optional(),
        timeCalculationValue: z.number().optional(),
        requiresCooldown: z.boolean().optional(),
        cooldownMinutes: z.number().optional(),
        maxContinuousMinutes: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateTaskStep(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteTaskStep(input.id)),
});

const detailedTasksRouter = router({
  getByWork: publicProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string().optional(),
      })
    )
    .query(({ input }) => db.getDetailedTasksByWork(input.workId, input.date)),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getDetailedTaskById(input.id)),
  create: protectedProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string(),
        classId: z.number(),
        subclassId: z.number(),
        taskName: z.string(),
        description: z.string().optional(),
        area: z.number().optional(),
        height: z.number().optional(),
        width: z.number().optional(),
        floors: z.number().optional(),
        team: z.string().optional(),
        numberOfEmployees: z.number().optional(),
        weather: z.string().optional(),
        temperature: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createDetailedTask(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["Planejado", "Em Preparação", "Em Execução", "Pausada", "Concluído", "Adiado"]).optional(),
        currentStepId: z.number().optional(),
        completedSteps: z.string().optional(),
        actualTotalMinutes: z.number().optional(),
        notes: z.string().optional(),
        issues: z.string().optional(),
        correctionAction: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateDetailedTask(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteDetailedTask(input.id)),
  calculateRequirements: publicProcedure
    .input(
      z.object({
        subclassId: z.number(),
        area: z.number(),
        floors: z.number().optional(),
      })
    )
    .query(({ input }) => db.calculateTaskRequirements(input.subclassId, input.area, input.floors || 1)),
});

const stepExecutionsRouter = router({
  getByTask: publicProcedure
    .input(z.object({ detailedTaskId: z.number() }))
    .query(({ input }) => db.getExecutionsByTask(input.detailedTaskId)),
  start: protectedProcedure
    .input(
      z.object({
        detailedTaskId: z.number(),
        stepId: z.number(),
      })
    )
    .mutation(({ input }) => db.startStepExecution(input.detailedTaskId, input.stepId)),
  complete: protectedProcedure
    .input(
      z.object({
        executionId: z.number(),
        notes: z.string().optional(),
        issues: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.completeStepExecution(input.executionId, input.notes, input.issues)),
});

/**
 * CRONOGRAMAS DIÁRIOS ROUTER - NOVO
 */
const dailySchedulesRouter = router({
  getByWork: publicProcedure
    .input(z.object({ workId: z.number() }))
    .query(({ input }) => db.getDailySchedulesByWork(input.workId)),
  getByDate: publicProcedure
    .input(z.object({ workId: z.number(), date: z.string() }))
    .query(({ input }) => db.getDailyScheduleByDate(input.workId, input.date)),
  create: protectedProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string(),
        targetArea: z.number().optional(),
        numberOfEmployees: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createDailySchedule(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        targetArea: z.number().optional(),
        completedArea: z.number().optional(),
        numberOfEmployees: z.number().optional(),
        status: z.enum(["Planejado", "Em Andamento", "Concluído", "Parcialmente Concluído", "Cancelado"]).optional(),
        notes: z.string().optional(),
        weather: z.string().optional(),
        temperature: z.number().optional(),
        issues: z.string().optional(),
        achievements: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateDailySchedule(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteDailySchedule(input.id)),
  generate: protectedProcedure
    .input(z.object({ workId: z.number(), date: z.string() }))
    .mutation(({ input }) => db.generateDailySchedule(input.workId, input.date)),
  confirmPlanning: protectedProcedure
    .input(
      z.object({
        workId: z.number(),
        date: z.string(),
        scheduledTasks: z.array(
          z.object({
            detailedTaskId: z.number(),
            scheduledStartTime: z.string(),
            slotOrder: z.number(),
          })
        ),
      })
    )
    .mutation(({ input }) => db.confirmDailyPlanning(input.workId, input.date, input.scheduledTasks)),
});

/**
 * TAREFAS AGENDADAS ROUTER - KANBAN
 */
const scheduledTasksRouter = router({
  getByDay: publicProcedure
    .input(z.object({ dailyScheduleId: z.number() }))
    .query(({ input }) => db.getScheduledTasksByDay(input.dailyScheduleId)),
  create: protectedProcedure
    .input(
      z.object({
        dailyScheduleId: z.number(),
        detailedTaskId: z.number(),
        scheduledStartTime: z.string(),
        slotOrder: z.number().optional(),
      })
    )
    .mutation(({ input }) => db.createScheduledTask(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        scheduledStartTime: z.string().optional(),
        slotOrder: z.number().optional(),
        status: z.enum(["Agendado", "Em Execução", "Concluído", "Adiado", "Cancelado"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateScheduledTask(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteScheduledTask(input.id)),
});

/**
 * METAS DIÁRIAS ROUTER
 */
const dailyGoalsRouter = router({
  getBySchedule: publicProcedure
    .input(z.object({ dailyScheduleId: z.number() }))
    .query(({ input }) => db.getDailyGoals(input.dailyScheduleId)),
  create: protectedProcedure
    .input(
      z.object({
        dailyScheduleId: z.number(),
        goalType: z.enum(["AREA", "TASKS", "PRODUCTIVITY", "CUSTOM"]),
        description: z.string(),
        targetValue: z.number(),
        unit: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(({ input }) => db.createDailyGoal(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().optional(),
        targetValue: z.number().optional(),
        achievedValue: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        isAchieved: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateDailyGoal(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteDailyGoal(input.id)),
});

/**
 * MEMBROS DA EQUIPE ROUTER
 */
const teamMembersRouter = router({
  getAll: publicProcedure.query(() => db.getAllTeamMembers()),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getTeamMemberById(input.id)),
  create: publicProcedure // Temporariamente público até OAuth configurado
    .input(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        specialty: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        avgProductivity: z.number().optional(),
      })
    )
    .mutation(({ input }) => db.createTeamMember(input)),
  update: publicProcedure // Temporariamente público até OAuth configurado
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        role: z.string().optional(),
        specialty: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        avgProductivity: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateTeamMember(id, data);
    }),
  delete: publicProcedure // Temporariamente público até OAuth configurado
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteTeamMember(input.id)),
});

/**
 * MATERIAIS ROUTER
 */
const materialsRouter = router({
  getAll: publicProcedure.query(() => db.getAllMaterials()),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getMaterialById(input.id)),
  create: publicProcedure // Temporariamente público até OAuth configurado
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        type: z.string().optional(),
        brand: z.string().optional(),
        unit: z.string(),
        costPerUnit: z.number().optional(),
        quantityInStock: z.number().optional(),
        minStockLevel: z.number().optional(),
        yieldPerUnit: z.number().optional(),
        color: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.createMaterial(input)),
  update: publicProcedure // Temporariamente público até OAuth configurado
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        type: z.string().optional(),
        brand: z.string().optional(),
        unit: z.string().optional(),
        costPerUnit: z.number().optional(),
        quantityInStock: z.number().optional(),
        minStockLevel: z.number().optional(),
        yieldPerUnit: z.number().optional(),
        color: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateMaterial(id, data);
    }),
  delete: publicProcedure // Temporariamente público até OAuth configurado
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteMaterial(input.id)),
});

/**
 * CONSUMO DE MATERIAIS ROUTER
 */
const materialConsumptionsRouter = router({
  getByTask: publicProcedure
    .input(z.object({ detailedTaskId: z.number() }))
    .query(({ input }) => db.getMaterialConsumptions(input.detailedTaskId)),
  record: protectedProcedure
    .input(
      z.object({
        detailedTaskId: z.number(),
        materialId: z.number(),
        plannedQuantity: z.number().optional(),
        actualQuantity: z.number(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.recordMaterialConsumption(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        actualQuantity: z.number().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateMaterialConsumption(id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteMaterialConsumption(input.id)),
});

/**
 * ALOCAÇÃO DE EQUIPE ROUTER
 */
const taskTeamAllocationsRouter = router({
  getByTask: publicProcedure
    .input(z.object({ detailedTaskId: z.number() }))
    .query(({ input }) => db.getTaskTeamAllocations(input.detailedTaskId)),
  allocate: protectedProcedure
    .input(
      z.object({
        detailedTaskId: z.number(),
        teamMemberId: z.number(),
        role: z.string().optional(),
        hoursAllocated: z.number().optional(),
      })
    )
    .mutation(({ input }) => db.allocateTeamMember(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        role: z.string().optional(),
        hoursAllocated: z.number().optional(),
        hoursWorked: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateTeamAllocation(id, data);
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.removeTeamAllocation(input.id)),
});

/**
 * RELATÓRIOS E ANÁLISES ROUTER
 */
const reportsRouter = router({
  workProgress: publicProcedure
    .input(z.object({ workId: z.number() }))
    .query(({ input }) => db.calculateWorkProgress(input.workId)),
  dailyReport: publicProcedure
    .input(z.object({ workId: z.number(), date: z.string() }))
    .query(({ input }) => db.generateDailyReport(input.workId, input.date)),
  estimateCompletion: publicProcedure
    .input(z.object({ workId: z.number() }))
    .query(({ input }) => db.estimateCompletionDate(input.workId)),
  rescheduleIncomplete: protectedProcedure
    .input(z.object({ workId: z.number(), fromDate: z.string() }))
    .mutation(({ input }) => db.rescheduleIncompleteTasks(input.workId, input.fromDate)),
});

/**
 * EQUIPAMENTOS DAS ETAPAS ROUTER - PASSO 6
 */
const stepEquipmentsRouter = router({
  getByStep: publicProcedure
    .input(z.object({ stepId: z.number() }))
    .query(({ input }) => db.getStepEquipmentsByStepId(input.stepId)),
  add: protectedProcedure
    .input(
      z.object({
        stepId: z.number(),
        equipmentId: z.number(),
        quantity: z.number().default(1),
        required: z.boolean().default(true),
      })
    )
    .mutation(({ input }) => db.addStepEquipment(input)),
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.removeStepEquipment(input.id)),
});

/**
 * MATERIAIS DAS ETAPAS ROUTER - PASSO 6
 */
const stepMaterialsRouter = router({
  getByStep: publicProcedure
    .input(z.object({ stepId: z.number() }))
    .query(({ input }) => db.getStepMaterialsByStepId(input.stepId)),
  add: protectedProcedure
    .input(
      z.object({
        stepId: z.number(),
        materialId: z.number().optional(),
        materialName: z.string(),
        quantity: z.number(),
        unit: z.string(),
        required: z.boolean().default(true),
      })
    )
    .mutation(({ input }) => db.addStepMaterial(input)),
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.removeStepMaterial(input.id)),
});

/**
 * RASCUNHOS DE OBRAS ROUTER - NOVO
 */
const workDraftsRouter = router({
  getLatest: publicProcedure.query(() => db.getLatestWorkDraft()),
  create: publicProcedure
    .input(
      z.object({
        formData: z.string(),
        currentStep: z.number(),
      })
    )
    .mutation(({ input }) => db.createWorkDraft(input)),
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        formData: z.string().optional(),
        currentStep: z.number().optional(),
        status: z.enum(["draft", "completed", "abandoned"]).optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateWorkDraft(id, data);
    }),
  delete: publicProcedure
    .input(z.number())
    .mutation(({ input }) => db.deleteWorkDraft(input)),
});

/**
 * MAIN APP ROUTER
 */
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feature routers - Foco em tarefas diárias e cronograma dinâmico
  works: worksRouter,
  workDrafts: workDraftsRouter,
  equipments: equipmentsRouter,
  epis: episRouter,
  dailyTasks: dailyTasksRouter,
  taskEquipments: taskEquipmentsRouter,
  schedule: scheduleRouter,
  productivity: productivityRouter,
  alerts: alertsRouter,

  // NOVO: Sistema detalhado de classes e tarefas
  taskClasses: taskClassesRouter,
  taskSubclasses: taskSubclassesRouter,
  taskSteps: taskStepsRouter,
  detailedTasks: detailedTasksRouter,
  stepExecutions: stepExecutionsRouter,

  // NOVO: Cronogramas diários e Kanban
  dailySchedules: dailySchedulesRouter,
  scheduledTasks: scheduledTasksRouter,
  dailyGoals: dailyGoalsRouter,

  // NOVO: Equipe e materiais
  teamMembers: teamMembersRouter,
  materials: materialsRouter,
  materialConsumptions: materialConsumptionsRouter,
  taskTeamAllocations: taskTeamAllocationsRouter,

  // NOVO: Relatórios e análises
  reports: reportsRouter,
  
  // NOVO: Equipamentos e materiais das etapas (PASSO 6)
  stepEquipments: stepEquipmentsRouter,
  stepMaterials: stepMaterialsRouter,
  
  // NOVO: Catalog
  catalog: router({
    getUsageToday: publicProcedure
      .input(z.object({ 
        workId: z.number(),
        date: z.string() 
      }))
      .query(async ({ input }) => {
        return db.getUsageToday(input.workId, input.date);
      })
  }),
});

export type AppRouter = typeof appRouter;
