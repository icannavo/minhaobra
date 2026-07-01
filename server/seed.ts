/**
 * SEED DATA - Popular banco com exemplo completo
 * 
 * Exemplo: Limpeza de Parede Externa com Lavajato
 * - 5m x 3m = 15m²
 * - 3 andares de andaime
 * - Todas as etapas detalhadas
 */

import { getDb } from "./db";
import * as db from "./db";

export async function seedDatabase() {
  console.log("[Seed] Iniciando população do banco de dados...");

  try {
    // ========================================
    // 1. CRIAR EQUIPAMENTOS
    // ========================================
    console.log("[Seed] Criando equipamentos...");

    await db.createEquipment({
      name: "Lavajato Profissional",
      category: "Limpeza",
      costPerHour: 15,
      costPerDay: 100,
      quantity: 2,
      description: "Lavajato de alta pressão, uso máximo 30min contínuos",
    });

    await db.createEquipment({
      name: "Andaime Metálico (módulo 2m)",
      category: "Acesso",
      costPerDay: 80,
      quantity: 10,
      description: "Módulo de andaime de 2 metros de altura",
    });

    await db.createEquipment({
      name: "Compressor de Ar",
      category: "Equipamento",
      costPerHour: 10,
      costPerDay: 60,
      quantity: 1,
    });

    await db.createEquipment({
      name: "Extensão Elétrica 50m",
      category: "Elétrico",
      costPerDay: 10,
      quantity: 5,
    });

    await db.createEquipment({
      name: "Mangueira Industrial 30m",
      category: "Hidráulico",
      costPerDay: 15,
      quantity: 3,
    });

    await db.createEquipment({
      name: "Escada Alumínio 5m",
      category: "Acesso",
      costPerDay: 20,
      quantity: 3,
    });

    // ========================================
    // 2. CRIAR CLASSE DE TAREFA
    // ========================================
    console.log("[Seed] Criando classe de tarefa...");

    const classResult = await db.createTaskClass({
      name: "Limpeza de Fachada",
      code: "LF-001",
      category: "Limpeza",
      description: "Limpeza geral de superfícies externas de edificações",
      requiresScaffolding: true,
      requiresSafetyMeeting: true,
      safetyMeetingMinutes: 15,
      baseProductivity: 20, // m²/dia
    });

    const classId = (await db.getAllTaskClasses())[0].id;

    // ========================================
    // 3. CRIAR SUBCLASSE
    // ========================================
    console.log("[Seed] Criando subclasse...");

    await db.createTaskSubclass({
      classId,
      name: "Limpeza com Lavajato de Alta Pressão",
      code: "LF-LAV-001",
      description: "Limpeza de fachada utilizando lavajato com pressão de água",
      productivityMultiplier: 1.2, // 20% mais rápido que método manual
    });

    const subclassId = (await db.getSubclassesByClass(classId))[0].id;

    // ========================================
    // 4. CRIAR ETAPAS DETALHADAS
    // ========================================
    console.log("[Seed] Criando etapas detalhadas...");

    // Etapa 1: Reunião de Segurança
    const step1 = await db.createTaskStep({
      subclassId,
      name: "Reunião de Planejamento e Segurança",
      stepOrder: 1,
      stepType: "SAFETY_MEETING",
      baseTimeMinutes: 15,
      timeCalculationType: "FIXED",
      timeCalculationValue: 0,
      description: "Briefing da equipe, revisão de procedimentos de segurança e check dos EPIs",
      notes: "Obrigatório antes de iniciar qualquer trabalho em altura",
    });

    // Etapa 2: Montagem do Andaime
    const step2 = await db.createTaskStep({
      subclassId,
      name: "Montagem do Andaime",
      stepOrder: 2,
      stepType: "SCAFFOLDING",
      baseTimeMinutes: 0,
      timeCalculationType: "PER_FLOOR",
      timeCalculationValue: 45, // 45 minutos por andar
      description: "Montagem completa do andaime com todas as travas de segurança",
      notes: "Cada andar (2m) leva aproximadamente 45 minutos. Inclui instalação de linhas de vida.",
    });

    // Etapa 3: Instalação de Buchas e Ganchos
    const step3 = await db.createTaskStep({
      subclassId,
      name: "Furar Parede e Instalar Buchas/Ganchos",
      stepOrder: 3,
      stepType: "EQUIPMENT_SETUP",
      baseTimeMinutes: 0,
      timeCalculationType: "PER_FLOOR",
      timeCalculationValue: 15, // 15 min por andar
      description: "Furação da parede para fixação dos pontos de ancoragem do andaime",
      notes: "Usar furadeira de impacto. Mínimo 4 pontos por andar.",
    });

    // Etapa 4: Vestir EPIs e Linha de Vida
    const step4 = await db.createTaskStep({
      subclassId,
      name: "Equipar EPIs e Linha de Vida",
      stepOrder: 4,
      stepType: "EPIs",
      baseTimeMinutes: 10,
      timeCalculationType: "FIXED",
      timeCalculationValue: 0,
      description: "Colocar todos os EPIs obrigatórios e conectar linha de vida",
    });

    // Etapa 5: Trazer e Montar Equipamentos
    const step5 = await db.createTaskStep({
      subclassId,
      name: "Trazer Equipamentos para o Local",
      stepOrder: 5,
      stepType: "EQUIPMENT_SETUP",
      baseTimeMinutes: 20,
      timeCalculationType: "FIXED",
      timeCalculationValue: 0,
      description: "Transporte de lavajato, mangueiras, extensões e materiais",
    });

    // Etapa 6: Conectar Mangueiras e Extensões
    const step6 = await db.createTaskStep({
      subclassId,
      name: "Instalação de Mangueiras e Extensões",
      stepOrder: 6,
      stepType: "EQUIPMENT_SETUP",
      baseTimeMinutes: 15,
      timeCalculationType: "FIXED",
      timeCalculationValue: 0,
      description: "Conexão de água, energia elétrica e montagem do sistema",
    });

    // Etapa 7: Execução da Limpeza (COM CICLOS DE DESCANSO)
    const step7 = await db.createTaskStep({
      subclassId,
      name: "Limpeza com Lavajato",
      stepOrder: 7,
      stepType: "EXECUTION",
      baseTimeMinutes: 0,
      timeCalculationType: "PER_M2",
      timeCalculationValue: 3, // 3 minutos por m²
      requiresCooldown: true,
      cooldownMinutes: 10, // Máquina precisa esfriar 10min
      maxContinuousMinutes: 30, // Trabalha só 30min contínuos
      description: "Limpeza da superfície com lavajato de alta pressão",
      notes: "IMPORTANTE: Lavajato opera por no máximo 30min, depois precisa esfriar por 10min antes de continuar",
    });

    // Etapa 8: Limpeza da Fuligem do Chão
    const step8 = await db.createTaskStep({
      subclassId,
      name: "Limpeza da Fuligem no Chão",
      stepOrder: 8,
      stepType: "CLEANUP",
      baseTimeMinutes: 60,
      timeCalculationType: "FIXED",
      timeCalculationValue: 0,
      description: "Remoção e limpeza da fuligem que caiu no solo",
      notes: "Pode levar mais de 1 hora dependendo da área",
    });

    // Etapa 9: Limpar Equipamentos
    const step9 = await db.createTaskStep({
      subclassId,
      name: "Limpeza dos Equipamentos",
      stepOrder: 9,
      stepType: "CLEANUP",
      baseTimeMinutes: 25,
      timeCalculationType: "FIXED",
      timeCalculationValue: 0,
      description: "Limpeza do lavajato, mangueiras e outros equipamentos",
    });

    // Etapa 10: Enrolar Fios e Mangueiras
    const step10 = await db.createTaskStep({
      subclassId,
      name: "Enrolar e Organizar Cabos/Mangueiras",
      stepOrder: 10,
      stepType: "EQUIPMENT_TEARDOWN",
      baseTimeMinutes: 15,
      timeCalculationType: "FIXED",
      timeCalculationValue: 0,
      description: "Organização e armazenamento de cabos e mangueiras",
    });

    // Etapa 11: Desmontar Andaime
    const step11 = await db.createTaskStep({
      subclassId,
      name: "Desmontagem do Andaime",
      stepOrder: 11,
      stepType: "EQUIPMENT_TEARDOWN",
      baseTimeMinutes: 0,
      timeCalculationType: "PER_FLOOR",
      timeCalculationValue: 30, // 30 min por andar (mais rápido que montar)
      description: "Desmontagem completa e segura do andaime",
    });

    // Etapa 12: Guardar Equipamentos
    const step12 = await db.createTaskStep({
      subclassId,
      name: "Guardar Todos os Equipamentos",
      stepOrder: 12,
      stepType: "EQUIPMENT_TEARDOWN",
      baseTimeMinutes: 20,
      timeCalculationType: "FIXED",
      timeCalculationValue: 0,
      description: "Armazenamento de todos os equipamentos no depósito",
    });

    // ========================================
    // 5. ADICIONAR EQUIPAMENTOS ÀS ETAPAS
    // ========================================
    console.log("[Seed] Associando equipamentos às etapas...");

    const allEquipments = await db.getAllEquipments();
    const lavajato = allEquipments.find(e => e.name.includes("Lavajato"));
    const andaime = allEquipments.find(e => e.name.includes("Andaime"));
    const compressor = allEquipments.find(e => e.name.includes("Compressor"));
    const extensao = allEquipments.find(e => e.name.includes("Extensão"));
    const mangueira = allEquipments.find(e => e.name.includes("Mangueira"));

    const steps = await db.getStepsBySubclass(subclassId);

    // Montagem do Andaime
    const montarAndaime = steps.find(s => s.stepOrder === 2);
    if (montarAndaime && andaime) {
      await db.addEquipmentToStep({
        stepId: montarAndaime.id,
        equipmentId: andaime.id,
        quantity: 3, // 3 módulos para 3 andares
        required: true,
      });
    }

    // Execução - Lavajato
    const execucao = steps.find(s => s.stepOrder === 7);
    if (execucao) {
      if (lavajato) {
        await db.addEquipmentToStep({
          stepId: execucao.id,
          equipmentId: lavajato.id,
          quantity: 1,
          required: true,
          notes: "Usar com intervalos de descanso",
        });
      }
      if (compressor) {
        await db.addEquipmentToStep({
          stepId: execucao.id,
          equipmentId: compressor.id,
          quantity: 1,
          required: false,
        });
      }
      if (extensao) {
        await db.addEquipmentToStep({
          stepId: execucao.id,
          equipmentId: extensao.id,
          quantity: 1,
          required: true,
        });
      }
      if (mangueira) {
        await db.addEquipmentToStep({
          stepId: execucao.id,
          equipmentId: mangueira.id,
          quantity: 1,
          required: true,
        });
      }
    }

    // ========================================
    // 6. ADICIONAR MATERIAIS ÀS ETAPAS
    // ========================================
    console.log("[Seed] Adicionando materiais às etapas...");

    // EPIs
    const episEtapa = steps.find(s => s.stepOrder === 4);
    if (episEtapa) {
      await db.addMaterialToStep({
        stepId: episEtapa.id,
        materialName: "Luvas de Proteção",
        materialCategory: "EPI",
        quantity: 1,
        unit: "par",
        calculationType: "FIXED",
        required: true,
      });

      await db.addMaterialToStep({
        stepId: episEtapa.id,
        materialName: "Óculos de Proteção",
        materialCategory: "EPI",
        quantity: 1,
        unit: "unidade",
        calculationType: "FIXED",
        required: true,
      });

      await db.addMaterialToStep({
        stepId: episEtapa.id,
        materialName: "Roupa de Proteção Impermeável",
        materialCategory: "EPI",
        quantity: 1,
        unit: "unidade",
        calculationType: "FIXED",
        required: true,
      });

      await db.addMaterialToStep({
        stepId: episEtapa.id,
        materialName: "Colete de Linha de Vida",
        materialCategory: "EPI",
        quantity: 1,
        unit: "unidade",
        calculationType: "FIXED",
        required: true,
      });

      await db.addMaterialToStep({
        stepId: episEtapa.id,
        materialName: "Capacete de Segurança",
        materialCategory: "EPI",
        quantity: 1,
        unit: "unidade",
        calculationType: "FIXED",
        required: true,
      });

      await db.addMaterialToStep({
        stepId: episEtapa.id,
        materialName: "Botas de Segurança",
        materialCategory: "EPI",
        quantity: 1,
        unit: "par",
        calculationType: "FIXED",
        required: true,
      });
    }

    // Detergente para limpeza
    if (execucao) {
      await db.addMaterialToStep({
        stepId: execucao.id,
        materialName: "Detergente Industrial",
        materialCategory: "Produto Químico",
        quantity: 0.5,
        unit: "L",
        calculationType: "PER_M2",
        required: false,
        notes: "Opcional, dependendo do grau de sujeira",
      });
    }

    // ========================================
    // 7. CRIAR UMA OBRA DE EXEMPLO
    // ========================================
    console.log("[Seed] Criando obra de exemplo...");

    await db.createWork({
      code: "OBRA-001",
      name: "Restauração Prédio Centro",
      description: "Restauração completa da fachada do edifício comercial no centro",
      location: "Rua Principal, 123 - Centro",
      status: "Em Andamento",
      startDate: new Date().toISOString().split('T')[0],
      estimatedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 dias
    });

    const work = (await db.getAllWorks())[0];

    // ========================================
    // 8. CRIAR TAREFA DETALHADA DE EXEMPLO
    // ========================================
    console.log("[Seed] Criando tarefa detalhada de exemplo...");

    await db.createDetailedTask({
      workId: work.id,
      date: new Date().toISOString().split('T')[0],
      classId,
      subclassId,
      taskName: "Limpeza Parede Externa Leste - Lavajato",
      description: "Limpeza da parede externa do lado leste do prédio, 5m largura x 3m altura",
      area: 15, // 5m x 3m
      height: 3,
      width: 5,
      floors: 3, // 3 andares de andaime (cada um com 2m)
      team: "Equipe Alpha",
      numberOfEmployees: 2,
      weather: "Ensolarado",
      temperature: 25,
      notes: "Verificar estado da parede antes de iniciar",
    });

    console.log("[Seed] ✅ Banco de dados populado com sucesso!");
    console.log("[Seed] Criado:");
    console.log("  - 6 Equipamentos");
    console.log("  - 1 Classe de Tarefa (Limpeza de Fachada)");
    console.log("  - 1 Subclasse (Limpeza com Lavajato)");
    console.log("  - 12 Etapas detalhadas");
    console.log("  - Equipamentos e materiais associados");
    console.log("  - 1 Obra de exemplo");
    console.log("  - 1 Tarefa detalhada calculada");

  } catch (error) {
    console.error("[Seed] Erro ao popular banco:", error);
    throw error;
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("[Seed] Processo concluído!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Seed] Falha:", error);
      process.exit(1);
    });
}
