import { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Plus, Download } from 'lucide-react';
import { Presentation, Group } from '@/app/types';
import { GroupEventsList } from '@/app/components/calendar/GroupEventsList';
import { AddPresentationDialog } from '@/app/components/calendar/AddPresentationDialog';
import { EditPresentationDialog } from '@/app/components/calendar/EditPresentationDialog';
import { exportPresentationsToExcel } from '@/app/utils/exportToExcel';
import { importPresentations } from '@/app/utils/importFromExcel';
import { ImportButton } from '@/app/components/ImportButton';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

// Sin datos iniciales
const initialPresentations: Presentation[] = [];

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const { isAdmin } = useAuth();

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const savedPresentations = localStorage.getItem('presentations');
    if (savedPresentations) {
      const parsed = JSON.parse(savedPresentations);
      setPresentations(
        parsed.map((pres: any) => ({
          ...pres,
          date: new Date(pres.date),
        }))
      );
    } else {
      // Inicializar con datos de ejemplo solo si no hay datos guardados
      setPresentations(initialPresentations);
      localStorage.setItem('presentations', JSON.stringify(initialPresentations));
    }

    const savedGroups = localStorage.getItem('groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      // Sin grupos iniciales
      setGroups([]);
      localStorage.setItem('groups', JSON.stringify([]));
    }
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();

  const presentationsByDate = useMemo(() => {
    const map = new Map<string, Presentation[]>();
    presentations.forEach((pres) => {
      const dateKey = format(pres.date, 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(pres);
    });
    return map;
  }, [presentations]);

  const selectedDatePresentations = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return presentationsByDate.get(dateKey) || [];
  }, [selectedDate, presentationsByDate]);

  const handleAddPresentation = (presentation: Omit<Presentation, 'id'>) => {
    const newPresentation = {
      ...presentation,
      id: Date.now().toString(),
    };
    const updatedPresentations = [...presentations, newPresentation];
    setPresentations(updatedPresentations);
    localStorage.setItem('presentations', JSON.stringify(updatedPresentations));
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event('localStorageUpdate'));
  };

  const handleUpdatePresentation = (id: string, updated: Omit<Presentation, 'id'>) => {
    const updatedPresentations = presentations.map((presentation) =>
      presentation.id === id ? { ...updated, id } : presentation
    );
    setPresentations(updatedPresentations);
    localStorage.setItem('presentations', JSON.stringify(updatedPresentations));
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event('localStorageUpdate'));
  };

  const handleDeletePresentation = (id: string) => {
    const updatedPresentations = presentations.filter((p) => p.id !== id);
    setPresentations(updatedPresentations);
    localStorage.setItem('presentations', JSON.stringify(updatedPresentations));
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event('localStorageUpdate'));
  };

  const handleImportPresentations = async (file: File) => {
    try {
      const importedPresentations = await importPresentations(file);
      const updatedPresentations = [...presentations, ...importedPresentations];
      setPresentations(updatedPresentations);
      localStorage.setItem('presentations', JSON.stringify(updatedPresentations));
      window.dispatchEvent(new Event('localStorageUpdate'));
      toast.success(`${importedPresentations.length} presentaciones importadas correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
      console.error(error);
    }
  };

  const handleExport = () => {
    exportPresentationsToExcel(presentations, groups);
  };

  const getGroupById = (groupId: string) => {
    return groups.find((g) => g.id === groupId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <CalendarIcon className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Calendario de Presentaciones
                </h1>
                <p className="text-sm text-gray-500">Gestiona eventos y conciertos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 sm:flex-initial justify-center"
              >
                <Download className="size-5" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Exportar</span>
              </button>
              {isAdmin() && (
                <>
                  <ImportButton
                    onImport={handleImportPresentations}
                    label="Importar"
                    className="hidden sm:flex"
                  />
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 sm:flex-initial justify-center"
                  >
                    <Plus className="size-5" />
                    <span className="hidden sm:inline">Nueva Presentación</span>
                    <span className="sm:hidden">Agregar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of month */}
                {daysInMonth.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayPresentations = presentationsByDate.get(dateKey) || [];
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square p-2 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : isToday
                          ? 'bg-purple-50 border-purple-300'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        <span className={`text-sm ${isToday ? 'font-bold text-purple-700' : 'text-gray-900'}`}>
                          {format(day, 'd')}
                        </span>
                        {dayPresentations.length > 0 && (
                          <div className="mt-1 flex flex-col gap-1">
                            {dayPresentations.slice(0, 2).map((pres) => {
                              const group = getGroupById(pres.groupId);
                              return (
                                <div
                                  key={pres.id}
                                  className="w-full h-1.5 rounded-full"
                                  style={{ backgroundColor: group?.color }}
                                  title={pres.title}
                                />
                              );
                            })}
                            {dayPresentations.length > 2 && (
                              <span className="text-xs text-gray-500">+{dayPresentations.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Grupos</h3>
                <div className="flex flex-wrap gap-3">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                      <span className="text-sm text-gray-600">{group.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Event list for selected date */}
          <div className="lg:col-span-1">
            <GroupEventsList
              presentations={presentations}
              groups={groups}
              onEditPresentation={(presentation) => setEditingPresentation(presentation)}
              onDeletePresentation={handleDeletePresentation}
            />
          </div>
        </div>
      </main>

      <AddPresentationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddPresentation={handleAddPresentation}
        groups={groups}
        initialDate={selectedDate || undefined}
      />

      {editingPresentation && (
        <EditPresentationDialog
          open={!!editingPresentation}
          onOpenChange={(open) => !open && setEditingPresentation(null)}
          presentation={editingPresentation}
          onUpdatePresentation={(id, updated) => {
            handleUpdatePresentation(id, updated);
            setEditingPresentation(null);
          }}
          groups={groups}
        />
      )}
    </div>
  );
}