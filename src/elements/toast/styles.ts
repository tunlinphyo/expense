import { css } from "../../utils"

export const popoverStyles = css`
    :host {
        --apple-top: max(env(safe-area-inset-top, 0px), 10px);
        padding: 0;
        border-radius: var(--radius-4);
        border: none;
        position: absolute;
        inset: auto;
        margin: 0;
        top: 0;
        left: 50%;
        /* box-shadow: var(--shadow-4); */
        background-color: var(--glass-bg);
        backdrop-filter: var(--glass-filter);
        border: 1px solid var(--glass-border);
        font-family: var(--font-family);

        transform: translate(-50%, calc(var(--apple-top) - 50px)) translateZ(0);
        opacity: 0;

        transition-behavior: allow-discrete;
        transition-duration: .3s;
        transition-timing-function: ease;
    }

    :host(:popover-open) {
        transform: translate(-50%, calc(var(--apple-top) - 5px)) translateZ(0);
        opacity: 1;

        @starting-style {
            transform: translate(-50%, -100px) translateZ(0);
            opacity: 0;
        }
    }
`