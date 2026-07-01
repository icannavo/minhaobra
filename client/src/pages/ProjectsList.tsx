import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronRight, Briefcase, Plus, Edit, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { EditWorkDialog } from "@/components/EditWorkDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
  const [editingWork, setEditingWork] = useState<any>(null);
  
  // Buscar obras REAIS do banco de dados
  const { data: worksData, isLoading, refetch } = trpc.works.getAll.useQuery();
  
  const deleteMutation = trpc.works.delete.useMutation({
    onSuccess: () => {
      toast.success("Obra excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (e: React.MouseEvent, work: any) => {
    e.stopPropagation();
    setEditingWork(work);
  };
  
  // Mapear dados do banco para o formato da interface
  const projects: Project[] = (worksData || []).map((work) => {
    // Calcular status baseado no status da obra
    let status: "planning" | "in-progress" | "completed" = "planning";
    if (work.status === "Em Andamento") status = "in-progress";
    else if (work.status === "Concluído") status = "completed";
    
    // Calcular progresso estimado (exemplo simples - pode ser refinado)
    const estimatedDays = work.estimatedEndDate && work.startDate
      ? Math.ceil((new Date(work.estimatedEndDate).getTime() - new Date(work.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 10;
    
    const completedDays = work.startDate
      ? Math.max(0, Math.ceil((new Date().getTime() - new Date(work.startDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    
    const progress = estimatedDays > 0 ? Math.min(100, Math.round((completedDays / estimatedDays) * 100)) : 0;
    
    return {
      id: work.id.toString(),
      name: work.name,
      type: work.description?.split(' - ')[0] || "Obra",
      location: work.location || "Não informado",
      area: parseInt(work.description?.match(/(\d+)m²/)?.[1] || "0"),
      employees: 1, // Pode ser adicionado ao schema futuramente
      startDate: work.startDate || new Date().toISOString().split('T')[0],
      estimatedDays,
      completedDays,
      progress: status === "completed" ? 100 : progress,
      status,
    };
  });

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
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">Carregando obras...</p>
          </div>
        ) : projects.length === 0 ? (
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEdit(e, worksData?.find(w => w.id.toString() === project.id))}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, parseInt(project.id))}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <span className={`status-badge ${config.className}`}>
                        {config.label}
                      </span>
                    </div>
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

      {/* Edit Dialog */}
      {editingWork && (
        <EditWorkDialog
          work={editingWork}
          open={!!editingWork}
          onOpenChange={(open) => !open && setEditingWork(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
