import React from "react";
import { Building, MapPin, Users, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Step4DetailsProps {
  name: string;
  location: string;
  employees: number;
  startDate: string;
  totalArea: number;
  estimatedDays: number;
  endDate: string;
  onNameChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onEmployeesChange: (value: number) => void;
  onStartDateChange: (value: string) => void;
}

export const Step4Details = React.memo<Step4DetailsProps>(({
  name,
  location,
  employees,
  startDate,
  totalArea,
  estimatedDays,
  endDate,
  onNameChange,
  onLocationChange,
  onEmployeesChange,
  onStartDateChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Detalhes da Obra</h2>
        <p className="text-slate-400">Informações gerais e equipe</p>
      </div>

      <div className="modern-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Nome da Obra *
            </Label>
            <Input
              id="name"
              placeholder="Ex: Restauração Edifício Centro"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Localização *
            </Label>
            <Input
              id="location"
              placeholder="Ex: Rua das Flores, 123 - Centro"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Número de Funcionários
            </Label>
            <Input
              id="employees"
              type="number"
              min="1"
              value={employees}
              onChange={(e) => onEmployeesChange(Number(e.target.value))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Início
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {totalArea > 0 && employees > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
            <div className="stats-card bg-blue-500/10 border-blue-500/20">
              <div className="stats-label">Área Total</div>
              <div className="stats-value text-blue-400">{totalArea}</div>
              <div className="stats-unit">m²</div>
            </div>
            <div className="stats-card bg-green-500/10 border-green-500/20">
              <div className="stats-label">Dias Estimados</div>
              <div className="stats-value text-green-400">{estimatedDays}</div>
              <div className="stats-unit">dias úteis</div>
            </div>
            <div className="stats-card bg-purple-500/10 border-purple-500/20">
              <div className="stats-label">Previsão Término</div>
              <div className="stats-value text-sm text-purple-400">
                {endDate ? new Date(endDate).toLocaleDateString('pt-BR') : '-'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Step4Details.displayName = 'Step4Details';
