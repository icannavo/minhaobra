/**
 * Serviço de Geração Automática de Projetos e Tarefas
 * 
 * Este serviço implementa a lógica de criação automática de centenas de tarefas
 * hierárquicas quando um novo projeto é criado, baseado em templates e WBS.
 */

export interface ProjectInput {
  workId: number;
  name: string;
  description?: string;
  totalArea: number; // m²
  totalFloors: number;
  startDate?: string;
  templateId?: number; // ID do template a usar
}

export interface TaskTemplate {
  name: string;
  classId: number;
  subclassId: number;
  areaMultiplier: number; // Multiplicador da área total (0.25 = 25% da área)
  productivityPerM2PerDay: number; // m² por pessoa por dia
  employeesBase: number; // Número base de funcionários
  priority: "low" | "medium" | "high" | "critical";
  subtasks: SubtaskTemplate[];
  dependsOn?: string[]; // Códigos de tarefas predecessoras
}

export interface SubtaskTemplate {
  stepType: string;
  name: string;
  durationType: "FIXED" | "PER_M2" | "PER_FLOOR" | "PERCENTAGE_EXECUTION";
  durationValue: number; // minutos ou percentual
  order: number;
}

export interface PhaseTemplate {
  name: string;
  description: string;
  phaseOrder: number;
  tasks: TaskTemplate[];
  dependsOnPhase?: string; // Nome da fase predecessora
}

export interface ProjectTemplateData {
  id: number;
  name: string;
  description: string;
  phases: PhaseTemplate[];
}

/**
 * Templates de Projeto Padrão
 */
export const PROJECT_TEMPLATES: Record<string, ProjectTemplateData> = {
  RESTAURACAO_COMPLETA: {
    id: 1,
    name: "Restauração Completa de Fachada",
    description: "Template completo para restauração de fachadas de edifícios",
    phases: [
      {
        name: "Fase 1: Preparação de Superfície",
        description: "Limpeza e preparação inicial das superfícies",
        phaseOrder: 1,
        tasks: [
          {
            name: "Limpeza de Fachada Norte",
            classId: 1,
            subclassId: 1,
            areaMultiplier: 0.25, // 25% da área total
            productivityPerM2PerDay: 20,
            employeesBase: 3,
            priority: "high",
            subtasks: [
              {
                stepType: "SAFETY_MEETING",
                name: "Reunião de Segurança",
                durationType: "FIXED",
                durationValue: 15,
                order: 1,
              },
              {
                stepType: "SCAFFOLDING",
                name: "Montagem de Andaime",
                durationType: "PER_FLOOR",
                durationValue: 120, // 2h por andar
                order: 2,
              },
              {
                stepType: "EPIs",
                name: "Vestir EPIs",
                durationType: "FIXED",
                durationValue: 10,
                order: 3,
              },
              {
                stepType: "EQUIPMENT_SETUP",
                name: "Preparação de Equipamentos",
                durationType: "FIXED",
                durationValue: 30,
                order: 4,
              },
              {
                stepType: "EXECUTION",
                name: "Limpeza com Lavajato",
                durationType: "PER_M2",
                durationValue: 3, // 3 minutos por m²
                order: 5,
              },
              {
                stepType: "BREAK",
                name: "Intervalo para Almoço",
                durationType: "FIXED",
                durationValue: 60,
                order: 6,
              },
              {
                stepType: "CLEANUP",
                name: "Limpeza da Área",
                durationType: "FIXED",
                durationValue: 30,
                order: 7,
              },
              {
                stepType: "EQUIPMENT_TEARDOWN",
                name: "Desmontagem de Equipamentos",
                durationType: "FIXED",
                durationValue: 30,
                order: 8,
              },
              {
                stepType: "INSPECTION",
                name: "Inspeção Final",
                durationType: "PERCENTAGE_EXECUTION",
                durationValue: 10, // 10% do tempo de execução
                order: 9,
              },
            ],
          },
          {
            name: "Limpeza de Fachada Sul",
            classId: 1,
            subclassId: 1,
            areaMultiplier: 0.25,
            productivityPerM2PerDay: 20,
            employeesBase: 3,
            priority: "high",
            subtasks: [
              // Mesmas subtarefas da fachada norte
            ],
            dependsOn: ["Limpeza de Fachada Norte"], // Só inicia após Norte
          },
          {
            name: "Limpeza de Fachada Leste",
            classId: 1,
            subclassId: 1,
            areaMultiplier: 0.25,
            productivityPerM2PerDay: 20,
            employeesBase: 3,
            priority: "medium",
            subtasks: [],
            dependsOn: ["Limpeza de Fachada Sul"],
          },
          {
            name: "Limpeza de Fachada Oeste",
            classId: 1,
            subclassId: 1,
            areaMultiplier: 0.25,
            productivityPerM2PerDay: 20,
            employeesBase: 3,
            priority: "medium",
            subtasks: [],
            dependsOn: ["Limpeza de Fachada Leste"],
          },
        ],
      },
      {
        name: "Fase 2: Reparos Estruturais",
        description: "Correção de fissuras e problemas estruturais",
        phaseOrder: 2,
        dependsOnPhase: "Fase 1: Preparação de Superfície",
        tasks: [
          {
            name: "Mapeamento de Fissuras - Fachada Norte",
            classId: 2,
            subclassId: 3,
            areaMultiplier: 0.25,
            productivityPerM2PerDay: 50, // Mais rápido que limpeza
            employeesBase: 2,
            priority: "critical",
            subtasks: [
              {
                stepType: "SAFETY_MEETING",
                name: "Reunião de Segurança",
                durationType: "FIXED",
                durationValue: 15,
                order: 1,
              },
              {
                stepType: "INSPECTION",
                name: "Inspeção e Mapeamento",
                durationType: "PER_M2",
                durationValue: 1.5,
                order: 2,
              },
              {
                stepType: "PREPARATION",
                name: "Marcação de Pontos",
                durationType: "FIXED",
                durationValue: 60,
                order: 3,
              },
            ],
          },
          {
            name: "Reparo de Fissuras - Fachada Norte",
            classId: 2,
            subclassId: 4,
            areaMultiplier: 0.05, // Apenas 5% da área tem fissuras
            productivityPerM2PerDay: 10, // Trabalho mais lento
            employeesBase: 2,
            priority: "critical",
            subtasks: [],
            dependsOn: ["Mapeamento de Fissuras - Fachada Norte"],
          },
        ],
      },
      {
        name: "Fase 3: Impermeabilização",
        description: "Aplicação de produtos impermeabilizantes",
        phaseOrder: 3,
        dependsOnPhase: "Fase 2: Reparos Estruturais",
        tasks: [
          {
            name: "Aplicação de Selador - Fachada Norte",
            classId: 3,
            subclassId: 5,
            areaMultiplier: 0.25,
            productivityPerM2PerDay: 30,
            employeesBase: 3,
            priority: "high",
            subtasks: [
              {
                stepType: "SAFETY_MEETING",
                name: "Reunião de Segurança",
                durationType: "FIXED",
                durationValue: 15,
                order: 1,
              },
              {
                stepType: "PREPARATION",
                name: "Preparação de Material",
                durationType: "FIXED",
                durationValue: 45,
                order: 2,
              },
              {
                stepType: "EXECUTION",
                name: "Aplicação de Selador",
                durationType: "PER_M2",
                durationValue: 2.5,
                order: 3,
              },
              {
                stepType: "BREAK",
                name: "Intervalo",
                durationType: "FIXED",
                durationValue: 60,
                order: 4,
              },
              {
                stepType: "INSPECTION",
                name: "Verificação de Cobertura",
                durationType: "PERCENTAGE_EXECUTION",
                durationValue: 15,
                order: 5,
              },
            ],
          },
        ],
      },
      {
        name: "Fase 4: Pintura",
        description: "Aplicação de pintura final",
        phaseOrder: 4,
        dependsOnPhase: "Fase 3: Impermeabilização",
        tasks: [
          {
            name: "Primeira Demão - Fachada Norte",
            classId: 4,
            subclassId: 6,
            areaMultiplier: 0.25,
            productivityPerM2PerDay: 40,
            employeesBase: 4,
            priority: "high",
            subtasks: [],
          },
          {
            name: "Segunda Demão - Fachada Norte",
            classId: 4,
            subclassId: 6,
            areaMultiplier: 0.25,
            productivityPerM2PerDay: 40,
            employeesBase: 4,
            priority: "high",
            subtasks: [],
            dependsOn: ["Primeira Demão - Fachada Norte"],
          },
          {
            name: "Terceira Demão (Final) - Fachada Norte",
            classId: 4,
            subclassId: 6,
            areaMultiplier: 0.25,
            productivityPerM2PerDay: 40,
            employeesBase: 4,
            priority: "medium",
            subtasks: [],
            dependsOn: ["Segunda Demão - Fachada Norte"],
          },
        ],
      },
    ],
  },
};

/**
 * Calculadores de Duração
 */
export function calculateSubtaskDuration(
  subtask: SubtaskTemplate,
  taskArea: number,
  floors: number
): number {
  switch (subtask.durationType) {
    case "FIXED":
      return subtask.durationValue;

    case "PER_M2":
      return Math.ceil(taskArea * subtask.durationValue);

    case "PER_FLOOR":
      return Math.ceil(floors * subtask.durationValue);

    case "PERCENTAGE_EXECUTION":
      // Será calculado baseado na duração da subtarefa de EXECUTION
      return 0; // Calculado posteriormente

    default:
      return 0;
  }
}

export function calculateTaskDuration(
  taskArea: number,
  productivityPerM2PerDay: number,
  employees: number,
  workHoursPerDay: number = 8
): number {
  // Produtividade total = produtividade por pessoa * número de pessoas
  const totalProductivityPerDay = productivityPerM2PerDay * employees;

  // Dias necessários
  const daysNeeded = taskArea / totalProductivityPerDay;

  // Converter para minutos
  const minutesNeeded = daysNeeded * workHoursPerDay * 60;

  return Math.ceil(minutesNeeded);
}

/**
 * Gerador Principal de Projeto
 */
export async function generateProject(input: ProjectInput) {
  // 1. Selecionar template
  const template =
    PROJECT_TEMPLATES.RESTAURACAO_COMPLETA || PROJECT_TEMPLATES[input.templateId || 1];

  if (!template) {
    throw new Error("Template não encontrado");
  }

  // 2. Criar projeto base
  const project = {
    workId: input.workId,
    name: input.name,
    description: input.description,
    totalArea: input.totalArea,
    totalFloors: input.totalFloors,
    startDate: input.startDate,
    totalTasks: 0,
    completedTasks: 0,
    progressPercent: 0,
    status: "Planejamento" as const,
  };

  // 3. Gerar fases e tarefas
  const generatedData = {
    project,
    phases: [] as any[],
    tasks: [] as any[],
    subtasks: [] as any[],
  };

  let taskCounter = 0;
  const taskDependencyMap = new Map<string, number>(); // nome → taskId

  for (const phaseTemplate of template.phases) {
    // Criar fase
    const phase = {
      projectId: 0, // Será preenchido após inserir no DB
      name: phaseTemplate.name,
      description: phaseTemplate.description,
      phaseOrder: phaseTemplate.phaseOrder,
      totalTasks: phaseTemplate.tasks.length,
      completedTasks: 0,
      progressPercent: 0,
      status: "Pendente" as const,
      dependsOnPhaseId: null, // Será resolvido após inserir
    };

    generatedData.phases.push(phase);

    // Criar tarefas da fase
    for (const taskTemplate of phaseTemplate.tasks) {
      taskCounter++;

      const taskArea = input.totalArea * taskTemplate.areaMultiplier;
      const executionMinutes = calculateTaskDuration(
        taskArea,
        taskTemplate.productivityPerM2PerDay,
        taskTemplate.employeesBase
      );

      const task = {
        projectId: 0,
        phaseId: 0,
        code: `F${phaseTemplate.phaseOrder}-T${taskCounter.toString().padStart(3, "0")}`,
        name: taskTemplate.name,
        description: `Área: ${taskArea.toFixed(0)}m² | Produtividade: ${taskTemplate.productivityPerM2PerDay}m²/pessoa/dia`,
        classId: taskTemplate.classId,
        subclassId: taskTemplate.subclassId,
        area: taskArea,
        height: 0,
        width: 0,
        floors: input.totalFloors,
        estimatedDurationMinutes: executionMinutes,
        estimatedEmployees: taskTemplate.employeesBase,
        estimatedCost: 0,
        priority: taskTemplate.priority,
        taskOrder: taskCounter,
        dependsOnTaskIds: JSON.stringify(
          taskTemplate.dependsOn?.map((name) => taskDependencyMap.get(name)) || []
        ),
        kanbanStatus: "backlog" as const,
        status: "Pendente" as const,
        totalSubtasks: taskTemplate.subtasks.length,
        completedSubtasks: 0,
        progressPercent: 0,
      };

      generatedData.tasks.push(task);
      taskDependencyMap.set(taskTemplate.name, taskCounter);

      // Criar subtarefas
      let executionSubtaskDuration = 0;

      for (const subtaskTemplate of taskTemplate.subtasks) {
        const duration = calculateSubtaskDuration(subtaskTemplate, taskArea, input.totalFloors);

        if (subtaskTemplate.stepType === "EXECUTION") {
          executionSubtaskDuration = duration;
        }

        const subtask = {
          projectTaskId: 0, // Será preenchido após inserir
          name: subtaskTemplate.name,
          description: "",
          subtaskOrder: subtaskTemplate.order,
          stepType: subtaskTemplate.stepType,
          estimatedMinutes: duration,
          actualMinutes: 0,
          status: "Pendente" as const,
          checklistItems: null,
          notes: "",
        };

        generatedData.subtasks.push(subtask);
      }

      // Atualizar subtarefas de PERCENTAGE_EXECUTION
      generatedData.subtasks
        .filter(
          (st) => st.projectTaskId === 0 && st.stepType === "INSPECTION" // Placeholder check
        )
        .forEach((st) => {
          const template = taskTemplate.subtasks.find(
            (t) => t.stepType === st.stepType && t.durationType === "PERCENTAGE_EXECUTION"
          );
          if (template && executionSubtaskDuration > 0) {
            st.estimatedMinutes = Math.ceil(
              (executionSubtaskDuration * template.durationValue) / 100
            );
          }
        });
    }
  }

  // Atualizar contagem total de tarefas
  generatedData.project.totalTasks = generatedData.tasks.length;

  return generatedData;
}

/**
 * Estatísticas do Projeto Gerado
 */
export function getProjectStats(generatedData: ReturnType<typeof generateProject>) {
  const totalTasks = generatedData.tasks.length;
  const totalSubtasks = generatedData.subtasks.length;
  const totalMinutes = generatedData.tasks.reduce(
    (sum, task) => sum + task.estimatedDurationMinutes,
    0
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.ceil(totalHours / 8);

  const byPriority = {
    critical: generatedData.tasks.filter((t) => t.priority === "critical").length,
    high: generatedData.tasks.filter((t) => t.priority === "high").length,
    medium: generatedData.tasks.filter((t) => t.priority === "medium").length,
    low: generatedData.tasks.filter((t) => t.priority === "low").length,
  };

  return {
    totalTasks,
    totalSubtasks,
    totalMinutes,
    totalHours,
    totalDays,
    byPriority,
    phases: generatedData.phases.length,
  };
}
