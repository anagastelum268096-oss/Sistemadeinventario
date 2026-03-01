export interface Instrument {
  id: string;
  code: string; // Código/ID del instrumento
  name: string;
  category: string;
  quantity: number;
  location: string; // Ubicación/almacenamiento
  condition: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita reparación';
  notes?: string;
  acquisitionDate?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Loan {
  id: string;
  instrumentId: string;
  instrumentName: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  loanDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  quantity: number;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
}

export interface Group {
  id: string;
  name: string;
  type: string; // Orquesta, Banda, Coro, etc.
  teacherId: string;
  studentIds: string[];
  color: string; // Para el calendario
}

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'teacher' | 'student';
  groups?: string[]; // IDs de grupos
  age?: number; // Edad del alumno
  address?: string; // Domicilio (opcional)
  career?: string; // Carrera (opcional)
}

export interface Presentation {
  id: string;
  title: string;
  groupId: string;
  date: Date;
  time: string;
  location: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher';
  name: string;
  email?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
}