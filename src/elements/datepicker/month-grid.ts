import { AppDate } from "../../utils/date"

export type MonthState = 'curr' | 'prev' | 'next'

export class MonthGrid extends HTMLElement {
    private readonly states: MonthState[] = ['prev', 'curr', 'next']
    private _state: MonthState = 'curr'
    private _renderMonth: string = ''

    static get observedAttributes() {
        return ['month', 'date']
    }

    get state(): MonthState {
        return this._state
    }
    set state(state: MonthState) {
        this._state = state
        this.setAttribute('data-state', state)
    }

    get dateString() {
        return this.getAttribute('date') || ''
    }

    get currMonth() {
        const attr = this.getAttribute('month')
        return attr ? new Date(attr) : new Date()
    }
    get prevMonth() {
        const d = this.currMonth
        return new Date(d.getFullYear(), d.getMonth() - 1, d.getDate())
    }
    get nextMonth() {
        const d = this.currMonth
        return new Date(d.getFullYear(), d.getMonth() + 1, d.getDate())
    }

    constructor() {
        super()
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'month' && oldValue !== newValue) {
            const date = this.getAttribute('date') || ''
            this.render(newValue, date)
        }
        if (name === 'date' && oldValue !== newValue) {
            const date = this.querySelector(`input[value="${newValue}"]`) as HTMLInputElement
            if (date) date.checked = true
        }
    }

    move(x: number) {
        const prefix = this.getPrefix()
        this.style.transition = 'none'
        this.style.translate = `calc(${prefix} + ${x}px) 0`
    }

    return(noAnimation: boolean = false) {
        const prefix = this.getPrefix()

        this.style.transition = noAnimation ? 'none' : 'translate .5s ease'
        this.style.translate = `${prefix} 0`
    }

    update(percantage: number) {
        const prefix = this.getPrefix()
        this.style.transition = 'translate .5s ease'
        this.style.translate = `calc(${prefix} + ${percantage}%) 0`

        const dir = percantage < 0 ? -1 : 1
        const onEnd = () => {
            const index = this.states.indexOf(this.state)
            let next = this.states[index + dir]
            if (!next) next = dir > 0 ? 'prev' : 'next'
            this.state = next
            this.return(true)
            this.removeEventListener('transitionend', onEnd)
        }

        this.addEventListener('transitionend', onEnd)
    }

    force(monthString: string) {
        const dateString = this.getAttribute('date') || ''
        this._renderMonth = monthString
        this.createDays(this._renderMonth, dateString)
    }

    private render(monthString: string, dateString: string) {
        const month = this.getYearMonth(monthString)
        if (month !== this._renderMonth) {
            this._renderMonth = month
            this.createDays(this._renderMonth, dateString)
        }
    }

    private getPrefix() {
        if (this.state === 'curr') return '0%'
        if (this.state === 'prev') return '-100%'
        if (this.state === 'next') return '100%'
    }

    private getYearMonth(monthString: string) {
        const date = new Date(monthString)
        const update = this.getNumberByState()
        const newD = new Date(date.getFullYear(), date.getMonth() + update, 1)
        return `${newD.getFullYear()}-${String(newD.getMonth() + 1).padStart(2, '0')}`
    }

    private getNumberByState() {
        if (this.state === 'prev') return -1
        if (this.state === 'next') return 1
        return 0
    }
    private createDays(dateString: string, selected: string) {
        const days = this.getDates(dateString)
        this.innerHTML = ''

        for (const day of days) {
            const dayEl = document.createElement("label")
            dayEl.className = 'cell'
            if (day) {
                const input = document.createElement('input')
                input.setAttribute('type', 'radio')
                input.setAttribute('name', 'selected-date')
                input.value = `${dateString}-${day.padStart(2, '0')}`
                if (selected && input.value == selected) {
                    input.checked = true
                }
                const today = AppDate.getLocalISODate()
                if (input.value === today) {
                    dayEl.dataset.today = 'true'
                }
                dayEl.textContent = day
                dayEl.appendChild(input)
            }
            this.appendChild(dayEl)
        }
    }

    private getDates(dateString: string): string[] {
        const d = new Date(dateString)
        const [year, month] = [d.getFullYear(), d.getMonth() + 1]
        const result = new Array(35).fill('');
        const firstDay = new Date(year, month - 1, 1);
        const startIndex = firstDay.getDay();

        const daysInMonth = new Date(year, month, 0).getDate();

        let index = startIndex;
        for (let day = 1; day <= daysInMonth; day++) {
            if (index < 35) {
                result[index] = day.toString();
            } else {
                for (let i = 0; i < startIndex; i++) {
                    if (result[i] === '') {
                        result[i] = day.toString();
                        break;
                    }
                }
            }
            index++;
        }

        return result;
    }
}

customElements.define('month-grid', MonthGrid)