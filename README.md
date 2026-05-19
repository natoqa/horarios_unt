<p align="center">
  <img src="public/images/logo-unt.png" alt="Logo UNT" width="100" />
</p>

<h1 align="center">Sistema de Gesti&oacute;n de Horarios</h1>

<p align="center">
  <strong>Escuela de Ingenier&iacute;a de Sistemas &mdash; Universidad Nacional de Trujillo</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/tRPC-10-398CCB?logo=trpc" alt="tRPC" />
</p>

---

## Descripci&oacute;n

Aplicaci&oacute;n web para la gesti&oacute;n integral de horarios acad&eacute;micos de la Escuela de Ingenier&iacute;a de Sistemas de la Universidad Nacional de Trujillo. Permite administrar cursos, docentes, ambientes (aulas y laboratorios) y generar horarios acad&eacute;micos evitando cruces y conflictos.

### Caracter&iacute;sticas principales

- **Gesti&oacute;n de Cursos** &mdash; 83 cursos del plan de estudios 2018, organizados por ciclo (I al X) con cr&eacute;ditos, horas de teor&iacute;a, laboratorio y pr&aacute;ctica.
- **Gesti&oacute;n de Docentes** &mdash; Registro de docentes por escuela profesional, categor&iacute;a (Principal, Asociado, Auxiliar, Jefe de Pr&aacute;ctica) y tipo (Nombrado, Contratado).
- **Gesti&oacute;n de Ambientes** &mdash; Aulas de teor&iacute;a y laboratorios con capacidad, ubicaci&oacute;n y equipamiento.
- **Generaci&oacute;n de Horarios** &mdash; Asignaci&oacute;n de cursos a docentes y ambientes con validaci&oacute;n de disponibilidad y conflictos.
- **Dashboard** &mdash; Panel con estad&iacute;sticas, gr&aacute;ficos y actividad reciente.
- **Reportes** &mdash; Generaci&oacute;n de reportes en PDF.
- **Auditor&iacute;a** &mdash; Registro de todas las acciones realizadas en el sistema.
- **Autenticaci&oacute;n** &mdash; Login seguro con NextAuth.js y sesiones JWT.

---

## Stack Tecnol&oacute;gico

| Capa | Tecnolog&iacute;a |
|------|------------|
| **Frontend** | Next.js 14 (Pages Router), React 18, TypeScript |
| **Estilos** | Tailwind CSS 3.3, Lucide React (iconos) |
| **API** | tRPC 10 (type-safe end-to-end) |
| **Base de datos** | PostgreSQL 16, Prisma ORM 5.22 |
| **Autenticaci&oacute;n** | NextAuth.js 4 (Credentials Provider, JWT) |
| **Validaci&oacute;n** | Zod, React Hook Form |
| **Gr&aacute;ficos** | Recharts |
| **PDF** | jsPDF + jspdf-autotable |
| **Notificaciones** | React Hot Toast |

---

## Requisitos previos

- **Node.js** 18.x o superior
- **PostgreSQL** 14.x o superior
- **npm** o **pnpm**

---

## Instalaci&oacute;n

### 1. Clonar el repositorio

```bash
git clone https://github.com/natoqa/horarios_unt.git
cd horarios_unt
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la ra&iacute;z del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/horarios_unt?schema=public"

# NextAuth
NEXTAUTH_SECRET="tu-secreto-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configurar la base de datos

```bash
# Crear las tablas en PostgreSQL
npx prisma db push

# Generar el cliente Prisma
npx prisma generate

# Poblar con datos iniciales (usuario admin + datos de ejemplo)
npm run db:seed
```

### 5. Cargar datos acad&eacute;micos

```bash
# Insertar los 10 docentes activos de Ing. de Sistemas
npx tsx prisma/seed-docentes.ts
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicaci&oacute;n estar&aacute; disponible en **http://localhost:3000**

---

## Credenciales por defecto

| Correo | Contrase&ntilde;a | Rol |
|--------|------------|-----|
| `admin@unitru.edu.pe` | `Admin2024!` | Administrador |

---

## Estructura del proyecto

```
horarios-unt/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── seed.ts                # Datos iniciales (admin, ambientes, cursos)
│   └── seed-docentes.ts       # Carga de docentes activos
├── public/
│   └── images/
│       └── logo-unt.png       # Logo institucional
├── src/
│   ├── components/
│   │   ├── dashboard/         # Componentes del dashboard
│   │   │   ├── ChartsPanel.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── StatsCards.tsx
│   │   ├── layout/            # Layout principal
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                # Componentes reutilizables
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Select.tsx
│   │       ├── Spinner.tsx
│   │       └── Table.tsx
│   ├── hooks/                 # Custom hooks
│   │   ├── useDashboard.ts
│   │   └── useDocentes.ts
│   ├── lib/                   # Utilidades y configuraci&oacute;n
│   │   ├── auth.ts            # Configuraci&oacute;n NextAuth
│   │   ├── constants.ts       # Constantes del sistema
│   │   ├── prisma.ts          # Cliente Prisma (singleton)
│   │   ├── prisma-types.ts    # Re-export de tipos Prisma
│   │   ├── trpc.ts            # Cliente tRPC
│   │   ├── utils.ts           # Funciones utilitarias (cn, etc.)
│   │   └── validators.ts      # Esquemas de validaci&oacute;n Zod
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth].ts  # Endpoint NextAuth
│   │   │   └── trpc/[trpc].ts         # Endpoint tRPC
│   │   ├── ambientes/index.tsx    # Gesti&oacute;n de ambientes
│   │   ├── configuracion/index.tsx # Configuraci&oacute;n del sistema
│   │   ├── cursos/index.tsx       # Gesti&oacute;n de cursos
│   │   ├── docentes/index.tsx     # Gesti&oacute;n de docentes
│   │   ├── horarios/
│   │   │   ├── index.tsx          # Vista de horarios
│   │   │   └── generar.tsx        # Generaci&oacute;n de horarios
│   │   ├── reportes/index.tsx     # Generaci&oacute;n de reportes
│   │   ├── dashboard.tsx          # Panel principal
│   │   ├── login.tsx              # Inicio de sesi&oacute;n
│   │   ├── registro.tsx           # Registro de usuarios
│   │   ├── perfil.tsx             # Perfil de usuario
│   │   └── index.tsx              # Redirecci&oacute;n inicial
│   ├── server/
│   │   ├── routers/               # Routers tRPC
│   │   │   ├── root.ts            # Router principal
│   │   │   ├── ambiente.ts
│   │   │   ├── auth.ts
│   │   │   ├── configuracion.ts
│   │   │   ├── curso.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── docente.ts
│   │   │   ├── horario.ts
│   │   │   ├── reporte.ts
│   │   │   └── usuario.ts
│   │   ├── services/              # L&oacute;gica de negocio
│   │   │   ├── horarioGenerator.ts
│   │   │   ├── reportService.ts
│   │   │   └── validationService.ts
│   │   └── trpc.ts                # Configuraci&oacute;n del servidor tRPC
│   ├── styles/
│   │   └── globals.css            # Estilos globales + Tailwind
│   └── types/
│       ├── index.ts               # Tipos compartidos
│       └── next-auth.d.ts         # Extensi&oacute;n de tipos NextAuth
├── .env                           # Variables de entorno (no versionado)
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Modelo de datos

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Usuario   │────▶│    Sesi&oacute;n    │     │    Curso    │
│             │     └──────────────┘     │             │
│  correo     │                          │  c&oacute;digo     │
│  contrase&ntilde;a │     ┌──────────────┐     │  nombre     │
│  rol        │────▶│  Auditor&iacute;a   │     │  cr&eacute;ditos   │
└──────┬──────┘     └──────────────┘     │  ciclo      │
       │                                 └──────┬──────┘
       ▼                                        │
┌─────────────┐     ┌──────────────┐            │
│   Docente   │────▶│Disponibilidad│     ┌──────┴──────┐
│             │     └──────────────┘     │ CursoDocente│
│  c&oacute;digo     │◀────────────────────────┘             │
│  escuela    │                          └─────────────┘
│  categor&iacute;a  │
│  tipo       │     ┌──────────────┐
└──────┬──────┘     │   Ambiente   │
       │            │              │
       │            │  c&oacute;digo      │
       ▼            │  tipo        │
┌─────────────┐     │  capacidad   │
│   Horario   │◀────┘              │
│             │     └──────────────┘
│  d&iacute;a        │
│  hora_inicio│
│  hora_fin   │
│  estado     │
└─────────────┘
```

### Entidades principales

| Entidad | Descripci&oacute;n |
|---------|-------------|
| **Usuario** | Usuarios del sistema con roles (Administrador, Coordinador, Docente) |
| **Docente** | Profesores con escuela, categor&iacute;a, tipo y antig&uuml;edad |
| **Curso** | Asignaturas del plan de estudios con horas y cr&eacute;ditos |
| **Ambiente** | Aulas de teor&iacute;a y laboratorios con capacidad y equipamiento |
| **Horario** | Asignaci&oacute;n de curso + docente + ambiente en un bloque horario |
| **DisponibilidadDocente** | Bloques horarios en que un docente est&aacute; disponible |
| **CursoDocente** | Relaci&oacute;n de asignaci&oacute;n de cursos a docentes |
| **AuditoriaCambio** | Registro de auditor&iacute;a de todas las operaciones |

---

## Scripts disponibles

| Comando | Descripci&oacute;n |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:3000` |
| `npm run build` | Compila la aplicaci&oacute;n para producci&oacute;n |
| `npm run start` | Inicia el servidor en modo producci&oacute;n |
| `npm run lint` | Ejecuta ESLint para verificar el c&oacute;digo |
| `npm run db:generate` | Genera el cliente Prisma |
| `npm run db:push` | Sincroniza el esquema con la base de datos |
| `npm run db:migrate` | Ejecuta migraciones de base de datos |
| `npm run db:seed` | Ejecuta el script de datos iniciales |
| `npm run db:studio` | Abre Prisma Studio (GUI para la base de datos) |

---

## Capturas de pantalla

### Login
Pantalla de inicio de sesi&oacute;n con dise&ntilde;o de 2 columnas, floating labels y branding institucional.

### Dashboard
Panel principal con estad&iacute;sticas, gr&aacute;ficos de distribuci&oacute;n y accesos r&aacute;pidos.

### Cursos
Listado de 83 cursos organizados por ciclo (I-X) en tarjetas colapsables con c&oacute;digos de color.

### Docentes
Docentes agrupados por escuela profesional con badges de categor&iacute;a y tipo.

### Ambientes
Aulas y laboratorios agrupados por tipo con indicadores de capacidad y equipamiento.

---

## Datos acad&eacute;micos incluidos

### Plan de estudios 2018 &mdash; Ingenier&iacute;a de Sistemas

El sistema incluye los **83 cursos** del plan de estudios vigente, distribuidos en 10 ciclos acad&eacute;micos:

| Ciclo | Cursos | Ejemplo |
|-------|--------|---------|
| I | 8 | Matem&aacute;tica B&aacute;sica, Introducci&oacute;n a la Ing. de Sistemas |
| II | 8 | C&aacute;lculo I, Programaci&oacute;n Digital |
| III | 8 | C&aacute;lculo II, Estructura de Datos |
| IV | 9 | Ecuaciones Diferenciales, Base de Datos I |
| V | 9 | M&eacute;todos Num&eacute;ricos, Ingenier&iacute;a de Software I |
| VI | 9 | Investigaci&oacute;n Operativa I, Redes y Comunicaciones I |
| VII | 9 | Sistemas de Informaci&oacute;n, Inteligencia Artificial |
| VIII | 9 | Gesti&oacute;n de Proyectos, Sistemas Distribuidos |
| IX | 7 | Auditor&iacute;a de Sistemas, Tesis I |
| X | 7 | Gobierno de TI, Tesis II |

### Docentes activos (Nombrados)

| Docente | Categor&iacute;a |
|---------|-----------|
| Agreda Gamboa, Everson David | Asociado |
| Alc&aacute;ntara Moreno, Oscar Romel | Auxiliar |
| Arellano Salazar, C&eacute;sar | Auxiliar |
| Boy Chavil, Luis Enrrique | Principal |
| G&oacute;mez &Aacute;vila, Jos&eacute; Alberto | Auxiliar |
| Mendoza Rivera, Ricardo Dar&iacute;o | Auxiliar |
| Obando Rold&aacute;n, Juan Carlos | Principal |
| S&aacute;nchez Ticona, Robert Jerry | Asociado |
| Santos Fern&aacute;ndez, Juan Pedro | Asociado |
| Torres Villanueva, Marcelino | Auxiliar |

---

## Arquitectura

```
Cliente (Browser)
    │
    ▼
┌────────────────────────────────┐
│         Next.js 14             │
│    ┌───────────┬──────────┐    │
│    │  Pages    │  API     │    │
│    │  (React)  │  Routes  │    │
│    └─────┬─────┴────┬─────┘    │
│          │          │          │
│    ┌─────▼──────────▼─────┐    │
│    │       tRPC Server    │    │
│    │    (Type-safe API)   │    │
│    └──────────┬───────────┘    │
│               │                │
│    ┌──────────▼───────────┐    │
│    │     Prisma ORM       │    │
│    └──────────┬───────────┘    │
└───────────────┼────────────────┘
                │
        ┌───────▼───────┐
        │  PostgreSQL   │
        └───────────────┘
```

- **Frontend**: React con componentes modulares y Tailwind CSS para estilos
- **API**: tRPC proporciona type-safety end-to-end sin necesidad de schemas REST
- **ORM**: Prisma gestiona las consultas y migraciones de la base de datos
- **Auth**: NextAuth.js maneja autenticaci&oacute;n con JWT y sesi&oacute;n de 8 horas

---

## Contribuci&oacute;n

1. Fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

---

## Licencia

Este proyecto es de uso acad&eacute;mico para la Escuela de Ingenier&iacute;a de Sistemas de la Universidad Nacional de Trujillo.

---

<p align="center">
  Desarrollado para la <strong>Universidad Nacional de Trujillo</strong> &mdash; Escuela de Ingenier&iacute;a de Sistemas
</p>
