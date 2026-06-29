import React from "react";
import { Link } from "wouter";
import { Plus, Briefcase, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div className="page-header text-center mb-12">
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>ERP Restauro</h1>
          <p style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
            Gestão completa de obras de restauração e pintura
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1" style={{ gap: "2rem", marginBottom: "4rem" }}>
          {/* Nova Obra */}
          <Link href="/new-project">
            <a
              style={{
                display: "block",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <div
                className="card"
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <Plus
                    style={{
                      width: "3rem",
                      height: "3rem",
                      margin: "0 auto",
                      color: "#3b82f6",
                    }}
                  />
                </div>
                <h2 style={{ marginBottom: "0.5rem", color: "#fff" }}>Gerar Nova Obra</h2>
                <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                  Crie uma nova obra com cálculos automáticos de materiais e cronograma
                </p>
              </div>
            </a>
          </Link>

          {/* Minhas Obras */}
          <Link href="/projects">
            <a
              style={{
                display: "block",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <div
                className="card"
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <Briefcase
                    style={{
                      width: "3rem",
                      height: "3rem",
                      margin: "0 auto",
                      color: "#8b5cf6",
                    }}
                  />
                </div>
                <h2 style={{ marginBottom: "0.5rem", color: "#fff" }}>Minhas Obras</h2>
                <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                  Acompanhe o progresso de todas as suas obras em andamento
                </p>
              </div>
            </a>
          </Link>

          {/* Tarefas do Dia */}
          <Link href="/daily">
            <a
              style={{
                display: "block",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <div
                className="card"
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <BarChart3
                    style={{
                      width: "3rem",
                      height: "3rem",
                      margin: "0 auto",
                      color: "#ec4899",
                    }}
                  />
                </div>
                <h2 style={{ marginBottom: "0.5rem", color: "#fff" }}>Tarefas do Dia</h2>
                <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                  Veja e marque as tarefas realizadas hoje com cálculo automático de desvios
                </p>
              </div>
            </a>
          </Link>
        </div>

        {/* How It Works */}
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem", color: "#fff" }}>Como Funciona</h2>

          <div className="grid grid-cols-1" style={{ gap: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3b82f6",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div>
                <h3 style={{ marginBottom: "0.25rem", color: "#fff" }}>Criar Obra</h3>
                <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                  Defina o tipo, dimensões, equipe e condições de trabalho
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3b82f6",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div>
                <h3 style={{ marginBottom: "0.25rem", color: "#fff" }}>Calcular</h3>
                <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                  Sistema gera materiais necessários, equipamentos e cronograma automático
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3b82f6",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div>
                <h3 style={{ marginBottom: "0.25rem", color: "#fff" }}>Executar</h3>
                <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                  Marque tarefas concluídas diariamente no dashboard
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3b82f6",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                4
              </div>
              <div>
                <h3 style={{ marginBottom: "0.25rem", color: "#fff" }}>Ajustar</h3>
                <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                  Cronograma se adapta automaticamente à produtividade real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
