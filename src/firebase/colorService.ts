import { collection, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore"
import { db } from "./firebase"
import type { ColorType } from "../types"

export class ColorService {
    private static get collectionRef() {
        return collection(db, "colors")
    }

    static async setColor(color: ColorType): Promise<void> {
        const colorRef = doc(this.collectionRef, color.id)
        await setDoc(colorRef, {
            name: color.name,
            codes: color.codes
        })
    }

    static async seedColors(colors: ColorType[]): Promise<void> {
        for (const color of colors) {
            await this.setColor(color)
        }
    }

    static async getAllColors(): Promise<ColorType[]> {
        const snapshot = await getDocs(this.collectionRef)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            codes: doc.data().codes as [string, string]
        }))
    }

    static onColorChange(callback: (colors: ColorType[]) => void): () => void {
        return onSnapshot(this.collectionRef, (snapshot) => {
            const colors = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                codes: doc.data().codes as [string, string]
            }))
            callback(colors)
        })
    }
}