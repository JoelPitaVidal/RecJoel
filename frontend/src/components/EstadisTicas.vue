<template>
  <section class="container py-4">

    <!-- Cabecera -->
    <div class="mb-4">
      <h1 class="h3 fw-bold">📊 Estadísticas y Listados</h1>
      <p class="text-muted">Genera y descarga listados en PDF de empleados y tareas.</p>
    </div>

    <!-- Tarjetas de listados -->
    <div class="row g-4">

      <!-- Empleados -->
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card shadow-sm h-100 border-0">
          <div class="card-header bg-primary text-white rounded-top">
            <h2 class="h6 mb-0">👥 Empleados</h2>
          </div>
          <div class="card-body d-flex flex-column gap-2">
            <p class="small text-muted mb-1">
              Listado completo con ID, nombre, apellidos y móvil.
            </p>
            <div class="mt-auto">
              <span class="badge bg-secondary mb-2">{{ totalEmpleados }} empleados</span>
              <button
                class="btn btn-primary w-100"
                @click="descargar(generarPdfEmpleados)"
                :disabled="cargando"
              >
                📄 Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tareas totales -->
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card shadow-sm h-100 border-0">
          <div class="card-header bg-dark text-white rounded-top">
            <h2 class="h6 mb-0">📋 Todas las Tareas</h2>
          </div>
          <div class="card-body d-flex flex-column gap-2">
            <p class="small text-muted mb-1">
              Listado completo: ID, título, prioridad, estado y empleado.
            </p>
            <div class="mt-auto">
              <span class="badge bg-secondary mb-2">{{ totalTareas }} tareas</span>
              <button
                class="btn btn-dark w-100"
                @click="descargar(generarPdfTareas)"
                :disabled="cargando"
              >
                📄 Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tareas por prioridad -->
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card shadow-sm h-100 border-0">
          <div class="card-header bg-warning text-dark rounded-top">
            <h2 class="h6 mb-0">⚡ Tareas por Prioridad</h2>
          </div>
          <div class="card-body d-flex flex-column gap-2">
            <p class="small text-muted mb-1">
              Filtra y descarga las tareas según su nivel de prioridad.
            </p>
            <div class="mt-auto d-flex flex-column gap-2">
              <button
                class="btn btn-success btn-sm"
                @click="descargar(() => generarPdfTareasPorPrioridad('baja'))"
                :disabled="cargando"
              >
                🟢 Prioridad Baja
              </button>
              <button
                class="btn btn-warning btn-sm"
                @click="descargar(() => generarPdfTareasPorPrioridad('media'))"
                :disabled="cargando"
              >
                🟡 Prioridad Media
              </button>
              <button
                class="btn btn-danger btn-sm"
                @click="descargar(() => generarPdfTareasPorPrioridad('alta'))"
                :disabled="cargando"
              >
                🔴 Prioridad Alta
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tareas por empleado -->
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card shadow-sm h-100 border-0">
          <div class="card-header bg-info text-dark rounded-top">
            <h2 class="h6 mb-0">👤 Tareas de un Empleado</h2>
          </div>
          <div class="card-body d-flex flex-column gap-2">
            <p class="small text-muted mb-1">
              Selecciona un empleado y descarga sus tareas asignadas.
            </p>
            <div class="mt-auto d-flex flex-column gap-2">
              <select v-model="empleadoSeleccionado" class="form-select form-select-sm">
                <option :value="null">Selecciona un empleado</option>
                <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                  {{ emp.nombre }} {{ emp.apellidos }}
                </option>
              </select>
              <button
                class="btn btn-info btn-sm text-dark"
                @click="descargar(() => generarPdfTareasEmpleado(empleadoSeleccionado))"
                :disabled="cargando || !empleadoSeleccionado"
              >
                📄 Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Resumen numérico -->
    <div class="row g-3 mt-2">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h2 class="h6 mb-0">📈 Resumen</h2>
          </div>
          <div class="card-body">
            <div class="row text-center g-3">
              <div class="col-6 col-md-3">
                <div class="p-3 rounded bg-primary bg-opacity-10">
                  <div class="fs-3 fw-bold text-primary">{{ totalEmpleados }}</div>
                  <div class="small text-muted">Empleados</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-3 rounded bg-danger bg-opacity-10">
                  <div class="fs-3 fw-bold text-danger">{{ tareasPorEstado('pendiente') }}</div>
                  <div class="small text-muted">Pendientes</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-3 rounded bg-warning bg-opacity-10">
                  <div class="fs-3 fw-bold text-warning">{{ tareasPorEstado('en_proceso') }}</div>
                  <div class="small text-muted">En proceso</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-3 rounded bg-success bg-opacity-10">
                  <div class="fs-3 fw-bold text-success">{{ tareasPorEstado('finalizada') }}</div>
                  <div class="small text-muted">Finalizadas</div>
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
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import {
  generarPdfEmpleados,
  generarPdfTareas,
  generarPdfTareasPorPrioridad,
  generarPdfTareasEmpleado
} from '../pdfService.js'

// ── Estado ───────────────────────────────────────────────────────────
const empleados          = ref([])
const tareas             = ref([])
const empleadoSeleccionado = ref(null)
const cargando           = ref(false)

// ── Carga inicial ────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [resEmp, resTar] = await Promise.all([
      fetch('http://localhost:3000/empleados'),
      fetch('http://localhost:3000/tareas')
    ])
    empleados.value = await resEmp.json()
    tareas.value    = await resTar.json()
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.' })
  }
})

// ── Computed ─────────────────────────────────────────────────────────
const totalEmpleados = computed(() => empleados.value.length)
const totalTareas    = computed(() => tareas.value.length)
const tareasPorEstado = (estado) => tareas.value.filter(t => t.estado === estado).length

// ── Wrapper con indicador de carga ───────────────────────────────────
async function descargar(fn) {
  cargando.value = true
  Swal.fire({ title: 'Generando PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
  try {
    await fn()
    Swal.fire({ icon: 'success', title: '¡PDF generado!', timer: 1500, showConfirmButton: false })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el PDF.' })
    console.error(err)
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.card { border-radius: 1rem; }
.card-header {
  border-top-left-radius: 1rem !important;
  border-top-right-radius: 1rem !important;
}
</style>