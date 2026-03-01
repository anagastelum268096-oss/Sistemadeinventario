import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Presentation, Group } from '@/app/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/app/components/ui/dialog';

interface EditPresentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presentation: Presentation;
  onUpdatePresentation: (id: string, presentation: Omit<Presentation, 'id'>) => void;
  groups: Group[];
}

export function EditPresentationDialog({ 
  open, 
  onOpenChange, 
  presentation,
  onUpdatePresentation, 
  groups 
}: EditPresentationDialogProps) {
  const [formData, setFormData] = useState({
    title: presentation.title,
    groupId: presentation.groupId,
    date: format(presentation.date, 'yyyy-MM-dd'),
    time: presentation.time,
    location: presentation.location,
    description: presentation.description || '',
    status: presentation.status,
  });

  useEffect(() => {
    if (presentation) {
      setFormData({
        title: presentation.title,
        groupId: presentation.groupId,
        date: format(presentation.date, 'yyyy-MM-dd'),
        time: presentation.time,
        location: presentation.location,
        description: presentation.description || '',
        status: presentation.status,
      });
    }
  }, [presentation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePresentation(presentation.id, {
      ...formData,
      date: new Date(formData.date + 'T00:00:00'),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Presentación</DialogTitle>
          <DialogDescription>
            Modifica la información de la presentación musical
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
              Estado *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Presentation['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Programado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
