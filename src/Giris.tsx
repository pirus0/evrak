import { signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { auth, HESAP } from './firebase'
import { IFatura } from './ikon'

export default function Giris() {
  const [sifre, setSifre] = useState('')
  const [hata, setHata] = useState('')
  const [bekle, setBekle] = useState(false)
  async function gir(e: React.FormEvent) {
    e.preventDefault()
    setBekle(true)
    setHata('')
    try {
      await signInWithEmailAndPassword(auth, HESAP, sifre.trim())
    } catch (e) {
      const k = (e as { code?: string }).code ?? ''
      setHata(k.includes('too-many') ? 'Çok deneme yapıldı, biraz bekleyin' : k.includes('network') ? 'İnternet yok' : 'Şifre yanlış')
    } finally {
      setBekle(false)
    }
  }
  return (
    <form className="giris" onSubmit={gir}>
      <IFatura boyut={48} />
      <input type="password" autoComplete="current-password" placeholder="Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)} autoFocus />
      <button className="dugme" disabled={bekle || !sifre}>Giriş</button>
      <p className="hata" role="alert">{hata}</p>
    </form>
  )
}
