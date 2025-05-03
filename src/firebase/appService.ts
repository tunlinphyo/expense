import { collection, doc, getDoc, getDocs, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"
import type { AppData } from "../types"

export class AppService {
    static collectionRef(userId: string) {
        return collection(db, "users", userId, "app")
    }

    static docRef(userId: string, key: AppData["id"]) {
        return doc(db, "users", userId, "app", key)
    }

    static async setField<K extends AppData["id"]>(
        userId: string,
        key: K,
        data: Extract<AppData, { id: K }>["data"]
    ): Promise<void> {
        const ref = doc(this.collectionRef(userId), key)
        await setDoc(ref, { data })
    }

    static async getAll(userId: string): Promise<AppData[]> {
        const snap = await getDocs(this.collectionRef(userId))
        return snap.docs.map(doc => ({
            id: doc.id,
            data: doc.data().data,
        }) as AppData)
    }

    static async getField<K extends AppData["id"]>(
        userId: string,
        key: K
    ): Promise<AppData | null> {
        const ref = doc(this.collectionRef(userId), key)
        const snap = await getDoc(ref)
        return snap.exists() ? ({
            ...snap.data(),
            id: key
        } as AppData) : null
    }

    static onAppChange(
        userId: string,
        callback: (datas: AppData[]) => void
    ): () => void {
        let isFirstSnapshot = true
        
        return onSnapshot(this.collectionRef(userId), (snapshot) => {
            if (isFirstSnapshot) {
                isFirstSnapshot = false
                return
            }
            const datas = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }) as AppData)
            callback(datas)
        })
    }

    static onFieldChange<K extends AppData["id"]>(
        userId: string,
        key: K,
        callback: (data: Extract<AppData, { id: K }>["data"] | null) => void
    ): () => void {
        return onSnapshot(this.docRef(userId, key), (snap) => {
            if (!snap.exists()) {
                callback(null)
            } else {
                const data = snap.data().data
                callback(data)
            }
        })
    }
}