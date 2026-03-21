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
            <span class="badge bg-light text-dark">{{ getEmpleado().length }}</span>
          </div>

          <div class="card-body">
            <div v-if="getEmpleado().length === 0" class="alert alert-info mb-0">
              No hay empleados todavía.
            </div>

            <div v-else class="d-flex flex-column gap-3">
              <div
                v-for="empleado in getEmpleado()"
                :key="empleado.id"
                class="border rounded p-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
              >
                <div>
                  <h3 class="h6 mb-1">
                    {{ empleado.nombre }} {{ empleado.apellidos }}
                  </h3>
                  <p class="mb-1">
                    <strong>Email:</strong> {{ empleado.email }}
                  </p>
                  <p class="mb-1">
                    <strong>Móvil:</strong> {{ empleado.movil || 'Sin móvil' }}
                  </p>
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
import { reactive, ref } from 'vue'

const empleados = ref([
  {
    id: 1,
    apellidos: 'Pérez Gómez',
    nombre: 'Ana',
    email: 'ana@empresa.com',
    movil: '600111222',
    puesto: 'rrhh'
  },
  {
    id: 2,
    apellidos: 'López Ruiz',
    nombre: 'Carlos',
    email: 'carlos@empresa.com',
    movil: '600333444',
    puesto: 'ventas'
  }
])

const form = reactive({
  id: null,
  apellidos: '',
  nombre: '',
  email: '',
  movil: '',
  puesto: ''
})

const errores = reactive({
  nombre: '',
  email: ''
})

const empleadoSeleccionadoId = ref(null)

function getEmpleado() {
  return empleados.value
}

function validarFormulario() {
  errores.nombre = ''
  errores.email = ''

  let valido = true

  if (!form.nombre) {
    errores.nombre = 'El nombre es obligatorio.'
    valido = false
  }

  if (!form.email) {
    errores.email = 'El email es obligatorio.'
    valido = false
  }

  return valido
}

function addEmpleado() {
  if (!validarFormulario()) return

  if (empleadoSeleccionadoId.value) {
    const index = empleados.value.findIndex(
      (empleado) => empleado.id === empleadoSeleccionadoId.value
    )

    if (index !== -1) {
      empleados.value[index] = {
        id: empleadoSeleccionadoId.value,
        apellidos: form.apellidos,
        nombre: form.nombre,
        email: form.email,
        movil: form.movil,
        puesto: form.puesto
      }
    }
  } else {
    empleados.value.push({
      id: Date.now(),
      apellidos: form.apellidos,
      nombre: form.nombre,
      email: form.email,
      movil: form.movil,
      puesto: form.puesto
    })
  }

  resetFormulario()
}

function selEmpleado(empleado) {
  empleadoSeleccionadoId.value = empleado.id
  form.id = empleado.id
  form.apellidos = empleado.apellidos
  form.nombre = empleado.nombre
  form.email = empleado.email
  form.movil = empleado.movil
  form.puesto = empleado.puesto
}

function delEmpleado(id) {
  empleados.value = empleados.value.filter((empleado) => empleado.id !== id)

  if (empleadoSeleccionadoId.value === id) {
    resetFormulario()
  }
}

function resetFormulario() {
  empleadoSeleccionadoId.value = null
  form.id = null
  form.apellidos = ''
  form.nombre = ''
  form.email = ''
  form.movil = ''
  form.puesto = ''

  errores.nombre = ''
  errores.email = ''
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