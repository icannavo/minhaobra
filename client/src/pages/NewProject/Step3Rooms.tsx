import React from "react";
import { Plus, Home, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Room {
  id: string;
  name: string;
  area: number;
  floorType: string;
  characteristics: string[];
}

interface Step3RoomsProps {
  rooms: Room[];
  totalArea: number;
  onAddRoom: () => void;
  onUpdateRoom: (id: string, field: keyof Room, value: any) => void;
  onRemoveRoom: (id: string) => void;
}

const RoomCard = React.memo(({ 
  room, 
  index, 
  onUpdate, 
  onRemove 
}: { 
  room: Room; 
  index: number; 
  onUpdate: (id: string, field: keyof Room, value: any) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="modern-card p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Ambiente {index + 1}</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(room.id)}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`name-${room.id}`}>Nome do Ambiente</Label>
          <Input
            id={`name-${room.id}`}
            placeholder="Ex: Sala de Estar"
            value={room.name}
            onChange={(e) => onUpdate(room.id, 'name', e.target.value)}
            className="mt-1.5"
          />
        </div>
        
        <div>
          <Label htmlFor={`area-${room.id}`}>Área (m²)</Label>
          <Input
            id={`area-${room.id}`}
            type="number"
            placeholder="0"
            value={room.area || ''}
            onChange={(e) => onUpdate(room.id, 'area', Number(e.target.value))}
            className="mt-1.5"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor={`floor-${room.id}`}>Tipo de Piso/Parede</Label>
          <Input
            id={`floor-${room.id}`}
            placeholder="Ex: Concreto, Madeira, Azulejo"
            value={room.floorType}
            onChange={(e) => onUpdate(room.id, 'floorType', e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
});

RoomCard.displayName = 'RoomCard';

export const Step3Rooms = React.memo<Step3RoomsProps>(({ 
  rooms, 
  totalArea, 
  onAddRoom, 
  onUpdateRoom, 
  onRemoveRoom 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Adicione os Ambientes</h2>
        <p className="text-slate-400">Defina os ambientes que serão trabalhados</p>
      </div>
      
      {rooms.length === 0 && (
        <div className="modern-card p-12 text-center">
          <Home className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Nenhum ambiente adicionado</p>
          <Button onClick={onAddRoom} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Ambiente
          </Button>
        </div>
      )}

      {rooms.length > 0 && (
        <>
          <div className="space-y-4">
            {rooms.map((room, index) => (
              <RoomCard
                key={room.id}
                room={room}
                index={index}
                onUpdate={onUpdateRoom}
                onRemove={onRemoveRoom}
              />
            ))}
          </div>

          <Button onClick={onAddRoom} variant="outline" className="w-full gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Outro Ambiente
          </Button>

          {totalArea > 0 && (
            <div className="modern-card p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Área Total:</span>
                <span className="text-2xl font-bold text-primary">{totalArea} m²</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

Step3Rooms.displayName = 'Step3Rooms';
