import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MapPin, Trash2 } from 'lucide-react';
import { Presentation, Group } from '@/app/types';

interface PresentationListProps {
  presentations: Presentation[];
  selectedDate: Date | null;
  groups: Group[];
  onDeletePresentation: (id: string) => void;
}

export function PresentationList({ 
  presentations, 
  selectedDate, 
  groups,
  onDeletePresentation 
}: PresentationListProps) {
  const getGroupById = (groupId: string) => {
    return groups.find((g) => g.id === groupId);
  };

  const getStatusStyle = (status: Presentation['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Presentation['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {selectedDate ? (
          <>
            Eventos
            <span className="block text-sm font-normal text-gray-500 mt-1">
              {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </>
        ) : (
          'Selecciona una fecha'
        )}
      </h3>

      {presentations.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {selectedDate 
            ? 'No hay presentaciones programadas para este día.'
            : 'Selecciona un día en el calendario para ver sus eventos.'}
        </p>
      ) : (
        <div className="space-y-4">
          {presentations.map((presentation) => {
            const group = getGroupById(presentation.groupId);
            return (
              <div
                key={presentation.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{presentation.title}</h4>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar esta presentación?')) {
                        onDeletePresentation(presentation.id);
                      }
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {group && (
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="text-sm text-gray-600">
                      {group.name}
                    </span>
                  </div>
                )}

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{presentation.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{presentation.location}</span>
                  </div>
                </div>

                {presentation.description && (
                  <p className="mt-2 text-sm text-gray-500">
                    {presentation.description}
                  </p>
                )}

                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(presentation.status)}`}>
                    {getStatusText(presentation.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
