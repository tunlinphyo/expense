import { css } from "../../utils"

export const pickerStyle = css`
    :host {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    dialog {
        width: 100%;
        max-width: clamp(0rem, 99vw, 30rem);
        min-height: 300px;
        max-height: calc(100% - 20px);
        inset: auto 0 0;
        border-radius: 1.5rem 1.5rem 0 0;
        padding-block-start: var(--size-4);
        background-color: var(--bg-picker);
    }
    header {
        padding-inline: var(--size-4);
    }
    footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-inline: var(--size-4);

        :where(button) {
            height: 40px;
            border: none;
            background-color: transparent;
            color: var(--primary);
            font-size: var(--text-md);
            text-transform: capitalize;
            padding-inline: var(--size-2);
        }
    }
    @media (display-mode: fullscreen), (display-mode: standalone) {
        dialog {
            padding-block-end: 34px;
        }
    }
`

export const calendarStyle = css`
    * { box-sizing: border-box; }
    header {
        height: 42px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-inline: var(--size-3);

        .btn-group {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: var(--size-2);
            transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;

            :where([data-button=prev], [data-button=next]) {
                padding: 0;
                border: none;
                background-color: transparent;
                color: var(--primary);

                width: 40px;
                aspect-ratio: 1;
                background-color: var(--bg-accent);
                border-radius: 50%;

                display: grid;
                place-content: center;
            }
        }

        & button[data-button='month-toggle'] {
            font-size: var(--text-md);
            background: transparent;
            border: none;
            color: var(--fg-primary);

            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: var(--size-2);

            :where(svg-icon) {
                color: var(--primary);
                transition: transform 0.2s ease-in-out;
            }

            &[data-toggle=on] {
                :where(svg-icon) {
                    transform: rotate(90deg);
                }
                & + .btn-group {
                    opacity: 0;
                    pointer-events: none;
                    visibility: hidden
                }
            }
        }
    }
    .header,
    month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding-inline: var(--size-3);
        box-sizing: border-box;
    }
    .cell {
        display: flex;
        justify-content: center;
        align-items: center;
        aspect-ratio: 1;
        position: relative;

        &.cell-title {
            color: var(--fg-accent);
            text-transform: uppercase;
            font-size: var(--text-xs);
            font-weight: bold;
        }

        &:not(.cell-title) {
            font-size: var(--text-lg);
            border-radius: 50%;
        }

        input {
            display: none;
        }

        &::before {
            content: '';
            display: block;
            background-color: var(--highlight);
            position: absolute;
            z-index: -1;
            inset: 4px;
            border-radius: 50%;
            scale: 0;
            transition: scale 0.2s ease-in-out;
        }

        &[data-today=true] {
            color: var(--primary);
            font-weight: 600;

            &::before {
                background-color: var(--primary);
            }
        }
        &:has(input:checked) {
            color: var(--primary);
            font-weight: 600;

            &::before {
                scale: 1;
            }

            &[data-today=true] {
                color: var(--bg-card);
            }
        }
    }
    fieldset {
        border: none;
        padding: 0;
        margin: 0;
        position: relative;
        overflow: hidden;

        display: grid;
        grid-template-areas: "view";
        padding-block-end: var(--size-3);

        & month-grid {
            grid-area: view;

            &[data-state=prev] {
                translate: -100% 0;
            }
            &[data-state=next] {
                translate: 100% 0;
            }
        }
    }
`

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
        overflow-y: scroll;
        scroll-snap-type: y mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .picker-scroll::-webkit-scrollbar {
        display: none;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: calc(var(--h) * 0.5) 0;
    }
    li {
        height: 32px;
        line-height: 32px;
        font-size: var(--text-lg);
        scroll-snap-align: center;
        text-align: left;
        color: #888;
        padding-inline: 20px;
        font-variant-numeric: tabular-nums lining-nums;
    }
`

export const calendarBodyStyle = css`
    :host {
        display: block;
        position: relative
    }
    .year-month-container {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-picker);
        z-index: 1;
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;

        &[aria-hidden=false] {
            opacity: 1;
            pointer-events: auto;
            visibility: visible;
        }
        &[aria-hidden=true] {
            opacity: 0;
            pointer-events: none;
            visibility: hidden;
        }
    }
`
