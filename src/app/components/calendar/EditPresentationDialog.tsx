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
    groupIds: presentation.groupIds || [], // Cambiado a groupIds
    date: format(presentation.date, 'yyyy-MM-dd'),
    time: presentation.time,
    location: presentation.location,
    description: presentation.description || '',
    groupDescriptions: presentation.groupDescriptions || {},
    status: presentation.status,
  });

  useEffect(() => {
    if (presentation) {
      setFormData({
        title: presentation.title,
        groupIds: presentation.groupIds || [], // Cambiado a groupIds
        date: format(presentation.date, 'yyyy-MM-dd'),
        time: presentation.time,
        location: presentation.location,
        description: presentation.description || '',
        groupDescriptions: presentation.groupDescriptions || {},
        status: presentation.status,
      });
    }
  }, [presentation]);

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => {
      const isRemoving = prev.groupIds.includes(groupId);
      const newGroupDescriptions = { ...prev.groupDescriptions };
      
      // Si se está removiendo el grupo, eliminar su descripción
      if (isRemoving) {
        delete newGroupDescriptions[groupId];
      }
      
      return {
        ...prev,
        groupIds: isRemoving
          ? prev.groupIds.filter(id => id !== groupId)
          : [...prev.groupIds, groupId],
        groupDescriptions: newGroupDescriptions
      };
    });
  };

  const handleGroupDescriptionChange = (groupId: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      groupDescriptions: {
        ...prev.groupDescriptions,
        [groupId]: description
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.groupIds.length === 0) {
      alert('Selecciona al menos un grupo para la presentación');
      return;
    }
    onUpdatePresentation(presentation.id, {
      ...formData,
      date: new Date(formData.date + 'T00:00:00'),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupos Participantes * (Selecciona uno o más)
            </label>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleGroupToggle(group.id)}
                  className={`px-4 py-2 border-2 rounded-lg transition-all ${
                    formData.groupIds.includes(group.id) 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {group.name} ({group.type})
                </button>
              ))}
            </div>
            {formData.groupIds.length > 0 && (
              <p className="text-xs text-green-600 mt-2">
                {formData.groupIds.length} grupo{formData.groupIds.length > 1 ? 's' : ''} seleccionado{formData.groupIds.length > 1 ? 's' : ''}
              </p>
            )}
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

          {/* Descripciones específicas por grupo */}
          {formData.groupIds.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Detalles Específicos por Grupo
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Agrega información adicional específica para cada grupo participante
              </p>
              <div className="space-y-3">
                {formData.groupIds.map((groupId) => {
                  const group = groups.find(g => g.id === groupId);
                  if (!group) return null;
                  
                  return (
                    <div key={groupId} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {group.name}
                        </span>
                        <span className="text-xs text-gray-500">({group.type})</span>
                      </div>
                      <textarea
                        value={formData.groupDescriptions[groupId] || ''}
                        onChange={(e) => handleGroupDescriptionChange(groupId, e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={`Detalles específicos para ${group.name}... (repertorio, horario de ensayo, etc.)`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción General
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalles generales sobre la presentación..."
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