import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import Abonelikler from './ekran/Abonelikler'
import Faturalar from './ekran/Faturalar'
import Garantiler from './ekran/Garantiler'
import { auth } from './firebase'
import Giris from './Giris'
import { IAbonelik, IFatura, IGaranti } from './ikon'

const SEKMELER = [
  { id: 'fatura', ad: 'Fatura', ikon: IFatura },
  { id: 'garanti', ad: 'Garanti', ikon: IGaranti },
  { id: 'abonelik', ad: 'Abonelik', ikon: IAbonelik },
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

  const baslik = SEKMELER.find((s) => s.id === sekme)!.ad
  return (
    <div className="kabuk">
      <header className="ust">
        <h1>{baslik}</h1>
        <button className="metin-dugme" onClick={() => signOut(auth)}>Çıkış</button>
      </header>
      <main>
        {sekme === 'fatura' && <Faturalar />}
        {sekme === 'garanti' && <Garantiler />}
        {sekme === 'abonelik' && <Abonelikler />}
      </main>
      <nav className="sekmeler">
        {SEKMELER.map(({ id, ad, ikon: I }) => (
          <button key={id} className={sekme === id ? 'secili' : ''} onClick={() => setSekme(id)}>
            <I />
            <span>{ad}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
