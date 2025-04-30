import {
    Chart,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    TooltipModel,
} from "chart.js"
import { colorsSignal, currencySignal } from "../../store/signal"
import { css, isDarkMode } from "../../utils"
import { AppNumber } from "../../utils/number"
import type { CategoryTotal } from "../../types"

type CustomChartData = { value: number; __raw: CategoryTotal }

const hostStyle = css`
    canvas {
        width: 13rem;
        height: 13rem;
        border-radius: 50%;
        box-shadow:
            0 0 0 6px var(--bg-doughnut),
            0 0 0 7px var(--border-doughnut)
        ;
    }
`

export class DoughnutChart extends HTMLElement {
    private renderRoot: ShadowRoot
    private canvasEl: HTMLCanvasElement
    private doughnutChart: Chart<'doughnut', CustomChartData[]> | null = null

    set list(list: CategoryTotal[]) {
        this.renderDoughnutChart(list)
    }

    constructor() {
        super()
        Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title)
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [hostStyle]
        this.canvasEl = document.createElement('canvas')
    }

    connectedCallback() {
        this.render()
    }

    distory() {
        if (this.doughnutChart) {
            this.doughnutChart.destroy()
            this.doughnutChart = null
        }
    }

    private render() {
        this.renderRoot.appendChild(this.canvasEl)
    }

    private async renderDoughnutChart(total: CategoryTotal[]) {
        if (this.doughnutChart) {
            this.doughnutChart.destroy()
            this.doughnutChart = null
        }
        const rawDataset = total
        const ctx = this.canvasEl

        const values = rawDataset.map(item => ({
            value: item.total,
            __raw: item
        }));

        const backgroundColors = rawDataset.map(item => this.getColor(item.category.color))

        const data = {
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderWidth: 0,
            }]
        }

        this.doughnutChart = new Chart<'doughnut', CustomChartData[]>(ctx, {
            type: 'doughnut',
            data,
            options: {
                responsive: true,
                cutout: '60%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false,
                        external: this.renderTooltip
                    }
                }
            }
        })
    }

    private renderTooltip(context: {
        chart: Chart;
        tooltip: TooltipModel<"doughnut">;
    }) {
        const tooltipModel = context.tooltip

        const containerEl = document.querySelector('.doughnut-container') as HTMLElement
        let tooltipEl = document.getElementById('chartjs-custom-tooltip') as HTMLDivElement | null

        if (!tooltipEl) {
            tooltipEl = document.createElement('div')
            tooltipEl.id = 'chartjs-custom-tooltip'
            containerEl.appendChild(tooltipEl)
        }

        if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0'
            return
        }

        const tooltipDataPoint = tooltipModel.dataPoints?.[0]
        if (!tooltipDataPoint) return

        const rawData = (tooltipDataPoint.raw as any).__raw as CategoryTotal
        if (!rawData) return

        tooltipEl.innerHTML = `
            <category-icon data-bg-color="${rawData.category.color}"
                icon="${rawData.category.icon}"
                width="32"
            ></category-icon>
            <div class="amount">${AppNumber.price(rawData.total, currencySignal.get())}</div>
        `;

        const tooltipWidth = tooltipEl.offsetWidth || 100
        const tooltipHeight = tooltipEl.offsetHeight || 40

        const caretX = tooltipModel.caretX
        const caretY = tooltipModel.caretY
        const placeOnLeft = caretX + tooltipWidth > context.chart.canvas.clientWidth

        tooltipEl.style.opacity = '1'
        tooltipEl.style.left = placeOnLeft
            ? `${caretX - (tooltipWidth * 0.15)}px`
            : `${caretX + (tooltipWidth * 0.5)}px`

        tooltipEl.style.top = `${caretY - (tooltipHeight / 2)}px`
    }

    private getColor(id: string) {
        const color = colorsSignal.get().find(c => c.id === id)
        if (!color) return ''
        return isDarkMode() ? color.codes[1] : color.codes[0]
    }
}

customElements.define('doughnut-chart', DoughnutChart)