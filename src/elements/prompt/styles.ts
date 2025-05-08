import { css } from "../../utils"

export const hostStyle = css`
    :host {
        translate: -50% 120%;

        transition-behavior: allow-discrete;
        transition-duration: .3s;
        transition-timing-function: ease;
        transition-property: display, translate;
        transform: translateZ(0);


        @starting-style {
            translate: -50% 50%;
        }
    }

    :host(:popover-open) {
        display: block;
        translate: -50% 0%;

        @starting-style {
            translate: -50% 50%;
        }
    }
`
