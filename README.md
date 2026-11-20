# Evrak

Kişisel PWA: aylık faturalar (fotoğraf/PDF, toplu paylaşım ve tek PDF'te birleştirme), garanti belgeleri, abonelikler.

- Canlı: https://pirus0.github.io/evrak/
- Veri: Firebase `eyeson-pirus` projesi, `evrak/ana/{fatura,garanti,abonelik,dosya}`. Eyes On ile aynı hesap.
- Dosyalar Firestore'da 900 KB'lık parçalar hâlinde (ücretsiz planda Storage yok).
- Kuralların asıl kaynağı Eyes On reposundaki `firestore.rules` (proje ortak; buradan deploy etmek oradakini ezer). Buradaki kopya sadece emülatör içindir.
- Yerel deneme: `npx firebase-tools emulators:start --only auth,firestore` + `VITE_EMU=1 npm run dev`.
