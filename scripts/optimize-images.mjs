// Оптимизация фото: npm run images
// Берёт оригиналы из images-src/ и кладёт в public/img/ лёгкие WebP:
//   name.webp     — до 1600px по ширине (для десктопа)
//   name-800.webp — 800px (для телефонов, подставляется через srcset)
// Плюс JPEG 1200×630 для превью ссылок в мессенджерах и соцсетях.
import sharp from 'sharp'
import { readdir, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'images-src'
const OUT = 'public/img'
const OG = { 'og-home.jpg': 'case-a6-result.jpg', 'og-film.jpg': 'hero-atelier.jpg', 'og-antikor.jpg': 'antikor-underbody.jpg' }

await mkdir(OUT, { recursive: true })
const kb = async (f) => Math.round((await stat(f)).size / 1024)
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f))

for (const file of files) {
  const src = path.join(SRC, file)
  const base = file.replace(/\.\w+$/, '')
  const meta = await sharp(src).metadata()
  for (const [suffix, width] of [['', 1600], ['-800', 800]]) {
    const out = path.join(OUT, `${base}${suffix}.webp`)
    await sharp(src)
      .rotate()
      .resize({ width: Math.min(width, meta.width), withoutEnlargement: true })
      .webp({ quality: 78, effort: 6, smartSubsample: true })
      .toFile(out)
    console.log(`${file} → ${base}${suffix}.webp  ${await kb(src)} KB → ${await kb(out)} KB`)
  }
}

for (const [name, from] of Object.entries(OG)) {
  const out = path.join(OUT, name)
  await sharp(path.join(SRC, from)).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(out)
  console.log(`${from} → ${name}  ${await kb(out)} KB`)
}
