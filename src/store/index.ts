import { AppService } from "../firebase/appService"
import { observeAuthState } from "../firebase/authService"
import { CategoryService } from "../firebase/categoryService"
import { ColorService } from "../firebase/colorService"
import { IconService } from "../firebase/iconService"
import { categorySignal, colorsSignal, currencySignal, iconsSignal, userSignal } from "./signal"


const initStore = async () => {
    let appUnsubscribe: () => void
    let cateogryUnsubscribe: () => void

    const icons = await IconService.getAllIcons()
    console.log('ICONS:::::::::::::::::::::::::::::::', icons)
    iconsSignal.set(icons)

    const colors = await ColorService.getAllColors()
    console.log('COLORS:::::::::::::::::::::::::::::::', colors)
    colorsSignal.set(colors)

    observeAuthState(async (user) => {
        const userId = user?.uid || 'guest'
        userSignal.set(userId)
        categorySignal.set({})

        const currency = await getCurrency(userId)
        if (currency) {
            currencySignal.set(currency)
        } else {
            await AppService.setField(userId, 'currency', currencySignal.get())
        }

        appUnsubscribe?.()
        cateogryUnsubscribe?.()
        
        appUnsubscribe = AppService.onFieldChange(userId, 'currency', currency => {
            if (currency) currencySignal.set(currency)
        })

        cateogryUnsubscribe = CategoryService.onCategoryChange(userId, () => {
            getCategories(userId)
        })
    })
}

async function getCurrency(userId: string) {
    const currency = await AppService.getField(userId, 'currency')
    console.log('CURRENCY:::::::::::::::::::::::::::::::', currency)
    if (currency) return currency.data as string
    return null
}

async function getCategories(userId: string) {
    const categories = await CategoryService.getAll(userId)
    const categoryMap = Object.fromEntries(
        categories.map(data => {
            return [data.id, data]
        })
    )
    console.log("CATEGORIES:::::::::::::::::::::::::::", categoryMap)
    categorySignal.set(categoryMap)
}

const appStore = initStore()
export { appStore }