import {mainNamespace} from "../Utils";

export class LineBreak {
    priority = -10;
    ns = mainNamespace;
    tagName = 'linebreak';

    customDomToXmlDom(editor, dom, node) {
        if (node instanceof HTMLElement && node.tagName == 'BR') {
            return dom.createElementNS(mainNamespace, 'linebreak');
        }
    }
    xmlDomToCustomDom(editor, node){
        return document.createElement('br')
    }
}

export class LineBreakElement extends HTMLElement {
    constructor() {
        super();
    }
}

if ('customElements' in global) {
    global.customElements.define('linebreak-element', LineBreakElement);
}
