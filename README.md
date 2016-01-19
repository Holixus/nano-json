[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]] [travis-url]
[![Test coverage][coveralls-image]] [coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

# nano-json

Well formatted(customizable) JSON like generator. Not compatible with pure JSON (smart strings/ids qouting).

Its very usefull for easy readble JS-objects dumps because you can define formats for sub-elements of objects deeply pretty.

## API

### id2str(id)

Returns quoted `id` value if it's keyword or not identifier.

```js
id2str('blah'); // blah
id2str('blah-blah'); // 'blah-blah'
id2str('class'); // 'class'
```

### str2str(str)

Returns quoted string. Automaticaly detects quotes symbols.

```js
str2str('some string'); // 'some string'
str2str('some "" string with "double" quotes'); // 'some "" string with "double" quotes'
str2str("some '' string with 'single' quotes"); // "some '' string with 'single' quotes"
```

### qstr(str)

Returns single qouted string.

```js
qstr('some string'); // 'some string'
qstr('some "" string with "double" quotes'); // 'some "" string with "double" quotes'
qstr("some '' string with 'single' quotes"); // 'some \'\' string with \'single\' quotes'
```

### dqstr(str)

Returns double quoted string.

```js
dqstr('some string'); // "some string"
dqstr('some "" string with "double" quotes'); // "some \"\" string with \"double\" quotes"
dqstr("some '' string with 'single' quotes"); // "some '' string with 'single' quotes"
```

### js2str(obj, default_radix, unarray)

* obj `Object`;
* default_radix `Number` - radix for number values (10 if undefined);
* unarray `Boolean` - stringify root array as list (without square brackets).

Returns stringified object.

```js
js2str([ 10, 20, 30 ], 10, 1); // 10,20,30
js2str([ 10, 20, 30 ], 10, 0); // [10,20,30]
js2str([ 10, 20, 30 ], 16, 0); // [0xa,0x14,0x28]
js2str({ a: 1 }); // {a:1}
```

### render(obj[, style[, indent[, tab]]])

* obj `Object`
* style `Object` or `String`
 * `String` - list format string: '<before-list>#<between-items>#<after-list>#<empty-list>'
 * `Object` - { '':'<lists-format>', ['":':1], ['<>:':<ids-width>][, <ID>:<sub-style>]* }
  * '':`String`    - list format string: '<before-list>#<between-items>#<after-list>#<empty-list>'
  * '":':`Boolean` - force qouting of object keys flag
  * '<>:':`Number` - minimal width of object keys (will be padded by spaces)
  * '#':`Boolean`  - enable array items index number comments
  * <ID>:`Object`  - style for sub-items
  * '*':`Object`   - style for array sub-items
* indent `String` - indent string ('' by default)
* tab `String`    - one indentation level spaces string

#### style samples

##### `' #, # # '`

```js
var style = ' #, # # ';
render([ 1, 2, 3 ], style); // '[ 1, 2, 3 ]'
render([ 1 ], style); // '[ 1 ]'
render([ ], style); // '[ ]'
render({ a:1, b:2, c:3 }, style); // '{ a:1, b:2, c:3 }'
render({ a:1 }, style); // '{ a:1 }'
render({ }, style); // '{ }'
```

##### `'#,##'`

```js
var style = '#,##';
render([ 1, 2, 3 ], style); // '[1,2,3]'
render([ 1 ], style); // '[1]'
render([ ], style); // '[]'
render({ a:1, b:2, c:3 }, style); // '{a:1,b:2,c:3}'
render({ a:1 }, style); // '{a:1}'
render({ }, style); // '{}'
```

##### `'\n+#,\n+#\n=# '`

Where the '+' symbol means next level of indentation.

```js
var style = '\n+#,\n+#\n=# ';
render([ 1, 2, 3 ], style, '', ' '); // '[\n 1,\n 2,\n 3\n]'
render([ 1 ], style); // '[\n 1\n]'
render([ ], style); // '[ ]'
render({ a:1, b:2, c:3 }, style); // '{\n a:1,\n b:2,\n c:3\n}'
render({ a:1 }, style); // '{\n a:1\n}'
render({ }, style); // '{ }'
```


[gitter-image]: https://badges.gitter.im/Holixus/nano-json.svg
[gitter-url]: https://gitter.im/Holixus/nano-json
[npm-image]: https://img.shields.io/npm/v/nano-json.svg
[npm-url]: https://npmjs.org/package/nano-json
[github-tag]: http://img.shields.io/github/tag/Holixus/nano-json.svg
[github-url]: https://github.com/Holixus/nano-json/tags
[travis-image]: https://travis-ci.org/Holixus/nano-json.svg?branch=master
[travis-url]: https://travis-ci.org/Holixus/nano-json
[coveralls-image]: https://img.shields.io/coveralls/Holixus/nano-json.svg
[coveralls-url]: https://coveralls.io/r/Holixus/nano-json
[david-image]: http://img.shields.io/david/Holixus/nano-json.svg
[david-url]: https://david-dm.org/Holixus/nano-json
[license-image]: http://img.shields.io/npm/l/nano-json.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/nano-json.svg
[downloads-url]: https://npmjs.org/package/nano-json
