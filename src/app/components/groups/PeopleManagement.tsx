import { useState } from 'react';
import { User, GraduationCap, Plus, Trash2, Mail, Phone, MapPin, Calendar, BookOpen, Users, Edit2 } from 'lucide-react';
import { Person, Group } from '@/app/types';
import { AddPersonDialog } from './AddPersonDialog';
import { EditPersonDialog } from './EditPersonDialog';
import { ImportButton } from '@/app/components/ImportButton';
import { useAuth } from '@/app/context/AuthContext';

interface PeopleManagementProps {
  teachers: Person[];
  students: Person[];
  groups: Group[];
  onAddPerson: (person: Omit<Person, 'id'>) => void;
  onUpdatePerson: (id: string, person: Omit<Person, 'id'>) => void;
  onDeletePerson: (id: string, role: 'teacher' | 'student') => void;
  onImportTeachers?: (file: File) => void;
  onImportStudents?: (file: File) => void;
}

export function PeopleManagement({ 
  teachers, 
  students, 
  groups, 
  onAddPerson, 
  onUpdatePerson, 
  onDeletePerson,
  onImportTeachers,
  onImportStudents 
}: PeopleManagementProps) {
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [addPersonRole, setAddPersonRole] = useState<'teacher' | 'student'>('teacher');
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');
  const { isAdmin } = useAuth();

  const handleOpenAddDialog = (role: 'teacher' | 'student') => {
    setAddPersonRole(role);
    setAddPersonDialogOpen(true);
  };

  // Función para obtener el nombre del grupo
  const getGroupName = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.name : 'Grupo no encontrado';
  };

  return (
    <>
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Maestros y Alumnos</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'teachers'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="size-4" />
              Maestros ({teachers.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'students'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="size-4" />
              Alumnos ({students.length})
            </span>
          </button>
        </div>

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Lista de Maestros</h3>
              <div className="flex gap-2">
                {isAdmin() && onImportTeachers && (
                  <ImportButton
                    onImport={onImportTeachers}
                    label="Importar"
                    className="text-sm"
                  />
                )}
                {isAdmin() && (
                  <button
                    onClick={() => handleOpenAddDialog('teacher')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="size-4" />
                    Agregar Maestro
                  </button>
                )}
              </div>
            </div>
            
            {teachers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay maestros registrados
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="size-4 text-blue-600" />
                        </div>
                        <div className="font-medium text-gray-900">{teacher.name}</div>
                      </div>
                      <div className="flex gap-1">
                        {isAdmin() && (
                          <button
                            onClick={() => setEditingPerson(teacher)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="size-4" />
                          </button>
                        )}
                        {isAdmin() && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar a ${teacher.name}?`)) {
                                onDeletePerson(teacher.id, 'teacher');
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="size-3" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-3" />
                        <span>{teacher.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Lista de Alumnos</h3>
              <div className="flex gap-2">
                {isAdmin() && onImportStudents && (
                  <ImportButton
                    onImport={onImportStudents}
                    label="Importar"
                    className="text-sm"
                  />
                )}
                {isAdmin() && (
                  <button
                    onClick={() => handleOpenAddDialog('student')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="size-4" />
                    Agregar Alumno
                  </button>
                )}
              </div>
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay alumnos registrados
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <GraduationCap className="size-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          {student.age && (
                            <div className="text-xs text-gray-500">{student.age} años</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {isAdmin() && (
                          <button
                            onClick={() => setEditingPerson(student)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="size-4" />
                          </button>
                        )}
                        {isAdmin() && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar a ${student.name}?`)) {
                                onDeletePerson(student.id, 'student');
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="size-3" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-3" />
                        <span>{student.phone}</span>
                      </div>
                      {student.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="size-3" />
                          <span className="truncate">{student.address}</span>
                        </div>
                      )}
                      {student.career && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="size-3" />
                          <span className="truncate">{student.career}</span>
                        </div>
                      )}
                      {student.groups && student.groups.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                          <Users className="size-3 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {getGroupName(student.groups[0])}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onAddPerson={onAddPerson}
        role={addPersonRole}
        groups={groups}
      />

      {editingPerson && (
        <EditPersonDialog
          open={!!editingPerson}
          onOpenChange={(open) => !open && setEditingPerson(null)}
          person={editingPerson}
          onUpdatePerson={(id, updated) => {
            onUpdatePerson(id, updated);
            setEditingPerson(null);
          }}
          groups={groups}
        />
      )}
    </>
  );
}