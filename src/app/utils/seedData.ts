import { Category, GroupType, Group, Person, Presentation } from '@/app/types';

export function seedExampleData() {
  // Verificar si ya hay datos
  const hasData = localStorage.getItem('categories') || localStorage.getItem('teachers');
  if (hasData) {
    console.log('Ya existen datos en el sistema');
    return false;
  }

  // 1. Categorías de Instrumentos
  const categories: Category[] = [
    { id: '1', name: 'Cuerdas', description: 'Instrumentos de cuerda' },
    { id: '2', name: 'Viento', description: 'Instrumentos de viento' },
    { id: '3', name: 'Percusión', description: 'Instrumentos de percusión' },
  ];

  // 2. Tipos de Grupos
  const groupTypes: GroupType[] = [
    { id: '1', name: 'Orquesta', description: 'Grupos orquestales' },
    { id: '2', name: 'Coro', description: 'Grupos vocales' },
    { id: '3', name: 'Banda', description: 'Bandas musicales' },
    { id: '4', name: 'Ensamble', description: 'Ensambles de cámara' },
  ];

  // 3. Maestros
  const teachers: Person[] = [
    {
      id: 't1',
      name: 'María González',
      email: 'maria.gonzalez@example.com',
      phone: '555-0101',
      role: 'teacher',
    },
    {
      id: 't2',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@example.com',
      phone: '555-0102',
      role: 'teacher',
    },
  ];

  // 4. Grupos Artísticos
  const groups: Group[] = [
    {
      id: 'g1',
      name: 'Orquesta Juvenil',
      type: 'Orquesta',
      teacherId: 't1',
      studentIds: ['s1', 's2'],
      color: '#8B5CF6',
    },
    {
      id: 'g2',
      name: 'Coro Escolar',
      type: 'Coro',
      teacherId: 't2',
      studentIds: ['s3', 's4'],
      color: '#3B82F6',
    },
  ];

  // 5. Alumnos
  const students: Person[] = [
    {
      id: 's1',
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      phone: '555-0201',
      role: 'student',
      age: 16,
      groups: ['g1'],
    },
    {
      id: 's2',
      name: 'Luis Fernández',
      email: 'luis.fernandez@example.com',
      phone: '555-0202',
      role: 'student',
      age: 17,
      groups: ['g1'],
    },
    {
      id: 's3',
      name: 'Sofia Ramírez',
      role: 'student',
      age: 15,
      groups: ['g2'],
    },
    {
      id: 's4',
      name: 'Diego Torres',
      role: 'student',
      age: 16,
      groups: ['g2'],
    },
  ];

  // 6. Instrumentos
  const instruments = [
    {
      id: 'i1',
      code: 'VLN-001',
      name: 'Violín Yamaha',
      category: 'Cuerdas',
      quantity: 5,
      location: 'Sala A - Estante 1',
      condition: 'good' as const,
      notes: 'En buen estado',
    },
    {
      id: 'i2',
      code: 'FLT-001',
      name: 'Flauta Traversa',
      category: 'Viento',
      quantity: 3,
      location: 'Sala B - Estante 2',
      condition: 'excellent' as const,
      notes: 'Nuevas, adquiridas en 2025',
    },
  ];

  // 7. Presentaciones (una con múltiples grupos)
  const presentations: Presentation[] = [
    {
      id: 'p1',
      title: 'Concierto de Primavera',
      groupIds: ['g1', 'g2'], // Múltiples grupos participando
      date: new Date('2026-04-15'),
      time: '19:00',
      location: 'Auditorio Principal',
      description: 'Concierto conjunto de la orquesta y el coro',
      status: 'scheduled',
    },
  ];

  // 8. Préstamos
  const loans = [
    {
      id: 'l1',
      instrumentId: 'i1',
      instrumentName: 'Violín Yamaha',
      borrowerName: 'Ana Martínez',
      borrowerEmail: 'ana.martinez@example.com',
      borrowerPhone: '555-0201',
      loanDate: new Date('2026-03-01'),
      expectedReturnDate: new Date('2026-04-01'),
      quantity: 1,
      status: 'active' as const,
      notes: 'Préstamo para práctica en casa',
    },
  ];

  // Guardar todos los datos en localStorage
  localStorage.setItem('categories', JSON.stringify(categories));
  localStorage.setItem('groupTypes', JSON.stringify(groupTypes));
  localStorage.setItem('teachers', JSON.stringify(teachers));
  localStorage.setItem('students', JSON.stringify(students));
  localStorage.setItem('groups', JSON.stringify(groups));
  localStorage.setItem('instruments', JSON.stringify(instruments)); // Cambiado de 'inventory' a 'instruments'
  localStorage.setItem('presentations', JSON.stringify(presentations));
  localStorage.setItem('loans', JSON.stringify(loans));

  console.log('✅ Datos de ejemplo cargados exitosamente');
  return true;
}

export function clearAllData() {
  const keys = [
    'categories',
    'groupTypes',
    'teachers',
    'students',
    'groups',
    'inventory',
    'presentations',
    'loans',
  ];

  keys.forEach((key) => localStorage.removeItem(key));
  console.log('🗑️ Todos los datos han sido eliminados');
}