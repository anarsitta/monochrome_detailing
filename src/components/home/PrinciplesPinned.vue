<script setup>
import { ref } from 'vue'
import { principles } from '../../content'
import { useReveal } from '../../composables/useReveal'

const root = ref(null)
useReveal(root)
</script>

<template>
  <section ref="root" class="section principles dark" aria-labelledby="principles-title">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="kicker">Принципы</p>
          <h2 id="principles-title" class="h2" data-anim="fade">Как мы работаем</h2>
        </div>
        <p class="lead" data-anim="fade">Три правила, которые не меняются от автомобиля к автомобилю.</p>
      </div>
      <ol class="list" data-anim="stagger">
        <li v-for="(p, i) in principles" :key="p.title">
          <span class="num">{{ i + 1 }}</span>
          <h3 class="title">{{ p.title }}</h3>
          <p class="text">{{ p.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.list { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(24px, 3vw, 48px); }
.list li { padding-top: 28px; border-top: 1px solid var(--line-dark); }
.num { display: block; font-family: var(--display); font-weight: 500; font-size: clamp(64px, 6vw, 96px); line-height: 1; color: var(--accent); margin-bottom: 28px; }
.title { font-family: var(--display); font-weight: 500; font-size: clamp(22px, 2vw, 28px); line-height: 1.2; }
.text { margin-top: 14px; color: var(--text-dark); font-size: 16px; max-width: 40ch; }
@media (max-width: 1023px) { .list { grid-template-columns: 1fr; } }
</style>
