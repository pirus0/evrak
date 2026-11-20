export const tl = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }) + ' ₺'
// "1.250,50" ya da "1250.5" gibi yazımları sayıya çevirir; boşsa null.
export function sayiOku(s: string): number | null {
  const t = s.trim().replace(/\s|₺/g, '')
  if (!t) return null
  const n = t.includes(',') ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t)
  return Number.isFinite(n) && n >= 0 ? n : null
}
export const sayiYaz = (n: number | null) => (n == null ? '' : n.toLocaleString('tr-TR', { maximumFractionDigits: 2 }))
