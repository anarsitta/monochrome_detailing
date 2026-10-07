<script setup>
import { ref, onMounted } from 'vue'
import Socials from './Socials.vue'
import data from '../data'
import { PAGES } from '../composables/seo'
import { useTrackContact } from '../composables/useTrackContact'

const c = data.contacts
const year = ref(new Date().getFullYear())
const trackContact = useTrackContact()
onMounted(() => { year.value = new Date().getFullYear() })
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <p class="footer-claim">{{ data.site.descriptor }}. {{ data.site.city }}.</p>
          <Socials />
        </div>
        <nav class="footer-col" aria-label="Разделы">
          <p class="footer-title">Сайт</p>
          <RouterLink :to="{ path: '/', hash: '#about' }">О нас</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#map' }">Как нас найти</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#contacts' }">Контакты</RouterLink>
        </nav>
        <nav class="footer-col" aria-label="Услуги">
          <p class="footer-title">Услуги</p>
          <RouterLink :to="PAGES.film.path">Оклейка автомобиля плёнкой</RouterLink>
          <RouterLink :to="PAGES.antikor.path">Антикоррозийная обработка</RouterLink>
        </nav>
        <div class="footer-col">
          <p class="footer-title">Контакты</p>
          <a :href="c.phoneHref" @click="trackContact('phone')">{{ c.phone }}</a>
          <a :href="'mailto:' + c.email" @click="trackContact('email')">{{ c.email }}</a>
          <span>{{ c.address }}</span>
          <span>{{ c.hours }}</span>
        </div>
      </div>
      <div class="footer-word" aria-hidden="true" />
      <div class="footer-bottom">
        <p>© {{ year }} MONOCHROME. {{ c.legal }}</p>
        <p>
          <RouterLink to="/privacy/">Политика конфиденциальности</RouterLink>
          <RouterLink :to="{ path: '/privacy/', hash: '#consent' }">Согласие на обработку данных</RouterLink>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer { background: var(--ink); color: var(--text-dark); padding: 88px 0 32px; font-size: 16px; }
.footer-top { display: grid; grid-template-columns: 4fr 2fr 3fr 3fr; gap: 40px; }
.footer-claim { font-family: var(--display); font-weight: 500; font-size: 26px; line-height: 1.25; color: var(--milk); max-width: 18ch; margin-bottom: 28px; }
.footer-brand :deep(.socials) { color: var(--milk); }
.footer-col { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.footer-col a, .footer-col span { padding: 6px 0; transition: color .3s; }
.footer-col a:hover, .footer-bottom a:hover { color: var(--milk); }
.footer-title { color: var(--milk); font-weight: 500; margin-bottom: 10px; }
.footer-word {
  margin: 72px 0 28px; width: 100%; aspect-ratio: 1216 / 115;
  -webkit-mask: url('/img/logo.png') center / contain no-repeat; mask: url('/img/logo.png') center / contain no-repeat;
  background: linear-gradient(180deg, rgba(243,240,234,.22), rgba(243,240,234,.06));
}
.footer-bottom { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px 32px; padding-top: 24px; border-top: 1px solid var(--line-dark); font-size: 14px; color: rgba(243,240,234,.5); }
.footer-bottom p { display: flex; flex-wrap: wrap; gap: 8px 24px; }
.footer-bottom a { text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 1023px) { .footer-top { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .footer-top { grid-template-columns: 1fr; } }
</style>
