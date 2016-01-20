var json = require('../index.js'),
    assert = require('core-assert');

var timer = function (ms, v) {
	return new Promise(function (resolve, reject) {
		var to = setTimeout(function () {
				resolve(v);
			}, ms);
		return { cancel: function () {
			clearTimeout(to);
		}};
	});
};

var keywords = {
	'break':1,'case':1,'catch':1,'continue':1,'debugger':1,'default':1,'delete':1,'do':1,'else':1,'finally':1,'for':1,
	'function':1,'if':1,'in':1,'instanceof':1,'new':1,'return':1,'switch':1,'this':1,'throw':1,'try':1,'typeof':1,
	'var':1,'void':1,'while':1,'with':1,
	'class':1,'enum':1,'export':1,'extends':1,'import':1,'super':1,
	'implements':1,'interface':1,'let':1,'package':1,'private':1,'protected':1,'public':1,'static':1,'yield':1
};

var id2str = function _id2str(o) {
	return /^[a-zA-Z_]\w*$/.test(o) && !keywords[o] ? o : qstr(o);
};

var dqstr = function (s) {
	return '"' + s.replace(/["\t\n\r]/g, function (m) { //"
		switch (m) {
		case '"':	return '\\"';
		case '\t':  return '\\t';
		case '\n':  return '\\n';
		case '\r':  return '\\r';
		}
	}) + '"';
};

var qstr = function (s) {
	return "'" + s.replace(/['\t\n\r]/g, function (m) { //'
		switch (m) {
		case "'":	return "\\'";
		case '\t':  return '\\t';
		case '\n':  return '\\n';
		case '\r':  return '\\r';
		}
	}) + "'";
};


var str2str = function (s) {
	var qc = 0, dqc = 0;
	for (var i = 0, n = s.length; i < n; ++i)
		switch (s.charAt(i)) {
		case "'": ++qc; break;
		case '"': ++dqc; break;
		}
	return qc > dqc ? dqstr(s) : qstr(s);
};


function ts(a, radix, deep) {
	switch (typeof a) {
	case 'object':
		if (a instanceof Array) {
			var o = [];
			for (var i = 0, n = a.length; i < n; ++i)
				o[i] = ts(a[i], radix, 1);
			return deep ? '['+o.join(',')+']' : o.join(',');
		}
		if (a instanceof RegExp)
			return a.toString();
		if (a === null)
			return 'null';
		var o = [];
		for (var id in a)
			o.push(id2str(id)+':'+ts(a[id], radix, 1));
		return '{' + o.join(',') + '}';

	case 'string':
		return str2str(a);

	case 'number':
		switch (radix) {
		default:
		case 10:
			return a.toString(10);
		case 16:
			return '0x'+a.toString(16);
		case 8:
			return '0o'+a.toString(8);
		case 2:
			return '0b'+a.toString(2);
		}

	case 'undefined':
		return 'undefined';
	case 'function':
	case 'boolean':
		return a.toString();
	}
}


function massive(name, fn, pairs, sradix, dradix) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 2)
			(function (args, ret) {
				test(fn.name+'('+json.js2str(args, sradix)+') -> '+ts(ret, dradix)+'', function (done) {
					assert.deepStrictEqual(args instanceof Array ? fn.apply(null, args) : fn.call(null, args), ret);
					done();
				});
			})(pairs[i], pairs[i+1]);
	});
}

function massive_reversed(name, fn, pairs, sradix, dradix) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 2)
			(function (args, ret) {
				test(fn.name+'('+json.js2str(args, sradix)+') -> '+ts(ret, dradix)+'', function (done) {
					assert.deepStrictEqual(args instanceof Array ? fn.apply(null, args) : fn.call(null, args), ret);
					done();
				});
			})(pairs[i+1], pairs[i]);
	});
}

function Q() {
	this.a = 1;
	this.bb = 1.;
	this.c = 'a';
	this.d = null;
	this.eeee = undefined;
	this.ff = function nope() {};
	this.ggg = [ 1,2,3 ];
	this.h = true;
	this.i = false;
}

Q.prototype = {
	method: function ololo(r) { return r/2; },
	glo: "global property"
};

suite('nano-json', function () {

	massive('js2str', function (o, radix, unarray) {
		return json.js2str(o, radix, unarray);
	}, [
		[ "qweqew", 10, 0 ], "'qweqew'",
		[ "q	w\"e'q'\r\new", 10, 0 ], '"q\\tw\\"e\'q\'\\r\\new"',
		[ "q	w'e\"\"q\r\new", 10, 0 ], '\'q\\tw\\\'e""q\\r\\new\'',
		[ 10, 2 ], "0b1010",
		[ 10, 8 ], "0o12",
		[ 10, 10 ], "10",
		[ 10 ], "10",
		[ 10, 16 ], "0xa",
		[ ], "undefined",
		[ null ], "null",
		[ true ], "true",
		[ false ], "false",
		[ /a/ ], "/a/",
		[ /a/gi ], "/a/gi",
		[ function (a) { return a*a; } ], "function (a) { return a*a; }",
		[ [ 1, 2, 3 ], 10, 1 ], "1,2,3",
		[ [ 1, 2, 3 ], 10 ], "[1,2,3]",
		[ { a: 1 }, 10 ], "{a:1}",
		[ { a: 1 }, 10, 1 ], "{a:1}",
		[ { a: { "class": 1 } }, 10, 1 ], "{a:{'class':1}}"
	], 10, 10);

	massive('render', function (o, style, indent, tab) {
		return json.render(o, style, indent, tab);
	}, [
		[ "qweqew" ], "'qweqew'",
		[ "q	w\"e'q'\r\new" ], '"q\\tw\\"e\'q\'\\r\\new"',
		[ "q	w'e\"\"q\r\new" ], '\'q\\tw\\\'e""q\\r\\new\'',
		[ 10, 10 ], "10",
		[ ], "undefined",
		[ null ], "null",
		[ true ], "true",
		[ false ], "false",
		[ /a/ ], "/a/",
		[ /a/gi ], "/a/gi",
		[ function (a) { return a*a; } ], "function (a) { return a*a; }",
		[ [ 1, 2, 3 ] ], "[\n  1,\n  2,\n  3\n]",
		[ { a: 1 } ], "{\n  a:1\n}",
		[ { a: { "class": 1, key:{} } } ], "{\n  a:{\n    'class':1,\n    key:    { }\n  }\n}",
		[ { a: { "class": 1, key:{ s:{ e: { f:1 } }} } }, , '', '          ' ], "{\n          a:{\n                    'class':1,\n                    key:    { /* <<<<<<< too deep data structure >>>>>>>> */ }\n          }\n}",
		[ { a: { "class": 1, key:{ s:{ e: { f:1 } }} } }, , '', '\t' ], "{\n\ta:{\n\t\t'class':1,\n\t\tkey:    {\n\t\t\ts:{\n\t\t\t\te:{\n\t\t\t\t\tf:1\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}",
		[ {}, ' #, # # ' ], "{ }",
		[ [], ' #, # # ' ], "[ ]",
		[ [ 1, , 2, , , ], ' #, # # ' ], "[ 1, , 2 ]",
		[ { a:1, b:2, c:3 }, { '': ' #, # # ', '":':1 } ], "{ 'a':1, 'b':2, 'c':3 }",
		[ { a:1, b:2, c:3 }, { '': ' #, # # ' } ], "{ a:1, b:2, c:3 }",
		[ { aaa:1, b:2, cc:3 }, { '': ' #, # # ' } ], "{ aaa:1, b:2, cc:3 }",
		[ { aaa:1, b:2, cc:3 }, { '': ' #, # # ', '<>:':0 } ], "{ aaa:1, b:2, cc:3 }",
		[ { aaa:1, b:2, cc:3 }, { '': ' #, # # ', '<>:':4 } ], "{ aaa: 1, b:   2, cc:  3 }",
		[ { aaa:1, b:2, cc:3 }, { '': ' #, # # ', '<>:':2 } ], "{ aaa:1, b: 2, cc:3 }",
		[ [ 1, , 2, , , ], { '': ' #, # # ', '#':1 } ], "[ /*    0 */ 1, /*    1 */ , /*    2 */ 2 ]",
		[ [ 1, 2, 3 ], { '': ' #, # ' } ], "[ 1, 2, 3 ]",
		[ {
			'break':1, 'case':1, 'class':1, 'catch': 1, 'const':1, 'continue':1,
			'debugger':1, 'default':1, 'delete':1, 'do':1, 'else':1, 'export':1,
			'extends':1, 'finally':1, 'for':1, 'function':1, 'if':1, 'import':1,
			'in':1, 'instanceof':1, 'new':1, 'return':1, 'super':1, 'switch':1, 
			'this':1, 'throw':1, 'try':1, 'typeof':1, 'var':1, 'void':1,
			'while':1, 'with':1, 'yield':1, 'test':0
		}, ' #, # # ' ], "{ 'break':1, 'case':1, 'class':1, 'catch':1, 'const':1, 'continue':1, \
'debugger':1, 'default':1, 'delete':1, 'do':1, 'else':1, 'export':1, \
'extends':1, 'finally':1, 'for':1, 'function':1, 'if':1, 'import':1, \
'in':1, 'instanceof':1, 'new':1, 'return':1, 'super':1, 'switch':1, \
'this':1, 'throw':1, 'try':1, 'typeof':1, 'var':1, 'void':1, \
'while':1, 'with':1, 'yield':1, test:0 }",
			[ new Q(), ' #, # # ' ], "{ a:1, bb:1, c:'a', d:null, eeee:undefined, ff:function nope() {}, ggg:[ 1, 2, 3 ], h:true, i:false }",
			[ new Q(), { '':' #, # # ', '<>:':1 } ], "{ a:1, bb:1, c:'a', d:null, eeee:undefined, ff:function nope() {}, ggg:[ 1, 2, 3 ], h:true, i:false }"
	], 10, 10);

	massive('id2str', json.id2str, [
		[ "qweqew" ], "qweqew",
		[ "0xa7" ], "0xa7",
		[ "0b101" ], "0b101",
		[ "0o74" ], "0o74",
		[ "11" ], "11",
		[ "qwe-qew" ], "'qwe-qew'",
		[ "class" ] , "'class'"
	], 10, 10);

	massive('jsml2str', json.jsml2str, [
		[ [ 'attr', 'attr-value',
			'tag', [ 'attr', 'attr-value',
				'', 'text' ],
			'tag', []
		] ], "[ 'attr', 'attr-value',\n\t'tag', [ 'attr', 'attr-value',\n\t\t'', 'text' ],\n\t'tag', [ ] ]"
	], 10, 10);
});
