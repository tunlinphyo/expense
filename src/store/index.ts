import { loginModal, SplashScreen } from "../components"
import { AppService } from "../firebase/appService"
import { observeAuthState } from "../firebase/authService"
import { CategoryService } from "../firebase/categoryService"
import { ColorService } from "../firebase/colorService"
import { IconService } from "../firebase/iconService"
import { categorySignal, colorsSignal, currencySignal, iconsSignal, userSignal } from "./signal"


export const appStore = async () => {
    let appUnsubscribe: () => void
    let cateogryUnsubscribe: () => void
    let initLoaded = false

    const icons = await IconService.getAllIcons()
    iconsSignal.set(icons)

    const colors = await ColorService.getAllColors()
    colorsSignal.set(colors)

    observeAuthState(async (user) => {
        appUnsubscribe?.()
        cateogryUnsubscribe?.()

        removeSplash()
        if (!user) {
            return loginModal.openModal()
        }

        const userId = user.uid
        if (!initLoaded) {
            initLoaded = true
            categorySignal.set({})
        }

        userSignal.set(userId)
        getCategories(userId)

        const currency = await getCurrency(userId)
        if (currency) {
            currencySignal.set(currency)
        } else {
            await AppService.setField(userId, 'currency', currencySignal.get())
        }

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
    categorySignal.set(categoryMap)
}

function removeSplash() {
    const elem = document.getElementById('splashScreen') as SplashScreen
    if (elem) elem.removeSplash()
}
