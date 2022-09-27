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
