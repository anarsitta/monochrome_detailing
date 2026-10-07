<script setup>
import { onMounted } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { loadMetrika, rememberSource } from './composables/analytics'
import { ScrollTrigger } from './gsap'

onMounted(() => {
  rememberSource()
  loadMetrika()
})

// После смены страницы пересчитываем ScrollTrigger под новую раскладку
const onEnter = () => requestAnimationFrame(() => ScrollTrigger.refresh())
</script>

<template>
  <a class="skip" href="#main">Перейти к содержанию</a>
  <SiteHeader />
  <main id="main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in" @after-enter="onEnter">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
</template>
