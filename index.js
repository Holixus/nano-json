"use strict";

var exports = module.exports;

var keywords = {
	'break':1,'case':1,'catch':1,'const':1,'continue':1,'debugger':1,'default':1,'delete':1,'do':1,'else':1,'finally':1,'for':1,
	'function':1,'if':1,'in':1,'instanceof':1,'new':1,'return':1,'switch':1,'this':1,'throw':1,'try':1,'typeof':1,
	'var':1,'void':1,'while':1,'with':1,'class':1,'enum':1,'export':1,'extends':1,'import':1,'super':1,
	'implements':1,'interface':1,'let':1,'package':1,'private':1,'protected':1,'public':1,'static':1,'yield':1
};

var id2str = exports.id2str = function _id2str(o) {
	return /^(?:[a-zA-Z_]\w*|0(?:x[0-9a-f]+|b[01]+|o[0-7]+)|[1-9][0-9]*)$/.test(o) && !keywords[o] ? o : qstr(o);
};

var render = exports.render = function obj2json(o, styling, indent, tabber) {
	if (!styling)
		styling = {};
	if (typeof styling === 'string')
		styling = { '': styling };
	switch (typeof o) {
	case 'string':
		return str2str(o);
	case 'object':
		if (o === null)
			return 'null';

		if (o.test && o.exec)
			return o.toString();

		var style = (styling[''] || '\n+#,\n+#\n=# ').split('#'); // ' #, # ' | '\n+#,\n+#\n=# '
		if (!indent)
			indent = '';
		var tab = indent + (tabber || '  ');
		if (tab.length > 20) {
			return '{ /* <<<<<<< too deep data structure >>>>>>>> */ }';
			//throw new Error('too deep data structure');
		}
	//	if (style.length < 3 || !style[1].replace)
			//console.error(require('util').inspect(styling, false, 0, false), style);
		style[0] = style[0].replace(/\+/g, tab).replace(/=/g, indent); // after open brace
		style[1] = style[1].replace(/\+/g, tab).replace(/=/g, indent); // between items
		style[2] = style[2].replace(/\+/g, tab).replace(/=/g, indent); // before close brace
		style[3] = style.length < 4 ? ' ' : style[3].replace(/\+/g, tab).replace(/=/g, indent); // for empty
		var ids_auto_width = (styling['<>:']) || style[0].indexOf('\n') >= 0 && style[1].indexOf('\n') >= 0,
		    out = [], tabs = indent + '\t';
		if (o instanceof Array) {
			var numbering = (styling['#']);
			if (o.length == 0 || !style[1])
				return ['[', style[3], ']'].join('');
			var ol = o.length;
			while (ol && o[ol-1] === undefined) --ol;
			for( var i = 0; i < ol; ++i) {
				var val = o[i],
				    array_text = val === undefined ? '' : render(
						val,
						styling['*'] || styling,
						tab,
						tabber);
				if (numbering) {
					var num = '      ' + i;
					array_text = [ '/*', num.substr(-5), ' */ ', array_text ].join('');
				}
				out.push(array_text);
			}
			return ['[', style[0], out.join(style[1]), style[2], ']'].join('');
		}

		var is_empty = true;
		for (var id in o) { is_empty = false; break; }

		if (is_empty || !style[1])
			return ['{', style[3], '}'].join('');

		var _id2str = styling['":'] ? str2str : id2str;
		if (ids_auto_width) {
			var width = styling['<>:'] | 0; var _id;
			if (width == 0)
				for (var id in o) {
					var _id = _id2str(id);
					if (width < _id.length)
						width = _id.length;
				}
			for (var id in o) { //console.info(indent + id, JSON.stringify(styling[id] || styling['*'] || styling));
				if (o.hasOwnProperty(id))//typeof o[id] != 'function' || !(':()' in styling) || styling[':()'])
					out.push([
						_id = _id2str(id), ':',
						'                                                      '.substr(0, width - _id.length), 
						render(o[id], styling[id] || styling['*'] || styling, tab, tabber)].join(''));}
		} else
			for (var id in o) { //console.info(indent + id, JSON.stringify(styling[id] || styling['*'] || styling));
				if (o.hasOwnProperty(id))//typeof o[id] != 'function' || !(':()' in styling) || styling[':()'])
					out.push([_id2str(id), ':', render(o[id], styling[id] || styling['*'] || styling, tab, tabber)].join(''));
			}
		return ['{', style[0], out.join(style[1]), style[2], '}'].join('');

	case 'number':
	case 'function':
	case 'boolean':
		return o.toString();
	}
	return 'undefined';
};


var dqstr = exports.dqstr = function (s) {
	return '"' + s.replace(/["\t\n\r]/g, function (m) { //"
		switch (m) {
		case '"':	return '\\"';
		case '\t':  return '\\t';
		case '\n':  return '\\n';
		case '\r':  return '\\r';
		}
	}) + '"';
};


var qstr = exports.qstr = function (s) {
	return "'" + s.replace(/['\t\n\r]/g, function (m) { //'
		switch (m) {
		case "'":	return "\\'";
		case '\t':  return '\\t';
		case '\n':  return '\\n';
		case '\r':  return '\\r';
		}
	}) + "'";
};


var str2str = exports.str2str = function (s) {
	var qc = 0, dqc = 0;
	for (var i = 0, n = s.length; i < n; ++i)
		switch (s.charAt(i)) {
		case "'": ++qc; break;
		case '"': ++dqc; break;
		}
	return qc > dqc ? dqstr(s) : qstr(s);
};

var js2str = exports.js2str = function _js2str(a, radix, unarray) {
	switch (typeof a) {
	case 'object':
		if (a instanceof Array) {
			var o = [];
			for (var i = 0, n = a.length; i < n; ++i)
				o[i] = js2str(a[i], radix);
			return unarray ? o.join(',') : '['+o.join(',')+']';
		}
		if (a instanceof RegExp)
			return a.toString();
		if (a === null)
			return 'null';
		var o = [];
		for (var id in a)
			o.push(id2str(id)+':'+js2str(a[id], radix));
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
};

