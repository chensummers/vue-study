# vue-study
vue study

## nodeType 
>- 1 元素(p,div,span) 2 标签属性 3 文本 text
>- `
  cbs = {
    activate: [_enter(_,v)],
    create: [
      updateAttrs(o,v),updateClass(o,v),updateDOMListensers(o,v),updateDOMProps(o,v),        updateStyle(o,v),_enter(_,v),_create(_,v),
    ],
    destroy: [destroy(v),unbindDirectives(v)],
    remove: [remove$$1(v,rm)],
    update: [
      updateAttrs(o,v),updateClass(o,v),updateDOMListensers(o,v),updateDOMProps(o,v),        updateStyle(o,v),update(_,v),updateDirectives(o,v),
    ]

  }
`

```
  const NODE_TYPE = {
    1:'ELEMENT_NODE', // 一个 元素 节点，例如 <p> 和 <div>。
    2:'ATTRIBUTE_NODE', // 元素 的耦合 属性。
    3:'TEXT_NODE', // Element 或者 Attr 中实际的 文字
    4:'CDATA_SECTION_NODE',// 一个 CDATASection，例如 <!CDATA[[ … ]]>。
    5:'',// 
    6:'',// 
    7:'PROCESSING_INSTRUCTION_NODE',// 一个用于 XML 文档的 ProcessingInstruction (en-US) ，例如 <?xml-stylesheet ... ?> 声明。
    8:'COMMENT_NODE',// 一个 Comment 节点。
    9:'DOCUMENT_NODE',// 一个 Document 节点。
    10:'DOCUMENT_TYPE_NODE',// 描述文档类型的 DocumentType 节点。例如 <!DOCTYPE html> 就是用于 HTML5 的。
    11:'DOCUMENT_FRAGMENT_NODE',// 一个 DocumentFragment 节点
  }
```