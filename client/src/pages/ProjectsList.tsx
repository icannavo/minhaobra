import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, ArrowRight, Plus, MapPin, ChevronRight, TrendingUp, Clock, Briefcase } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  area: number;
  employees: number;
  startDate: string;
  estimatedDays: number;
  completedDays: number;
  progress: number;
  status: "planning" | "in-progress" | "completed";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

export default function ProjectsList() {
  const [, navigate] = useLocation();
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Fachada Prédio Centro",
      type: "Pintura Externa",
      location: "Centro, São Paulo",
      area: 160,
      employees: 3,
      startDate: "2026-06-29",
      estimatedDays: 8,
      completedDays: 2,
      progress: 25,
      status: "in-progress",
    },
    {
      id: "2",
      name: "Pintura Apartamento",
      type: "Pintura Interna",
      location: "Vila Mariana, São Paulo",
      area: 120,
      employees: 2,
      startDate: "2026-07-01",
      estimatedDays: 5,
      completedDays: 0,
      progress: 0,
      status: "planning",
    },
    {
      id: "3",
      name: "Restauração Fachada Histórica",
      type: "Restauração Fachada",
      location: "Pátio do Colégio, São Paulo",
      area: 250,
      employees: 5,
      startDate: "2026-05-15",
      estimatedDays: 15,
      completedDays: 15,
      progress: 100,
      status: "completed",
    },
  ]);

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "in-progress").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const totalArea = projects.reduce((sum, p) => sum + p.area, 0);

  const statusConfig = {
    planning: { 
      className: "status-planning",
      label: "Planejamento",
      gradient: "from-blue-500/10 to-blue-500/5"
    },
    "in-progress": { 
      className: "status-in-progress",
      label: "Em Andamento",
      gradient: "from-green-500/10 to-green-500/5"
    },
    completed: { 
      className: "status-completed",
      label: "Concluído",
      gradient: "from-purple-500/10 to-purple-500/5"
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-header"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="section-title">Minhas Obras</h1>
            <Button 
              size="lg"
              onClick={() => navigate("/new-project")}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Obra
            </Button>
          </div>
          <p className="section-subtitle">Acompanhe o progresso de todas as suas obras em tempo real</p>
        </motion.div>

        {/* Stats Grid */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="stats-card">
              <div className="stats-label">Total de Obras</div>
              <div className="stats-value text-blue-400">{totalProjects}</div>
              <div className="stats-unit">projetos</div>
            </div>
            <div className="stats-card">
              <div className="stats-label">Em Andamento</div>
              <div className="stats-value text-green-400">{activeProjects}</div>
              <div className="stats-unit">ativas</div>
            </div>
            <div className="stats-card">
              <div className="stats-label">Concluídas</div>
              <div className="stats-value text-purple-400">{completedProjects}</div>
              <div className="stats-unit">finalizadas</div>
            </div>
            <div className="stats-card">
              <div className="stats-label">Área Total</div>
              <div className="stats-value text-orange-400">{totalArea}</div>
              <div className="stats-unit">m²</div>
            </div>
          </motion.div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="empty-state"
          >
            <Briefcase className="empty-state-icon" />
            <h3 className="empty-state-title">Nenhuma obra cadastrada</h3>
            <p className="empty-state-text mb-6">
              Comece criando sua primeira obra e organize todo o processo de restauração
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/new-project")}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Obra
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {projects.map((project) => {
              const config = statusConfig[project.status];
              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="modern-card cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${config.className}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Progresso</span>
                      <span className="text-sm font-semibold text-white">{project.progress}%</span>
                    </div>
                    <div className="progress-container">
                      <div 
                        className={project.status === "completed" ? "progress-bar-success" : "progress-bar"}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="info-grid mb-6">
                    <div className="info-item">
                      <span className="info-label">Área Total</span>
                      <span className="info-value">{project.area} m²</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Tipo</span>
                      <span className="info-value text-sm">{project.type}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Funcionários</span>
                      <span className="info-value">{project.employees}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Dias Estimados</span>
                      <span className="info-value">{project.estimatedDays}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Início: {new Date(project.startDate).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                      <span>
                        {project.status === "planning" && "Começar trabalho"}
                        {project.status === "in-progress" && "Ver tarefas"}
                        {project.status === "completed" && "Ver detalhes"}
                      </span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
