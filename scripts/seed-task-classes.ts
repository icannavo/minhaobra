/**
 * SCRIPT DE SEED - Populando Classes de Tarefas com Exemplo Real
 * 
 * Exemplo: "Limpeza de Parede Externa com Lavajato"
 * 
 * Baseado no seu exemplo: parede de 5m x 3m = 15m²
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  taskClasses,
  taskSubclasses,
  taskSteps,
  stepEquipments,
  stepMaterials,
  equipments,
} from "../drizzle/schema";

const sqlite = new Database("./database.sqlite");
const db = drizzle(sqlite);

async function seed() {
  console.log("🌱 Iniciando seed de classes de tarefas...\n");

  // Primeiro, criar equipamentos necessários
  console.log("📦 Criando equipamentos...");
  
  const equipmentIds = {
    lavajato: await db.insert(equipments).values({
      name: "Lava-Jato Profissional",
      category: "Limpeza",
      costPerHour: 15.0,
      quantity: 2,
      description: "Equipamento de alta pressão para limpeza",
    }).returning({ id: equipments.id }).then(r => r[0].id),
    
    andaime: await db.insert(equipments).values({
      name: "Andaime Metálico 2m",
      category: "Acesso",
      costPerDay: 80.0,
      quantity: 10,
      description: "Módulo de andaime de 2 metros de altura",
    }).returning({ id: equipments.id }).then(r => r[0].id),
    
    extensao: await db.insert(equipments).values({
      name: "Extensão Elétrica 20m",
      category: "Elétrica",
      costPerDay: 5.0,
      quantity: 15,
      description: "Extensão elétrica resistente para uso externo",
    }).returning({ id: equipments.id }).then(r => r[0].id),
    
    mangueira: await db.insert(equipments).values({
      name: "Mangueira Alta Pressão 15m",
      category: "Limpeza",
      costPerDay: 8.0,
      quantity: 8,
      description: "Mangueira reforçada para alta pressão",
    }).returning({ id: equipments.id }).then(r => r[0].id),
  };

  console.log("✅ Equipamentos criados\n");

  // ========================================
  // CLASSE: Limpeza de Fachada
  // ========================================
  console.log("🏗️  Criando CLASSE: Limpeza de Fachada");
  
  const classId = await db.insert(taskClasses).values({
    name: "Limpeza de Fachada",
    code: "LF-001",
    category: "Limpeza",
    description: "Limpeza completa de superfícies externas",
    requiresScaffolding: true,
    requiresSafetyMeeting: true,
    safetyMeetingMinutes: 15,
    baseProductivity: 20, // 20 m² por pessoa por dia
  }).returning({ id: taskClasses.id }).then(r => r[0].id);

  console.log(`✅ Classe criada (ID: ${classId})\n`);

  // ========================================
  // SUBCLASSE: Limpeza com Lavajato
  // ========================================
  console.log("🔧 Criando SUBCLASSE: Limpeza com Lavajato");
  
  const subclassId = await db.insert(taskSubclasses).values({
    classId,
    name: "Limpeza com Lavajato",
    code: "LF-LJ-001",
    description: "Limpeza de alta pressão com equipamento lavajato",
    productivityMultiplier: 1.2, // 20% mais rápido que limpeza manual
  }).returning({ id: taskSubclasses.id }).then(r => r[0].id);

  console.log(`✅ Subclasse criada (ID: ${subclassId})\n`);

  // ========================================
  // ETAPAS DETALHADAS
  // ========================================
  console.log("📋 Criando ETAPAS detalhadas...\n");

  // ETAPA 1: Reunião de Segurança
  const step1Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Reunião de Segurança do Dia",
    stepOrder: 1,
    stepType: "SAFETY_MEETING",
    baseTimeMinutes: 15,
    timeCalculationType: "FIXED",
    description: "Reunião matinal para planejamento e revisão de segurança",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 1: Reunião de Segurança (15 min fixo)");

  // ETAPA 2: Montagem do Andaime
  const step2Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Montagem do Andaime",
    stepOrder: 2,
    stepType: "SCAFFOLDING",
    baseTimeMinutes: 30, // 30 min por andar
    timeCalculationType: "PER_FLOOR",
    timeCalculationValue: 30, // 30 minutos por andar
    description: "Montagem do andaime com instalação de buxas, ganchos e cordas",
    notes: "Inclui: furação da parede, instalação de buxas e ganchos, fixação com cordas",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 2: Montagem do Andaime (30 min por andar)");

  // Materiais para montagem do andaime
  await db.insert(stepMaterials).values([
    {
      stepId: step2Id,
      materialName: "Buxa de Aço 10mm",
      materialCategory: "Fixação",
      quantity: 4,
      unit: "unidade",
      calculationType: "PER_FLOOR",
      required: true,
      notes: "4 buxas por andar de andaime",
    },
    {
      stepId: step2Id,
      materialName: "Gancho de Aço",
      materialCategory: "Fixação",
      quantity: 4,
      unit: "unidade",
      calculationType: "PER_FLOOR",
      required: true,
    },
    {
      stepId: step2Id,
      materialName: "Corda de Segurança 10mm",
      materialCategory: "Fixação",
      quantity: 8,
      unit: "metros",
      calculationType: "PER_FLOOR",
      required: true,
    },
  ]);

  // Equipamentos para andaime
  await db.insert(stepEquipments).values({
    stepId: step2Id,
    equipmentId: equipmentIds.andaime,
    quantity: 3, // 3 módulos para 5 metros (aproximadamente 3 andares)
    required: true,
    notes: "Quantidade baseada na altura (5m ÷ 2m por módulo ≈ 3 módulos)",
  });

  // ETAPA 3: Vestir EPIs
  const step3Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Vestir EPIs",
    stepOrder: 3,
    stepType: "EPIs",
    baseTimeMinutes: 10,
    timeCalculationType: "FIXED",
    description: "Colocação de todos os equipamentos de proteção individual",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 3: Vestir EPIs (10 min fixo)");

  // Materiais (EPIs)
  await db.insert(stepMaterials).values([
    {
      stepId: step3Id,
      materialName: "Luva de Proteção",
      materialCategory: "EPI",
      quantity: 1,
      unit: "par",
      calculationType: "FIXED",
      required: true,
    },
    {
      stepId: step3Id,
      materialName: "Óculos de Proteção",
      materialCategory: "EPI",
      quantity: 1,
      unit: "unidade",
      calculationType: "FIXED",
      required: true,
    },
    {
      stepId: step3Id,
      materialName: "Roupa de Proteção Impermeável",
      materialCategory: "EPI",
      quantity: 1,
      unit: "conjunto",
      calculationType: "FIXED",
      required: true,
    },
    {
      stepId: step3Id,
      materialName: "Colete com Linha de Vida",
      materialCategory: "EPI",
      quantity: 1,
      unit: "unidade",
      calculationType: "FIXED",
      required: true,
      notes: "Essencial para trabalho em altura",
    },
    {
      stepId: step3Id,
      materialName: "Bota de Segurança",
      materialCategory: "EPI",
      quantity: 1,
      unit: "par",
      calculationType: "FIXED",
      required: true,
    },
  ]);

  // ETAPA 4: Preparar e Montar Equipamentos
  const step4Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Preparar e Montar Equipamentos",
    stepOrder: 4,
    stepType: "EQUIPMENT_SETUP",
    baseTimeMinutes: 20,
    timeCalculationType: "FIXED",
    description: "Trazer, conectar e testar todos os equipamentos necessários",
    notes: "Inclui: trazer lavajato, mangueira, extensão elétrica, conectar tudo e testar",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 4: Preparar Equipamentos (20 min fixo)");

  await db.insert(stepEquipments).values([
    {
      stepId: step4Id,
      equipmentId: equipmentIds.lavajato,
      quantity: 1,
      required: true,
    },
    {
      stepId: step4Id,
      equipmentId: equipmentIds.mangueira,
      quantity: 1,
      required: true,
    },
    {
      stepId: step4Id,
      equipmentId: equipmentIds.extensao,
      quantity: 1,
      required: true,
    },
  ]);

  // ETAPA 5: Execução da Limpeza
  const step5Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Limpeza da Parede",
    stepOrder: 5,
    stepType: "EXECUTION",
    baseTimeMinutes: 2, // 2 minutos por m²
    timeCalculationType: "PER_M2",
    timeCalculationValue: 2, // 2 minutos por m²
    requiresCooldown: true,
    maxContinuousMinutes: 30, // Máquina trabalha 30 min
    cooldownMinutes: 10, // Precisa esfriar por 10 min
    description: "Limpeza com lavajato da superfície",
    notes: "IMPORTANTE: Lavajato deve trabalhar máx 30min e esfriar por 10min antes de continuar",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 5: Limpeza (2 min/m² + cooldown a cada 30min)");

  // ETAPA 6: Almoço/Descanso
  const step6Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Pausa para Almoço",
    stepOrder: 6,
    stepType: "BREAK",
    baseTimeMinutes: 60,
    timeCalculationType: "FIXED",
    description: "Intervalo para refeição e descanso",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 6: Almoço (60 min fixo)");

  // ETAPA 7: Limpeza da Fuligem do Chão
  const step7Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Limpeza da Fuligem do Chão",
    stepOrder: 7,
    stepType: "CLEANUP",
    baseTimeMinutes: 60,
    timeCalculationType: "FIXED",
    description: "Remoção e limpeza da fuligem acumulada no chão",
    notes: "Geralmente leva mais de 1 hora",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 7: Limpeza da Fuligem (60 min fixo)");

  await db.insert(stepMaterials).values([
    {
      stepId: step7Id,
      materialName: "Saco de Lixo Industrial 100L",
      materialCategory: "Limpeza",
      quantity: 3,
      unit: "unidade",
      calculationType: "FIXED",
      required: true,
    },
    {
      stepId: step7Id,
      materialName: "Vassoura",
      materialCategory: "Limpeza",
      quantity: 1,
      unit: "unidade",
      calculationType: "FIXED",
      required: true,
    },
    {
      stepId: step7Id,
      materialName: "Pá de Lixo",
      materialCategory: "Limpeza",
      quantity: 1,
      unit: "unidade",
      calculationType: "FIXED",
      required: true,
    },
  ]);

  // ETAPA 8: Limpar e Guardar Equipamentos
  const step8Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Limpar e Guardar Equipamentos",
    stepOrder: 8,
    stepType: "EQUIPMENT_TEARDOWN",
    baseTimeMinutes: 25,
    timeCalculationType: "FIXED",
    description: "Limpeza, enrolamento de fios/mangueiras e armazenamento",
    notes: "Inclui: lavar lavajato, enrolar mangueira, enrolar extensão, guardar tudo",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 8: Limpar Equipamentos (25 min fixo)");

  // ETAPA 9: Desmontagem do Andaime
  const step9Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Desmontagem do Andaime",
    stepOrder: 9,
    stepType: "SCAFFOLDING",
    baseTimeMinutes: 20, // 20 min por andar
    timeCalculationType: "PER_FLOOR",
    timeCalculationValue: 20,
    description: "Desmontagem e organização do andaime",
    notes: "Geralmente mais rápido que a montagem",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 9: Desmontagem do Andaime (20 min por andar)");

  // ETAPA 10: Inspeção e Correção de Imprevistos
  const step10Id = await db.insert(taskSteps).values({
    subclassId,
    name: "Inspeção e Correção de Imprevistos",
    stepOrder: 10,
    stepType: "INSPECTION",
    baseTimeMinutes: 30,
    timeCalculationType: "FIXED",
    description: "Verificação do trabalho e correção de possíveis problemas",
    notes: "Buffer de tempo para lidar com imprevistos",
  }).returning({ id: taskSteps.id }).then(r => r[0].id);
  console.log("  ✓ Etapa 10: Inspeção Final (30 min fixo)");

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("\n📊 RESUMO:");
  console.log(`   - 1 Classe criada: Limpeza de Fachada`);
  console.log(`   - 1 Subclasse criada: Limpeza com Lavajato`);
  console.log(`   - 10 Etapas detalhadas criadas`);
  console.log(`   - 4 Equipamentos cadastrados`);
  console.log(`   - Múltiplos materiais e EPIs configurados`);
  console.log(`\n💡 Para uma parede de 5m x 3m (15m²), 3 andares:`);
  console.log(`   - Reunião: 15 min`);
  console.log(`   - Montagem andaime: 90 min (3 andares × 30 min)`);
  console.log(`   - EPIs: 10 min`);
  console.log(`   - Preparar equipamentos: 20 min`);
  console.log(`   - Limpeza: 30 min (15m² × 2 min/m²)`);
  console.log(`   - Cooldown: 0 min (não excede 30 min contínuos)`);
  console.log(`   - Almoço: 60 min`);
  console.log(`   - Limpeza fuligem: 60 min`);
  console.log(`   - Limpar equipamentos: 25 min`);
  console.log(`   - Desmontagem: 60 min (3 andares × 20 min)`);
  console.log(`   - Inspeção: 30 min`);
  console.log(`   = TOTAL: ~400 minutos (~6.7 horas)`);
}

seed()
  .then(() => {
    console.log("\n🎉 Banco de dados populado!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Erro ao popular banco:", err);
    process.exit(1);
  });
