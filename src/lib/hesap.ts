import type { Abonelik, Garanti } from '../tipler'
import { ayEkle, bugun } from './tarih'

export const garantiBitis = (g: Garanti) => ayEkle(g.alis, g.birim === 'yil' ? g.sure * 12 : g.sure)

// Bugün ya da sonrasındaki ilk yenileme günü.
export function sonrakiYenileme(a: Abonelik, bas = bugun()) {
  const adim = a.donem === 'yillik' ? 12 : 1
  let n = 0
  let t = a.baslangic
  while (t < bas) {
    n += adim
    t = ayEkle(a.baslangic, n)
  }
  return t
}

export const aylikKarsilik = (a: Abonelik) => (a.donem === 'yillik' ? a.tutar / 12 : a.tutar)
