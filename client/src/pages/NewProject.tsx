import React, { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";

interface Room {
  id: string;
  name: string;
  type: string;
  area: number;
  hasFloor: boolean;
  floorType: string;
  hasPainting: boolean;
  hasPlumbing: boolean;
  hasElectrical: boolean;
  notes: string;
}

interface ProjectData {
  name: string;
  location: string;
  restorationType: string[];
  selectedItems: string[];
  rooms: Room[];
  numberOfEmployees: number;
  startDate: string;
  workOnSaturday: boolean;
  workOnSunday: boolean;
}

const RESTORATION_TYPES = [
  { id: "external-paint", name: "Pintura Externa", icon: "🏢" },
  { id: "internal-paint", name: "Pintura Interna", icon: "🏠" },
  { id: "facade", name: "Restauração Fachada", icon: "🏗️" },
  { id: "cleaning", name: "Limpeza Fachada", icon: "🧹" },
  { id: "cracks", name: "Tratamento Trincas", icon: "🔧" },
  { id: "bathroom", name: "Banheiro", icon: "🚿" },
  { id: "internal-house", name: "Casa Interna", icon: "🏡" },
  { id: "full-house", name: "Casa Inteira", icon: "🏘️" },
];

const AVAILABLE_ITEMS = {
  epis: [
    { id: "helmet", name: "Capacete de Segurança" },
    { id: "gloves", name: "Luvas de Proteção" },
    { id: "glasses", name: "Óculos de Segurança" },
    { id: "mask", name: "Máscara Respiratória" },
    { id: "boots", name: "Bota de Segurança" },
    { id: "vest", name: "Colete Refletor" },
  ],
  tools: [
    { id: "pressure-washer", name: "Lava-Jato" },
    { id: "brush", name: "Pincéis" },
    { id: "roller", name: "Rolos" },
    { id: "spatula", name: "Espátulas" },
    { id: "sander", name: "Lixadeira" },
    { id: "ladder", name: "Escada" },
  ],
  materials: [
    { id: "acrylic-paint", name: "Tinta Acrílica" },
    { id: "epoxy-primer", name: "Primer Epóxi" },
    { id: "filler", name: "Massa Reparadora" },
    { id: "sealant", name: "Selante Poliuretano" },
    { id: "mortar", name: "Argamassa Cal" },
    { id: "resin", name: "Resina de Injeção" },
  ],
  equipment: [
    { id: "scaffold", name: "Andaime" },
    { id: "compressor", name: "Compressor" },
    { id: "generator", name: "Gerador" },
    { id: "pump", name: "Bomba" },
  ],
};

export default function NewProject() {
  const [step, setStep] = useState<"type" | "items" | "rooms" | "details" | "calendar">("type");
  const [formData, setFormData] = useState<ProjectData>({
    name: "",
    location: "",
    restorationType: [],
    selectedItems: [],
    rooms: [],
    numberOfEmployees: 1,
    startDate: new Date().toISOString().split("T")[0],
    workOnSaturday: false,
    workOnSunday: false,
  });

  const [currentRoom, setCurrentRoom] = useState<Room>({
    id: Date.now().toString(),
    name: "",
    type: "Sala",
    area: 0,
    hasFloor: false,
    floorType: "",
    hasPainting: true,
    hasPlumbing: false,
    hasElectrical: false,
    notes: "",
  });

  // Passo 1: Selecionar Tipo de Restauro
  if (step === "type") {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="page-header mb-8">
            <h1>Qual é o tipo de restauro?</h1>
            <p>Selecione um ou mais tipos de trabalho que será realizado</p>
          </div>

          <div className="grid grid-cols-1" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {RESTORATION_TYPES.map((type) => (
              <div
                key={type.id}
                onClick={() => {
                  const isSelected = formData.restorationType.includes(type.id);
                  setFormData({
                    ...formData,
                    restorationType: isSelected
                      ? formData.restorationType.filter((t) => t !== type.id)
                      : [...formData.restorationType, type.id],
                  });
                }}
                style={{
                  padding: "1.5rem",
                  borderRadius: "12px",
                  background: formData.restorationType.includes(type.id)
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(30, 41, 59, 0.8)",
                  border: `2px solid ${
                    formData.restorationType.includes(type.id)
                      ? "rgba(59, 130, 246, 0.8)"
                      : "rgba(148, 163, 184, 0.2)"
                  }`,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{type.icon}</p>
                <p style={{ fontWeight: "600", color: "#fff", marginBottom: "0.5rem" }}>{type.name}</p>
                {formData.restorationType.includes(type.id) && (
                  <CheckCircle2 style={{ width: "20px", height: "20px", color: "#3b82f6", margin: "0 auto" }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => window.history.back()} className="btn btn-secondary" style={{ flex: 1 }}>
              Voltar
            </button>
            <button
              onClick={() => {
                if (formData.restorationType.length === 0) {
                  toast.error("Selecione pelo menos um tipo de restauro");
                  return;
                }
                setStep("items");
              }}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Passo 2: Selecionar Itens
  if (step === "items") {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="page-header mb-8">
            <h1>Selecione os itens necessários</h1>
            <p>Marque os EPIs, ferramentas, materiais e equipamentos que serão usados</p>
          </div>

          <div className="grid grid-cols-1" style={{ gap: "2rem", marginBottom: "2rem" }}>
            {Object.entries(AVAILABLE_ITEMS).map(([category, items]) => (
              <div key={category} className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ marginBottom: "1rem", textTransform: "uppercase", fontSize: "0.9rem", color: "#94a3b8" }}>
                  {category === "epis" && "EPIs"}
                  {category === "tools" && "Ferramentas"}
                  {category === "materials" && "Materiais"}
                  {category === "equipment" && "Equipamentos"}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  {items.map((item: any) => (
                    <label
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        background: formData.selectedItems.includes(item.id)
                          ? "rgba(59, 130, 246, 0.1)"
                          : "transparent",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = formData.selectedItems.includes(item.id)
                          ? "rgba(59, 130, 246, 0.1)"
                          : "transparent";
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedItems: [...formData.selectedItems, item.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedItems: formData.selectedItems.filter((i) => i !== item.id),
                            });
                          }
                        }}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <span style={{ color: "#cbd5e1" }}>{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => setStep("type")} className="btn btn-secondary" style={{ flex: 1 }}>
              Voltar
            </button>
            <button onClick={() => setStep("rooms")} className="btn btn-primary" style={{ flex: 1 }}>
              Próximo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Passo 3: Descrever Cômodos
  if (step === "rooms") {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="page-header mb-8">
            <h1>Descreva os cômodos</h1>
            <p>Adicione cada cômodo com suas características</p>
          </div>

          {/* Lista de Cômodos */}
          {formData.rooms.length > 0 && (
            <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Cômodos Adicionados</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {formData.rooms.map((room) => (
                  <div
                    key={room.id}
                    style={{
                      padding: "1rem",
                      borderRadius: "8px",
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: "600", color: "#fff", marginBottom: "0.25rem" }}>
                        {room.name} ({room.type})
                      </p>
                      <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                        {room.area} m² {room.hasFloor && `• Piso: ${room.floorType}`} {room.hasPlumbing && "• Hidráulica"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          rooms: formData.rooms.filter((r) => r.id !== room.id),
                        });
                      }}
                      style={{
                        background: "rgba(239, 68, 68, 0.2)",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        cursor: "pointer",
                        color: "#f87171",
                      }}
                    >
                      <Trash2 style={{ width: "18px", height: "18px" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulário para Adicionar Cômodo */}
          <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>Adicionar Novo Cômodo</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nome do Cômodo *</label>
                <input
                  type="text"
                  value={currentRoom.name}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                  placeholder="Ex: Sala de Estar"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tipo de Cômodo *</label>
                <select value={currentRoom.type} onChange={(e) => setCurrentRoom({ ...currentRoom, type: e.target.value })}>
                  <option>Sala</option>
                  <option>Quarto</option>
                  <option>Banheiro</option>
                  <option>Cozinha</option>
                  <option>Corredor</option>
                  <option>Outro</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Área (m²) *</label>
              <input
                type="number"
                step="0.1"
                value={currentRoom.area || ""}
                onChange={(e) => setCurrentRoom({ ...currentRoom, area: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 20"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ marginBottom: "1rem", fontWeight: "600", color: "#fff" }}>Características</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={currentRoom.hasPainting}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, hasPainting: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>Tem pintura</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={currentRoom.hasFloor}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, hasFloor: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>Tem piso</span>
                </label>
                {currentRoom.hasFloor && (
                  <input
                    type="text"
                    value={currentRoom.floorType}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, floorType: e.target.value })}
                    placeholder="Tipo de piso (cerâmica, madeira, etc)"
                    style={{ marginLeft: "2rem", marginTop: "0.5rem" }}
                  />
                )}
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={currentRoom.hasPlumbing}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, hasPlumbing: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>Tem hidráulica</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={currentRoom.hasElectrical}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, hasElectrical: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>Tem elétrica</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                value={currentRoom.notes}
                onChange={(e) => setCurrentRoom({ ...currentRoom, notes: e.target.value })}
                placeholder="Ex: Parede com mofo, trincas, etc"
                style={{ minHeight: "80px", fontFamily: "Inter, sans-serif" }}
              />
            </div>

            <button
              onClick={() => {
                if (!currentRoom.name || currentRoom.area === 0) {
                  toast.error("Preencha nome e área do cômodo");
                  return;
                }
                setFormData({
                  ...formData,
                  rooms: [...formData.rooms, currentRoom],
                });
                setCurrentRoom({
                  id: Date.now().toString(),
                  name: "",
                  type: "Sala",
                  area: 0,
                  hasFloor: false,
                  floorType: "",
                  hasPainting: true,
                  hasPlumbing: false,
                  hasElectrical: false,
                  notes: "",
                });
                toast.success("Cômodo adicionado!");
              }}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              <Plus style={{ width: "18px", height: "18px" }} /> Adicionar Cômodo
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => setStep("items")} className="btn btn-secondary" style={{ flex: 1 }}>
              Voltar
            </button>
            <button
              onClick={() => {
                if (formData.rooms.length === 0) {
                  toast.error("Adicione pelo menos um cômodo");
                  return;
                }
                setStep("details");
              }}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Passo 4: Detalhes Finais
  if (step === "details") {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: "700px" }}>
          <div className="page-header mb-8">
            <h1>Detalhes da Obra</h1>
            <p>Preencha os últimos detalhes para gerar o cronograma</p>
          </div>

          <div className="card" style={{ padding: "2rem" }}>
            <div className="form-group">
              <label>Nome da Obra *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Restauração Apartamento Centro"
                required
              />
            </div>

            <div className="form-group">
              <label>Localização *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Rua das Flores, 123 - São Paulo"
                required
              />
            </div>

            <div className="form-group">
              <label>Número de Funcionários *</label>
              <input
                type="number"
                min="1"
                value={formData.numberOfEmployees}
                onChange={(e) => setFormData({ ...formData, numberOfEmployees: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="form-group">
              <label>Data de Início *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <p style={{ marginBottom: "1rem", fontWeight: "600", color: "#fff" }}>Dias de Trabalho</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.workOnSaturday}
                    onChange={(e) => setFormData({ ...formData, workOnSaturday: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>Trabalhar aos sábados</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.workOnSunday}
                    onChange={(e) => setFormData({ ...formData, workOnSunday: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>Trabalhar aos domingos</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setStep("rooms")} className="btn btn-secondary" style={{ flex: 1 }}>
                Voltar
              </button>
              <button
                onClick={() => {
                  if (!formData.name || !formData.location) {
                    toast.error("Preencha todos os campos");
                    return;
                  }
                  setStep("calendar");
                  toast.success("Cronograma gerado!");
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Gerar Cronograma
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Passo 5: Calendário
  if (step === "calendar") {
    const totalArea = formData.rooms.reduce((sum, room) => sum + room.area, 0);
    const estimatedDays = Math.ceil((totalArea / 25) / formData.numberOfEmployees);

    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="page-header mb-8">
            <h1>{formData.name}</h1>
            <p>{formData.location}</p>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Área Total</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", color: "#3b82f6" }}>{totalArea.toFixed(0)} m²</p>
            </div>
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Cômodos</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", color: "#8b5cf6" }}>{formData.rooms.length}</p>
            </div>
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Funcionários</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", color: "#ec4899" }}>{formData.numberOfEmployees}</p>
            </div>
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Dias Estimados</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", color: "#10b981" }}>{estimatedDays}</p>
            </div>
          </div>

          {/* Cômodos */}
          <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Cômodos da Obra</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {formData.rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    background: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <p style={{ fontWeight: "600", color: "#fff", marginBottom: "0.5rem" }}>
                    {room.name} ({room.type})
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    Área: {room.area} m²
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {room.hasPainting && <span className="badge badge-info">Pintura</span>}
                    {room.hasFloor && <span className="badge badge-info">Piso: {room.floorType}</span>}
                    {room.hasPlumbing && <span className="badge badge-info">Hidráulica</span>}
                    {room.hasElectrical && <span className="badge badge-info">Elétrica</span>}
                  </div>
                  {room.notes && <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>Obs: {room.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Itens Selecionados */}
          <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Itens Selecionados</h2>
            <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>Total de {formData.selectedItems.length} itens</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              {formData.selectedItems.map((itemId) => {
                for (const [category, items] of Object.entries(AVAILABLE_ITEMS)) {
                  const item = items.find((i: any) => i.id === itemId);
                  if (item) {
                    return (
                      <div key={itemId} className="badge badge-success" style={{ padding: "0.75rem", textAlign: "center" }}>
                        {item.name}
                      </div>
                    );
                  }
                }
                return null;
              })}
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => setStep("details")} className="btn btn-secondary" style={{ flex: 1 }}>
              Voltar
            </button>
            <button
              onClick={() => {
                toast.success("Obra criada com sucesso!");
              }}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Confirmar e Começar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
