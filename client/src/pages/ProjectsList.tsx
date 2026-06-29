import React, { useState } from "react";
import { Calendar, Users, ArrowRight, Plus, MapPin, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

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



  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header mb-8">
          <h1>Minhas Obras</h1>
          <p>Acompanhe o progresso de todas as suas obras</p>
        </div>

        {projects.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: "1rem" }}>Nenhuma obra criada ainda</p>
            <button onClick={() => navigate("/new-project")} className="btn btn-primary">
              Criar Primeira Obra
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {projects.map((project) => {
              const statusInfo = {
                planning: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", text: "#3b82f6", label: "Planejamento" },
                "in-progress": { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)", text: "#22c55e", label: "Em Andamento" },
                completed: { bg: "rgba(168, 85, 247, 0.1)", border: "rgba(168, 85, 247, 0.3)", text: "#a855f7", label: "Concluído" },
              }[project.status];
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  style={{
                    background: statusInfo.bg,
                    border: `2px solid ${statusInfo.border}`,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(59, 130, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#fff", marginBottom: "0.5rem" }}>
                        {project.name}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                        <MapPin style={{ width: "16px", height: "16px" }} />
                        {project.location}
                      </div>
                    </div>
                    <div
                      style={{
                        background: statusInfo.bg,
                        border: `1px solid ${statusInfo.text}`,
                        borderRadius: "6px",
                        padding: "0.5rem 1rem",
                        color: statusInfo.text,
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      {statusInfo.label}
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        height: "8px",
                        background: "rgba(148, 163, 184, 0.2)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: `linear-gradient(90deg, ${statusInfo.text}, ${statusInfo.text}cc)`,
                          width: `${project.progress}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                      {project.progress}% concluído
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Área Total</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{project.area} m²</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Tipo</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{project.type}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Funcionários</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{project.employees}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Dias Estimados</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{project.estimatedDays}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    <Calendar style={{ width: "16px", height: "16px" }} />
                    Início: {new Date(project.startDate).toLocaleDateString("pt-BR")}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: `1px solid ${statusInfo.border}` }}>
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      {project.status === "planning" && "Clique para começar o trabalho"}
                      {project.status === "in-progress" && "Clique para ver tarefas do dia"}
                      {project.status === "completed" && "Obra finalizada"}
                    </p>
                    <ChevronRight style={{ width: "20px", height: "20px", color: statusInfo.text }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button onClick={() => navigate("/new-project")} className="btn btn-primary" style={{ minWidth: "200px" }}>
            + Criar Nova Obra
          </button>
        </div>
      </div>
    </div>
  );
}
