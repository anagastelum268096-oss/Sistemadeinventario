import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { Instrument, Group, Person, Presentation, Loan, Category } from '../types';
import * as path from 'path';

const projectId = "vxhmwhzmqvgmhqyfsvzg";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aG13aHptcXZnbWhxeWZzdnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzMyODIsImV4cCI6MjA5MDY0OTI4Mn0.Ehi31rK8WTvbRFmou78ZmNJkspCHC8WUDeWrbIKHPC4";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function exportInstrumentsToExcel(instruments: Instrument[], outputPath: string) {
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

  XLSX.writeFile(workbook, outputPath);
}

async function exportGroupsToExcel(groups: Group[], people: Person[], outputPath: string) {
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

  XLSX.writeFile(workbook, outputPath);
}

async function exportPeopleToExcel(people: Person[], outputPath: string) {
  const teachers = people.filter((p) => p.role === 'teacher').map((person) => ({
    'Nombre': person.name,
    'Email': person.email,
    'Teléfono': person.phone,
    'Edad': person.age || '',
    'Dirección': person.address || '',
    'Carrera': person.career || '',
  }));

  const students = people.filter((p) => p.role === 'student').map((person) => ({
    'Nombre': person.name,
    'Email': person.email,
    'Teléfono': person.phone,
    'Edad': person.age || '',
    'Dirección': person.address || '',
    'Carrera': person.career || '',
    'Grupos': person.groups?.join(', ') || '',
  }));

  const teacherWorksheet = XLSX.utils.json_to_sheet(teachers);
  const studentWorksheet = XLSX.utils.json_to_sheet(students);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, teacherWorksheet, 'Maestros');
  XLSX.utils.book_append_sheet(workbook, studentWorksheet, 'Alumnos');

  XLSX.writeFile(workbook, outputPath);
}

async function exportPresentationsToExcel(presentations: Presentation[], groups: Group[], outputPath: string) {
  const data = presentations.map((presentation) => {
    const groupNames = presentation.groupIds.map((id) => groups.find((g) => g.id === id)?.name || 'Desconocido').join(', ');

    return {
      'Título': presentation.title,
      'Grupos': groupNames,
      'Fecha': presentation.date,
      'Hora': presentation.time || '',
      'Ubicación': presentation.location,
      'Descripción': presentation.description || '',
      'Estado': presentation.status,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presentaciones');

  XLSX.writeFile(workbook, outputPath);
}

async function main() {
  try {
    // Fetch all data from Supabase
    const [instrumentsRes, categoriesRes, groupsRes, peopleRes, presentationsRes, loansRes] = await Promise.all([
      supabase.from('instruments').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('groups').select('*'),
      supabase.from('people').select('*'),
      supabase.from('presentations').select('*'),
      supabase.from('loans').select('*'),
    ]);

    if (instrumentsRes.error) throw instrumentsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;
    if (groupsRes.error) throw groupsRes.error;
    if (peopleRes.error) throw peopleRes.error;
    if (presentationsRes.error) throw presentationsRes.error;
    if (loansRes.error) throw loansRes.error;

    const instruments: Instrument[] = instrumentsRes.data || [];
    const categories: Category[] = categoriesRes.data || [];
    const groups: Group[] = groupsRes.data || [];
    const people: Person[] = peopleRes.data || [];
    const presentations: Presentation[] = presentationsRes.data || [];
    const loans: Loan[] = loansRes.data || [];

    // Output directory
    const outputDir = path.join(process.cwd(), 'Aplicacion Inventario');

    // Export to Excel files
    await exportInstrumentsToExcel(instruments, path.join(outputDir, 'Inventario_Instrumentos.xlsx'));
    await exportGroupsToExcel(groups, people, path.join(outputDir, 'Grupos_Artísticos.xlsx'));
    await exportPeopleToExcel(people, path.join(outputDir, 'Maestros_y_Alumnos.xlsx'));
    await exportPresentationsToExcel(presentations, groups, path.join(outputDir, 'Presentaciones.xlsx'));

    console.log('Exportación completada exitosamente.');
  } catch (error) {
    console.error('Error durante la exportación:', error);
  }
}

main();