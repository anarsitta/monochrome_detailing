<script setup>
import { track } from '../../composables/analytics'
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="photo" aria-hidden="true">
      <img src="/img/case-a6-result.jpg" width="650" height="456" alt="" fetchpriority="high" decoding="async">
    </div>

    <div class="container main">
      <div class="copy">
        <p class="place">Автоателье в Ярославле</p>
        <h1 id="hero-title" class="title">MONOCHROME — автоателье защиты и&nbsp;внешнего вида</h1>
        <p class="text">Защитная плёнка для кузова и антикоррозийная обработка днища в Ярославле. Сначала осматриваем автомобиль, затем согласовываем точный объём работ.</p>
        <div class="actions">
          <a class="hbtn hbtn-fill" href="#services" @click="track('hero_services')">Выбрать направление</a>
          <a class="hbtn hbtn-line" href="#contacts" @click="track('hero_works')">Записаться на осмотр</a>
        </div>
      </div>
    </div>

    <div class="facts-bar">
      <ul class="container facts">
        <li>Осмотр до расчёта</li>
        <li>Согласованная смета</li>
        <li>Фотоотчёт при выдаче</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero { position: relative; min-height: min(100svh, 900px); display: flex; flex-direction: column; padding-top: var(--header-h); overflow: hidden; }
.photo { position: absolute; top: 0; right: 0; bottom: 0; left: 38%; }
.photo img { width: 100%; height: 100%; object-fit: cover; object-position: 70% 50%; }
.photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, var(--milk) 0%, rgba(243,240,234,.8) 8%, rgba(243,240,234,.3) 20%, rgba(243,240,234,0) 34%); }

.main { position: relative; z-index: 1; flex: 1; display: flex; align-items: center; padding-top: 32px; padding-bottom: 48px; }
.copy { max-width: 560px; }
.place { font-size: 13px; font-weight: 500; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); margin-bottom: 28px; }
.title { font-family: var(--display); font-weight: 500; font-size: clamp(34px, 3.4vw, 58px); line-height: 1.12; letter-spacing: -.015em; }
.text { margin-top: 24px; font-size: 18px; line-height: 1.6; color: #555; }
.actions { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 40px; }
.hbtn { display: inline-flex; align-items: center; justify-content: center; min-height: 62px; padding: 16px 26px; font-size: 16px; font-weight: 500; border: 1px solid var(--accent); transition: background-color .3s var(--ease), color .3s var(--ease); }
.hbtn-fill { background: var(--accent); color: var(--on-accent); }
.hbtn-fill:hover { background: var(--accent-dark); border-color: var(--accent-dark); }
.hbtn-line { color: var(--accent); }
.hbtn-line:hover { background: var(--accent); color: var(--on-accent); }

.facts-bar { position: relative; z-index: 1; background: rgba(243,240,234,.94); border-top: 1px solid var(--line); }
.facts { display: grid; grid-template-columns: repeat(3, 1fr); }
.facts li { padding: 26px 16px; text-align: center; font-size: 16px; color: #444; }
.facts li + li { border-left: 1px solid var(--line-strong); }

@media (max-width: 1023px) {
  .hero { min-height: 0; }
  .photo { position: relative; left: 0; height: 52svh; min-height: 320px; order: -1; }
  .photo::after { background: linear-gradient(0deg, var(--milk) 0%, rgba(243,240,234,0) 35%); }
  .main { padding-top: 0; }
}
@media (max-width: 767px) {
  .hbtn { width: 100%; }
  .facts { grid-template-columns: 1fr; }
  .facts li { padding: 14px 0; text-align: left; }
  .facts li + li { border-left: 0; border-top: 1px solid var(--line); }
}
</style>
