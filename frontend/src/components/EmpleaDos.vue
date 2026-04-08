<template>
  <section class="container py-4">
    <div class="row g-4">
      <!-- Formulario -->
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
                <input
                  id="nombre"
                  v-model.trim="form.nombre"
                  type="text"
                  class="form-control"
                  placeholder="Introduce el nombre"
                />
                <small v-if="errores.nombre" class="text-danger">
                  {{ errores.nombre }}
                </small>
              </div>

              <div>
                <label for="apellidos" class="form-label">Apellidos</label>
                <input
                  id="apellidos"
                  v-model.trim="form.apellidos"
                  type="text"
                  class="form-control"
                  placeholder="Introduce los apellidos"
                />
              </div>

              <div>
                <label for="email" class="form-label">Email *</label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  class="form-control"
                  placeholder="correo@empresa.com"
                />
                <small v-if="errores.email" class="text-danger">
                  {{ errores.email }}
                </small>
              </div>

              <div>
                <label for="movil" class="form-label">Móvil</label>
                <input
                  id="movil"
                  v-model.trim="form.movil"
                  type="text"
                  class="form-control"
                  placeholder="600123123"
                />
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
                <button type="submit" class="btn btn-primary">
                  {{ empleadoSeleccionadoId ? 'Guardar cambios' : 'Añadir empleado' }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="resetFormulario"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Listado -->
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm h-100">
          <div
            class="card-header bg-dark text-white d-flex justify-content-between align-items-center"
          >
            <h2 class="h5 mb-0">Listado de empleados</h2>
            <!-- Añadido check de seguridad para empleados.length -->
            <span class="badge bg-light text-dark" v-if="empleados">{{ empleados.length }}</span>
          </div>

          <div class="card-body">
            <!-- Check de seguridad para evitar errores si inject falla -->
            <div v-if="!empleados" class="alert alert-danger">
              Error: No se pudo cargar la lista de empleados.
            </div>

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
                  <p class="mb-0 text-capitalize">
                    <strong>Puesto:</strong> {{ empleado.puesto || 'Sin asignar' }}
                  </p>
                </div>

                <div class="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    @click="selEmpleado(empleado)"
                  >
                    Cargar
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="delEmpleado(empleado.id)"
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
  </section>
</template>

<script setup>
import { reactive, ref, inject } from 'vue'

// Inyectamos el array. Es vital que en App.vue esté como provide('empleados', ref([]))
const empleados = inject('empleados')

const form = reactive({
  id: null,
  apellidos: '',
  nombre: '',
  email: '',
  movil: '',
  puesto: ''
})

const errores = reactive({ nombre: '', email: '' })
const empleadoSeleccionadoId = ref(null)

function validarFormulario() {
  errores.nombre = ''
  errores.email = ''
  let valido = true
  if (!form.nombre) { errores.nombre = 'El nombre es obligatorio.'; valido = false }
  if (!form.email)  { errores.email  = 'El email es obligatorio.';  valido = false }
  return valido
}

function addEmpleado() {
  if (!validarFormulario()) return

  if (empleadoSeleccionadoId.value) {
    // EDITAR: Buscamos el índice y actualizamos los campos uno a uno
    const index = empleados.value.findIndex(e => e.id === empleadoSeleccionadoId.value)
    if (index !== -1) {
      empleados.value[index] = { 
        ...empleados.value[index], // Mantener campos que no están en el form si los hubiera
        ...form, 
        id: empleadoSeleccionadoId.value 
      }
    }
  } else {
    // AÑADIR: Nuevo objeto al array
    empleados.value.push({
      ...form,
      id: Date.now() // Generamos ID numérico
    })
  }
  resetFormulario()
}

function selEmpleado(empleado) {
  empleadoSeleccionadoId.value = empleado.id
  // Usamos una copia para no modificar el objeto del listado en tiempo real mientras escribimos
  Object.assign(form, { ...empleado })
}

function delEmpleado(id) {
  // CORRECCIÓN CRÍTICA: No reasignar empleados.value directamente si da error de constante.
  // Usamos findIndex + splice para modificar el array original inyectado.
  const index = empleados.value.findIndex(e => e.id === id)
  if (index !== -1) {
    empleados.value.splice(index, 1)
    if (empleadoSeleccionadoId.value === id) resetFormulario()
  }
}

function resetFormulario() {
  empleadoSeleccionadoId.value = null
  Object.assign(form, { 
    id: null, 
    apellidos: '', 
    nombre: '', 
    email: '', 
    movil: '', 
    puesto: '' 
  })
  errores.nombre = ''
  errores.email  = ''
}
</script>

<style scoped>
.card { border: none; border-radius: 1rem; }
.card-header { border-top-left-radius: 1rem; border-top-right-radius: 1rem; }
</style>