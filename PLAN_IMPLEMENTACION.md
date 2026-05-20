# Plan de Implementacion - Sistema de Gestion de Horarios UNT

## Estado actual del proyecto

El sistema cuenta con: autenticacion (NextAuth + JWT), CRUD completo de docentes/cursos/ambientes, generacion automatica de horarios con algoritmo greedy por prioridad, reportes PDF (jsPDF) con grilla semanal por ciclo, dashboard con estadisticas, auditoria de cambios, y roles (Admin/Coordinador/Docente). Stack: Next.js 14 + tRPC + Prisma + PostgreSQL + Tailwind CSS.

### Trabajo adicional completado (fuera del plan original)
- ✅ PDF con grilla semanal identica a la UI (colores por ciclo, bloques multi-hora, leyenda, separador almuerzo)
- ✅ PDF multi-pagina: una pagina por cada ciclo cuando se selecciona "Todos los ciclos"
- ✅ Filtros de año academico + ciclo del curso en la pagina de reportes
- ✅ Disponibilidad variada por docente con bloques minimo 2h consecutivas
- ✅ Antiguedad actualizada para docentes de Ing. de Sistemas (Santos Fernandez: 25, Boy Chavil: 24)

---

## FASE 1: Vista de horario como grilla semanal ✅ COMPLETADA

**Problema:** La vista actual (`src/pages/horarios/index.tsx`) muestra los horarios en una tabla plana con columnas (Dia, Hora, Curso, Docente, Ambiente, Tipo). Para un sistema de horarios universitario, esto es insuficiente: se necesita una grilla visual tipo calendario semanal.

**Objetivo:** Reemplazar la tabla por una grilla donde las columnas son los dias (Lunes-Viernes) y las filas son las horas (07:00-20:00). Cada bloque de clase se muestra como una celda coloreada dentro de la grilla.

### Archivos a crear/modificar

1. **`src/components/horarios/WeeklyGrid.tsx`** (NUEVO)
   - Componente principal de la grilla semanal
   - Props: `horarios[]`, `onClickBloque(horarioId)`, `filtros`
   - Estructura: tabla HTML con `position: relative` en cada celda de dia/hora
   - Cada bloque de horario es un `div` posicionado absolutamente dentro de la celda correspondiente
   - Colores por ciclo del curso (usar el mismo `colorCiclo` de `cursos/index.tsx`)
   - Al hover, mostrar tooltip con: nombre completo del curso, docente, aula, tipo
   - Separador visual entre 13:00-14:00 (hora de almuerzo)
   - Altura de cada fila: proporcional a 1 hora (60px aprox)

2. **`src/components/horarios/ScheduleBlock.tsx`** (NUEVO)
   - Componente individual de un bloque de clase dentro de la grilla
   - Props: `horario`, `color`, `onClick`
   - Muestra: codigo del curso, apellido del docente, codigo del aula
   - Si hay conflicto (mismo docente o aula a la misma hora), borde rojo parpadeante
   - Variantes de tamano: 1h, 2h, 3h (altura proporcional)

3. **`src/components/horarios/ScheduleFilters.tsx`** (NUEVO)
   - Barra de filtros horizontal sobre la grilla
   - Filtros: ciclo academico (select), ciclo del curso 1-10 (multi-select), docente (select con busqueda), ambiente (select), tipo teoria/lab (toggle), dia especifico (chips)
   - Boton "Limpiar filtros"
   - Los filtros se aplican client-side sobre los datos ya cargados

4. **`src/pages/horarios/index.tsx`** (MODIFICAR)
   - Reemplazar el `<Table>` actual por `<WeeklyGrid>`
   - Agregar `<ScheduleFilters>` encima de la grilla
   - Agregar toggle vista: "Grilla" | "Tabla" para mantener ambas opciones
   - Al hacer clic en un bloque, abrir modal de detalle/edicion

5. **`src/components/horarios/HorarioDetailModal.tsx`** (NUEVO)
   - Modal que se abre al hacer clic en un bloque de la grilla
   - Muestra informacion completa: curso, docente, aula, capacidad, tipo, ciclo
   - Botones: "Editar" (abre formulario), "Eliminar" (con confirmacion)

### Logica de renderizado de la grilla

```
HORAS_GRILLA = [07:00, 08:00, 09:00, 10:00, 11:00, 12:00, -- almuerzo --, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00]
DIAS = [LUNES, MARTES, MIERCOLES, JUEVES, VIERNES]

Para cada horario:
  - columna = indice del dia en DIAS
  - fila_inicio = indice de hora_inicio en HORAS_GRILLA
  - altura = (hora_fin - hora_inicio) filas
  - color = colorCiclo[curso.ciclo]
```

---

## FASE 2: Mejora del algoritmo de generacion (bloques consecutivos) ✅ COMPLETADA

**Problema:** En `src/server/services/horarioGenerator.ts`, el metodo `intentarAsignarHoras()` asigna slots de 1 hora independientemente. Un curso con 3h de teoria puede quedar disperso en Lunes 7am, Miercoles 11am, Viernes 3pm. En la realidad universitaria, las clases se agrupan en bloques de 2-3 horas consecutivas.

**Objetivo:** Modificar el algoritmo para que priorice la asignacion de horas consecutivas en un mismo dia. Ejemplo: 4h de teoria = 2 bloques de 2h en 2 dias diferentes.

### Archivos a modificar

1. **`src/server/services/horarioGenerator.ts`**

   Cambiar `intentarAsignarHoras()` por una nueva estrategia:

   ```
   ESTRATEGIA DE BLOQUES CONSECUTIVOS:

   Entrada: horasRequeridas (ej: 4h teoria)

   1. Calcular distribucion ideal:
      - Si horas <= 2: un solo bloque de [horas]h
      - Si horas == 3: un bloque de 2h + un bloque de 1h (en dias diferentes)
      - Si horas == 4: dos bloques de 2h (en dias diferentes)
      - Si horas == 5: un bloque de 3h + un bloque de 2h
      - Si horas == 6: dos bloques de 3h o tres bloques de 2h

   2. Para cada bloque en la distribucion:
      a. Iterar sobre los dias disponibles
      b. Para cada dia, buscar [tamano_bloque] horas consecutivas donde:
         - El docente este disponible en TODAS las horas del bloque
         - El docente NO tenga otra clase en ninguna hora del bloque
         - Exista un MISMO ambiente libre en todas las horas del bloque
      c. Si se encuentra, asignar todas las horas del bloque de una vez
      d. Marcar el dia como "usado para este curso" para forzar dias diferentes

   3. Fallback: si no se puede asignar en bloque, usar la estrategia actual
      (hora por hora) y agregar advertencia
   ```

   Metodos nuevos a agregar:
   - `calcularDistribucionBloques(horas: number): number[]` - retorna array de tamanos de bloque
   - `buscarBloqueConsecutivo(docente, dia, tamanoBloque, ambientes, asignaciones): Asignacion[] | null`
   - `intentarAsignarEnBloques(docente, curso, tipo, horasRequeridas, ambientes, franjas, asignaciones)` - reemplaza `intentarAsignarHoras`

2. **Agregar restriccion anti-colision por ciclo:**
   - Dentro de `generarHorario()`, agrupar cursos por ciclo
   - Al asignar un curso de ciclo N, verificar que no colisione con otros cursos del mismo ciclo ya asignados (los alumnos cursan todos los del mismo ciclo)
   - Implementar como: `const cursosDelMismoCiclo = asignaciones.filter(a => cursosCicloMap[a.curso_id] === curso.ciclo)`

3. **Agregar restriccion de horas consecutivas maximas por docente:**
   - Un docente no deberia tener mas de 4 horas seguidas sin descanso
   - Verificar antes de asignar: si ya tiene 4h seguidas ese dia, saltar a la siguiente franja disponible con al menos 1h de separacion

---

## FASE 3: Edicion manual de horarios con modal ⬚ PENDIENTE

**Problema:** No existe forma de editar un horario individual. El router `horario.update` existe en el backend pero no hay UI. Solo se puede generar automaticamente o eliminar.

**Objetivo:** Agregar modal de edicion y creacion manual de horarios individuales.

### Archivos a crear/modificar

1. **`src/components/horarios/HorarioFormModal.tsx`** (NUEVO)
   - Modal con formulario para crear/editar un horario
   - Campos: Curso (select con busqueda), Docente (select filtrado por cursos que dicta), Ambiente (select filtrado por tipo), Dia (select), Hora inicio (select), Hora fin (select), Tipo (radio teoria/lab)
   - Validacion en tiempo real: al seleccionar docente+dia+hora, consultar `horario.validarHorario` para mostrar conflictos antes de guardar
   - Modo crear: todos los campos vacios
   - Modo editar: pre-cargar datos del horario existente
   - Select inteligente de ambiente: solo mostrar ambientes libres en el dia/hora seleccionados (usar `ambiente.getDisponibles`)

2. **`src/pages/horarios/index.tsx`** (MODIFICAR)
   - Agregar boton "Nuevo horario" en el header (junto a "Generar horarios")
   - Al hacer clic en un bloque de la grilla, abrir `HorarioFormModal` en modo edicion
   - Boton "+" en celdas vacias de la grilla para crear horario en ese slot especifico

3. **`src/server/routers/horario.ts`** (MODIFICAR - menor)
   - El endpoint `update` ya existe y funciona
   - Agregar endpoint `getSugerenciasAmbiente` que dado un dia/hora/tipo, retorne los ambientes disponibles ordenados por capacidad

---

## FASE 4: Carga docente y estadisticas avanzadas ⬚ PENDIENTE

**Problema:** No hay visibilidad de como esta distribuida la carga horaria entre docentes. No se puede detectar facilmente si un docente tiene 20h/semana y otro solo 4h.

**Objetivo:** Agregar vista de carga docente con grafico de barras y tabla resumen.

### Archivos a crear/modificar

1. **`src/components/dashboard/CargaDocenteChart.tsx`** (NUEVO)
   - Grafico de barras horizontal (Recharts) con cada docente y sus horas semanales
   - Barras segmentadas: azul para teoria, verde para laboratorio
   - Linea de referencia: promedio de horas (linea punteada vertical)
   - Destacar en rojo docentes con mas de 20h/semana
   - Destacar en amarillo docentes con 0h asignadas

2. **`src/components/dashboard/OcupacionAmbientesHeatmap.tsx`** (NUEVO)
   - Heatmap de ocupacion: filas = ambientes, columnas = dias
   - Cada celda muestra el % de ocupacion de ese ambiente en ese dia (horas ocupadas / 12 horas disponibles)
   - Colores: verde (0-30%), amarillo (30-70%), rojo (70-100%)
   - Al hacer clic en una celda, mostrar las clases asignadas a ese ambiente ese dia

3. **`src/server/routers/dashboard.ts`** (MODIFICAR)
   - Agregar endpoint `getCargaDocente(ciclo)`: retorna array de { docente, horas_teoria, horas_lab, horas_total }
   - Agregar endpoint `getOcupacionAmbientes(ciclo)`: retorna matriz de ocupacion por ambiente/dia

4. **`src/pages/dashboard.tsx`** (MODIFICAR)
   - Agregar seccion "Carga docente" debajo de los charts actuales
   - Agregar seccion "Ocupacion de ambientes"

5. **`src/pages/docentes/[id].tsx`** (MODIFICAR)
   - Agregar tercera tab "Horario" que muestre la grilla semanal filtrada solo para ese docente
   - Reusar el componente `WeeklyGrid` de la Fase 1 con prop `docenteId`
   - Mostrar resumen: "Este docente tiene X horas de teoria y Y horas de laboratorio esta semana"

---

## FASE 5: Deteccion y visualizacion de conflictos 🔶 PARCIALMENTE COMPLETADA

> **Hecho:** La grilla semanal ya muestra conflictos con borde rojo + animacion pulse en los bloques afectados. El header muestra el conteo de conflictos.
> **Pendiente:** ConflictOverlay.tsx (overlay con icono de alerta), ConflictPanel.tsx (panel lateral con lista detallada de conflictos clickeables).

**Problema:** Los conflictos se reportan como texto plano en listas. No hay indicacion visual en la grilla de donde estan los problemas.

**Objetivo:** Integrar la deteccion de conflictos directamente en la grilla visual.

### Archivos a crear/modificar

1. **`src/components/horarios/ConflictOverlay.tsx`** (NUEVO)
   - Overlay semi-transparente rojo que se superpone sobre los bloques en conflicto
   - Icono de alerta en la esquina superior derecha del bloque
   - Tooltip con detalle del conflicto: "Dr. Garcia tiene 2 clases a esta hora" o "Aula 101 tiene doble asignacion"

2. **`src/components/horarios/ConflictPanel.tsx`** (NUEVO)
   - Panel lateral colapsable que lista todos los conflictos detectados
   - Agrupados por tipo: conflictos de docente, conflictos de ambiente
   - Cada conflicto es clickeable y hace scroll/highlight al bloque en la grilla
   - Badge con numero total de conflictos en el header

3. **`src/components/horarios/WeeklyGrid.tsx`** (MODIFICAR)
   - Recibir prop `conflictos[]` del endpoint `horario.getConflictos`
   - Pasar conflictos relevantes a cada `ScheduleBlock`
   - Los bloques con conflicto reciben clase CSS de borde rojo + animacion pulse

4. **`src/pages/horarios/index.tsx`** (MODIFICAR)
   - Llamar `trpc.horario.getConflictos.useQuery(ciclo)` junto con `getAll`
   - Pasar conflictos a la grilla
   - Mostrar `ConflictPanel` al costado derecho de la grilla

---

## FASE 6: Exportacion a Excel ⬚ PENDIENTE

**Problema:** Solo hay exportacion PDF. Los coordinadores necesitan datos en Excel para manipularlos.

**Objetivo:** Agregar exportacion Excel para horarios, docentes y ambientes.

### Dependencia nueva

```bash
npm install xlsx
```

### Archivos a crear/modificar

1. **`src/server/services/excelService.ts`** (NUEVO)
   - Clase `ExcelService` con metodos:
     - `generarHorarioGeneral(ciclo)`: libro Excel con una hoja por dia, cada hoja con la grilla hora x ambiente
     - `generarHorarioPorDocente(docenteId)`: hoja con el horario semanal del docente
     - `generarCargaDocente(ciclo)`: tabla con todos los docentes y sus horas
     - `generarListadoCursos()`: tabla con todos los cursos, creditos, horas, ciclo
   - Retorna buffer base64 del archivo .xlsx

2. **`src/server/routers/reporte.ts`** (MODIFICAR)
   - Agregar endpoints:
     - `exportarHorarioExcel(ciclo)` - horario general en Excel
     - `exportarCargaDocenteExcel(ciclo)` - carga docente en Excel
     - `exportarCursosExcel()` - listado de cursos en Excel

3. **`src/pages/reportes/index.tsx`** (MODIFICAR)
   - Agregar cards adicionales para descarga Excel junto a los PDF existentes
   - Icono diferenciado (hoja verde de Excel vs rojo de PDF)
   - Misma mecanica de descarga: mutacion -> base64 -> link.click()

---

## FASE 7: Importacion masiva CSV ⬚ PENDIENTE

**Problema:** Registrar 83 cursos y 11 docentes uno por uno es tedioso. No hay forma de carga masiva.

**Objetivo:** Permitir importar docentes y cursos desde archivos CSV.

### Archivos a crear/modificar

1. **`src/components/import/CsvImporter.tsx`** (NUEVO)
   - Componente generico de importacion CSV
   - Props: `tipo` ('docentes' | 'cursos' | 'ambientes'), `onComplete`
   - Paso 1: subir archivo (drag & drop o click)
   - Paso 2: preview de las primeras 5 filas con mapeo de columnas
   - Paso 3: validacion (resaltar filas con errores en rojo)
   - Paso 4: confirmacion e importacion
   - Mostrar progreso: "Importando 45/83 cursos..."

2. **`src/components/import/CsvPreviewTable.tsx`** (NUEVO)
   - Tabla de preview con los datos del CSV parseado
   - Columnas con selector de mapeo: "Esta columna es -> codigo / nombre / etc"
   - Filas invalidas resaltadas con tooltip del error

3. **`src/server/routers/import.ts`** (NUEVO)
   - Router `importRouter` con endpoints:
     - `importarDocentes(data[])` - recibe array de objetos docente, valida con `docenteSchema`, inserta en batch
     - `importarCursos(data[])` - recibe array de objetos curso, valida con `cursoSchema`, inserta en batch
     - `importarAmbientes(data[])` - similar
   - Retorna: { insertados: number, errores: { fila: number, mensaje: string }[] }
   - Usar `prisma.$transaction` para atomicidad

4. **`src/server/routers/root.ts`** (MODIFICAR)
   - Agregar `import: importRouter` al router raiz

5. **`src/pages/cursos/index.tsx`** (MODIFICAR)
   - Agregar boton "Importar CSV" junto a "Nuevo curso"
   - Al hacer clic, abrir modal con `CsvImporter` tipo='cursos'

6. **`src/pages/docentes/index.tsx`** (MODIFICAR)
   - Agregar boton "Importar CSV" junto a "Nuevo docente"

7. **Plantillas CSV descargables:**
   - Agregar link "Descargar plantilla" que descargue un CSV de ejemplo con headers correctos
   - `docentes_plantilla.csv`: codigo, nombres, apellidos, correo, categoria, tipo, antiguedad, escuela
   - `cursos_plantilla.csv`: codigo, nombre, creditos, horas_teoria, horas_laboratorio, horas_practica, ciclo, departamento

### Parsing CSV (client-side)

No se necesita libreria externa. Usar `FileReader` + split por lineas + split por comas. Manejar campos entre comillas.

---

## FASE 8: Gestion de prerrequisitos con grafo visual ⬚ PENDIENTE

**Problema:** El modelo `PrerrequisitoCurso` existe en el schema pero no hay UI. No se pueden gestionar prerrequisitos ni visualizar la cadena de dependencias.

### Dependencia nueva

```bash
npm install reactflow
```

### Archivos a crear/modificar

1. **`src/components/cursos/PrerequisiteGraph.tsx`** (NUEVO)
   - Grafo interactivo usando ReactFlow
   - Cada nodo = un curso (mostrar codigo + nombre abreviado)
   - Cada arista = relacion de prerrequisito (A -> B significa "A es prerrequisito de B")
   - Nodos coloreados por ciclo (mismos colores de `colorCiclo`)
   - Layout automatico: de izquierda (ciclo I) a derecha (ciclo X)
   - Zoom y pan habilitados
   - Al hacer clic en un nodo, resaltar toda su cadena de prerrequisitos

2. **`src/components/cursos/PrerequisiteSelector.tsx`** (NUEVO)
   - Componente para el formulario de edicion de curso
   - Multi-select de cursos que son prerrequisito
   - Solo mostrar cursos de ciclos anteriores (si editas curso de ciclo V, solo ofrecer I-IV)
   - Chips con los prerrequisitos seleccionados

3. **`src/server/routers/curso.ts`** (MODIFICAR)
   - Agregar endpoint `updatePrerrequisitos(curso_id, prerrequisito_ids[])`
   - Agregar endpoint `getGrafoPrerrequisitos()` que retorne todos los cursos con sus prerrequisitos para armar el grafo

4. **`src/pages/cursos/index.tsx`** (MODIFICAR)
   - Agregar tab o boton "Ver grafo de prerrequisitos" que abra modal fullscreen con `PrerequisiteGraph`

5. **`src/pages/cursos/[id].tsx`** (NUEVO)
   - Pagina de detalle de curso
   - Tabs: Informacion general, Prerrequisitos, Docentes asignados, Horarios del curso
   - Tab prerrequisitos: lista de prerrequisitos con boton agregar/quitar + mini grafo local

---

## FASE 9: Gestion de mantenimiento de ambientes ⬚ PENDIENTE

**Problema:** El modelo `MantenimientoAmbiente` existe pero no tiene UI. El generador no lo considera.

### Archivos a crear/modificar

1. **`src/components/ambientes/MaintenanceCalendar.tsx`** (NUEVO)
   - Calendario mensual que muestra los periodos de mantenimiento
   - Dias con mantenimiento marcados en rojo/naranja
   - Al hacer clic en un dia, ver que ambientes estan en mantenimiento

2. **`src/pages/ambientes/index.tsx`** (MODIFICAR)
   - En cada tarjeta de ambiente, mostrar badge "En mantenimiento" si aplica
   - Boton "Programar mantenimiento" que abre modal con rango de fechas y descripcion

3. **`src/server/routers/ambiente.ts`** (MODIFICAR)
   - Agregar endpoints:
     - `crearMantenimiento(ambiente_id, fecha_inicio, fecha_fin, descripcion)`
     - `getMantenimientos(ambiente_id?)` - listar mantenimientos activos

4. **`src/server/services/horarioGenerator.ts`** (MODIFICAR)
   - Antes de asignar un ambiente, verificar que no este en periodo de mantenimiento
   - Si el ciclo academico tiene fecha de inicio/fin, cruzar con mantenimientos programados

---

## FASE 10: Mejoras de UX y funcionalidades menores ⬚ PENDIENTE

### 10.1 Busqueda global (Command Palette)

1. **`src/components/ui/CommandPalette.tsx`** (NUEVO)
   - Atajo: Ctrl+K para abrir
   - Buscador que busca en: docentes (nombre, codigo), cursos (nombre, codigo), ambientes (codigo, nombre)
   - Resultados agrupados por tipo con iconos
   - Al seleccionar, navegar a la pagina del item
   - Usa datos ya cargados en el cache de tRPC (no necesita endpoint nuevo)

### 10.2 Modo oscuro

1. **`src/styles/globals.css`** (MODIFICAR)
   - Agregar variantes `dark:` de Tailwind para colores principales
2. **`src/components/layout/Navbar.tsx`** (MODIFICAR)
   - Toggle de tema (sol/luna) en el navbar
3. **`tailwind.config.ts`** (MODIFICAR)
   - Agregar `darkMode: 'class'`

### 10.3 Notificaciones en tiempo real

1. **`src/components/ui/NotificationBell.tsx`** (NUEVO)
   - Campana en el navbar con badge de notificaciones no leidas
   - Dropdown con lista de notificaciones recientes
   - Tipos: "Se generaron nuevos horarios", "Conflicto detectado", "Mantenimiento programado"
2. **`prisma/schema.prisma`** (MODIFICAR)
   - Agregar modelo `Notificacion` (usuario_id, tipo, mensaje, leida, creado_en)

### 10.4 Pagina de detalle de ambiente

1. **`src/pages/ambientes/[id].tsx`** (NUEVO)
   - Informacion del ambiente, equipamiento, capacidad
   - Grilla semanal de ocupacion (reusar `WeeklyGrid` filtrado por ambiente_id)
   - Historial de mantenimientos
   - Estadistica: % de ocupacion semanal

---

## Progreso de implementacion

```
✅ FASE 1  - Grilla semanal (WeeklyGrid, ScheduleBlock, ScheduleFilters, HorarioDetailModal)
✅ FASE 2  - Algoritmo bloques consecutivos (calcularDistribucionBloques, buscarBloqueConsecutivo,
             colisionaConMismoCiclo, excederiaHorasConsecutivas, paridad ciclo/periodo)
🔶 FASE 5  - Conflictos visuales (parcial: visualizacion en grilla hecha, panel lateral pendiente)
⬚  FASE 3  - Edicion manual de horarios con modal
⬚  FASE 4  - Carga docente y estadisticas avanzadas
⬚  FASE 6  - Exportacion a Excel
⬚  FASE 7  - Importacion masiva CSV
⬚  FASE 8  - Gestion de prerrequisitos con grafo visual
⬚  FASE 9  - Gestion de mantenimiento de ambientes
⬚  FASE 10 - Mejoras de UX (dark mode, command palette, notificaciones)
```

### Proximo paso recomendado
FASE 3 (Edicion manual) — es la funcionalidad mas importante pendiente para la operacion diaria del sistema.

---

## Dependencias nuevas a instalar

```bash
npm install xlsx reactflow
```

Ninguna otra dependencia externa es necesaria. El resto se implementa con las herramientas ya disponibles (Recharts para graficos, jsPDF para PDFs, Tailwind para estilos).

---

## Resumen de archivos nuevos (estimado)

| Carpeta | Archivos nuevos | Descripcion |
|---------|----------------|-------------|
| `src/components/horarios/` | 5 | WeeklyGrid, ScheduleBlock, ScheduleFilters, ConflictOverlay, ConflictPanel |
| `src/components/horarios/` | 1 | HorarioFormModal (crear/editar) |
| `src/components/horarios/` | 1 | HorarioDetailModal |
| `src/components/dashboard/` | 2 | CargaDocenteChart, OcupacionAmbientesHeatmap |
| `src/components/import/` | 2 | CsvImporter, CsvPreviewTable |
| `src/components/cursos/` | 2 | PrerequisiteGraph, PrerequisiteSelector |
| `src/components/ambientes/` | 1 | MaintenanceCalendar |
| `src/components/ui/` | 2 | CommandPalette, NotificationBell |
| `src/server/routers/` | 1 | import.ts |
| `src/server/services/` | 1 | excelService.ts |
| `src/pages/cursos/` | 1 | [id].tsx (detalle curso) |
| `src/pages/ambientes/` | 1 | [id].tsx (detalle ambiente) |
| **Total** | **~20** | |

## Resumen de archivos modificados

| Archivo | Fases |
|---------|-------|
| `src/pages/horarios/index.tsx` | 1, 3, 5 |
| `src/pages/horarios/generar.tsx` | 2 (mostrar mejoras del algoritmo) |
| `src/pages/docentes/index.tsx` | 7 |
| `src/pages/docentes/[id].tsx` | 4 |
| `src/pages/cursos/index.tsx` | 7, 8 |
| `src/pages/ambientes/index.tsx` | 9 |
| `src/pages/dashboard.tsx` | 4 |
| `src/pages/reportes/index.tsx` | 6 |
| `src/server/services/horarioGenerator.ts` | 2, 9 |
| `src/server/routers/horario.ts` | 3 |
| `src/server/routers/dashboard.ts` | 4 |
| `src/server/routers/reporte.ts` | 6 |
| `src/server/routers/curso.ts` | 8 |
| `src/server/routers/ambiente.ts` | 9 |
| `src/server/routers/root.ts` | 7 |
| `src/components/layout/Navbar.tsx` | 10 |
| `src/styles/globals.css` | 10 |
| `prisma/schema.prisma` | 10 (modelo Notificacion) |
| `tailwind.config.ts` | 10 |
