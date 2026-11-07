const ns = 'https://tmp/'
export default class Editor extends HTMLElement {
    constructor() {
        super();
        this.contentEditable = true;
        this.addEventListener('blur', () => this.reload());
        this.addEventListener('input', () => this.reload());
    }

    getXmlDom() {
        const dom = new Document();
        const root = dom.createElementNS(ns, 'document');
        dom.append(root);
        root.append(...[...this.childNodes].flatMap(x => this.customDomToXmlDom(dom, x)))
        return dom;
    }

    getXml() {
        const s = new XMLSerializer();
        return s.serializeToString(this.getXmlDom());
    }

    convertTo(mime) {

    }

    customDomToXmlDom(dom, node) {
        if (node instanceof HTMLElement) {
            return [...node.childNodes].flatMap(x => this.customDomToXmlDom(dom, x));
        } else if (node instanceof Text) {
            const selection = window.getSelection();
            if (selection.anchorNode == node) {
                return [dom.createTextNode(node.textContent.substring(0, selection.anchorOffset)), dom.createElementNS(ns, 'selection'), dom.createTextNode(node.textContent.substring(selection.anchorOffset))];
            } else {
                return [dom.createTextNode(node.textContent)];
            }
        }
    }

    reload() {
        console.log('reloading editor')
        const dom = this.getXmlDom();
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
}
if ('customElements' in global) {
    global.customElements.define('configurable-wysiwyg-editor', Editor);
}
