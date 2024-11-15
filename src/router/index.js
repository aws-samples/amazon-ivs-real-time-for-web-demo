import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import List from '../views/List.vue';
import Demo from '../views/Demo.vue';
import Settings from '../views/Settings.vue';
import CodeEntry from '../views/CodeEntry.vue';
import CustomList from '../views/Custom/List.vue';
import CustomWatch from '../views/Custom/Watch.vue';
import CustomDemo from '../views/Custom/Demo.vue';
import AccountSettings from '../views/Settings/AccountConnection.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/demos',
    name: 'List',
    component: List,
  },
  {
    path: '/demos/:demoId',
    name: 'Demo',
    component: Demo,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  },
  {
    path: '/settings/connect',
    name: 'AccountSettings',
    component: AccountSettings,
  },
  {
    path: '/login',
    name: 'Login',
    component: CodeEntry,
  },
  {
    path: '/custom',
    name: 'Custom List',
    component: CustomList,
  },
  {
    path: '/custom/watch/:hostId?',
    name: 'Custom Watch',
    component: CustomWatch,
  },
  {
    path: '/custom/:hostId',
    name: 'Custom Demo',
    component: CustomDemo,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
