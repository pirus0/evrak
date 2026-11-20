import { onSnapshot, type CollectionReference } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { kAbonelik, kFatura, kGaranti } from '../firebase'
import type { Abonelik, Fatura, Garanti } from '../tipler'

function useKoleksiyon<T>(k: CollectionReference) {
  const [v, setV] = useState<T[] | null>(null)
  const [hata, setHata] = useState<string | null>(null)
  useEffect(
    () =>
      onSnapshot(
        k,
        (s) => setV(s.docs.map((d) => ({ ...(d.data() as T), id: d.id }))),
        (e) => setHata(e.message),
      ),
    [k],
  )
  return { liste: v, hata }
}

export const useFaturalar = () => useKoleksiyon<Fatura>(kFatura)
export const useGarantiler = () => useKoleksiyon<Garanti>(kGaranti)
export const useAbonelikler = () => useKoleksiyon<Abonelik>(kAbonelik)
