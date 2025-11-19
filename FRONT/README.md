# NexusX Frontend

Frontend de la plataforma educativa NexusX desarrollado con React, TypeScript y Vite.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend de NexusX corriendo en `http://localhost:3000`

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` si es necesario:
```env
VITE_API_URL=http://localhost:3000/api
```

## 🏃 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 👀 Preview de Producción

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
FRONT/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/          # Context API (AuthContext)
│   │   └── AuthContext.tsx
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── GenerateActivity.tsx
│   │   ├── MyActivities.tsx
│   │   ├── PublicActivities.tsx
│   │   └── ActivityDetail.tsx
│   ├── services/         # Servicios API
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── activity.service.ts
│   │   ├── credit.service.ts
│   │   └── export.service.ts
│   ├── types/            # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── public/               # Archivos estáticos
├── index.html            # HTML principal
├── vite.config.ts        # Configuración de Vite
├── tsconfig.json         # Configuración de TypeScript
└── package.json          # Dependencias
```

## 🔐 Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para autenticación:

- El token se almacena en `localStorage`
- Se incluye automáticamente en todas las peticiones API
- Si el token expira (401), se redirige al login automáticamente

## 🎯 Funcionalidades Principales

### Autenticación
- **Login** (`/login`) - Iniciar sesión
- **Register** (`/register`) - Crear cuenta nueva

### Dashboard
- **Dashboard** (`/dashboard`) - Vista principal con herramientas disponibles
- Muestra créditos disponibles y rol del usuario
- Acceso rápido a todas las herramientas de IA

### Generación de Actividades
- **Generar Actividad** (`/generate`) - Formulario para crear actividades con IA
- Soporta múltiples tipos: Exámenes, Resúmenes, Planes de Lección, Quiz, etc.
- Selección de proveedor de IA: OpenAI, Gemini, Ollama
- Configuración de visibilidad (Privada/Pública)

### Gestión de Actividades
- **Mis Actividades** (`/my-activities`) - Lista de actividades propias
- **Actividades Públicas** (`/public-activities`) - Explorar actividades compartidas
- **Detalle de Actividad** (`/activity/:id`) - Ver contenido completo
- Exportar a Word y Excel
- Eliminar actividades propias

## 🔌 Endpoints del Backend

El frontend se conecta a los siguientes endpoints:

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil

### Actividades
- `POST /api/activities/generate` - Generar actividad con IA
- `GET /api/activities/my-activities` - Obtener mis actividades
- `GET /api/activities/public` - Obtener actividades públicas
- `GET /api/activities/:id` - Obtener actividad específica
- `PUT /api/activities/:id` - Actualizar actividad
- `DELETE /api/activities/:id` - Eliminar actividad

### Créditos
- `GET /api/credits/balance` - Obtener balance de créditos
- `GET /api/credits/history` - Obtener historial de créditos

### Exportación
- `GET /api/export/:id/word` - Exportar a Word
- `GET /api/export/:id/excel` - Exportar a Excel

## 🎨 Estilos

La aplicación utiliza estilos inline con objetos JavaScript para mantener la simplicidad y evitar dependencias adicionales. Los estilos están organizados por componente.

## 🔒 Rutas Protegidas

Todas las rutas excepto `/login` y `/register` están protegidas y requieren autenticación. Si un usuario no autenticado intenta acceder, será redirigido al login.

## ⚠️ Consideraciones Importantes

1. **Backend Requerido**: El frontend necesita que el backend esté corriendo en `http://localhost:3000`

2. **CORS**: Asegúrate de que el backend tenga CORS configurado correctamente

3. **Variables de Entorno**: No commitear el archivo `.env` con credenciales reales

4. **Créditos**: Cada generación de actividad consume créditos del usuario

5. **Roles**: 
   - STUDENT: Puede generar y ver actividades
   - TEACHER: Puede generar y ver actividades
   - ADMIN: Acceso completo (gestión de usuarios y créditos)

## 🐛 Troubleshooting

### Error de conexión con el backend
```
Error: Network Error
```
**Solución**: Verificar que el backend esté corriendo en `http://localhost:3000`

### Error 401 Unauthorized
```
Error: Request failed with status code 401
```
**Solución**: El token expiró o es inválido. Cerrar sesión y volver a iniciar sesión.

### Error al generar actividad
```
Error: Insufficient credits
```
**Solución**: El usuario no tiene créditos suficientes. Contactar al administrador.

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Preview del build de producción
- `npm run lint` - Ejecuta el linter

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT

## 👥 Autores

Equipo NexusX
