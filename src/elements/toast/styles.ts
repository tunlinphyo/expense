import { css } from "../../utils"

export const popoverStyles = css`
    :host {
        padding: 0;
        border-radius: var(--radius-4);
        border: none;
        position: absolute;
        inset: auto;
        margin: 0;
        top: var(--size-1);
        left: 50%;
        box-shadow: var(--shadow-4);
        background-color: var(--bg-popover);
        font-family: var(--font-family);

        translate: -50% -20px;
        opacity: 0;

        transition-behavior: allow-discrete;
        transition-duration: .3s;
        transition-timing-function: ease;
        transform: translateZ(0);
    }

    :host(:popover-open) {
        translate: -50% 0;
        opacity: 1;

        @starting-style {
            translate: -50% -100px;
            opacity: 0;
        }
    }
`