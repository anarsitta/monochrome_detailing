export const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, '\u00a0') + '\u00a0₽'
export const from = (n) => 'от ' + money(n)
