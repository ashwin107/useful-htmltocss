/*
	Source:
	van Creij, Maurice (2014). "useful._this.js: Generates an empty stylesheet from HTML.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the global object if needed
var useful = useful || {};

// extend the global object
useful.Htmltocss = function () {

	// PROPERTIES

	"use strict";

	// METHODS

	this.init = function (config) {
		// store the configuration
		this.config = config;
		this.element = config.element;
		// set the form submit handler
		this.onFormSubmit(this.element);
		// gather the text areas
		var textareas = this.element.getElementsByTagName('textarea');
		this.config.input = textareas[0];
		this.config.output = textareas[1];
		this.onInputChange(this.config.input);
		// gather the options
		var options = this.element.getElementsByTagName('input');
		this.config.options = {};
		for (var a = 0, b = options.length; a < b; a += 1) {
			// if this is an actual option
			if (options[a].type === 'checkbox') {
				// note its state
				this.config.options[options[a].name] = options[a].checked;
				// add an event handler
				this.onOptionChange(options[a]);
			}
		}
		// initial state
		this.update();
		// return the object
		return this;
	};

	this.update = function () {
		// variables
		var dummy, output;
		// create a new dummy container
		dummy = document.createElement('div');
		// put the html from the input in the dummy container
		dummy.innerHTML = this.config.input.value;
		// pass the dummy through the redraw function
		output = this.parse(dummy, -1, '', '');
		// add the scss conversion step is needed
		if (this.config.options.compass) {
			output = this.convert(output);
		}
		//publish the result in the output
		this.config.output.value = output;
		// clear the  dummy container
		dummy = null;
	};

	this.childnodes = function (parent) {
		// variables
		var children, a, b, nodes = parent.childNodes;
		// for all nodes in the parent
		children = [];
		for (a = 0 , b = nodes.length; a < b; a += 1) {
			// if the node is not text
			if (!nodes[a].nodeName.match('#')) {
				// include it in the list of children
				children.push(nodes[a]);
			}
		}
		return children;
	};

	this.convert = function (output) {
		// split the output into lines
		var a, b, c, d, elements, tabs, next, lines = output.split('}');
		// for all lines
		for (a = 0 , b = lines.length - 1; a < b; a += 1) {
			// split the elements of each line
			elements = lines[a].split(' ');
			// restore the tabs
			tabs = elements[0].match(/\t/gi);
			tabs = (!tabs) ? [] : tabs;
			// only keep the last element of each line
			lines[a] = tabs.join('') + elements[elements.length - 2] + ' {\n';
			// if the next line exists
			if (a < lines.length) {
				// check the tabs on the next line
				next = lines[a + 1].match(/\t/gi);
				next = (!next) ? [] : next;
				// if the next line is shallower
				if (next.length < tabs.length) {
					// add the closing bracket at the end of the line
					lines[a] = lines[a].replace('{', '{}');
					// add closing bracket at the recursion down to the next indentation
					for (c = 0 , d = tabs.length - next.length; c < d; c += 1) {
						lines[a] += tabs.join('').substr(c + 1) + '}\n';
					}
				}
				// if the next line is at the same level
				if (next.length === tabs.length) {
					// add the closing bracket at the end of the line
					lines[a] = lines[a].replace('{', '{}');
				}
			}
		}
		// return the result
		return lines.join('');
	};

	this.parse = function (element, recursion, prefix, css) {
		var _this = this;
		// variables
		var a, b, indentation = '', entry = '', suffix = '', children = _this.childnodes(element);
		// if the recursion is high enough
		if (recursion >= 0) {
			// add indentations based on the recursion
			indentation = '';
			if (_this.config.options.indented || _this.config.options.compass) {
				for (a = 0; a < recursion; a += 1) {
					indentation += '\t';
				}
			}
			// identify the element
			entry = element.nodeName.toLowerCase();
			if (element.id) {
				entry += '#' + element.id;
			}
			if (element.className) {
				entry += '.' + element.className.replace(/ /gi, '.');
			}
			// add the suffix
			entry += ' ';
			suffix = '{}\n';
			// reset the chain after an id
			if (_this.config.options.fromid && entry.match(/#/gi)) {
				prefix = '';
			}
			// if the line doesn't exist yet
			if (css.indexOf(indentation + prefix + entry + suffix) < 0) {
				// add the entry to the stylesheet
				css += indentation + prefix + entry + suffix;
			}
		}
		// for all of its child nodes
		for (a = 0 , b = children.length; a < b; a += 1) {
			// recurse
			css = _this.parse(children[a], recursion + 1, prefix + entry, css);
		}
		// return the  result
		return css;
	};

	// EVENTS

	this.onInputChange = function (element) {
		var _this = this;
		// set an event handler
		element.onchange = function () {
			_this.update();
		};
	};

	this.onOptionChange = function (element) {
		var _this = this;
		// set an event handler
		element.onchange = function () {
			_this.config.options[element.name] = element.checked;
			_this.update(_this);
		};
	};

	this.onFormSubmit = function (element) {
		var _this = this;
		// set an event handler
		element.onsubmit = function () {
			_this.update();
			// cancel the submit
			return false;
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Htmltocss;
}
