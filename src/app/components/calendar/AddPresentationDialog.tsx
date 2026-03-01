import { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { Presentation, Group } from '@/app/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/app/components/ui/dialog';

interface AddPresentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPresentation: (presentation: Omit<Presentation, 'id'>) => void;
  groups: Group[];
  initialDate?: Date;
}

export function AddPresentationDialog({ 
  open, 
  onOpenChange, 
  onAddPresentation, 
  groups,
  initialDate 
}: AddPresentationDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    groupId: groups[0]?.id || '',
    date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    time: '19:00',
    location: '',
    description: '',
    status: 'scheduled' as Presentation['status'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPresentation({
      ...formData,
      date: new Date(formData.date + 'T00:00:00'),
    });
    setFormData({
      title: '',
      groupId: groups[0]?.id || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '19:00',
      location: '',
      description: '',
      status: 'scheduled',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Presentación</DialogTitle>
          <DialogDescription>
            Completa el formulario para programar una nueva presentación musical
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la Presentación *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Concierto de Primavera"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo *
            </label>
            <select
              required
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Auditorio Principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalles adicionales sobre la presentación..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Presentación
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}