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

              <!-- Título -->
              <div>
                <label for="titulo" class="form-label">Título *</label>
                <input
                  id="titulo"
                  v-model.trim="form.titulo"
                  type="text"
                  class="form-control"
                  placeholder="Título de la tarea"
                />
                <small v-if="errores.titulo" class="text-danger">{{ errores.titulo }}</small>
              </div>

              <!-- Descripción -->
              <div>
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea
                  id="descripcion"
                  v-model.trim="form.descripcion"
                  class="form-control"
                  rows="3"
                  placeholder="Describe la tarea..."
                ></textarea>
              </div>

              <!-- Fecha -->
              <div>
                <label for="fecha" class="form-label">Fecha *</label>
                <input
                  id="fecha"
                  v-model="form.fecha"
                  type="date"
                  class="form-control"
                />
                <small v-if="errores.fecha" class="text-danger">{{ errores.fecha }}</small>
              </div>

              <!-- Estado -->
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

              <!-- Prioridad (radiobutton) -->
              <div>
                <label class="form-label">Prioridad</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="prioBaja"
                      value="baja"
                      v-model="form.prioridad"
                    />
                    <label class="form-check-label" for="prioBaja">🟢 Baja</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="prioMedia"
                      value="media"
                      v-model="form.prioridad"
                    />
                    <label class="form-check-label" for="prioMedia">🟡 Media</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="prioAlta"
                      value="alta"
                      v-model="form.prioridad"
                    />
                    <label class="form-check-label" for="prioAlta">🔴 Alta</label>
                  </div>
                </div>
              </div>

              <!-- Empleado (búsqueda por ID) -->
              <div>
                <label for="empleadoId" class="form-label">ID Empleado</label>
                <div class="input-group">
                  <input
                    id="empleadoId"
                    v-model="form.empleadoId"
                    type="number"
                    class="form-control"
                    :class="empleadoEncontrado === true ? 'border-warning bg-warning bg-opacity-25'
                           : empleadoEncontrado === false ? 'border-danger' : ''"
                    placeholder="Introduce el ID del empleado"
                    @input="resetBusquedaEmpleado"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="buscarEmpleado"
                    title="Buscar empleado"
                  >
                    🔍
                  </button>
                </div>
                <small v-if="empleadoEncontrado === true" class="text-warning fw-bold">
                  ✅ {{ nombreEmpleadoEncontrado }}
                </small>
                <small v-if="empleadoEncontrado === false" class="text-danger">
                  ❌ Empleado no encontrado
                </small>
              </div>

              <!-- Botones -->
              <div class="d-flex gap-2 flex-wrap">
                <button type="submit" class="btn btn-primary">
                  {{ tareaSeleccionadaId ? 'Guardar cambios' : 'Añadir tarea' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="resetFormulario">
                  Limpiar
                </button>
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
            <div v-if="tareas.length === 0" class="alert alert-info mb-0">
              No hay tareas todavía.
            </div>

            <div v-else class="d-flex flex-column gap-3">
              <div
                v-for="tarea in tareas"
                :key="tarea.id"
                class="border rounded p-3"
                :class="estadoClase(tarea.estado)"
              >
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                  <div>
                    <h3 class="h6 mb-1 fw-bold">{{ tarea.titulo }}</h3>
                    <p class="mb-1 text-muted small">{{ tarea.descripcion }}</p>
                    <p class="mb-1">
                      <strong>Fecha:</strong> {{ tarea.fecha }}
                    </p>
                    <p class="mb-1">
                      <strong>Estado:</strong>
                      <span class="badge ms-1" :class="badgeEstado(tarea.estado)">
                        {{ estadoLabel(tarea.estado) }}
                      </span>
                    </p>
                    <p class="mb-1">
                      <strong>Prioridad:</strong> {{ tarea.prioridad || 'Sin asignar' }}
                    </p>
                    <p class="mb-0">
                      <strong>Empleado:</strong>
                      {{ nombreEmpleado(tarea.empleadoId) }}
                    </p>
                  </div>

                  <div class="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      @click="selTarea(tarea)"
                    >
                      Cargar
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="delTarea(tarea.id)"
                    >
                      Eliminar
                    </button>
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
import { reactive, ref, inject } from 'vue'
import Swal from 'sweetalert2'

// Empleados compartidos desde App.vue mediante provide/inject
const empleados = inject('empleados')

// ── Estado local de tareas ──────────────────────────────────────────
const tareas = ref([])

const form = reactive({
  titulo: '',
  descripcion: '',
  fecha: '',
  estado: '',
  prioridad: 'media',
  empleadoId: null
})

const errores = reactive({
  titulo: '',
  fecha: '',
  estado: ''
})

const tareaSeleccionadaId = ref(null)
const empleadoEncontrado = ref(null)   // null = sin buscar | true = encontrado | false = no existe
const nombreEmpleadoEncontrado = ref('')

// ── Helpers de estilo ───────────────────────────────────────────────
function estadoClase(estado) {
  return {
    'border-danger bg-danger bg-opacity-10':    estado === 'pendiente',
    'border-warning bg-warning bg-opacity-10':  estado === 'en_proceso',
    'border-success bg-success bg-opacity-10':  estado === 'finalizada'
  }
}

function badgeEstado(estado) {
  return {
    'bg-danger':  estado === 'pendiente',
    'bg-warning text-dark': estado === 'en_proceso',
    'bg-success': estado === 'finalizada'
  }
}

function estadoLabel(estado) {
  const map = { pendiente: 'Pendiente', en_proceso: 'En proceso', finalizada: 'Finalizada' }
  return map[estado] || estado
}

function nombreEmpleado(id) {
  if (!id || !empleados) return 'Sin asignar'
  const emp = empleados.value.find(e => e.id === Number(id))
  return emp ? `${emp.nombre} ${emp.apellidos}` : 'Sin asignar'
}

// ── Búsqueda de empleado por ID ─────────────────────────────────────
function buscarEmpleado() {
  if (!form.empleadoId) {
    empleadoEncontrado.value = null
    return
  }
  const emp = empleados.value.find(e => e.id === Number(form.empleadoId))
  if (emp) {
    empleadoEncontrado.value = true
    nombreEmpleadoEncontrado.value = `${emp.nombre} ${emp.apellidos}`
  } else {
    empleadoEncontrado.value = false
    nombreEmpleadoEncontrado.value = ''
    Swal.fire({
      icon: 'error',
      title: 'Empleado no encontrado',
      text: `No existe ningún empleado con ID ${form.empleadoId}.`,
      confirmButtonText: 'Entendido'
    })
    form.empleadoId = null
  }
}

function resetBusquedaEmpleado() {
  empleadoEncontrado.value = null
  nombreEmpleadoEncontrado.value = ''
}

// ── Validación ──────────────────────────────────────────────────────
function validarFormulario() {
  errores.titulo = ''
  errores.fecha  = ''
  errores.estado = ''
  let valido = true

  if (!form.titulo) {
    errores.titulo = 'El título es obligatorio.'
    valido = false
  }
  if (!form.fecha) {
    errores.fecha = 'La fecha es obligatoria.'
    valido = false
  }
  if (!form.estado) {
    errores.estado = 'El estado es obligatorio.'
    valido = false
  }
  return valido
}

// ── CRUD ────────────────────────────────────────────────────────────
function addTarea() {
  if (!validarFormulario()) return

  if (tareaSeleccionadaId.value) {
    const index = tareas.value.findIndex(t => t.id === tareaSeleccionadaId.value)
    if (index !== -1) {
      tareas.value[index] = { id: tareaSeleccionadaId.value, ...form }
    }
  } else {
    tareas.value.push({ id: Date.now(), ...form })
  }

  resetFormulario()
}

function selTarea(tarea) {
  tareaSeleccionadaId.value = tarea.id
  Object.assign(form, {
    titulo:      tarea.titulo,
    descripcion: tarea.descripcion,
    fecha:       tarea.fecha,
    estado:      tarea.estado,
    prioridad:   tarea.prioridad,
    empleadoId:  tarea.empleadoId
  })
  // Restaurar estado de búsqueda si había empleado
  if (tarea.empleadoId) {
    const emp = empleados.value.find(e => e.id === Number(tarea.empleadoId))
    if (emp) {
      empleadoEncontrado.value = true
      nombreEmpleadoEncontrado.value = `${emp.nombre} ${emp.apellidos}`
    }
  }
}

function delTarea(id) {
  tareas.value = tareas.value.filter(t => t.id !== id)
  if (tareaSeleccionadaId.value === id) resetFormulario()
}

function resetFormulario() {
  tareaSeleccionadaId.value = null
  empleadoEncontrado.value  = null
  nombreEmpleadoEncontrado.value = ''
  Object.assign(form, {
    titulo: '', descripcion: '', fecha: '',
    estado: '', prioridad: 'media', empleadoId: null
  })
  errores.titulo = ''
  errores.fecha  = ''
  errores.estado = ''
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 1rem;
}
.card-header {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}
</style>