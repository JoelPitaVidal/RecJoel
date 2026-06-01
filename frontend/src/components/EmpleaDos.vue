<template>
  <section class="container py-4">
    <div class="row g-4">

      <!-- FORMULARIO -->
      <div class="col-12 col-lg-5">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-primary text-white">
            <h2 class="h5 mb-0">
              {{ empleadoSeleccionadoId ? 'Editar empleado' : 'Añadir empleado' }}
            </h2>
          </div>

          <div class="card-body">
            <form @submit.prevent="addEmpleado" class="d-flex flex-column gap-3">
              <div>
                <label for="nombre" class="form-label">Nombre *</label>
                <input id="nombre" v-model.trim="form.nombre" type="text" class="form-control" placeholder="Introduce el nombre" />
                <small v-if="errores.nombre" class="text-danger">{{ errores.nombre }}</small>
              </div>

              <div>
                <label for="apellidos" class="form-label">Apellidos</label>
                <input id="apellidos" v-model.trim="form.apellidos" type="text" class="form-control" placeholder="Introduce los apellidos" />
              </div>

              <div>
                <label for="email" class="form-label">Email *</label>
                <input id="email" v-model.trim="form.email" type="email" class="form-control" placeholder="correo@empresa.com" />
                <small v-if="errores.email" class="text-danger">{{ errores.email }}</small>
              </div>

              <div>
                <label for="movil" class="form-label">Móvil</label>
                <input id="movil" v-model.trim="form.movil" type="text" class="form-control" placeholder="600123123" />
              </div>

              <div>
                <label for="puesto" class="form-label">Puesto</label>
                <select id="puesto" v-model="form.puesto" class="form-select">
                  <option value="">Selecciona un puesto</option>
                  <option value="rrhh">RRHH</option>
                  <option value="contabilidad">Contabilidad</option>
                  <option value="almacen">Almacén</option>
                  <option value="ventas">Ventas</option>
                </select>
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button type="submit" class="btn btn-primary" :disabled="cargando">
                  {{ empleadoSeleccionadoId ? 'Guardar' : 'Añadir' }}
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
            <h2 class="h5 mb-0">Listado de empleados</h2>
            <span class="badge bg-light text-dark">{{ empleados.length }}</span>
          </div>

          <div class="card-body">
            <div v-if="errorCarga" class="alert alert-danger">{{ errorCarga }}</div>

            <div v-else-if="empleados.length === 0" class="alert alert-info mb-0">
              No hay empleados todavía.
            </div>

            <div v-else class="d-flex flex-column gap-3">
              <div
                v-for="empleado in empleados"
                :key="empleado.id"
                class="border rounded p-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
              >
                <div>
                  <h3 class="h6 mb-1">{{ empleado.nombre }} {{ empleado.apellidos }}</h3>
                  <p class="mb-1 text-muted small"><strong>ID:</strong> {{ empleado.id }}</p>
                  <p class="mb-1"><strong>Email:</strong> {{ empleado.email }}</p>
                  <p class="mb-1"><strong>Móvil:</strong> {{ empleado.movil || 'Sin móvil' }}</p>
                  <p class="mb-0"><strong>Puesto:</strong> {{ empleado.puesto || 'Sin asignar' }}</p>
                </div>

                <div class="d-flex gap-2 flex-wrap">
                  <button class="btn btn-sm btn-outline-primary" @click="selEmpleado(empleado)">Cargar</button>
                  <button class="btn btn-sm btn-outline-danger" @click="delEmpleado(empleado.id)">Eliminar</button>
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
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// ── Configuración ────────────────────────────────────────────────────
const API = 'http://localhost:3000/empleados'

// ── Estado ───────────────────────────────────────────────────────────
const empleados  = ref([])
const cargando   = ref(false)
const errorCarga = ref('')

const form = reactive({ apellidos: '', nombre: '', email: '', movil: '', puesto: '' })
const errores = reactive({ nombre: '', email: '' })
const empleadoSeleccionadoId = ref(null)

onMounted(getEmpleado)

// ── GET ───────────────────────────────────────────────────────────────
async function getEmpleado() {
  cargando.value   = true
  errorCarga.value = ''
  try {
    const res = await axios.get(API)
    empleados.value = res.data
  } catch (err) {
    errorCarga.value = 'No se pudo conectar con el servidor. ¿Está JSON Server en marcha en el puerto 3000?'
    console.error(err)
  } finally {
    cargando.value = false
  }
}

// ── Validación ────────────────────────────────────────────────────────
function validarFormulario() {
  errores.nombre = ''
  errores.email  = ''
  let valido = true
  if (!form.nombre) { errores.nombre = 'El nombre es obligatorio.'; valido = false }
  if (!form.email)  { errores.email  = 'El email es obligatorio.';  valido = false }
  return valido
}

// ── POST / PUT ────────────────────────────────────────────────────────
async function addEmpleado() {
  if (!validarFormulario()) return

  Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })

  try {
    if (empleadoSeleccionadoId.value) {
      // PUT → editar
      await axios.put(`${API}/${empleadoSeleccionadoId.value}`, {
        ...form,
        id: empleadoSeleccionadoId.value
      })
      Swal.fire({ title: '¡Actualizado!', icon: 'success', timer: 1800, showConfirmButton: false })
    } else {
      // POST → crear
      await axios.post(API, form)
      Swal.fire({ title: '¡Guardado!', icon: 'success', timer: 1800, showConfirmButton: false })
    }

    await getEmpleado()
    resetFormulario()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el empleado.' })
    console.error(err)
  }
}

// ── DELETE ────────────────────────────────────────────────────────────
async function delEmpleado(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Estás seguro?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
  })
  if (!isConfirmed) return

  Swal.fire({ title: 'Eliminando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })

  try {
    await axios.delete(`${API}/${id}`)
    if (empleadoSeleccionadoId.value === id) resetFormulario()
    await getEmpleado()
    Swal.fire({ title: 'Eliminado', icon: 'success', timer: 1500, showConfirmButton: false })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el empleado.' })
    console.error(err)
  }
}

// ── Cargar en formulario ──────────────────────────────────────────────
function selEmpleado(empleado) {
  empleadoSeleccionadoId.value = empleado.id
  Object.assign(form, {
    apellidos: empleado.apellidos,
    nombre:    empleado.nombre,
    email:     empleado.email,
    movil:     empleado.movil,
    puesto:    empleado.puesto
  })
}

// ── Reset ─────────────────────────────────────────────────────────────
function resetFormulario() {
  empleadoSeleccionadoId.value = null
  Object.assign(form, { apellidos: '', nombre: '', email: '', movil: '', puesto: '' })
  errores.nombre = ''
  errores.email  = ''
}
</script>

<style scoped>
.card { border: none; border-radius: 1rem; }
.card-header { border-top-left-radius: 1rem; border-top-right-radius: 1rem; }
</style>