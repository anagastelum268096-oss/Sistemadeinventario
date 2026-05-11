import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Music, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast.success('¡Bienvenido! Inicio de sesión exitoso');
        navigate('/');
      } else {
        toast.error('Correo electrónico o contraseña incorrectos', {
          description: 'Por favor verifica tus credenciales e intenta nuevamente'
        });
      }
    } catch (error: any) {
      // Mensajes de error específicos de Firebase
      let errorMessage = 'Error al iniciar sesión';
      let errorDescription = '';

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
        errorDescription = 'La contraseña ingresada no es válida';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
        errorDescription = 'No existe una cuenta con este correo electrónico';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
        errorDescription = 'Por favor ingresa un correo electrónico válido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos';
        errorDescription = 'Por favor espera unos minutos antes de intentar nuevamente';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión';
        errorDescription = 'Verifica tu conexión a internet';
      } else {
        errorDescription = 'Por favor intenta nuevamente más tarde';
      }

      toast.error(errorMessage, {
        description: errorDescription
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sistema de Gestión Musical</CardTitle>
            <CardDescription className="mt-2">
              Ingresa tus credenciales para acceder
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Correo Electrónico</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}