# Celia Serpi - Portfolio & Landing Editorial (Con Panel de Administración)

Este repositorio contiene la página web profesional de **Celia Serpi**, correctora y editora editorial. El diseño tiene una estética de tonos beige y crema, con una tipografía en marrón oscuro, proporcionando una lectura relajada y elegante que imita el papel físico de un libro.

Cuenta con un **Panel de Administración privado** para que Celia pueda gestionar las publicaciones de su sección "Comunidad" de forma 100% visual, usando un **usuario y contraseña convencionales** (sin necesidad de tocar código ni saber usar GitHub).

---

## 🚀 Características
- **Totalmente Responsive:** Optimizado para ordenadores de escritorio, tabletas y teléfonos móviles.
- **Formulario de Contacto Inteligente:** Utiliza **Web3Forms** para recibir los mensajes de clientes directamente en el correo electrónico de Celia sin costes ni servidores.
- **Base de Datos en Tiempo Real (Supabase):** Integración gratuita para cargar y guardar los posts literarios o consejos al instante.
- **Panel de Control Privado (`admin.html`):** Interfaz protegida para añadir/eliminar posts sin depender de integraciones complejas.

---

## 🛠️ Estructura del Proyecto
- `index.html`: Estructura semántica del sitio web.
- `style.css`: Estilos, tipografías y adaptabilidad responsive (incluye los estilos de la landing y del panel de control).
- `app.js`: Lógica del cliente, animaciones y lectura de base de datos.
- `admin.html`: Pantalla de inicio de sesión y consola de control para Celia.
- `admin.js`: Lógica de autenticación (login/logout) y operaciones de base de datos (guardado y borrado de publicaciones).
- `instagram.json`: Archivo de posts de respaldo local (fallback) en caso de que la base de datos de Supabase tenga problemas de red.

---

## ⚙️ Configuración Paso a Paso de Supabase (Gratuito)

Para que el panel de control y el feed en vivo funcionen, es necesario crear un proyecto gratuito en Supabase:

### 1. Crear el Proyecto
1. Regístrate gratis en [supabase.com](https://supabase.com/).
2. Haz clic en **New Project** (Nuevo Proyecto), elige un nombre (ej. `WebCelia`), define una contraseña para la base de datos y elige la región más cercana.

### 2. Crear la Tabla de Publicaciones
Una vez creado el proyecto:
1. Ve a **SQL Editor** en el menú izquierdo (icono de `>_`).
2. Haz clic en **New Query** (Nueva Consulta) y pega el siguiente código SQL para crear la tabla de posts:
   ```sql
   create table posts (
     id uuid default gen_random_uuid() primary key,
     caption text not null,
     link text,
     image text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```
3. Haz clic en **Run** (Ejecutar). La tabla `posts` ya estará creada.

### 3. Crear el Usuario de Celia (Usuario y Contraseña)
Para que Celia pueda iniciar sesión con un usuario y contraseña simples (sin email):
1. Ve a **Authentication** (icono de candado) -> **Users** -> **Add User** -> **Create User**.
2. **IMPORTANTE:** Para que use un usuario normal, introduciremos su usuario seguido de `@celiaserpi.com`.
   *   *Ejemplo:* Si su usuario es `celia`, introduce en el campo de email `celia@celiaserpi.com`.
   *   Define su contraseña.
3. Desactiva la casilla de confirmación de email (para que pueda entrar inmediatamente sin verificar bandeja de entrada).
4. Guarda el usuario.

### 4. Configurar Permisos de Seguridad (Políticas RLS)
Para evitar que personas malintencionadas puedan borrar o insertar posts en su web, activaremos la seguridad de Supabase:
1. Ve a **Database** (icono de base de datos) -> **Tables** -> Selecciona la tabla `posts`.
2. Haz clic en **RLS** (Row Level Security) y actívalo.
3. Añade las siguientes dos reglas (políticas):
   *   **Política 1: Permitir lectura pública (Select):**
       *   Name: `Permitir lectura a todo el mundo`
       *   Target roles: `public`
       *   Operation: `SELECT`
       *   Expression: `true` (deja la condición como verdadera).
   *   **Política 2: Permitir escritura solo a usuarios autenticados (Insert, Delete):**
       *   Name: `Permitir cambios solo a admin`
       *   Target roles: `authenticated`
       *   Operation: `ALL` (o selecciona INSERT y DELETE).
       *   Using expression: `auth.role() = 'authenticated'`

### 5. Vincular las claves al código
1. En Supabase, ve a **Project Settings** (icono de engranaje) -> **API**.
2. Copia la **Project URL** y la **anon public** key.
3. Abre los archivos [admin.js](file:///d:/PortfolioCelia/admin.js) y [app.js](file:///d:/PortfolioCelia/app.js) y reemplaza los valores del inicio por tus claves:
   ```javascript
   const SUPABASE_URL = "https://tu-proyecto.supabase.co";
   const SUPABASE_ANON_KEY = "tu-clave-anon-public-key";
   ```

¡Eso es todo! La web y el panel de administración estarán listos y conectados al 100%.

---

## ✉️ Configuración del Formulario (Web3Forms)
Para recibir los emails de contacto:
1. Entra en [web3forms.com](https://web3forms.com/) y genera una **Access Key** gratuita con tu email.
2. Abre `index.html` y reemplaza la línea donde dice:
   ```html
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
   ```
   Pega tu clave en lugar de `YOUR_ACCESS_KEY_HERE`.
