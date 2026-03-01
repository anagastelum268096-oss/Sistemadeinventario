import { useState } from 'react';
import { X } from 'lucide-react';
import { Person, Group } from '@/app/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPerson: (person: Omit<Person, 'id'>) => void;
  role: 'teacher' | 'student';
  groups?: Group[]; // Lista de grupos disponibles
}

export function AddPersonDialog({ open, onOpenChange, onAddPerson, role, groups = [] }: AddPersonDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    address: '',
    career: '',
    groupId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const personData: Omit<Person, 'id'> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role,
      groups: formData.groupId ? [formData.groupId] : [],
      ...(formData.age && { age: parseInt(formData.age) }),
      ...(formData.address && { address: formData.address }),
      ...(formData.career && { career: formData.career }),
    };

    onAddPerson(personData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      age: '',
      address: '',
      career: '',
      groupId: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogTitle>
          {role === 'teacher' ? 'Nuevo Maestro' : 'Nuevo Alumno'}
        </DialogTitle>
        <DialogDescription>
          {role === 'teacher' 
            ? 'Completa la información del maestro. Los campos marcados con * son obligatorios.'
            : 'Completa la información del alumno. Los campos marcados con * son obligatorios, los demás son opcionales.'}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: María González"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="email@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="555-0123"
            />
          </div>

          {role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domicilio
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Calle Principal #123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrera
                </label>
                <input
                  type="text"
                  value={formData.career}
                  onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Licenciatura en Música"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo Artístico
                </label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sin grupo asignado</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} - {group.type}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  El alumno será agregado automáticamente al grupo seleccionado
                </p>
              </div>
            </>
          )}

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
            >
              {role === 'teacher' ? 'Agregar Maestro' : 'Agregar Alumno'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}