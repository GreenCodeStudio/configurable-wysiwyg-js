import {isHtmlNodeContainingText, mainNamespace} from "../Utils";

export class LineBreak {
    priority = -10;
    ns = mainNamespace;
    tagName = 'linebreak';

    customDomToXmlDom(editor, dom, node) {
        if (node instanceof HTMLElement && node.tagName == 'BR') {
            if (node.nextElementSibling)
                return [dom.createElementNS(mainNamespace, 'linebreak')];
            else
                return [];
        }
    }

    xmlDomToCustomDom(editor, node) {
        const nextSiblings = [...node.parentNode.childNodes].slice([...node.parentNode.childNodes].indexOf(node) + 1)
        console.log('nextSiblings', nextSiblings)
        if (nextSiblings.some(x => isHtmlNodeContainingText(x))) {
            return [document.createElement('br')]
        } else {
            return [document.createElement('br'), document.createElement('br')]
        }
    }

    handleEvent(eventWrapped) {
        console.log(eventWrapped);
        if (eventWrapped.nativeEvent.type == 'keydown' && eventWrapped.nativeEvent.key == 'Enter') {
            console.log('enter')
            eventWrapped.dom.querySelector('selection').replaceWith(eventWrapped.dom.createElementNS(mainNamespace, 'linebreak'), eventWrapped.dom.createElementNS(mainNamespace, 'selection'))
            eventWrapped.isHandled = true;
        }
    }
}
