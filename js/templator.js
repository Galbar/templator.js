"use strict";

var templator = (function() {
    var re_variable = /{{[a-zA-Z].*?}}/g;

    var String_ = function(string) {
        console.log("String", string);
        this.string = string;
        this.variables = [];

        var variables = {};
        var names = string.match(re_variable);

        if (names === null) return;
        for (var i = 0; i < names.length; ++i) {
            if (variables[names[i]] === undefined) {
                name = names[i].substring(2, names[i].length -2);
                this.variables.push(name);
                variables[name] = true;
            }
        }
    };

    String_.prototype.render = function(context) {
        console.log("String", context);
        var str = this.string;
        for (var i = 0; i < this.variables.length; ++i) {
            var value = context[this.variables[i]];
            if (value === undefined) {
                value = "";
            }
            str = str.replace("{{" + this.variables[i] + "}}", value);
        }
        return str;
    };

    var Template = function(nodes) {
        this.nodes;
        this.parent = null;
        if (nodes instanceof Array) {
            this.nodes = nodes;
        }
        else {
            this.nodes = [nodes];
        }
    };

    Template.prototype.render = function(context, element) {
        if (element) {
            for (var i = 0; i < this.nodes.length; ++i) {
                this.nodes[i].render(context);
            }
        }
        else {
            var new_nodes = [];
            for (var i = 0; i < this.nodes.length; ++i) {
                var node = this.nodes[i];
                var nodes = node.render(context);
                for (var j = 0; j < nodes.length; ++j) {
                    new_nodes.push(nodes[j]);
                }
            }
            return new_nodes;
        }
    };

    var BaseNode = function(tag, attrs, parent) {
        console.log("BaseNode", tag);
        this.element = document.createElement(tag);
        this.children = [];
        this.parent = null;
        this.position = 0;
        attrs = attrs || [];
        this.attrs = [];
        for (var i = 0; i < attrs.length; ++i) {
            this.attrs.push([attrs[i][0], new String_(attrs[i][1])]);
        }

        this.context_name = null;
    };

    BaseNode.prototype.appendChild = function(child, stop) {
        if (stop === undefined) {
            stop = false;
        }
        this.children.push(child);
        child.position = this.children.length;
        child.parent = this.element;
        if (child.element !== undefined) {
            this.element.appendChild(child.element);
        }
        if (child.isTemplateNode && !stop) {
            child.template.parent = this.element;
            for (var i = 0; i < child.template.nodes.length; ++i) {
                this.appendChild(child.template.nodes[i], true);
                child.template.nodes[i].context_name = child.context_name;
            }
        }
        return this;
    };

    BaseNode.prototype.render = function(context) {
        if (this.context_name !== null) {
            context = context[this.context_name];
        }
        console.log("BaseNode", context, this.context_name);
        for (var i = 0; i < this.attrs.length; ++i) {
            var attr_name = this.attrs[i][0];
            var attr_value = this.attrs[i][1].render(context);
            this.element.setAttribute(attr_name, attr_value);
        }
        for (var i = 0; i < this.children.length; ++i) {
            this.children[i].render(context);
        }
        if (this.parent === null) {
            return [this.element.cloneNode(true)];
        }
    };

    var TextNode = function(text) {
        console.log("TextNode");
        this.element = document.createTextNode(text);
        this.string = new String_(text);
        this.parent = null;
        this.position = 0;
        this.context_name = null;
    };

    TextNode.prototype.render = function(context) {
        if (this.context_name !== null) {
            context = context[this.context_name];
        }
        console.log("TextNode", context);
        this.element.textContent = this.string.render(context);
        if (this.parent === null) {
            return [this.element.cloneNode(true)];
        }
    };

    var TemplateNode = function(template, context_name) {
        console.log("TemplateNode", template);
        this.template = template;
        this.parent = null;
        if (context_name === undefined) {
            this.context_name = null;
        }
        else {
            this.context_name = context_name;
        }
        this.isTemplateNode = true;
    };

    TemplateNode.prototype.render = function(context) {
        console.log("TemplateNode (context)", context);
        if (this.parent === null) {
            return this.template.render(context);
        }
        else {
            this.template.render(context, true);
        }
    };

    var ForNode = function(template, list_name) {
        console.log("ForNode", template, list_name);
        this.template = template;
        this.list_name = list_name;
        this.parent = null;
        this.position = 0;
        this.elements_to_clean = [];
        this.context_name = null;
    };

    ForNode.prototype.render = function(context) {
        if (this.context_name !== null) {
            context = context[this.context_name];
        }
        console.log("ForNode", context, this.list_name);
        // clean parent's children
        if (this.parent !== null) {
            for (var i = 0; i < this.elements_to_clean.length; ++i) {
                this.parent.removeChild(this.elements_to_clean[i]);
            }
        }
        var list = context[this.list_name];
        if (list === undefined) return [];
        if (this.parent === null) {
            var new_nodes = []
            for (var i = 0; i < list.length; ++i) {
                list[i]['@loop.index'] = i;
                var nodes = this.template.render(list[i]);
                for (var j = 0; j < nodes.length; ++j) {
                    new_nodes.push(nodes[j]);
                }
                list[i]['@loop.index'] = undefined;
            }
            return new_nodes;
        }
        else {
            this.elements_to_clean = [];
            for (var i = 0; i < list.length; ++i) {
                list[i]['@loop.index'] = i;
                var new_nodes = this.template.render(list[i]);
                for (var j = 0; j < new_nodes.length; ++j) {
                    if (this.parent.childNodes.length > this.position + j) {
                        var child = this.parent.childNodes[this.position + 1 + j];
                        this.parent.insertBefore(new_nodes[j], child);
                        this.elements_to_clean.push(new_nodes[j]);
                    }
                    else {
                        this.parent.appendChild(new_nodes[j]);
                        this.elements_to_clean.push(new_nodes[j]);
                    }
                }
                list[i]['@loop.index'] = undefined;
            }
        }
    };

    return {
        String : function(a) {
            return new String_(a);
        },
        BaseNode : function(a, b) {
            return new BaseNode(a, b);
        },
        TextNode : function(a) {
            return new TextNode(a);
        },
        TemplateNode : function(a, b) {
            return new TemplateNode(a, b);
        },
        ForNode : function(a, b) {
            return new ForNode(a, b);
        },
        Template : function(a) {
            return new Template(a);
        }
    };
})();
