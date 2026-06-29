import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, BookOpen, Wrench, Home, Menu, X } from "lucide-react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Hoje", icon: Calendar },
    { href: "/next-day", label: "Próximo Dia", icon: Plus },
    { href: "/catalog", label: "Catálogo", icon: BookOpen },
    { href: "/tasks", label: "Tarefas", icon: Wrench },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-white text-lg">ERP Obras</span>
                  <p className="text-xs text-slate-400">Gestão de Restauro</p>
                </div>
              </a>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-2 text-sm font-medium">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-700 space-y-2 animate-fade-in">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-3 font-medium"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
  );
}
