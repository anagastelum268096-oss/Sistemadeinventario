import { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Download } from 'lucide-react';
import { Presentation, Group } from '@/app/types';
import { GroupEventsList } from '@/app/components/calendar/GroupEventsList';
import { AddPresentationDialog } from '@/app/components/calendar/AddPresentationDialog';
import { EditPresentationDialog } from '@/app/components/calendar/EditPresentationDialog';
import { exportPresentationsToExcel } from '@/app/utils/exportToExcel';
import { importPresentations } from '@/app/utils/importFromExcel';
import { ImportButton } from '@/app/components/ImportButton';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/supabase/config';

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const { isAdmin } = useAuth();

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cargar Grupos
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*');

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);

        // 2. Cargar Presentaciones
        const { data: presData, error: presError } = await supabase
          .from('presentations')
          .select('*');

        if (presError) throw presError;

        const loadedPres = (presData || []).map(pres => ({
          id: pres.id,
          title: pres.title,
          groupIds: pres.group_ids || [],
          date: new Date(pres.date),
          time: pres.time,
          location: pres.location,
          description: pres.description,
          groupDescriptions: pres.group_descriptions,
          status: pres.status,
        })) as Presentation[];

        setPresentations(loadedPres.filter(p => p.title));
      } catch (error) {
        console.error("Error al cargar datos de Supabase:", error);
        toast.error("Error al cargar el calendario desde la nube");
      }
    };

    fetchData();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
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

  // Guardar nueva presentación en Supabase
  const handleAddPresentation = async (presentation: Omit<Presentation, 'id'>) => {
    try {
      // Convertir de camelCase a snake_case para Supabase
      const dbPresentation = {
        title: presentation.title,
        group_ids: presentation.groupIds,
        date: presentation.date,
        time: presentation.time,
        location: presentation.location,
        description: presentation.description,
        group_descriptions: presentation.groupDescriptions,
        status: presentation.status,
      };

      const { data, error } = await supabase
        .from('presentations')
        .insert([dbPresentation])
        .select()
        .single();

      if (error) throw error;

      const newPresentation = {
        ...data,
        date: new Date(data.date),
        groupIds: data.group_ids,
        groupDescriptions: data.group_descriptions,
      } as Presentation;
      setPresentations(prev => [...prev, newPresentation]);
      toast.success("Presentación guardada exitosamente");
    } catch (error) {
      toast.error("Error al guardar en la nube");
      console.error(error);
    }
  };

  // Actualizar presentación en Supabase
  const handleUpdatePresentation = async (id: string, updated: Omit<Presentation, 'id'>) => {
    try {
      // Convertir de camelCase a snake_case para Supabase
      const dbPresentation = {
        title: updated.title,
        group_ids: updated.groupIds,
        date: updated.date,
        time: updated.time,
        location: updated.location,
        description: updated.description,
        group_descriptions: updated.groupDescriptions,
        status: updated.status,
      };

      const { error } = await supabase
        .from('presentations')
        .update(dbPresentation)
        .eq('id', id);

      if (error) throw error;
      setPresentations(prev => prev.map(p => p.id === id ? { ...updated, id } as Presentation : p));
      toast.success("Presentación actualizada");
    } catch (error) {
      toast.error("Error al actualizar en la nube");
    }
  };

  // Eliminar presentación de Supabase
  const handleDeletePresentation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPresentations(prev => prev.filter(p => p.id !== id));
      toast.success("Presentación eliminada");
    } catch (error) {
      toast.error("Error al eliminar de la nube");
    }
  };

  const handleImportPresentations = async (file: File) => {
    try {
      const importedPresentations = await importPresentations(file);
      const processedPresentations: Presentation[] = [];
      const newGroups: Group[] = [];
      
      for (const pres of importedPresentations) {
        const presData = pres as any;
        const groupNames = presData.groupNames || [];
        const groupIds: string[] = [];
        
        for (const groupName of groupNames) {
          if (!groupName) continue;
          const existingGroup = groups.find((g) => g.name.toLowerCase() === groupName.toLowerCase());
          
          if (existingGroup) {
            groupIds.push(existingGroup.id);
          } else {
            const newGroup = newGroups.find((g) => g.name.toLowerCase() === groupName.toLowerCase());
            if (newGroup) {
              groupIds.push(newGroup.id);
            } else {
              const group: Group = {
                id: `g${Date.now()}-${newGroups.length}`,
                name: groupName,
                type: 'Banda',
                teacherId: '',
                studentIds: [],
                color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
              };
              newGroups.push(group);
              groupIds.push(group.id);
            }
          }
        }
        
        processedPresentations.push({
          id: pres.id,
          title: pres.title,
          groupIds: groupIds,
          date: pres.date,
          location: pres.location,
          description: pres.description || '',
        });
      }
      
      // Guardar grupos nuevos en Supabase
      if (newGroups.length > 0) {
        const dbGroups = newGroups.map(g => ({
          id: g.id,
          name: g.name,
          type: g.type,
          teacher_id: g.teacherId,
          student_ids: g.studentIds,
          color: g.color,
        }));

        const { error: groupsError } = await supabase
          .from('groups')
          .insert(dbGroups);

        if (groupsError) throw groupsError;
        setGroups(prev => [...prev, ...newGroups]);
      }

      // Guardar presentaciones en Supabase
      const dbPresentations = processedPresentations.map(p => ({
        id: p.id,
        title: p.title,
        group_ids: p.groupIds,
        date: p.date,
        time: p.time,
        location: p.location,
        description: p.description,
        group_descriptions: p.groupDescriptions,
        status: p.status,
      }));

      const { error: presError } = await supabase
        .from('presentations')
        .insert(dbPresentations);

      if (presError) throw presError;
      setPresentations(prev => [...prev, ...processedPresentations]);
      
      toast.success(`${processedPresentations.length} presentaciones importadas correctamente`);
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
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

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

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
                              const firstGroupId = pres.groupIds?.[0];
                              const group = firstGroupId ? getGroupById(firstGroupId) : null;
                              return (
                                <div
                                  key={pres.id}
                                  className="w-full h-1.5 rounded-full"
                                  style={{ backgroundColor: group?.color || '#6B7280' }}
                                  title={`${pres.title} - ${pres.groupIds?.map(id => getGroupById(id)?.name).filter(Boolean).join(', ')}`}
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

          <div className="lg:col-span-1">
            <GroupEventsList
              presentations={presentations}
              groups={groups}
              selectedDate={selectedDate}
              onEditPresentation={(presentation) => setEditingPresentation(presentation)}
              onDeletePresentation={handleDeletePresentation}
              onClearSelection={() => setSelectedDate(null)}
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
          onUpdatePresentation={async (id, updated) => {
            await handleUpdatePresentation(id, updated);
            setEditingPresentation(null);
          }}
          groups={groups}
        />
      )}
    </div>
  );
}