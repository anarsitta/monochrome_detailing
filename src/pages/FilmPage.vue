<script setup>
import { ref } from 'vue'
import FilmHero from '../components/film/FilmHero.vue'
import FilmCalc from '../components/FilmCalc.vue'
import ExpandColumns from '../components/ExpandColumns.vue'
import LayerStack from '../components/LayerStack.vue'
import ProcessRing from '../components/ProcessRing.vue'
import CareTimeline from '../components/CareTimeline.vue'
import FaqList from '../components/FaqList.vue'
import CrossLink from '../components/CrossLink.vue'
import ContactsSection from '../components/ContactsSection.vue'
import data from '../data'
import { filmProtects, filmNotReplaces, filmLayers, filmSpec, filmSteps, filmCare } from '../content'
import { useSeo, serviceSchema, breadcrumbSchema, faqSchema, PAGES } from '../composables/seo'
import { useReveal } from '../composables/useReveal'

const root = ref(null)
useReveal(root)

const packages = data.filmPackages

useSeo({
  title: 'Оклейка автомобиля защитной плёнкой в Ярославле | MONOCHROME',
  description: 'Защитная оклейка автомобиля полиуретановой плёнкой в Ярославле. Варианты защиты кузова, примеры работ и расчёт стоимости в MONOCHROME.',
  path: PAGES.film.path,
  image: 'og-film.jpg',
  jsonld: [
    serviceSchema('film', 'Оклейка автомобиля защитной плёнкой', 'Защитная оклейка кузова полиуретановой плёнкой',
      packages.map((p) => ({ '@type': 'Offer', name: p.name, price: p.price, priceCurrency: 'RUB' }))),
    breadcrumbSchema('film'),
    faqSchema(data.filmFaq),
  ],
})

const form = {
  service: 'film',
  options: [...packages.map((p) => ({ id: p.id, name: p.name })), { id: 'unknown', name: 'Нужна консультация' }],
  optionLabel: 'Вариант защиты',
  title: 'Получить расчёт',
  lead: 'Пришлите модель и пару фото. Скажем ориентир по цене и предложим время осмотра.',
  submit: 'Получить расчёт',
}

const columns = [
  { title: 'Защищает', tone: 'yes', items: filmProtects },
  { title: 'Не заменяет', tone: 'no', items: filmNotReplaces },
]
// Цвета слоёв сверху вниз: верхний слой, TPU, клей, лак, краска, металл
const palette = [
  'linear-gradient(135deg, rgba(255,255,255,.85), rgba(214,232,244,.55))',
  'linear-gradient(135deg, rgba(186,214,232,.7), rgba(140,176,200,.5))',
  'linear-gradient(135deg, rgba(244,206,156,.75), rgba(214,164,104,.6))',
  'linear-gradient(135deg, #8a8580, #5d5955)',
  'linear-gradient(135deg, #4a4644, #2b2827)',
  'linear-gradient(135deg, #b5b5b5, #7a7a7a)',
]
</script>

<template>
  <div ref="root">
    <FilmHero />

    <section id="zones" class="section dark" aria-labelledby="zones-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="kicker">Когда нужна защита и сколько стоит</p>
            <h2 id="zones-title" class="h2" data-anim="fade">Подберите защиту под свою ситуацию</h2>
          </div>
          <p class="lead" data-anim="fade">Выберите ситуацию или вариант защиты, а при желании отметьте детали прямо на схеме. Цена пересчитается сразу.</p>
        </div>
        <FilmCalc />
      </div>
    </section>

    <section class="section" aria-labelledby="protects-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="kicker">Честно о возможностях</p>
            <h2 id="protects-title" class="h2" data-anim="lines">Что защищает плёнка, а что нет</h2>
          </div>
          <p class="lead" data-anim="fade">Нажмите на пункт, чтобы узнать подробнее. Лучше понимать ограничения до оклейки, чем после.</p>
        </div>
        <ExpandColumns :columns="columns" prefix="film-pr" />
      </div>
    </section>

    <section class="section white" aria-labelledby="material-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="kicker">Материал</p>
            <h2 id="material-title" class="h2" data-anim="lines">Как устроена плёнка</h2>
          </div>
          <p class="lead" data-anim="fade">Три слоя защиты поверх заводского покрытия. Наведите на слой, чтобы узнать, за что он отвечает.</p>
        </div>
        <LayerStack :layers="filmLayers" :palette="palette" :groups="{ film: 'Плёнка, около 190 мкм', car: 'Кузов автомобиля' }" />
        <dl class="spec" data-anim="stagger">
          <div v-for="[k, v] in filmSpec" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></div>
        </dl>
      </div>
    </section>

    <section id="process" class="section dark" aria-label="Этапы работы">
      <div class="container">
        <ProcessRing :steps="filmSteps" title="Семь шагов от осмотра до выдачи" lead="Каждый этап фотографируем: в конце вы получаете полный фотоотчёт." />
      </div>
    </section>

    <section class="section" aria-labelledby="care-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="kicker">Уход и гарантия</p>
            <h2 id="care-title" class="h2" data-anim="lines">Что происходит после оклейки</h2>
          </div>
          <p class="lead" data-anim="fade">Первые дни важнее всего: клей набирает прочность. Дальше уход почти не отличается от обычного.</p>
        </div>
        <CareTimeline :care="filmCare" />
      </div>
    </section>

    <FaqList :items="data.filmFaq" prefix="film" title="Частые вопросы об оклейке" />

    <CrossLink
      :to="PAGES.antikor.path"
      image="antikor-underbody.webp"
      eyebrow="Защита снизу"
      title="Плёнка защищает кузов сверху, а днище и арки — антикоррозийная обработка"
      link="Об антикоре"
    />
    <ContactsSection service="film" title="Получить расчёт и записаться на осмотр" />
  </div>
</template>

<style scoped>
.spec { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: clamp(40px, 5vw, 64px); }
.spec div { padding: 22px; border-radius: 16px; background: var(--milk); }
.spec dt { font-size: 14px; color: var(--grey); }
.spec dd { margin-top: 6px; font-weight: 500; }
@media (max-width: 1023px) { .spec { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .spec { grid-template-columns: 1fr; } }
</style>
