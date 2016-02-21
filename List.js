var Item = (function(templator) {

var Item = templator.Template([templator.BaseNode('li', []).appendChild(templator.TextNode("{{value}}"))]);

return Item;
})(templator);
var List = (function(templator) {
var t0 = templator.Template([templator.TemplateNode(Item)]);
var List = templator.Template([templator.BaseNode('ul', []).appendChild(templator.BaseNode('li', []).appendChild(templator.TextNode("{{value}}"))).appendChild(templator.ForNode(t0, "list"))]);

return List;
})(templator);