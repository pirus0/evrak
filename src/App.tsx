import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import Abonelikler from './ekran/Abonelikler'
import Faturalar from './ekran/Faturalar'
import Garantiler from './ekran/Garantiler'
import { auth } from './firebase'
import Giris from './Giris'
import { IFatura } from './ikon'

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

// Başlığa dokununca gündüz/gece değişir. Seçim Evrak'a özel saklanır; seçim yoksa Eyes On'unki, o da yoksa telefonunki geçer.
function temaDegistir() {
  const yeni = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = yeni
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', yeni === 'dark' ? '#11100e' : '#efebe2'))
  try { localStorage.setItem('evrak-theme', yeni) } catch { /* gizli mod */ }
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
        <h1><button className="tema-dugme" onClick={temaDegistir} aria-label="Gündüz ya da gece"><IFatura boyut={26} />Evrak</button></h1>
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
