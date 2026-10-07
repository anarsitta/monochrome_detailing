<script setup>
import { ref } from 'vue'
import { useReveal } from '../../composables/useReveal'

const root = ref(null)
useReveal(root)

const facts = [
  ['Светлый бокс', 'Ровный свет, в котором видно каждый скол и перекрашенную деталь.'],
  ['Запись на время', 'Без общей очереди: приезжаете к назначенному часу.'],
  ['Одна смета', 'Цена и состав работ не меняются без вашего согласия.'],
]
</script>

<template>
  <section id="about" ref="root" class="section about" aria-labelledby="about-title">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="kicker">О нас</p>
          <h2 id="about-title" class="h2" data-anim="fade">Работаем с автомобилем как с личной вещью</h2>
        </div>
        <p class="lead" data-anim="fade">MONOCHROME — небольшое ателье в Ярославле. Мы защищаем кузов плёнкой и обрабатываем днище от коррозии, и делаем только эти две вещи.</p>
      </div>

      <div class="grid">
        <figure class="photo photo-main" data-anim="fade">
          <img src="/img/case-a6-result.jpg" width="650" height="456" alt="Серый Audi A6 Avant в светлом зале ателье MONOCHROME" loading="lazy" decoding="async">
        </figure>

        <div class="copy" data-anim="fade">
          <p>Принимаем автомобиль в чистом светлом боксе, смотрим покрытие при ярком свете и показываем, что действительно стоит защитить, а что можно оставить как есть.</p>
          <p>Материалы и состав работ согласовываем заранее, без доплат по ходу дела. При выдаче вы получаете фотоотчёт и памятку по уходу.</p>
          <dl class="facts">
            <div v-for="[k, v] in facts" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></div>
          </dl>
        </div>
      </div>

      <div class="row" data-anim="stagger">
        <figure class="photo tile">
          <img src="/img/case-a6-prep.jpg" width="246" height="173" alt="Мастер очищает капот перед оклейкой" loading="lazy" decoding="async">
          <figcaption>Подготовка кузова перед оклейкой</figcaption>
        </figure>
        <figure class="photo tile">
          <img src="/img/case-a6-headlight.jpg" width="264" height="200" alt="Фара и крыло после оклейки крупным планом" loading="lazy" decoding="async">
          <figcaption>Контроль кромок при разном свете</figcaption>
        </figure>
        <div class="tile note dark">
          <p class="note-title">Фотоотчёт каждого этапа</p>
          <p class="note-text">Снимаем автомобиль при приёмке, во время работ и при выдаче, и отправляем фото вам в мессенджер.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 7fr 5fr; gap: clamp(32px, 5vw, 72px); align-items: center; }
.photo { position: relative; margin: 0; overflow: hidden; border-radius: var(--radius-lg); background: var(--milk-2); }
.photo img { width: 100%; height: 100%; object-fit: cover; }
.photo-main { aspect-ratio: 650 / 456; }
.copy > p { color: #454240; max-width: 52ch; }
.copy > p + p { margin-top: 18px; }
.facts { margin-top: 32px; border-top: 1px solid var(--line); }
.facts div { padding: 16px 0; border-bottom: 1px solid var(--line); }
.facts dt { font-family: var(--display); font-weight: 500; font-size: 19px; }
.facts dd { margin-top: 2px; color: var(--grey); font-size: 15px; }

.row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
.tile { aspect-ratio: 4 / 3; }
.tile figcaption { position: absolute; left: 12px; bottom: 12px; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 500; background: rgba(243,240,234,.94); }
.note { border-radius: var(--radius-lg); padding: clamp(24px, 2.6vw, 36px); display: flex; flex-direction: column; justify-content: flex-end; }
.note-title { font-family: var(--display); font-weight: 500; font-size: clamp(22px, 2vw, 28px); line-height: 1.15; }
.note-text { margin-top: 10px; color: var(--text-dark); font-size: 15px; }

@media (max-width: 1023px) {
  .grid { grid-template-columns: 1fr; }
  .row { grid-template-columns: 1fr 1fr; }
  .note { grid-column: 1 / -1; aspect-ratio: auto; }
}
@media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
</style>
