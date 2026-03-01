import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/app/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios predefinidos (en producción, esto vendría de una base de datos)
const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador',
    email: 'admin@musicschool.com',
  },
  {
    id: '2',
    username: 'maestro',
    password: 'maestro123',
    role: 'teacher',
    name: 'Maestro de Música',
    email: 'maestro@musicschool.com',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Cargar usuario de localStorage al iniciar
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = defaultUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // No guardar la contraseña en localStorage
      const userToSave = { ...foundUser };
      setUser(userToSave);
      localStorage.setItem('currentUser', JSON.stringify(userToSave));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAdmin = () => user?.role === 'admin';
  const isTeacher = () => user?.role === 'teacher';

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAdmin,
    isTeacher,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}