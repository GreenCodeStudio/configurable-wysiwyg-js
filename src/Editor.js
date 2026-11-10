import {Placeholder} from "./Placeholder";
import {mainNamespace} from "./Utils";

const ns = mainNamespace
export default class Editor extends HTMLElement {
    allowedElements = [];

    constructor() {
        super();
        this.contentEditable = true;
        this.addEventListener('blur', () => this.reload(false));
        // this.addEventListener('input', () => this.reload(true));
        this.addEventListener('focus', () => this.querySelectorAll('configurable-wysiwyg-placeholder').forEach(x => x.remove()));
        this.addEventListener('keydown', (e) => {
            const dom = this.getXmlDom();

        });
        this.refreshPlaceholder();
    }

    getXmlDom() {
        const dom = new Document();
        const root = dom.createElementNS(ns, 'document');
        dom.append(root);
        root.append(...[...this.childNodes].flatMap(x => this.customDomToXmlDom(dom, x)))

        const selection = window.getSelection();
        if (selection.anchorNode == this) {
            root.append(dom.createElementNS(ns, 'selection'));
        }
        return dom;
    }

    get placeholder() {
        this.attributes['placeholder']?.value;
    }

    set placeholder(value) {
        this.setAttribute('placeholder', value);
        this.refreshPlaceholder();
    }

    getXml() {
        const s = new XMLSerializer();
        return s.serializeToString(this.getXmlDom());
    }

    convertTo(mime) {

    }

    customDomToXmlDom(dom, node) {
        for (const allowedElement of this.allowedElements) {
            const result = allowedElement.customDomToXmlDom(this, dom, node);
            if (result) {
                return result;
            }
        }
        const selection = window.getSelection();
        if (node instanceof HTMLElement) {
            if (node.tagName == 'CONFIGURABLE-WYSIWYG-PLACEHOLDER') {
                return [];
            } else {
                let ret = [...node.childNodes].flatMap(x => this.customDomToXmlDom(dom, x));
                if (selection.anchorNode == node) {
                    ret.push(dom.createElementNS(ns, 'selection'));
                }
                return ret;
            }
        } else if (node instanceof Text) {
            if (selection.anchorNode == node) {
                return [dom.createTextNode(node.textContent.substring(0, selection.anchorOffset)), dom.createElementNS(ns, 'selection'), dom.createTextNode(node.textContent.substring(selection.anchorOffset))];
            } else {
                return [dom.createTextNode(node.textContent)];
            }
        }
    }

    reload(keepSelected) {
        console.log('reloading editor')
        const dom = this.getXmlDom();
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
        this.selectAnchorNode = null;
        this.append(...this.xmlDomToCustomDom(dom));
        if (this.selectAnchorNode && keepSelected) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(this.selectAnchorNode, 0);
            range.setEnd(this.selectAnchorNode, 1);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        this.refreshPlaceholder();
    }

    loadXmlDom(dom) {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
        this.selectAnchorNode = null;
        this.append(...this.xmlDomToCustomDom(dom));
        if (this.selectAnchorNode) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(this.selectAnchorNode, 0);
            range.setEnd(this.selectAnchorNode, 0);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    loadXml(xml) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(xml, 'text/xml');
        this.loadXmlDom(dom);
    }

    clear() {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
    }

    xmlDomToCustomDom(node) {
        if (node instanceof Document) {
            return [...node.childNodes].flatMap(x => this.xmlDomToCustomDom(x));
        }
        if (node instanceof Element) {
            console.log('xmlDomToCustomDom', node.namespaceURI, node.tagName)
            for (const allowedElement of this.allowedElements) {
                if (allowedElement.ns == node.namespaceURI && allowedElement.tagName.toUpperCase() == node.tagName.toUpperCase()) {
                    return allowedElement.xmlDomToCustomDom(this, node);
                }
            }
            if (node.namespaceURI == ns && node.localName == 'selection') {
                console.log('found selection')
                const textNode = document.createTextNode('x');
                this.selectAnchorNode = textNode;
                return [textNode];
            } else {
                return [...node.childNodes].flatMap(x => this.xmlDomToCustomDom(x));
            }
        } else if (node instanceof Text) {
            return [document.createTextNode(node.textContent)];
        }
    }

    refreshPlaceholder() {
        this.querySelectorAll('configurable-wysiwyg-placeholder').forEach(x => x.remove());
        if (!this.matches(':focus, :focus-within') && this.textContent.trim().length == 0 && this.attributes['placeholder']?.value) {
            console.log('a')
            const placeholder = new Placeholder();
            placeholder.textContent = this.attributes['placeholder'].value;
            this.append(placeholder);
        }
    }

    addAllowedElement(element) {
        this.allowedElements.push(element);
        this.allowedElements.sort((a, b) => (a.priority ?? 0).localeCompare(b.priority ?? 0));
    }
}
if ('customElements' in global) {
    global.customElements.define('configurable-wysiwyg-editor', Editor);
}
