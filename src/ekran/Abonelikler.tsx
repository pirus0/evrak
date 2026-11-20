import { addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { useMemo, useState } from 'react'
import { kAbonelik } from '../firebase'
import { IAbonelik, IArti } from '../ikon'
import { aylikKarsilik, sonrakiYenileme } from '../lib/hesap'
import { sayiOku, sayiYaz, tl } from '../lib/para'
import { bugun, gunFarki, kisa } from '../lib/tarih'
import { useAbonelikler } from '../lib/veri'
import { Alan, Bos, Pencere } from '../ortak'
import type { Abonelik } from '../tipler'

export default function Abonelikler() {
  const { liste, hata } = useAbonelikler()
  const [form, setForm] = useState<Abonelik | 'yeni' | null>(null)
  const sirali = useMemo(
    () => (liste ?? []).map((a) => ({ a, sonraki: sonrakiYenileme(a) })).sort((x, y) => x.sonraki.localeCompare(y.sonraki)),
    [liste],
  )
  const aylik = (liste ?? []).reduce((t, a) => t + aylikKarsilik(a), 0)

  return (
    <section>
      <div className="kart">
        <div className="kart-ust">
          <div>
            <h2>Yenilemeler</h2>
            {sirali.length > 0 && <p>{sirali.length} abonelik</p>}
          </div>
          <button className="fab" onClick={() => setForm('yeni')} aria-label="Ekle"><IArti /></button>
        </div>
        {hata && <p className="hata">{hata}</p>}
        {liste && liste.length === 0 && <Bos ikon={<IAbonelik boyut={28} />}>Abonelik yok</Bos>}
        {sirali.length > 0 && (
          <>
            <div className="toplam">
              <div><small>Aylık</small><strong>{tl(Math.round(aylik * 100) / 100)}</strong></div>
              <div><small>Yıllık</small><strong>{tl(Math.round(aylik * 12 * 100) / 100)}</strong></div>
            </div>
            <ul className="liste">
              {sirali.map(({ a, sonraki }) => {
                const g = gunFarki(sonraki)
                return (
                  <li key={a.id}>
                    <button className="satir" onClick={() => setForm(a)}>
                      <span className="ad"><span className="baslik">{a.ad}</span><span className="etiket-hap">{a.donem === 'yillik' ? 'Yıllık' : 'Aylık'}</span></span>
                      <span className="yan">
                        <b>{tl(a.tutar)}</b>
                        <small className={g <= 3 ? 'yakin' : ''}>{g === 0 ? 'Bugün' : g === 1 ? 'Yarın' : kisa(sonraki)}</small>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
      {form && <AbonelikForm a={form === 'yeni' ? null : form} kapat={() => setForm(null)} />}
    </section>
  )
}

function AbonelikForm({ a, kapat }: { a: Abonelik | null; kapat: () => void }) {
  const [ad, setAd] = useState(a?.ad ?? '')
  const [tutar, setTutar] = useState(sayiYaz(a?.tutar ?? null))
  const [donem, setDonem] = useState<Abonelik['donem']>(a?.donem ?? 'aylik')
  const [baslangic, setBaslangic] = useState(a?.baslangic ?? bugun())
  const [silOnay, setSilOnay] = useState(false)
  const t = sayiOku(tutar)
  const gecerli = ad.trim() && t != null && baslangic

  async function kaydet() {
    const veri = { ad: ad.trim(), tutar: t!, donem, baslangic }
    if (a) await updateDoc(doc(kAbonelik, a.id), veri)
    else await addDoc(kAbonelik, { ...veri, at: Date.now() })
    kapat()
  }
  async function sil() {
    if (a) await deleteDoc(doc(kAbonelik, a.id))
    kapat()
  }

  return (
    <Pencere baslik="Abonelik" kapat={kapat}>
      <Alan etiket="Ad"><input value={ad} onChange={(e) => setAd(e.target.value)} autoFocus={!a} /></Alan>
      <Alan etiket="Tutar"><input inputMode="decimal" value={tutar} onChange={(e) => setTutar(e.target.value)} /></Alan>
      <div className="alan">
        <span>Dönem</span>
        <div className="secenek">
          <button className={donem === 'aylik' ? 'secili' : ''} onClick={() => setDonem('aylik')}>Aylık</button>
          <button className={donem === 'yillik' ? 'secili' : ''} onClick={() => setDonem('yillik')}>Yıllık</button>
        </div>
      </div>
      <Alan etiket="Yenileme"><input type="date" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} /></Alan>
      <div className="pencere-alt">
        {silOnay ? (
          <>
            <button className="dugme sade" onClick={() => setSilOnay(false)}>Vazgeç</button>
            <button className="dugme tehlike" onClick={sil}>Kalıcı sil</button>
          </>
        ) : (
          <>
            {a && <button className="dugme sade yazi-tehlike" onClick={() => setSilOnay(true)}>Sil</button>}
            <button className="dugme" disabled={!gecerli} onClick={kaydet}>Kaydet</button>
          </>
        )}
      </div>
    </Pencere>
  )
}
