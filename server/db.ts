import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  InsertUser,
  users,
  works,
  type InsertEquipment,
  type Equipment,
  equipments,
  type InsertEpi,
  type Epi,
  epis,
  type InsertDailyTask,
  dailyTasks,
  taskEquipments,
  scheduleItems,
  productivityHistory,
  alerts,
  taskClasses,
  taskSubclasses,
  taskSteps,
  stepEquipments,
  stepMaterials,
  detailedTasks,
  stepExecutions,
  dailySchedules,
  scheduledTasks,
  dailyGoals,
  teamMembers,
  taskTeamAllocations,
  materials,
  materialConsumptions,
  changeLogs,
  workDrafts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      // Se estiver na Vercel ou tiver TURSO_URL configurado, usa libSQL remoto
      const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
      const tursoToken = process.env.TURSO_AUTH_TOKEN;
      
      if (tursoUrl && tursoUrl.startsWith('libsql://')) {
        console.log("[Database] Conectando ao Turso (libSQL remoto)...");
        const client = createClient({
          url: tursoUrl,
          authToken: tursoToken,
        });
        _db = drizzle(client);
        console.log("[Database] Turso conectado com sucesso");
      } else {
        // Fallback para SQLite local em desenvolvimento
        console.log("[Database] Usando SQLite local (file:./database.sqlite)...");
        const client = createClient({
          url: "file:./database.sqlite"
        });
        _db = drizzle(client);
        console.log("[Database] SQLite local conectado");
      }
    } catch (error) {
      console.error("[Database] Erro ao conectar:", error);
      _db = null;
    }
  }
  
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * OBRAS
 */
export async function getAllWorks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(works).orderBy(desc(works.createdAt));
}

export async function getWorkById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(works).where(eq(works.id, id)).limit(1);
  return result[0] || null;
}

export async function createWork(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(works).values(data);
}

/**
 * EQUIPAMENTOS
 */
export async function getAllEquipments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(equipments).orderBy(equipments.category);
}

export async function createEquipment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(equipments).values(data);
}

/**
 * TAREFAS DIÁRIAS - FOCO PRINCIPAL
 */
export async function getDailyTasksByDate(date: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailyTasks)
    .where(eq(dailyTasks.date, date as any))
    .orderBy(dailyTasks.taskName);
}

export async function getDailyTasksByWork(workId: number, date?: string) {
  const db = await getDb();
  if (!db) return [];

  if (date) {
    return db
      .select()
      .from(dailyTasks)
      .where(and(eq(dailyTasks.workId, workId), eq(dailyTasks.date, date as any)))
      .orderBy(dailyTasks.taskName);
  }

  return db
    .select()
    .from(dailyTasks)
    .where(eq(dailyTasks.workId, workId))
    .orderBy(desc(dailyTasks.date));
}

export async function createDailyTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calcular desvio automaticamente
  const deviation = Number(data.completedArea || 0) - Number(data.targetArea || 0);

  return db.insert(dailyTasks).values({
    ...data,
    deviation,
  });
}

export async function updateDailyTask(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let updateData = { ...data };

  // Recalcular desvio se completedArea foi alterado
  if (data.completedArea !== undefined) {
    const task = await db.select().from(dailyTasks).where(eq(dailyTasks.id, id));
    if (task.length > 0) {
      const targetArea = data.targetArea || task[0].targetArea;
      updateData.deviation = Number(data.completedArea) - Number(targetArea || 0);
    }
  }

  return db.update(dailyTasks).set(updateData).where(eq(dailyTasks.id, id));
}

/**
 * TAREFAS-EQUIPAMENTOS
 */
export async function getEquipmentsByTask(taskId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(taskEquipments)
    .where(eq(taskEquipments.taskId, taskId));
}

export async function addEquipmentToTask(taskId: number, equipmentId: number, quantity: number = 1, hoursNeeded?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(taskEquipments).values({
    taskId,
    equipmentId,
    quantity,
    hoursNeeded: hoursNeeded ? parseFloat(hoursNeeded) : undefined,
  });
}

/**
 * CRONOGRAMA DINÂMICO
 */
export async function getScheduleByWork(workId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(scheduleItems)
    .where(eq(scheduleItems.workId, workId))
    .orderBy(scheduleItems.date);
}

export async function getScheduleByDate(workId: number, date: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(scheduleItems)
    .where(and(eq(scheduleItems.workId, workId), eq(scheduleItems.date, date as any)));
}

export async function createScheduleItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(scheduleItems).values(data);
}

export async function updateScheduleItem(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let updateData = { ...data };

  // Calcular produtividade real se actualArea foi atualizada
  if (data.actualArea !== undefined && data.numberOfEmployees) {
    updateData.actualProductivity = Number(data.actualArea) / Number(data.numberOfEmployees);
  }

  return db.update(scheduleItems).set(updateData).where(eq(scheduleItems.id, id));
}

/**
 * HISTÓRICO DE PRODUTIVIDADE
 */
export async function getProductivityHistory(workId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productivityHistory)
    .where(eq(productivityHistory.workId, workId))
    .orderBy(desc(productivityHistory.date));
}

export async function createProductivityRecord(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calcular desvio e produtividade
  const deviation = Number(data.completedArea || 0) - Number(data.targetArea || 0);
  const deviationPercent = data.targetArea ? (deviation / Number(data.targetArea)) * 100 : 0;
  const productivity = data.numberOfEmployees ? Number(data.completedArea || 0) / data.numberOfEmployees : 0;

  return db.insert(productivityHistory).values({
    ...data,
    deviation,
    deviationPercent,
    productivity,
  });
}

/**
 * ALERTAS
 */
export async function getAllAlerts(unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];

  if (unreadOnly) {
    return db
      .select()
      .from(alerts)
      .where(eq(alerts.isRead, false))
      .orderBy(desc(alerts.createdAt));
  }

  return db.select().from(alerts).orderBy(desc(alerts.createdAt));
}

export async function createAlert(alertData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(alerts).values(alertData);
}

export async function markAlertAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
}

/**
 * LÓGICA DE CRONOGRAMA DINÂMICO
 * Redistribui tarefas não concluídas para os próximos dias
 */
export async function redistributeUncompletedTasks(workId: number, date: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar tarefas não concluídas do dia
  const incompleteTasks = await db
    .select()
    .from(dailyTasks)
    .where(
      and(
        eq(dailyTasks.workId, workId),
        eq(dailyTasks.date, date as any),
        eq(dailyTasks.isCompleted, false)
      )
    );

  // Para cada tarefa não concluída, criar entrada no cronograma para o próximo dia
  for (const task of incompleteTasks) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
const nextDateStr = nextDate.toISOString().slice(0, 10);
    // Criar nova tarefa para o próximo dia com a área não concluída
    const remainingArea = Number(task.targetArea || 0) - Number(task.completedArea || 0);

    if (remainingArea > 0) {
      await db.insert(scheduleItems).values({
        workId,
        date: nextDateStr as any,
        taskName: `${task.taskName} (Redistribuído)`,
        plannedArea: remainingArea,        
        numberOfEmployees:
        task.numberOfEmployees ?? 1,
          status: "Planejado",
      });
    }
  }
}

/**
 * CALCULAR PRÓXIMAS DATAS BASEADO EM PRODUTIVIDADE
 */
export async function calculateNextSchedule(workId: number, currentDate: string) {
  const db = await getDb();
  if (!db) return [];

  // Buscar histórico de produtividade para calcular média
  const history = await db
    .select()
    .from(productivityHistory)
    .where(eq(productivityHistory.workId, workId));

  if (history.length === 0) return [];

  // Calcular produtividade média
  const avgProductivity = history.reduce((sum, h) => sum + Number(h.productivity || 0), 0) / history.length;

  // Buscar próximas tarefas planejadas
  const upcomingSchedule = await db
    .select()
    .from(scheduleItems)
    .where(
      and(
        eq(scheduleItems.workId, workId),
        eq(scheduleItems.status, "Planejado" as any)
      )
    )
    .orderBy(scheduleItems.date);

  // Recalcular datas baseado em produtividade real
  let currentScheduleDate = new Date(currentDate);

  return upcomingSchedule.map((item) => {
    const plannedArea = Number(item.plannedArea || 0);
    const employees = item.numberOfEmployees || 1;
    const daysNeeded = Math.ceil(plannedArea / (avgProductivity * employees));

    currentScheduleDate.setDate(currentScheduleDate.getDate() + daysNeeded);

    return {
      ...item,
      recalculatedDate: currentScheduleDate.toISOString().split("T")[0],
      estimatedDays: daysNeeded,
    };
  });
}


/**
 * ========================================
 * CLASSES E SUBCLASSES DE TAREFAS
 * ========================================
 */

/**
 * TASK CLASSES - Classes de tarefas (templates)
 */
export async function getAllTaskClasses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskClasses).orderBy(taskClasses.category, taskClasses.name);
}

export async function getTaskClassById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(taskClasses).where(eq(taskClasses.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTaskClass(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(taskClasses).values(data);
}

export async function updateTaskClass(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(taskClasses).set(data).where(eq(taskClasses.id, id));
}

export async function deleteTaskClass(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(taskClasses).where(eq(taskClasses.id, id));
}

/**
 * TASK SUBCLASSES - Subclasses (variações) de tarefas
 */
export async function getSubclassesByClass(classId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskSubclasses).where(eq(taskSubclasses.classId, classId));
}

export async function getTaskSubclassById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(taskSubclasses).where(eq(taskSubclasses.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTaskSubclass(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(taskSubclasses).values(data);
}

export async function updateTaskSubclass(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(taskSubclasses).set(data).where(eq(taskSubclasses.id, id));
}

export async function deleteTaskSubclass(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(taskSubclasses).where(eq(taskSubclasses.id, id));
}

/**
 * TASK STEPS - Etapas detalhadas de uma subclasse
 */
export async function getStepsBySubclass(subclassId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskSteps).where(eq(taskSteps.subclassId, subclassId)).orderBy(taskSteps.stepOrder);
}

export async function getTaskStepById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(taskSteps).where(eq(taskSteps.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTaskStep(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(taskSteps).values(data);
}

export async function updateTaskStep(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(taskSteps).set(data).where(eq(taskSteps.id, id));
}

export async function deleteTaskStep(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(taskSteps).where(eq(taskSteps.id, id));
}

/**
 * STEP EQUIPMENTS - Equipamentos por etapa
 */
export async function getEquipmentsByStep(stepId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stepEquipments).where(eq(stepEquipments.stepId, stepId));
}

export async function addEquipmentToStep(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(stepEquipments).values(data);
}

export async function removeEquipmentFromStep(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(stepEquipments).where(eq(stepEquipments.id, id));
}

/**
 * STEP MATERIALS - Materiais por etapa
 */
export async function getMaterialsByStep(stepId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stepMaterials).where(eq(stepMaterials.stepId, stepId));
}

export async function addMaterialToStep(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(stepMaterials).values(data);
}

export async function removeMaterialFromStep(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(stepMaterials).where(eq(stepMaterials.id, id));
}

/**
 * DETAILED TASKS - Tarefas detalhadas com breakdown completo
 */
export async function getDetailedTasksByWork(workId: number, date?: string) {
  const db = await getDb();
  if (!db) return [];

  if (date) {
    return db
      .select()
      .from(detailedTasks)
      .where(and(eq(detailedTasks.workId, workId), eq(detailedTasks.date, date as any)))
      .orderBy(detailedTasks.taskName);
  }

  return db
    .select()
    .from(detailedTasks)
    .where(eq(detailedTasks.workId, workId))
    .orderBy(desc(detailedTasks.date));
}

export async function getDetailedTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(detailedTasks).where(eq(detailedTasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createDetailedTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Calcular tempo total estimado baseado nas etapas
  const steps = await getStepsBySubclass(data.subclassId);
  let totalMinutes = 0;
  
  for (const step of steps) {
    let stepTime = step.baseTimeMinutes || 0;
    
    // Calcular tempo baseado no tipo
    switch (step.timeCalculationType) {
      case "PER_M2":
        stepTime = (data.area || 0) * (step.timeCalculationValue || 0);
        break;
      case "PER_FLOOR":
        stepTime = (data.floors || 1) * (step.timeCalculationValue || 0);
        break;
      case "PERCENTAGE_EXECUTION":
        // Será calculado depois que soubermos o tempo de execução
        break;
      default:
        stepTime = step.baseTimeMinutes || 0;
    }
    
    // Adicionar tempo de cooldown se necessário
    if (step.requiresCooldown && step.maxContinuousMinutes !== null && step.maxContinuousMinutes > 0) {
      const cycles = Math.ceil(stepTime / step.maxContinuousMinutes);
      totalMinutes += stepTime + (cycles - 1) * (step.cooldownMinutes || 0);
    } else {
      totalMinutes += stepTime;
    }
  }
  
  return db.insert(detailedTasks).values({
    ...data,
    estimatedTotalMinutes: Math.ceil(totalMinutes),
    completedSteps: JSON.stringify([]),
  });
}

export async function updateDetailedTask(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(detailedTasks).set(data).where(eq(detailedTasks.id, id));
}

export async function deleteDetailedTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(detailedTasks).where(eq(detailedTasks.id, id));
}

/**
 * STEP EXECUTIONS - Registro de execução de etapas
 */
export async function getExecutionsByTask(detailedTaskId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(stepExecutions)
    .where(eq(stepExecutions.detailedTaskId, detailedTaskId))
    .orderBy(stepExecutions.createdAt);
}

export async function startStepExecution(detailedTaskId: number, stepId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(stepExecutions).values({
    detailedTaskId,
    stepId,
    startTime: new Date(),
    status: "Em Execução" as any,
  });
}

export async function completeStepExecution(executionId: number, notes?: string, issues?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Buscar a execução para calcular duração
  const execution = await db.select().from(stepExecutions).where(eq(stepExecutions.id, executionId)).limit(1);
  if (execution.length === 0) throw new Error("Execution not found");
  
  const startTime = execution[0].startTime;
  const endTime = new Date();
  const durationMinutes = startTime ? Math.floor((endTime.getTime() - new Date(startTime).getTime()) / 60000) : 0;
  
  return db.update(stepExecutions).set({
    endTime,
    durationMinutes,
    status: "Concluído" as any,
    notes,
    issues,
  }).where(eq(stepExecutions.id, executionId));
}

/**
 * CÁLCULO DE MATERIAIS E EQUIPAMENTOS PARA UMA TAREFA
 */
export async function calculateTaskRequirements(subclassId: number, area: number, floors: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const steps = await getStepsBySubclass(subclassId);
  
  const requirements = {
    equipments: [] as any[],
    materials: [] as any[],
    totalTime: 0,
    breakdown: [] as any[],
  };
  
  for (const step of steps) {
    // Calcular tempo
    let stepTime = step.baseTimeMinutes || 0;
    
    switch (step.timeCalculationType) {
      case "PER_M2":
        stepTime = area * (step.timeCalculationValue || 0);
        break;
      case "PER_FLOOR":
        stepTime = floors * (step.timeCalculationValue || 0);
        break;
      default:
        stepTime = step.baseTimeMinutes || 0;
    }
    
    if (step.requiresCooldown && step.maxContinuousMinutes !== null && step.maxContinuousMinutes > 0) {
      const cycles = Math.ceil(stepTime / step.maxContinuousMinutes);
      stepTime += (cycles - 1) * (step.cooldownMinutes || 0);
    }
    
    requirements.totalTime += stepTime;
    
    // Buscar equipamentos
    const stepEquips = await getEquipmentsByStep(step.id);
    for (const eq of stepEquips) {
      requirements.equipments.push({
        ...eq,
        stepName: step.name,
      });
    }
    
    // Buscar materiais
    const stepMats = await getMaterialsByStep(step.id);
    for (const mat of stepMats) {
      let quantity = mat.quantity || 0;
      
      switch (mat.calculationType) {
        case "PER_M2":
          quantity = area * (mat.quantity || 0);
          break;
        case "PER_FLOOR":
          quantity = floors * (mat.quantity || 0);
          break;
      }
      
      requirements.materials.push({
        ...mat,
        calculatedQuantity: quantity,
        stepName: step.name,
      });
    }
    
    requirements.breakdown.push({
      stepName: step.name,
      stepType: step.stepType,
      timeMinutes: Math.ceil(stepTime),
      requiresCooldown: step.requiresCooldown,
    });
  }
  
  return requirements;
}


/**
 * ========================================
 * OBRAS - CRUD COMPLETO
 * ========================================
 */

export async function updateWork(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(works).set(data).where(eq(works.id, id));
}

export async function deleteWork(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(works).where(eq(works.id, id));
}

/**
 * ========================================
 * EQUIPAMENTOS - CRUD COMPLETO
 * ========================================
 */

export async function getEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(equipments).where(eq(equipments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateEquipment(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(equipments).set(data).where(eq(equipments.id, id));
}

export async function deleteEquipment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(equipments).where(eq(equipments.id, id));
}

/**
 * ========================================
 * EPIS - CRUD
 * ========================================
 */
export async function getAllEpis() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(epis).orderBy(epis.category);
}

export async function getEpiById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(epis).where(eq(epis.id, id));
  return result[0] || null;
}

export async function createEpi(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(epis).values(data);
}

export async function updateEpi(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(epis).set(data).where(eq(epis.id, id));
}

export async function deleteEpi(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(epis).where(eq(epis.id, id));
}

/**
 * ========================================
 * CRONOGRAMAS DIÁRIOS - NOVO SISTEMA
 * ========================================
 */

export async function getDailyScheduleByDate(workId: number, date: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(dailySchedules)
    .where(and(eq(dailySchedules.workId, workId), eq(dailySchedules.date, date as any)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getDailySchedulesByWork(workId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailySchedules)
    .where(eq(dailySchedules.workId, workId))
    .orderBy(desc(dailySchedules.date));
}

export async function createDailySchedule(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(dailySchedules).values(data);
}

export async function updateDailySchedule(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(dailySchedules).set(data).where(eq(dailySchedules.id, id));
}

export async function deleteDailySchedule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(dailySchedules).where(eq(dailySchedules.id, id));
}

/**
 * Gerar cronograma diário automaticamente
 */
export async function generateDailySchedule(workId: number, date: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar todas as tarefas deste dia
  const tasks = await getDetailedTasksByWork(workId, date);

  // Calcular totais
  const totalTasks = tasks.length;
  const totalEstimatedMinutes = tasks.reduce((sum, t: any) => sum + (t.estimatedTotalMinutes || 0), 0);
  const completedTasks = tasks.filter((t: any) => t.status === "Concluído").length;
  const totalActualMinutes = tasks.reduce((sum, t: any) => sum + (t.actualTotalMinutes || 0), 0);
  const targetArea = tasks.reduce((sum, t: any) => sum + (t.area || 0), 0);

  // Verificar se já existe
  const existing = await getDailyScheduleByDate(workId, date);

  if (existing) {
    // Atualizar
    return updateDailySchedule(existing.id, {
      totalTasks,
      completedTasks,
      totalEstimatedMinutes,
      totalActualMinutes,
      targetArea,
      status: completedTasks === totalTasks && totalTasks > 0 ? "Concluído" : 
              completedTasks > 0 ? "Parcialmente Concluído" : 
              totalTasks > 0 ? "Em Andamento" : "Planejado",
    });
  } else {
    // Criar novo
    return createDailySchedule({
      workId,
      date,
      totalTasks,
      completedTasks,
      totalEstimatedMinutes,
      totalActualMinutes,
      targetArea,
      completedArea: 0,
      status: "Planejado",
    });
  }
}

/**
 * ========================================
 * TAREFAS AGENDADAS - KANBAN
 * ========================================
 */

export async function getScheduledTasksByDay(dailyScheduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(scheduledTasks)
    .where(eq(scheduledTasks.dailyScheduleId, dailyScheduleId))
    .orderBy(scheduledTasks.scheduledStartTime, scheduledTasks.slotOrder);
}

export async function createScheduledTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(scheduledTasks).values(data);
}

export async function updateScheduledTask(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(scheduledTasks).set(data).where(eq(scheduledTasks.id, id));
}

export async function deleteScheduledTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(scheduledTasks).where(eq(scheduledTasks.id, id));
}

export async function getScheduledTasksByDate(workId: number, date: string) {
  const db = await getDb();
  if (!db) return [];
  
  const dailyScheduleResult = await db
    .select({ id: dailySchedules.id })
    .from(dailySchedules)
    .where(and(eq(dailySchedules.workId, workId), eq(dailySchedules.date, date)))
    .limit(1);
  
  if (dailyScheduleResult.length === 0) return [];
  
  const scheduleId = dailyScheduleResult[0].id;
  return db
    .select()
    .from(scheduledTasks)
    .where(eq(scheduledTasks.dailyScheduleId, scheduleId));
}

/**
 * PASSO 22: Confirmar Planejamento do Próximo Dia
 * Cria um daily_schedule e todas as scheduled_tasks de uma vez
 */
export async function confirmDailyPlanning(
  workId: number,
  date: string,
  scheduledTasksData: Array<{ detailedTaskId: number; scheduledStartTime: string; slotOrder: number }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 1. Verificar se já existe um daily_schedule para esta data
  let dailySchedule = await getDailyScheduleByDate(workId, date);

  // 2. Se não existir, criar um novo
  if (!dailySchedule) {
    const result = await db.insert(dailySchedules).values({
      workId,
      date,
      status: "Planejado",
      totalTasks: scheduledTasksData.length,
      completedTasks: 0,
      totalEstimatedMinutes: 0, // Será atualizado depois
      totalActualMinutes: 0,
      targetArea: 0, // Será atualizado depois
      completedArea: 0,
    });

    // Buscar o schedule recém-criado
    dailySchedule = await getDailyScheduleByDate(workId, date);
    if (!dailySchedule) throw new Error("Failed to create daily schedule");
  }

  // 3. Deletar scheduled_tasks antigas (se existir alguma)
  await db.delete(scheduledTasks).where(eq(scheduledTasks.dailyScheduleId, dailySchedule.id));

  // 4. Criar as novas scheduled_tasks
  const tasksToInsert = scheduledTasksData.map((task) => ({
    dailyScheduleId: dailySchedule!.id,
    detailedTaskId: task.detailedTaskId,
    scheduledStartTime: task.scheduledStartTime,
    slotOrder: task.slotOrder,
    status: "Agendado" as const,
  }));

  if (tasksToInsert.length > 0) {
    await db.insert(scheduledTasks).values(tasksToInsert);
  }

  // 5. Calcular totais e atualizar o daily_schedule
  let totalEstimatedMinutes = 0;
  let targetArea = 0;

  for (const taskData of scheduledTasksData) {
    const detailedTask = await getDetailedTaskById(taskData.detailedTaskId);
    if (detailedTask) {
      totalEstimatedMinutes += detailedTask.estimatedTotalMinutes || 0;
      targetArea += detailedTask.area || 0;
    }
  }

  await db
    .update(dailySchedules)
    .set({
      totalTasks: scheduledTasksData.length,
      totalEstimatedMinutes,
      targetArea,
      status: "Planejado",
    })
    .where(eq(dailySchedules.id, dailySchedule.id));

  return {
    success: true,
    dailyScheduleId: dailySchedule.id,
    tasksScheduled: scheduledTasksData.length,
  };
}

export async function getStepEquipmentsByStepId(stepId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select({
      id: stepEquipments.id,
      stepId: stepEquipments.stepId,
      equipmentId: stepEquipments.equipmentId,
      quantity: stepEquipments.quantity,
      required: stepEquipments.required,
      equipment: equipments,
    })
    .from(stepEquipments)
    .leftJoin(equipments, eq(stepEquipments.equipmentId, equipments.id))
    .where(eq(stepEquipments.stepId, stepId));
    
  return results;
}

export async function getStepMaterialsByStepId(stepId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(stepMaterials)
    .where(eq(stepMaterials.stepId, stepId));
}

export async function getTaskTeamAllocations(detailedTaskId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(taskTeamAllocations)
    .where(eq(taskTeamAllocations.detailedTaskId, detailedTaskId));
}

export async function getUsageToday(workId: number, date: string) {
  const db = await getDb();
  if (!db) {
    return {
      equipmentsInUse: [],
      materialsInUse: [],
      teamInUse: []
    };
  }
  
  const scheduled = await getScheduledTasksByDate(workId, date);
  const equipmentIds = new Set<number>();
  const materialIds = new Set<number>();
  const teamMemberIds = new Set<number>();
  
  for (const st of scheduled) {
    // Get detailed task
    const detailedTask = await db
      .select()
      .from(detailedTasks)
      .where(eq(detailedTasks.id, st.detailedTaskId))
      .limit(1);
    
    if (detailedTask.length === 0) continue;
    
    // Get all steps for this task's class/subclass
    const steps = await db
      .select()
      .from(taskSteps)
      .where(eq(taskSteps.subclassId, detailedTask[0].subclassId));
    
    // Get equipment from each step
    for (const step of steps) {
      const stepEquips = await getStepEquipmentsByStepId(step.id);
      stepEquips.forEach(se => equipmentIds.add(se.equipmentId));
    }
    
    // Get materials from each step
    for (const step of steps) {
      const stepMats = await getStepMaterialsByStepId(step.id);
      // For materials, we can track by name/category or we need to map to material IDs
      // For now, we'll just add dummy logic as we might need material ID mapping
      // stepMats.forEach(sm => materialIds.add(sm.id)); - but stepMaterials doesn't have materialId, only materialName
    }
    
    // Get team allocations
    const teamAllocations = await getTaskTeamAllocations(st.detailedTaskId);
    teamAllocations.forEach(ta => ta.teamMemberId && teamMemberIds.add(ta.teamMemberId));
  }
  
  return {
    equipmentsInUse: Array.from(equipmentIds),
    materialsInUse: Array.from(materialIds),
    teamInUse: Array.from(teamMemberIds)
  };
}

/**
 * ========================================
 * METAS DIÁRIAS
 * ========================================
 */

export async function getDailyGoals(dailyScheduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailyGoals)
    .where(eq(dailyGoals.dailyScheduleId, dailyScheduleId))
    .orderBy(desc(dailyGoals.priority));
}

export async function createDailyGoal(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(dailyGoals).values(data);
}

export async function updateDailyGoal(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(dailyGoals).set(data).where(eq(dailyGoals.id, id));
}

export async function deleteDailyGoal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(dailyGoals).where(eq(dailyGoals.id, id));
}

/**
 * ========================================
 * MEMBROS DA EQUIPE
 * ========================================
 */

export async function getAllTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers).where(eq(teamMembers.isActive, true)).orderBy(teamMembers.name);
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTeamMember(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(teamMembers).values(data);
}

export async function updateTeamMember(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(teamMembers).where(eq(teamMembers.id, id));
}

/**
 * ========================================
 * MATERIAIS
 * ========================================
 */

export async function getAllMaterials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materials).orderBy(materials.category, materials.name);
}

export async function getMaterialById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createMaterial(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(materials).values(data);
}

export async function updateMaterial(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(materials).set(data).where(eq(materials.id, id));
}

export async function deleteMaterial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(materials).where(eq(materials.id, id));
}

/**
 * ========================================
 * CONSUMO DE MATERIAIS
 * ========================================
 */

export async function getMaterialConsumptions(detailedTaskId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(materialConsumptions)
    .where(eq(materialConsumptions.detailedTaskId, detailedTaskId));
}

export async function recordMaterialConsumption(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(materialConsumptions).values(data);
}

export async function updateMaterialConsumption(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(materialConsumptions).set(data).where(eq(materialConsumptions.id, id));
}

export async function deleteMaterialConsumption(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(materialConsumptions).where(eq(materialConsumptions.id, id));
}

/**
 * ========================================
 * FUNÇÕES AUXILIARES PARA RELATÓRIOS E CÁLCULOS
 * ========================================
 */

/**
 * Calcula o progresso geral de uma obra baseado na área concluída
 */
export async function calculateWorkProgress(workId: number) {
  const db = await getDb();
  if (!db) return { percentage: 0, totalArea: 0, completedArea: 0 };

  // Buscar todas as tarefas detalhadas da obra
  const tasks = await db
    .select()
    .from(detailedTasks)
    .where(eq(detailedTasks.workId, workId));

  const totalArea = tasks.reduce((sum: number, t: any) => sum + (Number(t.area) || 0), 0);
  
  // Área concluída = soma de áreas das tarefas concluídas
  const completedArea = tasks
    .filter((t: any) => t.status === "Concluído")
    .reduce((sum: number, t: any) => sum + (Number(t.area) || 0), 0);

  const percentage = totalArea > 0 ? (completedArea / totalArea) * 100 : 0;

  return {
    percentage: Math.round(percentage * 100) / 100,
    totalArea,
    completedArea,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t: any) => t.status === "Concluído").length,
  };
}

/**
 * Reagendar tarefas não concluídas para o próximo dia disponível
 */
export async function rescheduleIncompleteTasks(workId: number, fromDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar tarefas não concluídas do dia especificado
  const incompleteTasks = await db
    .select()
    .from(detailedTasks)
    .where(
      and(
        eq(detailedTasks.workId, workId),
        eq(detailedTasks.date, fromDate as any),
        eq(detailedTasks.status, "Em Execução" as any)
      )
    );

  // Calcular próximo dia
  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = nextDate.toISOString().slice(0, 10);

  // Mover cada tarefa para o próximo dia
  for (const task of incompleteTasks) {
    await db.update(detailedTasks)
      .set({
        date: nextDateStr as any,
        status: "Adiado" as any,
      })
      .where(eq(detailedTasks.id, task.id));

    // Criar alerta
    await createAlert({
      workId,
      type: "TAREFA_ATRASADA",
      title: "Tarefa Reagendada",
      message: `A tarefa "${task.taskName}" foi reagendada de ${fromDate} para ${nextDateStr}`,
      severity: "warning",
    });
  }

  return incompleteTasks.length;
}

/**
 * Gera relatório diário com resumo das tarefas
 */
export async function generateDailyReport(workId: number, date: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar cronograma do dia
  const schedule = await getDailyScheduleByDate(workId, date);
  
  // Buscar todas as tarefas do dia
  const tasks = await getDetailedTasksByWork(workId, date);

  // Calcular estatísticas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "Concluído").length;
  const inProgressTasks = tasks.filter((t: any) => t.status === "Em Execução" || t.status === "Em Preparação").length;
  const pendingTasks = tasks.filter((t: any) => t.status === "Planejado").length;

  const targetArea = tasks.reduce((sum: number, t: any) => sum + (Number(t.area) || 0), 0);
  const completedArea = tasks
    .filter((t: any) => t.status === "Concluído")
    .reduce((sum: number, t: any) => sum + (Number(t.area) || 0), 0);

  const estimatedMinutes = tasks.reduce((sum: number, t: any) => sum + (t.estimatedTotalMinutes || 0), 0);
  const actualMinutes = tasks.reduce((sum: number, t: any) => sum + (t.actualTotalMinutes || 0), 0);

  // Buscar metas do dia
  const goals = schedule ? await getDailyGoals(schedule.id) : [];

  return {
    date,
    schedule,
    summary: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    },
    area: {
      target: targetArea,
      completed: completedArea,
      remaining: targetArea - completedArea,
      completionRate: targetArea > 0 ? (completedArea / targetArea) * 100 : 0,
    },
    time: {
      estimated: estimatedMinutes,
      actual: actualMinutes,
      variance: actualMinutes - estimatedMinutes,
    },
    goals,
    tasks,
  };
}

/**
 * Calcular estimativa de conclusão da obra baseada na produtividade recente
 */
export async function estimateCompletionDate(workId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar histórico recente (últimos 7 dias)
  const history = await db
    .select()
    .from(productivityHistory)
    .where(eq(productivityHistory.workId, workId))
    .orderBy(desc(productivityHistory.date))
    .limit(7);

  if (history.length === 0) return null;

  // Calcular produtividade média
  const avgProductivity = history.reduce((sum, h) => sum + (Number(h.productivity) || 0), 0) / history.length;

  // Buscar área restante
  const progress = await calculateWorkProgress(workId);
  const remainingArea = progress.totalArea - progress.completedArea;

  // Buscar obra para pegar número médio de funcionários
  const work = await getWorkById(workId);
  if (!work) return null;

  // Estimar dias necessários (assumindo mesmo número de funcionários)
  const tasks = await db.select().from(detailedTasks).where(eq(detailedTasks.workId, workId));
  const avgEmployees = tasks.length > 0 
    ? tasks.reduce((sum: number, t: any) => sum + (t.numberOfEmployees || 0), 0) / tasks.length 
    : 1;

  const daysNeeded = avgProductivity > 0 && avgEmployees > 0
    ? Math.ceil(remainingArea / (avgProductivity * avgEmployees))
    : 0;

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);

  return {
    remainingArea,
    avgProductivity,
    avgEmployees,
    daysNeeded,
    estimatedCompletionDate: estimatedDate.toISOString().slice(0, 10),
    originalEstimatedEnd: work.estimatedEndDate,
  };
}


/**
 * ========================================
 * RASCUNHOS DE OBRAS - NOVO
 * ========================================
 */

export async function getLatestWorkDraft() {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(workDrafts)
    .where(eq(workDrafts.status, "draft" as any))
    .orderBy(desc(workDrafts.lastSavedAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createWorkDraft(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(workDrafts).values({
    ...data,
    status: "draft",
  }).returning();
  return result[0];
}

export async function updateWorkDraft(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = {
    ...data,
    lastSavedAt: new Date(),
  };
  await db.update(workDrafts).set(updateData).where(eq(workDrafts.id, id));
  return { id, ...updateData };
}

export async function deleteWorkDraft(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(workDrafts).where(eq(workDrafts.id, id));
}
