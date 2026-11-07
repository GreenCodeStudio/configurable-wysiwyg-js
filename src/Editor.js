import {Placeholder} from "./Placeholder";

const ns = 'https://raw.githubusercontent.com/GreenCodeStudio/configurable-wysiwyg/refs/heads/master/schema.xsd'
export default class Editor extends HTMLElement {
    constructor() {
        super();
        this.contentEditable = true;
        this.addEventListener('blur', () => this.reload(false));
        this.addEventListener('input', () => this.reload(true));
        this.addEventListener('focus', () => this.querySelectorAll('configurable-wysiwyg-placeholder').forEach(x => x.remove()));
        this.refreshPlaceholder();
    }

    getXmlDom() {
        const dom = new Document();
        const root = dom.createElementNS(ns, 'document');
        dom.append(root);
        root.append(...[...this.childNodes].flatMap(x => this.customDomToXmlDom(dom, x)))
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
        if (node instanceof HTMLElement) {
            if(node.tagName=='CONFIGURABLE-WYSIWYG-PLACEHOLDER') {
             return [];
            }else {
                return [...node.childNodes].flatMap(x => this.customDomToXmlDom(dom, x));
            }
        } else if (node instanceof Text) {
            const selection = window.getSelection();
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
        if (this.selectAnchorNode &&keepSelected) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(this.selectAnchorNode, 0);
            range.setEnd(this.selectAnchorNode, 0);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        this.refreshPlaceholder();
    }

    loadXml(xml) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(xml, 'text/xml');
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
            if (node.namespaceURI == ns && node.localName == 'selection') {
                const textNode = document.createTextNode('');
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
}
if ('customElements' in global) {
    global.customElements.define('configurable-wysiwyg-editor', Editor);
}
