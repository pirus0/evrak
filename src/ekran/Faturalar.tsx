import { addDoc, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { useMemo, useRef, useState } from 'react'
import { db, kFatura } from '../firebase'
import { IArti, IBelge, IFatura, IFoto, ISag, ISol, ITik } from '../ikon'
import { birlestir, dosyaAdi, dosyaKaydet, dosyaOku, dosyaSilBatch, fileYap, paylas, pdfMi } from '../lib/dosya'
import { sayiOku, sayiYaz, tl } from '../lib/para'
import { ayAdi, ayAnahtar, ayKaydir, bugun, kisa } from '../lib/tarih'
import { useFaturalar } from '../lib/veri'
import { Alan, Bos, Goruntule, Pencere, Sabit } from '../ortak'
import { useKapanis } from '../lib/hareket'
import type { Fatura } from '../tipler'

type Hazir = { tur: 'paylas' | 'birlestir'; dosyalar: File[] }

export default function Faturalar() {
  const { liste, hata } = useFaturalar()
  const [ay, setAy] = useState(ayAnahtar(bugun()))
  const [yon, setYon] = useState(0)
  const [haric, setHaric] = useState<Set<string>>(new Set())
  const [yeni, setYeni] = useState<File[] | null>(null)
  const [duzenle, setDuzenle] = useState<Fatura | null>(null)
  const [hazir, setHazir] = useState<Hazir | null>(null)
  const [is, setIs] = useState<string | null>(null)
  const [isHata, setIsHata] = useState<string | null>(null)
  const sec = useRef<HTMLInputElement>(null)

  const aydakiler = useMemo(
    () => (liste ?? []).filter((f) => ayAnahtar(f.tarih) === ay).sort((a, b) => a.tarih.localeCompare(b.tarih) || a.at - b.at),
    [liste, ay],
  )
  const secili = aydakiler.filter((f) => !haric.has(f.id))
  const toplam = secili.reduce((t, f) => t + (f.tutar ?? 0), 0)

  function ayDegis(n: number) {
    setYon(n)
    setAy((a) => ayKaydir(a, n))
    setHaric(new Set())
    setHazir(null)
  }
  function degistir(id: string) {
    setHazir(null)
    setHaric((h) => {
      const y = new Set(h)
      if (y.has(id)) y.delete(id)
      else y.add(id)
      return y
    })
  }
  const tumu = haric.size === 0 && aydakiler.length > 0
  function tumuDegis() {
    setHazir(null)
    setHaric(tumu ? new Set(aydakiler.map((f) => f.id)) : new Set())
  }

  // Dosyalar önce hazırlanır, sonra ayrı dokunuşla gönderilir: telefon paylaşım menüsünü
  // yalnızca doğrudan dokunuşla açar, internetten indirme beklemesi bu izni düşürür.
  async function hazirla(tur: Hazir['tur']) {
    setIsHata(null)
    setIs('Hazırlanıyor')
    try {
      if (tur === 'paylas') {
        const dosyalar = await Promise.all(secili.map(async (f) => fileYap(await dosyaOku(f.dosya), f.dosya, `${f.tarih} ${f.ad}`)))
        setHazir({ tur, dosyalar })
      } else {
        const pdf = await birlestir(secili)
        setHazir({ tur, dosyalar: [new File([pdf as BlobPart], dosyaAdi(`Faturalar ${ay}`, 'pdf'), { type: 'application/pdf' })] })
      }
    } catch (e) {
      setIsHata((e as Error).message)
    } finally {
      setIs(null)
    }
  }

  return (
    <section>
      <div className="kart">
        <div className="kart-ust ortali">
          <div className="ay-secici">
            <button className="ikon-dugme" onClick={() => ayDegis(-1)} aria-label="Önceki ay"><ISol /></button>
            <strong>{ayAdi(ay)}</strong>
            <button className="ikon-dugme" onClick={() => ayDegis(1)} aria-label="Sonraki ay"><ISag /></button>
          </div>
        </div>

        <div key={ay} className={yon > 0 ? 'gecis-sag' : yon < 0 ? 'gecis-sol' : ''}>
        {hata && <p className="hata">{hata}</p>}
        {liste && aydakiler.length === 0 && <Bos ikon={<IFatura boyut={28} />}>Bu ay fatura yok</Bos>}

        {aydakiler.length > 0 && (
          <>
            <div className="ozet">
              <button className="tik-dugme" onClick={tumuDegis}><ITik acik={tumu} /> Tümü</button>
              <span className="tabular">{secili.length} / {aydakiler.length}{toplam > 0 && <> · <b>{tl(toplam)}</b></>}</span>
            </div>
            <ul className="liste">
              {aydakiler.map((f) => (
                <li key={f.id} className={haric.has(f.id) ? 'kapali' : ''}>
                  <button className="tik-dugme" onClick={() => degistir(f.id)} aria-label="Seç"><ITik acik={!haric.has(f.id)} /></button>
                  <button className="satir" onClick={() => setDuzenle(f)}>
                    <span className="tur">{f.dosya.mime === 'application/pdf' ? <IBelge /> : <IFoto />}</span>
                    <span className="ad"><span className="baslik">{f.ad}</span></span>
                    <span className="yan">{f.tutar != null && <b>{tl(f.tutar)}</b>}<small>{kisa(f.tarih)}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        </div>
      </div>

      {(is || isHata || hazir) && (
        <p className={isHata ? 'durum hata belir' : 'durum belir'}>
          {isHata ?? is ?? (hazir!.tur === 'birlestir' ? `${secili.length} fatura tek PDF` : `${hazir!.dosyalar.length} dosya`)}
        </p>
      )}

      <input ref={sec} type="file" accept="image/*,application/pdf" multiple hidden
        onChange={(e) => {
          const f = Array.from(e.target.files ?? [])
          e.target.value = ''
          if (f.length) setYeni(f)
        }} />

      {aydakiler.length > 0 && (
        <Sabit><div className="alt-cubuk">
          {hazir ? (
            <>
              <button key="vazgec" className="dugme sade belir" onClick={() => setHazir(null)}>Vazgeç</button>
              <button key="gonder" className="dugme belir" onClick={() => paylas(hazir.dosyalar).then(() => setHazir(null)).catch((e) => setIsHata(e.message))}>
                Gönder
              </button>
            </>
          ) : (
            <>
              <button key="paylas" className="dugme ikincil" disabled={!secili.length || !!is} onClick={() => hazirla('paylas')}>Paylaş</button>
              <button className="dugme" disabled={!secili.length || !!is} onClick={() => hazirla('birlestir')}>Birleştir</button>
            </>
          )}
        </div></Sabit>
      )}

      <Sabit><button className="fab" onClick={() => sec.current?.click()} aria-label="Ekle"><IArti /></button></Sabit>

      {yeni && <YeniFatura dosyalar={yeni} ay={ay} kapat={() => setYeni(null)} />}
      {duzenle && <FaturaDuzenle f={duzenle} kapat={() => setDuzenle(null)} />}
    </section>
  )
}

function YeniFatura({ dosyalar, ay, kapat }: { dosyalar: File[]; ay: string; kapat: () => void }) {
  const { cikiyor, kapan } = useKapanis(kapat)
  const [tarih, setTarih] = useState(ayAnahtar(bugun()) === ay ? bugun() : `${ay}-01`)
  const [adlar, setAdlar] = useState(dosyalar.map((f) => (/^(image|img|photo|IMG_)/i.test(f.name) ? '' : f.name.replace(/\.[^.]+$/, ''))))
  const [tutarlar, setTutarlar] = useState(dosyalar.map(() => ''))
  const [is, setIs] = useState<string | null>(null)
  const [hata, setHata] = useState<string | null>(null)

  async function kaydet() {
    setHata(null)
    try {
      for (let i = 0; i < dosyalar.length; i++) {
        setIs(`${i + 1} / ${dosyalar.length}`)
        const dosya = await dosyaKaydet(dosyalar[i])
        await addDoc(kFatura, { ad: adlar[i].trim() || 'Fatura', tarih, tutar: sayiOku(tutarlar[i]), dosya, at: Date.now() })
      }
      kapan()
    } catch (e) {
      setHata((e as Error).message)
      setIs(null)
    }
  }

  return (
    <Pencere baslik={dosyalar.length > 1 ? `${dosyalar.length} fatura` : 'Fatura'} kapat={is ? () => {} : kapan} cikiyor={cikiyor}>
      <Alan etiket="Tarih"><input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} /></Alan>
      {dosyalar.map((f, i) => (
        <div className="kalem" key={i}>
          <span className="tur">{pdfMi(f) ? <IBelge /> : <IFoto />}</span>
          <input placeholder="Ad" value={adlar[i]} onChange={(e) => setAdlar(adlar.map((a, j) => (j === i ? e.target.value : a)))} />
          <input className="tutar" inputMode="decimal" placeholder="Tutar" value={tutarlar[i]}
            onChange={(e) => setTutarlar(tutarlar.map((a, j) => (j === i ? e.target.value : a)))} />
        </div>
      ))}
      {hata && <p className="hata">{hata}</p>}
      <div className="pencere-alt">
        <button className="dugme" disabled={!!is || !tarih} onClick={kaydet}>{is ?? 'Kaydet'}</button>
      </div>
    </Pencere>
  )
}

function FaturaDuzenle({ f, kapat }: { f: Fatura; kapat: () => void }) {
  const { cikiyor, kapan } = useKapanis(kapat)
  const [ad, setAd] = useState(f.ad)
  const [tarih, setTarih] = useState(f.tarih)
  const [tutar, setTutar] = useState(sayiYaz(f.tutar))
  const [goster, setGoster] = useState(false)
  const [silOnay, setSilOnay] = useState(false)

  async function kaydet() {
    await updateDoc(doc(kFatura, f.id), { ad: ad.trim() || 'Fatura', tarih, tutar: sayiOku(tutar) })
    kapan()
  }
  async function sil() {
    const b = writeBatch(db)
    dosyaSilBatch(b, f.dosya)
    await b.commit()
    await deleteDoc(doc(kFatura, f.id))
    kapan()
  }

  return (
    <Pencere baslik="Fatura" kapat={kapan} cikiyor={cikiyor}>
      <Alan etiket="Ad"><input value={ad} onChange={(e) => setAd(e.target.value)} /></Alan>
      <Alan etiket="Tarih"><input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} /></Alan>
      <Alan etiket="Tutar"><input inputMode="decimal" value={tutar} onChange={(e) => setTutar(e.target.value)} /></Alan>
      <div className="pencere-alt">
        {silOnay ? (
          <>
            <button className="dugme sade" onClick={() => setSilOnay(false)}>Vazgeç</button>
            <button className="dugme tehlike" onClick={sil}>Kalıcı sil</button>
          </>
        ) : (
          <>
            <button className="dugme sade yazi-tehlike" onClick={() => setSilOnay(true)}>Sil</button>
            <button className="dugme ikincil" onClick={() => setGoster(true)}>Görüntüle</button>
            <button className="dugme" disabled={!tarih} onClick={kaydet}>Kaydet</button>
          </>
        )}
      </div>
      {goster && <Goruntule dosya={f.dosya} ad={ad} kapat={() => setGoster(false)} />}
    </Pencere>
  )
}
