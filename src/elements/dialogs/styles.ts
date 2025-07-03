import { css } from "../../utils"

export const hostStyles = css`
    * {
        box-sizing: border-box;
    }
    dialog {
        position: fixed;
        padding: 0;
        contain: content;

        border: none;
        outline: none;
        background-color: var(--bg-primary);
        will-change: transform, translate;
        overflow-y: auto;
        overscroll-behavior: contain;

        scrollbar-width: none;
        overflow: auto;
        isolation: isolate;

        transition: padding-block-end .3s ease;

        &::-webkit-scrollbar {
            display: none;
        }

        &::backdrop {
            background-color: var(--bg-backdrop);
            backdrop-filter: var(--dialog-filter);
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
        &.withKeyboard {
            padding-block-end: 270px;
            transition: none;
        }
        section {
            display: grid;
            grid-template-columns: var(--layout-column);
            padding-block-end: max(env(safe-area-inset-bottom, 0px), 4vw);
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

    .keyboardHost {
        position: sticky;
        bottom: 0;
        width: 100%;
        height: 10px;
        background: #f005;
        pointer-events: none;
        isolation: isolate;
    }
    /* @media (prefers-color-scheme: dark) {
        dialog {
            &::backdrop {
                backdrop-filter: blur(10px) brightness(1);
            }
        }
    } */
`

export const pageStyles = css`
    dialog {
        width: 100%;
        max-width: 100%;
        height: 100vh;
        max-height: 100vh;
        inset: 0;

        /* box-shadow: 0 -15px 0 var(--bg-primary); */
    }
    section {
        min-height: calc(100svh - 180px);
    }
    ::slotted(footer) {
        padding-block-end: max(env(safe-area-inset-bottom), var(--size-3));
    }
`

export const modalStyles = css`
    :host {
        --apple-top: max(env(safe-area-inset-top, 0px), 40px);
    }
    dialog {
        width: 100%;
        max-width: clamp(0rem, 100vw, 35rem);
        height: auto;
        max-height: calc(100vh - calc(var(--apple-top) + 5px));
        inset: auto 0 0;
        border-radius: 2rem 2rem 0 0;
        /* border: 1px solid light-dark(var(--white), var(--black)); */

        &::before {
            content: '';
            display: block;
            width: 4rem;
            height: 5px;
            border-radius: 5px;
            background-color: var(--fg-primary);

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
            --glass: light-dark(var(--white), var(--black));
            max-width: clamp(0rem, 100vw, 30rem);
            min-height: 200px;
            max-height: 80vh;

            border-radius: 2rem;
            background-color: var(--glass-bg);
            backdrop-filter: blur(40px);
            /* backdrop-filter: var(--glass-filter); */
            border: 1px solid var(--glass-border);
        }
    }
    ::slotted(header) {
        grid-area: header / edge;
        border-radius: 1.5rem 1.5rem 0 0;
    }
    @media (max-height: 650px) {
        dialog {
            max-height: 99.5vh;
        }
    }
    /* @media (display-mode: fullscreen), (display-mode: standalone) {
        section {
            padding-block-end: 60px;
        }
    } */
`

export const actionStyles = css`
    dialog {
        width: 100%;
        max-width: clamp(0rem, 99vw, 35rem);
        max-height: 100vh;
        inset: auto 0 0;
        border-radius: 0;
        background-color: transparent;
    }

    section {
        grid-column: body;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        gap: var(--size-2);
    }
`

export const scrollModalStyles = css`
    :host {
        --apple-top: max(env(safe-area-inset-top, 0px), 15px);
    }
    dialog {
        width: 100%;
        max-width: clamp(0rem, 100vw, 35rem);
        height: auto;
        max-height: calc(100vh - var(--apple-top) - 5px);
        inset: auto 0 0;
        border-radius: 2rem 2rem 0 0;
        background-color: transparent;

        section {
            margin-block: 40vh 0;
            border-radius: 2rem;
            background-color: var(--glass-bg);
            /* backdrop-filter: var(--glass-filter); */
            backdrop-filter: blur(40px);
            border: 1px solid var(--glass-border);
            position: relative;

            .touch-tracker {
                grid-column: body;
                display: block;
                width: 4rem;
                height: 5px;
                border-radius: 5px;
                background-color: var(--fg-primary);

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
    @media (max-height: 650px) {
        dialog {
            max-height: calc(100vh - var(--apple-top) + 10px);
        }
    }
    /* @media (display-mode: fullscreen), (display-mode: standalone) {
        section {
            padding-block-end: 60px;
        }
    } */
`
