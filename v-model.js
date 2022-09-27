/**
   * Parse a v-model expression into a base path and a final key segment.
   * Handles both dot-path and possible square brackets.
   *
   * Possible cases:
   *
   * - test
   * - test[key]
   * - test[test1[key]]
   * - test["a"][key]
   * - xxx.test[a[a].test1[key]]
   * - test.xxx.a["asa"][test1[key]]
   *
   */

 var len, str, chr, index$1, expressionPos, expressionEndPos;



 function parseModel (val) {
   // Fix https://github.com/vuejs/vue/pull/7730
   // allow v-model="obj.val " (trailing whitespace)
   val = val.trim();
   len = val.length;

   if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
     index$1 = val.lastIndexOf('.');
     if (index$1 > -1) {
       return {
         exp: val.slice(0, index$1),
         key: '"' + val.slice(index$1 + 1) + '"'
       }
     } else {
       return {
         exp: val,
         key: null
       }
     }
   }

   str = val;
   index$1 = expressionPos = expressionEndPos = 0;

   while (!eof()) {
     chr = next();
     /* istanbul ignore if */
     if (isStringStart(chr)) {
       parseString(chr);
     } else if (chr === 0x5B) {
       parseBracket(chr);
     }
   }

   return {
     exp: val.slice(0, expressionPos),
     key: val.slice(expressionPos + 1, expressionEndPos)
   }
 }

 function next () {
   return str.charCodeAt(++index$1)
 }

 function eof () {
   return index$1 >= len
 }

 function isStringStart (chr) {
   return chr === 0x22 || chr === 0x27
 }

 function parseBracket (chr) {
   var inBracket = 1;
   expressionPos = index$1;
   while (!eof()) {
     chr = next();
     if (isStringStart(chr)) {
       parseString(chr);
       continue
     }
     if (chr === 0x5B) { inBracket++; }
     if (chr === 0x5D) { inBracket--; }
     if (inBracket === 0) {
       expressionEndPos = index$1;
       break
     }
   }
 }

 function parseString (chr) {
   var stringQuote = chr;
   while (!eof()) {
     chr = next();
     if (chr === stringQuote) {
       break
     }
   }
 }

 /*  */

 var warn$1;

 // in some cases, the event used has to be determined at runtime
 // so we used some reserved tokens during compile.
 var RANGE_TOKEN = '__r';
 var CHECKBOX_RADIO_TOKEN = '__c';

 function model (
   el,
   dir,
   _warn
 ) {
   // debugger
   warn$1 = _warn;
   var value = dir.value;
   var modifiers = dir.modifiers;
   var tag = el.tag;
   var type = el.attrsMap.type;

   {
     // inputs with type="file" are read only and setting the input's
     // value will throw an error.
     if (tag === 'input' && type === 'file') {
       warn$1(
         "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
         "File inputs are read only. Use a v-on:change listener instead.",
         el.rawAttrsMap['v-model']
       );
     }
   }

   if (el.component) {
     genComponentModel(el, value, modifiers);
     // component v-model doesn't need extra runtime
     return false
   } else if (tag === 'select') {
     genSelect(el, value, modifiers);
   } else if (tag === 'input' && type === 'checkbox') {
     genCheckboxModel(el, value, modifiers);
   } else if (tag === 'input' && type === 'radio') {
     genRadioModel(el, value, modifiers);
   } else if (tag === 'input' || tag === 'textarea') {
     genDefaultModel(el, value, modifiers);
   } else if (!config.isReservedTag(tag)) {
     genComponentModel(el, value, modifiers);
     // component v-model doesn't need extra runtime
     return false
   } else {
     warn$1(
       "<" + (el.tag) + " v-model=\"" + value + "\">: " +
       "v-model is not supported on this element type. " +
       'If you are working with contenteditable, it\'s recommended to ' +
       'wrap a library dedicated for that purpose inside a custom component.',
       el.rawAttrsMap['v-model']
     );
   }

   // ensure runtime directive metadata
   return true
 }

 function genCheckboxModel (
   el,
   value,
   modifiers
 ) {
   var number = modifiers && modifiers.number;
   var valueBinding = getBindingAttr(el, 'value') || 'null';
   var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
   var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
   addProp(el, 'checked',
     "Array.isArray(" + value + ")" +
     "?_i(" + value + "," + valueBinding + ")>-1" + (
       trueValueBinding === 'true'
         ? (":(" + value + ")")
         : (":_q(" + value + "," + trueValueBinding + ")")
     )
   );
   addHandler(el, 'change',
     "var $$a=" + value + "," +
         '$$el=$event.target,' +
         "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
     'if(Array.isArray($$a)){' +
       "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
           '$$i=_i($$a,$$v);' +
       "if($$el.checked){$$i<0&&(" + (genAssignmentCode(value, '$$a.concat([$$v])')) + ")}" +
       "else{$$i>-1&&(" + (genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')) + ")}" +
     "}else{" + (genAssignmentCode(value, '$$c')) + "}",
     null, true
   );
 }

 function genRadioModel (
   el,
   value,
   modifiers
 ) {
   var number = modifiers && modifiers.number;
   var valueBinding = getBindingAttr(el, 'value') || 'null';
   valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
   addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
   addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
 }

 function genSelect (
   el,
   value,
   modifiers
 ) {
   var number = modifiers && modifiers.number;
   var selectedVal = "Array.prototype.filter" +
     ".call($event.target.options,function(o){return o.selected})" +
     ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
     "return " + (number ? '_n(val)' : 'val') + "})";

   var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
   var code = "var $$selectedVal = " + selectedVal + ";";
   code = code + " " + (genAssignmentCode(value, assignment));
   addHandler(el, 'change', code, null, true);
 }

 function genDefaultModel (
   el,
   value,
   modifiers
 ) {
   var type = el.attrsMap.type;

   // warn if v-bind:value conflicts with v-model
   // except for inputs with v-bind:type
   {
     var value$1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
     var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
     if (value$1 && !typeBinding) {
       var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
       warn$1(
         binding + "=\"" + value$1 + "\" conflicts with v-model on the same element " +
         'because the latter already expands to a value 