var Book = (function(templator) {
var Book = templator.Template([templator.BaseNode('div', [["class", "book-{{available}}"]]).appendChild(templator.BaseNode('h3', []).appendChild(templator.TextNode("{{title}}, by {{author}}"))).appendChild(templator.BaseNode('strong', []).appendChild(templator.TextNode("Category:"))).appendChild(templator.TextNode("{{category}}")).appendChild(templator.BaseNode('br', [])).appendChild(templator.BaseNode('strong', []).appendChild(templator.TextNode("Price:"))).appendChild(templator.TextNode("{{price}}")).appendChild(templator.BaseNode('br', []))]);

return Book;
})(templator);
var Bike = (function(templator) {
var Bike = templator.Template([templator.BaseNode('div', [["class", "bicycle"]]).appendChild(templator.BaseNode('h3', []).appendChild(templator.TextNode("Bicycle"))).appendChild(templator.BaseNode('strong', []).appendChild(templator.TextNode("Color:"))).appendChild(templator.TextNode("{{color}}")).appendChild(templator.BaseNode('br', [])).appendChild(templator.BaseNode('strong', []).appendChild(templator.TextNode("Price:"))).appendChild(templator.TextNode("{{price}}")).appendChild(templator.BaseNode('br', []))]);

return Bike;
})(templator);
var Store = (function(templator) {
var Store = templator.Template([templator.BaseNode('h1', []).appendChild(templator.TextNode("Store")), templator.BaseNode('h2', []).appendChild(templator.TextNode("Books")), templator.ForNode(Book, "book"), templator.TemplateNode(Bike, 'bicycle')]);

return Store;
})(templator);