import './styles/style.css'

import './components'
import './elements'
import { appToast } from './components'
import { isAndroid } from './utils/index';
import { LocalBiometricAuth } from './utils/biometric'
import { showBiometric } from './store'

// import { CurrencyService } from './firebase/currencyService'
// import { DEFAULT_COLORS, DEFAULT_CURRENCY, DEFAULT_ICONS } from './data'
// import { ColorService } from './firebase/colorService'
// import { ColorType } from './types'
// import { IconService } from './firebase/iconService'

// import { appToast } from './components'
let wasHiddenByUser: Boolean = false
document.addEventListener('DOMContentLoaded', async () => {
    // await ColorService.seedColors(DEFAULT_COLORS as ColorType[])
    // await IconService.seedIcons(DEFAULT_ICONS)
    // await CurrencyService.seedCurrency(DEFAULT_CURRENCY)

    const android = isAndroid()
    if (android) {
        document.documentElement.setAttribute('data-android', '')
    }

    const total = document.querySelector('current-total')
    total?.addEventListener('click', async () => {
        appToast.showMessage('Test success', 'check-circle')
        // appToast.showMessage('Test success')
        // appToast.showMessage('Test error', null, true)
    })

    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'hidden') {
            wasHiddenByUser = true
            LocalBiometricAuth.lastAuth = new Date()
        }
        if (document.visibilityState === 'visible') {
            if (wasHiddenByUser) {
                wasHiddenByUser = false
                const isNeed = await LocalBiometricAuth.isNeedToAuth()
                if (isNeed) showBiometric()
            }
        }
    })
})