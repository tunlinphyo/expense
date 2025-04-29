import { collection, doc, getDocs, getDoc, onSnapshot, setDoc } from "firebase/firestore"
import { db } from "./firebase"
import type { IconType } from "../types"

export class IconService {
    private static get collectionRef() {
        return collection(db, "icons")
    }

    static async setIcon(icon: IconType): Promise<void> {
        const iconRef = doc(this.collectionRef, icon.id)
        await setDoc(iconRef, {
            icon: icon.icon
        })
    }

    static async seedIcons(icons: IconType[]): Promise<void> {
        for (const icon of icons) {
            await this.setIcon(icon)
        }
    }

    static async getAllIcons(): Promise<IconType[]> {
        const snapshot = await getDocs(this.collectionRef)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            icon: doc.data().icon
        }))
    }

    static async getIcon(iconId: string): Promise<IconType | null> {
        const ref = doc(this.collectionRef, iconId)
        const snap = await getDoc(ref)
        return snap.exists() ? ({
            ...snap.data(),
            id: iconId,
        } as IconType) : null
    }

    static onIconChange(callback: (icons: IconType[]) => void): () => void {
        return onSnapshot(this.collectionRef, (snapshot) => {
            const icons = snapshot.docs.map(doc => ({
                id: doc.id,
                icon: doc.data().icon
            }))
            callback(icons)
        })
    }
}