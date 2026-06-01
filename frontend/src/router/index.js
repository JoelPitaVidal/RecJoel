import { createRouter, createWebHistory } from 'vue-router';
import Inicio from '../components/Inicio.vue';
import EmpleaDos from '../components/EmpleaDos.vue';
import TareaS from '../components/TareaS.vue';
import EstadisTicas from '../components/EstadisTicas.vue';
import AbouT from '../components/AbouT.vue';
import FacturaS from '../components/FacturaS.vue';

const routes = [
  {
    path: "/",
    name: "Inicio",
    component: Inicio,
  },
  {
    path: "/empleados",
    name: "EmpleaDos",
    component: EmpleaDos,
  },
  {
    path: "/tareas",
    name: "TareaS",
    component: TareaS,
  },
  {
    path: "/facturas",
    name: "FacturaS",
    component: FacturaS,
  },
  {
    path: "/estadisticas",
    name: "EstadisTicas",
    component: EstadisTicas,
  },
  {
    path: "/about",
    name: "AbouT",
    component: AbouT,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;