import Editor from "./Editor";

export class Placeholder extends HTMLElement{

}
if ('customElements' in global) {
    global.customElements.define('configurable-wysiwyg-placeholder', Placeholder);
}
