import * as XLSX from 'xlsx';
import { Instrument, Group, Person, Presentation, Loan, Category } from '@/app/types';

export const exportInstrumentsToExcel = (instruments: Instrument[]) => {
  const data = instruments.map((instrument) => ({
    'Código': instrument.code,
    'Nombre': instrument.name,
    'Categoría': instrument.category,
    'Cantidad': instrument.quantity,
    'Ubicación': instrument.location,
    'Condición': instrument.condition,
    'Notas': instrument.notes || '',
    'Fecha de Adquisición': instrument.acquisitionDate || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Instrumentos');
  
  XLSX.writeFile(workbook, `Inventario_Instrumentos_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.xlsx`);
};

export const exportGroupsToExcel = (groups: Group[], people: Person[]) => {
  const data = groups.map((group) => {
    const teacher = people.find((p) => p.id === group.teacherId);
    const students = people.filter((p) => group.studentIds.includes(p.id));
    
    return {
      'Nombre del Grupo': group.name,
      'Tipo': group.type,
      'Maestro': teacher?.name || 'Sin asignar',
      'Número de Alumnos': group.studentIds.length,
      'Alumnos': students.map((s) => s.name).join(', ') || 'Ninguno',
      'Color': group.color,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Grupos');
  
  XLSX.writeFile(workbook, `Grupos_Artísticos_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.xlsx`);
};

export const exportPeopleToExcel = (people: Person[]) => {
  const teachers = people.filter((p) => p.role === 'teacher').map((person) => ({
    'Nombre': person.name,
    'Email': person.email,
    'Teléfono': person.phone,
    'Edad': person.age || '',
    'Domicilio': person.address || '',
    'Carrera': person.career || '',
  }));

  const students = people.filter((p) => p.role === 'student').map((person) => ({
    'Nombre': person.name,
    'Email': person.email,
    'Teléfono': person.phone,
    'Grupo': person.groups?.join(', ') || 'Sin grupo',
    'Edad': person.age || '',
    'Domicilio': person.address || '',
    'Carrera': person.career || '',
  }));

  const workbook = XLSX.utils.book_new();
  
  if (teachers.length > 0) {
    const teachersSheet = XLSX.utils.json_to_sheet(teachers);
    XLSX.utils.book_append_sheet(workbook, teachersSheet, 'Maestros');
  }
  
  if (students.length > 0) {
    const studentsSheet = XLSX.utils.json_to_sheet(students);
    XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Alumnos');
  }
  
  XLSX.writeFile(workbook, `Maestros_y_Alumnos_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.xlsx`);
};

export const exportPresentationsToExcel = (presentations: Presentation[], groups: Group[]) => {
  const data = presentations.map((presentation) => {
    const group = groups.find((g) => g.id === presentation.groupId);
    
    return {
      'Título': presentation.title,
      'Grupo': group?.name || 'Grupo eliminado',
      'Fecha': new Date(presentation.date).toLocaleDateString('es-MX'),
      'Hora': presentation.time,
      'Ubicación': presentation.location,
      'Descripción': presentation.description || '',
      'Estado': presentation.status === 'scheduled' ? 'Programada' : 
                presentation.status === 'completed' ? 'Completada' : 'Cancelada',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presentaciones');
  
  XLSX.writeFile(workbook, `Presentaciones_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.xlsx`);
};

export const exportLoansToExcel = (loans: Loan[]) => {
  const data = loans.map((loan) => ({
    'Instrumento': loan.instrumentName,
    'Nombre del Solicitante': loan.borrowerName,
    'Email': loan.borrowerEmail,
    'Teléfono': loan.borrowerPhone,
    'Fecha de Préstamo': new Date(loan.loanDate).toLocaleDateString('es-MX'),
    'Fecha de Devolución Esperada': new Date(loan.expectedReturnDate).toLocaleDateString('es-MX'),
    'Fecha de Devolución Real': loan.actualReturnDate ? new Date(loan.actualReturnDate).toLocaleDateString('es-MX') : 'Pendiente',
    'Cantidad': loan.quantity,
    'Estado': loan.status === 'active' ? 'Activo' : loan.status === 'returned' ? 'Devuelto' : 'Vencido',
    'Notas': loan.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Préstamos');
  
  XLSX.writeFile(workbook, `Préstamos_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.xlsx`);
};

export const exportCategoriesToExcel = (categories: Category[]) => {
  const data = categories.map((category) => ({
    'Nombre': category.name,
    'Descripción': category.description || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorías');
  
  XLSX.writeFile(workbook, `Categorías_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.xlsx`);
};