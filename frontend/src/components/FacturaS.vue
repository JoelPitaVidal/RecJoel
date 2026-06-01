<template>
  <section class="container py-4">

    <div class="mb-4">
      <h1 class="h3 fw-bold">🧾 Facturación</h1>
      <p class="text-muted">Selecciona las tareas que quieres incluir en la factura.</p>
    </div>

    <div class="row g-4">

      <!-- Selector de tareas -->
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-dark text-white">
            <h2 class="h6 mb-0">📋 Tareas disponibles</h2>
          </div>
          <div class="card-body">

            <div v-if="errorCarga" class="alert alert-danger">{{ errorCarga }}</div>
            <div v-else-if="tareas.length === 0" class="alert alert-info">No hay tareas registradas.</div>

            <div v-else>
              <div class="mb-3">
                <label class="form-label small fw-bold">Filtrar por empleado:</label>
                <select v-model="filtroEmpleadoId" class="form-select form-select-sm">
                  <option :value="null">Todos los empleados</option>
                  <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                    {{ emp.nombre }} {{ emp.apellidos }}
                  </option>
                </select>
              </div>

              <div class="d-flex flex-column gap-2">
                <div
                  v-for="tarea in tareasFiltradas"
                  :key="tarea.id"
                  class="border rounded p-3 d-flex justify-content-between align-items-start"
                  :class="tareaSeleccionada(tarea.id) ? 'border-primary bg-primary bg-opacity-10' : ''"
                >
                  <div class="form-check mb-0">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'tarea-' + tarea.id"
                      :value="tarea.id"
                      v-model="tareasSeleccionadas"
                    />
                    <label class="form-check-label" :for="'tarea-' + tarea.id">
                      <span class="fw-bold">{{ tarea.titulo }}</span>
                      <span class="text-muted small ms-2">— {{ nombreEmpleado(tarea.empleadoId) }}</span>
                      <br />
                      <small class="text-muted">
                        📅 {{ tarea.fecha }} | ⏱ {{ tarea.horas ?? 0 }}h × {{ formatEuro(tarea.precioHora) }}/h
                        = <strong class="text-primary">{{ formatEuro(tarea.total) }}</strong>
                      </small>
                    </label>
                  </div>
                  <span class="badge ms-2 flex-shrink-0" :class="badgeEstado(tarea.estado)">
                    {{ estadoLabel(tarea.estado) }}
                  </span>
                </div>
              </div>

              <div class="mt-3 d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="seleccionarTodas">Seleccionar todas</button>
                <button class="btn btn-sm btn-outline-secondary" @click="tareasSeleccionadas = []">Limpiar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de factura -->
      <div class="col-12 col-lg-5">
        <div class="card shadow-sm border-0 sticky-top" style="top: 80px;">
          <div class="card-header bg-primary text-white">
            <h2 class="h6 mb-0">🧾 Datos de la factura</h2>
          </div>
          <div class="card-body d-flex flex-column gap-3">

            <div>
              <label class="form-label">Código de factura *</label>
              <input v-model.trim="factura.codigo" type="text" class="form-control" placeholder="FAC-2026-001" />
              <small v-if="errores.codigo" class="text-danger">{{ errores.codigo }}</small>
            </div>

            <div>
              <label class="form-label">Fecha de factura *</label>
              <input v-model="factura.fecha" type="date" class="form-control" />
              <small v-if="errores.fecha" class="text-danger">{{ errores.fecha }}</small>
            </div>

            <div v-if="avisoFechas" class="alert alert-warning py-2 small">
              ⚠️ Las tareas seleccionadas tienen fechas distintas. Según el enunciado, deben ir en facturas separadas.
            </div>

            <div v-if="tareasSeleccionadas.length > 0" class="border rounded p-3 bg-light">
              <p class="small mb-1"><strong>Tareas incluidas:</strong> {{ tareasSeleccionadas.length }}</p>
              <p class="small mb-1"><strong>Total horas:</strong> {{ totalHoras }}h</p>
              <p class="small mb-0 fs-6">
                <strong>Importe total:</strong>
                <span class="text-primary fw-bold ms-1">{{ formatEuro(totalImporte) }}</span>
              </p>
            </div>
            <div v-else class="alert alert-info py-2 small">
              Selecciona al menos una tarea para generar la factura.
            </div>

            <button
              class="btn btn-success"
              @click="generarFactura"
              :disabled="tareasSeleccionadas.length === 0 || generando"
            >
              🖨️ Imprimir / Descargar PDF
            </button>

          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API_TAREAS    = 'http://localhost:3000/tareas'
const API_EMPLEADOS = 'http://localhost:3000/empleados'

const tareas     = ref([])
const empleados  = ref([])
const errorCarga = ref('')
const generando  = ref(false)

const tareasSeleccionadas = ref([])
const filtroEmpleadoId    = ref(null)

const factura = reactive({ codigo: '', fecha: '' })
const errores = reactive({ codigo: '', fecha: '' })

onMounted(async () => {
  try {
    const [r1, r2] = await Promise.all([
      axios.get(API_TAREAS),
      axios.get(API_EMPLEADOS)
    ])
    tareas.value    = r1.data
    empleados.value = r2.data
    factura.fecha = new Date().toISOString().split('T')[0]
  } catch {
    errorCarga.value = 'No se pudo conectar con el servidor.'
  }
})

// ── Computed ──────────────────────────────────────────────────────────
const tareasFiltradas = computed(() => {
  if (!filtroEmpleadoId.value) return tareas.value
  return tareas.value.filter(t => String(t.empleadoId) === String(filtroEmpleadoId.value))
})

const tareasObjetoSeleccionadas = computed(() =>
  tareas.value.filter(t => tareasSeleccionadas.value.includes(t.id))
)

const totalHoras = computed(() =>
  tareasObjetoSeleccionadas.value.reduce((s, t) => s + (Number(t.horas) || 0), 0)
)

const totalImporte = computed(() =>
  parseFloat(tareasObjetoSeleccionadas.value.reduce((s, t) => s + (Number(t.total) || 0), 0).toFixed(2))
)

const avisoFechas = computed(() => {
  const fechas = [...new Set(tareasObjetoSeleccionadas.value.map(t => t.fecha))]
  return fechas.length > 1
})

// ── Helpers ───────────────────────────────────────────────────────────
function nombreEmpleado(id) {
  const emp = empleados.value.find(e => String(e.id) === String(id))
  return emp ? `${emp.nombre} ${emp.apellidos}` : 'Sin asignar'
}

function formatEuro(valor) {
  if (valor == null || isNaN(valor)) return '0,00 €'
  return Number(valor).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function tareaSeleccionada(id) { return tareasSeleccionadas.value.includes(id) }

function seleccionarTodas() {
  tareasSeleccionadas.value = tareasFiltradas.value.map(t => t.id)
}

const badgeEstado = (e) => ({
  'bg-danger':            e === 'pendiente',
  'bg-warning text-dark': e === 'en_proceso',
  'bg-success':           e === 'finalizada'
})
const estadoLabel = (e) =>
  ({ pendiente: 'Pendiente', en_proceso: 'En proceso', finalizada: 'Finalizada' }[e] || e)

// ── Validación ────────────────────────────────────────────────────────
function validar() {
  errores.codigo = factura.codigo ? '' : 'El código de factura es obligatorio.'
  errores.fecha  = factura.fecha  ? '' : 'La fecha de factura es obligatoria.'
  return !errores.codigo && !errores.fecha
}

// ── Generación del PDF ────────────────────────────────────────────────
async function generarFactura() {
  if (!validar()) return
  if (tareasSeleccionadas.value.length === 0) return

  generando.value = true
  Swal.fire({ title: 'Generando factura...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })

  try {
    const doc = new jsPDF()
    const tareasFact = tareasObjetoSeleccionadas.value

    doc.setFillColor(13, 110, 253)
    doc.rect(0, 0, 210, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('EmpresaTeis', 14, 14)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Avda. de Galicia, 101 · 36216 Vigo', 14, 21)
    doc.text('info@empresateis.com', 14, 27)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`FACTURA ${factura.codigo}`, 14, 44)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Fecha: ${factura.fecha}`, 14, 51)
    doc.text(`Tareas incluidas: ${tareasFact.length}`, 14, 57)

    autoTable(doc, {
      startY: 64,
      head: [['Tarea', 'Empleado', 'Fecha', 'Horas', '€/h', 'Total']],
      body: tareasFact.map(t => [
        t.titulo,
        nombreEmpleado(t.empleadoId),
        t.fecha || '—',
        t.horas ?? 0,
        formatEuro(t.precioHora),
        formatEuro(t.total)
      ]),
      headStyles: { fillColor: [33, 37, 41], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 255] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 55 },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    })

    const finalY = doc.lastAutoTable.finalY + 8
    doc.setDrawColor(200, 200, 200)
    doc.line(120, finalY, 196, finalY)
    doc.setFontSize(9)
    doc.text(`Total horas:`, 120, finalY + 7)
    doc.text(`${totalHoras.value} h`, 196, finalY + 7, { align: 'right' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`TOTAL FACTURA:`, 120, finalY + 15)
    doc.setTextColor(13, 110, 253)
    doc.text(formatEuro(totalImporte.value), 196, finalY + 15, { align: 'right' })
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Gracias por confiar en EmpresaTeis', 105, 285, { align: 'center' })

    doc.save(`factura-${factura.codigo}.pdf`)
    Swal.fire({ icon: 'success', title: '¡Factura generada!', timer: 1800, showConfirmButton: false })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar la factura.' })
    console.error(err)
  } finally {
    generando.value = false
  }
}
</script>

<style scoped>
.card { border-radius: 1rem; }
.card-header { border-top-left-radius: 1rem !important; border-top-right-radius: 1rem !important; }
</style>