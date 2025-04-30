import { css } from "../utils"

export const resetStyles = css`
    *, ::slotted(*) { box-sizing: border-box; }
    [data-icon-button],
    ::slotted([data-icon-button]) {
        padding: 0;
        border: none;
        background-color: transparent;
        color: var(--fg-primary);

        width: 40px;
        aspect-ratio: 1;
        background-color: var(--bg-accent);
        border-radius: 50%;

        display: grid;
        place-content: center;
    }

    [data-aria-only],
    ::slotted([data-aria-only]) {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }
`

export const inlineLoading = css`
    :host {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 30vh;
    }
`

export const appLoadingStyles = css`
    dialog {
        padding: var(--size-6);
        border-radius: 1.5rem;
        border: none;
        outline: none;
    }
`

export const loadingIcon = css`
    .loading {
        width: 40px;
        aspect-ratio: 1;
        border: 3px solid var(--primary);
        border-left-color: transparent;
        border-radius: 50%;
        animation: loading .6s linear infinite;
    }

    @keyframes loading {
        to {
            rotate: 360deg;
        }
    }
`
