var Book = (function(templator) {
return function() {
return templator.Template([templator.BaseNode('div', [["class", "book-{{available}}"]]).appendChild(templator.BaseNode('h3').appendChild(templator.TextNode("{{title}}, by {{author}}"))).appendChild(templator.BaseNode('strong').appendChild(templator.TextNode("Category: "))).appendChild(templator.TextNode("{{category}}")).appendChild(templator.BaseNode('br')).appendChild(templator.BaseNode('strong').appendChild(templator.TextNode("Price: "))).appendChild(templator.TextNode("{{price}}")).appendChild(templator.BaseNode('br'))]);;
}
})(templator);
var Bike = (function(templator) {
return function() {
return templator.Template([templator.BaseNode('div', [["class", "bicycle"]]).appendChild(templator.BaseNode('h2').appendChild(templator.TextNode("Bicycle"))).appendChild(templator.BaseNode('strong').appendChild(templator.TextNode("Color: "))).appendChild(templator.TextNode("{{color}}")).appendChild(templator.BaseNode('br')).appendChild(templator.BaseNode('strong').appendChild(templator.TextNode("Price: "))).appendChild(templator.TextNode("{{price}}")).appendChild(templator.BaseNode('br')).appendChild(templator.TemplateNode(Book(), 'a')), templator.TemplateNode(Book(), 'a')]);;
}
})(templator);
var Store = (function(templator) {
return function() {
return templator.Template([templator.BaseNode('h1').appendChild(templator.TextNode("Store")), templator.BaseNode('div', [["class", "section"]]).appendChild(templator.TemplateNode(Bike(), 'bicycle')), templator.BaseNode('div', [["class", "section"]]).appendChild(templator.BaseNode('h2').appendChild(templator.TextNode("Books"))).appendChild(templator.ForNode(Book(), "book"))]);;
}
})(templator);