import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IKapat } from './ikon'
import { dosyaOku, fileYap, paylas } from './lib/dosya'
import { useKapanis } from './lib/hareket'
import type { DosyaBilgi } from './tipler'

// Sabit konumlu öğeler body'ye taşınır: sekme/ay geçişinde kayan içerik (transform) onları sürüklemesin.
export const Sabit = ({ children }: { children: ReactNode }) => createPortal(children, document.body)

export function Pencere({ baslik, kapat, cikiyor, children }: { baslik: string; kapat: () => void; cikiyor?: boolean; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && kapat()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', k)
      document.body.style.overflow = ''
    }
  }, [kapat])
  return createPortal(
    <div className={cikiyor ? 'perde cik' : 'perde'} onClick={kapat}>
      <div className="pencere" role="dialog" aria-label={baslik} onClick={(e) => e.stopPropagation()}>
        <div className="tutamak" />
        <div className="pencere-ust">
          <h2>{baslik}</h2>
          <button className="ikon-dugme" onClick={kapat} aria-label="Kapat"><IKapat /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function Alan({ etiket, children }: { etiket: string; children: ReactNode }) {
  return (
    <label className="alan">
      <span>{etiket}</span>
      {children}
    </label>
  )
}

// Belgeyi uygulamanın içinde gösterir; PDF'i telefonun kendi görüntüleyicisi açar.
export function Goruntule({ dosya, ad, kapat: kapatDis }: { dosya: DosyaBilgi; ad: string; kapat: () => void }) {
  const { cikiyor, kapan: kapat } = useKapanis(kapatDis, 180)
  const [url, setUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [hata, setHata] = useState<string | null>(null)
  useEffect(() => {
    let u: string | null = null
    dosyaOku(dosya)
      .then((v) => {
        const f = fileYap(v, dosya, ad)
        setFile(f)
        u = URL.createObjectURL(f)
        setUrl(u)
      })
      .catch((e) => setHata(e.message))
    return () => {
      if (u) URL.revokeObjectURL(u)
    }
  }, [dosya, ad])
  return createPortal(
    <div className={cikiyor ? 'gosterici cik' : 'gosterici'}>
      <div className="gosterici-ust">
        <span>{ad}</span>
        <div className="sira">
          {file && <button className="dugme ince" onClick={() => paylas([file])}>Paylaş</button>}
          {url && dosya.mime === 'application/pdf' && <a className="dugme ince" href={url} target="_blank" rel="noreferrer">Aç</a>}
          <button className="ikon-dugme acik" onClick={kapat} aria-label="Kapat"><IKapat /></button>
        </div>
      </div>
      <div className="gosterici-govde">
        {hata && <p className="hata">{hata}</p>}
        {!url && !hata && <p className="soluk">Yükleniyor</p>}
        {url && dosya.mime !== 'application/pdf' && <img src={url} alt={ad} />}
        {url && dosya.mime === 'application/pdf' && <iframe src={url} title={ad} />}
      </div>
    </div>,
    document.body,
  )
}

export function Bos({ ikon, children }: { ikon?: ReactNode; children: ReactNode }) {
  return <div className="bos">{ikon}<p>{children}</p></div>
}
