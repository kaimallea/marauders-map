/****************************************************************
 * Kai.js														*
 *																*
 * An SVG library for modern browsers							*
 *																*
 * Copyright © 2012 Kai Mallea									*
 *																*
 * License: http://www.opensource.org/licenses/mit-license.php	*
 ****************************************************************/

(function (root) {
	"use strict";

	var Kai = (root.Kai = root.Kai || {});
	
	// namespaces
	var xmlns 	= 'http://www.w3.org/2000/svg',
		xlinkns = 'http://www.w3.org/1999/xlink';


	// any elements created will be cached and
	// then cloned thereafter
	var elementCache = {};


	// Return the namespace for the type of element
	function getNS (type) {
		switch (type) {
			case 'xlink:href':
				return xlinkns;
			default:
				return null;
		}
	}


	// Create a new element with optional attributes
	function createElement (type, attrs) {
		type = type.toLowerCase();

		var el;
		if (elementCache[type]) {
			el = elementCache[type].cloneNode(false);
		} else {
			el = elementCache[type] = document.createElementNS(getNS(type), type);
		}
		
		if (typeof attrs === 'object') {
			Object.keys(attrs).forEach(function (k) {
				el.setAttributeNS(getNS(k), k, attrs[k]);
			});
		}

		return el;
	}

	Kai.create = createElement;
})(this);