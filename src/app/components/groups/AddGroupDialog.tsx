import { useState } from 'react';
import { X } from 'lucide-react';
import { Group, Person } from '@/app/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (group: Omit<Group, 'id'>) => void;
  teachers: Person[];
}

const groupTypes = ['Orquesta', 'Banda', 'Coro', 'Ensamble', 'Grupo de Cámara'];
const colors = [
  { name: 'Púrpura', value: '#8B5CF6' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Amarillo', value: '#F59E0B' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Cyan', value: '#06B6D4' },
];

export function AddGroupDialog({ open, onOpenChange, onAddGroup, teachers }: AddGroupDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: groupTypes[0],
    teacherId: teachers[0]?.id || '',
    color: colors[0].value,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGroup({
      ...formData,
      studentIds: [],
    });
    setFormData({
      name: '',
      type: groupTypes[0],
      teacherId: teachers[0]?.id || '',
      color: colors[0].value,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Nuevo Grupo Artístico</DialogTitle>
        <DialogDescription>
          Completa la información del nuevo grupo artístico. Todos los campos son obligatorios.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Grupo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Orquesta Juvenil"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Grupo *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {groupTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maestro Asignado *
            </label>
            <select
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {teachers.length === 0 ? (
                <option value="">No hay maestros registrados</option>
              ) : (
                teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color del Grupo *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={teachers.length === 0}
            >
              Crear Grupo
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}