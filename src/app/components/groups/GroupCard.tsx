import { Eye, Trash2, User, Users as UsersIcon, Edit2 } from 'lucide-react';
import { Group, Person } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';

interface GroupCardProps {
  group: Group;
  teacher?: Person;
  studentCount: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export function GroupCard({ group, teacher, studentCount, onView, onEdit, onDelete }: GroupCardProps) {
  const { isAdmin } = useAuth();

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all"
      style={{ borderTopColor: group.color, borderTopWidth: '4px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{group.name}</h3>
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            {group.type}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="size-4" />
          <span>{teacher?.name || 'Sin maestro asignado'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon className="size-4" />
          <span>{studentCount} {studentCount === 1 ? 'alumno' : 'alumnos'}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Eye className="size-4" />
          Ver Detalles
        </button>
        {isAdmin() && (
          <>
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar grupo"
            >
              <Edit2 className="size-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar el grupo "${group.name}"?`)) {
                  onDelete(group.id);
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar grupo"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}