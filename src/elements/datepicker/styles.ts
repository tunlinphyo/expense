import { css } from "../../utils"

export const pickerStyle = css`
    :host {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--size-3);

        --glass: light-dark(var(--white), var(--black));
    }
    dialog {
        width: 100%;
        max-width: clamp(0rem, 99vw, 30rem);
        min-height: 300px;
        max-height: calc(100% - 20px);
        inset: auto 0 0;
        padding-block: var(--size-6);
        background-color: var(--bg-picker);
        border-radius: 2rem 2rem 0 0;

        border-radius: 2rem;
        background-color: var(--glass-bg);
        backdrop-filter: var(--glass-filter);
        border: 1px solid var(--glass-border);

        .touch-tracker {
            width: 2.5em;
            height: 5px;
            border-radius: 5px;
            background-color: var(--fg-primary);

            position: absolute;
            top: 10px;
            left: 50%;
            translate: -50% 0;

            &::before {
                content: '';
                display: block;
                position: absolute;
                inset: -30px -60px;
            }
        }
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
            display: flex;
            justify-content: center;
            align-items: center;
            gap: var(--size-2);
            height: 46px;
            border: none;
            color: var(--primary);
            font-family: var(--font-family);
            font-size: var(--text-md);
            font-weight: 500;
            text-transform: capitalize;
            padding-inline: var(--size-2);
            background-color: transparent;
            border-radius: var(--radius-5);
        }
    }
    @media (display-mode: fullscreen), (display-mode: standalone) {
        dialog {
            padding-block-end: 34px;
        }
    }
`

export const monthPickerStyle = css`
    dialog {
        & year-month {
            margin-block: var(--size-4);
        }
    }
`

export const datePickerStyle = css`
    dialog {
        padding-block-start: var(--size-8);
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

                width: 44px;
                aspect-ratio: 1;
                background-color: var(--solid-bg);
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
            font-weight: 500;
            font-family: var(--font-family);

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
    :where(.header, fieldset) {
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        &[aria-hidden=true] {
            opacity: 0;
            visibility: hidden;
        }
    }
    .cell {
        display: flex;
        justify-content: center;
        align-items: center;
        aspect-ratio: 1;
        position: relative;
        font-family: var(--font-family);

        &.cell-title {
            color: var(--fg-accent);
            text-transform: uppercase;
            font-size: var(--text-sm);
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
                color: var(--solid-bg);
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
        --bg: var(--glass-bg);
    }
    .picker {
        width: 100%;
        height: var(--h);
        position: relative;
        /* background-color: var(--bg); */
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
        height: 80px;
        left: 0;
        pointer-events: none;
    }
    .picker::before {
        top: 0;
        /* background-image: linear-gradient(to bottom, var(--bg), #0000); */
    }
    .picker::after {
        bottom: 0;
        /* background-image: linear-gradient(to top, var(--bg), #0000); */
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
        height: 34px;
        line-height: 34px;
        font-size: var(--text-lg);
        scroll-snap-align: center;
        text-align: left;
        color: light-dark(#555, #BBB);
        padding-inline: 20px;
        font-family: var(--font-family);
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
        inset: 0 var(--size-1);
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--glass-bg);
        border-radius: 2rem;
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
