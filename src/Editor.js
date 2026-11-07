export default class Editor extends HTMLElement {
    constructor() {
        super();
       this.contentEditable=true;
    }
}
if('customElements' in global) {
    global.customElements.define('configurable-wysiwyg-editor', Editor);
}
