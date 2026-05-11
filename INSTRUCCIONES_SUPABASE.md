# 🚀 Instrucciones para Configurar Supabase

## ✅ Paso 1: Crear las Tablas en Supabase

1. **Abre el SQL Editor en Supabase:**
   - Ve a: https://supabase.com/dashboard/project/vxhmwhzmqvgmhqyfsvzg/sql/new
   - O navega a: Tu Proyecto → SQL Editor → New Query

2. **Copia y pega el contenido del archivo `supabase_schema.sql`**

3. **Ejecuta el script:** Haz clic en el botón "Run" o presiona `Ctrl+Enter`

4. **Verifica que las tablas se crearon:**
   - Ve a: Table Editor en el menú lateral
   - Deberías ver las siguientes tablas:
     - `instruments`
     - `categories`
     - `groups`
     - `people`
     - `presentations`
     - `loans`

## ✅ Paso 2: Configurar la Autenticación

Para poder iniciar sesión, necesitas crear usuarios en Supabase:

### Opción A: Desde el Dashboard (Recomendado)

1. Ve a: **Authentication** → **Users** → **Add User**
2. Crea usuarios de prueba:
   - **Usuario Admin:**
     - Email: `admin@escuela.com`
     - Password: (elige una contraseña segura)
     - Confirm Password: (repite la contraseña)
   - **Usuario Profesor:**
     - Email: `profesor@escuela.com`
     - Password: (elige una contraseña segura)

### Opción B: Desde SQL Editor

Ejecuta este SQL para crear usuarios:

```sql
-- Crear usuario admin (cambia la contraseña)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@escuela.com',
  crypt('tu-contraseña-segura', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Crear usuario profesor (cambia la contraseña)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'profesor@escuela.com',
  crypt('tu-contraseña-segura', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

## ✅ Paso 3: Verificar la Configuración

1. **Verifica el archivo `utils/supabase/info.tsx`:**
   - Debe contener:
     - `projectId`: "vxhmwhzmqvgmhqyfsvzg"
     - `publicAnonKey`: (tu clave pública)

2. **La aplicación ya está configurada para usar Supabase** 🎉

## 🔐 Inicio de Sesión

La aplicación determina el rol del usuario según su email:
- Si el email contiene "admin" → Rol: **Admin** (acceso completo)
- Cualquier otro email → Rol: **Teacher** (acceso limitado)

## 📊 Estructura de la Base de Datos

### Tablas Principales:

1. **instruments** - Inventario de instrumentos musicales
2. **categories** - Categorías de instrumentos
3. **groups** - Grupos artísticos (orquestas, bandas, coros)
4. **people** - Maestros y alumnos
5. **presentations** - Calendario de presentaciones/conciertos
6. **loans** - Préstamos de instrumentos

### Características Implementadas:

- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acceso configuradas
- ✅ Índices para mejor rendimiento
- ✅ Triggers para actualizar `updated_at` automáticamente
- ✅ Conversión automática entre snake_case (DB) y camelCase (TypeScript)
- ✅ Suscripciones en tiempo real para actualizar la UI automáticamente

## 🔄 Migración Completada

Se han migrado exitosamente las siguientes páginas de Firebase/localStorage a Supabase:

- ✅ **Inventory** - Gestión de instrumentos
- ✅ **Calendar** - Calendario de presentaciones
- ✅ **Groups** - Gestión de grupos y personas
- ✅ **Loans** - Préstamos de instrumentos
- ✅ **Categories** - Categorías de instrumentos
- ✅ **TeacherPresentations** - Vista de presentaciones para profesores
- ✅ **AuthContext** - Autenticación con Supabase

## 🆘 Problemas Comunes

### Error: "permission-denied"
**Solución:** Verifica que hayas ejecutado el SQL completo en `supabase_schema.sql`, especialmente las políticas de Row Level Security.

### No puedo iniciar sesión
**Solución:** Asegúrate de haber creado usuarios en Authentication → Users en el dashboard de Supabase.

### Los datos no se actualizan en tiempo real
**Solución:** Verifica que Realtime esté habilitado para tus tablas en Database → Replication.

## 📝 Notas Importantes

1. **Las tablas usan snake_case** (ej: `student_ids`, `teacher_id`) pero el código TypeScript usa camelCase (ej: `studentIds`, `teacherId`). La conversión es automática.

2. **Row Level Security está habilitado** pero configurado para permitir acceso a usuarios autenticados y anónimos (para desarrollo). En producción, deberías restringir más el acceso.

3. **Los datos de ejemplo/semilla deben cargarse manualmente** o mediante las funciones de importación de la aplicación.

## 🎉 ¡Listo!

Tu aplicación ahora está completamente migrada a Supabase. Inicia sesión con las credenciales que creaste y comienza a usar la aplicación.

---

**Proyecto ID:** vxhmwhzmqvgmhqyfsvzg
**Dashboard:** https://supabase.com/dashboard/project/vxhmwhzmqvgmhqyfsvzg
