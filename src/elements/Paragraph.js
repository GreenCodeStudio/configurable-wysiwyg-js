import {isHtmlNodeContainingText, mainNamespace} from "../Utils";
import Editor from "../Editor";

export class Paragraph {
    priority = 0;
    ns = mainNamespace;
    tagName = 'paragraph';

    customDomToXmlDom(editor, dom, node) {
        if (node instanceof HTMLElement && node.tagName.toUpperCase() == 'P') {
            const ret = dom.createElementNS(mainNamespace, 'paragraph');
            ret.append(...[...node.childNodes].flatMap(x => editor.customDomToXmlDom(dom, x)))
            return [ret];
        }
    }

    xmlDomToCustomDom(editor, node) {
        const ret = document.createElement('p');
        ret.append(...[...node.childNodes].flatMap(x => editor.xmlDomToCustomDom(x)));

        if (![...ret.childNodes].some(x => isHtmlNodeContainingText(x))) {
            ret.append(document.createElement('br'));
        }
        return [ret];
    }

    handleEvent(eventWrapped) {
        console.log(eventWrapped);
        if (eventWrapped.nativeEvent.type == 'keydown' && eventWrapped.nativeEvent.key == 'Enter' && !eventWrapped.nativeEvent.shiftKey) {
            console.log('enter')
            const selection = eventWrapped.dom.querySelector('selection');
            let parent = selection;
            while (parent) {
                if (parent.namespaceURI == mainNamespace && (parent.tagName == 'paragraph' || parent.tagName == 'document')) {
                    break;
                }
                parent = parent.parentNode
            }
            if (parent.tagName == 'document') {
                const p = eventWrapped.dom.createElementNS(mainNamespace, 'paragraph');
                p.append(...parent.childNodes)
                parent.append(p);
                parent = p;
            }
            const newParagraph = eventWrapped.dom.createElementNS(mainNamespace, 'paragraph');
            while (selection.nextSibling) {
                newParagraph.append(selection.nextSibling);
            }
            newParagraph.prepend(selection)
            parent.parentNode.insertBefore(newParagraph, parent.nextSibling);
            eventWrapped.isHandled = true;
        }
    }
    initDocument(editor, document) {
        console.log('initDocument')
        if(document.children.length==0){
            const p = document.ownerDocument.createElementNS(mainNamespace, 'paragraph');
            document.append(p);
        }
    }
}

export class ParagraphElement extends HTMLElement {
    constructor() {
        super();
    }
}

if ('customElements' in global) {
    global.customElements.define('paragraph-element', ParagraphElement);
}
