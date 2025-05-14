import { css } from "../../utils"

export const resetStyles = css`
    * {
        box-sizing: border-box;
    }
`

export const numberPadStyles = css`
    :host {
        width: 100%;
        display: none;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--size-1);
        padding: var(--size-1);
        padding-block-end: var(--size-3);
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none;    /* Firefox */
        -ms-user-select: none;     /* IE/Edge */
        user-select: none;

        .textDisplay {
            min-height: 1.5rem;
            text-align: center;
            grid-column: span 3;
            font-weight: 500;
        }

        .numberpad__key {
            --glass: light-dark(var(--white), var(--gray-6));
            height: 46px;
            background-color: var(--solid-bg);
            backdrop-filter: var(--glass-filter);
            border: 1px solid var(--glass-border);
            border: none;
            border-radius: var(--radius-5);
            font-size: var(--text-lg);
            font-weight: 500;
            color: var(--fg-primary);
            user-select: none;
            transition: border-radius .1s ease;

            * {
                pointer-events: none;
            }

            &.numberpad__key--clear {
                background-color: transparent;
                backdrop-filter: none;
                border: none;
            }

            &[data-key="DELETE"] {
                color: var(--secondary);
            }

            &:active {
                border-radius: var(--radius-1);
                /* background-color: var(--gray-6); */
            }
            &[data-key="."]:active {
                background-color: var(--primary);
                color: var(--solid-bg);
            }
            &[data-key="DELETE"]:active {
                background-color: var(--secondary);
                color: var(--solid-bg);
            }

        }
    }
    :host([current-type=number]) {
        display: grid;
    }
`

export const textPadStyles = css`
    :host {
        width: 100%;
        display: none;
        flex-direction: column;
        align-items: center;
        padding: var(--size-1) 2px;
        padding-block-end: var(--size-3);
        gap: var(--size-2);
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none;    /* Firefox */
        -ms-user-select: none;     /* IE/Edge */
        user-select: none;

        .textDisplay {
            min-height: 1.5rem;
            text-align: center;
            font-weight: 500;
        }

        .row {
            width: 100%;
            display: grid;
            gap: 2px;

            &.row--one {
                grid-template-columns: repeat(10, 1fr);
            }
            &.row--two {
                width: 90%;
                grid-template-columns: repeat(9, 1fr);
            }
            &.row--three {
                grid-template-columns: 1.5fr repeat(7, 1fr) 1.5fr;
            }
            &.row--four {
                grid-template-columns: .2fr 46px 1fr 46px .2fr;
            }
            &.row--five {
                grid-template-columns: .5fr 1fr .5fr;
                gap: var(--size-2);
            }
        }

        .textpad__key {
            --glass: light-dark(var(--white), var(--gray-6));
            height: 46px;
            background-color: var(--solid-bg);
            backdrop-filter: var(--glass-filter);
            border: 1px solid var(--glass-border);
            border: none;
            border-radius: var(--radius-5);
            font-size: var(--text-xl);
            font-weight: 400;
            color: var(--fg-primary);
            padding: 0;
            user-select: none;

            display: flex;
            justify-content: center;
            align-items: center;

            transition: scale .15s ease;
            transform-origin: bottom center;

            &[data-popup]:active {
                scale: 2;
                position: relative;
                z-index: 2;
                /* background-color: var(--gray-6); */
            }

            * {
                pointer-events: none;
            }

            &.textpad__key--clear {
                background-color: transparent;
                backdrop-filter: none;
                border: none;
            }

            &.textpad__key--delete {
                padding-inline-end: 2px;
                background-color: var(--secondary);
                color: var(--solid-bg);
            }

            &:where([data-key="NUMBER"], [data-key="ENTER"]) {
                text-transform: uppercase !important;
                font-size: var(--text-base);
                background-color: transparent;
                backdrop-filter: none;
                border: 2px solid var(--solid-bg);
            }

            &:where([data-key="ENTER"]) {
                text-transform: lowercase !important;
            }

            &:where([data-key="$"]) {
                background-color: var(--primary);
                color: var(--solid-bg);
            }
        }
    }
    :host([current-type=text]),
    :host([current-type=textarea]) {
        display: flex;
    }
    :host([caplock=true]) .textpad__key {
        text-transform: uppercase;
    }
    :host([caplock=true]) .textpad__key--cap {
        background-color: var(--solid-fg);
        color: var(--solid-bg);
    }
`

export const inputStyles = css`
    * {
        box-sizing: border-box;
    }
    :host {
        display: inline-block;
        outline: 2px solid transparent;
        outline-offset: -2px;
        transition: .3s ease;
    }
    :host([data-index]) {
        outline-color: var(--secondary);
        outline-offset: 2px;

        /* span:last-child, */
        span[data-active=true] {
            position: relative;

            &::after {
                content: '';
                display: block;
                position: absolute;
                top: 50%;
                right: 0;
                translate: 1px -50%;
                height: var(--caret-height);
                border-right: var(--caret-width) solid var(--secondary);
                animation: blink 1s steps(1) infinite;
            }
        }
    }
    .fade-input {
        --caret-width: 2px;
        --caret-height: 42px;
        width: 100%;
        height: 60px;
        font-family: var(--font-family);
        font-size: var(--text-xl);
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;

        &::before {
            content: attr(data-placeholder);
            position: absolute;
            display: block;
            pointer-events: none;
            color: var(--solid-fg);
            opacity: .3;
        }

        &[data-has-value=true]::before {
            display: none;
        }

        & span[data-active] {
            display: inline-block;
            min-height: 1em;
        }

        & span.space {
            color: transparent;
        }

        & span[data-placeholder] {
            color: transparent;
        }

        &.number {
            padding-top: 2px;
            font-size: var(--text-2xl);
        }
    }
    @keyframes blink {
        0%, 50% { opacity: 1; }
        50.01%, 100% { opacity: 0; }
    }
`

export const textareaStyles = css`
    :host([data-index]) {
        span[data-initial] {
            position: relative;

            &::before {
                content: '';
                display: block;
                position: absolute;
                top: 50%;
                left: 0;
                translate: 0 -50%;
                height: var(--caret-height);
                border-right: var(--caret-width) solid var(--secondary);
                animation: blink 1s steps(1) infinite;
            }
        }
    }
    .fade-input {
        --caret-height: 1.5em;
        min-height: 120px;
        display: block;
        font-size: var(--text-base);
        font-weight: normal;
        overflow-y: auto;

        & span[data-initial] {
            color: transparent;
        }
    }
`