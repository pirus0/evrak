const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

const iki = (n: number) => String(n).padStart(2, '0')
export const isoGun = (d: Date) => `${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}`
export const bugun = () => isoGun(new Date())
export const ayAnahtar = (iso: string) => iso.slice(0, 7)
export function parse(iso: string): Date {
  const [y, m, g] = iso.split('-').map(Number)
  return new Date(y, m - 1, g)
}
export function ayAdi(ay: string) {
  const [y, m] = ay.split('-').map(Number)
  return `${AYLAR[m - 1]} ${y}`
}
export function ayKaydir(ay: string, n: number) {
  const [y, m] = ay.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${iki(d.getMonth() + 1)}`
}
export function kisa(iso: string) {
  const d = parse(iso)
  return `${d.getDate()} ${KISA[d.getMonth()]}`
}
export function uzun(iso: string) {
  const d = parse(iso)
  return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`
}
// Ay ekler; gün o ayda yoksa ayın son gününe çeker (31 Oca + 1 ay = 28/29 Şub).
export function ayEkle(iso: string, n: number) {
  const d = parse(iso)
  const hedef = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const son = new Date(hedef.getFullYear(), hedef.getMonth() + 1, 0).getDate()
  hedef.setDate(Math.min(d.getDate(), son))
  return isoGun(hedef)
}
export function gunFarki(iso: string, bas = bugun()) {
  return Math.round((parse(iso).getTime() - parse(bas).getTime()) / 86400000)
}
