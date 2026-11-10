
export const mainNamespace = 'https://raw.githubusercontent.com/GreenCodeStudio/configurable-wysiwyg/refs/heads/master/schema.xsd'
export function isHtmlNodeContainingText(node) {
    return (node instanceof Text && node.textContent.length > 0) || (node instanceof Element && node.tagName.toLowerCase() != 'selection');
}
