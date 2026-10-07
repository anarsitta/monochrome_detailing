<script setup>
import { ref } from 'vue'
import AntikorHero from '../components/antikor/AntikorHero.vue'
import AntikorCalc from '../components/AntikorCalc.vue'
import ExpandColumns from '../components/ExpandColumns.vue'
import LayerStack from '../components/LayerStack.vue'
import ProcessRing from '../components/ProcessRing.vue'
import CareTimeline from '../components/CareTimeline.vue'
import FaqList from '../components/FaqList.vue'
import CrossLink from '../components/CrossLink.vue'
import ContactsSection from '../components/ContactsSection.vue'
import data from '../data'
import { antikorLayers, antikorSpec, antikorSteps, antikorIncluded, antikorExcluded, antikorCare } from '../content'
import { useSeo, serviceSchema, breadcrumbSchema, faqSchema, PAGES } from '../composables/seo'
import { useReveal } from '../composables/useReveal'

const root = ref(null)
useReveal(root)

useSeo({
  title: 'Антикоррозийная обработка автомобиля в Ярославле | MONOCHROME',
  description: 'Антикоррозийная обработка днища, арок и скрытых полостей автомобиля в Ярославле. Осмотр, состав работ и предварительный расчёт в MONOCHROME.',
  path: PAGES.antikor.path,
  image: 'antikor-underbody.jpg',
  jsonld: [
    serviceSchema('antikor', 'Антикоррозийная обработка автомобиля', 'Антикоррозийная обработка днища, арок и скрытых полостей'),
    breadcrumbSchema('antikor'),
    faqSchema(data.antikorFaq),
  ],
})

const columns = [
  { title: 'Входит в обработку', tone: 'yes', items: antikorIncluded },
  { title: 'Не входит', tone: 'no', items: antikorExcluded, note: 'Эти работы мы не выполняем. Если они нужны, подскажем, к кому обратиться.' },
]
// Цвета слоёв сверху вниз: антигравий, покрытие днища, преобразователь, грунт, металл
const palette = [
  'linear-gradient(135deg, #5b5754, #36322f)',
  'linear-gradient(135deg, #2c2928, #151413)',
  'linear-gradient(135deg, #c0624a, #8c3f2d)',
  'linear-gradient(135deg, #a49e96, #7d7770)',
  'linear-gradient(135deg, #b5b5b5, #7a7a7a)',
]
</script>

<template>
  <div ref="root">
    <AntikorHero />

    <section id="pricing" class="section dark" aria-labelledby="pricing-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="kicker">Когда нужен антикор и сколько стоит</p>
            <h2 id="pricing-title" class="h2" data-anim="fade">Подберите обработку днища под свой автомобиль</h2>
          </div>
          <p class="lead" data-anim="fade">Выберите состояние и тип автомобиля — схема покажет, какие зоны входят в обработку, а цена пересчитается сразу.</p>
        </div>
        <AntikorCalc />
      </div>
    </section>

    <section id="areas" class="section" aria-labelledby="scope-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="kicker">Честно о границах услуги</p>
            <h2 id="scope-title" class="h2" data-anim="fade">Что входит в обработку, а что нет</h2>
          </div>
          <p class="lead" data-anim="fade">Нажмите на пункт, чтобы узнать подробнее. Состав работ фиксируем до начала.</p>
        </div>
        <ExpandColumns :columns="columns" prefix="ak-scope" />
        <aside class="stop" data-anim="fade">
          <figure><img src="/img/antikor-process.jpg" width="1600" height="1067" alt="Мастер осматривает днище автомобиля на подъёмнике" loading="lazy" decoding="async"></figure>
          <div>
            <h3 class="h3">Если найдена сквозная коррозия</h3>
            <p>Обработку не продолжаем. Вы получаете фото проблемных мест и отдельную рекомендацию: что нужно отремонтировать до антикора и к кому обратиться. Закрывать гнилой металл составом мы не будем.</p>
          </div>
        </aside>
      </div>
    </section>

    <section class="section white" aria-labelledby="material-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="kicker">Материалы</p>
            <h2 id="material-title" class="h2" data-anim="fade">Из чего состоит защита днища</h2>
          </div>
          <p class="lead" data-anim="fade">Одного средства на весь автомобиль не бывает. Наведите на слой, чтобы узнать, за что он отвечает.</p>
        </div>
        <LayerStack :layers="antikorLayers" :palette="palette" :groups="{ film: 'Наносим мы', car: 'Основа' }" />
        <dl class="spec" data-anim="stagger">
          <div v-for="[k, v] in antikorSpec" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></div>
        </dl>
      </div>
    </section>

    <section id="process" class="section dark" aria-label="Этапы работы">
      <div class="container">
        <ProcessRing :steps="antikorSteps" title="Девять шагов, и каждый на фото" lead="Если на осмотре найдена сквозная коррозия, обработку не продолжаем: присылаем фото и рекомендацию по ремонту." />
      </div>
    </section>

    <section class="section" aria-labelledby="care-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="kicker">Гарантия и контроль</p>
            <h2 id="care-title" class="h2" data-anim="fade">Что происходит после обработки</h2>
          </div>
          <p class="lead" data-anim="fade">Покрытие изнашивается, особенно в арках. Поэтому важен не только результат, но и контрольный осмотр раз в год.</p>
        </div>
        <CareTimeline :care="antikorCare" />
      </div>
    </section>

    <FaqList :items="data.antikorFaq" prefix="antikor" title="Частые вопросы об антикоре" />

    <CrossLink
      :to="PAGES.film.path"
      image="hero-atelier.jpg"
      eyebrow="Защита сверху"
      title="Днище защищено. Кузов от сколов закроет прозрачная полиуретановая плёнка"
      link="Об оклейке плёнкой"
    />
    <ContactsSection service="antikor" />
  </div>
</template>

<style scoped>
.spec { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: clamp(40px, 5vw, 64px); }
.spec div { padding: 22px; border-radius: 16px; background: var(--milk); }
.spec dt { font-size: 14px; color: var(--grey); }
.spec dd { margin-top: 6px; font-weight: 500; }
.stop { display: grid; grid-template-columns: 5fr 7fr; gap: clamp(24px, 4vw, 56px); align-items: center; margin-top: 20px; padding: 16px; border-radius: 20px; background: var(--ink); color: var(--milk); }
.stop figure { border-radius: 14px; overflow: hidden; }
.stop img { width: 100%; aspect-ratio: 3 / 2; object-fit: cover; filter: grayscale(.6); }
.stop p { margin-top: 14px; color: var(--text-dark); max-width: 56ch; }
.stop > div { padding: 16px clamp(8px, 2vw, 32px) 16px 0; }
@media (max-width: 1023px) { .spec, .stop { grid-template-columns: 1fr; } }
</style>
