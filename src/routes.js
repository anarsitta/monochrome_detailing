export const routes = [
  { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
  { path: '/okleyka-plenkoy-yaroslavl/', name: 'film', component: () => import('./pages/FilmPage.vue') },
  { path: '/antikor-yaroslavl/', name: 'antikor', component: () => import('./pages/AntikorPage.vue') },
  { path: '/privacy/', name: 'privacy', component: () => import('./pages/PrivacyPage.vue') },
  { path: '/404/', name: '404', component: () => import('./pages/NotFound.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('./pages/NotFound.vue') },
]
