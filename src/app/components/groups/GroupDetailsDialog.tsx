import { X, User, Mail, Phone } from 'lucide-react';
import { Group, Person } from '@/app/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

interface GroupDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  teacher?: Person;
  students: Person[];
}

export function GroupDetailsDialog({ open, onOpenChange, group, teacher, students }: GroupDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>{group.name}</DialogTitle>
        <DialogDescription>
          Información detallada del grupo {group.type} y sus integrantes
        </DialogDescription>

        <div className="mb-4">
          <span 
            className="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
            style={{ backgroundColor: group.color }}
          >
            {group.type}
          </span>
        </div>

        {/* Teacher Section */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="size-5" />
            Maestro
          </h3>
          {teacher ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900 mb-2">{teacher.name}</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  <span>{teacher.phone}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay maestro asignado</p>
          )}
        </section>

        {/* Students Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Alumnos ({students.length})
          </h3>
          {students.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay alumnos en este grupo</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="font-medium text-gray-900 mb-2">{student.name}</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="size-3" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-3" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}