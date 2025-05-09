import './styles/style.css'

import './components'
import './elements'
import { appToast } from './components'

// import { CurrencyService } from './firebase/currencyService'
// import { DEFAULT_COLORS, DEFAULT_CURRENCY, DEFAULT_ICONS } from './data'
// import { ColorService } from './firebase/colorService'
// import { ColorType } from './types'
// import { IconService } from './firebase/iconService'

// import { appToast } from './components'
document.addEventListener('DOMContentLoaded', async () => {
    // await ColorService.seedColors(DEFAULT_COLORS as ColorType[])
    // await IconService.seedIcons(DEFAULT_ICONS)
    // await CurrencyService.seedCurrency(DEFAULT_CURRENCY)

    const total = document.querySelector('current-total')
    total?.addEventListener('click', () => {
        appToast.showMessage('Test success', 'check-circle')
        // appToast.showMessage('Test success')
        // appToast.showMessage('Test error', null, true)
    })
})