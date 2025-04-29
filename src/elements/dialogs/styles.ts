import { css } from "../../utils"

export const hostStyles = css`
    * {
        box-sizing: border-box;
    }
    dialog {
        position: fixed;
        padding: 0;

        border: none;
        outline: none;
        background-color: var(--bg-primary);

        &::backdrop {
            background-color: light-dark(#3339, #1119);
            opacity: 0;
            transition: opacity .4s linear;
        }
        &[open] {
            &::backdrop {
                opacity: 1;
            }
        }
        @starting-style {
            &[open]::backdrop {
                opacity: 0;
            }
        }
        &.closing {
            &::backdrop {
                opacity: 0;
            }
        }
        section {
            display: grid;
            grid-template-columns: var(--layout-column);
        }
        ::slotted(*) {
            grid-column: body;
        }
    }

    ::slotted(header) {
        width: 100%;
        height: 60px;
    }
    ::slotted(footer) {
        position: sticky;
        bottom: 0;
        z-index: 5;
    }
`

export const pageStyles = css`
    dialog {
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        inset: 0;
    }
    section {
        min-height: calc(100svh - 180px);
    }
    @media (display-mode: fullscreen), (display-mode: standalone) {
        section {
            padding-block-end: 40px;
        }
        ::slotted(footer) {
            padding-block-end: 40px;
        }
    }
`

export const modalStyles = css`
    dialog {
        width: 100%;
        max-width: 100%;
        height: calc(100% - 20px);
        max-height: 100%;
        inset: 20px 0 0;
        border-radius: 1.5rem 1.5rem 0 0;
    }
    :host([data-half]) {
        dialog {
            height: auto;
            min-height: 200px;
            inset: auto 0 0;
        }
    }
    ::slotted(header) {
        border-radius: 1.5rem 1.5rem 0 0;
    }
    @media (display-mode: fullscreen), (display-mode: standalone) {
        section {
            padding-block-end: 40px;
        }
    }
`

export const actionStyles = css`
    dialog {
        width: 100%;
        max-width: clamp(0rem, 99vw, 30rem);
        max-height: 100%;
        inset: auto 0 0;
        border-radius: 0;
        background-color: transparent
    }
    section {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        gap: var(--size-2);
    }
    @media (display-mode: fullscreen), (display-mode: standalone) {
        section {
            padding-block-end: 40px;
        }
    }
`