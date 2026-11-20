import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import Abonelikler from './ekran/Abonelikler'
import Faturalar from './ekran/Faturalar'
import Garantiler from './ekran/Garantiler'
import { auth } from './firebase'
import Giris from './Giris'
import { ICikis, IFatura } from './ikon'

const SEKMELER = [
  { id: 'fatura', ad: 'Fatura' },
  { id: 'garanti', ad: 'Garanti' },
  { id: 'abonelik', ad: 'Abonelik' },
] as const
type Sekme = (typeof SEKMELER)[number]['id']

function ilkSekme(): Sekme {
  try {
    const s = localStorage.getItem('evrak-sekme')
    if (SEKMELER.some((x) => x.id === s)) return s as Sekme
  } catch { /* gizli mod */ }
  return 'fatura'
}

export default function App() {
  const [kullanici, setKullanici] = useState<User | null | undefined>(undefined)
  const [sekme, setSekme] = useState<Sekme>(ilkSekme)
  useEffect(() => onAuthStateChanged(auth, setKullanici), [])
  useEffect(() => {
    try { localStorage.setItem('evrak-sekme', sekme) } catch { /* gizli mod */ }
  }, [sekme])

  if (kullanici === undefined) return null
  if (!kullanici) return <Giris />

  return (
    <div className="kabuk">
      <header className="ust">
        <h1><IFatura boyut={26} />Evrak</h1>
        <div className="hap-grup">
          <button className="ikon-dugme" onClick={() => signOut(auth)} aria-label="Çıkış"><ICikis /></button>
        </div>
      </header>
      <nav className="sekmeler">
        {SEKMELER.map(({ id, ad }) => (
          <button key={id} className={sekme === id ? 'secili' : ''} onClick={() => setSekme(id)}>{ad}</button>
        ))}
      </nav>
      <main>
        {sekme === 'fatura' && <Faturalar />}
        {sekme === 'garanti' && <Garantiler />}
        {sekme === 'abonelik' && <Abonelikler />}
      </main>
    </div>
  )
}
