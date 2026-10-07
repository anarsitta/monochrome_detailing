<script setup>
import { useSeo, PAGES } from '../composables/seo'

useSeo({ title: 'Страница не найдена | MONOCHROME', description: 'Такой страницы нет на сайте MONOCHROME.', path: '/404/', noindex: true })
</script>

<template>
  <section class="section simple">
    <div class="container prose">
      <p class="eyebrow">Ошибка 404</p>
      <h1 class="h1">Такой страницы нет</h1>
      <p>Возможно, ссылка устарела. Начните с главной или выберите услугу.</p>
      <div class="btn-row">
        <RouterLink class="btn btn-primary" to="/">На главную</RouterLink>
        <RouterLink class="btn btn-ghost" :to="PAGES.film.path">Оклейка плёнкой</RouterLink>
        <RouterLink class="btn btn-ghost" :to="PAGES.antikor.path">Антикор</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.simple { padding-top: calc(var(--header-h) + 64px); min-height: 70vh; }
.prose { max-width: 820px; }
.prose .h1 { margin-bottom: 20px; }
.prose p { color: #3A3A3A; margin-top: 12px; }
.eyebrow { font-weight: 500; color: var(--accent-dark); margin-bottom: 16px; }
</style>
