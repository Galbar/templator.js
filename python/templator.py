import json
from html.parser import HTMLParser

class Templator(HTMLParser):
    inline_instructions = ["template", "for"]
    def __init__(self):
        HTMLParser.__init__(self)
        self.stack = []
        self.template_names = []
        self.templates = {}
        self.current_template = ""
        self.current_template_count = 0

    def get_current_template(self):
        if self.current_template not in self.templates:
            return ""
        return self.templates[self.current_template]

    def next(self, type_, tag):
        print(self.get_current_template())
        if not self.stack and type_ == "START" and tag == "templator":
            self.stack.append(tag)
        elif type_ == "END" and self.stack[-1] == tag:
            self.stack.pop()
        elif type_ == "START":
            self.stack.append(tag)
        else:
            raise Exception("Templator parsing error")

        print(self.stack)

    def handle_starttag(self, tag, attrs):
        self.next("START", tag)

        if tag == "templator":
            return

        self.startBaseNode(tag, attrs)

    def handle_endtag(self, tag):
        self.next("END", tag)

        if tag == "templator":
            return

        self.endBaseNode();


    def handle_pi(self, data):
        type_ = "END" if data[:3] == "end" else "START"
        data = data.split();
        tag = data[0] if type_ == "START" else data[0][3:]
        if tag not in self.inline_instructions:
            if type_ == "END" and tag == "for":
                self.next("END", "def")
            self.next(type_, tag)

        if tag == "template":
            print(">>>>>>>>>>>>>>>>>>>>>>", data)
            if len(data) < 3:
                ctx = "undefined"
            else:
                print("################################")
                ctx = "'%s'" % data[2]
            self.next("START", "template")
            self.startTemplateNode(data[1], ctx)
            self.next("END", "template")
            self.endTemplateNode()
        elif tag == "def":
            if type_ == "START":
                self.startTemplate(data[1])
            else:
                self.endTemplate()
        elif tag == "for":
            self.next("START", "for")
            self.startForNode(data[1], data[2])
            self.next("END", "for")
            self.endForNode()

    def handle_data(self, data):
        if not data.strip():
            return

        self.next("START", "text")
        self.textNode(data)
        self.next("END", "text")

    def startBaseNode(self, tag, attrs):
        if attrs:
            self.startNodeBootstrap("templator.BaseNode('%s', %s)" % (tag, json.dumps(attrs)))
        else:
            self.startNodeBootstrap("templator.BaseNode('%s')" % tag)


    def endBaseNode(self):
        self.endNodeBootstrap()

    def textNode(self, text):
        self.startNodeBootstrap("templator.TextNode(%s)" % json.dumps(text))
        self.endNodeBootstrap()

    def startTemplateNode(self, template, context_name):
        if template not in self.templates:
            raise Exception("Template '%s' not defined." % template)

        self.startNodeBootstrap("templator.TemplateNode(%s(), %s)" % (template, context_name))

    def endTemplateNode(self):
        self.endNodeBootstrap()

    def startForNode(self, list_name, template):
        self.startNodeBootstrap("templator.ForNode(%s(), %s)" % (template, json.dumps(list_name)))

    def endForNode(self):
        self.endNodeBootstrap()

    def startTemplate(self, name):
        if name in self.templates:
            raise Exception("Template %s is already defined." % name)

        self.template_names.append(name)
        self.templates[name] = "templator.Template(["
        self.current_template = name
        self.current_template_count = 0

    def endTemplate(self):
        name = self.current_template
        self.templates[name] += "]);"
        if self.stack[-1] == "templator":
            self.templates[name] = """var %s = (function(templator) {
return function() {
return %s;
}
})(templator);""" % (
        name,
        self.templates[name])

    def startNodeBootstrap(self, part):
        template = ""
        if self.stack[-2] != "def":
            template += ".appendChild("
        elif self.current_template_count != 0:
            template += ", "

        if self.current_template_count == 0:
            self.current_template_count = 1
        template += part

        self.templates[self.current_template] += template

    def endNodeBootstrap(self):
        if self.stack[-1] != "def":
            self.templates[self.current_template] += ")"


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="A compiler for Templator templates")
    parser.add_argument("-i", "--input-files", help="File containing the templates. If not present it fallbacks to standard input.", nargs="+")
    parser.add_argument("-o", "--output-file", help="File in which to write the output. If not present it fallbacks to standard output.")
    args = parser.parse_args()
    if args.input_files:
        template = ""
        for file_name in args.input_files:
            with open(file_name, 'r') as f:
                template += f.read()
    else:
        template = raw_input()

    t = Templator()
    try:
        t.feed(template.replace("\n", " ").replace("\r", ""))
    except Exception as e:
        print(t.stack)
        raise e

    js = "\n".join([t.templates[name] for name in t.template_names])
    if args.output_file:
        with open(args.output_file, "w") as f:
            f.write(js)
    else:
        print(js)
