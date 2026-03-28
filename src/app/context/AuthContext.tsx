import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/app/types';
import { auth } from '@/firebase/config';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mapeo de roles por correo (puedes ajustar esto según tus necesidades)
const getRoleFromEmail = (email: string): 'admin' | 'teacher' => {
  if (email.includes('admin')) return 'admin';
  return 'teacher';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario autenticado en Firebase
        const appUser: User = {
          id: firebaseUser.uid,
          username: firebaseUser.email?.split('@')[0] || 'user',
          password: '', // No almacenamos la contraseña
          role: getRoleFromEmail(firebaseUser.email || ''),
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          email: firebaseUser.email || undefined,
        };
        setUser(appUser);
      } else {
        // Usuario no autenticado
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Crear objeto User de la aplicación
      const appUser: User = {
        id: firebaseUser.uid,
        username: firebaseUser.email?.split('@')[0] || 'user',
        password: '', // No almacenamos la contraseña
        role: getRoleFromEmail(firebaseUser.email || ''),
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
        email: firebaseUser.email || undefined,
      };
      
      setUser(appUser);
      return true;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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

  // Mostrar un loader mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

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