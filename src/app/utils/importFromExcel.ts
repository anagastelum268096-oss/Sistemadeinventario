import * as XLSX from 'xlsx';
import { Instrument, Category, Loan, Presentation, Group, Person } from '@/app/types';

// Función helper para leer archivo Excel
export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsBinaryString(file);
  });
};

// Importar instrumentos
export const importInstruments = async (file: File): Promise<Instrument[]> => {
  const data = await readExcelFile(file);
  
  return data.map((row: any, index: number) => ({
    id: `imported-${Date.now()}-${index}`,
    code: row['Código'] || row['Codigo'] || row['ID'] || '',
    name: row['Nombre'] || row['Instrumento'] || '',
    category: row['Categoría'] || row['Categoria'] || row['Category'] || '',
    quantity: Number(row['Cantidad'] || row['Quantity'] || 1),
    status: row['Estado'] || row['Status'] || 'Bueno',
    location: row['Ubicación'] || row['Ubicacion'] || row['Location'] || '',
    notes: row['Notas'] || row['Notes'] || '',
  })).filter((item: Instrument) => item.name); // Filtrar filas vacías
};

// Importar categorías
export const importCategories = async (file: File): Promise<Category[]> => {
  const data = await readExcelFile(file);
  
  return data.map((row: any, index: number) => ({
    id: `imported-${Date.now()}-${index}`,
    name: row['Nombre'] || row['Name'] || '',
    description: row['Descripción'] || row['Descripcion'] || row['Description'] || '',
  })).filter((item: Category) => item.name);
};

// Importar préstamos
export const importLoans = async (file: File): Promise<Loan[]> => {
  const data = await readExcelFile(file);
  
  return data.map((row: any, index: number) => ({
    id: `imported-${Date.now()}-${index}`,
    instrumentId: row['ID Instrumento'] || row['Instrument ID'] || '',
    personName: row['Persona'] || row['Person'] || row['Nombre'] || '',
    loanDate: row['Fecha Préstamo'] || row['Loan Date'] || new Date().toISOString().split('T')[0],
    expectedReturnDate: row['Retorno Esperado'] || row['Expected Return'] || '',
    quantity: Number(row['Cantidad'] || row['Quantity'] || 1),
    status: row['Estado'] || row['Status'] || 'Activo',
  })).filter((item: Loan) => item.personName && item.instrumentId);
};

// Importar presentaciones
export const importPresentations = async (file: File): Promise<Presentation[]> => {
  const data = await readExcelFile(file);
  
  return data.map((row: any, index: number) => {
    const dateStr = row['Fecha'] || row['Date'] || '';
    let date = new Date();
    
    if (dateStr) {
      // Intentar parsear fecha en diferentes formatos
      if (typeof dateStr === 'number') {
        // Excel guarda fechas como números (días desde 1900)
        date = XLSX.SSF.parse_date_code(dateStr);
        date = new Date(date.y, date.m - 1, date.d);
      } else {
        date = new Date(dateStr);
      }
    }
    
    return {
      id: `imported-${Date.now()}-${index}`,
      title: row['Título'] || row['Titulo'] || row['Title'] || '',
      groupId: row['ID Grupo'] || row['Group ID'] || '',
      date: date,
      location: row['Ubicación'] || row['Ubicacion'] || row['Location'] || '',
      description: row['Descripción'] || row['Descripcion'] || row['Description'] || '',
    };
  }).filter((item: Presentation) => item.title);
};

// Importar grupos
export const importGroups = async (file: File): Promise<Group[]> => {
  const data = await readExcelFile(file);
  
  return data.map((row: any, index: number) => ({
    id: `imported-${Date.now()}-${index}`,
    name: row['Nombre'] || row['Name'] || '',
    type: row['Tipo'] || row['Type'] || 'Banda',
    teacherId: row['ID Maestro'] || row['Teacher ID'] || '',
    studentIds: [],
    color: row['Color'] || row['Colour'] || '#3b82f6',
  })).filter((item: Group) => item.name);
};

// Importar maestros
export const importTeachers = async (file: File): Promise<Person[]> => {
  const data = await readExcelFile(file);
  
  return data.map((row: any, index: number) => ({
    id: `imported-${Date.now()}-${index}`,
    name: row['Nombre'] || row['Name'] || '',
    email: row['Email'] || row['Correo'] || '',
    phone: row['Teléfono'] || row['Telefono'] || row['Phone'] || '',
    role: 'teacher' as const,
  })).filter((item: Person) => item.name);
};

// Importar alumnos
export const importStudents = async (file: File): Promise<Person[]> => {
  const data = await readExcelFile(file);
  
  return data.map((row: any, index: number) => ({
    id: `imported-${Date.now()}-${index}`,
    name: row['Nombre'] || row['Name'] || '',
    email: row['Email'] || row['Correo'] || '',
    phone: row['Teléfono'] || row['Telefono'] || row['Phone'] || '',
    age: Number(row['Edad'] || row['Age']) || undefined,
    address: row['Dirección'] || row['Direccion'] || row['Address'] || '',
    career: row['Carrera'] || row['Career'] || '',
    groups: [],
    role: 'student' as const,
  })).filter((item: Person) => item.name);
};
