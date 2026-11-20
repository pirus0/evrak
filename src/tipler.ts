export interface DosyaBilgi {
  id: string
  mime: string // image/jpeg ya da application/pdf
  boyut: number
  parca: number // Firestore'da kaç parçaya bölündü
}

export interface Fatura {
  id: string
  ad: string
  tarih: string // YYYY-MM-DD
  tutar: number | null
  dosya: DosyaBilgi
  at: number
}

export interface Garanti {
  id: string
  ad: string
  alis: string // YYYY-MM-DD
  sure: number
  birim: 'ay' | 'yil'
  dosya: DosyaBilgi | null
  at: number
}

export interface Abonelik {
  id: string
  ad: string
  tutar: number
  donem: 'aylik' | 'yillik'
  baslangic: string // YYYY-MM-DD, yenileme günü buradan
  at: number
}
