import { collection, doc, getDoc, getDocs, onSnapshot, setDoc } from "firebase/firestore"
import { db } from "./firebase"
import type { Currency } from "../types"

export class CurrencyService {
    private static get collectionRef() {
        return collection(db, "currency")
    }

    static async setCurrency(currency: Currency): Promise<void> {
        const iconRef = doc(this.collectionRef, currency.id)
        await setDoc(iconRef, {
            name: currency.name,
            sign: currency.sign,
            flag: currency.flag
        })
    }

    static async seedCurrency(currencies: Currency[]): Promise<void> {
        for (const currency of currencies) {
            await this.setCurrency(currency)
        }
    }

    static async getAllCurrencies(): Promise<Currency[]> {
        const snapshot = await getDocs(this.collectionRef)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            sign: doc.data().sign,
            flag: doc.data().flag
        }))
    }

    static async getCurrency(currendyId: string): Promise<Currency | null> {
        const ref = doc(this.collectionRef, currendyId)
        const snap = await getDoc(ref)
        return snap.exists() ? (snap.data() as Currency) : null
    }

    static onCurrencyChange(callback: (icons: Currency[]) => void): () => void {
        return onSnapshot(this.collectionRef, (snapshot) => {
            const currency = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                sign: doc.data().sign,
                flag: doc.data().flag
            }))
            callback(currency)
        })
    }
}