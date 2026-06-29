import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Calendar, 
  Plus, 
  BookOpen, 
  Wrench, 
  Home, 
  Menu, 
  X, 
  ChevronDown,
  Building,
  Users,
  Settings,
  Bell,
  Search,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState("/");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    const handleRouteChange = () => {
      setActivePath(window.location.pathname);
    };
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("popstate", handleRouteChange);
    
    handleRouteChange();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const navItems = [
    { 
      href: "/", 
      label: "Dashboard", 
      icon: Home,
      description: "Visão geral do dia"
    },
    { 
      href: "/daily", 
      label: "Hoje", 
      icon: Calendar,
      description: "Atividades do dia"
    },
    { 
      href: "/next-day", 
      label: "Próximo Dia", 
      icon: Plus,
      description: "Planejamento futuro"
    },
    { 
      href: "/projects", 
      label: "Projetos", 
      icon: Building,
      description: "Gestão de obras"
    },
    { 
      href: "/task-templates", 
      label: "Templates", 
      icon: Wrench,
      description: "Templates de tarefas"
    },
    { 
      href: "/catalog", 
      label: "Catálogo", 
      icon: BookOpen,
      description: "Materiais e recursos"
    },
    { 
      href: "/tasks", 
      label: "Tarefas", 
      icon: Wrench,
      description: "Atividades especializadas"
    },
  ];

  const secondaryItems = [
    { href: "/productivity", label: "Produtividade", icon: Settings },
    { href: "/team", label: "Equipe", icon: Users },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled 
            ? "glass py-3 border-b" 
            : "bg-background/80 backdrop-blur-sm py-4 border-b border-border/50"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-300">
                    <Home className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -inset-2 bg-primary/10 rounded-xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xl text-foreground">
                      ERP Restauro
                    </span>
                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      Pro
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Gestão Inteligente de Obras
                  </p>
                </div>
              </motion.a>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.a
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      className={cn(
                        "relative px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium group",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isActive && "scale-110"
                      )} />
                      {item.label}
                      
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {item.description}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
                      </div>
                    </motion.a>
                  </Link>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Pesquisar projetos, materiais..."
                  className="pl-10 pr-4 py-2 bg-muted/50 rounded-lg text-sm w-64 focus:w-72 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full animate-pulse" />
              </Button>

              {/* User menu */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium">Administrador</p>
                    <p className="text-xs text-muted-foreground">Restauro Master</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-200" />
                </Button>
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="glass rounded-lg p-2 shadow-lg border">
                    {secondaryItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors">
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </a>
                      </Link>
                    ))}
                    <div className="border-t my-2" />
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors text-muted-foreground">
                      <Settings className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t mt-3 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Pesquisar..."
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Mobile Navigation Items */}
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePath === item.href;
                    
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.a
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </motion.a>
                      </Link>
                    );
                  })}
                </div>

                {/* Secondary Items */}
                <div className="border-t mt-4 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {secondaryItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <a
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <item.icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">{item.label}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Navigation;