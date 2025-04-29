import { currencySignal } from "../../store/signal"
import type { TotalExpense } from "../../types"
import {
    Chart,
    ArcElement,
    Legend,
    Title,

    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
} from "chart.js"
import { isDarkMode } from "../../utils"
import { AppNumber } from "../../utils/number"

export class OverviewLinechart extends HTMLElement {
    private renderRoot: ShadowRoot
    private canvasEl: HTMLCanvasElement
    private lineChart: Chart | null = null

    set list(list: TotalExpense[]) {
        this.renderLineChart(list)
    }

    constructor() {
        super()
        Chart.register(ArcElement, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Title)
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.canvasEl = document.createElement('canvas')
    }

    connectedCallback() {
        this.render()
    }

    distory() {
        if (this.lineChart) {
            this.lineChart.destroy()
            this.lineChart = null
        }
    }

    private render() {
        this.renderRoot.appendChild(this.canvasEl)
    }

    private renderLineChart(data: TotalExpense[]) {
        console.log('RENDER_LINECHART')
        if (this.lineChart) {
            this.lineChart.destroy();
            this.lineChart = null;
        }

        const ctx = this.canvasEl;

        // Sort and prepare labels and values
        const sorted = data.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
        const labels = sorted.map(item => item.id);
        const values = sorted.map(item => item.total);

        const chartColor = isDarkMode() ? '#409cff' : '#007aff';
        const gridColor = isDarkMode() ? '#333' : '#eee';
        const ticksColor = isDarkMode() ? '#f2f2f7' : '#3a3a3c';

        this.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Expenses',
                    data: values,
                    fill: false,
                    borderColor: chartColor,
                    backgroundColor: chartColor,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const value = context.parsed.y;
                                return `${AppNumber.price(value, currencySignal.get())}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: ticksColor
                        }
                    },
                    y: {
                        // beginAtZero: true,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: ticksColor
                        }
                    }
                }
            }
        });
    }
}

customElements.define('overview-linechart', OverviewLinechart)