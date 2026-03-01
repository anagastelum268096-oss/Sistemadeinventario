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

// Sin datos iniciales
const initialTeachers: Person[] = [];
const initialStudents: Person[] = [];
const initialGroups: Group[] = [];

export function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [students, setStudents] = useState<Person[]>([]);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { isAdmin } = useAuth();

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const savedGroups = localStorage.getItem('groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      setGroups(initialGroups);
      localStorage.setItem('groups', JSON.stringify(initialGroups));
    }

    const savedTeachers = localStorage.getItem('teachers');
    if (savedTeachers) {
      setTeachers(JSON.parse(savedTeachers));
    } else {
      setTeachers(initialTeachers);
      localStorage.setItem('teachers', JSON.stringify(initialTeachers));
    }

    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(initialStudents);
      localStorage.setItem('students', JSON.stringify(initialStudents));
    }
  }, []);

  const handleAddGroup = (group: Omit<Group, 'id'>) => {
    const newGroup = {
      ...group,
      id: Date.now().toString(),
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
  };

  const handleUpdateGroup = (id: string, updated: Omit<Group, 'id'>) => {
    const updatedGroups = groups.map((group) =>
      group.id === id ? { ...updated, id } : group
    );
    setGroups(updatedGroups);
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
  };

  const handleDeleteGroup = (id: string) => {
    const updatedGroups = groups.filter((g) => g.id !== id);
    setGroups(updatedGroups);
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
  };

  const handleAddPerson = (person: Omit<Person, 'id'>) => {
    const newPerson = {
      ...person,
      id: `${person.role === 'teacher' ? 't' : 's'}${Date.now()}`,
    };
    
    if (person.role === 'teacher') {
      const updatedTeachers = [...teachers, newPerson];
      setTeachers(updatedTeachers);
      localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
    } else {
      const updatedStudents = [...students, newPerson];
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
      // Si el alumno tiene un grupo asignado, agregarlo automáticamente al grupo
      if (person.groups && person.groups.length > 0) {
        const groupId = person.groups[0];
        const updatedGroups = groups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              studentIds: [...group.studentIds, newPerson.id],
            };
          }
          return group;
        });
        setGroups(updatedGroups);
        localStorage.setItem('groups', JSON.stringify(updatedGroups));
      }
    }
  };

  const handleUpdatePerson = (id: string, updated: Omit<Person, 'id'>) => {
    if (updated.role === 'teacher') {
      const updatedTeachers = teachers.map((teacher) =>
        teacher.id === id ? { ...updated, id } : teacher
      );
      setTeachers(updatedTeachers);
      localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
    } else {
      const oldStudent = students.find((s) => s.id === id);
      const oldGroupId = oldStudent?.groups?.[0];
      const newGroupId = updated.groups?.[0];
      
      // Actualizar el estudiante
      const updatedStudents = students.map((student) =>
        student.id === id ? { ...updated, id } : student
      );
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
      // Si el grupo cambió, actualizar las listas de estudiantes en los grupos
      if (oldGroupId !== newGroupId) {
        const updatedGroups = groups.map((group) => {
          // Remover de grupo anterior
          if (group.id === oldGroupId) {
            return {
              ...group,
              studentIds: group.studentIds.filter((sid) => sid !== id),
            };
          }
          // Agregar a grupo nuevo
          if (group.id === newGroupId && !group.studentIds.includes(id)) {
            return {
              ...group,
              studentIds: [...group.studentIds, id],
            };
          }
          return group;
        });
        setGroups(updatedGroups);
        localStorage.setItem('groups', JSON.stringify(updatedGroups));
      }
    }
  };

  const handleDeletePerson = (id: string, role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      setTeachers(teachers.filter((t) => t.id !== id));
    } else {
      // Eliminar el estudiante de todos los grupos
      const updatedGroups = groups.map((group) => ({
        ...group,
        studentIds: group.studentIds.filter((sid) => sid !== id),
      }));
      setGroups(updatedGroups);
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  const handleImportGroups = async (file: File) => {
    try {
      const importedGroups = await importGroups(file);
      setGroups([...groups, ...importedGroups]);
      toast.success(`${importedGroups.length} grupos importados correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
      console.error(error);
    }
  };

  const handleImportTeachers = async (file: File) => {
    try {
      const importedTeachers = await importTeachers(file);
      setTeachers([...teachers, ...importedTeachers]);
      toast.success(`${importedTeachers.length} maestros importados correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
      console.error(error);
    }
  };

  const handleImportStudents = async (file: File) => {
    try {
      const importedStudents = await importStudents(file);
      setStudents([...students, ...importedStudents]);
      toast.success(`${importedStudents.length} alumnos importados correctamente`);
    } catch (error) {
      toast.error('Error al importar el archivo. Verifica el formato.');
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => exportGroupsToExcel(groups, [...teachers, ...students])}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 sm:flex-initial justify-center"
              >
                <Download className="size-5" />
                <span className="hidden lg:inline">Exportar Grupos</span>
                <span className="lg:hidden">Grupos</span>
              </button>
              <button
                onClick={() => exportPeopleToExcel([...teachers, ...students])}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-1 sm:flex-initial justify-center"
              >
                <Download className="size-5" />
                <span className="hidden lg:inline">Exportar Personas</span>
                <span className="lg:hidden">Personas</span>
              </button>
              {isAdmin() && (
                <>
                  <ImportButton
                    onImport={handleImportGroups}
                    label="Importar Grupos"
                    className="hidden lg:flex"
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