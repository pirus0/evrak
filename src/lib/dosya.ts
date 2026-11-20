import { Bytes, doc, getDoc, writeBatch } from 'firebase/firestore'
import { db, kDosya } from '../firebase'
import type { DosyaBilgi } from '../tipler'

// Firebase'in ücretsiz planında Storage yok; dosyalar Firestore'da parça parça (her biri < 1 MB) durur.
const PARCA = 900_000

// Fotoğrafı en uzun kenarı 2000 px'lik JPEG'e indirir. Fatura yazısı okunur kalır, boyut ~300-600 KB.
async function jpegYap(f: File): Promise<Uint8Array> {
  const bmp = await createImageBitmap(f)
  const olcek = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * olcek)
  c.height = Math.round(bmp.height * olcek)
  const x = c.getContext('2d')!
  x.fillStyle = '#fff'
  x.fillRect(0, 0, c.width, c.height)
  x.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  const b: Blob = await new Promise((r, h) => c.toBlob((b) => (b ? r(b) : h(new Error('Fotoğraf okunamadı'))), 'image/jpeg', 0.82))
  return new Uint8Array(await b.arrayBuffer())
}

export const pdfMi = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)

export async function dosyaKaydet(f: File): Promise<DosyaBilgi> {
  const pdf = pdfMi(f)
  const veri = pdf ? new Uint8Array(await f.arrayBuffer()) : await jpegYap(f)
  if (veri.length > 15 * PARCA) throw new Error('Dosya çok büyük (en fazla ~13 MB)')
  const id = crypto.randomUUID()
  const parca = Math.max(1, Math.ceil(veri.length / PARCA))
  const batch = writeBatch(db)
  for (let i = 0; i < parca; i++) {
    batch.set(doc(kDosya, `${id}_${i}`), { d: Bytes.fromUint8Array(veri.subarray(i * PARCA, (i + 1) * PARCA)) })
  }
  await batch.commit()
  return { id, mime: pdf ? 'application/pdf' : 'image/jpeg', boyut: veri.length, parca }
}

const onbellek = new Map<string, Uint8Array>()
export async function dosyaOku(b: DosyaBilgi): Promise<Uint8Array> {
  const v = onbellek.get(b.id)
  if (v) return v
  const parcalar = await Promise.all(
    Array.from({ length: b.parca }, async (_, i) => {
      const s = await getDoc(doc(kDosya, `${b.id}_${i}`))
      if (!s.exists()) throw new Error('Dosya parçası bulunamadı')
      return (s.data().d as Bytes).toUint8Array()
    }),
  )
  const out = new Uint8Array(parcalar.reduce((t, p) => t + p.length, 0))
  let o = 0
  for (const p of parcalar) {
    out.set(p, o)
    o += p.length
  }
  onbellek.set(b.id, out)
  return out
}

export function dosyaSilBatch(batch: ReturnType<typeof writeBatch>, b: DosyaBilgi) {
  for (let i = 0; i < b.parca; i++) batch.delete(doc(kDosya, `${b.id}_${i}`))
  onbellek.delete(b.id)
}

// WhatsApp ve dosya adlarında sorun çıkmasın diye Türkçe harfler sadeleşir.
export function dosyaAdi(ad: string, uzanti: string) {
  const t: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U' }
  const s = ad.replace(/[çğıöşüÇĞİÖŞÜ]/g, (h) => t[h]).replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return `${s || 'belge'}.${uzanti}`
}

export function fileYap(veri: Uint8Array, b: Pick<DosyaBilgi, 'mime'>, ad: string) {
  return new File([veri as BlobPart], dosyaAdi(ad, b.mime === 'application/pdf' ? 'pdf' : 'jpg'), { type: b.mime })
}

// Seçilen faturaları sırayla tek PDF'te toplar: PDF'lerin sayfaları kopyalanır, fotoğraflar A4 sayfaya oturur.
export async function birlestir(liste: { ad: string; dosya: DosyaBilgi }[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const out = await PDFDocument.create()
  const A4: [number, number] = [595.28, 841.89]
  const KENAR = 24
  for (const x of liste) {
    const veri = await dosyaOku(x.dosya)
    if (x.dosya.mime === 'application/pdf') {
      const src = await PDFDocument.load(veri, { ignoreEncryption: true })
      const sayfalar = await out.copyPages(src, src.getPageIndices())
      sayfalar.forEach((p) => out.addPage(p))
    } else {
      const img = await out.embedJpg(veri)
      const yatay = img.width > img.height
      const [w, h] = yatay ? [A4[1], A4[0]] : A4
      const s = Math.min((w - 2 * KENAR) / img.width, (h - 2 * KENAR) / img.height)
      const p = out.addPage([w, h])
      p.drawImage(img, { x: (w - img.width * s) / 2, y: (h - img.height * s) / 2, width: img.width * s, height: img.height * s })
    }
  }
  return out.save()
}

// Paylaşım menüsü (WhatsApp vb.). Desteklenmiyorsa dosyalar indirilir.
export async function paylas(dosyalar: File[]) {
  if (navigator.canShare?.({ files: dosyalar })) {
    try {
      await navigator.share({ files: dosyalar })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') throw e
    }
    return
  }
  for (const f of dosyalar) {
    const u = URL.createObjectURL(f)
    const a = document.createElement('a')
    a.href = u
    a.download = f.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(u), 10_000)
  }
}
