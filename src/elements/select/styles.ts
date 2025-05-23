import { css } from "../../utils"

export const selectStyle = css`
    dialog {
        width: 92vw;
        max-width: 30rem;
        inset: auto 0 4vw;
        contain: content;

        border-radius: 2rem;
        background-color: var(--glass-bg);
        backdrop-filter: var(--glass-filter);
        font-family: var(--font-family);
        border: 1px solid var(--glass-border);

        &::backdrop {
            background-color: transparent;
            backdrop-filter: blur(1px) brightness(.9);
        }

        @media (display-mode: fullscreen), (display-mode: standalone) {
            inset-block-end: max(env(safe-area-inset-bottom, 0px), 4vw);
        }
    }
    .section {
        padding: var(--size-5) var(--size-4);
    }
    [data-icon-button] {
        padding: 0;
        border: none;
        background-color: transparent;
        color: var(--fg-primary);

        width: 44px;
        aspect-ratio: 1;
        /* background-color: var(--bg-accent); */
        background-color: var(--solid-bg);
        border-radius: 50%;

        display: grid;
        place-content: center;
        * {
            pointer-events: none;
        }
    }
    button[data-icon-button][data-button=done] {
        position: absolute;
        bottom: var(--size-2);
        right: var(--size-2);
        background-color: var(--solid-bg);
    }
`

export const optionStyle = css`
    :host {
        display: block;
        cursor: pointer;
        pointer-events: auto;
    }

    :host([selected]) {
        background-color: var(--highlight);
    }

    ::slotted(*) {
        pointer-events: none;
    }
`