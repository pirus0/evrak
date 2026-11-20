import { addDoc, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { useMemo, useRef, useState } from 'react'
import { db, kGaranti } from '../firebase'
import { IArti, IBelge, IFoto, IGaranti } from '../ikon'
import { dosyaKaydet, dosyaSilBatch, pdfMi } from '../lib/dosya'
import { garantiBitis } from '../lib/hesap'
import { bugun, gunFarki, uzun } from '../lib/tarih'
import { useGarantiler } from '../lib/veri'
import { Alan, Bos, Goruntule, Pencere, Sabit } from '../ortak'
import { useKapanis } from '../lib/hareket'
import type { Garanti } from '../tipler'

function kalan(bitis: string) {
  const g = gunFarki(bitis)
  if (g < 0) return { metin: 'Bitti', sinif: 'bitti' }
  if (g === 0) return { metin: 'Bugün', sinif: 'yakin' }
  if (g <= 60) return { metin: `${g} gün`, sinif: g <= 30 ? 'yakin' : '' }
  const ay = Math.floor(g / 30.44)
  return { metin: ay >= 24 ? `${Math.floor(ay / 12)} yıl` : `${ay} ay`, sinif: '' }
}

export default function Garantiler() {
  const { liste, hata } = useGarantiler()
  const [form, setForm] = useState<Garanti | 'yeni' | null>(null)
  const [eski, setEski] = useState(false)
  const sirali = useMemo(
    () => (liste ?? []).map((g) => ({ g, bitis: garantiBitis(g) })).sort((a, b) => a.bitis.localeCompare(b.bitis)),
    [liste],
  )
  const bugunIso = bugun()
  const suren = sirali.filter((x) => x.bitis >= bugunIso)
  const biten = sirali.filter((x) => x.bitis < bugunIso)

  const satir = ({ g, bitis }: (typeof sirali)[number]) => {
    const k = kalan(bitis)
    return (
      <li key={g.id}>
        <button className="satir" onClick={() => setForm(g)}>
          <span className="ad"><span className="baslik">{g.ad}</span></span>
          <span className="yan"><b className={k.sinif}>{k.metin}</b><small>{uzun(bitis)}</small></span>
        </button>
      </li>
    )
  }

  return (
    <section>
      <div className="kart">
        <div className="kart-ust">
          <div>
            <h2>Süren</h2>
            {suren.length > 0 && <p>{suren.length} belge</p>}
          </div>
        </div>
        {hata && <p className="hata">{hata}</p>}
        {liste && suren.length === 0 && <Bos ikon={<IGaranti boyut={28} />}>Garanti belgesi yok</Bos>}
        {suren.length > 0 && <ul className="liste">{suren.map(satir)}</ul>}
      </div>
      {biten.length > 0 && (
        <div className="kart">
          <button className="bolum-dugme" onClick={() => setEski(!eski)}>Bitenler {biten.length}</button>
          {eski && <ul className="liste soluk-liste belir">{[...biten].reverse().map(satir)}</ul>}
        </div>
      )}
      <Sabit><button className="fab" onClick={() => setForm('yeni')} aria-label="Ekle"><IArti /></button></Sabit>
      {form && <GarantiForm g={form === 'yeni' ? null : form} kapat={() => setForm(null)} />}
    </section>
  )
}

function GarantiForm({ g, kapat }: { g: Garanti | null; kapat: () => void }) {
  const { cikiyor, kapan } = useKapanis(kapat)
  const [ad, setAd] = useState(g?.ad ?? '')
  const [alis, setAlis] = useState(g?.alis ?? bugun())
  const [sure, setSure] = useState(String(g?.sure ?? 2))
  const [birim, setBirim] = useState<Garanti['birim']>(g?.birim ?? 'yil')
  const [yeniDosya, setYeniDosya] = useState<File | null>(null)
  const [dosyaSil, setDosyaSil] = useState(false)
  const [goster, setGoster] = useState(false)
  const [silOnay, setSilOnay] = useState(false)
  const [is, setIs] = useState(false)
  const [hata, setHata] = useState<string | null>(null)
  const sec = useRef<HTMLInputElement>(null)
  const sureN = Math.floor(Number(sure))
  const gecerli = ad.trim() && alis && sureN > 0
  const mevcut = g?.dosya && !dosyaSil ? g.dosya : null

  async function kaydet() {
    setIs(true)
    setHata(null)
    try {
      let dosya = mevcut
      const b = writeBatch(db)
      if (g?.dosya && (dosyaSil || yeniDosya)) dosyaSilBatch(b, g.dosya)
      if (yeniDosya) dosya = await dosyaKaydet(yeniDosya)
      const veri = { ad: ad.trim(), alis, sure: sureN, birim, dosya }
      if (g) await updateDoc(doc(kGaranti, g.id), veri)
      else await addDoc(kGaranti, { ...veri, at: Date.now() })
      await b.commit()
      kapan()
    } catch (e) {
      setHata((e as Error).message)
      setIs(false)
    }
  }
  async function sil() {
    if (!g) return
    const b = writeBatch(db)
    if (g.dosya) dosyaSilBatch(b, g.dosya)
    await b.commit()
    await deleteDoc(doc(kGaranti, g.id))
    kapan()
  }

  return (
    <Pencere baslik="Garanti" kapat={is ? () => {} : kapan} cikiyor={cikiyor}>
      <Alan etiket="Ürün"><input value={ad} onChange={(e) => setAd(e.target.value)} autoFocus={!g} /></Alan>
      <Alan etiket="Alış"><input type="date" value={alis} onChange={(e) => setAlis(e.target.value)} /></Alan>
      <div className="alan">
        <span>Süre</span>
        <div className="sira">
          <input className="kisa-girdi" inputMode="numeric" value={sure} onChange={(e) => setSure(e.target.value.replace(/\D/g, ''))} />
          <div className="secenek">
            <button className={birim === 'ay' ? 'secili' : ''} onClick={() => setBirim('ay')}>Ay</button>
            <button className={birim === 'yil' ? 'secili' : ''} onClick={() => setBirim('yil')}>Yıl</button>
          </div>
        </div>
      </div>
      <div className="alan">
        <span>Belge</span>
        <div className="sira">
          {yeniDosya ? (
            <span className="dosya-ad">{pdfMi(yeniDosya) ? <IBelge /> : <IFoto />} {yeniDosya.name}</span>
          ) : mevcut ? (
            <>
              <button className="dugme ince ikincil" onClick={() => setGoster(true)}>Görüntüle</button>
              <button className="dugme ince sade yazi-tehlike" onClick={() => setDosyaSil(true)}>Kaldır</button>
            </>
          ) : null}
          <button className="dugme ince ikincil" onClick={() => sec.current?.click()}>{mevcut || yeniDosya ? 'Değiştir' : 'Ekle'}</button>
        </div>
        <input ref={sec} type="file" accept="image/*,application/pdf" hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) setYeniDosya(f)
          }} />
      </div>
      {hata && <p className="hata">{hata}</p>}
      <div className="pencere-alt">
        {silOnay ? (
          <>
            <button className="dugme sade" onClick={() => setSilOnay(false)}>Vazgeç</button>
            <button className="dugme tehlike" onClick={sil}>Kalıcı sil</button>
          </>
        ) : (
          <>
            {g && <button className="dugme sade yazi-tehlike" onClick={() => setSilOnay(true)}>Sil</button>}
            <button className="dugme" disabled={!gecerli || is} onClick={kaydet}>{is ? 'Kaydediliyor' : 'Kaydet'}</button>
          </>
        )}
      </div>
      {goster && g?.dosya && <Goruntule dosya={g.dosya} ad={ad} kapat={() => setGoster(false)} />}
    </Pencere>
  )
}
