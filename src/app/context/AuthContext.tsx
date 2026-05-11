import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/app/types';
import { supabase } from '@/supabase/config';

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
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const appUser: User = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'user',
          password: '',
          role: getRoleFromEmail(session.user.email || ''),
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
          email: session.user.email || undefined,
        };
        setUser(appUser);
      }
      setLoading(false);
    });

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const appUser: User = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'user',
          password: '',
          role: getRoleFromEmail(session.user.email || ''),
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
          email: session.user.email || undefined,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error al iniciar sesión:', error);
        return false;
      }

      if (data.user) {
        const appUser: User = {
          id: data.user.id,
          username: data.user.email?.split('@')[0] || 'user',
          password: '',
          role: getRoleFromEmail(data.user.email || ''),
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario',
          email: data.user.email || undefined,
        };
        setUser(appUser);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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