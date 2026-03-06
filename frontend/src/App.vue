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
import Navbar from "./components/NavBar.vue";
import FooTer from "./components/FooTer.vue"
</script>

<style scooped>
@media (max-width:780px) {
  boddy {
    background: ligthgray;
  }
}
</style>