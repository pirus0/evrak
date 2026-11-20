import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { collection, connectFirestoreEmulator, doc, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore'

// Eyes On ile aynı Firebase projesi ve aynı tek hesap. Veriler evrak/ana altında ayrı durur.
// Erişimi anahtarların gizliliği değil, Firestore kuralları (tek uid) ve kapalı kayıt korur.
const config = {
  apiKey: 'AIzaSyA512U50dnfYp9oszPpP6EHhZS9ZHmsJbA',
  authDomain: 'eyeson-pirus.firebaseapp.com',
  projectId: 'eyeson-pirus',
  storageBucket: 'eyeson-pirus.firebasestorage.app',
  messagingSenderId: '856178923113',
  appId: '1:856178923113:web:81a0cca7f68eba27fcb4f8',
}

export const HESAP = 'ben@eyeson.app'

const app = initializeApp(config)
export const auth = getAuth(app)

function makeDb(): Firestore {
  try {
    return initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
  } catch {
    return getFirestore(app)
  }
}
export const db = makeDb()

// Yerel deneme: VITE_EMU=1 ile Firebase emülatörüne bağlanır, canlı veriye dokunmaz.
if (import.meta.env.VITE_EMU) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

const kok = doc(db, 'evrak', 'ana')
export const kFatura = collection(kok, 'fatura')
export const kGaranti = collection(kok, 'garanti')
export const kAbonelik = collection(kok, 'abonelik')
export const kDosya = collection(kok, 'dosya')
