import { useState, useMemo, useEffect } from 'react';
import { User, Calendar, Clock, MapPin, Filter, Download, Users } from 'lucide-react';
import { Presentation, Group, Person } from '@/app/types';
import { format, isPast, isFuture, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { exportPresentationsToExcel } from '@/app/utils/exportToExcel';
import { supabase } from '@/supabase/config';
import { toast } from 'sonner';

// Datos de ejemplo (debiendo compartirse con el estado global en una app real)
const sampleTeachers: Person[] = [
  { id: 't1', name: 'María González', email: 'maria@escuela.com', phone: '555-0101', role: 'teacher', groups: ['1', '4'] },
  { id: 't2', name: 'Carlos Rodríguez', email: 'carlos@escuela.com', phone: '555-0102', role: 'teacher', groups: ['2'] },
  { id: 't3', name: 'Ana Martínez', email: 'ana@escuela.com', phone: '555-0103', role: 'teacher', groups: ['3'] },
];

const sampleGroups: Group[] = [
  { id: '1', name: 'Orquesta Juvenil', type: 'Orquesta', teacherId: 't1', studentIds: ['s1', 's2', 's3'], color: '#8B5CF6' },
  { id: '2', name: 'Banda Escolar', type: 'Banda', teacherId: 't2', studentIds: ['s4', 's5', 's6'], color: '#3B82F6' },
  { id: '3', name: 'Coro Infantil', type: 'Coro', teacherId: 't3', studentIds: ['s7', 's8', 's9'], color: '#10B981' },
  { id: '4', name: 'Ensamble de Jazz', type: 'Ensamble', teacherId: 't1', studentIds: ['s10', 's11'], color: '#F59E0B' },
];

const samplePresentations: Presentation[] = [
  {
    id: '1',
    title: 'Concierto de Primavera',
    groupId: '1',
    date: new Date(2026, 2, 15),
    time: '19:00',
    location: 'Auditorio Principal',
    description: 'Presentación de la Orquesta Juvenil con repertorio clásico',
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Recital de Estudiantes',
    groupId: '2',
    date: new Date(2026, 2, 20),
    time: '18:00',
    location: 'Sala de Ensayos',
    description: 'Presentación mensual de los estudiantes de banda',
    status: 'scheduled',
  },
  {
    id: '3',
    title: 'Festival de Música',
    groupId: '3',
    date: new Date(2026, 1, 28),
    time: '17:00',
    location: 'Teatro Municipal',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Presentación de Fin de Año',
    groupId: '1',
    date: new Date(2026, 0, 30),
    time: '20:00',
    location: 'Auditorio Principal',
    description: 'Gran concierto de clausura del año escolar',
    status: 'scheduled',
  },
  {
    id: '5',
    title: 'Concierto Benéfico',
    groupId: '4',
    date: new Date(2026, 1, 1),
    time: '19:30',
    location: 'Plaza Central',
    description: 'Evento especial para recaudar fondos',
    status: 'scheduled',
  },
  {
    id: '6',
    title: 'Presentación Navideña',
    groupId: '3',
    date: new Date(2026, 1, 3),
    time: '18:00',
    location: 'Iglesia San Francisco',
    description: 'Villancicos y cantos tradicionales',
    status: 'scheduled',
  },
  {
    id: '7',
    title: 'Ensayo General Abierto',
    groupId: '2',
    date: new Date(2026, 1, 5),
    time: '16:00',
    location: 'Sala de Ensayos',
    description: 'Ensayo abierto al público antes del concierto',
    status: 'scheduled',
  },
];

export function TeacherPresentations() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('t1');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);

  // Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar maestros (people con role='teacher')
        const { data: teachersData, error: teachersError } = await supabase
          .from('people')
          .select('*')
          .eq('role', 'teacher')
          .order('created_at', { ascending: false });

        if (teachersError) throw teachersError;

        const teachersMapped: Person[] = (teachersData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          role: p.role,
          groups: p.group_ids || [],
          age: p.age,
          address: p.address,
          career: p.career,
        }));
        setTeachers(teachersMapped);

        // Seleccionar el primer maestro si no hay uno seleccionado
        if (teachersMapped.length > 0 && !selectedTeacherId) {
          setSelectedTeacherId(teachersMapped[0].id);
        }

        // Cargar grupos
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .order('created_at', { ascending: false });

        if (groupsError) throw groupsError;

        const groupsMapped: Group[] = (groupsData || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          type: g.type,
          teacherId: g.teacher_id,
          studentIds: g.student_ids || [],
          color: g.color,
        }));
        setGroups(groupsMapped);

        // Cargar presentaciones
        const { data: presentationsData, error: presentationsError } = await supabase
          .from('presentations')
          .select('*')
          .order('date', { ascending: true });

        if (presentationsError) throw presentationsError;

        const presentationsMapped: Presentation[] = (presentationsData || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          groupIds: p.group_ids || [],
          date: new Date(p.date),
          time: p.time,
          location: p.location,
          description: p.description,
          groupDescriptions: p.group_descriptions,
          status: p.status,
        }));
        setPresentations(presentationsMapped);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar datos desde la base de datos');
      }
    };

    fetchData();

    // Suscribirse a cambios en tiempo real
    const peopleChannel = supabase
      .channel('people-changes-teacher-presentations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'people' },
        () => { fetchData(); }
      )
      .subscribe();

    const groupsChannel = supabase
      .channel('groups-changes-teacher-presentations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        () => { fetchData(); }
      )
      .subscribe();

    const presentationsChannel = supabase
      .channel('presentations-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'presentations' },
        () => { fetchData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(peopleChannel);
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(presentationsChannel);
    };
  }, []);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  
  const teacherPresentations = useMemo(() => {
    if (!selectedTeacher) return [];
    
    // Obtener los grupos del maestro
    const teacherGroups = groups.filter((g) => g.teacherId === selectedTeacherId);
    const teacherGroupIds = teacherGroups.map((g) => g.id);
    
    // Filtrar presentaciones que incluyan alguno de los grupos del maestro
    let filteredPresentations = presentations.filter((p) => 
      p.groupIds?.some(groupId => teacherGroupIds.includes(groupId))
    );
    
    // Aplicar filtro de estado
    const today = new Date();
    if (statusFilter === 'upcoming') {
      filteredPresentations = filteredPresentations.filter((p) => isFuture(p.date) || format(p.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
    } else if (statusFilter === 'past') {
      filteredPresentations = filteredPresentations.filter((p) => isPast(p.date) && format(p.date, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd'));
    }
    
    // Ordenar por fecha
    return filteredPresentations.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selectedTeacher, selectedTeacherId, groups, presentations, statusFilter]);

  const upcomingCount = useMemo(() => {
    if (!selectedTeacher) return 0;
    const teacherGroups = groups.filter((g) => g.teacherId === selectedTeacherId);
    const teacherGroupIds = teacherGroups.map((g) => g.id);
    const today = new Date();
    return presentations.filter((p) => 
      p.groupIds?.some(groupId => teacherGroupIds.includes(groupId)) && 
      (isFuture(p.date) || format(p.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
    ).length;
  }, [selectedTeacherId, selectedTeacher, groups, presentations]);

  const handleExport = () => {
    if (selectedTeacher) {
      exportPresentationsToExcel(teacherPresentations, groups);
    }
  };

  const getDaysUntil = (date: Date) => {
    const days = differenceInDays(date, new Date());
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days > 0) return `En ${days} días`;
    if (days === -1) return 'Ayer';
    return `Hace ${Math.abs(days)} días`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <User className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Presentaciones por Maestro
                  </h1>
                  <p className="text-sm text-gray-500">Vista de eventos por maestro</p>
                </div>
              </div>
              <button
                onClick={handleExport}
                disabled={teacherPresentations.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              >
                <Download className="size-5" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Exportar</span>
              </button>
            </div>

            {/* Teacher Selector */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Maestro
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'upcoming' | 'past')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Todas</option>
                  <option value="upcoming">Próximas</option>
                  <option value="past">Pasadas</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTeacher && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                <div className="text-sm opacity-90">Total Presentaciones</div>
                <div className="text-3xl font-bold mt-1">{teacherPresentations.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="text-sm opacity-90">Próximas</div>
                <div className="text-3xl font-bold mt-1">{upcomingCount}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="text-sm opacity-90">Grupos Asignados</div>
                <div className="text-3xl font-bold mt-1">
                  {groups.filter((g) => g.teacherId === selectedTeacherId).length}
                </div>
              </div>
            </div>

            {/* Presentations List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Presentaciones de {selectedTeacher.name}
              </h2>
              
              {teacherPresentations.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Calendar className="size-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay presentaciones
                  </h3>
                  <p className="text-gray-500">
                    {statusFilter === 'upcoming' && 'No hay presentaciones próximas.'}
                    {statusFilter === 'past' && 'No hay presentaciones pasadas.'}
                    {statusFilter === 'all' && 'No hay presentaciones registradas para este maestro.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {teacherPresentations.map((presentation) => {
                    // Obtener todos los grupos de la presentación
                    const presentationGroups = presentation.groupIds
                      ?.map(groupId => groups.find((g) => g.id === groupId))
                      .filter(Boolean) || [];
                    const isPastEvent = isPast(presentation.date) && format(presentation.date, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');
                    const isToday = format(presentation.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    const daysUntil = differenceInDays(presentation.date, new Date());
                    const isNearby = daysUntil >= 0 && daysUntil <= 7;

                    return (
                      <div
                        key={presentation.id}
                        className={`bg-white rounded-lg border-2 p-6 transition-all ${
                          isToday
                            ? 'border-purple-500 shadow-lg'
                            : isNearby
                            ? 'border-yellow-300 shadow-md'
                            : isPastEvent
                            ? 'border-gray-200 opacity-60'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              {presentation.title}
                            </h3>

                            {presentationGroups.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-2">Grupos participantes:</p>
                                <div className="flex flex-wrap gap-2">
                                  {presentationGroups.map((group) => (
                                    <div key={group.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: group.color }}
                                      />
                                      <span className="text-sm text-gray-700">{group.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="size-4" />
                                <span>
                                  {format(presentation.date, "d 'de' MMMM, yyyy", { locale: es })}
                                </span>
                              </div>
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
                              <p className="mt-3 text-sm text-gray-600">
                                {presentation.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-2">
                            {isToday && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                                ¡Hoy!
                              </span>
                            )}
                            {isNearby && !isToday && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                                {getDaysUntil(presentation.date)}
                              </span>
                            )}
                            {!isNearby && !isPastEvent && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                {getDaysUntil(presentation.date)}
                              </span>
                            )}
                            {isPastEvent && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                Completada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}