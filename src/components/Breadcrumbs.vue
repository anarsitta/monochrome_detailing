<script setup>
defineProps({ title: { type: String, required: true } })
</script>

<template>
  <nav class="crumbs" aria-label="Хлебные крошки">
    <ol>
      <li><RouterLink to="/">Главная</RouterLink></li>
      <li><span aria-current="page">{{ title }}</span></li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs { margin-bottom: 28px; font-size: 14px; opacity: .7; }
.crumbs ol { display: flex; flex-wrap: wrap; gap: 8px; }
.crumbs li + li::before { content: '/'; margin-right: 8px; opacity: .6; }
.crumbs a { text-decoration: underline; text-underline-offset: 3px; text-decoration-color: currentColor; }
.crumbs a:hover { color: var(--accent); }
</style>
