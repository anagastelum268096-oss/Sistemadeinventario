# 📋 Instrucciones de Configuración Firebase

## 🔐 Configurar Usuarios en Firebase Authentication

Para poder iniciar sesión en el sistema, necesitas crear usuarios en Firebase Authentication:

### Paso 1: Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **inventario-escolar-330c3**

### Paso 2: Habilitar Authentication
1. En el menú lateral, haz clic en **Authentication**
2. Si es la primera vez, haz clic en **Get Started**
3. Ve a la pestaña **Sign-in method**
4. Habilita **Email/Password** como proveedor de autenticación

### Paso 3: Crear Usuarios
1. Ve a la pestaña **Users**
2. Haz clic en **Add User**
3. Ingresa el correo electrónico y contraseña

#### 👤 Usuarios Recomendados:

**Usuario Administrador:**
- Email: `admin@musicschool.com`
- Password: (la que tú elijas, mínimo 6 caracteres)
- Este usuario tendrá permisos de administrador porque su email contiene "admin"

**Usuario Maestro:**
- Email: `maestro@musicschool.com`
- Password: (la que tú elijas, mínimo 6 caracteres)
- Este usuario tendrá permisos de maestro (solo puede exportar, no modificar)

### Paso 4: Sistema de Roles

El sistema asigna roles automáticamente basándose en el correo electrónico:

- ✅ **Admin**: Cualquier email que contenga la palabra "admin"
  - Ejemplo: `admin@ejemplo.com`, `administrador@ejemplo.com`
  - Permisos: Acceso completo (crear, editar, eliminar, exportar)

- 👨‍🏫 **Teacher**: Cualquier otro email
  - Ejemplo: `maestro@ejemplo.com`, `profesor@ejemplo.com`
  - Permisos: Solo visualizar y exportar (sin modificar datos)

---

## 📊 Configurar Firestore Database

### Paso 1: Habilitar Firestore
1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **Create Database**
3. Selecciona **Start in test mode** (para desarrollo)
4. Elige la ubicación más cercana a tu región
5. Haz clic en **Enable**

### Paso 2: Configurar Reglas de Seguridad (Recomendado)

Ve a la pestaña **Rules** y reemplaza las reglas con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Paso 3: Las Colecciones se Crearán Automáticamente

El sistema creará automáticamente estas colecciones cuando agregues datos:
- `inventario` - Instrumentos musicales
- `grupos` - Grupos artísticos (cuando lo implementes)
- `presentaciones` - Calendario de presentaciones (cuando lo implementes)
- `prestamos` - Sistema de préstamos (cuando lo implementes)

---

## 🚀 Características Implementadas con Firebase

### ✅ Authentication
- Login con email y password
- Persistencia de sesión automática
- Detección de cambios en tiempo real
- Mensajes de error específicos en español

### ✅ Inventario (Firestore)
- Carga de datos en tiempo real (onSnapshot)
- Agregar instrumentos (addDoc)
- Editar instrumentos (updateDoc)
- Eliminar instrumentos (deleteDoc)
- Los cambios se reflejan instantáneamente en todos los dispositivos
- Estados de carga y manejo de errores

---

## 🔧 Próximos Pasos Sugeridos

1. **Crear usuarios de prueba** en Firebase Authentication
2. **Iniciar sesión** en la aplicación con los usuarios creados
3. **Agregar instrumentos** al inventario desde la interfaz
4. **Verificar** que los datos persisten en Firestore Database

---

## ⚠️ Notas Importantes

- **Test Mode**: Las reglas actuales permiten acceso a cualquier usuario autenticado. Para producción, debes configurar reglas más estrictas.
- **Seguridad**: Nunca compartas las credenciales de Firebase en repositorios públicos.
- **Backup**: Considera configurar backups automáticos de Firestore para proteger tus datos.
- **Cuotas**: Firebase tiene un plan gratuito generoso, pero revisa las cuotas si esperas alto tráfico.

---

## 📚 Documentación Adicional

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
