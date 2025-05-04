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
        overflow-y: auto;
        overscroll-behavior: contain;

        scrollbar-width: none;
        overflow: auto;

        &::-webkit-scrollbar {
            display: none;
        }

        &::backdrop {
            background-color: var(--bg-backdrop);
            backdrop-filter: blur(10px) brightness(0.9);
            opacity: 0;
            transition: opacity .2s ease;

            /* background-image: radial-gradient( rgba(0,0,0,0) 1px, var(--bg-backdrop) 1px );
            background-size: 4px 4px;
            backdrop-filter: brightness(1) blur(5px); */
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
            padding-block-end: var(--size-7);
        }
        ::slotted(*) {
            grid-column: body;
        }
    }

    ::slotted(header) {
        width: 100%;
        min-height: 60px;
    }
    ::slotted(footer) {
        position: sticky;
        bottom: 0;
        z-index: 5;
    }
    @media (prefers-color-scheme: dark) {
        dialog {
            &::backdrop {
                backdrop-filter: blur(10px) brightness(1.2);
            }
        }
    }
`

export const pageStyles = css`
    dialog {
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        inset: 0;

        /* box-shadow: 0 -15px 0 var(--bg-primary); */
    }
    section {
        min-height: calc(100svh - 180px);
    }
    section {
        padding-block-end: var(--size-5);
    }
    ::slotted(footer) {
        padding-block-end: var(--size-5);
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
        max-width: clamp(0rem, 100vw, 35rem);
        height: auto;
        max-height: calc(100% - 20px);
        inset: auto 0 0;
        border-radius: 2rem 2rem 0 0;

        &::before {
            content: '';
            display: block;
            width: 4rem;
            height: 5px;
            border-radius: 5px;
            background-color: var(--gray);

            position: sticky;
            z-index: 9;
            top: 10px;
            left: 50%;
            translate: -50% 0;
        }

    }
    dialog.has-header {
        &::before {
            display: none;
        }
    }
    :host([undraggable]) {
        dialog::before {
            display: none;
        }
    }

    :host([data-half]) {
        dialog {
            max-width: clamp(0rem, 100vw, 30rem);
            min-height: 200px;
            max-height: 80vh;
            background-color: var(--bg-picker);
        }
    }
    ::slotted(header) {
        grid-area: header / edge;
        border-radius: 1.5rem 1.5rem 0 0;
    }
    @media (display-mode: fullscreen), (display-mode: standalone) {
        section {
            padding-block-end: 60px;
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

export const scrollModalStyles = css`
    dialog {
        width: 100%;
        max-width: clamp(0rem, 100vw, 35rem);
        height: auto;
        max-height: calc(100% - 20px);
        inset: auto 0 0;
        border-radius: 2rem 2rem 0 0;
        background-color: transparent;

        section {
            margin-block-start: 40vh;
            border-radius: 2rem;
            background-color: var(--bg-picker);
            position: relative;

            .touch-tracker {
                grid-column: body;
                display: block;
                width: 4rem;
                height: 5px;
                border-radius: 5px;
                background-color: var(--gray);

                position: sticky;
                z-index: 9;
                top: 10px;
                margin-top: 10px;
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
    }
    ::slotted(header) {
        grid-area: header / edge;
        border-radius: 1.5rem 1.5rem 0 0;
    }
    @media (display-mode: fullscreen), (display-mode: standalone) {
        section {
            padding-block-end: 60px;
        }
    }
`
