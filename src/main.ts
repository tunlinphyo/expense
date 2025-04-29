import './styles/style.css'

import './components'
import './elements'
import { actionSheet } from './components'

document.addEventListener('DOMContentLoaded', () => {

    actionSheet.openSheet({
        title: 'Are you sure?',
        actions: [
            {
                buttonText: 'Yes',
                action: () => {
                    console.log("Yes Sir!")
                }
            },
            {
                buttonText: 'No',
                action: () => {
                    console.log("No Sir!")
                }
            }
        ]
    })
})