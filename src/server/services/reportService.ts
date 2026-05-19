import { PrismaClient } from '@prisma/client'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

    const doc = new jsPDF()

    // Encabezado
    doc.setFontSize(16)
    doc.text('Universidad Nacional de Trujillo', 14, 20)
    doc.setFontSize(14)
    doc.text('Escuela de Ingeniería de Sistemas', 14, 28)
    doc.setFontSize(12)
    doc.text(`Horario del Docente: ${docente.nombres} ${docente.apellidos}`, 14, 38)
    doc.setFontSize(10)
    doc.text(`Categoría: ${docente.categoria} | Tipo: ${docente.tipo}`, 14, 45)

    const tableData = docente.horarios.map(h => [
      this.nombreDia(h.dia),
      `${h.hora_inicio} - ${h.hora_fin}`,
      h.curso.nombre,
      h.ambiente.codigo,
      h.tipo === 'LABORATORIO' ? 'Laboratorio' : 'Teoría',
    ])

    ;(doc as any).autoTable({
      startY: 52,
      head: [['Día', 'Horario', 'Curso', 'Ambiente', 'Tipo']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [27, 77, 156], textColor: 255, fontStyle: 'bold' },
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }

    return Buffer.from(doc.output('arraybuffer'))
  }

  async generarHorarioGeneral(ciclo?: string): Promise<Buffer> {
    const where = ciclo ? { ciclo_academico: ciclo, estado: 'ACTIVO' as const } : { estado: 'ACTIVO' as const }
    
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

    doc.setFontSize(16)
    doc.text('Universidad Nacional de Trujillo', 14, 15)
    doc.setFontSize(14)
    doc.text('Escuela de Ingeniería de Sistemas', 14, 22)
    doc.setFontSize(12)
    doc.text(`Horario General de Clases${ciclo ? ` - ${ciclo}` : ''}`, 14, 30)

    const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']

    dias.forEach((dia, index) => {
      if (index > 0) doc.addPage()

      doc.setFontSize(14)
      doc.text(this.nombreDia(dia), 14, 45)

      const horariosDia = horarios.filter(h => h.dia === dia)

      const tableData = horariosDia.map(h => [
        `${h.hora_inicio} - ${h.hora_fin}`,
        h.curso.nombre,
        `${h.docente.apellidos}, ${h.docente.nombres}`,
        h.ambiente.codigo,
        h.tipo === 'LABORATORIO' ? 'Lab' : 'Teo',
      ])

      ;(doc as any).autoTable({
        startY: 52,
        head: [['Horario', 'Curso', 'Docente', 'Ambiente', 'Tipo']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [27, 77, 156], textColor: 255, fontStyle: 'bold' },
      })
    })

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

    doc.setFontSize(16)
    doc.text('Reporte de Ambientes', 14, 20)

    const tableData = ambientes.map(a => [
      a.codigo,
      a.nombre,
      a.tipo === 'AULA' ? 'Aula' : 'Laboratorio',
      a.capacidad.toString(),
      a.ubicacion || '-',
      a.horarios.length.toString(),
    ])

    ;(doc as any).autoTable({
      startY: 30,
      head: [['Código', 'Nombre', 'Tipo', 'Capacidad', 'Ubicación', 'Horarios']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [27, 77, 156], textColor: 255, fontStyle: 'bold' },
    })

    return Buffer.from(doc.output('arraybuffer'))
  }

  private nombreDia(dia: string): string {
    const dias: Record<string, string> = {
      LUNES: 'Lunes',
      MARTES: 'Martes',
      MIERCOLES: 'Miércoles',
      JUEVES: 'Jueves',
      VIERNES: 'Viernes',
      SABADO: 'Sábado',
    }
    return dias[dia] || dia
  }
}

