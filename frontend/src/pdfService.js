// pdfService.js
// Servicio centralizado para generación de PDFs con jsPDF + jspdf-autotable
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API = 'http://localhost:3000'

// ── Helpers ──────────────────────────────────────────────────────────

function cabeceraDoc(doc, titulo) {
  doc.setFillColor(13, 110, 253)          // azul Bootstrap primary
  doc.rect(0, 0, 210, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, 14, 12)

  const fecha = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${fecha}`, 196, 12, { align: 'right' })

  doc.setTextColor(0, 0, 0)
  return 24  // y de inicio para el contenido
}

function etiquetaEstado(estado) {
  return { pendiente: 'Pendiente', en_proceso: 'En proceso', finalizada: 'Finalizada' }[estado] || estado
}

function etiquetaPrioridad(p) {
  return { baja: 'Baja', media: 'Media', alta: 'Alta' }[p] || p
}

// ── 1. Listado de empleados ───────────────────────────────────────────
export async function generarPdfEmpleados() {
  const res = await fetch(`${API}/empleados`)
  const empleados = await res.json()

  const doc = new jsPDF()
  const startY = cabeceraDoc(doc, 'Listado de Empleados — EmpresaTeis')

  autoTable(doc, {
    startY,
    head: [['ID', 'Nombre', 'Apellidos', 'Email', 'Móvil', 'Puesto']],
    body: empleados.map(e => [
      e.id,
      e.nombre,
      e.apellidos,
      e.email,
      e.movil || '—',
      e.puesto ? e.puesto.toUpperCase() : '—'
    ]),
    headStyles: { fillColor: [33, 37, 41], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 240, 255] },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 12 } }
  })

  doc.save('empleados.pdf')
}

// ── 2. Listado de todas las tareas ────────────────────────────────────
export async function generarPdfTareas() {
  const [resTareas, resEmpleados] = await Promise.all([
    fetch(`${API}/tareas`),
    fetch(`${API}/empleados`)
  ])
  const tareas    = await resTareas.json()
  const empleados = await resEmpleados.json()

  const doc = new jsPDF()
  const startY = cabeceraDoc(doc, 'Listado de Tareas — EmpresaTeis')

  autoTable(doc, {
    startY,
    head: [['ID', 'Título', 'Prioridad', 'Estado', 'Empleado', 'Fecha']],
    body: tareas.map(t => {
      const emp = empleados.find(e => e.id === Number(t.empleadoId))
      return [
        t.id,
        t.titulo,
        etiquetaPrioridad(t.prioridad),
        etiquetaEstado(t.estado),
        emp ? `${emp.nombre} ${emp.apellidos}` : '—',
        t.fecha || '—'
      ]
    }),
    headStyles: { fillColor: [33, 37, 41], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 255, 240] },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 45 } }
  })

  doc.save('tareas.pdf')
}

// ── 3. Tareas por prioridad ───────────────────────────────────────────
export async function generarPdfTareasPorPrioridad(prioridad) {
  const [resTareas, resEmpleados] = await Promise.all([
    fetch(`${API}/tareas`),
    fetch(`${API}/empleados`)
  ])
  const todasTareas = await resTareas.json()
  const empleados   = await resEmpleados.json()
  const tareas = todasTareas.filter(t => t.prioridad === prioridad)

  const doc = new jsPDF()
  const titulo = `Tareas — Prioridad ${etiquetaPrioridad(prioridad)}`
  const startY = cabeceraDoc(doc, titulo)

  if (tareas.length === 0) {
    doc.setFontSize(11)
    doc.text('No hay tareas con esta prioridad.', 14, startY + 10)
  } else {
    autoTable(doc, {
      startY,
      head: [['ID', 'Título', 'Estado', 'Empleado', 'Fecha']],
      body: tareas.map(t => {
        const emp = empleados.find(e => e.id === Number(t.empleadoId))
        return [
          t.id,
          t.titulo,
          etiquetaEstado(t.estado),
          emp ? `${emp.nombre} ${emp.apellidos}` : '—',
          t.fecha || '—'
        ]
      }),
      headStyles: { fillColor: [33, 37, 41], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 252, 235] },
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 50 } }
    })
  }

  doc.save(`tareas-prioridad-${prioridad}.pdf`)
}

// ── 4. Tareas de un empleado concreto ────────────────────────────────
export async function generarPdfTareasEmpleado(empleadoId) {
  const [resTareas, resEmpleados] = await Promise.all([
    fetch(`${API}/tareas`),
    fetch(`${API}/empleados`)
  ])
  const todasTareas = await resTareas.json()
  const empleados   = await resEmpleados.json()

  const emp    = empleados.find(e => e.id === Number(empleadoId))
  const tareas = todasTareas.filter(t => Number(t.empleadoId) === Number(empleadoId))

  const doc = new jsPDF()
  const nombreEmp = emp ? `${emp.nombre} ${emp.apellidos}` : `ID ${empleadoId}`
  const startY = cabeceraDoc(doc, `Tareas de ${nombreEmp}`)

  if (tareas.length === 0) {
    doc.setFontSize(11)
    doc.text('Este empleado no tiene tareas asignadas.', 14, startY + 10)
  } else {
    autoTable(doc, {
      startY,
      head: [['ID', 'Título', 'Prioridad', 'Estado', 'Fecha']],
      body: tareas.map(t => [
        t.id,
        t.titulo,
        etiquetaPrioridad(t.prioridad),
        etiquetaEstado(t.estado),
        t.fecha || '—'
      ]),
      headStyles: { fillColor: [33, 37, 41], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [235, 248, 255] },
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 55 } }
    })
  }

  doc.save(`tareas-${nombreEmp.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}
