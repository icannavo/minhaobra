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
});

/**
 * EQUIPAMENTOS ROUTER
 */
const equipmentsRouter = router({
  getAll: publicProcedure.query(() => db.getAllEquipments()),
  create: protectedProcedure
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
  equipments: equipmentsRouter,
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
});

export type AppRouter = typeof appRouter;
