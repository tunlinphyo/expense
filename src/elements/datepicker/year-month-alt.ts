import { css } from "../../utils"

export const yearMonthStyle = css`
    :host {
        width: 100%;
        display: flex;
        justify-content: center;
        --h: 240px;
        --scope-h: 40px;
        --bg: var(--bg-picker);
    }
    .picker {
        width: 100%;
        height: var(--h);
        position: relative;
        background-color: var(--bg);
        display: flex;
        justify-content: center;
        padding-inline: var(--size-3);
        border-radius: var(--radius-3);
        overflow: hidden;
    }
    .picker::before,
    .picker::after {
        content: '';
        display: block;
        position: absolute;
        width: 100%;
        height: 50px;
        left: 0;
        pointer-events: none;
    }
    .picker::before {
        top: 0;
        background-image: linear-gradient(to bottom, var(--bg), #0000);
    }
    .picker::after {
        bottom: 0;
        background-image: linear-gradient(to top, var(--bg), #0000);
    }
    .scope {
        content: '';
        display: block;
        position: absolute;
        inset: calc((var(--h) - var(--scope-h)) * 0.5) var(--size-3);
        z-index: 1;
        pointer-events: none;
        border-radius: 10px;
        background-color: light-dark(#000, #fff);
        mix-blend-mode: overlay;
    }
    .picker-scroll {
        height: 100%;
        /* overflow-y: scroll;
        scroll-snap-type: y mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none; */

        &.month-picker {
            width: 160px;
        }
        &.year-picker {
            width: 100px;
        }
    }
    .picker-scroll::-webkit-scrollbar {
        display: none;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;

        position: relative;

        display: flex;
        justify-content: center;
        align-items: center;
    }
    li {
        height: 40px;
        line-height: 40px;
        font-size: var(--text-lg);
        text-align: left;
        color: #888;
        background-color: var(--bg);
        padding-inline: 20px;
        font-variant-numeric: tabular-nums lining-nums;

        position: absolute;
        inset: auto 0;
    }
`

export class YearMonthAlt extends HTMLElement {
    private intersectionObserver?: IntersectionObserver
    private renderRoot: ShadowRoot
    private yearScroll: HTMLElement
    private monthScroll: HTMLElement
    private yearTimeout: number | undefined
    private monthTimeout: number | undefined

    private monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    private monthes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    private years = Array.from({ length: 100 }, (_, i) => String(2020 + i))

    private _renderDone: boolean = false

    static get observedAttributes() {
        return ['year', 'month']
    }

    get value() {  
        const year = this.getAttribute('year')
        const month = this.getAttribute('month')
        return `${year}-${month}`
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [yearMonthStyle]

        this.yearScroll = this.populatePicker('year-picker', this.years)
        this.monthScroll = this.populatePicker('month-picker', this.monthLabels)

        this.onYearScroll = this.onYearScroll.bind(this)
        this.onMonthScroll = this.onMonthScroll.bind(this)
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (this._renderDone && name === 'year' && oldValue != newValue) {
            this.yearScrollTo(newValue, 'smooth')
            this.updateAriaSelection(this.yearScroll, newValue)
        }
        if (this._renderDone && name === 'month' && oldValue != newValue) {
            this.monthScrollTo(newValue, 'smooth')
            this.updateAriaSelection(this.monthScroll, newValue)
        }
    }

    connectedCallback() {
        this.render()

        this.intersectionObserver = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    this.initPosition()
                    this._renderDone = true
                    requestAnimationFrame(() => {
                        this.monthScroll.addEventListener('scroll', this.onMonthScroll)
                        this.yearScroll.addEventListener('scroll', this.onYearScroll)
                    })
                    this.intersectionObserver?.disconnect()
                    break
                }
            }
        }, { threshold: 0 }) // You can tweak the threshold

        this.intersectionObserver.observe(this)
    }

    disconnectedCallback() {
        this.intersectionObserver?.disconnect()
        this.monthScroll.removeEventListener('scroll', this.onMonthScroll)
        this.yearScroll.removeEventListener('scroll', this.onYearScroll)
    }

    setToday() {
        const d = new Date()
        const year = String(d.getFullYear())
        const month = String(d.getMonth() + 1).padStart(2, '0')
        this.monthScrollTo(month, 'smooth')
        this.yearScrollTo(year, 'smooth')
    }

    private render() {
        const picker = document.createElement('div')
        picker.classList.add('picker')

        const scope = document.createElement('div')
        scope.classList.add('scope')

        picker.appendChild(this.monthScroll)
        picker.appendChild(this.yearScroll)
        picker.appendChild(scope)

        this.renderRoot.appendChild(picker)
    }

    private initPosition() {
        const year = this.getAttribute('year')
        if (year) this.yearScrollTo(year)
        const month = this.getAttribute('month')
        if (month) this.monthScrollTo(month)
    }

    private populatePicker(id: string, items: (string | number)[]) {
        const scrollEl = document.createElement('div')
        scrollEl.className = `picker-scroll ${id}`

        const ul = document.createElement('ul')
        ul.id = id
        ul.setAttribute('role', 'listbox')

        items.forEach((item, index) => {
            const li = document.createElement('li')
            li.textContent = item.toString()
            li.dataset.value = id == "month-picker"
                ? this.monthes[index]
                : item.toString()
            li.dataset.index = index.toString()
            li.setAttribute('role', 'option')
            li.setAttribute('aria-selected', 'false')
            ul.appendChild(li)
        })

        scrollEl.appendChild(ul)
        return scrollEl
    }

    // private yearScrollTo(year: string, behavior: 'instant' | 'smooth' = 'instant') {
    //     const yearEl = this.yearScroll.querySelector(`li[data-value="${year}"]`)
    //     if (yearEl) {
    //         requestAnimationFrame(() => {
    //             yearEl.scrollIntoView({ behavior, block: 'center' })
    //         })
    //     }
    // }
    // private monthScrollTo(month: string, behavior: 'instant' | 'smooth' = 'instant') {
    //     const monthEl = this.monthScroll.querySelector(`li[data-value="${month}"]`)
    //     if (monthEl) {
    //         requestAnimationFrame(() => {
    //             monthEl.scrollIntoView({ behavior, block: 'center' })
    //         })
    //     }
    // }

    private yearScrollTo(year: string, behavior: 'instant' | 'smooth' = 'instant') {
        const yearEl = this.yearScroll.querySelector<HTMLElement>(`li[data-value="${year}"]`)
        if (yearEl) {
            requestAnimationFrame(() => {
                const scrollEl = this.yearScroll
                const targetTop = yearEl.offsetTop - (scrollEl.clientHeight / 2) + (yearEl.clientHeight / 2)
                scrollEl.scrollTo({
                    top: targetTop,
                    behavior,
                })
            })
        }
    }
    
    private monthScrollTo(month: string, behavior: 'instant' | 'smooth' = 'instant') {
        const monthEl = this.monthScroll.querySelector<HTMLElement>(`li[data-value="${month}"]`)
        if (monthEl) {
            requestAnimationFrame(() => {
                const scrollEl = this.monthScroll
                const targetTop = monthEl.offsetTop - (scrollEl.clientHeight / 2) + (monthEl.clientHeight / 2)
                scrollEl.scrollTo({
                    top: targetTop,
                    behavior,
                })
            })
        }
    }

    private onMonthScroll() {
        clearTimeout(this.monthTimeout)
        this.monthTimeout = window.setTimeout(() => {
            const month = this.getCenterIndex(this.monthScroll)
            const year = this.getAttribute('year')
            if (!(year && month)) return

            this.setAttribute('month', month)
            this.dispatchEvent(new CustomEvent('change', {
                detail: `${year}-${month}`,
                bubbles: true,
                cancelable: true,
            }))
        }, 300)
    }


    private onYearScroll() {
        clearTimeout(this.yearTimeout)
        this.yearTimeout = window.setTimeout(() => {
            const year = this.getCenterIndex(this.yearScroll)
            const month = this.getAttribute('month')
            if (!(year && month)) return

            this.setAttribute('year', year)
            this.dispatchEvent(new CustomEvent('change', {
                detail: `${year}-${month}`,
                bubbles: true,
                cancelable: true,
            }))
        }, 300)
    }

    // private getCenterIndex(scrollEl: HTMLElement): string {
    //     const items = Array.from(scrollEl.querySelectorAll('li'))
    //     const scrollTop = scrollEl.scrollTop
    //     const centerY = scrollTop + (scrollEl.clientHeight / 2)
    
    //     for (const li of items) {
    //         if (!li.dataset.value) continue
    
    //         const liTop = li.offsetTop
    //         const liBottom = liTop + li.offsetHeight
    
    //         if (liTop <= centerY && liBottom >= centerY) {
    //             return li.dataset.value || ''
    //         }
    //     }
    
    //     return ''
    // }

    private getCenterIndex(scrollEl: HTMLElement): string {
        const items = Array.from(scrollEl.querySelectorAll('li'))
        const scrollCenter = scrollEl.scrollTop + (scrollEl.clientHeight / 2)
    
        for (const li of items) {
            if (!li.dataset.value) continue
    
            const liTop = li.offsetTop
            const liBottom = liTop + li.offsetHeight
    
            if (liTop <= scrollCenter && liBottom >= scrollCenter) {
                return li.dataset.value || ''
            }
        }
    
        return ''
    }

    private updateAriaSelection(scrollContainer: HTMLElement, selected: string) {
        const items = scrollContainer.querySelectorAll(`li[role="option"]`)
        items.forEach((el) => {
            el.setAttribute('aria-selected', el.getAttribute('data-value') === selected ? 'true' : 'false')
        })
    }
}

customElements.define('year-month-alt', YearMonthAlt)