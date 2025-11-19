# NexusX Backend API

Backend API para la plataforma educativa NexusX potenciada por IA. Sistema completo de gestión de actividades pedagógicas con integración de múltiples proveedores de IA (OpenAI, Gemini, Ollama).

## 🚀 Características

- **Autenticación JWT**: Sistema seguro de registro y login
- **Múltiples proveedores de IA**: OpenAI, Google Gemini, Ollama
- **Sistema de créditos**: Control de uso de recursos de IA
- **Gestión de actividades**: CRUD completo con visibilidad pública/privada
- **Exportación**: Generación de documentos Word y Excel
- **Roles de usuario**: Admin, Teacher, Student
- **Rate limiting**: Protección contra abuso de API
- **Logging**: Sistema completo de logs con Winston

## 📋 Requisitos Previos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn
- (Opcional) Ollama instalado localmente para modelos locales

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
cd BACK
npm install
```

### 2. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env` y configurar las variables:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://user:password@localhost:5432/nexusx?schema=public"

JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=tu-api-key-de-openai
GEMINI_API_KEY=tu-api-key-de-gemini

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

DEFAULT_CREDITS=500
CREDIT_COST_OPENAI=10
CREDIT_COST_GEMINI=8
CREDIT_COST_OLLAMA=0

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configurar base de datos

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run migrate

# (Opcional) Ejecutar seed para datos de prueba
npm run seed
```

### 4. Crear carpeta de logs

```bash
mkdir logs
```

## 🚀 Arrancar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

### Modo Producción

```bash
# Compilar TypeScript
npm run build

# Ejecutar migraciones en producción
npm run migrate:prod

# Iniciar servidor
npm start
```

## 📚 Endpoints de la API

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Actividades

- `POST /api/activities/generate` - Generar actividad con IA (requiere auth)
- `GET /api/activities/my-activities` - Obtener mis actividades (requiere auth)
- `GET /api/activities/public` - Obtener actividades públicas
- `GET /api/activities/:id` - Obtener actividad por ID (requiere auth)
- `PUT /api/activities/:id` - Actualizar actividad (requiere auth)
- `DELETE /api/activities/:id` - Eliminar actividad (requiere auth)

### Créditos

- `GET /api/credits/balance` - Obtener balance de créditos (requiere auth)
- `GET /api/credits/history` - Obtener historial de créditos (requiere auth)
- `POST /api/credits/add` - Agregar créditos (requiere auth + admin)

### Exportación

- `GET /api/export/:id/word` - Exportar actividad a Word (requiere auth)
- `GET /api/export/:id/excel` - Exportar actividad a Excel (requiere auth)

### Health Check

- `GET /health` - Verificar estado del servidor

## 🔑 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <tu-token-jwt>
```

## 📝 Ejemplo de Uso

### Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesor@ejemplo.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "TEACHER",
    "subject": "Matemáticas",
    "grade": "5to"
  }'
```

### Generar Actividad con IA

```bash
curl -X POST http://localhost:3000/api/activities/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{
    "prompt": "Crea un examen de matemáticas sobre fracciones con 10 preguntas",
    "provider": "OPENAI",
    "type": "EXAM",
    "subject": "Matemáticas",
    "grade": "5to",
    "title": "Examen de Fracciones",
    "visibility": "PRIVATE"
  }'
```

## 🗄️ Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema (admin, teacher, student)
- **Activity**: Actividades generadas con IA
- **CreditHistory**: Historial de uso de créditos

### Gestión de Prisma

```bash
# Ver base de datos en navegador
npm run prisma:studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset
```

## 🤖 Configuración de Proveedores de IA

### OpenAI

1. Obtener API key en https://platform.openai.com/api-keys
2. Agregar a `.env`: `OPENAI_API_KEY=sk-...`

### Google Gemini

1. Obtener API key en https://makersuite.google.com/app/apikey
2. Agregar a `.env`: `GEMINI_API_KEY=...`

### Ollama (Local)

1. Instalar Ollama: https://ollama.ai/download
2. Descargar modelo: `ollama pull llama2`
3. Verificar que esté corriendo: `ollama list`
4. El servidor Ollama corre por defecto en `http://localhost:11434`

## 🔒 Seguridad

- Helmet para headers de seguridad
- Rate limiting para prevenir abuso
- Validación de datos con Joi
- Passwords hasheados con bcrypt
- JWT para autenticación stateless
- CORS configurado

## 📊 Logs

Los logs se guardan en la carpeta `logs/`:

- `error.log` - Solo errores
- `combined.log` - Todos los logs

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 🐛 Troubleshooting

### Error de conexión a base de datos

Verificar que PostgreSQL esté corriendo y que `DATABASE_URL` sea correcta:

```bash
# Windows
net start postgresql-x64-14

# Linux/Mac
sudo service postgresql start
```

### Error con Prisma

```bash
# Regenerar cliente
npm run prisma:generate

# Verificar migraciones
npx prisma migrate status
```

### Error con Ollama

```bash
# Verificar que Ollama esté corriendo
curl http://localhost:11434/api/tags

# Reiniciar Ollama
ollama serve
```

## 📦 Estructura del Proyecto

```
BACK/
├── prisma/
│   └── schema.prisma          # Schema de base de datos
├── src/
│   ├── config/                # Configuraciones
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── logger.ts
│   ├── controllers/           # Controladores
│   │   ├── auth.controller.ts
│   │   ├── activity.controller.ts
│   │   ├── credit.controller.ts
│   │   └── export.controller.ts
│   ├── middlewares/           # Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/                # Modelos (Prisma)
│   ├── routes/                # Rutas
│   │   ├── auth.routes.ts
│   │   ├── activity.routes.ts
│   │   ├── credit.routes.ts
│   │   ├── export.routes.ts
│   │   └── index.ts
│   ├── services/              # Servicios
│   │   ├── ai.service.ts
│   │   ├── openai.service.ts
│   │   ├── gemini.service.ts
│   │   ├── ollama.service.ts
│   │   ├── auth.service.ts
│   │   ├── activity.service.ts
│   │   ├── credit.service.ts
│   │   └── export.service.ts
│   ├── types/                 # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/                 # Utilidades
│   └── index.ts               # Punto de entrada
├── logs/                      # Logs (crear manualmente)
├── .env                       # Variables de entorno
├── .env.example               # Ejemplo de variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Flujo de Trabajo

1. Usuario se registra/inicia sesión → Recibe JWT
2. Usuario solicita generar actividad → Se verifica créditos
3. Sistema llama al proveedor de IA seleccionado
4. Se debitan créditos y se guarda la actividad
5. Usuario puede exportar a Word/Excel
6. Actividades públicas son visibles para otros usuarios

## 💳 Sistema de Créditos

- Cada usuario inicia con 500 créditos
- OpenAI: 10 créditos por generación
- Gemini: 8 créditos por generación
- Ollama: 0 créditos (gratis, modelo local)
- Los admins pueden agregar créditos a usuarios

## 🌐 Variables de Entorno Importantes

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `DATABASE_URL` | URL de conexión PostgreSQL | Sí |
| `JWT_SECRET` | Clave secreta para JWT | Sí |
| `OPENAI_API_KEY` | API key de OpenAI | No* |
| `GEMINI_API_KEY` | API key de Gemini | No* |
| `OLLAMA_BASE_URL` | URL de Ollama | No* |

*Al menos un proveedor de IA debe estar configurado

## 📄 Licencia

MIT

## 👥 Soporte

Para problemas o preguntas, crear un issue en el repositorio del proyecto.
