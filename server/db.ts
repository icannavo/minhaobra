import { eq, and, desc } from "drizzle-orm";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  InsertUser,
  users,
  works,
  equipments,
  dailyTasks,
  taskEquipments,
  scheduleItems,
  productivityHistory,
  alerts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const sqlite = new Database("./database.sqlite");
      _db = drizzle(sqlite);
      console.log("[Database] SQLite conectado");
    } catch (error) {
      console.error("[Database] Erro SQLite:", error);
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
