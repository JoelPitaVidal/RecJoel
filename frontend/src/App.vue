<template>
  <div class="d-flex flex-column min-vh-100 w-75 w-lg-80 mx-auto">
    <Navbar />
    <main class="flex-grow-1">
      <router-view />
    </main>
    <FooTer />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Navbar from './components/NavBar.vue'
import FooTer from './components/FooTer.vue'

// Array de empleados compartido entre EmpleaDos.vue y TareaS.vue
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

// Hacemos el array accesible para cualquier componente hijo
provide('empleados', empleados)
</script>

<style scoped>
@media (max-width: 768px) {
  body {
    background: lightgray;
  }
}
</style>