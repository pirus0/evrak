import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
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

// Başlığa çift dokununca gündüz/gece değişir (Eyes On'daki gibi). Seçim Evrak'a özel saklanır; seçim yoksa Eyes On'unki, o da yoksa telefonunki geçer.
function temaDegistir() {
  const yeni = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = yeni
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', yeni === 'dark' ? '#11100e' : '#efebe2'))
  try { localStorage.setItem('evrak-theme', yeni) } catch { /* gizli mod */ }
}

export default function App() {
  const [kullanici, setKullanici] = useState<User | null | undefined>(undefined)
  const [sekme, setSekme] = useState<Sekme>(ilkSekme)
  const sonDokunus = useRef(0)
  useEffect(() => onAuthStateChanged(auth, setKullanici), [])
  useEffect(() => {
    try { localStorage.setItem('evrak-sekme', sekme) } catch { /* gizli mod */ }
  }, [sekme])

  if (kullanici === undefined) return null
  if (!kullanici) return <Giris />

  return (
    <div className="kabuk">
      <header className="ust">
        <h1
          className="tema-dugme"
          onClick={() => {
            const simdi = Date.now()
            if (simdi - sonDokunus.current < 350) {
              sonDokunus.current = 0
              temaDegistir()
            } else sonDokunus.current = simdi
          }}
        >
          <IFatura boyut={26} />Evrak
        </h1>
      </header>
      <main>
        {sekme === 'fatura' && <Faturalar />}
        {sekme === 'garanti' && <Garantiler />}
        {sekme === 'abonelik' && <Abonelikler />}
      </main>
      <nav className="sekmeler">
        {SEKMELER.map(({ id, ad, ikon: I }) => (
          <button key={id} className={sekme === id ? 'secili' : ''} onClick={() => setSekme(id)} aria-label={ad} aria-current={sekme === id ? 'page' : undefined}>
            <I boyut={24} />
          </button>
        ))}
      </nav>
    </div>
  )
}
