import { useCallback, useState } from 'react'

export const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Pencereyi kapatırken önce çıkış animasyonu oynar, sonra gerçekten kapanır.
export function useKapanis(kapat: () => void, sure = 200) {
  const [cikiyor, setCikiyor] = useState(false)
  const kapan = useCallback(() => {
    if (azHareket()) return kapat()
    setCikiyor(true)
    setTimeout(kapat, sure)
  }, [kapat, sure])
  return { cikiyor, kapan }
}

