<template>
  <section class="container py-4">
    <div class="row g-4">

      <!-- FORMULARIO -->
      <div class="col-12 col-lg-5">
        <div class="card shadow-sm h-100">
          <div class="card-header text-white" :class="tareaSeleccionadaId ? 'bg-warning' : 'bg-primary'">
            <h2 class="h5 mb-0">
              {{ tareaSeleccionadaId ? '✏️ Editar tarea' : '➕ Añadir tarea' }}
            </h2>
          </div>

          <div class="card-body">
            <form @submit.prevent="addTarea" class="d-flex flex-column gap-3">

              <div>
                <label for="titulo" class="form-label">Título *</label>
                <input id="titulo" v-model.trim="form.titulo" type="text" class="form-control" placeholder="Título de la tarea" />
                <small v-if="errores.titulo" class="text-danger">{{ errores.titulo }}</small>
              </div>

              <div>
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" v-model.trim="form.descripcion" class="form-control" rows="2" placeholder="Describe la tarea..."></textarea>
              </div>

              <div>
                <label for="fecha" class="form-label">Fecha *</label>
                <input id="fecha" v-model="form.fecha" type="date" class="form-control" />
                <small v-if="errores.fecha" class="text-danger">{{ errores.fecha }}</small>
              </div>

              <div>
                <label for="estado" class="form-label">Estado *</label>
                <select id="estado" v-model="form.estado" class="form-select">
                  <option value="">Selecciona un estado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="finalizada">Finalizada</option>
                </select>
                <small v-if="errores.estado" class="text-danger">{{ errores.estado }}</small>
              </div>

              <div>
                <label class="form-label">Prioridad</label>
                <div class="d-flex gap-3">
                  <div class="form-check" v-for="prio in ['baja', 'media', 'alta']" :key="prio">
                    <input class="form-check-input" type="radio" :id="'prio' + prio" :value="prio" v-model="form.prioridad" />
                    <label class="form-check-label text-capitalize" :for="'prio' + prio">
                      {{ prio === 'baja' ? '🟢' : prio === 'media' ? '🟡' : '🔴' }} {{ prio }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Horas y Precio/hora -->
              <div class="row g-2">
                <div class="col-6">
                  <label for="horas" class="form-label">Horas</label>
                  <input id="horas" v-model.number="form.horas" type="number" min="0" step="0.5"
                    class="form-control" placeholder="0" @input="calcularTotal" />
                </div>
                <div class="col-6">
                  <label for="precioHora" class="form-label">Precio/hora (€)</label>
                  <input id="precioHora" v-model.number="form.precioHora" type="number" min="0" step="0.01"
                    class="form-control" placeholder="0.00" @input="calcularTotal" />
                </div>
              </div>

              <div class="alert alert-info py-2 mb-0 d-flex justify-content-between align-items-center">
                <span class="fw-bold">💰 Total calculado:</span>
                <span class="fs-5 fw-bold text-primary">{{ formatEuro(form.total) }}</span>
              </div>

              <div>
                <label for="empleadoSelect" class="form-label">Empleado</label>
                <select id="empleadoSelect" v-model="form.empleadoId" class="form-select">
                  <option :value="null">Sin asignar</option>
                  <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                    [{{ emp.id }}] {{ emp.nombre }} {{ emp.apellidos }}
                  </option>
                </select>
              </div>

              <div>
                <label for="empleadoId" class="form-label">O busca por ID de empleado</label>
                <div class="input-group">
                  <input id="empleadoId" v-model="busquedaId" type="number" class="form-control"
                    :class="estiloInputEmpleado" placeholder="ID del empleado" @input="resetBusqueda" />
                  <button type="button" class="btn btn-outline-secondary" @click="buscarEmpleadoPorId">🔍</button>
                </div>
                <small v-if="empleadoEncontrado === true" class="text-success fw-bold">✅ {{ nombreEmpleadoBuscado }}</small>
                <small v-if="empleadoEncontrado === false" class="text-danger">❌ Empleado no encontrado</small>
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button type="submit" class="btn btn-primary" :disabled="cargando">
                  {{ tareaSeleccionadaId ? 'Guardar' : 'Añadir' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="resetFormulario">Limpiar</button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <!-- LISTADO -->
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h2 class="h5 mb-0">Listado de tareas</h2>
            <span class="badge bg-light text-dark">{{ tareas.length }}</span>
          </div>

          <div class="card-body">
            <div v-if="errorCarga" class="alert alert-danger">{{ errorCarga }}</div>
            <div v-else-if="tareas.length === 0" class="alert alert-info mb-0">No hay tareas todavía.</div>

            <div v-else class="d-flex flex-column gap-3">
              <div v-for="tarea in tareas" :key="tarea.id" class="border rounded p-3" :class="estadoClase(tarea.estado)">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                  <div>
                    <h3 class="h6 mb-1 fw-bold">{{ tarea.titulo }}</h3>
                    <p class="mb-1 text-muted small">{{ tarea.descripcion }}</p>
                    <p class="mb-1 small"><strong>📅 Fecha:</strong> {{ tarea.fecha }}</p>
                    <p class="mb-1 small">
                      <strong>📌 Estado:</strong>
                      <span class="badge ms-1" :class="badgeEstado(tarea.estado)">{{ estadoLabel(tarea.estado) }}</span>
                    </p>
                    <p class="mb-1 small"><strong>⚡ Prioridad:</strong> {{ tarea.prioridad }}</p>
                    <p class="mb-1 small">
                      <strong>⏱ Horas:</strong> {{ tarea.horas ?? '—' }}
                      &nbsp;|&nbsp;
                      <strong>€/h:</strong> {{ tarea.precioHora != null ? formatEuro(tarea.precioHora) : '—' }}
                      &nbsp;|&nbsp;
                      <strong>Total:</strong>
                      <span class="text-primary fw-bold">{{ tarea.total != null ? formatEuro(tarea.total) : '—' }}</span>
                    </p>
                    <p class="mb-0 small">
                      <strong>👤 Empleado:</strong>
                      <span class="fw-bold">{{ nombreEmpleado(tarea.empleadoId) }}</span>
                    </p>
                  </div>

                  <div class="d-flex flex-column gap-1">
                    <button class="btn btn-sm btn-outline-primary" @click="selTarea(tarea)">Cargar</button>
                    <button class="btn btn-sm btn-outline-danger" @click="delTarea(tarea.id)">Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_TAREAS    = 'http://localhost:3000/tareas'
const API_EMPLEADOS = 'http://localhost:3000/empleados'

const tareas     = ref([])
const empleados  = ref([])
const cargando   = ref(false)
const errorCarga = ref('')

const form = reactive({
  titulo: '', descripcion: '', fecha: '', estado: '', prioridad: 'media',
  empleadoId: null, horas: null, precioHora: null, total: 0
})

const errores = reactive({ titulo: '', fecha: '', estado: '' })
const tareaSeleccionadaId  = ref(null)
const busquedaId            = ref(null)
const empleadoEncontrado    = ref(null)
const nombreEmpleadoBuscado = ref('')

onMounted(async () => { await Promise.all([getTareas(), getEmpleados()]) })

// ── GET ───────────────────────────────────────────────────────────────
async function getTareas() {
  errorCarga.value = ''
  try {
    const res = await axios.get(API_TAREAS)
    tareas.value = res.data
  } catch { errorCarga.value = 'No se pudo conectar con el servidor.' }
}

async function getEmpleados() {
  try {
    const res = await axios.get(API_EMPLEADOS)
    empleados.value = res.data
  } catch (err) { console.error(err) }
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatEuro(valor) {
  if (valor == null || isNaN(valor)) return '0,00 €'
  return Number(valor).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function calcularTotal() {
  const h = Number(form.horas)      || 0
  const p = Number(form.precioHora) || 0
  form.total = parseFloat((h * p).toFixed(2))
}

function nombreEmpleado(id) {
  if (!id) return 'Sin asignar'
  const emp = empleados.value.find(e => String(e.id) === String(id))
  return emp ? `${emp.nombre} ${emp.apellidos}` : 'ID no válido'
}

const estadoClase = (e) => ({
  'border-danger border-start border-4':  e === 'pendiente',
  'border-warning border-start border-4': e === 'en_proceso',
  'border-success border-start border-4': e === 'finalizada'
})
const badgeEstado = (e) => ({
  'bg-danger': e === 'pendiente',
  'bg-warning text-dark': e === 'en_proceso',
  'bg-success': e === 'finalizada'
})
const estadoLabel = (e) =>
  ({ pendiente: 'Pendiente', en_proceso: 'En proceso', finalizada: 'Finalizada' }[e] || e)

const estiloInputEmpleado = computed(() => {
  if (empleadoEncontrado.value === true)  return 'bg-warning bg-opacity-25 border-warning'
  if (empleadoEncontrado.value === false) return 'border-danger'
  return ''
})

function buscarEmpleadoPorId() {
  if (!busquedaId.value) return
  const emp = empleados.value.find(e => String(e.id) === String(busquedaId.value))
  if (emp) {
    empleadoEncontrado.value    = true
    nombreEmpleadoBuscado.value = `${emp.nombre} ${emp.apellidos}`
    form.empleadoId = emp.id
  } else {
    empleadoEncontrado.value = false
    Swal.fire({ icon: 'error', title: 'Error', text: `No existe ningún empleado con ID ${busquedaId.value}.` })
    busquedaId.value = null
  }
}

function resetBusqueda() { empleadoEncontrado.value = null; nombreEmpleadoBuscado.value = '' }

function validar() {
  errores.titulo = form.titulo ? '' : 'El título es obligatorio.'
  errores.fecha  = form.fecha  ? '' : 'La fecha es obligatoria.'
  errores.estado = form.estado ? '' : 'El estado es obligatorio.'
  return !errores.titulo && !errores.fecha && !errores.estado
}

// ── POST / PUT ────────────────────────────────────────────────────────
async function addTarea() {
  if (!validar()) return
  calcularTotal()
  Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
  try {
    if (tareaSeleccionadaId.value) {
      await axios.put(`${API_TAREAS}/${tareaSeleccionadaId.value}`, {
        ...form, id: tareaSeleccionadaId.value
      })
      Swal.fire({ title: '¡Actualizado!', icon: 'success', timer: 1800, showConfirmButton: false })
    } else {
      await axios.post(API_TAREAS, form)
      Swal.fire({ title: '¡Guardado!', icon: 'success', timer: 1800, showConfirmButton: false })
    }
    await getTareas()
    resetFormulario()
  } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la tarea.' }) }
}

// ── DELETE ────────────────────────────────────────────────────────────
async function delTarea(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar tarea?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
  })
  if (!isConfirmed) return
  Swal.fire({ title: 'Eliminando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
  try {
    await axios.delete(`${API_TAREAS}/${id}`)
    if (tareaSeleccionadaId.value === id) resetFormulario()
    await getTareas()
    Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1500, showConfirmButton: false })
  } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la tarea.' }) }
}

function selTarea(tarea) {
  tareaSeleccionadaId.value = tarea.id
  Object.assign(form, {
    titulo: tarea.titulo, descripcion: tarea.descripcion, fecha: tarea.fecha,
    estado: tarea.estado, prioridad: tarea.prioridad, empleadoId: tarea.empleadoId,
    horas: tarea.horas ?? null, precioHora: tarea.precioHora ?? null, total: tarea.total ?? 0
  })
  if (tarea.empleadoId) { busquedaId.value = tarea.empleadoId; buscarEmpleadoPorId() }
}

function resetFormulario() {
  tareaSeleccionadaId.value = null
  busquedaId.value = null
  resetBusqueda()
  Object.assign(form, {
    titulo: '', descripcion: '', fecha: '', estado: '', prioridad: 'media',
    empleadoId: null, horas: null, precioHora: null, total: 0
  })
  Object.keys(errores).forEach(k => errores[k] = '')
}
</script>

<style scoped>
.card { border: none; border-radius: 1rem; }
.card-header { border-top-left-radius: 1rem; border-top-right-radius: 1rem; }
</style>