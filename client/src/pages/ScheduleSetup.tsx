import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface ScheduleConfig {
  workMonday: boolean;
  workTuesday: boolean;
  workWednesday: boolean;
  workThursday: boolean;
  workFriday: boolean;
  workSaturday: boolean;
  workSunday: boolean;
  holidays: string[];
  hoursPerDay: number;
  startDate: string;
}

const SAMPLE_HOLIDAYS = [
  "2026-01-01",
  "2026-04-21",
  "2026-05-01",
  "2026-09-07",
  "2026-10-12",
  "2026-11-02",
  "2026-11-20",
  "2026-12-25",
];

export default function ScheduleSetup() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ScheduleConfig>({
    workMonday: true,
    workTuesday: true,
    workWednesday: true,
    workThursday: true,
    workFriday: true,
    workSaturday: false,
    workSunday: false,
    holidays: [],
    hoursPerDay: 8,
    startDate: new Date().toISOString().split("T")[0],
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleDayToggle = (day: string) => {
    setConfig((prev) => ({
      ...prev,
      [day]: !prev[day as keyof ScheduleConfig],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: name === "hoursPerDay" ? parseInt(value) : value,
    }));
  };

  const toggleHoliday = (date: string) => {
    setConfig((prev) => ({
      ...prev,
      holidays: prev.holidays.includes(date)
        ? prev.holidays.filter((h) => h !== date)
        : [...prev.holidays, date],
    }));
  };

  const generateSchedule = () => {
    const workDays = [
      config.workMonday,
      config.workTuesday,
      config.workWednesday,
      config.workThursday,
      config.workFriday,
      config.workSaturday,
      config.workSunday,
    ];

    const totalWorkDaysPerWeek = workDays.filter((d) => d).length;
    const dailyHours = config.hoursPerDay;

    // Simular cronograma de 4 semanas
    const schedule: any[] = [];
    const startDate = new Date(config.startDate);

    for (let i = 0; i < 28; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split("T")[0];
      const isHoliday = config.holidays.includes(dateStr);

      let isWorkDay = false;
      if (dayOfWeek === 0) isWorkDay = config.workSunday;
      else if (dayOfWeek === 1) isWorkDay = config.workMonday;
      else if (dayOfWeek === 2) isWorkDay = config.workTuesday;
      else if (dayOfWeek === 3) isWorkDay = config.workWednesday;
      else if (dayOfWeek === 4) isWorkDay = config.workThursday;
      else if (dayOfWeek === 5) isWorkDay = config.workFriday;
      else if (dayOfWeek === 6) isWorkDay = config.workSaturday;

      if (isWorkDay && !isHoliday) {
        schedule.push({
          date: dateStr,
          day: currentDate.toLocaleDateString("pt-BR", { weekday: "long" }),
          hours: dailyHours,
          tasks: [],
        });
      }
    }

    return { schedule, totalWorkDaysPerWeek };
  };

  const { schedule } = generateSchedule();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Configurar Cronograma</h1>
          <p className="text-slate-400 mt-2">Defina os dias e horários de trabalho</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? "bg-blue-500" : "bg-slate-700"}`} />
          <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? "bg-blue-500" : "bg-slate-700"}`} />
          <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 3 ? "bg-blue-500" : "bg-slate-700"}`} />
        </div>

        {/* Step 1: Days of Week */}
        {step === 1 && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-white font-semibold mb-4">Quais dias você trabalha?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "workMonday", label: "Segunda" },
                  { key: "workTuesday", label: "Terça" },
                  { key: "workWednesday", label: "Quarta" },
                  { key: "workThursday", label: "Quinta" },
                  { key: "workFriday", label: "Sexta" },
                  { key: "workSaturday", label: "Sábado" },
                  { key: "workSunday", label: "Domingo" },
                ].map((day) => (
                  <button
                    key={day.key}
                    onClick={() => handleDayToggle(day.key)}
                    className={`p-4 rounded-lg font-semibold transition-all ${
                      config[day.key as keyof ScheduleConfig]
                        ? "bg-blue-500 text-white"
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 btn btn-primary">
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Hours and Holidays */}
        {step === 2 && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Horas de Trabalho por Dia</label>
              <Input
                type="number"
                name="hoursPerDay"
                value={config.hoursPerDay}
                onChange={handleInputChange}
                min="4"
                max="12"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Data de Início</label>
              <Input
                type="date"
                name="startDate"
                value={config.startDate}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <p className="text-white font-semibold mb-4">Feriados a Considerar</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SAMPLE_HOLIDAYS.map((holiday) => {
                  const date = new Date(holiday);
                  const label = date.toLocaleDateString("pt-BR");
                  return (
                    <button
                      key={holiday}
                      onClick={() => toggleHoliday(holiday)}
                      className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                        config.holidays.includes(holiday)
                          ? "bg-red-500 text-white"
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="divider" />

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 btn btn-secondary">
                Voltar
              </button>
              <button onClick={() => setShowPreview(true)} className="flex-1 btn btn-primary">
                Visualizar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Cronograma de Trabalho</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Horas/Dia</p>
                <p className="text-2xl font-bold text-blue-400">{config.hoursPerDay}</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Dias de Trabalho</p>
                <p className="text-2xl font-bold text-green-400">{schedule.length}</p>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="font-semibold text-white mb-3">Próximas 4 Semanas</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {schedule.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {new Date(day.date).toLocaleDateString("pt-BR", { weekday: "long" })}
                        </p>
                        <p className="text-xs text-slate-400">{day.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <p className="font-semibold text-green-400">{day.hours}h</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="alert alert-info">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                Total de <strong>{schedule.length}</strong> dias de trabalho planejados
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowPreview(false)} className="flex-1 btn btn-secondary">
                Voltar
              </button>
              <button
                onClick={() => {
                  toast.success("Cronograma configurado com sucesso!");
                  setShowPreview(false);
                }}
                className="flex-1 btn btn-primary"
              >
                Confirmar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
