import { PrismaClient } from '@prisma/client'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const
const DIAS_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const HORAS_MANANA = [7, 8, 9, 10, 11, 12]
const HORAS_TARDE = [14, 15, 16, 17, 18, 19]
const TODAS_LAS_HORAS = [...HORAS_MANANA, ...HORAS_TARDE]

const CYCLE_COLORS: Record<number, { bg: [number, number, number]; text: [number, number, number] }> = {
  1:  { bg: [219, 234, 254], text: [30, 58, 138] },
  2:  { bg: [237, 233, 254], text: [76, 29, 149] },
  3:  { bg: [209, 250, 229], text: [6, 78, 59] },
  4:  { bg: [254, 243, 199], text: [120, 53, 15] },
  5:  { bg: [255, 228, 230], text: [136, 19, 55] },
  6:  { bg: [207, 250, 254], text: [22, 78, 99] },
  7:  { bg: [255, 237, 213], text: [124, 45, 18] },
  8:  { bg: [204, 251, 241], text: [19, 78, 74] },
  9:  { bg: [224, 231, 255], text: [49, 46, 129] },
  10: { bg: [252, 231, 243], text: [131, 24, 67] },
}
const DEFAULT_CYCLE_COLOR = {
  bg: [243, 244, 246] as [number, number, number],
  text: [55, 65, 81] as [number, number, number],
}

function calcHoraSpan(inicio: string, fin: string): number {
  const hi = parseInt(inicio.split(':')[0])
  const hf = parseInt(fin.split(':')[0])
  let count = 0
  for (let h = hi; h < hf; h++) {
    if ((TODAS_LAS_HORAS as readonly number[]).includes(h)) count++
  }
  return Math.max(count, 1)
}

interface HorarioGrilla {
  dia: string
  hora_inicio: string
  hora_fin: string
  tipo: string
  curso: { codigo: string; nombre: string; ciclo: number }
  docente?: { apellidos: string; nombres: string } | null
  ambiente: { codigo: string }
}

export class ReportService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async generarHorarioPorDocente(docenteId: string): Promise<Buffer> {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
      include: {
        horarios: {
          where: { estado: 'ACTIVO' },
          include: {
            curso: true,
            ambiente: true,
          },
          orderBy: [{ dia: 'asc' }, { hora_inicio: 'asc' }],
        },
      },
    })

    if (!docente) throw new Error('Docente no encontrado')

    const doc = new jsPDF('landscape')

    this.generarGrillaSemanal(
      doc,
      docente.horarios.map(h => ({ ...h, docente: null })),
      `Horario del Docente: ${docente.nombres} ${docente.apellidos}`,
      `Categoría: ${docente.categoria} | Tipo: ${docente.tipo}`
    )

    return Buffer.from(doc.output('arraybuffer'))
  }

  async generarHorarioGeneral(ciclo?: string, cicloCurso?: number): Promise<Buffer> {
    const where: any = { estado: 'ACTIVO' }
    if (ciclo) where.ciclo_academico = ciclo
    if (cicloCurso) where.curso = { ciclo: cicloCurso }

    const horarios = await this.prisma.horario.findMany({
      where,
      include: {
        curso: true,
        docente: true,
        ambiente: true,
      },
      orderBy: [{ dia: 'asc' }, { hora_inicio: 'asc' }],
    })

    const doc = new jsPDF('landscape')
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

    if (cicloCurso) {
      this.generarGrillaSemanal(
        doc,
        horarios,
        `Horario General de Clases${ciclo ? ` - ${ciclo}` : ''} - Ciclo ${romans[cicloCurso - 1]}`
      )
    } else {
      const ciclosPresentes = [...new Set(horarios.map(h => h.curso.ciclo))].sort((a, b) => a - b)

      ciclosPresentes.forEach((c, idx) => {
        if (idx > 0) doc.addPage('l')
        const horariosCiclo = horarios.filter(h => h.curso.ciclo === c)
        this.generarGrillaSemanal(
          doc,
          horariosCiclo,
          `Horario General de Clases${ciclo ? ` - ${ciclo}` : ''} - Ciclo ${romans[c - 1]}`
        )
      })
    }

    return Buffer.from(doc.output('arraybuffer'))
  }

  async generarReporteAmbientes(): Promise<Buffer> {
    const ambientes = await this.prisma.ambiente.findMany({
      where: { activo: true },
      include: {
        horarios: {
          where: { estado: 'ACTIVO' },
          select: { id: true },
        },
      },
      orderBy: [{ tipo: 'asc' }, { codigo: 'asc' }],
    })

    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Universidad Nacional de Trujillo', doc.internal.pageSize.width / 2, 14, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Escuela de Ingeniería de Sistemas', doc.internal.pageSize.width / 2, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte de Ambientes', doc.internal.pageSize.width / 2, 27, { align: 'center' })

    const tableData = ambientes.map(a => [
      a.codigo,
      a.nombre,
      a.tipo === 'AULA' ? 'Aula' : 'Laboratorio',
      a.capacidad.toString(),
      a.ubicacion || '-',
      a.horarios.length.toString(),
    ])

    ;(doc as any).autoTable({
      startY: 33,
      head: [['Código', 'Nombre', 'Tipo', 'Capacidad', 'Ubicación', 'Horarios']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [27, 77, 156], textColor: 255, fontStyle: 'bold' },
    })

    return Buffer.from(doc.output('arraybuffer'))
  }

  private generarGrillaSemanal(
    doc: jsPDF,
    horarios: HorarioGrilla[],
    titulo: string,
    subtitulo?: string
  ) {
    const pageW = doc.internal.pageSize.width
    const pageH = doc.internal.pageSize.height

    // ── Header ──
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Universidad Nacional de Trujillo', pageW / 2, 12, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Escuela de Ingeniería de Sistemas', pageW / 2, 18, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(titulo, pageW / 2, 25, { align: 'center' })

    let startY = 30
    if (subtitulo) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(subtitulo, pageW / 2, 30, { align: 'center' })
      startY = 34
    }

    // ── Build occupied-cells map ──
    const occupied = new Map<string, HorarioGrilla[]>()
    const spanMap = new Map<string, number>()
    const covered = new Set<string>()

    for (const h of horarios) {
      const horaInicio = parseInt(h.hora_inicio.split(':')[0])
      const diaIdx = (DIAS as readonly string[]).indexOf(h.dia)
      const rowIdx = TODAS_LAS_HORAS.indexOf(horaInicio)
      if (rowIdx === -1 || diaIdx === -1) continue

      const span = calcHoraSpan(h.hora_inicio, h.hora_fin)
      const key = `${rowIdx}_${diaIdx}`

      const list = occupied.get(key) ?? []
      list.push(h)
      occupied.set(key, list)
      spanMap.set(key, Math.max(spanMap.get(key) ?? 0, span))

      for (let r = 1; r < span; r++) {
        covered.add(`${rowIdx + r}_${diaIdx}`)
      }
    }

    // ── Build table body ──
    const body: any[][] = []

    for (let rowIdx = 0; rowIdx < TODAS_LAS_HORAS.length; rowIdx++) {
      const hora = TODAS_LAS_HORAS[rowIdx]
      const horaFin = hora + 1
      const label = `${hora.toString().padStart(2, '0')}:00\n${horaFin.toString().padStart(2, '0')}:00`

      const row: any[] = [{
        content: label,
        styles: {
          fontStyle: 'bold' as const,
          fontSize: 7,
          fillColor: [248, 250, 252],
          textColor: [100, 116, 139],
          halign: 'center' as const,
          valign: 'middle' as const,
          cellPadding: 1.5,
        },
      }]

      for (let colIdx = 0; colIdx < DIAS.length; colIdx++) {
        const key = `${rowIdx}_${colIdx}`
        if (covered.has(key)) continue

        const entries = occupied.get(key)
        const span = spanMap.get(key) ?? 1

        if (entries && entries.length > 0) {
          const ciclo = entries[0].curso.ciclo
          const colors = CYCLE_COLORS[ciclo] ?? DEFAULT_CYCLE_COLOR

          const lines: string[] = []
          for (let i = 0; i < entries.length; i++) {
            const e = entries[i]
            if (i > 0) lines.push('- - - -')
            const tipo = e.tipo === 'LABORATORIO' ? 'Lab' : 'Teo'
            lines.push(`${e.curso.codigo} (${tipo})`)
            if (span > 1) {
              lines.push(e.curso.nombre)
              if (e.docente) lines.push(e.docente.apellidos)
            }
            lines.push(e.ambiente.codigo)
          }

          row.push({
            content: lines.join('\n'),
            rowSpan: span,
            styles: {
              fillColor: colors.bg,
              textColor: colors.text,
              fontSize: 6.5,
              cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 },
              valign: 'middle' as const,
              overflow: 'linebreak' as const,
            },
          })
        } else {
          row.push({
            content: '',
            styles: { fillColor: [255, 255, 255] },
          })
        }
      }

      body.push(row)
    }

    // ── Draw table ──
    const lunchAfterRow = HORAS_MANANA.length - 1

    ;(doc as any).autoTable({
      startY,
      head: [['Hora', ...DIAS_LABELS]],
      body,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        lineWidth: 0.25,
        lineColor: [203, 213, 225],
        overflow: 'linebreak',
        minCellHeight: 11,
      },
      headStyles: {
        fillColor: [27, 77, 156],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 22 },
      },
      didDrawCell: (data: any) => {
        if (
          data.section === 'body' &&
          data.row.index === lunchAfterRow &&
          data.column.index === 0
        ) {
          const marginLeft = 14
          const y = data.cell.y + data.cell.height - 0.6
          doc.setFillColor(251, 146, 60)
          doc.rect(marginLeft, y, pageW - marginLeft * 2, 1.2, 'F')
        }
      },
    })

    // ── Legend ──
    const finalY: number = (doc as any).lastAutoTable?.finalY ?? (pageH - 20)
    const legendY = finalY + 5

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(107, 114, 128)
    doc.text('Ciclo:', 14, legendY)

    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
    let lx = 28

    for (let i = 0; i < 10; i++) {
      const c = CYCLE_COLORS[i + 1] ?? DEFAULT_CYCLE_COLOR
      doc.setFillColor(...c.bg)
      doc.roundedRect(lx, legendY - 3, 3.5, 3.5, 0.5, 0.5, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...c.text)
      doc.text(romans[i], lx + 4.5, legendY)
      lx += 15
    }

    lx += 5
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'normal')
    doc.text('Teo = Teoría   |   Lab = Laboratorio', lx, legendY)

    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-PE')}`,
      pageW - 14,
      pageH - 7,
      { align: 'right' }
    )
  }

  async generarReporteDocentes(escuela?: string): Promise<Buffer> {
    const where: any = { activo: true }
    if (escuela) where.escuela = escuela

    const docentes = await this.prisma.docente.findMany({
      where,
      include: {
        cursos_asignados: {
          include: { curso: { select: { codigo: true, nombre: true } } },
        },
        horarios: {
          where: { estado: 'ACTIVO' },
          select: { id: true },
        },
      },
      orderBy: [{ escuela: 'asc' }, { apellidos: 'asc' }],
    })

    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.width
    const pageH = doc.internal.pageSize.height

    const categoriaLabel: Record<string, string> = {
      PRINCIPAL: 'Principal',
      ASOCIADO: 'Asociado',
      AUXILIAR: 'Auxiliar',
      JEFE_PRACTICA: 'Jefe de Práctica',
    }

    if (escuela) {
      this.generarPaginaDocentes(doc, docentes, escuela, categoriaLabel)
    } else {
      const escuelas = [...new Set(docentes.map(d => d.escuela))].sort((a, b) => {
        if (a === 'Ingeniería de Sistemas') return -1
        if (b === 'Ingeniería de Sistemas') return 1
        return a.localeCompare(b)
      })

      escuelas.forEach((esc, idx) => {
        if (idx > 0) doc.addPage()
        const docentesEsc = docentes.filter(d => d.escuela === esc)
        this.generarPaginaDocentes(doc, docentesEsc, esc, categoriaLabel)
      })
    }

    return Buffer.from(doc.output('arraybuffer'))
  }

  private generarPaginaDocentes(
    doc: jsPDF,
    docentes: any[],
    escuela: string,
    categoriaLabel: Record<string, string>
  ) {
    const pageW = doc.internal.pageSize.width
    const pageH = doc.internal.pageSize.height

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Universidad Nacional de Trujillo', pageW / 2, 14, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Escuela de Ingeniería de Sistemas', pageW / 2, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Reporte de Docentes - ${escuela}`, pageW / 2, 27, { align: 'center' })

    const nombrados = docentes.filter(d => d.tipo === 'NOMBRADO').length
    const contratados = docentes.filter(d => d.tipo === 'CONTRATADO').length
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Total: ${docentes.length} docentes  |  Nombrados: ${nombrados}  |  Contratados: ${contratados}`,
      pageW / 2, 33, { align: 'center' }
    )

    const tableData = docentes.map((d, i) => [
      (i + 1).toString(),
      d.codigo,
      `${d.apellidos}, ${d.nombres}`,
      d.correo,
      categoriaLabel[d.categoria] ?? d.categoria,
      d.tipo === 'NOMBRADO' ? 'Nombrado' : 'Contratado',
      `${d.antiguedad}`,
      d.cursos_asignados.length.toString(),
      d.horarios.length.toString(),
    ])

    ;(doc as any).autoTable({
      startY: 38,
      head: [['#', 'Codigo', 'Docente', 'Correo', 'Categoria', 'Tipo', 'Ant.', 'Cursos', 'Horarios']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      headStyles: {
        fillColor: [27, 77, 156],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 42 },
        3: { cellWidth: 40, fontSize: 6.5 },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 10, halign: 'center' },
        7: { cellWidth: 12, halign: 'center' },
        8: { cellWidth: 14, halign: 'center' },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = data.cell.raw
          if (val === 'Nombrado') {
            data.cell.styles.textColor = [6, 95, 70]
            data.cell.styles.fillColor = [209, 250, 229]
          } else {
            data.cell.styles.textColor = [120, 53, 15]
            data.cell.styles.fillColor = [254, 243, 199]
          }
        }
      },
    })

    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-PE')}`,
      pageW - 14,
      pageH - 7,
      { align: 'right' }
    )
  }
}

