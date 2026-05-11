import { useState, useEffect } from 'react';
import { Group, Person } from '@/app/types';
import { Plus, Users as UsersIcon, GraduationCap, UserCheck, Download } from 'lucide-react';
import { GroupCard } from '@/app/components/groups/GroupCard';
import { AddGroupDialog } from '@/app/components/groups/AddGroupDialog';
import { EditGroupDialog } from '@/app/components/groups/EditGroupDialog';
import { GroupDetailsDialog } from '@/app/components/groups/GroupDetailsDialog';
import { PeopleManagement } from '@/app/components/groups/PeopleManagement';
import { exportGroupsToExcel, exportPeopleToExcel } from '@/app/utils/exportToExcel';
import { importGroups, importTeachers, importStudents } from '@/app/utils/importFromExcel';
import { ImportButton } from '@/app/components/ImportButton';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/supabase/config';

export function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [students, setStudents] = useState<Person[]>([]);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { isAdmin } = useAuth();

  // Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar grupos
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .order('created_at', { ascending: false });

        if (groupsError) throw groupsError;

        // Convertir de snake_case a camelCase
        const groupsMapped: Group[] = (groupsData || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          type: g.type,
          teacherId: g.teacher_id,
          studentIds: g.student_ids || [],
          color: g.color,
        }));
        setGroups(groupsMapped);

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
          groups: p.groups || [],
          age: p.age,
          address: p.address,
          career: p.career,
        }));
        setTeachers(teachersMapped);

        // Cargar estudiantes (people con role='student')
        const { data: studentsData, error: studentsError } = await supabase
          .from('people')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false });

        if (studentsError) throw studentsError;

        const studentsMapped: Person[] = (studentsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          role: p.role,
          groups: p.groups || [],
          age: p.age,
          address: p.address,
          career: p.career,
        }));
        setStudents(studentsMapped);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar datos desde la base de datos');
      }
    };

    fetchData();

    // Suscribirse a cambios en tiempo real
    const groupsChannel = supabase
      .channel('groups-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        () => { fetchData(); }
      )
      .subscribe();

    const peopleChannel = supabase
      .channel('people-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'people' },
        () => { fetchData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(peopleChannel);
    };
  }, []);

  const handleAddGroup = async (group: Omit<Group, 'id'>) => {
    try {
      // Convertir de camelCase a snake_case
      const { error } = await supabase
        .from('groups')
        .insert([{
          name: group.name,
          type: group.type,
          teacher_id: group.teacherId,
          student_ids: group.studentIds,
          color: group.color,
        }]);

      if (error) throw error;
      toast.success('Grupo agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar grupo:', error);
      toast.error('Error al agregar grupo');
    }
  };

  const handleUpdateGroup = async (id: string, updated: Omit<Group, 'id'>) => {
    try {
      // Convertir de camelCase a snake_case
      const { error } = await supabase
        .from('groups')
        .update({
          name: updated.name,
          type: updated.type,
          teacher_id: updated.teacherId,
          student_ids: updated.studentIds,
          color: updated.color,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Grupo actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
      toast.error('Error al actualizar grupo');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Grupo eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      toast.error('Error al eliminar grupo');
    }
  };

  const handleAddPerson = async (person: Omit<Person, 'id'>) => {
    try {
      // Convertir de camelCase a snake_case
      const { data, error } = await supabase
        .from('people')
        .insert([{
          name: person.name,
          email: person.email,
          phone: person.phone,
          role: person.role,
          groups: person.groups || [],
          age: person.age,
          address: person.address,
          career: person.career,
        }])
        .select()
        .single();

      if (error) throw error;

      // Si el alumno tiene un grupo asignado, agregarlo automáticamente al grupo
      if (person.role === 'student' && person.groups && person.groups.length > 0) {
        const groupId = person.groups[0];
        const group = groups.find((g) => g.id === groupId);
        if (group) {
          const updatedStudentIds = [...group.studentIds, data.id];
          await supabase
            .from('groups')
            .update({ student_ids: updatedStudentIds })
            .eq('id', groupId);
        }
      }

      toast.success(`${person.role === 'teacher' ? 'Maestro' : 'Alumno'} agregado exitosamente`);
    } catch (error) {
      console.error('Error al agregar persona:', error);
      toast.error('Error al agregar persona');
    }
  };

  const handleUpdatePerson = async (id: string, updated: Omit<Person, 'id'>) => {
    try {
      // Convertir de camelCase a snake_case
      const { error } = await supabase
        .from('people')
        .update({
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          role: updated.role,
          groups: updated.groups || [],
          age: updated.age,
          address: updated.address,
          career: updated.career,
        })
        .eq('id', id);

      if (error) throw error;

      // Si es estudiante y el grupo cambió, actualizar las listas de estudiantes en los grupos
      if (updated.role === 'student') {
        const oldStudent = students.find((s) => s.id === id);
        const oldGroupId = oldStudent?.groups?.[0];
        const newGroupId = updated.groups?.[0];

        if (oldGroupId !== newGroupId) {
          // Remover de grupo anterior
          if (oldGroupId) {
            const oldGroup = groups.find((g) => g.id === oldGroupId);
            if (oldGroup) {
              const updatedStudentIds = oldGroup.studentIds.filter((sid) => sid !== id);
              await supabase
                .from('groups')
                .update({ student_ids: updatedStudentIds })
                .eq('id', oldGroupId);
            }
          }

          // Agregar a grupo nuevo
          if (newGroupId) {
            const newGroup = groups.find((g) => g.id === newGroupId);
            if (newGroup && !newGroup.studentIds.includes(id)) {
              const updatedStudentIds = [...newGroup.studentIds, id];
              await supabase
                .from('groups')
                .update({ student_ids: updatedStudentIds })
                .eq('id', newGroupId);
            }
          }
        }
      }

      toast.success(`${updated.role === 'teacher' ? 'Maestro' : 'Alumno'} actualizado exitosamente`);
    } catch (error) {
      console.error('Error al actualizar persona:', error);
      toast.error('Error al actualizar persona');
    }
  };

  const handleDeletePerson = async (id: string, role: 'teacher' | 'student') => {
    try {
      // Si es estudiante, eliminar de todos los grupos primero
      if (role === 'student') {
        const studentGroups = groups.filter((g) => g.studentIds.includes(id));
        for (const group of studentGroups) {
          const updatedStudentIds = group.studentIds.filter((sid) => sid !== id);
          await supabase
            .from('groups')
            .update({ student_ids: updatedStudentIds })
            .eq('id', group.id);
        }
      }

      // Eliminar la persona
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(`${role === 'teacher' ? 'Maestro' : 'Alumno'} eliminado exitosamente`);
    } catch (error) {
      console.error('Error al eliminar persona:', error);
      toast.error('Error al eliminar persona');
    }
  };

  const handleImportGroups = async (file: File) => {
    try {
      const importedGroups = await importGroups(file);
      const newTeachersToInsert: any[] = [];
      const processedGroups: any[] = [];

      // Procesar cada grupo importado
      for (const group of importedGroups) {
        const groupData = group as any;
        const teacherName = groupData.teacherName;
        let teacherId = '';

        if (teacherName) {
          // Buscar si el maestro ya existe (por nombre)
          const existingTeacher = teachers.find(
            (t) => t.name.toLowerCase() === teacherName.toLowerCase()
          );

          if (existingTeacher) {
            teacherId = existingTeacher.id;
          } else {
            // Verificar si ya lo creamos en esta importación
            const newTeacher = newTeachersToInsert.find(
              (t) => t.name.toLowerCase() === teacherName.toLowerCase()
            );

            if (!newTeacher) {
              // Crear nuevo maestro en Supabase
              const { data, error } = await supabase
                .from('people')
                .insert([{
                  name: teacherName,
                  email: '',
                  phone: '',
                  role: 'teacher',
                  groups: [],
                }])
                .select()
                .single();

              if (error) throw error;
              teacherId = data.id;
              newTeachersToInsert.push(data);
            } else {
              teacherId = newTeacher.id;
            }
          }
        }

        // Crear el grupo con el teacherId correcto
        processedGroups.push({
          name: group.name,
          type: group.type,
          teacher_id: teacherId,
          student_ids: [],
          color: group.color,
        });
      }

      // Insertar grupos en Supabase
      if (processedGroups.length > 0) {
        const { error } = await supabase
          .from('groups')
          .insert(processedGroups);

        if (error) throw error;
      }

      toast.success(
        `${processedGroups.length} grupos importados correctamente${
          newTeachersToInsert.length > 0 ? ` (${newTeachersToInsert.length} maestros creados)` : ''
        }`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al importar el archivo. Verifica el formato.';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleImportTeachers = async (file: File) => {
    try {
      const importedTeachers = await importTeachers(file);

      // Convertir a formato Supabase
      const teachersToInsert = importedTeachers.map((teacher) => ({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        role: 'teacher',
        groups: teacher.groups || [],
        age: teacher.age,
        address: teacher.address,
        career: teacher.career,
      }));

      const { data: insertedTeachers, error } = await supabase
        .from('people')
        .insert(teachersToInsert)
        .select('*');

      if (error) throw error;

      if (insertedTeachers) {
        const mapped = insertedTeachers.map((t: any) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          role: t.role,
          groups: t.groups || [],
          age: t.age,
          address: t.address,
          career: t.career,
        }));
        setTeachers((prev) => [...prev, ...mapped]);
      }

      toast.success(`${importedTeachers.length} maestros importados correctamente`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al importar el archivo. Verifica el formato.';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleImportStudents = async (file: File) => {
    try {
      const importedStudents = await importStudents(file);

      // Convertir a formato Supabase
      const studentsToInsert = importedStudents.map((student) => ({
        name: student.name,
        email: student.email,
        phone: student.phone,
        role: 'student',
        groups: student.groups || [],
        age: student.age,
        address: student.address,
        career: student.career,
      }));

      const { data: insertedStudents, error } = await supabase
        .from('people')
        .insert(studentsToInsert)
        .select('*');

      if (error) throw error;

      if (insertedStudents) {
        const mapped = insertedStudents.map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          role: p.role,
          groups: p.groups || [],
          age: p.age,
          address: p.address,
          career: p.career,
        }));
        setStudents((prev) => [...prev, ...mapped]);
      }

      toast.success(`${importedStudents.length} alumnos importados correctamente`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al importar el archivo. Verifica el formato.';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <UsersIcon className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Grupos Artísticos
                </h1>
                <p className="text-sm text-gray-500">Gestiona grupos, maestros y alumnos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => exportGroupsToExcel(groups, [...teachers, ...students])}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 sm:flex-initial justify-center"
              >
                <Download className="size-5" />
                <span className="hidden lg:inline">Exportar Grupos</span>
                <span className="lg:hidden">Exp. Grupos</span>
              </button>
              <button
                onClick={() => exportPeopleToExcel([...teachers, ...students])}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-1 sm:flex-initial justify-center"
              >
                <Download className="size-5" />
                <span className="hidden lg:inline">Exportar Personas</span>
                <span className="lg:hidden">Exp. Personas</span>
              </button>
              {isAdmin() && (
                <>
                  <ImportButton
                    onImport={handleImportGroups}
                    label="Importar Grupos"
                    className="flex-1 sm:flex-initial"
                  />
                  <button
                    onClick={() => setAddGroupDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 sm:flex-initial justify-center"
                  >
                    <Plus className="size-5" />
                    <span className="hidden sm:inline">Nuevo Grupo</span>
                    <span className="sm:hidden">Nuevo</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">Total Grupos</div>
              <div className="text-3xl font-bold mt-1">{groups.length}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">Maestros</div>
              <div className="text-3xl font-bold mt-1">{teachers.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">Alumnos</div>
              <div className="text-3xl font-bold mt-1">{students.length}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Groups Section */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Grupos</h2>
            {groups.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <UsersIcon className="size-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay grupos registrados
                </h3>
                <p className="text-gray-500 mb-4">
                  Comienza creando tu primer grupo artístico.
                </p>
                <button
                  onClick={() => setAddGroupDialogOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Crear Primer Grupo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    teacher={teachers.find((t) => t.id === group.teacherId)}
                    studentCount={group.studentIds.length}
                    onView={() => setSelectedGroup(group)}
                    onEdit={() => setEditingGroup(group)}
                    onDelete={handleDeleteGroup}
                  />
                ))}
              </div>
            )}
          </section>

          {/* People Management Section */}
          <PeopleManagement
            teachers={teachers}
            students={students}
            groups={groups}
            onAddPerson={handleAddPerson}
            onUpdatePerson={handleUpdatePerson}
            onDeletePerson={handleDeletePerson}
            onImportTeachers={handleImportTeachers}
            onImportStudents={handleImportStudents}
          />
        </div>
      </main>

      <AddGroupDialog
        open={addGroupDialogOpen}
        onOpenChange={setAddGroupDialogOpen}
        onAddGroup={handleAddGroup}
        teachers={teachers}
      />

      {editingGroup && (
        <EditGroupDialog
          open={!!editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(null)}
          group={editingGroup}
          onUpdateGroup={(id, updated) => {
            handleUpdateGroup(id, updated);
            setEditingGroup(null);
          }}
          teachers={teachers}
        />
      )}

      {selectedGroup && (
        <GroupDetailsDialog
          open={!!selectedGroup}
          onOpenChange={(open) => !open && setSelectedGroup(null)}
          group={selectedGroup}
          teacher={teachers.find((t) => t.id === selectedGroup.teacherId)}
          students={students.filter((s) => selectedGroup.studentIds.includes(s.id))}
        />
      )}
    </div>
  );
}