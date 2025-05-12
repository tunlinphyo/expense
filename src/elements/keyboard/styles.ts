import { css } from "../../utils"

export const keyboardStyles = css`
    * {
        box-sizing: border-box;
    }
`

export const numberPadStyles = css`
    :host {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--size-2);
        padding: var(--size-2);

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

            * {
                pointer-events: none;
            }

            &.numberpad__key--clear {
                background-color: transparent;
                backdrop-filter: none;
                border: none;
            }
        }
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

        span:last-child {
            position: relative;

            &::after {
                content: '';
                display: block;
                position: absolute;
                top: 50%;
                right: 0;
                translate: 1px -50%;
                height: 38px;
                border-right: 2px solid var(--secondary);
            }
        }
    }
    .fade-input {
        width: 100%;
        height: 60px;
        font-family: var(--font-family);
        font-size: var(--text-2xl);
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 2px;
        
        &::before {
            content: attr(data-placeholder);
            position: absolute;
            display: block;
            pointer-events: none;
            opacity: .5;
        }

        &[data-has-value=true]::before {
            display: none;
        }
    }
`