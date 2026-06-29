import React from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Ruler,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

export default function ProjectDetails() {
  const [, params] = useRoute("/project/:id");
  const [, navigate] = useLocation();
  const projectId = params?.id;

  // Buscar dados da obra
  const { data: work, isLoading } = trpc.works.getById.useQuery(
    { id: parseInt(projectId || "0") },
    { enabled: !!projectId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Projeto não encontrado</h2>
          <p className="text-slate-400 mb-6">O projeto que você está procurando não existe.</p>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Projetos
          </Button>
        </div>
      </div>
    );
  }

  // Calcular métricas
  const estimatedDays = work.estimatedEndDate && work.startDate
    ? Math.ceil((new Date(work.estimatedEndDate).getTime() - new Date(work.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const completedDays = work.startDate
    ? Math.max(0, Math.ceil((new Date().getTime() - new Date(work.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  const progress = estimatedDays > 0 ? Math.min(100, Math.round((completedDays / estimatedDays) * 100)) : 0;
  
  const area = parseInt(work.description?.match(/(\d+)m²/)?.[1] || "0");

  const statusConfig = {
    "Planejamento": { 
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      icon: Clock
    },
    "Em Andamento": { 
      className: "bg-green-500/10 text-green-400 border-green-500/20",
      icon: TrendingUp
    },
    "Concluído": { 
      className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: CheckCircle2
    },
  };

  const config = statusConfig[work.status as keyof typeof statusConfig] || statusConfig["Planejamento"];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/projects")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Projetos
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl lg:text-4xl font-bold text-white">{work.name}</h1>
                <Badge className={`${config.className} border flex items-center gap-1.5`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {work.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{work.location || "Localização não informada"}</span>
                </div>
                {work.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Início: {new Date(work.startDate).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </Button>
              <Button className="gap-2">
                <FileText className="w-4 h-4" />
                Relatório
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Progresso Geral</CardTitle>
              <CardDescription>Acompanhe o andamento do projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Conclusão</span>
                  <span className="text-2xl font-bold text-white">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{completedDays}</div>
                    <div className="text-sm text-slate-400">Dias Decorridos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{estimatedDays}</div>
                    <div className="text-sm text-slate-400">Dias Estimados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{Math.max(0, estimatedDays - completedDays)}</div>
                    <div className="text-sm text-slate-400">Dias Restantes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{area}</div>
                    <div className="text-sm text-slate-400">m² Total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
              <TabsTrigger value="materials">Materiais</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Informações do Projeto */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Informações do Projeto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400">Nome</span>
                      <span className="text-white font-medium">{work.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400">Localização</span>
                      <span className="text-white font-medium">{work.location || "Não informado"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400">Status</span>
                      <Badge className={config.className}>{work.status}</Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400">Data de Início</span>
                      <span className="text-white font-medium">
                        {work.startDate ? new Date(work.startDate).toLocaleDateString("pt-BR") : "Não definido"}
                      </span>
                    </div>
                    {work.estimatedEndDate && (
                      <div className="flex justify-between py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Previsão de Término</span>
                        <span className="text-white font-medium">
                          {new Date(work.estimatedEndDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Área Total</span>
                      <span className="text-white font-medium">{area} m²</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Descrição */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Descrição
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {work.description || "Nenhuma descrição disponível."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Em Desenvolvimento</h3>
                  <p className="text-slate-400">O módulo de tarefas estará disponível em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Em Desenvolvimento</h3>
                  <p className="text-slate-400">O módulo de equipe estará disponível em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Ruler className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Em Desenvolvimento</h3>
                  <p className="text-slate-400">O módulo de materiais estará disponível em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
