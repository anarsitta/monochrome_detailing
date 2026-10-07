<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { useReveal } from '../composables/useReveal'

defineProps({
  to: { type: String, required: true },
  image: { type: String, required: true },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
})

const root = ref(null)
useReveal(root)
</script>

<template>
  <section ref="root" class="cross" aria-label="Другая услуга">
    <div class="container">
      <RouterLink class="card dark" :to="to" data-anim="fade">
        <span class="media" data-anim="wipe"><img :src="`/img/${image}`" alt="" loading="lazy" decoding="async"></span>
        <span class="body">
          <span class="eyebrow">{{ eyebrow }}</span>
          <span class="title">{{ title }}</span>
          <span class="go">{{ link }} <span class="circle"><AppIcon name="arrow" /></span></span>
        </span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.cross { padding: var(--section) 0 0; }
.card { display: grid; grid-template-columns: 7fr 5fr; border-radius: 24px; overflow: hidden; min-height: 380px; }
.media { position: relative; overflow: hidden; order: 2; }
.media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s var(--ease), filter .8s var(--ease); filter: grayscale(.4); }
.card:hover .media img { transform: scale(1.05); filter: grayscale(0); }
.body { display: flex; flex-direction: column; justify-content: center; padding: clamp(32px, 5vw, 72px); }
.eyebrow { font-size: 15px; font-weight: 500; color: #F0A28F; }
.title { display: block; margin: 14px 0 32px; font-family: var(--display); font-weight: 500; font-size: clamp(26px, 2.8vw, 40px); line-height: 1.12; letter-spacing: -.015em; max-width: 22ch; }
.go { display: inline-flex; align-items: center; gap: 16px; font-weight: 500; }
.circle { width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--accent); color: var(--on-accent); transition: transform .5s var(--ease); }
.card:hover .circle { transform: rotate(-45deg) scale(1.06); }
@media (max-width: 767px) { .card { grid-template-columns: 1fr; } .media { order: 0; aspect-ratio: 16 / 10; } }
</style>
