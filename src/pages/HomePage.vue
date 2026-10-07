<script setup>
import HomeHero from '../components/home/HomeHero.vue'
import AboutSection from '../components/home/AboutSection.vue'
import DirectionPanels from '../components/home/DirectionPanels.vue'
import PrinciplesPinned from '../components/home/PrinciplesPinned.vue'
import MapSection from '../components/home/MapSection.vue'
import HomeContact from '../components/home/HomeContact.vue'
import { useSeo, localBusiness } from '../composables/seo'

useSeo({
  title: 'MONOCHROME, автоателье внешнего вида и защиты в Ярославле',
  description: 'MONOCHROME в Ярославле: оклейка автомобиля плёнкой и антикоррозийная обработка. Подход, работы автоателье, контакты и запись.',
  path: '/',
  jsonld: [localBusiness()],
})
</script>

<template>
  <div>
    <HomeHero />
    <AboutSection />
    <DirectionPanels />
    <PrinciplesPinned />
    <MapSection />
    <HomeContact />
  </div>
</template>
