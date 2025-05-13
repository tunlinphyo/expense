import { resetStyles, textPadStyles } from "./styles"
import { ContextConsumer } from "../../context"
import { keyboardContext } from "../../store/context"
import type { KeyboardContext } from "../../types"
import { CustomInput } from "./input"
import { html } from "../../utils"

export class TextPad extends HTMLElement {
    private consumer: ContextConsumer<KeyboardContext>
    private renderRoot: ShadowRoot
    private textDisplay: HTMLElement

    private mainRows: Array<HTMLElement>
    private numberRows: Array<HTMLElement>
    private bottomRow: HTMLElement
    private textareaRow: HTMLElement

    private capLock: boolean = true
    private numPad: boolean = false
    private currentText: string = ''

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [resetStyles, textPadStyles]
        this.consumer = new ContextConsumer<KeyboardContext>(this, keyboardContext)
        this.textDisplay = document.createElement('div')
        this.textDisplay.className = 'textDisplay'
        this.mainRows = this.createMainRows()
        this.numberRows = this.createNumRoles()
        this.bottomRow = this.crateBottomRow() 
        this.textareaRow = this.crateTextareaRow()

        this.onClick = this.onClick.bind(this)

        this.render()
    }

    connectedCallback() {
        this.setAttribute('caplock', this.capLock.toString())
        this.renderRoot.addEventListener('pointerdown', this.onClick)

        // this.type = this.getAttribute('current-type') || ''
        this.currentText = ''

        this.consumer.subscribe((context) => {
            if (context.type === 'number') return
            if (context.status === 'open') {
                if (context.type === 'text') {
                    const focusEl = context.focusElem as CustomInput
                    if (focusEl) {
                        this.toggleCapLock(!focusEl.value || focusEl.value.endsWith(' '))
                        if (context.key === 'DELETE') {
                            this.currentText = focusEl.lastValue
                            this.textDisplay.textContent = this.currentText
                        }
                    }
                    this.bottomRow.style.display = 'grid'
                    this.textareaRow.style.display = 'none'
                    if (this.numPad) this.toggleNumpad(false)
                }
                if (context.type === 'textarea') {
                    const focusEl = context.focusElem as CustomInput
                    if (focusEl) {
                        this.toggleCapLock(
                            !focusEl.value 
                            || focusEl.value.endsWith('. ') 
                            || focusEl.value.endsWith('! ') 
                            || focusEl.value.endsWith('? ')
                            || focusEl.value.endsWith('\n')
                        )
                        if (context.key === 'DELETE') {
                            this.currentText = focusEl.lastValue
                            this.textDisplay.textContent = this.currentText
                        }
                    }
                    this.bottomRow.style.display = 'none'
                    this.textareaRow.style.display = 'grid'
                }
            } else {
                console.log('ESCAPING')
                this.currentText = ''
                this.textDisplay.textContent = this.currentText
            }
        })

    }

    disconnectedCallback() {
        this.consumer.unsubscribe()
        this.renderRoot.removeEventListener('pointerdown', this.onClick)
    }

    private render() {
        this.renderRoot.appendChild(this.textDisplay)
        for(const row of this.mainRows) {
            this.renderRoot.appendChild(row)
        }
        for(const row of this.numberRows) {
            this.renderRoot.appendChild(row)
        }
        this.renderRoot.appendChild(this.bottomRow)
        this.renderRoot.appendChild(this.textareaRow)
        this.renderRows(this.numPad)
        this.bottomRow.style.display = 'grid'
        this.textareaRow.style.display = 'none'
    }

    private createMainRows() {
        const rowOne = this.createRow('one')
        const rowTwo = this.createRow('two')
        const rowThree = this.createRow('three')

        rowOne.appendChild(html`
            <button type="button" class="textpad__key" data-popup data-key="q">q</button>
            <button type="button" class="textpad__key" data-popup data-key="w">w</button>
            <button type="button" class="textpad__key" data-popup data-key="e">e</button>
            <button type="button" class="textpad__key" data-popup data-key="r">r</button>
            <button type="button" class="textpad__key" data-popup data-key="t">t</button>
            <button type="button" class="textpad__key" data-popup data-key="y">y</button>
            <button type="button" class="textpad__key" data-popup data-key="u">u</button>
            <button type="button" class="textpad__key" data-popup data-key="i">i</button>
            <button type="button" class="textpad__key" data-popup data-key="o">o</button>
            <button type="button" class="textpad__key" data-popup data-key="p">p</button>
        `)

        rowTwo.appendChild(html`
            <button type="button" class="textpad__key" data-popup data-key="a">a</button>
            <button type="button" class="textpad__key" data-popup data-key="s">s</button>
            <button type="button" class="textpad__key" data-popup data-key="d">d</button>
            <button type="button" class="textpad__key" data-popup data-key="f">f</button>
            <button type="button" class="textpad__key" data-popup data-key="g">g</button>
            <button type="button" class="textpad__key" data-popup data-key="h">h</button>
            <button type="button" class="textpad__key" data-popup data-key="j">j</button>
            <button type="button" class="textpad__key" data-popup data-key="k">k</button>
            <button type="button" class="textpad__key" data-popup data-key="l">l</button>
        `)

        rowThree.appendChild(html`
            <button type="button" class="textpad__key textpad__key--cap" data-popup data-key="CAP">
                <svg-icon name="up" size="20"></svg-icon>
            </button>
            <button type="button" class="textpad__key" data-popup data-key="z">z</button>
            <button type="button" class="textpad__key" data-popup data-key="x">x</button>
            <button type="button" class="textpad__key" data-popup data-key="c">c</button>
            <button type="button" class="textpad__key" data-popup data-key="v">v</button>
            <button type="button" class="textpad__key" data-popup data-key="b">b</button>
            <button type="button" class="textpad__key" data-popup data-key="n">n</button>
            <button type="button" class="textpad__key" data-popup data-key="m">m</button>
            <button type="button" class="textpad__key textpad__key--delete" data-popup data-key="DELETE">
                <svg-icon name="delete-key" size="22"></svg-icon>
            </button>
        `)

        return [rowOne, rowTwo, rowThree]
    }

    private createNumRoles() {
        const rowOne = this.createRow('one')
        const rowTwo = this.createRow('one')
        const rowThree = this.createRow('three')

        rowOne.appendChild(html`
            <button type="button" class="textpad__key" data-popup data-key="1">1</button>
            <button type="button" class="textpad__key" data-popup data-key="2">2</button>
            <button type="button" class="textpad__key" data-popup data-key="3">3</button>
            <button type="button" class="textpad__key" data-popup data-key="4">4</button>
            <button type="button" class="textpad__key" data-popup data-key="5">5</button>
            <button type="button" class="textpad__key" data-popup data-key="6">6</button>
            <button type="button" class="textpad__key" data-popup data-key="7">7</button>
            <button type="button" class="textpad__key" data-popup data-key="8">8</button>
            <button type="button" class="textpad__key" data-popup data-key="9">9</button>
            <button type="button" class="textpad__key" data-popup data-key="0">0</button>
        `)

        rowTwo.appendChild(html`
            <button type="button" class="textpad__key" data-popup data-key="-">-</button>
            <button type="button" class="textpad__key" data-popup data-key="/">/</button>
            <button type="button" class="textpad__key" data-popup data-key=":">:</button>
            <button type="button" class="textpad__key" data-popup data-key=";">;</button>
            <button type="button" class="textpad__key" data-popup data-key="(">(</button>
            <button type="button" class="textpad__key" data-popup data-key=")">)</button>
            <button type="button" class="textpad__key" data-popup data-key="'">'</button>
            <button type="button" class="textpad__key" data-popup data-key="&">&</button>
            <button type="button" class="textpad__key" data-popup data-key="@">@</button>
            <button type="button" class="textpad__key" data-popup data-key="%">%</button>
        `)

        rowThree.appendChild(html`
            <button type="button" class="textpad__key" data-popup data-key="$">$</button>
            <button type="button" class="textpad__key" data-popup data-key="€">€</button>
            <button type="button" class="textpad__key" data-popup data-key="£">£</button>
            <button type="button" class="textpad__key" data-popup data-key="¥">¥</button>
            <button type="button" class="textpad__key" data-popup data-key=",">,</button>
            <button type="button" class="textpad__key" data-popup data-key=".">.</button>
            <button type="button" class="textpad__key" data-popup data-key="!">!</button>
            <button type="button" class="textpad__key" data-popup data-key="?">?</button>
            <button type="button" class="textpad__key textpad__key--delete" data-popup data-key="DELETE">
                <svg-icon name="delete-key" size="22"></svg-icon>
            </button>
        `)

        return [rowOne, rowTwo, rowThree]
    }

    private crateBottomRow() {
        const rowEl = this.createRow('four')
        rowEl.appendChild(html`
            <div></div>
            <button type="button" class="textpad__key" data-key="#">#</button>
            <button type="button" class="textpad__key" data-key="SPACE"></button>
            <button type="button" class="textpad__key" data-key="&">&</button>
            <div></div>
        `)

        return rowEl
    }
    private crateTextareaRow() {
        const rowEl = this.createRow('five')
        rowEl.appendChild(html`
            <button type="button" class="textpad__key" data-key="NUMBER">123</button>
            <button type="button" class="textpad__key" data-key="SPACE"></button>
            <button type="button" class="textpad__key" data-key="ENTER">return</button>
        `)

        return rowEl
    }

    private createRow(row: 'one' | 'two' | 'three' | 'four' | 'five') {
        const elem = document.createElement('div')
        elem.className = `row row--${row}`
        return elem
    }

    private onClick(e: Event) {
        const target = e.target as HTMLButtonElement
        if (target.hasAttribute('data-key')) {
            const key = target.dataset.key
            if (key === 'CAP') {
                this.toggleCapLock()
            } else if (key === 'NUMBER') {
                this.toggleNumpad()
            } else if (key) {
                let keyString = key
                if (this.capLock) {
                    this.toggleCapLock()
                    keyString = key.toUpperCase()
                }

                if (['SPACE', 'ENTER'].includes(key)) this.currentText = ''
                else if (key !== 'DELETE') this.currentText += keyString

                this.textDisplay.textContent = this.currentText
                this.dispatchEvent(new CustomEvent('key-press', {
                    detail: keyString,
                    bubbles: true,
                    composed: true,
                }))
            }
        }
    }

    private toggleCapLock(status?: boolean) {
        this.capLock = status !== undefined ? status : !this.capLock
        this.setAttribute('caplock', this.capLock.toString())
    }

    private toggleNumpad(status?: boolean) {
        this.numPad = status !== undefined ? status : !this.numPad
        this.setAttribute('numpad', this.numPad.toString())
        const btn = this.textareaRow.querySelector('.textpad__key[data-key=NUMBER]')
        if (btn) btn.textContent = this.numPad ? 'ABC' : '123'
        this.renderRows(this.numPad)
    }

    private renderRows(isNumber: boolean) {
        if (isNumber) {
            this.mainRows.forEach(elem => elem.style.display = 'none')
            this.numberRows.forEach(elem => elem.style.display = 'grid')
        } else {
            this.mainRows.forEach(elem => elem.style.display = 'grid')
            this.numberRows.forEach(elem => elem.style.display = 'none')
        }
    }
 }

customElements.define('text-pad', TextPad)