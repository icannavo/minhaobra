/**
 * SISTEMA DE ALERTAS AUTOMÁTICOS
 * 
 * Este módulo contém funções helper para criar alertas baseados em triggers/condições
 * do sistema. Centraliza a lógica de alertas para facilitar manutenção.
 * 
 * PASSO 33: Sistema de Alertas Automáticos
 */

import * as db from "./db";

/**
 * Alerta: Material com estoque baixo
 * Chamado automaticamente após registrar consumo de material
 */
export async function checkMaterialStock(
  materialId: number,
  materialName: string,
  currentStock: number,
  minStock: number,
  unit: string,
  workId?: number
) {
  if (currentStock >= minStock) {
    return; // Estoque OK
  }

  // Determinar severidade
  let severity: "low" | "medium" | "high" | "critical";
  let title: string;
  
  if (currentStock === 0) {
    severity = "critical";
    title = "⚠️ ESTOQUE ZERADO";
  } else if (currentStock < minStock * 0.5) {
    severity = "high";
    title = "🔴 ESTOQUE CRÍTICO";
  } else {
    severity = "medium";
    title = "🟡 ESTOQUE BAIXO";
  }

  const message = `Material "${materialName}" está com estoque ${
    currentStock === 0 ? "zerado" : "baixo"
  }. Atual: ${currentStock} ${unit}, Mínimo: ${minStock} ${unit}`;

  await db.createAlert({
    workId,
    type: "MATERIAL_LOW_STOCK",
    title,
    message,
    severity,
    relatedId: materialId,
    metadata: {
      materialId,
      materialName,
      currentStock,
      minStock,
      unit,
      stockPercent: Math.round((currentStock / minStock) * 100),
    },
  });
}

/**
 * Alerta: EPI com estoque baixo
 * Similar ao material, mas para EPIs
 */
export async function checkEpiStock(
  epiId: number,
  epiName: string,
  currentStock: number,
  minStock: number,
  unit: string,
  workId?: number
) {
  if (currentStock >= minStock) {
    return;
  }

  let severity: "low" | "medium" | "high" | "critical";
  let title: string;
  
  if (currentStock === 0) {
    severity = "critical";
    title = "⚠️ EPI SEM ESTOQUE";
  } else if (currentStock < minStock * 0.5) {
    severity = "high";
    title = "🔴 EPI CRÍTICO";
  } else {
    severity = "medium";
    title = "🟡 EPI BAIXO";
  }

  const message = `EPI "${epiName}" está com estoque ${
    currentStock === 0 ? "zerado" : "baixo"
  }. Atual: ${currentStock} ${unit}, Mínimo: ${minStock} ${unit}`;

  await db.createAlert({
    workId,
    type: "EPI_LOW_STOCK",
    title,
    message,
    severity,
    relatedId: epiId,
    metadata: {
      epiId,
      epiName,
      currentStock,
      minStock,
      unit,
    },
  });
}

/**
 * Alerta: Tarefa demorou mais que o estimado
 * Chamado quando completar uma tarefa detalhada
 */
export async function checkTaskDelay(
  taskId: number,
  taskName: string,
  estimatedMinutes: number,
  actualMinutes: number,
  workId: number
) {
  // Apenas alerta se demorou mais de 20% do estimado
  const deviation = ((actualMinutes - estimatedMinutes) / estimatedMinutes) * 100;
  
  if (deviation <= 20) {
    return; // Dentro do aceitável
  }

  let severity: "low" | "medium" | "high" | "critical";
  let title: string;

  if (deviation > 100) {
    severity = "critical";
    title = "🚨 TAREFA MUITO ATRASADA";
  } else if (deviation > 50) {
    severity = "high";
    title = "🔴 TAREFA ATRASADA";
  } else {
    severity = "medium";
    title = "🟡 TAREFA COM ATRASO";
  }

  const message = `Tarefa "${taskName}" demorou ${Math.round(deviation)}% mais que o estimado. Estimado: ${Math.round(estimatedMinutes / 60)}h, Real: ${Math.round(actualMinutes / 60)}h`;

  await db.createAlert({
    workId,
    type: "TASK_DELAYED",
    title,
    message,
    severity,
    relatedId: taskId,
    metadata: {
      taskId,
      taskName,
      estimatedMinutes,
      actualMinutes,
      deviation: Math.round(deviation),
      estimatedHours: (estimatedMinutes / 60).toFixed(1),
      actualHours: (actualMinutes / 60).toFixed(1),
    },
  });
}

/**
 * Alerta: Meta diária não atingida
 * Chamado ao finalizar o dia ou ao completar todas as tarefas
 */
export async function checkDailyGoal(
  dailyScheduleId: number,
  date: string,
  targetArea: number,
  completedArea: number,
  workId: number
) {
  if (completedArea >= targetArea) {
    return; // Meta atingida! 🎉
  }

  const completionPercent = (completedArea / targetArea) * 100;
  const deficit = targetArea - completedArea;

  let severity: "low" | "medium" | "high" | "critical";
  let title: string;

  if (completionPercent < 50) {
    severity = "critical";
    title = "🚨 META MUITO ABAIXO";
  } else if (completionPercent < 75) {
    severity = "high";
    title = "🔴 META NÃO ATINGIDA";
  } else {
    severity = "medium";
    title = "🟡 META PARCIALMENTE ATINGIDA";
  }

  const message = `Meta do dia ${date} não foi atingida. Completado: ${completedArea.toFixed(1)}m² de ${targetArea.toFixed(1)}m² (${completionPercent.toFixed(0)}%). Déficit: ${deficit.toFixed(1)}m²`;

  await db.createAlert({
    workId,
    type: "GOAL_NOT_MET",
    title,
    message,
    severity,
    relatedId: dailyScheduleId,
    metadata: {
      dailyScheduleId,
      date,
      targetArea,
      completedArea,
      completionPercent: Math.round(completionPercent),
      deficit: deficit.toFixed(1),
    },
  });
}

/**
 * Alerta: Equipamento indisponível
 * Quando tentar alocar um equipamento que já está em uso
 */
export async function alertEquipmentUnavailable(
  equipmentId: number,
  equipmentName: string,
  taskName: string,
  workId: number
) {
  await db.createAlert({
    workId,
    type: "EQUIPAMENTO_INDISPONIVEL",
    title: "⚠️ EQUIPAMENTO INDISPONÍVEL",
    message: `Equipamento "${equipmentName}" não está disponível para a tarefa "${taskName}". Já está sendo usado em outra tarefa.`,
    severity: "high",
    relatedId: equipmentId,
    metadata: {
      equipmentId,
      equipmentName,
      taskName,
    },
  });
}

/**
 * Alerta: Clima desfavorável
 * Para integração futura com API de clima
 */
export async function alertWeather(
  weather: string,
  temperature: number,
  impactDescription: string,
  workId: number
) {
  await db.createAlert({
    workId,
    type: "WEATHER_WARNING",
    title: "🌧️ ALERTA DE CLIMA",
    message: `Condições climáticas podem afetar o trabalho. ${impactDescription}`,
    severity: "medium",
    metadata: {
      weather,
      temperature,
      impactDescription,
    },
  });
}

/**
 * Helper: Criar alerta customizado
 * Para casos específicos não cobertos pelas funções acima
 */
export async function createCustomAlert(
  workId: number,
  title: string,
  message: string,
  severity: "low" | "medium" | "high" | "critical" = "medium",
  metadata?: any
) {
  await db.createAlert({
    workId,
    type: "META_NAO_ATINGIDA", // tipo genérico
    title,
    message,
    severity,
    metadata,
  });
}
