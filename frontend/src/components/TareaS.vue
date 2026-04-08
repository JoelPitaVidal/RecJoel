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

              <!-- Prioridad -->
              <div>
                <label class="form-label">Prioridad</label>
                <div class="d-flex gap-3">
                  <div class="form-check" v-for="prio in ['baja', 'media', 'alta']" :key="prio">
                    <input
                      class="form-check-input"
                      type="radio"
                      :id="'prio' + prio"
                      :value="prio"
                      v-model="form.prioridad"
                    />
                    <label class="form-check-label text-capitalize" :for="'prio' + prio">
                      {{ prio === 'baja' ? '🟢' : prio === 'media' ? '🟡' : '🔴' }} {{ prio }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Empleado (Búsqueda por ID) -->
              <div>
                <label for="empleadoId" class="form-label">ID Empleado</label>
                <div class="input-group">
                  <input
                    id="empleadoId"
                    v-model="form.empleadoId"
                    type="number"
                    class="form-control"
                    :class="estiloInputEmpleado"
                    placeholder="ID del empleado"
                    @input="resetBusquedaEmpleado"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="buscarEmpleado"
                  >
                    🔍
                  </button>
                </div>
                <small v-if="empleadoEncontrado === true" class="text-success fw-bold">
                  ✅ {{ nombreEmpleadoEncontrado }}
                </small>
                <small v-if="empleadoEncontrado === false" class="text-danger">
                  ❌ Empleado no encontrado
                </small>
              </div>

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
                    <p class="mb-1 small"><strong>📅 Fecha:</strong> {{ tarea.fecha }}</p>
                    <p class="mb-1 small">
                      <strong>📌 Estado:</strong>
                      <span class="badge ms-1" :class="badgeEstado(tarea.estado)">
                        {{ estadoLabel(tarea.estado) }}
                      </span>
                    </p>
                    <p class="mb-1 small"><strong>⚡ Prioridad:</strong> {{ tarea.prioridad }}</p>
                    <p class="mb-0 small">
                      <strong>👤 Empleado:</strong>
                      <span class="fw-bold">{{ nombreEmpleado(tarea.empleadoId) }}</span>
                    </p>
                  </div>

                  <div class="d-flex gap-2">
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
import { reactive, ref, inject, computed } from 'vue'
import Swal from 'sweetalert2'

const empleados = inject('empleados')
const tareas = ref([]) // Array local de tareas para esta entrega

const form = reactive({
  titulo: '',
  descripcion: '',
  fecha: '',
  estado: '',
  prioridad: 'media',
  empleadoId: null
})

const errores = reactive({ titulo: '', fecha: '', estado: '' })
const tareaSeleccionadaId = ref(null)
const empleadoEncontrado = ref(null) 
const nombreEmpleadoEncontrado = ref('')

// Computed para el color del input de empleado (Amarillo si existe, Rojo si no)
const estiloInputEmpleado = computed(() => {
  if (empleadoEncontrado.value === true) return 'bg-warning bg-opacity-25 border-warning'
  if (empleadoEncontrado.value === false) return 'border-danger'
  return ''
})

// Helpers visuales
const estadoClase = (e) => ({
  'border-danger border-start border-4': e === 'pendiente',
  'border-warning border-start border-4': e === 'en_proceso',
  'border-success border-start border-4': e === 'finalizada'
})

const badgeEstado = (e) => ({
  'bg-danger': e === 'pendiente',
  'bg-warning text-dark': e === 'en_proceso',
  'bg-success': e === 'finalizada'
})

const estadoLabel = (e) => ({ pendiente: 'Pendiente', en_proceso: 'En proceso', finalizada: 'Finalizada' }[e] || e)

function nombreEmpleado(id) {
  if (!id || !empleados?.value) return 'Sin asignar'
  const emp = empleados.value.find(e => e.id === Number(id))
  return emp ? `${emp.nombre} ${emp.apellidos}` : 'ID no válido'
}

// Lógica de búsqueda
function buscarEmpleado() {
  if (!form.empleadoId) return
  const emp = empleados.value.find(e => e.id === Number(form.empleadoId))
  if (emp) {
    empleadoEncontrado.value = true
    nombreEmpleadoEncontrado.value = `${emp.nombre} ${emp.apellidos}`
  } else {
    empleadoEncontrado.value = false
    Swal.fire({ icon: 'error', title: 'Error', text: 'Empleado no encontrado' })
    form.empleadoId = null
  }
}

function resetBusquedaEmpleado() {
  empleadoEncontrado.value = null
  nombreEmpleadoEncontrado.value = ''
}

// CRUD
function validar() {
  errores.titulo = form.titulo ? '' : 'El título es obligatorio'
  errores.fecha = form.fecha ? '' : 'La fecha es obligatoria'
  errores.estado = form.estado ? '' : 'El estado es obligatorio'
  return !errores.titulo && !errores.fecha && !errores.estado
}

function addTarea() {
  if (!validar()) return
  if (tareaSeleccionadaId.value) {
    const idx = tareas.value.findIndex(t => t.id === tareaSeleccionadaId.value)
    if (idx !== -1) tareas.value[idx] = { ...form, id: tareaSeleccionadaId.value }
  } else {
    tareas.value.push({ ...form, id: Date.now() })
  }
  resetFormulario()
}

function selTarea(tarea) {
  tareaSeleccionadaId.value = tarea.id
  Object.assign(form, { ...tarea })
  if (tarea.empleadoId) buscarEmpleado()
}

function delTarea(id) {
  const idx = tareas.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    tareas.value.splice(idx, 1)
    if (tareaSeleccionadaId.value === id) resetFormulario()
  }
}

function resetFormulario() {
  tareaSeleccionadaId.value = null
  resetBusquedaEmpleado()
  Object.assign(form, { titulo: '', descripcion: '', fecha: '', estado: '', prioridad: 'media', empleadoId: null })
  Object.keys(errores).forEach(k => errores[k] = '')
}
</script>