<template>
  <footer class="navbar navbar-dark bg-primary position-sticky top-1">
    <div class="container">
      
      <ul class="list-inline mb-0 d-flex justify-content-end">
        <router-link to="/avisolegal" target="_blank" class="ms-2 nav-link text-light d-inline me-2">Aviso Legal</router-link>
        <router-link to="/politicaprivacidad" target="_blank" class="ms-2 nav-link text-light d-inline me-2">Política de Cookies</router-link>       
        <li class="list-inline-item"><a href="#" class="ms-2 text-light text-decoration-none">Contacto</a></li>
      </ul>
      <p class="mb-1 text-light">&copy; {{ new Date().getFullYear() }} EmpresaTeis. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script setup></script>
<style scoped></style>
