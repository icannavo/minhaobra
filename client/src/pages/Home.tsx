import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Plus, 
  Briefcase, 
  BarChart3, 
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -8,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  }
};

export default function Home() {
  const features = [
    {
      icon: Target,
      title: "Precisão Total",
      description: "Cálculos automáticos de materiais e cronogramas",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Gestão Inteligente",
      description: "Acompanhamento em tempo real do progresso",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Equipe Conectada",
      description: "Colaboração eficiente entre todos os envolvidos",
      color: "text-purple-500"
    },
    {
      icon: Clock,
      title: "Otimização de Tempo",
      description: "Reduza prazos e custos com planejamento eficiente",
      color: "text-orange-500"
    }
  ];

  const mainActions = [
    {
      href: "/new-project",
      icon: Plus,
      title: "Gerar Nova Obra",
      description: "Crie uma nova obra com cálculos automáticos de materiais e cronograma",
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      href: "/projects",
      icon: Briefcase,
      title: "Minhas Obras",
      description: "Acompanhe o progresso de todas as suas obras em andamento",
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500"
    },
    {
      href: "/daily",
      icon: BarChart3,
      title: "Tarefas do Dia",
      description: "Veja e marque as tarefas realizadas hoje com cálculo automático de desvios",
      gradient: "from-pink-500 to-rose-500",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-500"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Criar Obra",
      description: "Defina o tipo, dimensões, equipe e condições de trabalho",
      icon: Plus
    },
    {
      number: "02",
      title: "Calcular",
      description: "Sistema gera materiais necessários, equipamentos e cronograma automático",
      icon: Calendar
    },
    {
      number: "03",
      title: "Executar",
      description: "Marque tarefas concluídas diariamente no dashboard",
      icon: CheckCircle2
    },
    {
      number: "04",
      title: "Ajustar",
      description: "Cronograma se adapta automaticamente à produtividade real",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Gestão Inteligente de Obras</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            ERP Restauro
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Gestão completa de obras de{" "}
            <span className="text-foreground font-semibold">restauração e pintura</span>
            {" "}com tecnologia de ponta
          </p>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {mainActions.map((action, index) => (
            <motion.div key={action.href} variants={itemVariants}>
              <Link href={action.href}>
                <motion.div
                  className="block h-full"
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden group cursor-pointer">
                    <CardContent className="p-6 lg:p-8 relative">
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      {/* Icon */}
                      <div className={`${action.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {action.description}
                      </p>
                      
                      {/* Arrow */}
                      <div className="flex items-center text-primary font-medium group-hover:gap-2 gap-0 transition-all duration-300">
                        <span>Acessar</span>
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Por que escolher o ERP Restauro?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A solução completa para transformar a gestão das suas obras
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 h-full">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="overflow-hidden border-2">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                  Como Funciona
                </h2>
                <p className="text-muted-foreground text-lg">
                  Simples, rápido e eficiente em 4 passos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="relative"
                  >
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-1/2 z-0" />
                    )}
                    
                    <div className="relative z-10">
                      {/* Number badge */}
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg mb-4 shadow-lg shadow-primary/20">
                        {step.number}
                      </div>
                      
                      {/* Icon */}
                      <div className="mb-4">
                        <step.icon className="w-8 h-8 text-primary" />
                      </div>
                      
                      {/* Content */}
                      <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Crie sua primeira obra agora e experimente a revolução na gestão de restauro
              </p>
              <Link href="/new-project">
                <Button size="lg" className="text-lg px-8 py-6 h-auto group">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Criar Nova Obra
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}