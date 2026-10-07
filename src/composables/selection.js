import { reactive } from 'vue'

// Выбор в калькуляторах услуг. Форма одна — на главной: при переходе к ней
// направление и краткое описание выбора подставляются в заявку.
export const selection = reactive({
  filmPackage: 'front',
  filmZones: '',
  filmZoneIds: [],
  antikorCondition: 'prevent',
  carType: 'sedan',
  homeDir: '',
  homeNote: '',
})
