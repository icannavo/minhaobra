/**
 * Gerador automático de tarefas por ambiente/cômodo
 * 
 * Quando um projeto é criado, gera automaticamente centenas de tarefas
 * baseadas nos ambientes (Fachada Norte, Sul, Leste, Oeste, etc.)
 */

export interface Environment {
  id: string;
  name: string;
  area: number;
  floors: number;
}

export interface GeneratedTask {
  id: string;
  taskName: string;
  description: string;
  area: number;
  estimatedMinutes: number;
  employees: number;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  environmentId: string;
  environmentName: string;
  phaseOrder: number;
  phaseName: string;
  taskOrder: number;
  isRoutine: boolean; // Se é tarefa rotineira (montar andaime, limpeza, etc.)
  equipments: Array<{ id: number; name: string; quantity: number }>;
  materials: Array<{ id: number; name: string; quantity: number; unit: string }>;
  teamMembers: Array<{ id: number; name: string; role: string }>;
}

// Templates de tarefas por fase
const PHASE_TEMPLATES = {
  PREPARACAO: {
    order: 1,
    name: "Fase 1: Preparação de Superfície",
    tasks: [
      {
        name: "Reunião de Segurança - DDS",
        description: "Diálogo Diário de Segurança com toda equipe",
        durationMinutes: 15,
        employees: 0, // Todos da equipe
        priority: "critical" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
      {
        name: "Montagem de Andaime",
        description: "Montagem e conferência de andaime conforme altura",
        durationPerFloor: 120, // 2h por andar
        employees: 2,
        priority: "high" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
      {
        name: "Distribuição de EPIs",
        description: "Conferência e distribuição de Equipamentos de Proteção Individual",
        durationMinutes: 10,
        employees: 1,
        priority: "critical" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
      {
        name: "Transporte de Equipamentos",
        description: "Trazer equipamentos do depósito até o local de trabalho",
        durationMinutes: 30,
        employees: 2,
        priority: "high" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
      {
        name: "Limpeza com Lavajato",
        description: "Limpeza profunda da superfície com lavajato de alta pressão",
        durationPerM2: 3, // 3 min por m²
        employees: 3,
        priority: "high" as const,
        isRoutine: false,
        areaMultiplier: 1,
      },
      {
        name: "Limpeza Final da Área",
        description: "Limpeza e organização da área de trabalho",
        durationMinutes: 30,
        employees: 2,
        priority: "medium" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
      {
        name: "Desmontagem de Andaime",
        description: "Desmontagem e organização do andaime",
        durationPerFloor: 60, // 1h por andar
        employees: 2,
        priority: "medium" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
    ],
  },
  REPARO: {
    order: 2,
    name: "Fase 2: Reparos Estruturais",
    tasks: [
      {
        name: "Inspeção e Mapeamento",
        description: "Identificação e marcação de fissuras e trincas",
        durationPerM2: 1.5,
        employees: 1,
        priority: "critical" as const,
        isRoutine: false,
        areaMultiplier: 1,
      },
      {
        name: "Abertura de Trincas",
        description: "Abertura em V das trincas para melhor adesão",
        durationPerM2: 5, // Mais lento
        employees: 1,
        priority: "high" as const,
        isRoutine: false,
        areaMultiplier: 0.1, // Apenas 10% da área tem trincas
      },
      {
        name: "Aplicação de Selante",
        description: "Aplicação de selante poliuretano nas trincas",
        durationPerM2: 8,
        employees: 1,
        priority: "critical" as const,
        isRoutine: false,
        areaMultiplier: 0.1,
      },
      {
        name: "Aplicação de Massa",
        description: "Regularização com massa acrílica",
        durationPerM2: 6,
        employees: 2,
        priority: "high" as const,
        isRoutine: false,
        areaMultiplier: 0.2,
      },
    ],
  },
  IMPERMEABILIZACAO: {
    order: 3,
    name: "Fase 3: Impermeabilização",
    tasks: [
      {
        name: "Aplicação de Selador",
        description: "Aplicação de selador acrílico para impermeabilização",
        durationPerM2: 2.5,
        employees: 3,
        priority: "high" as const,
        isRoutine: false,
        areaMultiplier: 1,
      },
      {
        name: "Tempo de Cura",
        description: "Aguardar secagem completa do selador",
        durationMinutes: 240, // 4 horas
        employees: 0,
        priority: "medium" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
    ],
  },
  PINTURA: {
    order: 4,
    name: "Fase 4: Pintura",
    tasks: [
      {
        name: "Primeira Demão",
        description: "Aplicação da primeira demão de tinta",
        durationPerM2: 1.5,
        employees: 4,
        priority: "high" as const,
        isRoutine: false,
        areaMultiplier: 1,
      },
      {
        name: "Secagem - Primeira Demão",
        description: "Tempo de secagem entre demãos",
        durationMinutes: 180, // 3 horas
        employees: 0,
        priority: "low" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
      {
        name: "Segunda Demão",
        description: "Aplicação da segunda demão de tinta",
        durationPerM2: 1.5,
        employees: 4,
        priority: "high" as const,
        isRoutine: false,
        areaMultiplier: 1,
      },
      {
        name: "Secagem - Segunda Demão",
        description: "Tempo de secagem entre demãos",
        durationMinutes: 180,
        employees: 0,
        priority: "low" as const,
        isRoutine: true,
        areaMultiplier: 0,
      },
      {
        name: "Terceira Demão (Final)",
        description: "Aplicação da demão final de acabamento",
        durationPerM2: 1.5,
        employees: 4,
        priority: "medium" as const,
        isRoutine: false,
        areaMultiplier: 1,
      },
      {
        name: "Inspeção Final",
        description: "Inspeção de qualidade e retoques finais",
        durationPerM2: 0.5,
        employees: 1,
        priority: "high" as const,
        isRoutine: false,
        areaMultiplier: 1,
      },
    ],
  },
};

/**
 * Gera todas as tarefas para um projeto baseado nos ambientes
 */
export function generateProjectTasks(
  projectId: string,
  environments: Environment[]
): GeneratedTask[] {
  const tasks: GeneratedTask[] = [];
  let taskCounter = 0;

  // Para cada fase
  Object.values(PHASE_TEMPLATES).forEach((phase) => {
    // Para cada ambiente (Fachada Norte, Sul, etc.)
    environments.forEach((environment) => {
      // Para cada tarefa da fase
      phase.tasks.forEach((taskTemplate) => {
        taskCounter++;

        // Calcular duração
        let duration = 0;
        if (taskTemplate.durationMinutes) {
          duration = taskTemplate.durationMinutes;
        } else if (taskTemplate.durationPerM2) {
          const effectiveArea = environment.area * (taskTemplate.areaMultiplier || 1);
          duration = Math.ceil(effectiveArea * taskTemplate.durationPerM2);
        } else if (taskTemplate.durationPerFloor) {
          duration = environment.floors * taskTemplate.durationPerFloor;
        }

        // Área efetiva da tarefa
        const taskArea = environment.area * (taskTemplate.areaMultiplier || 0);

        const task: GeneratedTask = {
          id: `task-${projectId}-${taskCounter}`,
          taskName: `${taskTemplate.name} - ${environment.name}`,
          description: taskTemplate.description,
          area: taskArea,
          estimatedMinutes: duration,
          employees: taskTemplate.employees,
          status: "pending",
          priority: taskTemplate.priority,
          environmentId: environment.id,
          environmentName: environment.name,
          phaseOrder: phase.order,
          phaseName: phase.name,
          taskOrder: taskCounter,
          isRoutine: taskTemplate.isRoutine,
          equipments: [], // TODO: Popular com equipamentos reais
          materials: [], // TODO: Popular com materiais reais
          teamMembers: [], // TODO: Alocar equipe
        };

        tasks.push(task);
      });
    });
  });

  return tasks;
}

/**
 * Exemplo de uso
 */
export function generateExampleTasks(projectId: string = "1"): GeneratedTask[] {
  const environments: Environment[] = [
    { id: "env-1", name: "Fachada Norte", area: 125, floors: 4 },
    { id: "env-2", name: "Fachada Sul", area: 100, floors: 4 },
    { id: "env-3", name: "Fachada Leste", area: 80, floors: 4 },
    { id: "env-4", name: "Fachada Oeste", area: 95, floors: 4 },
  ];

  return generateProjectTasks(projectId, environments);
}

/**
 * Filtrar tarefas por status
 */
export function filterTasksByStatus(
  tasks: GeneratedTask[],
  status: "pending" | "in-progress" | "completed"
): GeneratedTask[] {
  return tasks.filter((t) => t.status === status);
}

/**
 * Agrupar tarefas por fase
 */
export function groupTasksByPhase(tasks: GeneratedTask[]): Record<string, GeneratedTask[]> {
  const grouped: Record<string, GeneratedTask[]> = {};

  tasks.forEach((task) => {
    if (!grouped[task.phaseName]) {
      grouped[task.phaseName] = [];
    }
    grouped[task.phaseName].push(task);
  });

  return grouped;
}

/**
 * Agrupar tarefas por ambiente
 */
export function groupTasksByEnvironment(tasks: GeneratedTask[]): Record<string, GeneratedTask[]> {
  const grouped: Record<string, GeneratedTask[]> = {};

  tasks.forEach((task) => {
    if (!grouped[task.environmentName]) {
      grouped[task.environmentName] = [];
    }
    grouped[task.environmentName].push(task);
  });

  return grouped;
}
