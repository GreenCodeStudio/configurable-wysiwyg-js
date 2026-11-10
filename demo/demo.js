import ConfigurableWysiwygEditor from "../src/Editor";
import {LineBreak} from "../src/elements/LineBreak";
import {Paragraph} from "../src/elements/Paragraph";

const editor = new ConfigurableWysiwygEditor();

editor.addAllowedElement(new LineBreak());
editor.addAllowedElement(new Paragraph());
editor.reload()


window.editor = editor;
document.body.append(editor);
const xml=document.createElement('code');
document.body.append('xml');
document.body.append(xml);

const customHtml=document.createElement('code');
document.body.append('customHtml');
document.body.append(customHtml);

const cleanHtml=document.createElement('code');
document.body.append('cleanHtml');
document.body.append(cleanHtml);
editor.addEventListener('input', (e) => {
    refresh();
});
editor.addEventListener('selectionchange', (e) => {
    console.log('selectionchange');
    refresh();
});
editor.addEventListener('keyup', (e) => {
    console.log('keyup');
    refresh();
});
setInterval(() => {
    refresh();
}, 1000);
function refresh(){
    xml.textContent = editor.getXml();
    customHtml.textContent = editor.innerHTML;
    cleanHtml.textContent = editor.convertTo('text/html');
}
