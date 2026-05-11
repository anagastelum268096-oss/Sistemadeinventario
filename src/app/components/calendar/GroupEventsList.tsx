import { useMemo } from 'react';
import { format, differenceInDays, isBefore, startOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Calendar, Clock, MapPin, Users, Edit2, Trash2 } from 'lucide-react';
import { Presentation, Group } from '@/app/types';
import { useAuth } from '@/app/context/AuthContext';

interface GroupEventsListProps {
  presentations: Presentation[];
  groups: Group[];
  selectedDate?: Date | null;
  onEditPresentation?: (presentation: Presentation) => void;
  onDeletePresentation?: (id: string) => void;
  onClearSelection?: () => void;
}

export function GroupEventsList({ presentations, groups, selectedDate, onEditPresentation, onDeletePresentation, onClearSelection }: GroupEventsListProps) {
  const today = startOfDay(new Date());
  const { isAdmin } = useAuth();

  // Si hay una fecha seleccionada, mostrar solo las presentaciones de ese día
  const selectedDayPresentations = useMemo(() => {
    if (!selectedDate) return null;
    
    return presentations
      .filter((pres) => isSameDay(pres.date, selectedDate))
      .sort((a, b) => {
        // Ordenar por hora si existe
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
  }, [presentations, selectedDate]);

  // Organizar eventos por grupo y calcular días restantes
  const groupedEvents = useMemo(() => {
    const grouped = new Map<string, { group: Group; events: Array<Presentation & { daysUntil: number; isUpcoming: boolean }> }>();

    groups.forEach((group) => {
      const groupEvents = presentations
        .filter((pres) => pres.groupIds?.includes(group.id) && pres.status !== 'completed') // Cambiado a groupIds
        .map((pres) => {
          const daysUntil = differenceInDays(startOfDay(pres.date), today);
          const isUpcoming = daysUntil >= 0 && daysUntil <= 7;
          return { ...pres, daysUntil, isUpcoming };
        })
        .filter((event) => event.daysUntil >= 0) // Solo eventos futuros
        .sort((a, b) => a.daysUntil - b.daysUntil);

      if (groupEvents.length > 0) {
        grouped.set(group.id, { group, events: groupEvents });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => {
      // Ordenar por el evento más cercano
      const aNextEvent = a.events[0]?.daysUntil ?? Infinity;
      const bNextEvent = b.events[0]?.daysUntil ?? Infinity;
      return aNextEvent - bNextEvent;
    });
  }, [presentations, groups, today]);

  // Contar eventos urgentes
  const upcomingEventsCount = useMemo(() => {
    return presentations.filter((pres) => {
      const daysUntil = differenceInDays(startOfDay(pres.date), today);
      return daysUntil >= 0 && daysUntil <= 7 && pres.status !== 'completed';
    }).length;
  }, [presentations, today]);

  const getDaysUntilText = (daysUntil: number) => {
    if (daysUntil === 0) return 'Hoy';
    if (daysUntil === 1) return 'Mañana';
    if (daysUntil <= 7) return `En ${daysUntil} días`;
    return `En ${daysUntil} días`;
  };

  const getGroupById = (groupId: string) => {
    return groups.find((g) => g.id === groupId);
  };

  // Si hay una fecha seleccionada, mostrar vista del día específico
  if (selectedDate && selectedDayPresentations !== null) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">
              {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </h2>
            <button
              onClick={() => onClearSelection?.()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Ver todo
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {selectedDayPresentations.length === 0 
              ? 'No hay presentaciones este día' 
              : `${selectedDayPresentations.length} ${selectedDayPresentations.length === 1 ? 'presentación' : 'presentaciones'}`
            }
          </p>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
          {selectedDayPresentations.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay presentaciones programadas para este día</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {selectedDayPresentations.map((pres) => {
                const presentationGroups = pres.groupIds?.map(getGroupById).filter(Boolean) || [];
                const isToday = isSameDay(selectedDate, today);
                
                return (
                  <div
                    key={pres.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-gray-900 text-base">{pres.title}</h3>
                      <div className="flex items-center gap-1">
                        {isToday && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-500 text-white">
                            HOY
                          </span>
                        )}
                        {onEditPresentation && isAdmin() && (
                          <button
                            onClick={() => onEditPresentation(pres)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="size-4" />
                          </button>
                        )}
                        {onDeletePresentation && isAdmin() && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar "${pres.title}"?`)) {
                                onDeletePresentation(pres.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Grupos */}
                    {presentationGroups.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="size-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-600">Grupos Participantes:</span>
                        </div>
                        <div className="space-y-2 ml-6">
                          {presentationGroups.map((group) => {
                            const groupDescription = pres.groupDescriptions?.[group.id];
                            return (
                              <div
                                key={group.id}
                                className="bg-white border-2 rounded-lg p-3"
                                style={{ borderColor: group.color }}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: group.color }}
                                  />
                                  <span className="text-sm font-medium text-gray-900">
                                    {group.name}
                                  </span>
                                  <span className="text-xs text-gray-500">({group.type})</span>
                                </div>
                                {groupDescription && (
                                  <p className="text-xs text-gray-600 mt-2 pl-4">
                                    {groupDescription}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Detalles */}
                    <div className="space-y-2 border-t border-gray-200 pt-3">
                      {pres.time && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="size-4 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">{pres.time}</span>
                        </div>
                      )}
                      {pres.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="size-4 text-red-600 flex-shrink-0" />
                          <span>{pres.location}</span>
                        </div>
                      )}
                      {pres.description && (
                        <p className="text-sm text-gray-600 mt-2 pl-6">{pres.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista por defecto: eventos por grupo
  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Eventos por Grupo</h2>
        <p className="text-sm text-gray-500 mt-1">Próximas presentaciones programadas</p>
        
        {upcomingEventsCount > 0 && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="size-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              {upcomingEventsCount} {upcomingEventsCount === 1 ? 'evento' : 'eventos'} en los próximos 7 días
            </p>
          </div>
        )}
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
        {groupedEvents.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay eventos próximos programados</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {groupedEvents.map(({ group, events }) => (
              <div key={group.id} className="p-4">
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                    <p className="text-xs text-gray-500">{group.type}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {events.length} {events.length === 1 ? 'evento' : 'eventos'}
                  </span>
                </div>

                {/* Events List */}
                <div className="space-y-3 ml-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`relative pl-4 border-l-2 ${
                        event.isUpcoming ? 'border-amber-400' : 'border-gray-200'
                      }`}
                    >
                      {/* Upcoming indicator */}
                      {event.isUpcoming && (
                        <div className="absolute -left-[9px] top-0">
                          <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        </div>
                      )}

                      <div className={`${event.isUpcoming ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'} rounded-lg p-3`}>
                        {/* Event Title and Date Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                                event.isUpcoming
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {getDaysUntilText(event.daysUntil)}
                            </span>
                            {onEditPresentation && isAdmin() && (
                              <button
                                onClick={() => onEditPresentation(event)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Editar evento"
                              >
                                <Edit2 className="size-3.5" />
                              </button>
                            )}
                            {onDeletePresentation && isAdmin() && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Eliminar el evento "${event.title}"?`)) {
                                    onDeletePresentation(event.id);
                                  }
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Eliminar evento"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="size-3.5 flex-shrink-0" />
                            <span>{format(event.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="size-3.5 flex-shrink-0" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="size-3.5 flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}