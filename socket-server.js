'use strict';

var require$$0$2 = require('https');
var require$$1$2 = require('fs');
var require$$2 = require('path');
var require$$0$1 = require('net');
var require$$1 = require('crypto');
var require$$1$1 = require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$2);
var require$$1__default$2 = /*#__PURE__*/_interopDefaultLegacy(require$$1$2);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
var require$$1__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$1$1);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			var isInstance = false;
      try {
        isInstance = this instanceof a;
      } catch {}
			if (isInstance) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var socketServer$1 = {};

var selfsigned = {};

var _Reflect = {};

/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var hasRequired_Reflect;

function require_Reflect () {
	if (hasRequired_Reflect) return _Reflect;
	hasRequired_Reflect = 1;
	var Reflect;
	(function (Reflect) {
	    // Metadata Proposal
	    // https://rbuckton.github.io/reflect-metadata/
	    (function (factory) {
	        var root = typeof globalThis === "object" ? globalThis :
	            typeof commonjsGlobal === "object" ? commonjsGlobal :
	                typeof self === "object" ? self :
	                    typeof this === "object" ? this :
	                        sloppyModeThis();
	        var exporter = makeExporter(Reflect);
	        if (typeof root.Reflect !== "undefined") {
	            exporter = makeExporter(root.Reflect, exporter);
	        }
	        factory(exporter, root);
	        if (typeof root.Reflect === "undefined") {
	            root.Reflect = Reflect;
	        }
	        function makeExporter(target, previous) {
	            return function (key, value) {
	                Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
	                if (previous)
	                    previous(key, value);
	            };
	        }
	        function functionThis() {
	            try {
	                return Function("return this;")();
	            }
	            catch (_) { }
	        }
	        function indirectEvalThis() {
	            try {
	                return (void 0, eval)("(function() { return this; })()");
	            }
	            catch (_) { }
	        }
	        function sloppyModeThis() {
	            return functionThis() || indirectEvalThis();
	        }
	    })(function (exporter, root) {
	        var hasOwn = Object.prototype.hasOwnProperty;
	        // feature test for Symbol support
	        var supportsSymbol = typeof Symbol === "function";
	        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
	        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
	        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
	        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
	        var downLevel = !supportsCreate && !supportsProto;
	        var HashMap = {
	            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
	            create: supportsCreate
	                ? function () { return MakeDictionary(Object.create(null)); }
	                : supportsProto
	                    ? function () { return MakeDictionary({ __proto__: null }); }
	                    : function () { return MakeDictionary({}); },
	            has: downLevel
	                ? function (map, key) { return hasOwn.call(map, key); }
	                : function (map, key) { return key in map; },
	            get: downLevel
	                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
	                : function (map, key) { return map[key]; },
	        };
	        // Load global or shim versions of Map, Set, and WeakMap
	        var functionPrototype = Object.getPrototypeOf(Function);
	        var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
	        var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
	        var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
	        var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : undefined;
	        var metadataRegistry = GetOrCreateMetadataRegistry();
	        var metadataProvider = CreateMetadataProvider(metadataRegistry);
	        /**
	         * Applies a set of decorators to a property of a target object.
	         * @param decorators An array of decorators.
	         * @param target The target object.
	         * @param propertyKey (Optional) The property key to decorate.
	         * @param attributes (Optional) The property descriptor for the target key.
	         * @remarks Decorators are applied in reverse order.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     Example = Reflect.decorate(decoratorsArray, Example);
	         *
	         *     // property (on constructor)
	         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     Object.defineProperty(Example, "staticMethod",
	         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
	         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
	         *
	         *     // method (on prototype)
	         *     Object.defineProperty(Example.prototype, "method",
	         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
	         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
	         *
	         */
	        function decorate(decorators, target, propertyKey, attributes) {
	            if (!IsUndefined(propertyKey)) {
	                if (!IsArray(decorators))
	                    throw new TypeError();
	                if (!IsObject(target))
	                    throw new TypeError();
	                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
	                    throw new TypeError();
	                if (IsNull(attributes))
	                    attributes = undefined;
	                propertyKey = ToPropertyKey(propertyKey);
	                return DecorateProperty(decorators, target, propertyKey, attributes);
	            }
	            else {
	                if (!IsArray(decorators))
	                    throw new TypeError();
	                if (!IsConstructor(target))
	                    throw new TypeError();
	                return DecorateConstructor(decorators, target);
	            }
	        }
	        exporter("decorate", decorate);
	        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
	        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
	        /**
	         * A default metadata decorator factory that can be used on a class, class member, or parameter.
	         * @param metadataKey The key for the metadata entry.
	         * @param metadataValue The value for the metadata entry.
	         * @returns A decorator function.
	         * @remarks
	         * If `metadataKey` is already defined for the target and target key, the
	         * metadataValue for that key will be overwritten.
	         * @example
	         *
	         *     // constructor
	         *     @Reflect.metadata(key, value)
	         *     class Example {
	         *     }
	         *
	         *     // property (on constructor, TypeScript only)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         static staticProperty;
	         *     }
	         *
	         *     // property (on prototype, TypeScript only)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         property;
	         *     }
	         *
	         *     // method (on constructor)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         static staticMethod() { }
	         *     }
	         *
	         *     // method (on prototype)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         method() { }
	         *     }
	         *
	         */
	        function metadata(metadataKey, metadataValue) {
	            function decorator(target, propertyKey) {
	                if (!IsObject(target))
	                    throw new TypeError();
	                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
	                    throw new TypeError();
	                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
	            }
	            return decorator;
	        }
	        exporter("metadata", metadata);
	        /**
	         * Define a unique metadata entry on the target.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param metadataValue A value that contains attached metadata.
	         * @param target The target object on which to define metadata.
	         * @param propertyKey (Optional) The property key for the target.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     Reflect.defineMetadata("custom:annotation", options, Example);
	         *
	         *     // property (on constructor)
	         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
	         *
	         *     // decorator factory as metadata-producing annotation.
	         *     function MyAnnotation(options): Decorator {
	         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
	         *     }
	         *
	         */
	        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
	        }
	        exporter("defineMetadata", defineMetadata);
	        /**
	         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.hasMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function hasMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("hasMetadata", hasMetadata);
	        /**
	         * Gets a value indicating whether the target object has the provided metadata key defined.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function hasOwnMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("hasOwnMetadata", hasOwnMetadata);
	        /**
	         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function getMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("getMetadata", getMetadata);
	        /**
	         * Gets the metadata value for the provided metadata key on the target object.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function getOwnMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("getOwnMetadata", getOwnMetadata);
	        /**
	         * Gets the metadata keys defined on the target object or its prototype chain.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns An array of unique metadata keys.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getMetadataKeys(Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
	         *
	         */
	        function getMetadataKeys(target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryMetadataKeys(target, propertyKey);
	        }
	        exporter("getMetadataKeys", getMetadataKeys);
	        /**
	         * Gets the unique metadata keys defined on the target object.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns An array of unique metadata keys.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getOwnMetadataKeys(Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
	         *
	         */
	        function getOwnMetadataKeys(target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryOwnMetadataKeys(target, propertyKey);
	        }
	        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
	        /**
	         * Deletes the metadata entry from the target object with the provided key.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.deleteMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function deleteMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            var provider = GetMetadataProvider(target, propertyKey, /*Create*/ false);
	            if (IsUndefined(provider))
	                return false;
	            return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("deleteMetadata", deleteMetadata);
	        function DecorateConstructor(decorators, target) {
	            for (var i = decorators.length - 1; i >= 0; --i) {
	                var decorator = decorators[i];
	                var decorated = decorator(target);
	                if (!IsUndefined(decorated) && !IsNull(decorated)) {
	                    if (!IsConstructor(decorated))
	                        throw new TypeError();
	                    target = decorated;
	                }
	            }
	            return target;
	        }
	        function DecorateProperty(decorators, target, propertyKey, descriptor) {
	            for (var i = decorators.length - 1; i >= 0; --i) {
	                var decorator = decorators[i];
	                var decorated = decorator(target, propertyKey, descriptor);
	                if (!IsUndefined(decorated) && !IsNull(decorated)) {
	                    if (!IsObject(decorated))
	                        throw new TypeError();
	                    descriptor = decorated;
	                }
	            }
	            return descriptor;
	        }
	        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
	        function OrdinaryHasMetadata(MetadataKey, O, P) {
	            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
	            if (hasOwn)
	                return true;
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (!IsNull(parent))
	                return OrdinaryHasMetadata(MetadataKey, parent, P);
	            return false;
	        }
	        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
	        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
	            var provider = GetMetadataProvider(O, P, /*Create*/ false);
	            if (IsUndefined(provider))
	                return false;
	            return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
	        }
	        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
	        function OrdinaryGetMetadata(MetadataKey, O, P) {
	            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
	            if (hasOwn)
	                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (!IsNull(parent))
	                return OrdinaryGetMetadata(MetadataKey, parent, P);
	            return undefined;
	        }
	        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
	        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
	            var provider = GetMetadataProvider(O, P, /*Create*/ false);
	            if (IsUndefined(provider))
	                return;
	            return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
	        }
	        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
	        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
	            var provider = GetMetadataProvider(O, P, /*Create*/ true);
	            provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
	        }
	        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
	        function OrdinaryMetadataKeys(O, P) {
	            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (parent === null)
	                return ownKeys;
	            var parentKeys = OrdinaryMetadataKeys(parent, P);
	            if (parentKeys.length <= 0)
	                return ownKeys;
	            if (ownKeys.length <= 0)
	                return parentKeys;
	            var set = new _Set();
	            var keys = [];
	            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
	                var key = ownKeys_1[_i];
	                var hasKey = set.has(key);
	                if (!hasKey) {
	                    set.add(key);
	                    keys.push(key);
	                }
	            }
	            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
	                var key = parentKeys_1[_a];
	                var hasKey = set.has(key);
	                if (!hasKey) {
	                    set.add(key);
	                    keys.push(key);
	                }
	            }
	            return keys;
	        }
	        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
	        function OrdinaryOwnMetadataKeys(O, P) {
	            var provider = GetMetadataProvider(O, P, /*create*/ false);
	            if (!provider) {
	                return [];
	            }
	            return provider.OrdinaryOwnMetadataKeys(O, P);
	        }
	        // 6 ECMAScript Data Types and Values
	        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
	        function Type(x) {
	            if (x === null)
	                return 1 /* Null */;
	            switch (typeof x) {
	                case "undefined": return 0 /* Undefined */;
	                case "boolean": return 2 /* Boolean */;
	                case "string": return 3 /* String */;
	                case "symbol": return 4 /* Symbol */;
	                case "number": return 5 /* Number */;
	                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
	                default: return 6 /* Object */;
	            }
	        }
	        // 6.1.1 The Undefined Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
	        function IsUndefined(x) {
	            return x === undefined;
	        }
	        // 6.1.2 The Null Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
	        function IsNull(x) {
	            return x === null;
	        }
	        // 6.1.5 The Symbol Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
	        function IsSymbol(x) {
	            return typeof x === "symbol";
	        }
	        // 6.1.7 The Object Type
	        // https://tc39.github.io/ecma262/#sec-object-type
	        function IsObject(x) {
	            return typeof x === "object" ? x !== null : typeof x === "function";
	        }
	        // 7.1 Type Conversion
	        // https://tc39.github.io/ecma262/#sec-type-conversion
	        // 7.1.1 ToPrimitive(input [, PreferredType])
	        // https://tc39.github.io/ecma262/#sec-toprimitive
	        function ToPrimitive(input, PreferredType) {
	            switch (Type(input)) {
	                case 0 /* Undefined */: return input;
	                case 1 /* Null */: return input;
	                case 2 /* Boolean */: return input;
	                case 3 /* String */: return input;
	                case 4 /* Symbol */: return input;
	                case 5 /* Number */: return input;
	            }
	            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
	            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
	            if (exoticToPrim !== undefined) {
	                var result = exoticToPrim.call(input, hint);
	                if (IsObject(result))
	                    throw new TypeError();
	                return result;
	            }
	            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
	        }
	        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
	        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
	        function OrdinaryToPrimitive(O, hint) {
	            if (hint === "string") {
	                var toString_1 = O.toString;
	                if (IsCallable(toString_1)) {
	                    var result = toString_1.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	                var valueOf = O.valueOf;
	                if (IsCallable(valueOf)) {
	                    var result = valueOf.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	            }
	            else {
	                var valueOf = O.valueOf;
	                if (IsCallable(valueOf)) {
	                    var result = valueOf.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	                var toString_2 = O.toString;
	                if (IsCallable(toString_2)) {
	                    var result = toString_2.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	            }
	            throw new TypeError();
	        }
	        // 7.1.2 ToBoolean(argument)
	        // https://tc39.github.io/ecma262/2016/#sec-toboolean
	        function ToBoolean(argument) {
	            return !!argument;
	        }
	        // 7.1.12 ToString(argument)
	        // https://tc39.github.io/ecma262/#sec-tostring
	        function ToString(argument) {
	            return "" + argument;
	        }
	        // 7.1.14 ToPropertyKey(argument)
	        // https://tc39.github.io/ecma262/#sec-topropertykey
	        function ToPropertyKey(argument) {
	            var key = ToPrimitive(argument, 3 /* String */);
	            if (IsSymbol(key))
	                return key;
	            return ToString(key);
	        }
	        // 7.2 Testing and Comparison Operations
	        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
	        // 7.2.2 IsArray(argument)
	        // https://tc39.github.io/ecma262/#sec-isarray
	        function IsArray(argument) {
	            return Array.isArray
	                ? Array.isArray(argument)
	                : argument instanceof Object
	                    ? argument instanceof Array
	                    : Object.prototype.toString.call(argument) === "[object Array]";
	        }
	        // 7.2.3 IsCallable(argument)
	        // https://tc39.github.io/ecma262/#sec-iscallable
	        function IsCallable(argument) {
	            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
	            return typeof argument === "function";
	        }
	        // 7.2.4 IsConstructor(argument)
	        // https://tc39.github.io/ecma262/#sec-isconstructor
	        function IsConstructor(argument) {
	            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
	            return typeof argument === "function";
	        }
	        // 7.2.7 IsPropertyKey(argument)
	        // https://tc39.github.io/ecma262/#sec-ispropertykey
	        function IsPropertyKey(argument) {
	            switch (Type(argument)) {
	                case 3 /* String */: return true;
	                case 4 /* Symbol */: return true;
	                default: return false;
	            }
	        }
	        function SameValueZero(x, y) {
	            return x === y || x !== x && y !== y;
	        }
	        // 7.3 Operations on Objects
	        // https://tc39.github.io/ecma262/#sec-operations-on-objects
	        // 7.3.9 GetMethod(V, P)
	        // https://tc39.github.io/ecma262/#sec-getmethod
	        function GetMethod(V, P) {
	            var func = V[P];
	            if (func === undefined || func === null)
	                return undefined;
	            if (!IsCallable(func))
	                throw new TypeError();
	            return func;
	        }
	        // 7.4 Operations on Iterator Objects
	        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
	        function GetIterator(obj) {
	            var method = GetMethod(obj, iteratorSymbol);
	            if (!IsCallable(method))
	                throw new TypeError(); // from Call
	            var iterator = method.call(obj);
	            if (!IsObject(iterator))
	                throw new TypeError();
	            return iterator;
	        }
	        // 7.4.4 IteratorValue(iterResult)
	        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
	        function IteratorValue(iterResult) {
	            return iterResult.value;
	        }
	        // 7.4.5 IteratorStep(iterator)
	        // https://tc39.github.io/ecma262/#sec-iteratorstep
	        function IteratorStep(iterator) {
	            var result = iterator.next();
	            return result.done ? false : result;
	        }
	        // 7.4.6 IteratorClose(iterator, completion)
	        // https://tc39.github.io/ecma262/#sec-iteratorclose
	        function IteratorClose(iterator) {
	            var f = iterator["return"];
	            if (f)
	                f.call(iterator);
	        }
	        // 9.1 Ordinary Object Internal Methods and Internal Slots
	        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
	        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
	        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
	        function OrdinaryGetPrototypeOf(O) {
	            var proto = Object.getPrototypeOf(O);
	            if (typeof O !== "function" || O === functionPrototype)
	                return proto;
	            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
	            // Try to determine the superclass constructor. Compatible implementations
	            // must either set __proto__ on a subclass constructor to the superclass constructor,
	            // or ensure each class has a valid `constructor` property on its prototype that
	            // points back to the constructor.
	            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
	            // This is the case when in ES6 or when using __proto__ in a compatible browser.
	            if (proto !== functionPrototype)
	                return proto;
	            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
	            var prototype = O.prototype;
	            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
	            if (prototypeProto == null || prototypeProto === Object.prototype)
	                return proto;
	            // If the constructor was not a function, then we cannot determine the heritage.
	            var constructor = prototypeProto.constructor;
	            if (typeof constructor !== "function")
	                return proto;
	            // If we have some kind of self-reference, then we cannot determine the heritage.
	            if (constructor === O)
	                return proto;
	            // we have a pretty good guess at the heritage.
	            return constructor;
	        }
	        // Global metadata registry
	        // - Allows `import "reflect-metadata"` and `import "reflect-metadata/no-conflict"` to interoperate.
	        // - Uses isolated metadata if `Reflect` is frozen before the registry can be installed.
	        /**
	         * Creates a registry used to allow multiple `reflect-metadata` providers.
	         */
	        function CreateMetadataRegistry() {
	            var fallback;
	            if (!IsUndefined(registrySymbol) &&
	                typeof root.Reflect !== "undefined" &&
	                !(registrySymbol in root.Reflect) &&
	                typeof root.Reflect.defineMetadata === "function") {
	                // interoperate with older version of `reflect-metadata` that did not support a registry.
	                fallback = CreateFallbackProvider(root.Reflect);
	            }
	            var first;
	            var second;
	            var rest;
	            var targetProviderMap = new _WeakMap();
	            var registry = {
	                registerProvider: registerProvider,
	                getProvider: getProvider,
	                setProvider: setProvider,
	            };
	            return registry;
	            function registerProvider(provider) {
	                if (!Object.isExtensible(registry)) {
	                    throw new Error("Cannot add provider to a frozen registry.");
	                }
	                switch (true) {
	                    case fallback === provider: break;
	                    case IsUndefined(first):
	                        first = provider;
	                        break;
	                    case first === provider: break;
	                    case IsUndefined(second):
	                        second = provider;
	                        break;
	                    case second === provider: break;
	                    default:
	                        if (rest === undefined)
	                            rest = new _Set();
	                        rest.add(provider);
	                        break;
	                }
	            }
	            function getProviderNoCache(O, P) {
	                if (!IsUndefined(first)) {
	                    if (first.isProviderFor(O, P))
	                        return first;
	                    if (!IsUndefined(second)) {
	                        if (second.isProviderFor(O, P))
	                            return first;
	                        if (!IsUndefined(rest)) {
	                            var iterator = GetIterator(rest);
	                            while (true) {
	                                var next = IteratorStep(iterator);
	                                if (!next) {
	                                    return undefined;
	                                }
	                                var provider = IteratorValue(next);
	                                if (provider.isProviderFor(O, P)) {
	                                    IteratorClose(iterator);
	                                    return provider;
	                                }
	                            }
	                        }
	                    }
	                }
	                if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
	                    return fallback;
	                }
	                return undefined;
	            }
	            function getProvider(O, P) {
	                var providerMap = targetProviderMap.get(O);
	                var provider;
	                if (!IsUndefined(providerMap)) {
	                    provider = providerMap.get(P);
	                }
	                if (!IsUndefined(provider)) {
	                    return provider;
	                }
	                provider = getProviderNoCache(O, P);
	                if (!IsUndefined(provider)) {
	                    if (IsUndefined(providerMap)) {
	                        providerMap = new _Map();
	                        targetProviderMap.set(O, providerMap);
	                    }
	                    providerMap.set(P, provider);
	                }
	                return provider;
	            }
	            function hasProvider(provider) {
	                if (IsUndefined(provider))
	                    throw new TypeError();
	                return first === provider || second === provider || !IsUndefined(rest) && rest.has(provider);
	            }
	            function setProvider(O, P, provider) {
	                if (!hasProvider(provider)) {
	                    throw new Error("Metadata provider not registered.");
	                }
	                var existingProvider = getProvider(O, P);
	                if (existingProvider !== provider) {
	                    if (!IsUndefined(existingProvider)) {
	                        return false;
	                    }
	                    var providerMap = targetProviderMap.get(O);
	                    if (IsUndefined(providerMap)) {
	                        providerMap = new _Map();
	                        targetProviderMap.set(O, providerMap);
	                    }
	                    providerMap.set(P, provider);
	                }
	                return true;
	            }
	        }
	        /**
	         * Gets or creates the shared registry of metadata providers.
	         */
	        function GetOrCreateMetadataRegistry() {
	            var metadataRegistry;
	            if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
	                metadataRegistry = root.Reflect[registrySymbol];
	            }
	            if (IsUndefined(metadataRegistry)) {
	                metadataRegistry = CreateMetadataRegistry();
	            }
	            if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
	                Object.defineProperty(root.Reflect, registrySymbol, {
	                    enumerable: false,
	                    configurable: false,
	                    writable: false,
	                    value: metadataRegistry
	                });
	            }
	            return metadataRegistry;
	        }
	        function CreateMetadataProvider(registry) {
	            // [[Metadata]] internal slot
	            // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
	            var metadata = new _WeakMap();
	            var provider = {
	                isProviderFor: function (O, P) {
	                    var targetMetadata = metadata.get(O);
	                    if (IsUndefined(targetMetadata))
	                        return false;
	                    return targetMetadata.has(P);
	                },
	                OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata,
	                OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata,
	                OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata,
	                OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys,
	                OrdinaryDeleteMetadata: OrdinaryDeleteMetadata,
	            };
	            metadataRegistry.registerProvider(provider);
	            return provider;
	            function GetOrCreateMetadataMap(O, P, Create) {
	                var targetMetadata = metadata.get(O);
	                var createdTargetMetadata = false;
	                if (IsUndefined(targetMetadata)) {
	                    if (!Create)
	                        return undefined;
	                    targetMetadata = new _Map();
	                    metadata.set(O, targetMetadata);
	                    createdTargetMetadata = true;
	                }
	                var metadataMap = targetMetadata.get(P);
	                if (IsUndefined(metadataMap)) {
	                    if (!Create)
	                        return undefined;
	                    metadataMap = new _Map();
	                    targetMetadata.set(P, metadataMap);
	                    if (!registry.setProvider(O, P, provider)) {
	                        targetMetadata.delete(P);
	                        if (createdTargetMetadata) {
	                            metadata.delete(O);
	                        }
	                        throw new Error("Wrong provider for target.");
	                    }
	                }
	                return metadataMap;
	            }
	            // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
	            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
	            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
	                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	                if (IsUndefined(metadataMap))
	                    return false;
	                return ToBoolean(metadataMap.has(MetadataKey));
	            }
	            // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
	            // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
	            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
	                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	                if (IsUndefined(metadataMap))
	                    return undefined;
	                return metadataMap.get(MetadataKey);
	            }
	            // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
	            // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
	            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
	                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
	                metadataMap.set(MetadataKey, MetadataValue);
	            }
	            // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
	            // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
	            function OrdinaryOwnMetadataKeys(O, P) {
	                var keys = [];
	                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	                if (IsUndefined(metadataMap))
	                    return keys;
	                var keysObj = metadataMap.keys();
	                var iterator = GetIterator(keysObj);
	                var k = 0;
	                while (true) {
	                    var next = IteratorStep(iterator);
	                    if (!next) {
	                        keys.length = k;
	                        return keys;
	                    }
	                    var nextValue = IteratorValue(next);
	                    try {
	                        keys[k] = nextValue;
	                    }
	                    catch (e) {
	                        try {
	                            IteratorClose(iterator);
	                        }
	                        finally {
	                            throw e;
	                        }
	                    }
	                    k++;
	                }
	            }
	            function OrdinaryDeleteMetadata(MetadataKey, O, P) {
	                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	                if (IsUndefined(metadataMap))
	                    return false;
	                if (!metadataMap.delete(MetadataKey))
	                    return false;
	                if (metadataMap.size === 0) {
	                    var targetMetadata = metadata.get(O);
	                    if (!IsUndefined(targetMetadata)) {
	                        targetMetadata.delete(P);
	                        if (targetMetadata.size === 0) {
	                            metadata.delete(targetMetadata);
	                        }
	                    }
	                }
	                return true;
	            }
	        }
	        function CreateFallbackProvider(reflect) {
	            var defineMetadata = reflect.defineMetadata, hasOwnMetadata = reflect.hasOwnMetadata, getOwnMetadata = reflect.getOwnMetadata, getOwnMetadataKeys = reflect.getOwnMetadataKeys, deleteMetadata = reflect.deleteMetadata;
	            var metadataOwner = new _WeakMap();
	            var provider = {
	                isProviderFor: function (O, P) {
	                    var metadataPropertySet = metadataOwner.get(O);
	                    if (!IsUndefined(metadataPropertySet) && metadataPropertySet.has(P)) {
	                        return true;
	                    }
	                    if (getOwnMetadataKeys(O, P).length) {
	                        if (IsUndefined(metadataPropertySet)) {
	                            metadataPropertySet = new _Set();
	                            metadataOwner.set(O, metadataPropertySet);
	                        }
	                        metadataPropertySet.add(P);
	                        return true;
	                    }
	                    return false;
	                },
	                OrdinaryDefineOwnMetadata: defineMetadata,
	                OrdinaryHasOwnMetadata: hasOwnMetadata,
	                OrdinaryGetOwnMetadata: getOwnMetadata,
	                OrdinaryOwnMetadataKeys: getOwnMetadataKeys,
	                OrdinaryDeleteMetadata: deleteMetadata,
	            };
	            return provider;
	        }
	        /**
	         * Gets the metadata provider for an object. If the object has no metadata provider and this is for a create operation,
	         * then this module's metadata provider is assigned to the object.
	         */
	        function GetMetadataProvider(O, P, Create) {
	            var registeredProvider = metadataRegistry.getProvider(O, P);
	            if (!IsUndefined(registeredProvider)) {
	                return registeredProvider;
	            }
	            if (Create) {
	                if (metadataRegistry.setProvider(O, P, metadataProvider)) {
	                    return metadataProvider;
	                }
	                throw new Error("Illegal state.");
	            }
	            return undefined;
	        }
	        // naive Map shim
	        function CreateMapPolyfill() {
	            var cacheSentinel = {};
	            var arraySentinel = [];
	            var MapIterator = /** @class */ (function () {
	                function MapIterator(keys, values, selector) {
	                    this._index = 0;
	                    this._keys = keys;
	                    this._values = values;
	                    this._selector = selector;
	                }
	                MapIterator.prototype["@@iterator"] = function () { return this; };
	                MapIterator.prototype[iteratorSymbol] = function () { return this; };
	                MapIterator.prototype.next = function () {
	                    var index = this._index;
	                    if (index >= 0 && index < this._keys.length) {
	                        var result = this._selector(this._keys[index], this._values[index]);
	                        if (index + 1 >= this._keys.length) {
	                            this._index = -1;
	                            this._keys = arraySentinel;
	                            this._values = arraySentinel;
	                        }
	                        else {
	                            this._index++;
	                        }
	                        return { value: result, done: false };
	                    }
	                    return { value: undefined, done: true };
	                };
	                MapIterator.prototype.throw = function (error) {
	                    if (this._index >= 0) {
	                        this._index = -1;
	                        this._keys = arraySentinel;
	                        this._values = arraySentinel;
	                    }
	                    throw error;
	                };
	                MapIterator.prototype.return = function (value) {
	                    if (this._index >= 0) {
	                        this._index = -1;
	                        this._keys = arraySentinel;
	                        this._values = arraySentinel;
	                    }
	                    return { value: value, done: true };
	                };
	                return MapIterator;
	            }());
	            var Map = /** @class */ (function () {
	                function Map() {
	                    this._keys = [];
	                    this._values = [];
	                    this._cacheKey = cacheSentinel;
	                    this._cacheIndex = -2;
	                }
	                Object.defineProperty(Map.prototype, "size", {
	                    get: function () { return this._keys.length; },
	                    enumerable: true,
	                    configurable: true
	                });
	                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
	                Map.prototype.get = function (key) {
	                    var index = this._find(key, /*insert*/ false);
	                    return index >= 0 ? this._values[index] : undefined;
	                };
	                Map.prototype.set = function (key, value) {
	                    var index = this._find(key, /*insert*/ true);
	                    this._values[index] = value;
	                    return this;
	                };
	                Map.prototype.delete = function (key) {
	                    var index = this._find(key, /*insert*/ false);
	                    if (index >= 0) {
	                        var size = this._keys.length;
	                        for (var i = index + 1; i < size; i++) {
	                            this._keys[i - 1] = this._keys[i];
	                            this._values[i - 1] = this._values[i];
	                        }
	                        this._keys.length--;
	                        this._values.length--;
	                        if (SameValueZero(key, this._cacheKey)) {
	                            this._cacheKey = cacheSentinel;
	                            this._cacheIndex = -2;
	                        }
	                        return true;
	                    }
	                    return false;
	                };
	                Map.prototype.clear = function () {
	                    this._keys.length = 0;
	                    this._values.length = 0;
	                    this._cacheKey = cacheSentinel;
	                    this._cacheIndex = -2;
	                };
	                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
	                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
	                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
	                Map.prototype["@@iterator"] = function () { return this.entries(); };
	                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
	                Map.prototype._find = function (key, insert) {
	                    if (!SameValueZero(this._cacheKey, key)) {
	                        this._cacheIndex = -1;
	                        for (var i = 0; i < this._keys.length; i++) {
	                            if (SameValueZero(this._keys[i], key)) {
	                                this._cacheIndex = i;
	                                break;
	                            }
	                        }
	                    }
	                    if (this._cacheIndex < 0 && insert) {
	                        this._cacheIndex = this._keys.length;
	                        this._keys.push(key);
	                        this._values.push(undefined);
	                    }
	                    return this._cacheIndex;
	                };
	                return Map;
	            }());
	            return Map;
	            function getKey(key, _) {
	                return key;
	            }
	            function getValue(_, value) {
	                return value;
	            }
	            function getEntry(key, value) {
	                return [key, value];
	            }
	        }
	        // naive Set shim
	        function CreateSetPolyfill() {
	            var Set = /** @class */ (function () {
	                function Set() {
	                    this._map = new _Map();
	                }
	                Object.defineProperty(Set.prototype, "size", {
	                    get: function () { return this._map.size; },
	                    enumerable: true,
	                    configurable: true
	                });
	                Set.prototype.has = function (value) { return this._map.has(value); };
	                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
	                Set.prototype.delete = function (value) { return this._map.delete(value); };
	                Set.prototype.clear = function () { this._map.clear(); };
	                Set.prototype.keys = function () { return this._map.keys(); };
	                Set.prototype.values = function () { return this._map.keys(); };
	                Set.prototype.entries = function () { return this._map.entries(); };
	                Set.prototype["@@iterator"] = function () { return this.keys(); };
	                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
	                return Set;
	            }());
	            return Set;
	        }
	        // naive WeakMap shim
	        function CreateWeakMapPolyfill() {
	            var UUID_SIZE = 16;
	            var keys = HashMap.create();
	            var rootKey = CreateUniqueKey();
	            return /** @class */ (function () {
	                function WeakMap() {
	                    this._key = CreateUniqueKey();
	                }
	                WeakMap.prototype.has = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? HashMap.has(table, this._key) : false;
	                };
	                WeakMap.prototype.get = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
	                };
	                WeakMap.prototype.set = function (target, value) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
	                    table[this._key] = value;
	                    return this;
	                };
	                WeakMap.prototype.delete = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? delete table[this._key] : false;
	                };
	                WeakMap.prototype.clear = function () {
	                    // NOTE: not a real clear, just makes the previous data unreachable
	                    this._key = CreateUniqueKey();
	                };
	                return WeakMap;
	            }());
	            function CreateUniqueKey() {
	                var key;
	                do
	                    key = "@@WeakMap@@" + CreateUUID();
	                while (HashMap.has(keys, key));
	                keys[key] = true;
	                return key;
	            }
	            function GetOrCreateWeakMapTable(target, create) {
	                if (!hasOwn.call(target, rootKey)) {
	                    if (!create)
	                        return undefined;
	                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
	                }
	                return target[rootKey];
	            }
	            function FillRandomBytes(buffer, size) {
	                for (var i = 0; i < size; ++i)
	                    buffer[i] = Math.random() * 0xff | 0;
	                return buffer;
	            }
	            function GenRandomBytes(size) {
	                if (typeof Uint8Array === "function") {
	                    var array = new Uint8Array(size);
	                    if (typeof crypto !== "undefined") {
	                        crypto.getRandomValues(array);
	                    }
	                    else if (typeof msCrypto !== "undefined") {
	                        msCrypto.getRandomValues(array);
	                    }
	                    else {
	                        FillRandomBytes(array, size);
	                    }
	                    return array;
	                }
	                return FillRandomBytes(new Array(size), size);
	            }
	            function CreateUUID() {
	                var data = GenRandomBytes(UUID_SIZE);
	                // mark as random - RFC 4122 § 4.4
	                data[6] = data[6] & 0x4f | 0x40;
	                data[8] = data[8] & 0xbf | 0x80;
	                var result = "";
	                for (var offset = 0; offset < UUID_SIZE; ++offset) {
	                    var byte = data[offset];
	                    if (offset === 4 || offset === 6 || offset === 8)
	                        result += "-";
	                    if (byte < 16)
	                        result += "0";
	                    result += byte.toString(16).toLowerCase();
	                }
	                return result;
	            }
	        }
	        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
	        function MakeDictionary(obj) {
	            obj.__ = undefined;
	            delete obj.__;
	            return obj;
	        }
	    });
	})(Reflect || (Reflect = {}));
	return _Reflect;
}

require_Reflect();

var build = {};

/*!
 * MIT License
 * 
 * Copyright (c) 2017-2024 Peculiar Ventures, LLC
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

var hasRequiredBuild;

function requireBuild () {
	if (hasRequiredBuild) return build;
	hasRequiredBuild = 1;

	const ARRAY_BUFFER_NAME = "[object ArrayBuffer]";
	class BufferSourceConverter {
	    static isArrayBuffer(data) {
	        return Object.prototype.toString.call(data) === ARRAY_BUFFER_NAME;
	    }
	    static toArrayBuffer(data) {
	        if (this.isArrayBuffer(data)) {
	            return data;
	        }
	        if (data.byteLength === data.buffer.byteLength) {
	            return data.buffer;
	        }
	        if (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
	            return data.buffer;
	        }
	        return this.toUint8Array(data.buffer)
	            .slice(data.byteOffset, data.byteOffset + data.byteLength)
	            .buffer;
	    }
	    static toUint8Array(data) {
	        return this.toView(data, Uint8Array);
	    }
	    static toView(data, type) {
	        if (data.constructor === type) {
	            return data;
	        }
	        if (this.isArrayBuffer(data)) {
	            return new type(data);
	        }
	        if (this.isArrayBufferView(data)) {
	            return new type(data.buffer, data.byteOffset, data.byteLength);
	        }
	        throw new TypeError("The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");
	    }
	    static isBufferSource(data) {
	        return this.isArrayBufferView(data)
	            || this.isArrayBuffer(data);
	    }
	    static isArrayBufferView(data) {
	        return ArrayBuffer.isView(data)
	            || (data && this.isArrayBuffer(data.buffer));
	    }
	    static isEqual(a, b) {
	        const aView = BufferSourceConverter.toUint8Array(a);
	        const bView = BufferSourceConverter.toUint8Array(b);
	        if (aView.length !== bView.byteLength) {
	            return false;
	        }
	        for (let i = 0; i < aView.length; i++) {
	            if (aView[i] !== bView[i]) {
	                return false;
	            }
	        }
	        return true;
	    }
	    static concat(...args) {
	        let buffers;
	        if (Array.isArray(args[0]) && !(args[1] instanceof Function)) {
	            buffers = args[0];
	        }
	        else if (Array.isArray(args[0]) && args[1] instanceof Function) {
	            buffers = args[0];
	        }
	        else {
	            if (args[args.length - 1] instanceof Function) {
	                buffers = args.slice(0, args.length - 1);
	            }
	            else {
	                buffers = args;
	            }
	        }
	        let size = 0;
	        for (const buffer of buffers) {
	            size += buffer.byteLength;
	        }
	        const res = new Uint8Array(size);
	        let offset = 0;
	        for (const buffer of buffers) {
	            const view = this.toUint8Array(buffer);
	            res.set(view, offset);
	            offset += view.length;
	        }
	        if (args[args.length - 1] instanceof Function) {
	            return this.toView(res, args[args.length - 1]);
	        }
	        return res.buffer;
	    }
	}

	const STRING_TYPE = "string";
	const HEX_REGEX = /^[0-9a-f\s]+$/i;
	const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
	const BASE64URL_REGEX = /^[a-zA-Z0-9-_]+$/;
	class Utf8Converter {
	    static fromString(text) {
	        const s = unescape(encodeURIComponent(text));
	        const uintArray = new Uint8Array(s.length);
	        for (let i = 0; i < s.length; i++) {
	            uintArray[i] = s.charCodeAt(i);
	        }
	        return uintArray.buffer;
	    }
	    static toString(buffer) {
	        const buf = BufferSourceConverter.toUint8Array(buffer);
	        let encodedString = "";
	        for (let i = 0; i < buf.length; i++) {
	            encodedString += String.fromCharCode(buf[i]);
	        }
	        const decodedString = decodeURIComponent(escape(encodedString));
	        return decodedString;
	    }
	}
	class Utf16Converter {
	    static toString(buffer, littleEndian = false) {
	        const arrayBuffer = BufferSourceConverter.toArrayBuffer(buffer);
	        const dataView = new DataView(arrayBuffer);
	        let res = "";
	        for (let i = 0; i < arrayBuffer.byteLength; i += 2) {
	            const code = dataView.getUint16(i, littleEndian);
	            res += String.fromCharCode(code);
	        }
	        return res;
	    }
	    static fromString(text, littleEndian = false) {
	        const res = new ArrayBuffer(text.length * 2);
	        const dataView = new DataView(res);
	        for (let i = 0; i < text.length; i++) {
	            dataView.setUint16(i * 2, text.charCodeAt(i), littleEndian);
	        }
	        return res;
	    }
	}
	class Convert {
	    static isHex(data) {
	        return typeof data === STRING_TYPE
	            && HEX_REGEX.test(data);
	    }
	    static isBase64(data) {
	        return typeof data === STRING_TYPE
	            && BASE64_REGEX.test(data);
	    }
	    static isBase64Url(data) {
	        return typeof data === STRING_TYPE
	            && BASE64URL_REGEX.test(data);
	    }
	    static ToString(buffer, enc = "utf8") {
	        const buf = BufferSourceConverter.toUint8Array(buffer);
	        switch (enc.toLowerCase()) {
	            case "utf8":
	                return this.ToUtf8String(buf);
	            case "binary":
	                return this.ToBinary(buf);
	            case "hex":
	                return this.ToHex(buf);
	            case "base64":
	                return this.ToBase64(buf);
	            case "base64url":
	                return this.ToBase64Url(buf);
	            case "utf16le":
	                return Utf16Converter.toString(buf, true);
	            case "utf16":
	            case "utf16be":
	                return Utf16Converter.toString(buf);
	            default:
	                throw new Error(`Unknown type of encoding '${enc}'`);
	        }
	    }
	    static FromString(str, enc = "utf8") {
	        if (!str) {
	            return new ArrayBuffer(0);
	        }
	        switch (enc.toLowerCase()) {
	            case "utf8":
	                return this.FromUtf8String(str);
	            case "binary":
	                return this.FromBinary(str);
	            case "hex":
	                return this.FromHex(str);
	            case "base64":
	                return this.FromBase64(str);
	            case "base64url":
	                return this.FromBase64Url(str);
	            case "utf16le":
	                return Utf16Converter.fromString(str, true);
	            case "utf16":
	            case "utf16be":
	                return Utf16Converter.fromString(str);
	            default:
	                throw new Error(`Unknown type of encoding '${enc}'`);
	        }
	    }
	    static ToBase64(buffer) {
	        const buf = BufferSourceConverter.toUint8Array(buffer);
	        if (typeof btoa !== "undefined") {
	            const binary = this.ToString(buf, "binary");
	            return btoa(binary);
	        }
	        else {
	            return Buffer.from(buf).toString("base64");
	        }
	    }
	    static FromBase64(base64) {
	        const formatted = this.formatString(base64);
	        if (!formatted) {
	            return new ArrayBuffer(0);
	        }
	        if (!Convert.isBase64(formatted)) {
	            throw new TypeError("Argument 'base64Text' is not Base64 encoded");
	        }
	        if (typeof atob !== "undefined") {
	            return this.FromBinary(atob(formatted));
	        }
	        else {
	            return new Uint8Array(Buffer.from(formatted, "base64")).buffer;
	        }
	    }
	    static FromBase64Url(base64url) {
	        const formatted = this.formatString(base64url);
	        if (!formatted) {
	            return new ArrayBuffer(0);
	        }
	        if (!Convert.isBase64Url(formatted)) {
	            throw new TypeError("Argument 'base64url' is not Base64Url encoded");
	        }
	        return this.FromBase64(this.Base64Padding(formatted.replace(/\-/g, "+").replace(/\_/g, "/")));
	    }
	    static ToBase64Url(data) {
	        return this.ToBase64(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
	    }
	    static FromUtf8String(text, encoding = Convert.DEFAULT_UTF8_ENCODING) {
	        switch (encoding) {
	            case "ascii":
	                return this.FromBinary(text);
	            case "utf8":
	                return Utf8Converter.fromString(text);
	            case "utf16":
	            case "utf16be":
	                return Utf16Converter.fromString(text);
	            case "utf16le":
	            case "usc2":
	                return Utf16Converter.fromString(text, true);
	            default:
	                throw new Error(`Unknown type of encoding '${encoding}'`);
	        }
	    }
	    static ToUtf8String(buffer, encoding = Convert.DEFAULT_UTF8_ENCODING) {
	        switch (encoding) {
	            case "ascii":
	                return this.ToBinary(buffer);
	            case "utf8":
	                return Utf8Converter.toString(buffer);
	            case "utf16":
	            case "utf16be":
	                return Utf16Converter.toString(buffer);
	            case "utf16le":
	            case "usc2":
	                return Utf16Converter.toString(buffer, true);
	            default:
	                throw new Error(`Unknown type of encoding '${encoding}'`);
	        }
	    }
	    static FromBinary(text) {
	        const stringLength = text.length;
	        const resultView = new Uint8Array(stringLength);
	        for (let i = 0; i < stringLength; i++) {
	            resultView[i] = text.charCodeAt(i);
	        }
	        return resultView.buffer;
	    }
	    static ToBinary(buffer) {
	        const buf = BufferSourceConverter.toUint8Array(buffer);
	        let res = "";
	        for (let i = 0; i < buf.length; i++) {
	            res += String.fromCharCode(buf[i]);
	        }
	        return res;
	    }
	    static ToHex(buffer) {
	        const buf = BufferSourceConverter.toUint8Array(buffer);
	        let result = "";
	        const len = buf.length;
	        for (let i = 0; i < len; i++) {
	            const byte = buf[i];
	            if (byte < 16) {
	                result += "0";
	            }
	            result += byte.toString(16);
	        }
	        return result;
	    }
	    static FromHex(hexString) {
	        let formatted = this.formatString(hexString);
	        if (!formatted) {
	            return new ArrayBuffer(0);
	        }
	        if (!Convert.isHex(formatted)) {
	            throw new TypeError("Argument 'hexString' is not HEX encoded");
	        }
	        if (formatted.length % 2) {
	            formatted = `0${formatted}`;
	        }
	        const res = new Uint8Array(formatted.length / 2);
	        for (let i = 0; i < formatted.length; i = i + 2) {
	            const c = formatted.slice(i, i + 2);
	            res[i / 2] = parseInt(c, 16);
	        }
	        return res.buffer;
	    }
	    static ToUtf16String(buffer, littleEndian = false) {
	        return Utf16Converter.toString(buffer, littleEndian);
	    }
	    static FromUtf16String(text, littleEndian = false) {
	        return Utf16Converter.fromString(text, littleEndian);
	    }
	    static Base64Padding(base64) {
	        const padCount = 4 - (base64.length % 4);
	        if (padCount < 4) {
	            for (let i = 0; i < padCount; i++) {
	                base64 += "=";
	            }
	        }
	        return base64;
	    }
	    static formatString(data) {
	        return (data === null || data === void 0 ? void 0 : data.replace(/[\n\r\t ]/g, "")) || "";
	    }
	}
	Convert.DEFAULT_UTF8_ENCODING = "utf8";

	function assign(target, ...sources) {
	    const res = arguments[0];
	    for (let i = 1; i < arguments.length; i++) {
	        const obj = arguments[i];
	        for (const prop in obj) {
	            res[prop] = obj[prop];
	        }
	    }
	    return res;
	}
	function combine(...buf) {
	    const totalByteLength = buf.map((item) => item.byteLength).reduce((prev, cur) => prev + cur);
	    const res = new Uint8Array(totalByteLength);
	    let currentPos = 0;
	    buf.map((item) => new Uint8Array(item)).forEach((arr) => {
	        for (const item2 of arr) {
	            res[currentPos++] = item2;
	        }
	    });
	    return res.buffer;
	}
	function isEqual(bytes1, bytes2) {
	    if (!(bytes1 && bytes2)) {
	        return false;
	    }
	    if (bytes1.byteLength !== bytes2.byteLength) {
	        return false;
	    }
	    const b1 = new Uint8Array(bytes1);
	    const b2 = new Uint8Array(bytes2);
	    for (let i = 0; i < bytes1.byteLength; i++) {
	        if (b1[i] !== b2[i]) {
	            return false;
	        }
	    }
	    return true;
	}

	build.BufferSourceConverter = BufferSourceConverter;
	build.Convert = Convert;
	build.assign = assign;
	build.combine = combine;
	build.isEqual = isEqual;
	return build;
}

var buildExports = requireBuild();

/*!
 Copyright (c) Peculiar Ventures, LLC
*/
function utilFromBase(inputBuffer, inputBase) {
    let result = 0;
    if (inputBuffer.length === 1) {
        return inputBuffer[0];
    }
    for (let i = (inputBuffer.length - 1); i >= 0; i--) {
        result += inputBuffer[(inputBuffer.length - 1) - i] * Math.pow(2, inputBase * i);
    }
    return result;
}
function utilToBase(value, base, reserved = (-1)) {
    const internalReserved = reserved;
    let internalValue = value;
    let result = 0;
    let biggest = Math.pow(2, base);
    for (let i = 1; i < 8; i++) {
        if (value < biggest) {
            let retBuf;
            if (internalReserved < 0) {
                retBuf = new ArrayBuffer(i);
                result = i;
            }
            else {
                if (internalReserved < i) {
                    return (new ArrayBuffer(0));
                }
                retBuf = new ArrayBuffer(internalReserved);
                result = internalReserved;
            }
            const retView = new Uint8Array(retBuf);
            for (let j = (i - 1); j >= 0; j--) {
                const basis = Math.pow(2, j * base);
                retView[result - j - 1] = Math.floor(internalValue / basis);
                internalValue -= (retView[result - j - 1]) * basis;
            }
            return retBuf;
        }
        biggest *= Math.pow(2, base);
    }
    return new ArrayBuffer(0);
}
function utilConcatView(...views) {
    let outputLength = 0;
    let prevLength = 0;
    for (const view of views) {
        outputLength += view.length;
    }
    const retBuf = new ArrayBuffer(outputLength);
    const retView = new Uint8Array(retBuf);
    for (const view of views) {
        retView.set(view, prevLength);
        prevLength += view.length;
    }
    return retView;
}
function utilDecodeTC() {
    const buf = new Uint8Array(this.valueHex);
    if (this.valueHex.byteLength >= 2) {
        const condition1 = (buf[0] === 0xFF) && (buf[1] & 0x80);
        const condition2 = (buf[0] === 0x00) && ((buf[1] & 0x80) === 0x00);
        if (condition1 || condition2) {
            this.warnings.push("Needlessly long format");
        }
    }
    const bigIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
    const bigIntView = new Uint8Array(bigIntBuffer);
    for (let i = 0; i < this.valueHex.byteLength; i++) {
        bigIntView[i] = 0;
    }
    bigIntView[0] = (buf[0] & 0x80);
    const bigInt = utilFromBase(bigIntView, 8);
    const smallIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
    const smallIntView = new Uint8Array(smallIntBuffer);
    for (let j = 0; j < this.valueHex.byteLength; j++) {
        smallIntView[j] = buf[j];
    }
    smallIntView[0] &= 0x7F;
    const smallInt = utilFromBase(smallIntView, 8);
    return (smallInt - bigInt);
}
function utilEncodeTC(value) {
    const modValue = (value < 0) ? (value * (-1)) : value;
    let bigInt = 128;
    for (let i = 1; i < 8; i++) {
        if (modValue <= bigInt) {
            if (value < 0) {
                const smallInt = bigInt - modValue;
                const retBuf = utilToBase(smallInt, 8, i);
                const retView = new Uint8Array(retBuf);
                retView[0] |= 0x80;
                return retBuf;
            }
            let retBuf = utilToBase(modValue, 8, i);
            let retView = new Uint8Array(retBuf);
            if (retView[0] & 0x80) {
                const tempBuf = retBuf.slice(0);
                const tempView = new Uint8Array(tempBuf);
                retBuf = new ArrayBuffer(retBuf.byteLength + 1);
                retView = new Uint8Array(retBuf);
                for (let k = 0; k < tempBuf.byteLength; k++) {
                    retView[k + 1] = tempView[k];
                }
                retView[0] = 0x00;
            }
            return retBuf;
        }
        bigInt *= Math.pow(2, 8);
    }
    return (new ArrayBuffer(0));
}
function isEqualBuffer(inputBuffer1, inputBuffer2) {
    if (inputBuffer1.byteLength !== inputBuffer2.byteLength) {
        return false;
    }
    const view1 = new Uint8Array(inputBuffer1);
    const view2 = new Uint8Array(inputBuffer2);
    for (let i = 0; i < view1.length; i++) {
        if (view1[i] !== view2[i]) {
            return false;
        }
    }
    return true;
}
function padNumber(inputNumber, fullLength) {
    const str = inputNumber.toString(10);
    if (fullLength < str.length) {
        return "";
    }
    const dif = fullLength - str.length;
    const padding = new Array(dif);
    for (let i = 0; i < dif; i++) {
        padding[i] = "0";
    }
    const paddingString = padding.join("");
    return paddingString.concat(str);
}

/*!
 * Copyright (c) 2014, GMO GlobalSign
 * Copyright (c) 2015-2022, Peculiar Ventures
 * All rights reserved.
 * 
 * Author 2014-2019, Yury Strozhevsky
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * 
 * * Redistributions in binary form must reproduce the above copyright notice, this
 *   list of conditions and the following disclaimer in the documentation and/or
 *   other materials provided with the distribution.
 * 
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 */

function assertBigInt() {
    if (typeof BigInt === "undefined") {
        throw new Error("BigInt is not defined. Your environment doesn't implement BigInt.");
    }
}
function concat(buffers) {
    let outputLength = 0;
    let prevLength = 0;
    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        outputLength += buffer.byteLength;
    }
    const retView = new Uint8Array(outputLength);
    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        retView.set(new Uint8Array(buffer), prevLength);
        prevLength += buffer.byteLength;
    }
    return retView.buffer;
}
function checkBufferParams(baseBlock, inputBuffer, inputOffset, inputLength) {
    if (!(inputBuffer instanceof Uint8Array)) {
        baseBlock.error = "Wrong parameter: inputBuffer must be 'Uint8Array'";
        return false;
    }
    if (!inputBuffer.byteLength) {
        baseBlock.error = "Wrong parameter: inputBuffer has zero length";
        return false;
    }
    if (inputOffset < 0) {
        baseBlock.error = "Wrong parameter: inputOffset less than zero";
        return false;
    }
    if (inputLength < 0) {
        baseBlock.error = "Wrong parameter: inputLength less than zero";
        return false;
    }
    if ((inputBuffer.byteLength - inputOffset - inputLength) < 0) {
        baseBlock.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
        return false;
    }
    return true;
}

class ViewWriter {
    constructor() {
        this.items = [];
    }
    write(buf) {
        this.items.push(buf);
    }
    final() {
        return concat(this.items);
    }
}

const powers2 = [new Uint8Array([1])];
const digitsString = "0123456789";
const NAME$1 = "name";
const VALUE_HEX_VIEW = "valueHexView";
const IS_HEX_ONLY = "isHexOnly";
const ID_BLOCK = "idBlock";
const TAG_CLASS = "tagClass";
const TAG_NUMBER = "tagNumber";
const IS_CONSTRUCTED = "isConstructed";
const FROM_BER = "fromBER";
const TO_BER = "toBER";
const LOCAL = "local";
const EMPTY_STRING = "";
const EMPTY_BUFFER = new ArrayBuffer(0);
const EMPTY_VIEW = new Uint8Array(0);
const END_OF_CONTENT_NAME = "EndOfContent";
const OCTET_STRING_NAME = "OCTET STRING";
const BIT_STRING_NAME = "BIT STRING";

function HexBlock(BaseClass) {
    var _a;
    return _a = class Some extends BaseClass {
            get valueHex() {
                return this.valueHexView.slice().buffer;
            }
            set valueHex(value) {
                this.valueHexView = new Uint8Array(value);
            }
            constructor(...args) {
                var _b;
                super(...args);
                const params = args[0] || {};
                this.isHexOnly = (_b = params.isHexOnly) !== null && _b !== void 0 ? _b : false;
                this.valueHexView = params.valueHex ? buildExports.BufferSourceConverter.toUint8Array(params.valueHex) : EMPTY_VIEW;
            }
            fromBER(inputBuffer, inputOffset, inputLength, _context) {
                const view = inputBuffer instanceof ArrayBuffer ? new Uint8Array(inputBuffer) : inputBuffer;
                if (!checkBufferParams(this, view, inputOffset, inputLength)) {
                    return -1;
                }
                const endLength = inputOffset + inputLength;
                this.valueHexView = view.subarray(inputOffset, endLength);
                if (!this.valueHexView.length) {
                    this.warnings.push("Zero buffer length");
                    return inputOffset;
                }
                this.blockLength = inputLength;
                return endLength;
            }
            toBER(sizeOnly = false) {
                if (!this.isHexOnly) {
                    this.error = "Flag 'isHexOnly' is not set, abort";
                    return EMPTY_BUFFER;
                }
                if (sizeOnly) {
                    return new ArrayBuffer(this.valueHexView.byteLength);
                }
                return (this.valueHexView.byteLength === this.valueHexView.buffer.byteLength)
                    ? this.valueHexView.buffer
                    : this.valueHexView.slice().buffer;
            }
            toJSON() {
                return {
                    ...super.toJSON(),
                    isHexOnly: this.isHexOnly,
                    valueHex: buildExports.Convert.ToHex(this.valueHexView),
                };
            }
        },
        _a.NAME = "hexBlock",
        _a;
}

class LocalBaseBlock {
    static blockName() {
        return this.NAME;
    }
    get valueBeforeDecode() {
        return this.valueBeforeDecodeView.slice().buffer;
    }
    set valueBeforeDecode(value) {
        this.valueBeforeDecodeView = new Uint8Array(value);
    }
    constructor({ blockLength = 0, error = EMPTY_STRING, warnings = [], valueBeforeDecode = EMPTY_VIEW, } = {}) {
        this.blockLength = blockLength;
        this.error = error;
        this.warnings = warnings;
        this.valueBeforeDecodeView = buildExports.BufferSourceConverter.toUint8Array(valueBeforeDecode);
    }
    toJSON() {
        return {
            blockName: this.constructor.NAME,
            blockLength: this.blockLength,
            error: this.error,
            warnings: this.warnings,
            valueBeforeDecode: buildExports.Convert.ToHex(this.valueBeforeDecodeView),
        };
    }
}
LocalBaseBlock.NAME = "baseBlock";

class ValueBlock extends LocalBaseBlock {
    fromBER(_inputBuffer, _inputOffset, _inputLength, _context) {
        throw TypeError("User need to make a specific function in a class which extends 'ValueBlock'");
    }
    toBER(_sizeOnly, _writer) {
        throw TypeError("User need to make a specific function in a class which extends 'ValueBlock'");
    }
}
ValueBlock.NAME = "valueBlock";

class LocalIdentificationBlock extends HexBlock(LocalBaseBlock) {
    constructor({ idBlock = {} } = {}) {
        var _a, _b, _c, _d;
        super();
        if (idBlock) {
            this.isHexOnly = (_a = idBlock.isHexOnly) !== null && _a !== void 0 ? _a : false;
            this.valueHexView = idBlock.valueHex
                ? buildExports.BufferSourceConverter.toUint8Array(idBlock.valueHex)
                : EMPTY_VIEW;
            this.tagClass = (_b = idBlock.tagClass) !== null && _b !== void 0 ? _b : -1;
            this.tagNumber = (_c = idBlock.tagNumber) !== null && _c !== void 0 ? _c : -1;
            this.isConstructed = (_d = idBlock.isConstructed) !== null && _d !== void 0 ? _d : false;
        }
        else {
            this.tagClass = -1;
            this.tagNumber = -1;
            this.isConstructed = false;
        }
    }
    toBER(sizeOnly = false) {
        let firstOctet = 0;
        switch (this.tagClass) {
            case 1:
                firstOctet |= 0x00;
                break;
            case 2:
                firstOctet |= 0x40;
                break;
            case 3:
                firstOctet |= 0x80;
                break;
            case 4:
                firstOctet |= 0xC0;
                break;
            default:
                this.error = "Unknown tag class";
                return EMPTY_BUFFER;
        }
        if (this.isConstructed)
            firstOctet |= 0x20;
        if (this.tagNumber < 31 && !this.isHexOnly) {
            const retView = new Uint8Array(1);
            if (!sizeOnly) {
                let number = this.tagNumber;
                number &= 0x1F;
                firstOctet |= number;
                retView[0] = firstOctet;
            }
            return retView.buffer;
        }
        if (!this.isHexOnly) {
            const encodedBuf = utilToBase(this.tagNumber, 7);
            const encodedView = new Uint8Array(encodedBuf);
            const size = encodedBuf.byteLength;
            const retView = new Uint8Array(size + 1);
            retView[0] = (firstOctet | 0x1F);
            if (!sizeOnly) {
                for (let i = 0; i < (size - 1); i++)
                    retView[i + 1] = encodedView[i] | 0x80;
                retView[size] = encodedView[size - 1];
            }
            return retView.buffer;
        }
        const retView = new Uint8Array(this.valueHexView.byteLength + 1);
        retView[0] = (firstOctet | 0x1F);
        if (!sizeOnly) {
            const curView = this.valueHexView;
            for (let i = 0; i < (curView.length - 1); i++)
                retView[i + 1] = curView[i] | 0x80;
            retView[this.valueHexView.byteLength] = curView[curView.length - 1];
        }
        return retView.buffer;
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        const inputView = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
        if (!checkBufferParams(this, inputView, inputOffset, inputLength)) {
            return -1;
        }
        const intBuffer = inputView.subarray(inputOffset, inputOffset + inputLength);
        if (intBuffer.length === 0) {
            this.error = "Zero buffer length";
            return -1;
        }
        const tagClassMask = intBuffer[0] & 0xC0;
        switch (tagClassMask) {
            case 0x00:
                this.tagClass = (1);
                break;
            case 0x40:
                this.tagClass = (2);
                break;
            case 0x80:
                this.tagClass = (3);
                break;
            case 0xC0:
                this.tagClass = (4);
                break;
            default:
                this.error = "Unknown tag class";
                return -1;
        }
        this.isConstructed = (intBuffer[0] & 0x20) === 0x20;
        this.isHexOnly = false;
        const tagNumberMask = intBuffer[0] & 0x1F;
        if (tagNumberMask !== 0x1F) {
            this.tagNumber = (tagNumberMask);
            this.blockLength = 1;
        }
        else {
            let count = 0;
            while (true) {
                const tagByteIndex = count + 1;
                if (tagByteIndex >= intBuffer.length) {
                    this.error = "End of input reached before message was fully decoded";
                    return -1;
                }
                count++;
                if ((intBuffer[tagByteIndex] & 0x80) === 0x00)
                    break;
            }
            this.blockLength = (count + 1);
            const intTagNumberBuffer = this.valueHexView = new Uint8Array(count);
            for (let i = 0; i < count; i++)
                intTagNumberBuffer[i] = intBuffer[i + 1] & 0x7F;
            if (this.blockLength <= 9)
                this.tagNumber = utilFromBase(intTagNumberBuffer, 7);
            else {
                this.isHexOnly = true;
                this.warnings.push("Tag too long, represented as hex-coded");
            }
        }
        if (((this.tagClass === 1))
            && (this.isConstructed)) {
            switch (this.tagNumber) {
                case 1:
                case 2:
                case 5:
                case 6:
                case 9:
                case 13:
                case 14:
                case 23:
                case 24:
                case 31:
                case 32:
                case 33:
                case 34:
                    this.error = "Constructed encoding used for primitive type";
                    return -1;
            }
        }
        return (inputOffset + this.blockLength);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            tagClass: this.tagClass,
            tagNumber: this.tagNumber,
            isConstructed: this.isConstructed,
        };
    }
}
LocalIdentificationBlock.NAME = "identificationBlock";

class LocalLengthBlock extends LocalBaseBlock {
    constructor({ lenBlock = {} } = {}) {
        var _a, _b, _c;
        super();
        this.isIndefiniteForm = (_a = lenBlock.isIndefiniteForm) !== null && _a !== void 0 ? _a : false;
        this.longFormUsed = (_b = lenBlock.longFormUsed) !== null && _b !== void 0 ? _b : false;
        this.length = (_c = lenBlock.length) !== null && _c !== void 0 ? _c : 0;
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        const view = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
        if (!checkBufferParams(this, view, inputOffset, inputLength)) {
            return -1;
        }
        const intBuffer = view.subarray(inputOffset, inputOffset + inputLength);
        if (intBuffer.length === 0) {
            this.error = "Zero buffer length";
            return -1;
        }
        if (intBuffer[0] === 0xFF) {
            this.error = "Length block 0xFF is reserved by standard";
            return -1;
        }
        this.isIndefiniteForm = intBuffer[0] === 0x80;
        if (this.isIndefiniteForm) {
            this.blockLength = 1;
            return (inputOffset + this.blockLength);
        }
        this.longFormUsed = !!(intBuffer[0] & 0x80);
        if (this.longFormUsed === false) {
            this.length = (intBuffer[0]);
            this.blockLength = 1;
            return (inputOffset + this.blockLength);
        }
        const count = intBuffer[0] & 0x7F;
        if (count > 8) {
            this.error = "Too big integer";
            return -1;
        }
        if ((count + 1) > intBuffer.length) {
            this.error = "End of input reached before message was fully decoded";
            return -1;
        }
        const lenOffset = inputOffset + 1;
        const lengthBufferView = view.subarray(lenOffset, lenOffset + count);
        if (lengthBufferView[count - 1] === 0x00)
            this.warnings.push("Needlessly long encoded length");
        this.length = utilFromBase(lengthBufferView, 8);
        if (this.longFormUsed && (this.length <= 127))
            this.warnings.push("Unnecessary usage of long length form");
        this.blockLength = count + 1;
        return (inputOffset + this.blockLength);
    }
    toBER(sizeOnly = false) {
        let retBuf;
        let retView;
        if (this.length > 127)
            this.longFormUsed = true;
        if (this.isIndefiniteForm) {
            retBuf = new ArrayBuffer(1);
            if (sizeOnly === false) {
                retView = new Uint8Array(retBuf);
                retView[0] = 0x80;
            }
            return retBuf;
        }
        if (this.longFormUsed) {
            const encodedBuf = utilToBase(this.length, 8);
            if (encodedBuf.byteLength > 127) {
                this.error = "Too big length";
                return (EMPTY_BUFFER);
            }
            retBuf = new ArrayBuffer(encodedBuf.byteLength + 1);
            if (sizeOnly)
                return retBuf;
            const encodedView = new Uint8Array(encodedBuf);
            retView = new Uint8Array(retBuf);
            retView[0] = encodedBuf.byteLength | 0x80;
            for (let i = 0; i < encodedBuf.byteLength; i++)
                retView[i + 1] = encodedView[i];
            return retBuf;
        }
        retBuf = new ArrayBuffer(1);
        if (sizeOnly === false) {
            retView = new Uint8Array(retBuf);
            retView[0] = this.length;
        }
        return retBuf;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            isIndefiniteForm: this.isIndefiniteForm,
            longFormUsed: this.longFormUsed,
            length: this.length,
        };
    }
}
LocalLengthBlock.NAME = "lengthBlock";

const typeStore = {};

class BaseBlock extends LocalBaseBlock {
    constructor({ name = EMPTY_STRING, optional = false, primitiveSchema, ...parameters } = {}, valueBlockType) {
        super(parameters);
        this.name = name;
        this.optional = optional;
        if (primitiveSchema) {
            this.primitiveSchema = primitiveSchema;
        }
        this.idBlock = new LocalIdentificationBlock(parameters);
        this.lenBlock = new LocalLengthBlock(parameters);
        this.valueBlock = valueBlockType ? new valueBlockType(parameters) : new ValueBlock(parameters);
    }
    fromBER(inputBuffer, inputOffset, inputLength, context) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm)
            ? inputLength
            : this.lenBlock.length, context);
        if (resultOffset === -1) {
            this.error = this.valueBlock.error;
            return resultOffset;
        }
        if (!this.idBlock.error.length)
            this.blockLength += this.idBlock.blockLength;
        if (!this.lenBlock.error.length)
            this.blockLength += this.lenBlock.blockLength;
        if (!this.valueBlock.error.length)
            this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
    }
    toBER(sizeOnly, writer) {
        const _writer = writer || new ViewWriter();
        if (!writer) {
            prepareIndefiniteForm(this);
        }
        const idBlockBuf = this.idBlock.toBER(sizeOnly);
        _writer.write(idBlockBuf);
        if (this.lenBlock.isIndefiniteForm) {
            _writer.write(new Uint8Array([0x80]).buffer);
            this.valueBlock.toBER(sizeOnly, _writer);
            _writer.write(new ArrayBuffer(2));
        }
        else {
            const valueBlockBuf = this.valueBlock.toBER(sizeOnly);
            this.lenBlock.length = valueBlockBuf.byteLength;
            const lenBlockBuf = this.lenBlock.toBER(sizeOnly);
            _writer.write(lenBlockBuf);
            _writer.write(valueBlockBuf);
        }
        if (!writer) {
            return _writer.final();
        }
        return EMPTY_BUFFER;
    }
    toJSON() {
        const object = {
            ...super.toJSON(),
            idBlock: this.idBlock.toJSON(),
            lenBlock: this.lenBlock.toJSON(),
            valueBlock: this.valueBlock.toJSON(),
            name: this.name,
            optional: this.optional,
        };
        if (this.primitiveSchema)
            object.primitiveSchema = this.primitiveSchema.toJSON();
        return object;
    }
    toString(encoding = "ascii") {
        if (encoding === "ascii") {
            return this.onAsciiEncoding();
        }
        return buildExports.Convert.ToHex(this.toBER());
    }
    onAsciiEncoding() {
        const name = this.constructor.NAME;
        const value = buildExports.Convert.ToHex(this.valueBlock.valueBeforeDecodeView);
        return `${name} : ${value}`;
    }
    isEqual(other) {
        if (this === other) {
            return true;
        }
        if (!(other instanceof this.constructor)) {
            return false;
        }
        const thisRaw = this.toBER();
        const otherRaw = other.toBER();
        return isEqualBuffer(thisRaw, otherRaw);
    }
}
BaseBlock.NAME = "BaseBlock";
function prepareIndefiniteForm(baseBlock) {
    var _a;
    if (baseBlock instanceof typeStore.Constructed) {
        for (const value of baseBlock.valueBlock.value) {
            if (prepareIndefiniteForm(value)) {
                baseBlock.lenBlock.isIndefiniteForm = true;
            }
        }
    }
    return !!((_a = baseBlock.lenBlock) === null || _a === void 0 ? void 0 : _a.isIndefiniteForm);
}

class BaseStringBlock extends BaseBlock {
    getValue() {
        return this.valueBlock.value;
    }
    setValue(value) {
        this.valueBlock.value = value;
    }
    constructor({ value = EMPTY_STRING, ...parameters } = {}, stringValueBlockType) {
        super(parameters, stringValueBlockType);
        if (value) {
            this.fromString(value);
        }
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm)
            ? inputLength
            : this.lenBlock.length);
        if (resultOffset === -1) {
            this.error = this.valueBlock.error;
            return resultOffset;
        }
        this.fromBuffer(this.valueBlock.valueHexView);
        if (!this.idBlock.error.length)
            this.blockLength += this.idBlock.blockLength;
        if (!this.lenBlock.error.length)
            this.blockLength += this.lenBlock.blockLength;
        if (!this.valueBlock.error.length)
            this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
    }
    onAsciiEncoding() {
        return `${this.constructor.NAME} : '${this.valueBlock.value}'`;
    }
}
BaseStringBlock.NAME = "BaseStringBlock";

class LocalPrimitiveValueBlock extends HexBlock(ValueBlock) {
    constructor({ isHexOnly = true, ...parameters } = {}) {
        super(parameters);
        this.isHexOnly = isHexOnly;
    }
}
LocalPrimitiveValueBlock.NAME = "PrimitiveValueBlock";

var _a$w;
class Primitive extends BaseBlock {
    constructor(parameters = {}) {
        super(parameters, LocalPrimitiveValueBlock);
        this.idBlock.isConstructed = false;
    }
}
_a$w = Primitive;
(() => {
    typeStore.Primitive = _a$w;
})();
Primitive.NAME = "PRIMITIVE";

const DEFAULT_MAX_DEPTH = 100;
const DEFAULT_MAX_NODES = 10000;
const DEFAULT_MAX_CONTENT_LENGTH = 16 * 1024 * 1024;
const MAX_DEPTH_EXCEEDED_ERROR = "Maximum ASN.1 nesting depth exceeded";
const MAX_NODES_EXCEEDED_ERROR = "Maximum ASN.1 node count exceeded";
const MAX_CONTENT_LENGTH_EXCEEDED_ERROR = "Maximum ASN.1 content length exceeded";
function createFromBerContext(options = {}) {
    var _a, _b, _c;
    return {
        depth: 0,
        maxDepth: (_a = options.maxDepth) !== null && _a !== void 0 ? _a : DEFAULT_MAX_DEPTH,
        nodesCount: 0,
        maxNodes: (_b = options.maxNodes) !== null && _b !== void 0 ? _b : DEFAULT_MAX_NODES,
        maxContentLength: (_c = options.maxContentLength) !== null && _c !== void 0 ? _c : DEFAULT_MAX_CONTENT_LENGTH,
    };
}
function createErrorResult(error) {
    const result = new BaseBlock({}, ValueBlock);
    result.error = error;
    return {
        offset: -1,
        result,
    };
}
function checkNodesLimit(context) {
    context.nodesCount += 1;
    if (context.nodesCount > context.maxNodes) {
        return MAX_NODES_EXCEEDED_ERROR;
    }
    return undefined;
}
function checkContentLengthLimit(inputLength, context) {
    if (inputLength > context.maxContentLength) {
        return MAX_CONTENT_LENGTH_EXCEEDED_ERROR;
    }
    return undefined;
}
function localFromBERWithChildContext(inputBuffer, inputOffset, inputLength, context) {
    const childDepth = context.depth + 1;
    if (childDepth > context.maxDepth) {
        return createErrorResult(MAX_DEPTH_EXCEEDED_ERROR);
    }
    context.depth = childDepth;
    try {
        return localFromBER(inputBuffer, inputOffset, inputLength, context);
    }
    finally {
        context.depth -= 1;
    }
}
function localChangeType(inputObject, newType) {
    if (inputObject instanceof newType) {
        return inputObject;
    }
    const newObject = new newType();
    newObject.idBlock = inputObject.idBlock;
    newObject.lenBlock = inputObject.lenBlock;
    newObject.warnings = inputObject.warnings;
    newObject.valueBeforeDecodeView = inputObject.valueBeforeDecodeView;
    return newObject;
}
function localFromBER(inputBuffer, inputOffset = 0, inputLength = inputBuffer.length, context = createFromBerContext()) {
    const incomingOffset = inputOffset;
    let returnObject = new BaseBlock({}, ValueBlock);
    const baseBlock = new LocalBaseBlock();
    if (!checkBufferParams(baseBlock, inputBuffer, inputOffset, inputLength)) {
        returnObject.error = baseBlock.error;
        return {
            offset: -1,
            result: returnObject,
        };
    }
    const intBuffer = inputBuffer.subarray(inputOffset, inputOffset + inputLength);
    if (!intBuffer.length) {
        returnObject.error = "Zero buffer length";
        return {
            offset: -1,
            result: returnObject,
        };
    }
    const nodesLimitError = checkNodesLimit(context);
    if (nodesLimitError) {
        returnObject.error = nodesLimitError;
        return {
            offset: -1,
            result: returnObject,
        };
    }
    let resultOffset = returnObject.idBlock.fromBER(inputBuffer, inputOffset, inputLength);
    if (returnObject.idBlock.warnings.length) {
        returnObject.warnings.concat(returnObject.idBlock.warnings);
    }
    if (resultOffset === -1) {
        returnObject.error = returnObject.idBlock.error;
        return {
            offset: -1,
            result: returnObject,
        };
    }
    inputOffset = resultOffset;
    inputLength -= returnObject.idBlock.blockLength;
    resultOffset = returnObject.lenBlock.fromBER(inputBuffer, inputOffset, inputLength);
    if (returnObject.lenBlock.warnings.length) {
        returnObject.warnings.concat(returnObject.lenBlock.warnings);
    }
    if (resultOffset === -1) {
        returnObject.error = returnObject.lenBlock.error;
        return {
            offset: -1,
            result: returnObject,
        };
    }
    inputOffset = resultOffset;
    inputLength -= returnObject.lenBlock.blockLength;
    const valueLength = returnObject.lenBlock.isIndefiniteForm ? inputLength : returnObject.lenBlock.length;
    const contentLengthError = checkContentLengthLimit(valueLength, context);
    if (contentLengthError) {
        returnObject.error = contentLengthError;
        return {
            offset: -1,
            result: returnObject,
        };
    }
    if (!returnObject.idBlock.isConstructed
        && returnObject.lenBlock.isIndefiniteForm) {
        returnObject.error = "Indefinite length form used for primitive encoding form";
        return {
            offset: -1,
            result: returnObject,
        };
    }
    let newASN1Type = BaseBlock;
    switch (returnObject.idBlock.tagClass) {
        case 1:
            if ((returnObject.idBlock.tagNumber >= 37)
                && (returnObject.idBlock.isHexOnly === false)) {
                returnObject.error = "UNIVERSAL 37 and upper tags are reserved by ASN.1 standard";
                return {
                    offset: -1,
                    result: returnObject,
                };
            }
            switch (returnObject.idBlock.tagNumber) {
                case 0:
                    if ((returnObject.idBlock.isConstructed)
                        && (returnObject.lenBlock.length > 0)) {
                        returnObject.error = "Type [UNIVERSAL 0] is reserved";
                        return {
                            offset: -1,
                            result: returnObject,
                        };
                    }
                    newASN1Type = typeStore.EndOfContent;
                    break;
                case 1:
                    newASN1Type = typeStore.Boolean;
                    break;
                case 2:
                    newASN1Type = typeStore.Integer;
                    break;
                case 3:
                    newASN1Type = typeStore.BitString;
                    break;
                case 4:
                    newASN1Type = typeStore.OctetString;
                    break;
                case 5:
                    newASN1Type = typeStore.Null;
                    break;
                case 6:
                    newASN1Type = typeStore.ObjectIdentifier;
                    break;
                case 10:
                    newASN1Type = typeStore.Enumerated;
                    break;
                case 12:
                    newASN1Type = typeStore.Utf8String;
                    break;
                case 13:
                    newASN1Type = typeStore.RelativeObjectIdentifier;
                    break;
                case 14:
                    newASN1Type = typeStore.TIME;
                    break;
                case 15:
                    returnObject.error = "[UNIVERSAL 15] is reserved by ASN.1 standard";
                    return {
                        offset: -1,
                        result: returnObject,
                    };
                case 16:
                    newASN1Type = typeStore.Sequence;
                    break;
                case 17:
                    newASN1Type = typeStore.Set;
                    break;
                case 18:
                    newASN1Type = typeStore.NumericString;
                    break;
                case 19:
                    newASN1Type = typeStore.PrintableString;
                    break;
                case 20:
                    newASN1Type = typeStore.TeletexString;
                    break;
                case 21:
                    newASN1Type = typeStore.VideotexString;
                    break;
                case 22:
                    newASN1Type = typeStore.IA5String;
                    break;
                case 23:
                    newASN1Type = typeStore.UTCTime;
                    break;
                case 24:
                    newASN1Type = typeStore.GeneralizedTime;
                    break;
                case 25:
                    newASN1Type = typeStore.GraphicString;
                    break;
                case 26:
                    newASN1Type = typeStore.VisibleString;
                    break;
                case 27:
                    newASN1Type = typeStore.GeneralString;
                    break;
                case 28:
                    newASN1Type = typeStore.UniversalString;
                    break;
                case 29:
                    newASN1Type = typeStore.CharacterString;
                    break;
                case 30:
                    newASN1Type = typeStore.BmpString;
                    break;
                case 31:
                    newASN1Type = typeStore.DATE;
                    break;
                case 32:
                    newASN1Type = typeStore.TimeOfDay;
                    break;
                case 33:
                    newASN1Type = typeStore.DateTime;
                    break;
                case 34:
                    newASN1Type = typeStore.Duration;
                    break;
                default: {
                    const newObject = returnObject.idBlock.isConstructed
                        ? new typeStore.Constructed()
                        : new typeStore.Primitive();
                    newObject.idBlock = returnObject.idBlock;
                    newObject.lenBlock = returnObject.lenBlock;
                    newObject.warnings = returnObject.warnings;
                    returnObject = newObject;
                }
            }
            break;
        case 2:
        case 3:
        case 4:
        default: {
            newASN1Type = returnObject.idBlock.isConstructed
                ? typeStore.Constructed
                : typeStore.Primitive;
        }
    }
    returnObject = localChangeType(returnObject, newASN1Type);
    resultOffset = returnObject.fromBER(inputBuffer, inputOffset, valueLength, context);
    returnObject.valueBeforeDecodeView = inputBuffer.subarray(incomingOffset, incomingOffset + returnObject.blockLength);
    return {
        offset: resultOffset,
        result: returnObject,
    };
}
function fromBER(inputBuffer, options = {}) {
    if (!inputBuffer.byteLength) {
        const result = new BaseBlock({}, ValueBlock);
        result.error = "Input buffer has zero length";
        return {
            offset: -1,
            result,
        };
    }
    return localFromBER(buildExports.BufferSourceConverter.toUint8Array(inputBuffer).slice(), 0, inputBuffer.byteLength, createFromBerContext(options));
}

function checkLen(indefiniteLength, length) {
    if (indefiniteLength) {
        return 1;
    }
    return length;
}
class LocalConstructedValueBlock extends ValueBlock {
    constructor({ value = [], isIndefiniteForm = false, ...parameters } = {}) {
        super(parameters);
        this.value = value;
        this.isIndefiniteForm = isIndefiniteForm;
    }
    fromBER(inputBuffer, inputOffset, inputLength, context) {
        const view = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
        const parseContext = context !== null && context !== void 0 ? context : createFromBerContext();
        if (!checkBufferParams(this, view, inputOffset, inputLength)) {
            return -1;
        }
        this.valueBeforeDecodeView = view.subarray(inputOffset, inputOffset + inputLength);
        if (this.valueBeforeDecodeView.length === 0) {
            this.warnings.push("Zero buffer length");
            return inputOffset;
        }
        let currentOffset = inputOffset;
        while (checkLen(this.isIndefiniteForm, inputLength) > 0) {
            const returnObject = localFromBERWithChildContext(view, currentOffset, inputLength, parseContext);
            if (returnObject.offset === -1) {
                this.error = returnObject.result.error;
                this.warnings.concat(returnObject.result.warnings);
                return -1;
            }
            currentOffset = returnObject.offset;
            this.blockLength += returnObject.result.blockLength;
            inputLength -= returnObject.result.blockLength;
            this.value.push(returnObject.result);
            if (this.isIndefiniteForm && returnObject.result.constructor.NAME === END_OF_CONTENT_NAME) {
                break;
            }
        }
        if (this.isIndefiniteForm) {
            if (this.value[this.value.length - 1].constructor.NAME === END_OF_CONTENT_NAME) {
                this.value.pop();
            }
            else {
                this.warnings.push("No EndOfContent block encoded");
            }
        }
        return currentOffset;
    }
    toBER(sizeOnly, writer) {
        const _writer = writer || new ViewWriter();
        for (let i = 0; i < this.value.length; i++) {
            this.value[i].toBER(sizeOnly, _writer);
        }
        if (!writer) {
            return _writer.final();
        }
        return EMPTY_BUFFER;
    }
    toJSON() {
        const object = {
            ...super.toJSON(),
            isIndefiniteForm: this.isIndefiniteForm,
            value: [],
        };
        for (const value of this.value) {
            object.value.push(value.toJSON());
        }
        return object;
    }
}
LocalConstructedValueBlock.NAME = "ConstructedValueBlock";

var _a$v;
class Constructed extends BaseBlock {
    constructor(parameters = {}) {
        super(parameters, LocalConstructedValueBlock);
        this.idBlock.isConstructed = true;
    }
    fromBER(inputBuffer, inputOffset, inputLength, context) {
        this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, (this.lenBlock.isIndefiniteForm) ? inputLength : this.lenBlock.length, context);
        if (resultOffset === -1) {
            this.error = this.valueBlock.error;
            return resultOffset;
        }
        if (!this.idBlock.error.length)
            this.blockLength += this.idBlock.blockLength;
        if (!this.lenBlock.error.length)
            this.blockLength += this.lenBlock.blockLength;
        if (!this.valueBlock.error.length)
            this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
    }
    onAsciiEncoding() {
        const values = [];
        for (const value of this.valueBlock.value) {
            values.push(value.toString("ascii").split("\n").map((o) => `  ${o}`).join("\n"));
        }
        const blockName = this.idBlock.tagClass === 3
            ? `[${this.idBlock.tagNumber}]`
            : this.constructor.NAME;
        return values.length
            ? `${blockName} :\n${values.join("\n")}`
            : `${blockName} :`;
    }
}
_a$v = Constructed;
(() => {
    typeStore.Constructed = _a$v;
})();
Constructed.NAME = "CONSTRUCTED";

class LocalEndOfContentValueBlock extends ValueBlock {
    fromBER(inputBuffer, inputOffset, _inputLength) {
        return inputOffset;
    }
    toBER(_sizeOnly) {
        return EMPTY_BUFFER;
    }
}
LocalEndOfContentValueBlock.override = "EndOfContentValueBlock";

var _a$u;
class EndOfContent extends BaseBlock {
    constructor(parameters = {}) {
        super(parameters, LocalEndOfContentValueBlock);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 0;
    }
}
_a$u = EndOfContent;
(() => {
    typeStore.EndOfContent = _a$u;
})();
EndOfContent.NAME = END_OF_CONTENT_NAME;

var _a$t;
class Null extends BaseBlock {
    constructor(parameters = {}) {
        super(parameters, ValueBlock);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 5;
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        if (this.lenBlock.length > 0)
            this.warnings.push("Non-zero length of value block for Null type");
        if (!this.idBlock.error.length)
            this.blockLength += this.idBlock.blockLength;
        if (!this.lenBlock.error.length)
            this.blockLength += this.lenBlock.blockLength;
        this.blockLength += inputLength;
        if ((inputOffset + inputLength) > inputBuffer.byteLength) {
            this.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
            return -1;
        }
        return (inputOffset + inputLength);
    }
    toBER(sizeOnly, writer) {
        const retBuf = new ArrayBuffer(2);
        if (!sizeOnly) {
            const retView = new Uint8Array(retBuf);
            retView[0] = 0x05;
            retView[1] = 0x00;
        }
        if (writer) {
            writer.write(retBuf);
        }
        return retBuf;
    }
    onAsciiEncoding() {
        return `${this.constructor.NAME}`;
    }
}
_a$t = Null;
(() => {
    typeStore.Null = _a$t;
})();
Null.NAME = "NULL";

class LocalBooleanValueBlock extends HexBlock(ValueBlock) {
    get value() {
        for (const octet of this.valueHexView) {
            if (octet > 0) {
                return true;
            }
        }
        return false;
    }
    set value(value) {
        this.valueHexView[0] = value ? 0xFF : 0x00;
    }
    constructor({ value, ...parameters } = {}) {
        super(parameters);
        if (parameters.valueHex) {
            this.valueHexView = buildExports.BufferSourceConverter.toUint8Array(parameters.valueHex);
        }
        else {
            this.valueHexView = new Uint8Array(1);
        }
        if (value) {
            this.value = value;
        }
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        const inputView = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
        if (!checkBufferParams(this, inputView, inputOffset, inputLength)) {
            return -1;
        }
        this.valueHexView = inputView.subarray(inputOffset, inputOffset + inputLength);
        if (inputLength > 1)
            this.warnings.push("Boolean value encoded in more then 1 octet");
        this.isHexOnly = true;
        utilDecodeTC.call(this);
        this.blockLength = inputLength;
        return (inputOffset + inputLength);
    }
    toBER() {
        return this.valueHexView.slice();
    }
    toJSON() {
        return {
            ...super.toJSON(),
            value: this.value,
        };
    }
}
LocalBooleanValueBlock.NAME = "BooleanValueBlock";

var _a$s;
class Boolean$1 extends BaseBlock {
    getValue() {
        return this.valueBlock.value;
    }
    setValue(value) {
        this.valueBlock.value = value;
    }
    constructor(parameters = {}) {
        super(parameters, LocalBooleanValueBlock);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 1;
    }
    onAsciiEncoding() {
        return `${this.constructor.NAME} : ${this.getValue}`;
    }
}
_a$s = Boolean$1;
(() => {
    typeStore.Boolean = _a$s;
})();
Boolean$1.NAME = "BOOLEAN";

class LocalOctetStringValueBlock extends HexBlock(LocalConstructedValueBlock) {
    constructor({ isConstructed = false, ...parameters } = {}) {
        super(parameters);
        this.isConstructed = isConstructed;
    }
    fromBER(inputBuffer, inputOffset, inputLength, context) {
        let resultOffset = 0;
        if (this.isConstructed) {
            this.isHexOnly = false;
            resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength, context);
            if (resultOffset === -1)
                return resultOffset;
            for (let i = 0; i < this.value.length; i++) {
                const currentBlockName = this.value[i].constructor.NAME;
                if (currentBlockName === END_OF_CONTENT_NAME) {
                    if (this.isIndefiniteForm)
                        break;
                    else {
                        this.error = "EndOfContent is unexpected, OCTET STRING may consists of OCTET STRINGs only";
                        return -1;
                    }
                }
                if (currentBlockName !== OCTET_STRING_NAME) {
                    this.error = "OCTET STRING may consists of OCTET STRINGs only";
                    return -1;
                }
            }
        }
        else {
            this.isHexOnly = true;
            resultOffset = super.fromBER(inputBuffer, inputOffset, inputLength);
            this.blockLength = inputLength;
        }
        return resultOffset;
    }
    toBER(sizeOnly, writer) {
        if (this.isConstructed)
            return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly, writer);
        return sizeOnly
            ? new ArrayBuffer(this.valueHexView.byteLength)
            : this.valueHexView.slice().buffer;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            isConstructed: this.isConstructed,
        };
    }
}
LocalOctetStringValueBlock.NAME = "OctetStringValueBlock";

var _a$r;
class OctetString$1 extends BaseBlock {
    constructor({ idBlock = {}, lenBlock = {}, ...parameters } = {}) {
        var _b, _c;
        (_b = parameters.isConstructed) !== null && _b !== void 0 ? _b : (parameters.isConstructed = !!((_c = parameters.value) === null || _c === void 0 ? void 0 : _c.length));
        super({
            idBlock: {
                isConstructed: parameters.isConstructed,
                ...idBlock,
            },
            lenBlock: {
                ...lenBlock,
                isIndefiniteForm: !!parameters.isIndefiniteForm,
            },
            ...parameters,
        }, LocalOctetStringValueBlock);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 4;
    }
    fromBER(inputBuffer, inputOffset, inputLength, context) {
        this.valueBlock.isConstructed = this.idBlock.isConstructed;
        this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;
        if (inputLength === 0) {
            if (this.idBlock.error.length === 0)
                this.blockLength += this.idBlock.blockLength;
            if (this.lenBlock.error.length === 0)
                this.blockLength += this.lenBlock.blockLength;
            return inputOffset;
        }
        if (!this.valueBlock.isConstructed) {
            const view = inputBuffer instanceof ArrayBuffer ? new Uint8Array(inputBuffer) : inputBuffer;
            const buf = view.subarray(inputOffset, inputOffset + inputLength);
            try {
                if (buf.byteLength) {
                    const parseContext = context !== null && context !== void 0 ? context : createFromBerContext();
                    const asn = localFromBERWithChildContext(buf, 0, buf.byteLength, parseContext);
                    if (asn.offset !== -1 && asn.offset === inputLength) {
                        this.valueBlock.value = [asn.result];
                    }
                }
            }
            catch {
            }
        }
        return super.fromBER(inputBuffer, inputOffset, inputLength, context);
    }
    onAsciiEncoding() {
        if (this.valueBlock.isConstructed || (this.valueBlock.value && this.valueBlock.value.length)) {
            return Constructed.prototype.onAsciiEncoding.call(this);
        }
        const name = this.constructor.NAME;
        const value = buildExports.Convert.ToHex(this.valueBlock.valueHexView);
        return `${name} : ${value}`;
    }
    getValue() {
        if (!this.idBlock.isConstructed) {
            return this.valueBlock.valueHexView.slice().buffer;
        }
        const array = [];
        for (const content of this.valueBlock.value) {
            if (content instanceof _a$r) {
                array.push(content.valueBlock.valueHexView);
            }
        }
        return buildExports.BufferSourceConverter.concat(array);
    }
}
_a$r = OctetString$1;
(() => {
    typeStore.OctetString = _a$r;
})();
OctetString$1.NAME = OCTET_STRING_NAME;

class LocalBitStringValueBlock extends HexBlock(LocalConstructedValueBlock) {
    constructor({ unusedBits = 0, isConstructed = false, ...parameters } = {}) {
        super(parameters);
        this.unusedBits = unusedBits;
        this.isConstructed = isConstructed;
        this.blockLength = this.valueHexView.byteLength;
    }
    fromBER(inputBuffer, inputOffset, inputLength, context) {
        if (!inputLength) {
            return inputOffset;
        }
        let resultOffset = -1;
        if (this.isConstructed) {
            resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength, context);
            if (resultOffset === -1)
                return resultOffset;
            for (const value of this.value) {
                const currentBlockName = value.constructor.NAME;
                if (currentBlockName === END_OF_CONTENT_NAME) {
                    if (this.isIndefiniteForm)
                        break;
                    else {
                        this.error = "EndOfContent is unexpected, BIT STRING may consists of BIT STRINGs only";
                        return -1;
                    }
                }
                if (currentBlockName !== BIT_STRING_NAME) {
                    this.error = "BIT STRING may consists of BIT STRINGs only";
                    return -1;
                }
                const valueBlock = value.valueBlock;
                if ((this.unusedBits > 0) && (valueBlock.unusedBits > 0)) {
                    this.error = "Using of \"unused bits\" inside constructive BIT STRING allowed for least one only";
                    return -1;
                }
                this.unusedBits = valueBlock.unusedBits;
            }
            return resultOffset;
        }
        const inputView = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
        if (!checkBufferParams(this, inputView, inputOffset, inputLength)) {
            return -1;
        }
        const intBuffer = inputView.subarray(inputOffset, inputOffset + inputLength);
        this.unusedBits = intBuffer[0];
        if (this.unusedBits > 7) {
            this.error = "Unused bits for BitString must be in range 0-7";
            return -1;
        }
        if (!this.unusedBits) {
            const buf = intBuffer.subarray(1);
            try {
                if (buf.byteLength) {
                    const parseContext = context !== null && context !== void 0 ? context : createFromBerContext();
                    const asn = localFromBERWithChildContext(buf, 0, buf.byteLength, parseContext);
                    if (asn.offset !== -1 && asn.offset === (inputLength - 1)) {
                        this.value = [asn.result];
                    }
                }
            }
            catch {
            }
        }
        this.valueHexView = intBuffer.subarray(1);
        this.blockLength = intBuffer.length;
        return (inputOffset + inputLength);
    }
    toBER(sizeOnly, writer) {
        if (this.isConstructed) {
            return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly, writer);
        }
        if (sizeOnly) {
            return new ArrayBuffer(this.valueHexView.byteLength + 1);
        }
        if (!this.valueHexView.byteLength) {
            const empty = new Uint8Array(1);
            empty[0] = 0;
            return empty.buffer;
        }
        const retView = new Uint8Array(this.valueHexView.length + 1);
        retView[0] = this.unusedBits;
        retView.set(this.valueHexView, 1);
        return retView.buffer;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            unusedBits: this.unusedBits,
            isConstructed: this.isConstructed,
        };
    }
}
LocalBitStringValueBlock.NAME = "BitStringValueBlock";

var _a$q;
class BitString$1 extends BaseBlock {
    constructor({ idBlock = {}, lenBlock = {}, ...parameters } = {}) {
        var _b, _c;
        (_b = parameters.isConstructed) !== null && _b !== void 0 ? _b : (parameters.isConstructed = !!((_c = parameters.value) === null || _c === void 0 ? void 0 : _c.length));
        super({
            idBlock: {
                isConstructed: parameters.isConstructed,
                ...idBlock,
            },
            lenBlock: {
                ...lenBlock,
                isIndefiniteForm: !!parameters.isIndefiniteForm,
            },
            ...parameters,
        }, LocalBitStringValueBlock);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 3;
    }
    fromBER(inputBuffer, inputOffset, inputLength, context) {
        this.valueBlock.isConstructed = this.idBlock.isConstructed;
        this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;
        return super.fromBER(inputBuffer, inputOffset, inputLength, context);
    }
    onAsciiEncoding() {
        if (this.valueBlock.isConstructed || (this.valueBlock.value && this.valueBlock.value.length)) {
            return Constructed.prototype.onAsciiEncoding.call(this);
        }
        else {
            const bits = [];
            const valueHex = this.valueBlock.valueHexView;
            for (const byte of valueHex) {
                bits.push(byte.toString(2).padStart(8, "0"));
            }
            const bitsStr = bits.join("");
            const name = this.constructor.NAME;
            const value = bitsStr.substring(0, bitsStr.length - this.valueBlock.unusedBits);
            return `${name} : ${value}`;
        }
    }
}
_a$q = BitString$1;
(() => {
    typeStore.BitString = _a$q;
})();
BitString$1.NAME = BIT_STRING_NAME;

var _a$p;
function viewAdd(first, second) {
    const c = new Uint8Array([0]);
    const firstView = new Uint8Array(first);
    const secondView = new Uint8Array(second);
    let firstViewCopy = firstView.slice(0);
    const firstViewCopyLength = firstViewCopy.length - 1;
    const secondViewCopy = secondView.slice(0);
    const secondViewCopyLength = secondViewCopy.length - 1;
    let value = 0;
    const max = (secondViewCopyLength < firstViewCopyLength) ? firstViewCopyLength : secondViewCopyLength;
    let counter = 0;
    for (let i = max; i >= 0; i--, counter++) {
        switch (true) {
            case (counter < secondViewCopy.length):
                value = firstViewCopy[firstViewCopyLength - counter] + secondViewCopy[secondViewCopyLength - counter] + c[0];
                break;
            default:
                value = firstViewCopy[firstViewCopyLength - counter] + c[0];
        }
        c[0] = value / 10;
        switch (true) {
            case (counter >= firstViewCopy.length):
                firstViewCopy = utilConcatView(new Uint8Array([value % 10]), firstViewCopy);
                break;
            default:
                firstViewCopy[firstViewCopyLength - counter] = value % 10;
        }
    }
    if (c[0] > 0)
        firstViewCopy = utilConcatView(c, firstViewCopy);
    return firstViewCopy;
}
function power2(n) {
    if (n >= powers2.length) {
        for (let p = powers2.length; p <= n; p++) {
            const c = new Uint8Array([0]);
            let digits = (powers2[p - 1]).slice(0);
            for (let i = (digits.length - 1); i >= 0; i--) {
                const newValue = new Uint8Array([(digits[i] << 1) + c[0]]);
                c[0] = newValue[0] / 10;
                digits[i] = newValue[0] % 10;
            }
            if (c[0] > 0)
                digits = utilConcatView(c, digits);
            powers2.push(digits);
        }
    }
    return powers2[n];
}
function viewSub(first, second) {
    let b = 0;
    const firstView = new Uint8Array(first);
    const secondView = new Uint8Array(second);
    const firstViewCopy = firstView.slice(0);
    const firstViewCopyLength = firstViewCopy.length - 1;
    const secondViewCopy = secondView.slice(0);
    const secondViewCopyLength = secondViewCopy.length - 1;
    let value;
    let counter = 0;
    for (let i = secondViewCopyLength; i >= 0; i--, counter++) {
        value = firstViewCopy[firstViewCopyLength - counter] - secondViewCopy[secondViewCopyLength - counter] - b;
        switch (true) {
            case (value < 0):
                b = 1;
                firstViewCopy[firstViewCopyLength - counter] = value + 10;
                break;
            default:
                b = 0;
                firstViewCopy[firstViewCopyLength - counter] = value;
        }
    }
    if (b > 0) {
        for (let i = (firstViewCopyLength - secondViewCopyLength + 1); i >= 0; i--, counter++) {
            value = firstViewCopy[firstViewCopyLength - counter] - b;
            if (value < 0) {
                b = 1;
                firstViewCopy[firstViewCopyLength - counter] = value + 10;
            }
            else {
                b = 0;
                firstViewCopy[firstViewCopyLength - counter] = value;
                break;
            }
        }
    }
    return firstViewCopy.slice();
}
class LocalIntegerValueBlock extends HexBlock(ValueBlock) {
    setValueHex() {
        if (this.valueHexView.length >= 4) {
            this.warnings.push("Too big Integer for decoding, hex only");
            this.isHexOnly = true;
            this._valueDec = 0;
        }
        else {
            this.isHexOnly = false;
            if (this.valueHexView.length > 0) {
                this._valueDec = utilDecodeTC.call(this);
            }
        }
    }
    constructor({ value, ...parameters } = {}) {
        super(parameters);
        this._valueDec = 0;
        if (parameters.valueHex) {
            this.setValueHex();
        }
        if (value !== undefined) {
            this.valueDec = value;
        }
    }
    set valueDec(v) {
        this._valueDec = v;
        this.isHexOnly = false;
        this.valueHexView = new Uint8Array(utilEncodeTC(v));
    }
    get valueDec() {
        return this._valueDec;
    }
    fromDER(inputBuffer, inputOffset, inputLength, expectedLength = 0) {
        const offset = this.fromBER(inputBuffer, inputOffset, inputLength);
        if (offset === -1)
            return offset;
        const view = this.valueHexView;
        if ((view[0] === 0x00) && ((view[1] & 0x80) !== 0)) {
            this.valueHexView = view.subarray(1);
        }
        else {
            if (expectedLength !== 0) {
                if (view.length < expectedLength) {
                    if ((expectedLength - view.length) > 1)
                        expectedLength = view.length + 1;
                    this.valueHexView = view.subarray(expectedLength - view.length);
                }
            }
        }
        return offset;
    }
    toDER(sizeOnly = false) {
        const view = this.valueHexView;
        switch (true) {
            case ((view[0] & 0x80) !== 0):
                {
                    const updatedView = new Uint8Array(this.valueHexView.length + 1);
                    updatedView[0] = 0x00;
                    updatedView.set(view, 1);
                    this.valueHexView = updatedView;
                }
                break;
            case ((view[0] === 0x00) && ((view[1] & 0x80) === 0)):
                {
                    this.valueHexView = this.valueHexView.subarray(1);
                }
                break;
        }
        return this.toBER(sizeOnly);
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = super.fromBER(inputBuffer, inputOffset, inputLength);
        if (resultOffset === -1) {
            return resultOffset;
        }
        this.setValueHex();
        return resultOffset;
    }
    toBER(sizeOnly) {
        return sizeOnly
            ? new ArrayBuffer(this.valueHexView.length)
            : this.valueHexView.slice().buffer;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            valueDec: this.valueDec,
        };
    }
    toString() {
        const firstBit = (this.valueHexView.length * 8) - 1;
        let digits = new Uint8Array((this.valueHexView.length * 8) / 3);
        let bitNumber = 0;
        let currentByte;
        const asn1View = this.valueHexView;
        let result = "";
        let flag = false;
        for (let byteNumber = (asn1View.byteLength - 1); byteNumber >= 0; byteNumber--) {
            currentByte = asn1View[byteNumber];
            for (let i = 0; i < 8; i++) {
                if ((currentByte & 1) === 1) {
                    switch (bitNumber) {
                        case firstBit:
                            digits = viewSub(power2(bitNumber), digits);
                            result = "-";
                            break;
                        default:
                            digits = viewAdd(digits, power2(bitNumber));
                    }
                }
                bitNumber++;
                currentByte >>= 1;
            }
        }
        for (let i = 0; i < digits.length; i++) {
            if (digits[i])
                flag = true;
            if (flag)
                result += digitsString.charAt(digits[i]);
        }
        if (flag === false)
            result += digitsString.charAt(0);
        return result;
    }
}
_a$p = LocalIntegerValueBlock;
LocalIntegerValueBlock.NAME = "IntegerValueBlock";
(() => {
    Object.defineProperty(_a$p.prototype, "valueHex", {
        set: function (v) {
            this.valueHexView = new Uint8Array(v);
            this.setValueHex();
        },
        get: function () {
            return this.valueHexView.slice().buffer;
        },
    });
})();

var _a$o;
class Integer extends BaseBlock {
    constructor(parameters = {}) {
        super(parameters, LocalIntegerValueBlock);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 2;
    }
    toBigInt() {
        assertBigInt();
        return BigInt(this.valueBlock.toString());
    }
    static fromBigInt(value) {
        assertBigInt();
        const bigIntValue = BigInt(value);
        const writer = new ViewWriter();
        const hex = bigIntValue.toString(16).replace(/^-/, "");
        const view = new Uint8Array(buildExports.Convert.FromHex(hex));
        if (bigIntValue < 0) {
            const first = new Uint8Array(view.length + (view[0] & 0x80 ? 1 : 0));
            first[0] |= 0x80;
            const firstInt = BigInt(`0x${buildExports.Convert.ToHex(first)}`);
            const secondInt = firstInt + bigIntValue;
            const second = buildExports.BufferSourceConverter.toUint8Array(buildExports.Convert.FromHex(secondInt.toString(16)));
            second[0] |= 0x80;
            writer.write(second);
        }
        else {
            if (view[0] & 0x80) {
                writer.write(new Uint8Array([0]));
            }
            writer.write(view);
        }
        const res = new _a$o({ valueHex: writer.final() });
        return res;
    }
    convertToDER() {
        const integer = new _a$o({ valueHex: this.valueBlock.valueHexView });
        integer.valueBlock.toDER();
        return integer;
    }
    convertFromDER() {
        return new _a$o({
            valueHex: this.valueBlock.valueHexView[0] === 0
                ? this.valueBlock.valueHexView.subarray(1)
                : this.valueBlock.valueHexView,
        });
    }
    onAsciiEncoding() {
        return `${this.constructor.NAME} : ${this.valueBlock.toString()}`;
    }
}
_a$o = Integer;
(() => {
    typeStore.Integer = _a$o;
})();
Integer.NAME = "INTEGER";

var _a$n;
class Enumerated extends Integer {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 10;
    }
}
_a$n = Enumerated;
(() => {
    typeStore.Enumerated = _a$n;
})();
Enumerated.NAME = "ENUMERATED";

class LocalSidValueBlock extends HexBlock(ValueBlock) {
    constructor({ valueDec = -1, isFirstSid = false, ...parameters } = {}) {
        super(parameters);
        this.valueDec = valueDec;
        this.isFirstSid = isFirstSid;
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        if (!inputLength) {
            return inputOffset;
        }
        const inputView = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
        if (!checkBufferParams(this, inputView, inputOffset, inputLength)) {
            return -1;
        }
        const intBuffer = inputView.subarray(inputOffset, inputOffset + inputLength);
        this.valueHexView = new Uint8Array(inputLength);
        for (let i = 0; i < inputLength; i++) {
            this.valueHexView[i] = intBuffer[i] & 0x7F;
            this.blockLength++;
            if ((intBuffer[i] & 0x80) === 0x00)
                break;
        }
        const tempView = new Uint8Array(this.blockLength);
        for (let i = 0; i < this.blockLength; i++) {
            tempView[i] = this.valueHexView[i];
        }
        this.valueHexView = tempView;
        if ((intBuffer[this.blockLength - 1] & 0x80) !== 0x00) {
            this.error = "End of input reached before message was fully decoded";
            return -1;
        }
        if (this.valueHexView[0] === 0x00)
            this.warnings.push("Needlessly long format of SID encoding");
        if (this.blockLength <= 8)
            this.valueDec = utilFromBase(this.valueHexView, 7);
        else {
            this.isHexOnly = true;
            this.warnings.push("Too big SID for decoding, hex only");
        }
        return (inputOffset + this.blockLength);
    }
    set valueBigInt(value) {
        assertBigInt();
        let bits = BigInt(value).toString(2);
        while (bits.length % 7) {
            bits = "0" + bits;
        }
        const bytes = new Uint8Array(bits.length / 7);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(bits.slice(i * 7, i * 7 + 7), 2) + (i + 1 < bytes.length ? 0x80 : 0);
        }
        this.fromBER(bytes.buffer, 0, bytes.length);
    }
    toBER(sizeOnly) {
        if (this.isHexOnly) {
            if (sizeOnly)
                return (new ArrayBuffer(this.valueHexView.byteLength));
            const curView = this.valueHexView;
            const retView = new Uint8Array(this.blockLength);
            for (let i = 0; i < (this.blockLength - 1); i++)
                retView[i] = curView[i] | 0x80;
            retView[this.blockLength - 1] = curView[this.blockLength - 1];
            return retView.buffer;
        }
        const encodedBuf = utilToBase(this.valueDec, 7);
        if (encodedBuf.byteLength === 0) {
            this.error = "Error during encoding SID value";
            return EMPTY_BUFFER;
        }
        const retView = new Uint8Array(encodedBuf.byteLength);
        if (!sizeOnly) {
            const encodedView = new Uint8Array(encodedBuf);
            const len = encodedBuf.byteLength - 1;
            for (let i = 0; i < len; i++)
                retView[i] = encodedView[i] | 0x80;
            retView[len] = encodedView[len];
        }
        return retView;
    }
    toString() {
        let result = "";
        if (this.isHexOnly)
            result = buildExports.Convert.ToHex(this.valueHexView);
        else {
            if (this.isFirstSid) {
                let sidValue = this.valueDec;
                if (this.valueDec <= 39)
                    result = "0.";
                else {
                    if (this.valueDec <= 79) {
                        result = "1.";
                        sidValue -= 40;
                    }
                    else {
                        result = "2.";
                        sidValue -= 80;
                    }
                }
                result += sidValue.toString();
            }
            else
                result = this.valueDec.toString();
        }
        return result;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            valueDec: this.valueDec,
            isFirstSid: this.isFirstSid,
        };
    }
}
LocalSidValueBlock.NAME = "sidBlock";

class LocalObjectIdentifierValueBlock extends ValueBlock {
    constructor({ value = EMPTY_STRING, ...parameters } = {}) {
        super(parameters);
        this.value = [];
        if (value) {
            this.fromString(value);
        }
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        let resultOffset = inputOffset;
        while (inputLength > 0) {
            const sidBlock = new LocalSidValueBlock();
            resultOffset = sidBlock.fromBER(inputBuffer, resultOffset, inputLength);
            if (resultOffset === -1) {
                this.blockLength = 0;
                this.error = sidBlock.error;
                return resultOffset;
            }
            if (this.value.length === 0)
                sidBlock.isFirstSid = true;
            this.blockLength += sidBlock.blockLength;
            inputLength -= sidBlock.blockLength;
            this.value.push(sidBlock);
        }
        return resultOffset;
    }
    toBER(sizeOnly) {
        const retBuffers = [];
        for (let i = 0; i < this.value.length; i++) {
            const valueBuf = this.value[i].toBER(sizeOnly);
            if (valueBuf.byteLength === 0) {
                this.error = this.value[i].error;
                return EMPTY_BUFFER;
            }
            retBuffers.push(valueBuf);
        }
        return concat(retBuffers);
    }
    fromString(string) {
        this.value = [];
        let pos1 = 0;
        let pos2 = 0;
        let sid = "";
        let flag = false;
        do {
            pos2 = string.indexOf(".", pos1);
            if (pos2 === -1)
                sid = string.substring(pos1);
            else
                sid = string.substring(pos1, pos2);
            pos1 = pos2 + 1;
            if (flag) {
                const sidBlock = this.value[0];
                let plus = 0;
                switch (sidBlock.valueDec) {
                    case 0:
                        break;
                    case 1:
                        plus = 40;
                        break;
                    case 2:
                        plus = 80;
                        break;
                    default:
                        this.value = [];
                        return;
                }
                const parsedSID = parseInt(sid, 10);
                if (isNaN(parsedSID))
                    return;
                sidBlock.valueDec = parsedSID + plus;
                flag = false;
            }
            else {
                const sidBlock = new LocalSidValueBlock();
                if (sid > Number.MAX_SAFE_INTEGER) {
                    assertBigInt();
                    const sidValue = BigInt(sid);
                    sidBlock.valueBigInt = sidValue;
                }
                else {
                    sidBlock.valueDec = parseInt(sid, 10);
                    if (isNaN(sidBlock.valueDec))
                        return;
                }
                if (!this.value.length) {
                    sidBlock.isFirstSid = true;
                    flag = true;
                }
                this.value.push(sidBlock);
            }
        } while (pos2 !== -1);
    }
    toString() {
        let result = "";
        let isHexOnly = false;
        for (let i = 0; i < this.value.length; i++) {
            isHexOnly = this.value[i].isHexOnly;
            let sidStr = this.value[i].toString();
            if (i !== 0)
                result = `${result}.`;
            if (isHexOnly) {
                sidStr = `{${sidStr}}`;
                if (this.value[i].isFirstSid)
                    result = `2.{${sidStr} - 80}`;
                else
                    result += sidStr;
            }
            else
                result += sidStr;
        }
        return result;
    }
    toJSON() {
        const object = {
            ...super.toJSON(),
            value: this.toString(),
            sidArray: [],
        };
        for (let i = 0; i < this.value.length; i++) {
            object.sidArray.push(this.value[i].toJSON());
        }
        return object;
    }
}
LocalObjectIdentifierValueBlock.NAME = "ObjectIdentifierValueBlock";

var _a$m;
class ObjectIdentifier extends BaseBlock {
    getValue() {
        return this.valueBlock.toString();
    }
    setValue(value) {
        this.valueBlock.fromString(value);
    }
    constructor(parameters = {}) {
        super(parameters, LocalObjectIdentifierValueBlock);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 6;
    }
    onAsciiEncoding() {
        return `${this.constructor.NAME} : ${this.valueBlock.toString() || "empty"}`;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            value: this.getValue(),
        };
    }
}
_a$m = ObjectIdentifier;
(() => {
    typeStore.ObjectIdentifier = _a$m;
})();
ObjectIdentifier.NAME = "OBJECT IDENTIFIER";

class LocalRelativeSidValueBlock extends HexBlock(LocalBaseBlock) {
    constructor({ valueDec = 0, ...parameters } = {}) {
        super(parameters);
        this.valueDec = valueDec;
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        if (inputLength === 0)
            return inputOffset;
        const inputView = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
        if (!checkBufferParams(this, inputView, inputOffset, inputLength))
            return -1;
        const intBuffer = inputView.subarray(inputOffset, inputOffset + inputLength);
        this.valueHexView = new Uint8Array(inputLength);
        for (let i = 0; i < inputLength; i++) {
            this.valueHexView[i] = intBuffer[i] & 0x7F;
            this.blockLength++;
            if ((intBuffer[i] & 0x80) === 0x00)
                break;
        }
        const tempView = new Uint8Array(this.blockLength);
        for (let i = 0; i < this.blockLength; i++)
            tempView[i] = this.valueHexView[i];
        this.valueHexView = tempView;
        if ((intBuffer[this.blockLength - 1] & 0x80) !== 0x00) {
            this.error = "End of input reached before message was fully decoded";
            return -1;
        }
        if (this.valueHexView[0] === 0x00)
            this.warnings.push("Needlessly long format of SID encoding");
        if (this.blockLength <= 8)
            this.valueDec = utilFromBase(this.valueHexView, 7);
        else {
            this.isHexOnly = true;
            this.warnings.push("Too big SID for decoding, hex only");
        }
        return (inputOffset + this.blockLength);
    }
    toBER(sizeOnly) {
        if (this.isHexOnly) {
            if (sizeOnly)
                return (new ArrayBuffer(this.valueHexView.byteLength));
            const curView = this.valueHexView;
            const retView = new Uint8Array(this.blockLength);
            for (let i = 0; i < (this.blockLength - 1); i++)
                retView[i] = curView[i] | 0x80;
            retView[this.blockLength - 1] = curView[this.blockLength - 1];
            return retView.buffer;
        }
        const encodedBuf = utilToBase(this.valueDec, 7);
        if (encodedBuf.byteLength === 0) {
            this.error = "Error during encoding SID value";
            return EMPTY_BUFFER;
        }
        const retView = new Uint8Array(encodedBuf.byteLength);
        if (!sizeOnly) {
            const encodedView = new Uint8Array(encodedBuf);
            const len = encodedBuf.byteLength - 1;
            for (let i = 0; i < len; i++)
                retView[i] = encodedView[i] | 0x80;
            retView[len] = encodedView[len];
        }
        return retView.buffer;
    }
    toString() {
        let result = "";
        if (this.isHexOnly)
            result = buildExports.Convert.ToHex(this.valueHexView);
        else {
            result = this.valueDec.toString();
        }
        return result;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            valueDec: this.valueDec,
        };
    }
}
LocalRelativeSidValueBlock.NAME = "relativeSidBlock";

class LocalRelativeObjectIdentifierValueBlock extends ValueBlock {
    constructor({ value = EMPTY_STRING, ...parameters } = {}) {
        super(parameters);
        this.value = [];
        if (value) {
            this.fromString(value);
        }
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        let resultOffset = inputOffset;
        while (inputLength > 0) {
            const sidBlock = new LocalRelativeSidValueBlock();
            resultOffset = sidBlock.fromBER(inputBuffer, resultOffset, inputLength);
            if (resultOffset === -1) {
                this.blockLength = 0;
                this.error = sidBlock.error;
                return resultOffset;
            }
            this.blockLength += sidBlock.blockLength;
            inputLength -= sidBlock.blockLength;
            this.value.push(sidBlock);
        }
        return resultOffset;
    }
    toBER(sizeOnly, _writer) {
        const retBuffers = [];
        for (let i = 0; i < this.value.length; i++) {
            const valueBuf = this.value[i].toBER(sizeOnly);
            if (valueBuf.byteLength === 0) {
                this.error = this.value[i].error;
                return EMPTY_BUFFER;
            }
            retBuffers.push(valueBuf);
        }
        return concat(retBuffers);
    }
    fromString(string) {
        this.value = [];
        let pos1 = 0;
        let pos2 = 0;
        let sid = "";
        do {
            pos2 = string.indexOf(".", pos1);
            if (pos2 === -1)
                sid = string.substring(pos1);
            else
                sid = string.substring(pos1, pos2);
            pos1 = pos2 + 1;
            const sidBlock = new LocalRelativeSidValueBlock();
            sidBlock.valueDec = parseInt(sid, 10);
            if (isNaN(sidBlock.valueDec))
                return true;
            this.value.push(sidBlock);
        } while (pos2 !== -1);
        return true;
    }
    toString() {
        let result = "";
        let isHexOnly = false;
        for (let i = 0; i < this.value.length; i++) {
            isHexOnly = this.value[i].isHexOnly;
            let sidStr = this.value[i].toString();
            if (i !== 0)
                result = `${result}.`;
            if (isHexOnly) {
                sidStr = `{${sidStr}}`;
                result += sidStr;
            }
            else
                result += sidStr;
        }
        return result;
    }
    toJSON() {
        const object = {
            ...super.toJSON(),
            value: this.toString(),
            sidArray: [],
        };
        for (let i = 0; i < this.value.length; i++)
            object.sidArray.push(this.value[i].toJSON());
        return object;
    }
}
LocalRelativeObjectIdentifierValueBlock.NAME = "RelativeObjectIdentifierValueBlock";

var _a$l;
class RelativeObjectIdentifier extends BaseBlock {
    getValue() {
        return this.valueBlock.toString();
    }
    setValue(value) {
        this.valueBlock.fromString(value);
    }
    constructor(parameters = {}) {
        super(parameters, LocalRelativeObjectIdentifierValueBlock);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 13;
    }
    onAsciiEncoding() {
        return `${this.constructor.NAME} : ${this.valueBlock.toString() || "empty"}`;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            value: this.getValue(),
        };
    }
}
_a$l = RelativeObjectIdentifier;
(() => {
    typeStore.RelativeObjectIdentifier = _a$l;
})();
RelativeObjectIdentifier.NAME = "RelativeObjectIdentifier";

var _a$k;
class Sequence extends Constructed {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 16;
    }
}
_a$k = Sequence;
(() => {
    typeStore.Sequence = _a$k;
})();
Sequence.NAME = "SEQUENCE";

var _a$j;
class Set$1 extends Constructed {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 17;
    }
}
_a$j = Set$1;
(() => {
    typeStore.Set = _a$j;
})();
Set$1.NAME = "SET";

class LocalStringValueBlock extends HexBlock(ValueBlock) {
    constructor({ ...parameters } = {}) {
        super(parameters);
        this.isHexOnly = true;
        this.value = EMPTY_STRING;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            value: this.value,
        };
    }
}
LocalStringValueBlock.NAME = "StringValueBlock";

class LocalSimpleStringValueBlock extends LocalStringValueBlock {
}
LocalSimpleStringValueBlock.NAME = "SimpleStringValueBlock";

class LocalSimpleStringBlock extends BaseStringBlock {
    constructor({ ...parameters } = {}) {
        super(parameters, LocalSimpleStringValueBlock);
    }
    fromBuffer(inputBuffer) {
        this.valueBlock.value = String.fromCharCode.apply(null, buildExports.BufferSourceConverter.toUint8Array(inputBuffer));
    }
    fromString(inputString) {
        const strLen = inputString.length;
        const view = this.valueBlock.valueHexView = new Uint8Array(strLen);
        for (let i = 0; i < strLen; i++)
            view[i] = inputString.charCodeAt(i);
        this.valueBlock.value = inputString;
    }
}
LocalSimpleStringBlock.NAME = "SIMPLE STRING";

class LocalUtf8StringValueBlock extends LocalSimpleStringBlock {
    fromBuffer(inputBuffer) {
        this.valueBlock.valueHexView = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
        try {
            this.valueBlock.value = buildExports.Convert.ToUtf8String(inputBuffer);
        }
        catch (ex) {
            this.warnings.push(`Error during "decodeURIComponent": ${ex}, using raw string`);
            this.valueBlock.value = buildExports.Convert.ToBinary(inputBuffer);
        }
    }
    fromString(inputString) {
        this.valueBlock.valueHexView = new Uint8Array(buildExports.Convert.FromUtf8String(inputString));
        this.valueBlock.value = inputString;
    }
}
LocalUtf8StringValueBlock.NAME = "Utf8StringValueBlock";

var _a$i;
class Utf8String extends LocalUtf8StringValueBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 12;
    }
}
_a$i = Utf8String;
(() => {
    typeStore.Utf8String = _a$i;
})();
Utf8String.NAME = "UTF8String";

class LocalBmpStringValueBlock extends LocalSimpleStringBlock {
    fromBuffer(inputBuffer) {
        this.valueBlock.value = buildExports.Convert.ToUtf16String(inputBuffer);
        this.valueBlock.valueHexView = buildExports.BufferSourceConverter.toUint8Array(inputBuffer);
    }
    fromString(inputString) {
        this.valueBlock.value = inputString;
        this.valueBlock.valueHexView = new Uint8Array(buildExports.Convert.FromUtf16String(inputString));
    }
}
LocalBmpStringValueBlock.NAME = "BmpStringValueBlock";

var _a$h;
class BmpString extends LocalBmpStringValueBlock {
    constructor({ ...parameters } = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 30;
    }
}
_a$h = BmpString;
(() => {
    typeStore.BmpString = _a$h;
})();
BmpString.NAME = "BMPString";

class LocalUniversalStringValueBlock extends LocalSimpleStringBlock {
    fromBuffer(inputBuffer) {
        const copyBuffer = ArrayBuffer.isView(inputBuffer) ? inputBuffer.slice().buffer : inputBuffer.slice(0);
        const valueView = new Uint8Array(copyBuffer);
        for (let i = 0; i < valueView.length; i += 4) {
            valueView[i] = valueView[i + 3];
            valueView[i + 1] = valueView[i + 2];
            valueView[i + 2] = 0x00;
            valueView[i + 3] = 0x00;
        }
        this.valueBlock.value = String.fromCharCode.apply(null, new Uint32Array(copyBuffer));
    }
    fromString(inputString) {
        const strLength = inputString.length;
        const valueHexView = this.valueBlock.valueHexView = new Uint8Array(strLength * 4);
        for (let i = 0; i < strLength; i++) {
            const codeBuf = utilToBase(inputString.charCodeAt(i), 8);
            const codeView = new Uint8Array(codeBuf);
            if (codeView.length > 4)
                continue;
            const dif = 4 - codeView.length;
            for (let j = (codeView.length - 1); j >= 0; j--)
                valueHexView[i * 4 + j + dif] = codeView[j];
        }
        this.valueBlock.value = inputString;
    }
}
LocalUniversalStringValueBlock.NAME = "UniversalStringValueBlock";

var _a$g;
class UniversalString extends LocalUniversalStringValueBlock {
    constructor({ ...parameters } = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 28;
    }
}
_a$g = UniversalString;
(() => {
    typeStore.UniversalString = _a$g;
})();
UniversalString.NAME = "UniversalString";

var _a$f;
class NumericString extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 18;
    }
}
_a$f = NumericString;
(() => {
    typeStore.NumericString = _a$f;
})();
NumericString.NAME = "NumericString";

var _a$e;
class PrintableString extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 19;
    }
}
_a$e = PrintableString;
(() => {
    typeStore.PrintableString = _a$e;
})();
PrintableString.NAME = "PrintableString";

var _a$d;
class TeletexString extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 20;
    }
}
_a$d = TeletexString;
(() => {
    typeStore.TeletexString = _a$d;
})();
TeletexString.NAME = "TeletexString";

var _a$c;
class VideotexString extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 21;
    }
}
_a$c = VideotexString;
(() => {
    typeStore.VideotexString = _a$c;
})();
VideotexString.NAME = "VideotexString";

var _a$b;
class IA5String extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 22;
    }
}
_a$b = IA5String;
(() => {
    typeStore.IA5String = _a$b;
})();
IA5String.NAME = "IA5String";

var _a$a;
class GraphicString extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 25;
    }
}
_a$a = GraphicString;
(() => {
    typeStore.GraphicString = _a$a;
})();
GraphicString.NAME = "GraphicString";

var _a$9;
class VisibleString extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 26;
    }
}
_a$9 = VisibleString;
(() => {
    typeStore.VisibleString = _a$9;
})();
VisibleString.NAME = "VisibleString";

var _a$8;
class GeneralString extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 27;
    }
}
_a$8 = GeneralString;
(() => {
    typeStore.GeneralString = _a$8;
})();
GeneralString.NAME = "GeneralString";

var _a$7;
class CharacterString extends LocalSimpleStringBlock {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 29;
    }
}
_a$7 = CharacterString;
(() => {
    typeStore.CharacterString = _a$7;
})();
CharacterString.NAME = "CharacterString";

var _a$6;
class UTCTime extends VisibleString {
    constructor({ value, valueDate, ...parameters } = {}) {
        super(parameters);
        this.year = 0;
        this.month = 0;
        this.day = 0;
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
        if (value) {
            this.fromString(value);
            this.valueBlock.valueHexView = new Uint8Array(value.length);
            for (let i = 0; i < value.length; i++)
                this.valueBlock.valueHexView[i] = value.charCodeAt(i);
        }
        if (valueDate) {
            this.fromDate(valueDate);
            this.valueBlock.valueHexView = new Uint8Array(this.toBuffer());
        }
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 23;
    }
    fromBuffer(inputBuffer) {
        this.fromString(String.fromCharCode.apply(null, buildExports.BufferSourceConverter.toUint8Array(inputBuffer)));
    }
    toBuffer() {
        const str = this.toString();
        const buffer = new ArrayBuffer(str.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < str.length; i++)
            view[i] = str.charCodeAt(i);
        return buffer;
    }
    fromDate(inputDate) {
        this.year = inputDate.getUTCFullYear();
        this.month = inputDate.getUTCMonth() + 1;
        this.day = inputDate.getUTCDate();
        this.hour = inputDate.getUTCHours();
        this.minute = inputDate.getUTCMinutes();
        this.second = inputDate.getUTCSeconds();
    }
    toDate() {
        return (new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second)));
    }
    fromString(inputString) {
        const parser = /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z/ig;
        const parserArray = parser.exec(inputString);
        if (parserArray === null) {
            this.error = "Wrong input string for conversion";
            return;
        }
        const year = parseInt(parserArray[1], 10);
        if (year >= 50)
            this.year = 1900 + year;
        else
            this.year = 2000 + year;
        this.month = parseInt(parserArray[2], 10);
        this.day = parseInt(parserArray[3], 10);
        this.hour = parseInt(parserArray[4], 10);
        this.minute = parseInt(parserArray[5], 10);
        this.second = parseInt(parserArray[6], 10);
    }
    toString(encoding = "iso") {
        if (encoding === "iso") {
            const outputArray = new Array(7);
            outputArray[0] = padNumber(((this.year < 2000) ? (this.year - 1900) : (this.year - 2000)), 2);
            outputArray[1] = padNumber(this.month, 2);
            outputArray[2] = padNumber(this.day, 2);
            outputArray[3] = padNumber(this.hour, 2);
            outputArray[4] = padNumber(this.minute, 2);
            outputArray[5] = padNumber(this.second, 2);
            outputArray[6] = "Z";
            return outputArray.join("");
        }
        return super.toString(encoding);
    }
    onAsciiEncoding() {
        return `${this.constructor.NAME} : ${this.toDate().toISOString()}`;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            year: this.year,
            month: this.month,
            day: this.day,
            hour: this.hour,
            minute: this.minute,
            second: this.second,
        };
    }
}
_a$6 = UTCTime;
(() => {
    typeStore.UTCTime = _a$6;
})();
UTCTime.NAME = "UTCTime";

var _a$5;
class GeneralizedTime extends UTCTime {
    constructor(parameters = {}) {
        var _b;
        super(parameters);
        (_b = this.millisecond) !== null && _b !== void 0 ? _b : (this.millisecond = 0);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 24;
    }
    fromDate(inputDate) {
        super.fromDate(inputDate);
        this.millisecond = inputDate.getUTCMilliseconds();
    }
    toDate() {
        const utcDate = Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond);
        return (new Date(utcDate));
    }
    fromString(inputString) {
        let isUTC = false;
        let timeString = "";
        let dateTimeString = "";
        let fractionPart = 0;
        let parser;
        let hourDifference = 0;
        let minuteDifference = 0;
        if (inputString[inputString.length - 1] === "Z") {
            timeString = inputString.substring(0, inputString.length - 1);
            isUTC = true;
        }
        else {
            const number = new Number(inputString[inputString.length - 1]);
            if (isNaN(number.valueOf()))
                throw new Error("Wrong input string for conversion");
            timeString = inputString;
        }
        if (isUTC) {
            if (timeString.indexOf("+") !== -1)
                throw new Error("Wrong input string for conversion");
            if (timeString.indexOf("-") !== -1)
                throw new Error("Wrong input string for conversion");
        }
        else {
            let multiplier = 1;
            let differencePosition = timeString.indexOf("+");
            let differenceString = "";
            if (differencePosition === -1) {
                differencePosition = timeString.indexOf("-");
                multiplier = -1;
            }
            if (differencePosition !== -1) {
                differenceString = timeString.substring(differencePosition + 1);
                timeString = timeString.substring(0, differencePosition);
                if ((differenceString.length !== 2) && (differenceString.length !== 4))
                    throw new Error("Wrong input string for conversion");
                let number = parseInt(differenceString.substring(0, 2), 10);
                if (isNaN(number.valueOf()))
                    throw new Error("Wrong input string for conversion");
                hourDifference = multiplier * number;
                if (differenceString.length === 4) {
                    number = parseInt(differenceString.substring(2, 4), 10);
                    if (isNaN(number.valueOf()))
                        throw new Error("Wrong input string for conversion");
                    minuteDifference = multiplier * number;
                }
            }
        }
        let fractionPointPosition = timeString.indexOf(".");
        if (fractionPointPosition === -1)
            fractionPointPosition = timeString.indexOf(",");
        if (fractionPointPosition !== -1) {
            const fractionPartCheck = new Number(`0${timeString.substring(fractionPointPosition)}`);
            if (isNaN(fractionPartCheck.valueOf()))
                throw new Error("Wrong input string for conversion");
            fractionPart = fractionPartCheck.valueOf();
            dateTimeString = timeString.substring(0, fractionPointPosition);
        }
        else
            dateTimeString = timeString;
        switch (true) {
            case (dateTimeString.length === 8):
                parser = /(\d{4})(\d{2})(\d{2})/ig;
                if (fractionPointPosition !== -1)
                    throw new Error("Wrong input string for conversion");
                break;
            case (dateTimeString.length === 10):
                parser = /(\d{4})(\d{2})(\d{2})(\d{2})/ig;
                if (fractionPointPosition !== -1) {
                    let fractionResult = 60 * fractionPart;
                    this.minute = Math.floor(fractionResult);
                    fractionResult = 60 * (fractionResult - this.minute);
                    this.second = Math.floor(fractionResult);
                    fractionResult = 1000 * (fractionResult - this.second);
                    this.millisecond = Math.floor(fractionResult);
                }
                break;
            case (dateTimeString.length === 12):
                parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/ig;
                if (fractionPointPosition !== -1) {
                    let fractionResult = 60 * fractionPart;
                    this.second = Math.floor(fractionResult);
                    fractionResult = 1000 * (fractionResult - this.second);
                    this.millisecond = Math.floor(fractionResult);
                }
                break;
            case (dateTimeString.length === 14):
                parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/ig;
                if (fractionPointPosition !== -1) {
                    const fractionResult = 1000 * fractionPart;
                    this.millisecond = Math.floor(fractionResult);
                }
                break;
            default:
                throw new Error("Wrong input string for conversion");
        }
        const parserArray = parser.exec(dateTimeString);
        if (parserArray === null)
            throw new Error("Wrong input string for conversion");
        for (let j = 1; j < parserArray.length; j++) {
            switch (j) {
                case 1:
                    this.year = parseInt(parserArray[j], 10);
                    break;
                case 2:
                    this.month = parseInt(parserArray[j], 10);
                    break;
                case 3:
                    this.day = parseInt(parserArray[j], 10);
                    break;
                case 4:
                    this.hour = parseInt(parserArray[j], 10) + hourDifference;
                    break;
                case 5:
                    this.minute = parseInt(parserArray[j], 10) + minuteDifference;
                    break;
                case 6:
                    this.second = parseInt(parserArray[j], 10);
                    break;
                default:
                    throw new Error("Wrong input string for conversion");
            }
        }
        if (isUTC === false) {
            const tempDate = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
            this.year = tempDate.getUTCFullYear();
            this.month = tempDate.getUTCMonth();
            this.day = tempDate.getUTCDay();
            this.hour = tempDate.getUTCHours();
            this.minute = tempDate.getUTCMinutes();
            this.second = tempDate.getUTCSeconds();
            this.millisecond = tempDate.getUTCMilliseconds();
        }
    }
    toString(encoding = "iso") {
        if (encoding === "iso") {
            const outputArray = [];
            outputArray.push(padNumber(this.year, 4));
            outputArray.push(padNumber(this.month, 2));
            outputArray.push(padNumber(this.day, 2));
            outputArray.push(padNumber(this.hour, 2));
            outputArray.push(padNumber(this.minute, 2));
            outputArray.push(padNumber(this.second, 2));
            if (this.millisecond !== 0) {
                outputArray.push(".");
                outputArray.push(padNumber(this.millisecond, 3));
            }
            outputArray.push("Z");
            return outputArray.join("");
        }
        return super.toString(encoding);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            millisecond: this.millisecond,
        };
    }
}
_a$5 = GeneralizedTime;
(() => {
    typeStore.GeneralizedTime = _a$5;
})();
GeneralizedTime.NAME = "GeneralizedTime";

var _a$4;
class DATE extends Utf8String {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 31;
    }
}
_a$4 = DATE;
(() => {
    typeStore.DATE = _a$4;
})();
DATE.NAME = "DATE";

var _a$3;
class TimeOfDay extends Utf8String {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 32;
    }
}
_a$3 = TimeOfDay;
(() => {
    typeStore.TimeOfDay = _a$3;
})();
TimeOfDay.NAME = "TimeOfDay";

var _a$2;
class DateTime extends Utf8String {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 33;
    }
}
_a$2 = DateTime;
(() => {
    typeStore.DateTime = _a$2;
})();
DateTime.NAME = "DateTime";

var _a$1;
class Duration extends Utf8String {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 34;
    }
}
_a$1 = Duration;
(() => {
    typeStore.Duration = _a$1;
})();
Duration.NAME = "Duration";

var _a$x;
class TIME extends Utf8String {
    constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1;
        this.idBlock.tagNumber = 14;
    }
}
_a$x = TIME;
(() => {
    typeStore.TIME = _a$x;
})();
TIME.NAME = "TIME";

class Any {
    constructor({ name = EMPTY_STRING, optional = false } = {}) {
        this.name = name;
        this.optional = optional;
    }
}

class Choice extends Any {
    constructor({ value = [], ...parameters } = {}) {
        super(parameters);
        this.value = value;
    }
}

class Repeated extends Any {
    constructor({ value = new Any(), local = false, ...parameters } = {}) {
        super(parameters);
        this.value = value;
        this.local = local;
    }
}

class RawData {
    get data() {
        return this.dataView.slice().buffer;
    }
    set data(value) {
        this.dataView = buildExports.BufferSourceConverter.toUint8Array(value);
    }
    constructor({ data = EMPTY_VIEW } = {}) {
        this.dataView = buildExports.BufferSourceConverter.toUint8Array(data);
    }
    fromBER(inputBuffer, inputOffset, inputLength) {
        const endLength = inputOffset + inputLength;
        this.dataView = buildExports.BufferSourceConverter.toUint8Array(inputBuffer).subarray(inputOffset, endLength);
        return endLength;
    }
    toBER(_sizeOnly) {
        return this.dataView.slice().buffer;
    }
}

function compareSchema(root, inputData, inputSchema) {
    if (inputSchema instanceof Choice) {
        for (const element of inputSchema.value) {
            const result = compareSchema(root, inputData, element);
            if (result.verified) {
                return {
                    verified: true,
                    result: root,
                };
            }
        }
        {
            const _result = {
                verified: false,
                result: { error: "Wrong values for Choice type" },
            };
            if (inputSchema.hasOwnProperty(NAME$1))
                _result.name = inputSchema.name;
            return _result;
        }
    }
    if (inputSchema instanceof Any) {
        if (inputSchema.hasOwnProperty(NAME$1))
            root[inputSchema.name] = inputData;
        return {
            verified: true,
            result: root,
        };
    }
    if ((root instanceof Object) === false) {
        return {
            verified: false,
            result: { error: "Wrong root object" },
        };
    }
    if ((inputData instanceof Object) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 data" },
        };
    }
    if ((inputSchema instanceof Object) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema" },
        };
    }
    if ((ID_BLOCK in inputSchema) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema" },
        };
    }
    if ((FROM_BER in inputSchema.idBlock) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema" },
        };
    }
    if ((TO_BER in inputSchema.idBlock) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema" },
        };
    }
    const encodedId = inputSchema.idBlock.toBER(false);
    if (encodedId.byteLength === 0) {
        return {
            verified: false,
            result: { error: "Error encoding idBlock for ASN.1 schema" },
        };
    }
    const decodedOffset = inputSchema.idBlock.fromBER(encodedId, 0, encodedId.byteLength);
    if (decodedOffset === -1) {
        return {
            verified: false,
            result: { error: "Error decoding idBlock for ASN.1 schema" },
        };
    }
    if (inputSchema.idBlock.hasOwnProperty(TAG_CLASS) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema" },
        };
    }
    if (inputSchema.idBlock.tagClass !== inputData.idBlock.tagClass) {
        return {
            verified: false,
            result: root,
        };
    }
    if (inputSchema.idBlock.hasOwnProperty(TAG_NUMBER) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema" },
        };
    }
    if (inputSchema.idBlock.tagNumber !== inputData.idBlock.tagNumber) {
        return {
            verified: false,
            result: root,
        };
    }
    if (inputSchema.idBlock.hasOwnProperty(IS_CONSTRUCTED) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema" },
        };
    }
    if (inputSchema.idBlock.isConstructed !== inputData.idBlock.isConstructed) {
        return {
            verified: false,
            result: root,
        };
    }
    if (!(IS_HEX_ONLY in inputSchema.idBlock)) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema" },
        };
    }
    if (inputSchema.idBlock.isHexOnly !== inputData.idBlock.isHexOnly) {
        return {
            verified: false,
            result: root,
        };
    }
    if (inputSchema.idBlock.isHexOnly) {
        if ((VALUE_HEX_VIEW in inputSchema.idBlock) === false) {
            return {
                verified: false,
                result: { error: "Wrong ASN.1 schema" },
            };
        }
        const schemaView = inputSchema.idBlock.valueHexView;
        const asn1View = inputData.idBlock.valueHexView;
        if (schemaView.length !== asn1View.length) {
            return {
                verified: false,
                result: root,
            };
        }
        for (let i = 0; i < schemaView.length; i++) {
            if (schemaView[i] !== asn1View[1]) {
                return {
                    verified: false,
                    result: root,
                };
            }
        }
    }
    if (inputSchema.name) {
        inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, EMPTY_STRING);
        if (inputSchema.name)
            root[inputSchema.name] = inputData;
    }
    if (inputSchema instanceof typeStore.Constructed) {
        let admission = 0;
        let result = {
            verified: false,
            result: { error: "Unknown error" },
        };
        let maxLength = inputSchema.valueBlock.value.length;
        if (maxLength > 0) {
            if (inputSchema.valueBlock.value[0] instanceof Repeated) {
                maxLength = inputData.valueBlock.value.length;
            }
        }
        if (maxLength === 0) {
            return {
                verified: true,
                result: root,
            };
        }
        if ((inputData.valueBlock.value.length === 0)
            && (inputSchema.valueBlock.value.length !== 0)) {
            let _optional = true;
            for (let i = 0; i < inputSchema.valueBlock.value.length; i++)
                _optional = _optional && (inputSchema.valueBlock.value[i].optional || false);
            if (_optional) {
                return {
                    verified: true,
                    result: root,
                };
            }
            if (inputSchema.name) {
                inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, EMPTY_STRING);
                if (inputSchema.name)
                    delete root[inputSchema.name];
            }
            root.error = "Inconsistent object length";
            return {
                verified: false,
                result: root,
            };
        }
        for (let i = 0; i < maxLength; i++) {
            if ((i - admission) >= inputData.valueBlock.value.length) {
                if (inputSchema.valueBlock.value[i].optional === false) {
                    const _result = {
                        verified: false,
                        result: root,
                    };
                    root.error = "Inconsistent length between ASN.1 data and schema";
                    if (inputSchema.name) {
                        inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, EMPTY_STRING);
                        if (inputSchema.name) {
                            delete root[inputSchema.name];
                            _result.name = inputSchema.name;
                        }
                    }
                    return _result;
                }
            }
            else {
                if (inputSchema.valueBlock.value[0] instanceof Repeated) {
                    result = compareSchema(root, inputData.valueBlock.value[i], inputSchema.valueBlock.value[0].value);
                    if (result.verified === false) {
                        if (inputSchema.valueBlock.value[0].optional)
                            admission++;
                        else {
                            if (inputSchema.name) {
                                inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, EMPTY_STRING);
                                if (inputSchema.name)
                                    delete root[inputSchema.name];
                            }
                            return result;
                        }
                    }
                    if ((NAME$1 in inputSchema.valueBlock.value[0]) && (inputSchema.valueBlock.value[0].name.length > 0)) {
                        let arrayRoot = {};
                        if ((LOCAL in inputSchema.valueBlock.value[0]) && (inputSchema.valueBlock.value[0].local))
                            arrayRoot = inputData;
                        else
                            arrayRoot = root;
                        if (typeof arrayRoot[inputSchema.valueBlock.value[0].name] === "undefined")
                            arrayRoot[inputSchema.valueBlock.value[0].name] = [];
                        arrayRoot[inputSchema.valueBlock.value[0].name].push(inputData.valueBlock.value[i]);
                    }
                }
                else {
                    result = compareSchema(root, inputData.valueBlock.value[i - admission], inputSchema.valueBlock.value[i]);
                    if (result.verified === false) {
                        if (inputSchema.valueBlock.value[i].optional)
                            admission++;
                        else {
                            if (inputSchema.name) {
                                inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, EMPTY_STRING);
                                if (inputSchema.name)
                                    delete root[inputSchema.name];
                            }
                            return result;
                        }
                    }
                }
            }
        }
        if (result.verified === false) {
            const _result = {
                verified: false,
                result: root,
            };
            if (inputSchema.name) {
                inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, EMPTY_STRING);
                if (inputSchema.name) {
                    delete root[inputSchema.name];
                    _result.name = inputSchema.name;
                }
            }
            return _result;
        }
        return {
            verified: true,
            result: root,
        };
    }
    if (inputSchema.primitiveSchema
        && (VALUE_HEX_VIEW in inputData.valueBlock)) {
        const asn1 = localFromBER(inputData.valueBlock.valueHexView);
        if (asn1.offset === -1) {
            const _result = {
                verified: false,
                result: asn1.result,
            };
            if (inputSchema.name) {
                inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, EMPTY_STRING);
                if (inputSchema.name) {
                    delete root[inputSchema.name];
                    _result.name = inputSchema.name;
                }
            }
            return _result;
        }
        return compareSchema(root, asn1.result, inputSchema.primitiveSchema);
    }
    return {
        verified: true,
        result: root,
    };
}
function verifySchema(inputBuffer, inputSchema) {
    if ((inputSchema instanceof Object) === false) {
        return {
            verified: false,
            result: { error: "Wrong ASN.1 schema type" },
        };
    }
    const asn1 = localFromBER(buildExports.BufferSourceConverter.toUint8Array(inputBuffer));
    if (asn1.offset === -1) {
        return {
            verified: false,
            result: asn1.result,
        };
    }
    return compareSchema(asn1.result, asn1.result, inputSchema);
}

var asn1js = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Any: Any,
	BaseBlock: BaseBlock,
	BaseStringBlock: BaseStringBlock,
	BitString: BitString$1,
	BmpString: BmpString,
	Boolean: Boolean$1,
	CharacterString: CharacterString,
	Choice: Choice,
	Constructed: Constructed,
	DATE: DATE,
	DEFAULT_MAX_CONTENT_LENGTH: DEFAULT_MAX_CONTENT_LENGTH,
	DEFAULT_MAX_DEPTH: DEFAULT_MAX_DEPTH,
	DEFAULT_MAX_NODES: DEFAULT_MAX_NODES,
	DateTime: DateTime,
	Duration: Duration,
	EndOfContent: EndOfContent,
	Enumerated: Enumerated,
	GeneralString: GeneralString,
	GeneralizedTime: GeneralizedTime,
	GraphicString: GraphicString,
	HexBlock: HexBlock,
	IA5String: IA5String,
	Integer: Integer,
	Null: Null,
	NumericString: NumericString,
	ObjectIdentifier: ObjectIdentifier,
	OctetString: OctetString$1,
	Primitive: Primitive,
	PrintableString: PrintableString,
	RawData: RawData,
	RelativeObjectIdentifier: RelativeObjectIdentifier,
	Repeated: Repeated,
	Sequence: Sequence,
	Set: Set$1,
	TIME: TIME,
	TeletexString: TeletexString,
	TimeOfDay: TimeOfDay,
	UTCTime: UTCTime,
	UniversalString: UniversalString,
	Utf8String: Utf8String,
	ValueBlock: ValueBlock,
	VideotexString: VideotexString,
	ViewWriter: ViewWriter,
	VisibleString: VisibleString,
	compareSchema: compareSchema,
	fromBER: fromBER,
	verifySchema: verifySchema
});

const ARRAY_BUFFER_TAG = "[object ArrayBuffer]";
const SHARED_ARRAY_BUFFER_TAG = "[object SharedArrayBuffer]";
function tagOf(value) {
    return Object.prototype.toString.call(value);
}
function isArrayBufferViewLike(value) {
    if (ArrayBuffer.isView(value)) {
        return true;
    }
    if (!value || typeof value !== "object") {
        return false;
    }
    const view = value;
    return typeof view.byteOffset === "number"
        && typeof view.byteLength === "number"
        && isArrayBufferLike(view.buffer);
}
function isArrayBuffer(value) {
    return tagOf(value) === ARRAY_BUFFER_TAG;
}
function isSharedArrayBuffer(value) {
    return typeof SharedArrayBuffer !== "undefined" && tagOf(value) === SHARED_ARRAY_BUFFER_TAG;
}
function isArrayBufferLike(value) {
    return isArrayBuffer(value) || isSharedArrayBuffer(value);
}
function isArrayBufferView(value) {
    return isArrayBufferViewLike(value);
}
function isBufferSource(value) {
    return isArrayBufferLike(value) || isArrayBufferView(value);
}
function assertBufferSource(value) {
    if (!isBufferSource(value)) {
        throw new TypeError("Expected ArrayBuffer, SharedArrayBuffer, or ArrayBufferView");
    }
}
function toUint8Array(data) {
    assertBufferSource(data);
    if (isArrayBufferLike(data)) {
        return new Uint8Array(data);
    }
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}
function toArrayBuffer(data) {
    assertBufferSource(data);
    if (isArrayBuffer(data)) {
        return data;
    }
    const buffer = new ArrayBuffer(data.byteLength);
    new Uint8Array(buffer).set(toUint8Array(data));
    return buffer;
}

function equal(a, b, options = {}) {
    const left = toUint8Array(a);
    const right = toUint8Array(b);
    if (!options.constantTime && left.byteLength !== right.byteLength) {
        return false;
    }
    const length = Math.max(left.byteLength, right.byteLength);
    let diff = left.byteLength ^ right.byteLength;
    for (let i = 0; i < length; i++) {
        diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
    }
    return diff === 0;
}

var AsnTypeTypes;
(function (AsnTypeTypes) {
    AsnTypeTypes[AsnTypeTypes["Sequence"] = 0] = "Sequence";
    AsnTypeTypes[AsnTypeTypes["Set"] = 1] = "Set";
    AsnTypeTypes[AsnTypeTypes["Choice"] = 2] = "Choice";
})(AsnTypeTypes || (AsnTypeTypes = {}));
var AsnPropTypes;
(function (AsnPropTypes) {
    AsnPropTypes[AsnPropTypes["Any"] = 1] = "Any";
    AsnPropTypes[AsnPropTypes["Boolean"] = 2] = "Boolean";
    AsnPropTypes[AsnPropTypes["OctetString"] = 3] = "OctetString";
    AsnPropTypes[AsnPropTypes["BitString"] = 4] = "BitString";
    AsnPropTypes[AsnPropTypes["Integer"] = 5] = "Integer";
    AsnPropTypes[AsnPropTypes["Enumerated"] = 6] = "Enumerated";
    AsnPropTypes[AsnPropTypes["ObjectIdentifier"] = 7] = "ObjectIdentifier";
    AsnPropTypes[AsnPropTypes["Utf8String"] = 8] = "Utf8String";
    AsnPropTypes[AsnPropTypes["BmpString"] = 9] = "BmpString";
    AsnPropTypes[AsnPropTypes["UniversalString"] = 10] = "UniversalString";
    AsnPropTypes[AsnPropTypes["NumericString"] = 11] = "NumericString";
    AsnPropTypes[AsnPropTypes["PrintableString"] = 12] = "PrintableString";
    AsnPropTypes[AsnPropTypes["TeletexString"] = 13] = "TeletexString";
    AsnPropTypes[AsnPropTypes["VideotexString"] = 14] = "VideotexString";
    AsnPropTypes[AsnPropTypes["IA5String"] = 15] = "IA5String";
    AsnPropTypes[AsnPropTypes["GraphicString"] = 16] = "GraphicString";
    AsnPropTypes[AsnPropTypes["VisibleString"] = 17] = "VisibleString";
    AsnPropTypes[AsnPropTypes["GeneralString"] = 18] = "GeneralString";
    AsnPropTypes[AsnPropTypes["CharacterString"] = 19] = "CharacterString";
    AsnPropTypes[AsnPropTypes["UTCTime"] = 20] = "UTCTime";
    AsnPropTypes[AsnPropTypes["GeneralizedTime"] = 21] = "GeneralizedTime";
    AsnPropTypes[AsnPropTypes["DATE"] = 22] = "DATE";
    AsnPropTypes[AsnPropTypes["TimeOfDay"] = 23] = "TimeOfDay";
    AsnPropTypes[AsnPropTypes["DateTime"] = 24] = "DateTime";
    AsnPropTypes[AsnPropTypes["Duration"] = 25] = "Duration";
    AsnPropTypes[AsnPropTypes["TIME"] = 26] = "TIME";
    AsnPropTypes[AsnPropTypes["Null"] = 27] = "Null";
})(AsnPropTypes || (AsnPropTypes = {}));

class BitString {
    unusedBits = 0;
    value = new ArrayBuffer(0);
    constructor(params, unusedBits = 0) {
        if (params) {
            if (typeof params === "number") {
                this.fromNumber(params);
            }
            else if (isBufferSource(params)) {
                this.unusedBits = unusedBits;
                this.value = toArrayBuffer(params);
            }
            else {
                throw TypeError("Unsupported type of 'params' argument for BitString");
            }
        }
    }
    fromASN(asn) {
        if (!(asn instanceof BitString$1)) {
            throw new TypeError("Argument 'asn' is not instance of ASN.1 BitString");
        }
        this.unusedBits = asn.valueBlock.unusedBits;
        this.value = toArrayBuffer(asn.valueBlock.valueHex);
        return this;
    }
    toASN() {
        return new BitString$1({
            unusedBits: this.unusedBits, valueHex: this.value,
        });
    }
    toSchema(name) {
        return new BitString$1({ name });
    }
    toNumber() {
        let res = "";
        const uintArray = new Uint8Array(this.value);
        for (const octet of uintArray) {
            res += octet.toString(2).padStart(8, "0");
        }
        res = res.split("").reverse().join("");
        if (this.unusedBits) {
            res = res.slice(this.unusedBits).padStart(this.unusedBits, "0");
        }
        return parseInt(res, 2);
    }
    fromNumber(value) {
        let bits = value.toString(2);
        const octetSize = (bits.length + 7) >> 3;
        this.unusedBits = (octetSize << 3) - bits.length;
        const octets = new Uint8Array(octetSize);
        bits = bits
            .padStart(octetSize << 3, "0")
            .split("")
            .reverse()
            .join("");
        let index = 0;
        while (index < octetSize) {
            octets[index] = parseInt(bits.slice(index << 3, (index << 3) + 8), 2);
            index++;
        }
        this.value = octets.buffer;
    }
}

class OctetString {
    buffer;
    get byteLength() {
        return this.buffer.byteLength;
    }
    get byteOffset() {
        return 0;
    }
    constructor(param) {
        if (typeof param === "number") {
            this.buffer = new ArrayBuffer(param);
        }
        else {
            if (isBufferSource(param)) {
                this.buffer = toArrayBuffer(param);
            }
            else if (Array.isArray(param)) {
                this.buffer = new Uint8Array(param).buffer;
            }
            else {
                this.buffer = new ArrayBuffer(0);
            }
        }
    }
    fromASN(asn) {
        if (!(asn instanceof OctetString$1)) {
            throw new TypeError("Argument 'asn' is not instance of ASN.1 OctetString");
        }
        this.buffer = toArrayBuffer(asn.valueBlock.valueHex);
        return this;
    }
    toASN() {
        return new OctetString$1({ valueHex: this.buffer });
    }
    toSchema(name) {
        return new OctetString$1({ name });
    }
}

const AsnAnyConverter = {
    fromASN: (value) => value instanceof Null
        ? null
        : toArrayBuffer(value.valueBeforeDecodeView),
    toASN: (value) => {
        if (value === null) {
            return new Null();
        }
        const schema = fromBER(value);
        if (schema.result.error) {
            throw new Error(schema.result.error);
        }
        return schema.result;
    },
};
const AsnIntegerConverter = {
    fromASN: (value) => value.valueBlock.valueHexView.byteLength >= 4
        ? value.valueBlock.toString()
        : value.valueBlock.valueDec,
    toASN: (value) => new Integer({ value: +value }),
};
const AsnEnumeratedConverter = {
    fromASN: (value) => value.valueBlock.valueDec,
    toASN: (value) => new Enumerated({ value }),
};
const AsnIntegerArrayBufferConverter = {
    fromASN: (value) => toArrayBuffer(value.valueBlock.valueHexView),
    toASN: (value) => new Integer({ valueHex: value }),
};
const AsnBitStringConverter = {
    fromASN: (value) => toArrayBuffer(value.valueBlock.valueHexView),
    toASN: (value) => new BitString$1({ valueHex: value }),
};
const AsnObjectIdentifierConverter = {
    fromASN: (value) => value.valueBlock.toString(),
    toASN: (value) => new ObjectIdentifier({ value }),
};
const AsnBooleanConverter = {
    fromASN: (value) => value.valueBlock.value,
    toASN: (value) => new Boolean$1({ value }),
};
const AsnOctetStringConverter = {
    fromASN: (value) => toArrayBuffer(value.valueBlock.valueHexView),
    toASN: (value) => new OctetString$1({ valueHex: value }),
};
const AsnConstructedOctetStringConverter = {
    fromASN: (value) => new OctetString(value.getValue()),
    toASN: (value) => value.toASN(),
};
function createStringConverter(Asn1Type) {
    return {
        fromASN: (value) => value.valueBlock.value,
        toASN: (value) => new Asn1Type({ value }),
    };
}
const AsnUtf8StringConverter = createStringConverter(Utf8String);
const AsnBmpStringConverter = createStringConverter(BmpString);
const AsnUniversalStringConverter = createStringConverter(UniversalString);
const AsnNumericStringConverter = createStringConverter(NumericString);
const AsnPrintableStringConverter = createStringConverter(PrintableString);
const AsnTeletexStringConverter = createStringConverter(TeletexString);
const AsnVideotexStringConverter = createStringConverter(VideotexString);
const AsnIA5StringConverter = createStringConverter(IA5String);
const AsnGraphicStringConverter = createStringConverter(GraphicString);
const AsnVisibleStringConverter = createStringConverter(VisibleString);
const AsnGeneralStringConverter = createStringConverter(GeneralString);
const AsnCharacterStringConverter = createStringConverter(CharacterString);
const AsnUTCTimeConverter = {
    fromASN: (value) => value.toDate(),
    toASN: (value) => new UTCTime({ valueDate: value }),
};
const AsnGeneralizedTimeConverter = {
    fromASN: (value) => value.toDate(),
    toASN: (value) => new GeneralizedTime({ valueDate: value }),
};
const AsnNullConverter = {
    fromASN: () => null,
    toASN: () => {
        return new Null();
    },
};
function defaultConverter(type) {
    switch (type) {
        case AsnPropTypes.Any:
            return AsnAnyConverter;
        case AsnPropTypes.BitString:
            return AsnBitStringConverter;
        case AsnPropTypes.BmpString:
            return AsnBmpStringConverter;
        case AsnPropTypes.Boolean:
            return AsnBooleanConverter;
        case AsnPropTypes.CharacterString:
            return AsnCharacterStringConverter;
        case AsnPropTypes.Enumerated:
            return AsnEnumeratedConverter;
        case AsnPropTypes.GeneralString:
            return AsnGeneralStringConverter;
        case AsnPropTypes.GeneralizedTime:
            return AsnGeneralizedTimeConverter;
        case AsnPropTypes.GraphicString:
            return AsnGraphicStringConverter;
        case AsnPropTypes.IA5String:
            return AsnIA5StringConverter;
        case AsnPropTypes.Integer:
            return AsnIntegerConverter;
        case AsnPropTypes.Null:
            return AsnNullConverter;
        case AsnPropTypes.NumericString:
            return AsnNumericStringConverter;
        case AsnPropTypes.ObjectIdentifier:
            return AsnObjectIdentifierConverter;
        case AsnPropTypes.OctetString:
            return AsnOctetStringConverter;
        case AsnPropTypes.PrintableString:
            return AsnPrintableStringConverter;
        case AsnPropTypes.TeletexString:
            return AsnTeletexStringConverter;
        case AsnPropTypes.UTCTime:
            return AsnUTCTimeConverter;
        case AsnPropTypes.UniversalString:
            return AsnUniversalStringConverter;
        case AsnPropTypes.Utf8String:
            return AsnUtf8StringConverter;
        case AsnPropTypes.VideotexString:
            return AsnVideotexStringConverter;
        case AsnPropTypes.VisibleString:
            return AsnVisibleStringConverter;
        default:
            return null;
    }
}

function isConvertible(target) {
    if (typeof target === "function" && target.prototype) {
        if (target.prototype.toASN && target.prototype.fromASN) {
            return true;
        }
        else {
            return isConvertible(target.prototype);
        }
    }
    else {
        return !!(target && typeof target === "object" && "toASN" in target && "fromASN" in target);
    }
}
function isTypeOfArray(target) {
    if (target) {
        const proto = Object.getPrototypeOf(target);
        if (proto?.prototype?.constructor === Array) {
            return true;
        }
        return isTypeOfArray(proto);
    }
    return false;
}
function isArrayEqual(bytes1, bytes2) {
    if (!(bytes1 && bytes2)) {
        return false;
    }
    if (bytes1.byteLength !== bytes2.byteLength) {
        return false;
    }
    const b1 = new Uint8Array(bytes1);
    const b2 = new Uint8Array(bytes2);
    for (let i = 0; i < bytes1.byteLength; i++) {
        if (b1[i] !== b2[i]) {
            return false;
        }
    }
    return true;
}

class AsnSchemaStorage {
    items = new WeakMap();
    has(target) {
        return this.items.has(target);
    }
    get(target, checkSchema = false) {
        const schema = this.items.get(target);
        if (!schema) {
            throw new Error(`Cannot get schema for '${target.prototype.constructor.name}' target`);
        }
        if (checkSchema && !schema.schema) {
            throw new Error(`Schema '${target.prototype.constructor.name}' doesn't contain ASN.1 schema. Call 'AsnSchemaStorage.cache'.`);
        }
        return schema;
    }
    cache(target) {
        const schema = this.get(target);
        if (!schema.schema) {
            schema.schema = this.create(target, true);
        }
    }
    createDefault(target) {
        const schema = {
            type: AsnTypeTypes.Sequence, items: {},
        };
        const parentSchema = this.findParentSchema(target);
        if (parentSchema) {
            Object.assign(schema, parentSchema);
            schema.items = Object.assign({}, schema.items, parentSchema.items);
        }
        return schema;
    }
    create(target, useNames) {
        const schema = this.items.get(target) || this.createDefault(target);
        const asn1Value = [];
        for (const key in schema.items) {
            const item = schema.items[key];
            const name = useNames ? key : "";
            let asn1Item;
            if (typeof item.type === "number") {
                const Asn1TypeName = AsnPropTypes[item.type];
                const Asn1Type = asn1js[Asn1TypeName];
                if (!Asn1Type) {
                    throw new Error(`Cannot get ASN1 class by name '${Asn1TypeName}'`);
                }
                asn1Item = new Asn1Type({ name });
            }
            else if (isConvertible(item.type)) {
                const instance = new item.type();
                asn1Item = instance.toSchema(name);
            }
            else if (item.optional) {
                const itemSchema = this.get(item.type);
                if (itemSchema.type === AsnTypeTypes.Choice) {
                    asn1Item = new Any({ name });
                }
                else {
                    asn1Item = this.create(item.type, false);
                    asn1Item.name = name;
                }
            }
            else {
                asn1Item = new Any({ name });
            }
            const optional = !!item.optional || item.defaultValue !== undefined;
            if (item.repeated) {
                asn1Item.name = "";
                const Container = item.repeated === "set" ? Set$1 : Sequence;
                asn1Item = new Container({
                    name: "",
                    value: [new Repeated({
                            name, value: asn1Item,
                        })],
                });
            }
            if (item.context !== null && item.context !== undefined) {
                if (item.implicit) {
                    if (typeof item.type === "number" || isConvertible(item.type)) {
                        const Container = item.repeated ? Constructed : Primitive;
                        asn1Value.push(new Container({
                            name, optional, idBlock: {
                                tagClass: 3, tagNumber: item.context,
                            },
                        }));
                    }
                    else {
                        this.cache(item.type);
                        const isRepeated = !!item.repeated;
                        let value = !isRepeated ? this.get(item.type, true).schema : asn1Item;
                        value
                            = "valueBlock" in value
                                ? value.valueBlock.value
                                : value.value;
                        asn1Value.push(new Constructed({
                            name: !isRepeated ? name : "",
                            optional,
                            idBlock: {
                                tagClass: 3, tagNumber: item.context,
                            },
                            value: value,
                        }));
                    }
                }
                else {
                    asn1Value.push(new Constructed({
                        optional,
                        idBlock: {
                            tagClass: 3, tagNumber: item.context,
                        },
                        value: [asn1Item],
                    }));
                }
            }
            else {
                asn1Item.optional = optional;
                asn1Value.push(asn1Item);
            }
        }
        switch (schema.type) {
            case AsnTypeTypes.Sequence:
                return new Sequence({
                    value: asn1Value, name: "",
                });
            case AsnTypeTypes.Set:
                return new Set$1({
                    value: asn1Value, name: "",
                });
            case AsnTypeTypes.Choice:
                return new Choice({
                    value: asn1Value, name: "",
                });
            default:
                throw new Error("Unsupported ASN1 type in use");
        }
    }
    set(target, schema) {
        this.items.set(target, schema);
        return this;
    }
    findParentSchema(target) {
        const parent = Object.getPrototypeOf(target);
        if (parent) {
            const schema = this.items.get(parent);
            return schema || this.findParentSchema(parent);
        }
        return null;
    }
}

const schemaStorage = new AsnSchemaStorage();

const AsnType = (options) => (target) => {
    let schema;
    if (!schemaStorage.has(target)) {
        schema = schemaStorage.createDefault(target);
        schemaStorage.set(target, schema);
    }
    else {
        schema = schemaStorage.get(target);
    }
    Object.assign(schema, options);
};
const AsnProp = (options) => (target, propertyKey) => {
    let schema;
    if (!schemaStorage.has(target.constructor)) {
        schema = schemaStorage.createDefault(target.constructor);
        schemaStorage.set(target.constructor, schema);
    }
    else {
        schema = schemaStorage.get(target.constructor);
    }
    const copyOptions = Object.assign({}, options);
    if (typeof copyOptions.type === "number" && !copyOptions.converter) {
        const defaultConverter$1 = defaultConverter(options.type);
        if (!defaultConverter$1) {
            throw new Error(`Cannot get default converter for property '${propertyKey}' of ${target.constructor.name}`);
        }
        copyOptions.converter = defaultConverter$1;
    }
    copyOptions.raw = options.raw;
    schema.items[propertyKey] = copyOptions;
};

class AsnSchemaValidationError extends Error {
    schemas = [];
}

class AsnParser {
    static parse(data, target) {
        const asn1Parsed = fromBER(toArrayBuffer(data));
        if (asn1Parsed.result.error) {
            throw new Error(asn1Parsed.result.error);
        }
        const res = this.fromASN(asn1Parsed.result, target);
        return res;
    }
    static fromASN(asn1Schema, target) {
        try {
            if (isConvertible(target)) {
                const value = new target();
                return value.fromASN(asn1Schema);
            }
            const schema = schemaStorage.get(target);
            schemaStorage.cache(target);
            let targetSchema = schema.schema;
            const choiceResult = this.handleChoiceTypes(asn1Schema, schema, target, targetSchema);
            if (choiceResult?.result) {
                return choiceResult.result;
            }
            if (choiceResult?.targetSchema) {
                targetSchema = choiceResult.targetSchema;
            }
            const sequenceResult = this.handleSequenceTypes(asn1Schema, schema, target, targetSchema);
            const res = new target();
            if (isTypeOfArray(target)) {
                return this.handleArrayTypes(asn1Schema, schema, target);
            }
            this.processSchemaItems(schema, sequenceResult, res);
            return res;
        }
        catch (error) {
            if (error instanceof AsnSchemaValidationError) {
                error.schemas.push(target.name);
            }
            throw error;
        }
    }
    static handleChoiceTypes(asn1Schema, schema, target, targetSchema) {
        if (asn1Schema.constructor === Constructed
            && schema.type === AsnTypeTypes.Choice
            && asn1Schema.idBlock.tagClass === 3) {
            for (const key in schema.items) {
                const schemaItem = schema.items[key];
                if (schemaItem.context === asn1Schema.idBlock.tagNumber && schemaItem.implicit) {
                    if (typeof schemaItem.type === "function"
                        && schemaStorage.has(schemaItem.type)) {
                        const fieldSchema = schemaStorage.get(schemaItem.type);
                        if (fieldSchema && fieldSchema.type === AsnTypeTypes.Sequence) {
                            const newSeq = new Sequence();
                            if ("value" in asn1Schema.valueBlock
                                && Array.isArray(asn1Schema.valueBlock.value)
                                && "value" in newSeq.valueBlock) {
                                newSeq.valueBlock.value = asn1Schema.valueBlock.value;
                                const fieldValue = this.fromASN(newSeq, schemaItem.type);
                                const res = new target();
                                res[key] = fieldValue;
                                return { result: res };
                            }
                        }
                    }
                }
            }
        }
        else if (asn1Schema.constructor === Constructed
            && schema.type !== AsnTypeTypes.Choice) {
            const newTargetSchema = new Constructed({
                idBlock: {
                    tagClass: 3,
                    tagNumber: asn1Schema.idBlock.tagNumber,
                },
                value: schema.schema.valueBlock.value,
            });
            for (const key in schema.items) {
                delete asn1Schema[key];
            }
            return { targetSchema: newTargetSchema };
        }
        return null;
    }
    static handleSequenceTypes(asn1Schema, schema, target, targetSchema) {
        if (schema.type === AsnTypeTypes.Sequence) {
            const asn1ComparedSchema = compareSchema({}, asn1Schema, targetSchema);
            if (!asn1ComparedSchema.verified) {
                throw new AsnSchemaValidationError(`Data does not match to ${target.name} ASN1 schema.${asn1ComparedSchema.result.error ? ` ${asn1ComparedSchema.result.error}` : ""}`);
            }
            return asn1ComparedSchema;
        }
        else {
            const asn1ComparedSchema = compareSchema({}, asn1Schema, targetSchema);
            if (!asn1ComparedSchema.verified) {
                throw new AsnSchemaValidationError(`Data does not match to ${target.name} ASN1 schema.${asn1ComparedSchema.result.error ? ` ${asn1ComparedSchema.result.error}` : ""}`);
            }
            return asn1ComparedSchema;
        }
    }
    static processRepeatedField(asn1Elements, asn1Index, schemaItem) {
        let elementsToProcess = asn1Elements.slice(asn1Index);
        if (elementsToProcess.length === 1 && elementsToProcess[0].constructor.name === "Sequence") {
            const seq = elementsToProcess[0];
            if (seq.valueBlock && seq.valueBlock.value && Array.isArray(seq.valueBlock.value)) {
                elementsToProcess = seq.valueBlock.value;
            }
        }
        if (typeof schemaItem.type === "number") {
            const converter = defaultConverter(schemaItem.type);
            if (!converter)
                throw new Error(`No converter for ASN.1 type ${schemaItem.type}`);
            return elementsToProcess
                .filter((el) => el && el.valueBlock)
                .map((el) => {
                try {
                    return converter.fromASN(el);
                }
                catch {
                    return undefined;
                }
            })
                .filter((v) => v !== undefined);
        }
        else {
            return elementsToProcess
                .filter((el) => el && el.valueBlock)
                .map((el) => {
                try {
                    return this.fromASN(el, schemaItem.type);
                }
                catch {
                    return undefined;
                }
            })
                .filter((v) => v !== undefined);
        }
    }
    static processPrimitiveField(asn1Element, schemaItem) {
        const converter = defaultConverter(schemaItem.type);
        if (!converter)
            throw new Error(`No converter for ASN.1 type ${schemaItem.type}`);
        return converter.fromASN(asn1Element);
    }
    static isOptionalChoiceField(schemaItem) {
        return (schemaItem.optional
            && typeof schemaItem.type === "function"
            && schemaStorage.has(schemaItem.type)
            && schemaStorage.get(schemaItem.type).type === AsnTypeTypes.Choice);
    }
    static processOptionalChoiceField(asn1Element, schemaItem) {
        try {
            const value = this.fromASN(asn1Element, schemaItem.type);
            return {
                processed: true, value,
            };
        }
        catch (err) {
            if (err instanceof AsnSchemaValidationError
                && /Wrong values for Choice type/.test(err.message)) {
                return { processed: false };
            }
            throw err;
        }
    }
    static handleArrayTypes(asn1Schema, schema, target) {
        if (!("value" in asn1Schema.valueBlock && Array.isArray(asn1Schema.valueBlock.value))) {
            throw new Error("Cannot get items from the ASN.1 parsed value. ASN.1 object is not constructed.");
        }
        const itemType = schema.itemType;
        if (typeof itemType === "number") {
            const converter = defaultConverter(itemType);
            if (!converter) {
                throw new Error(`Cannot get default converter for array item of ${target.name} ASN1 schema`);
            }
            return target.from(asn1Schema.valueBlock.value, (element) => converter.fromASN(element));
        }
        else {
            return target.from(asn1Schema.valueBlock.value, (element) => this.fromASN(element, itemType));
        }
    }
    static processSchemaItems(schema, asn1ComparedSchema, res) {
        for (const key in schema.items) {
            const asn1SchemaValue = asn1ComparedSchema.result[key];
            if (!asn1SchemaValue) {
                continue;
            }
            const schemaItem = schema.items[key];
            const schemaItemType = schemaItem.type;
            let parsedValue;
            if (typeof schemaItemType === "number" || isConvertible(schemaItemType)) {
                parsedValue = this.processPrimitiveSchemaItem(asn1SchemaValue, schemaItem, schemaItemType);
            }
            else {
                parsedValue = this.processComplexSchemaItem(asn1SchemaValue, schemaItem, schemaItemType);
            }
            if (parsedValue
                && typeof parsedValue === "object"
                && "value" in parsedValue
                && "raw" in parsedValue) {
                res[key] = parsedValue.value;
                res[`${key}Raw`] = parsedValue.raw;
            }
            else {
                res[key] = parsedValue;
            }
        }
    }
    static processPrimitiveSchemaItem(asn1SchemaValue, schemaItem, schemaItemType) {
        const converter = schemaItem.converter
            ?? (isConvertible(schemaItemType)
                ? new schemaItemType()
                : null);
        if (!converter) {
            throw new Error("Converter is empty");
        }
        if (schemaItem.repeated) {
            return this.processRepeatedPrimitiveItem(asn1SchemaValue, schemaItem, converter);
        }
        else {
            return this.processSinglePrimitiveItem(asn1SchemaValue, schemaItem, schemaItemType, converter);
        }
    }
    static processRepeatedPrimitiveItem(asn1SchemaValue, schemaItem, converter) {
        if (schemaItem.implicit) {
            const Container = schemaItem.repeated === "sequence" ? Sequence : Set$1;
            const newItem = new Container();
            newItem.valueBlock = asn1SchemaValue.valueBlock;
            const newItemAsn = fromBER(newItem.toBER(false));
            if (newItemAsn.offset === -1) {
                throw new Error(`Cannot parse the child item. ${newItemAsn.result.error}`);
            }
            if (!("value" in newItemAsn.result.valueBlock
                && Array.isArray(newItemAsn.result.valueBlock.value))) {
                throw new Error("Cannot get items from the ASN.1 parsed value. ASN.1 object is not constructed.");
            }
            const value = newItemAsn.result.valueBlock.value;
            return Array.from(value, (element) => converter.fromASN(element));
        }
        else {
            return Array.from(asn1SchemaValue, (element) => converter.fromASN(element));
        }
    }
    static processSinglePrimitiveItem(asn1SchemaValue, schemaItem, schemaItemType, converter) {
        let value = asn1SchemaValue;
        if (schemaItem.implicit) {
            let newItem;
            if (isConvertible(schemaItemType)) {
                newItem = new schemaItemType().toSchema("");
            }
            else {
                const Asn1TypeName = AsnPropTypes[schemaItemType];
                const Asn1Type = asn1js[Asn1TypeName];
                if (!Asn1Type) {
                    throw new Error(`Cannot get '${Asn1TypeName}' class from asn1js module`);
                }
                newItem = new Asn1Type();
            }
            newItem.valueBlock = value.valueBlock;
            value = fromBER(newItem.toBER(false)).result;
        }
        return converter.fromASN(value);
    }
    static processComplexSchemaItem(asn1SchemaValue, schemaItem, schemaItemType) {
        if (schemaItem.repeated) {
            if (!Array.isArray(asn1SchemaValue)) {
                throw new Error("Cannot get list of items from the ASN.1 parsed value. ASN.1 value should be iterable.");
            }
            return Array.from(asn1SchemaValue, (element) => this.fromASN(element, schemaItemType));
        }
        else {
            const valueToProcess = this.handleImplicitTagging(asn1SchemaValue, schemaItem, schemaItemType);
            if (this.isOptionalChoiceField(schemaItem)) {
                try {
                    return this.fromASN(valueToProcess, schemaItemType);
                }
                catch (err) {
                    if (err instanceof AsnSchemaValidationError
                        && /Wrong values for Choice type/.test(err.message)) {
                        return undefined;
                    }
                    throw err;
                }
            }
            else {
                const parsedValue = this.fromASN(valueToProcess, schemaItemType);
                if (schemaItem.raw) {
                    return {
                        value: parsedValue,
                        raw: asn1SchemaValue.valueBeforeDecodeView,
                    };
                }
                return parsedValue;
            }
        }
    }
    static handleImplicitTagging(asn1SchemaValue, schemaItem, schemaItemType) {
        if (schemaItem.implicit && typeof schemaItem.context === "number") {
            const schema = schemaStorage.get(schemaItemType);
            if (schema.type === AsnTypeTypes.Sequence) {
                const newSeq = new Sequence();
                if ("value" in asn1SchemaValue.valueBlock
                    && Array.isArray(asn1SchemaValue.valueBlock.value)
                    && "value" in newSeq.valueBlock) {
                    newSeq.valueBlock.value = asn1SchemaValue.valueBlock.value;
                    return newSeq;
                }
            }
            else if (schema.type === AsnTypeTypes.Set) {
                const newSet = new Set$1();
                if ("value" in asn1SchemaValue.valueBlock
                    && Array.isArray(asn1SchemaValue.valueBlock.value)
                    && "value" in newSet.valueBlock) {
                    newSet.valueBlock.value = asn1SchemaValue.valueBlock.value;
                    return newSet;
                }
            }
        }
        return asn1SchemaValue;
    }
}

class AsnSerializer {
    static serialize(obj) {
        if (obj instanceof BaseBlock) {
            return obj.toBER(false);
        }
        return this.toASN(obj).toBER(false);
    }
    static toASN(obj) {
        if (obj && typeof obj === "object" && isConvertible(obj)) {
            return obj.toASN();
        }
        if (!(obj && typeof obj === "object")) {
            throw new TypeError("Parameter 1 should be type of Object.");
        }
        const target = obj.constructor;
        const schema = schemaStorage.get(target);
        schemaStorage.cache(target);
        let asn1Value = [];
        if (schema.itemType) {
            if (!Array.isArray(obj)) {
                throw new TypeError("Parameter 1 should be type of Array.");
            }
            if (typeof schema.itemType === "number") {
                const converter = defaultConverter(schema.itemType);
                if (!converter) {
                    throw new Error(`Cannot get default converter for array item of ${target.name} ASN1 schema`);
                }
                asn1Value = obj.map((o) => converter.toASN(o));
            }
            else {
                asn1Value = obj.map((o) => this.toAsnItem({ type: schema.itemType }, "[]", target, o));
            }
        }
        else {
            for (const key in schema.items) {
                const schemaItem = schema.items[key];
                const objProp = obj[key];
                if (objProp === undefined
                    || schemaItem.defaultValue === objProp
                    || (typeof schemaItem.defaultValue === "object"
                        && typeof objProp === "object"
                        && isArrayEqual(this.serialize(schemaItem.defaultValue), this.serialize(objProp)))) {
                    continue;
                }
                const asn1Item = AsnSerializer.toAsnItem(schemaItem, key, target, objProp);
                if (typeof schemaItem.context === "number") {
                    if (schemaItem.implicit) {
                        if (!schemaItem.repeated
                            && (typeof schemaItem.type === "number" || isConvertible(schemaItem.type))) {
                            const value = {};
                            value.valueHex
                                = asn1Item instanceof Null
                                    ? toArrayBuffer(asn1Item.valueBeforeDecodeView)
                                    : asn1Item.valueBlock.toBER();
                            asn1Value.push(new Primitive({
                                optional: schemaItem.optional,
                                idBlock: {
                                    tagClass: 3,
                                    tagNumber: schemaItem.context,
                                },
                                ...value,
                            }));
                        }
                        else {
                            asn1Value.push(new Constructed({
                                optional: schemaItem.optional,
                                idBlock: {
                                    tagClass: 3,
                                    tagNumber: schemaItem.context,
                                },
                                value: asn1Item.valueBlock.value,
                            }));
                        }
                    }
                    else {
                        asn1Value.push(new Constructed({
                            optional: schemaItem.optional,
                            idBlock: {
                                tagClass: 3,
                                tagNumber: schemaItem.context,
                            },
                            value: [asn1Item],
                        }));
                    }
                }
                else if (schemaItem.repeated) {
                    asn1Value = asn1Value.concat(asn1Item);
                }
                else {
                    asn1Value.push(asn1Item);
                }
            }
        }
        let asnSchema;
        switch (schema.type) {
            case AsnTypeTypes.Sequence:
                asnSchema = new Sequence({ value: asn1Value });
                break;
            case AsnTypeTypes.Set:
                asnSchema = new Set$1({ value: asn1Value });
                break;
            case AsnTypeTypes.Choice:
                if (!asn1Value[0]) {
                    throw new Error(`Schema '${target.name}' has wrong data. Choice cannot be empty.`);
                }
                asnSchema = asn1Value[0];
                break;
        }
        return asnSchema;
    }
    static toAsnItem(schemaItem, key, target, objProp) {
        let asn1Item;
        if (typeof schemaItem.type === "number") {
            const converter = schemaItem.converter;
            if (!converter) {
                throw new Error(`Property '${key}' doesn't have converter for type ${AsnPropTypes[schemaItem.type]} in schema '${target.name}'`);
            }
            if (schemaItem.repeated) {
                if (!Array.isArray(objProp)) {
                    throw new TypeError("Parameter 'objProp' should be type of Array.");
                }
                const items = Array.from(objProp, (element) => converter.toASN(element));
                const Container = schemaItem.repeated === "sequence" ? Sequence : Set$1;
                asn1Item = new Container({ value: items });
            }
            else {
                asn1Item = converter.toASN(objProp);
            }
        }
        else {
            if (schemaItem.repeated) {
                if (!Array.isArray(objProp)) {
                    throw new TypeError("Parameter 'objProp' should be type of Array.");
                }
                const items = Array.from(objProp, (element) => this.toASN(element));
                const Container = schemaItem.repeated === "sequence" ? Sequence : Set$1;
                asn1Item = new Container({ value: items });
            }
            else {
                asn1Item = this.toASN(objProp);
            }
        }
        return asn1Item;
    }
}

class AsnArray extends Array {
    constructor(items = []) {
        if (typeof items === "number") {
            super(items);
        }
        else {
            super();
            for (const item of items) {
                this.push(item);
            }
        }
    }
}

class AsnConvert {
    static serialize(obj) {
        return AsnSerializer.serialize(obj);
    }
    static parse(data, target) {
        return AsnParser.parse(data, target);
    }
    static toString(data) {
        const buf = isBufferSource(data)
            ? toArrayBuffer(data)
            : AsnConvert.serialize(data);
        const asn = fromBER(buf);
        if (asn.offset === -1) {
            throw new Error(`Cannot decode ASN.1 data. ${asn.result.error}`);
        }
        return asn.result.toString();
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function groupPairs(pairs, group) {
    if (!group) {
        return pairs.join("");
    }
    if (!Number.isInteger(group.size) || group.size < 1) {
        throw new RangeError("Hex group size must be a positive integer");
    }
    const chunks = [];
    for (let index = 0; index < pairs.length; index += group.size) {
        chunks.push(pairs.slice(index, index + group.size).join(""));
    }
    return chunks.join(group.separator);
}
function encode(data, options = {}) {
    const bytes = toUint8Array(data);
    const casing = options.case ?? "lower";
    const pairs = Array.from(bytes, (byte) => {
        const text = byte.toString(16).padStart(2, "0");
        return casing === "upper" ? text.toUpperCase() : text;
    });
    let body = "";
    if (options.line) {
        const bytesPerLine = options.line.bytesPerLine;
        if (!Number.isInteger(bytesPerLine) || bytesPerLine < 1) {
            throw new RangeError("Hex bytesPerLine must be a positive integer");
        }
        const separator = options.line.separator ?? "\n";
        const lines = [];
        for (let index = 0; index < pairs.length; index += bytesPerLine) {
            lines.push(groupPairs(pairs.slice(index, index + bytesPerLine), options.group));
        }
        body = lines.join(separator);
    }
    else {
        body = groupPairs(pairs, options.group);
    }
    return `${options.prefix ?? ""}${body}`;
}
({
    compact: Object.freeze({}),
    upper: Object.freeze({ case: "upper" }),
    colon: Object.freeze({ group: { size: 1, separator: ":" } }),
    colonUpper: Object.freeze({ case: "upper", group: { size: 1, separator: ":" } }),
    groupsOf4: Object.freeze({ group: { size: 4, separator: " " } }),
    prefixed: Object.freeze({ prefix: "0x" }),
});

class IpConverter {
    static isIPv4(ip) {
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
    }
    static parseIPv4(ip) {
        const parts = ip.split(".");
        if (parts.length !== 4) {
            throw new Error("Invalid IPv4 address");
        }
        return parts.map((part) => {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255) {
                throw new Error("Invalid IPv4 address part");
            }
            return num;
        });
    }
    static parseIPv6(ip) {
        const expandedIP = this.expandIPv6(ip);
        const parts = expandedIP.split(":");
        if (parts.length !== 8) {
            throw new Error("Invalid IPv6 address");
        }
        return parts.reduce((bytes, part) => {
            const num = parseInt(part, 16);
            if (isNaN(num) || num < 0 || num > 0xffff) {
                throw new Error("Invalid IPv6 address part");
            }
            bytes.push((num >> 8) & 0xff);
            bytes.push(num & 0xff);
            return bytes;
        }, []);
    }
    static expandIPv6(ip) {
        if (!ip.includes("::")) {
            return ip;
        }
        const parts = ip.split("::");
        if (parts.length > 2) {
            throw new Error("Invalid IPv6 address");
        }
        const left = parts[0] ? parts[0].split(":") : [];
        const right = parts[1] ? parts[1].split(":") : [];
        const missing = 8 - (left.length + right.length);
        if (missing < 0) {
            throw new Error("Invalid IPv6 address");
        }
        return [...left, ...Array(missing).fill("0"), ...right].join(":");
    }
    static formatIPv6(bytes) {
        const parts = [];
        for (let i = 0; i < 16; i += 2) {
            parts.push(((bytes[i] << 8) | bytes[i + 1]).toString(16));
        }
        return this.compressIPv6(parts.join(":"));
    }
    static compressIPv6(ip) {
        const parts = ip.split(":");
        let longestZeroStart = -1;
        let longestZeroLength = 0;
        let currentZeroStart = -1;
        let currentZeroLength = 0;
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === "0") {
                if (currentZeroStart === -1) {
                    currentZeroStart = i;
                }
                currentZeroLength++;
            }
            else {
                if (currentZeroLength > longestZeroLength) {
                    longestZeroStart = currentZeroStart;
                    longestZeroLength = currentZeroLength;
                }
                currentZeroStart = -1;
                currentZeroLength = 0;
            }
        }
        if (currentZeroLength > longestZeroLength) {
            longestZeroStart = currentZeroStart;
            longestZeroLength = currentZeroLength;
        }
        if (longestZeroLength > 1) {
            const before = parts.slice(0, longestZeroStart).join(":");
            const after = parts.slice(longestZeroStart + longestZeroLength).join(":");
            return `${before}::${after}`;
        }
        return ip;
    }
    static parseCIDR(text) {
        const [addr, prefixStr] = text.split("/");
        const prefix = parseInt(prefixStr, 10);
        if (this.isIPv4(addr)) {
            if (prefix < 0 || prefix > 32) {
                throw new Error("Invalid IPv4 prefix length");
            }
            return [this.parseIPv4(addr), prefix];
        }
        else {
            if (prefix < 0 || prefix > 128) {
                throw new Error("Invalid IPv6 prefix length");
            }
            return [this.parseIPv6(addr), prefix];
        }
    }
    static decodeIP(value) {
        if (value.length === 64 && parseInt(value, 16) === 0) {
            return "::/0";
        }
        if (value.length !== 16) {
            return value;
        }
        const mask = parseInt(value.slice(8), 16)
            .toString(2)
            .split("")
            .reduce((a, k) => a + +k, 0);
        let ip = value.slice(0, 8).replace(/(.{2})/g, (match) => `${parseInt(match, 16)}.`);
        ip = ip.slice(0, -1);
        return `${ip}/${mask}`;
    }
    static toString(buf) {
        const uint8 = new Uint8Array(buf);
        if (uint8.length === 4) {
            return Array.from(uint8).join(".");
        }
        if (uint8.length === 16) {
            return this.formatIPv6(uint8);
        }
        if (uint8.length === 8 || uint8.length === 32) {
            const half = uint8.length / 2;
            const addrBytes = uint8.slice(0, half);
            const maskBytes = uint8.slice(half);
            const isAllZeros = uint8.every((byte) => byte === 0);
            if (isAllZeros) {
                return uint8.length === 8 ? "0.0.0.0/0" : "::/0";
            }
            const prefixLen = maskBytes.reduce((a, b) => a + (b.toString(2).match(/1/g) || []).length, 0);
            if (uint8.length === 8) {
                const addrStr = Array.from(addrBytes).join(".");
                return `${addrStr}/${prefixLen}`;
            }
            else {
                const addrStr = this.formatIPv6(addrBytes);
                return `${addrStr}/${prefixLen}`;
            }
        }
        return this.decodeIP(encode(buf));
    }
    static fromString(text) {
        if (text.includes("/")) {
            const [addr, prefix] = this.parseCIDR(text);
            const maskBytes = new Uint8Array(addr.length);
            let bitsLeft = prefix;
            for (let i = 0; i < maskBytes.length; i++) {
                if (bitsLeft >= 8) {
                    maskBytes[i] = 0xff;
                    bitsLeft -= 8;
                }
                else if (bitsLeft > 0) {
                    maskBytes[i] = 0xff << (8 - bitsLeft);
                    bitsLeft = 0;
                }
            }
            const out = new Uint8Array(addr.length * 2);
            out.set(addr, 0);
            out.set(maskBytes, addr.length);
            return out.buffer;
        }
        const bytes = this.isIPv4(text) ? this.parseIPv4(text) : this.parseIPv6(text);
        return new Uint8Array(bytes).buffer;
    }
}

var RelativeDistinguishedName_1, RDNSequence_1, Name_1;
let DirectoryString = class DirectoryString {
    teletexString;
    printableString;
    universalString;
    utf8String;
    bmpString;
    constructor(params = {}) {
        Object.assign(this, params);
    }
    toString() {
        return (this.bmpString
            || this.printableString
            || this.teletexString
            || this.universalString
            || this.utf8String
            || "");
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.TeletexString })
], DirectoryString.prototype, "teletexString", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.PrintableString })
], DirectoryString.prototype, "printableString", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.UniversalString })
], DirectoryString.prototype, "universalString", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Utf8String })
], DirectoryString.prototype, "utf8String", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BmpString })
], DirectoryString.prototype, "bmpString", void 0);
DirectoryString = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], DirectoryString);
let AttributeValue = class AttributeValue extends DirectoryString {
    ia5String;
    anyValue;
    constructor(params = {}) {
        super(params);
        Object.assign(this, params);
    }
    toString() {
        return this.ia5String || (this.anyValue ? encode(this.anyValue) : super.toString());
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.IA5String })
], AttributeValue.prototype, "ia5String", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Any })
], AttributeValue.prototype, "anyValue", void 0);
AttributeValue = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], AttributeValue);
class AttributeTypeAndValue {
    type = "";
    value = new AttributeValue();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], AttributeTypeAndValue.prototype, "type", void 0);
__decorate([
    AsnProp({ type: AttributeValue })
], AttributeTypeAndValue.prototype, "value", void 0);
let RelativeDistinguishedName = RelativeDistinguishedName_1 = class RelativeDistinguishedName extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, RelativeDistinguishedName_1.prototype);
    }
};
RelativeDistinguishedName = RelativeDistinguishedName_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Set, itemType: AttributeTypeAndValue,
    })
], RelativeDistinguishedName);
let RDNSequence = RDNSequence_1 = class RDNSequence extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, RDNSequence_1.prototype);
    }
};
RDNSequence = RDNSequence_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: RelativeDistinguishedName,
    })
], RDNSequence);
let Name$1 = Name_1 = class Name extends RDNSequence {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, Name_1.prototype);
    }
};
Name$1 = Name_1 = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], Name$1);

const AsnIpConverter = {
    fromASN: (value) => IpConverter.toString(AsnOctetStringConverter.fromASN(value)),
    toASN: (value) => AsnOctetStringConverter.toASN(IpConverter.fromString(value)),
};
class OtherName {
    typeId = "";
    value = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], OtherName.prototype, "typeId", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, context: 0,
    })
], OtherName.prototype, "value", void 0);
class EDIPartyName {
    nameAssigner;
    partyName = new DirectoryString();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: DirectoryString, optional: true, context: 0, implicit: true,
    })
], EDIPartyName.prototype, "nameAssigner", void 0);
__decorate([
    AsnProp({
        type: DirectoryString, context: 1, implicit: true,
    })
], EDIPartyName.prototype, "partyName", void 0);
let GeneralName$1 = class GeneralName {
    otherName;
    rfc822Name;
    dNSName;
    x400Address;
    directoryName;
    ediPartyName;
    uniformResourceIdentifier;
    iPAddress;
    registeredID;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: OtherName, context: 0, implicit: true,
    })
], GeneralName$1.prototype, "otherName", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.IA5String, context: 1, implicit: true,
    })
], GeneralName$1.prototype, "rfc822Name", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.IA5String, context: 2, implicit: true,
    })
], GeneralName$1.prototype, "dNSName", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, context: 3, implicit: true,
    })
], GeneralName$1.prototype, "x400Address", void 0);
__decorate([
    AsnProp({
        type: Name$1, context: 4, implicit: false,
    })
], GeneralName$1.prototype, "directoryName", void 0);
__decorate([
    AsnProp({
        type: EDIPartyName, context: 5,
    })
], GeneralName$1.prototype, "ediPartyName", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.IA5String, context: 6, implicit: true,
    })
], GeneralName$1.prototype, "uniformResourceIdentifier", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.OctetString,
        context: 7,
        implicit: true,
        converter: AsnIpConverter,
    })
], GeneralName$1.prototype, "iPAddress", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.ObjectIdentifier, context: 8, implicit: true,
    })
], GeneralName$1.prototype, "registeredID", void 0);
GeneralName$1 = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], GeneralName$1);

const id_pkix = "1.3.6.1.5.5.7";
const id_pe = `${id_pkix}.1`;
const id_kp = `${id_pkix}.3`;
const id_ad = `${id_pkix}.48`;
const id_ad_ocsp = `${id_ad}.1`;
const id_ad_caIssuers = `${id_ad}.2`;
const id_ad_timeStamping = `${id_ad}.3`;
const id_ad_caRepository = `${id_ad}.5`;
const id_ce = "2.5.29";

var AuthorityInfoAccessSyntax_1;
const id_pe_authorityInfoAccess = `${id_pe}.1`;
class AccessDescription {
    accessMethod = "";
    accessLocation = new GeneralName$1();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], AccessDescription.prototype, "accessMethod", void 0);
__decorate([
    AsnProp({ type: GeneralName$1 })
], AccessDescription.prototype, "accessLocation", void 0);
let AuthorityInfoAccessSyntax = AuthorityInfoAccessSyntax_1 = class AuthorityInfoAccessSyntax extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, AuthorityInfoAccessSyntax_1.prototype);
    }
};
AuthorityInfoAccessSyntax = AuthorityInfoAccessSyntax_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: AccessDescription,
    })
], AuthorityInfoAccessSyntax);

const id_ce_authorityKeyIdentifier = `${id_ce}.35`;
class KeyIdentifier extends OctetString {
}
class AuthorityKeyIdentifier {
    keyIdentifier;
    authorityCertIssuer;
    authorityCertSerialNumber;
    constructor(params = {}) {
        if (params) {
            Object.assign(this, params);
        }
    }
}
__decorate([
    AsnProp({
        type: KeyIdentifier, context: 0, optional: true, implicit: true,
    })
], AuthorityKeyIdentifier.prototype, "keyIdentifier", void 0);
__decorate([
    AsnProp({
        type: GeneralName$1, context: 1, optional: true, implicit: true, repeated: "sequence",
    })
], AuthorityKeyIdentifier.prototype, "authorityCertIssuer", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer,
        context: 2,
        optional: true,
        implicit: true,
        converter: AsnIntegerArrayBufferConverter,
    })
], AuthorityKeyIdentifier.prototype, "authorityCertSerialNumber", void 0);

const id_ce_basicConstraints = `${id_ce}.19`;
class BasicConstraints {
    cA = false;
    pathLenConstraint;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Boolean, defaultValue: false,
    })
], BasicConstraints.prototype, "cA", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, optional: true,
    })
], BasicConstraints.prototype, "pathLenConstraint", void 0);

var GeneralNames_1;
let GeneralNames$1 = GeneralNames_1 = class GeneralNames extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, GeneralNames_1.prototype);
    }
};
GeneralNames$1 = GeneralNames_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: GeneralName$1,
    })
], GeneralNames$1);

var CertificateIssuer_1;
const id_ce_certificateIssuer = `${id_ce}.29`;
let CertificateIssuer = CertificateIssuer_1 = class CertificateIssuer extends GeneralNames$1 {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, CertificateIssuer_1.prototype);
    }
};
CertificateIssuer = CertificateIssuer_1 = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], CertificateIssuer);

var CertificatePolicies_1;
const id_ce_certificatePolicies = `${id_ce}.32`;
let DisplayText = class DisplayText {
    ia5String;
    visibleString;
    bmpString;
    utf8String;
    constructor(params = {}) {
        Object.assign(this, params);
    }
    toString() {
        return this.ia5String || this.visibleString || this.bmpString || this.utf8String || "";
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.IA5String })
], DisplayText.prototype, "ia5String", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.VisibleString })
], DisplayText.prototype, "visibleString", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BmpString })
], DisplayText.prototype, "bmpString", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Utf8String })
], DisplayText.prototype, "utf8String", void 0);
DisplayText = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], DisplayText);
class NoticeReference {
    organization = new DisplayText();
    noticeNumbers = [];
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: DisplayText })
], NoticeReference.prototype, "organization", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, repeated: "sequence",
    })
], NoticeReference.prototype, "noticeNumbers", void 0);
class UserNotice {
    noticeRef;
    explicitText;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: NoticeReference, optional: true,
    })
], UserNotice.prototype, "noticeRef", void 0);
__decorate([
    AsnProp({
        type: DisplayText, optional: true,
    })
], UserNotice.prototype, "explicitText", void 0);
let Qualifier = class Qualifier {
    cPSuri;
    userNotice;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.IA5String })
], Qualifier.prototype, "cPSuri", void 0);
__decorate([
    AsnProp({ type: UserNotice })
], Qualifier.prototype, "userNotice", void 0);
Qualifier = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], Qualifier);
class PolicyQualifierInfo {
    policyQualifierId = "";
    qualifier = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], PolicyQualifierInfo.prototype, "policyQualifierId", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Any })
], PolicyQualifierInfo.prototype, "qualifier", void 0);
class PolicyInformation {
    policyIdentifier = "";
    policyQualifiers;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], PolicyInformation.prototype, "policyIdentifier", void 0);
__decorate([
    AsnProp({
        type: PolicyQualifierInfo, repeated: "sequence", optional: true,
    })
], PolicyInformation.prototype, "policyQualifiers", void 0);
let CertificatePolicies = CertificatePolicies_1 = class CertificatePolicies extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, CertificatePolicies_1.prototype);
    }
};
CertificatePolicies = CertificatePolicies_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: PolicyInformation,
    })
], CertificatePolicies);

let CRLNumber = class CRLNumber {
    value;
    constructor(value = 0) {
        this.value = value;
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], CRLNumber.prototype, "value", void 0);
CRLNumber = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], CRLNumber);

let BaseCRLNumber = class BaseCRLNumber extends CRLNumber {
};
BaseCRLNumber = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], BaseCRLNumber);

var CRLDistributionPoints_1;
const id_ce_cRLDistributionPoints = `${id_ce}.31`;
var ReasonFlags;
(function (ReasonFlags) {
    ReasonFlags[ReasonFlags["unused"] = 1] = "unused";
    ReasonFlags[ReasonFlags["keyCompromise"] = 2] = "keyCompromise";
    ReasonFlags[ReasonFlags["cACompromise"] = 4] = "cACompromise";
    ReasonFlags[ReasonFlags["affiliationChanged"] = 8] = "affiliationChanged";
    ReasonFlags[ReasonFlags["superseded"] = 16] = "superseded";
    ReasonFlags[ReasonFlags["cessationOfOperation"] = 32] = "cessationOfOperation";
    ReasonFlags[ReasonFlags["certificateHold"] = 64] = "certificateHold";
    ReasonFlags[ReasonFlags["privilegeWithdrawn"] = 128] = "privilegeWithdrawn";
    ReasonFlags[ReasonFlags["aACompromise"] = 256] = "aACompromise";
})(ReasonFlags || (ReasonFlags = {}));
class Reason extends BitString {
    toJSON() {
        const res = [];
        const flags = this.toNumber();
        if (flags & ReasonFlags.aACompromise) {
            res.push("aACompromise");
        }
        if (flags & ReasonFlags.affiliationChanged) {
            res.push("affiliationChanged");
        }
        if (flags & ReasonFlags.cACompromise) {
            res.push("cACompromise");
        }
        if (flags & ReasonFlags.certificateHold) {
            res.push("certificateHold");
        }
        if (flags & ReasonFlags.cessationOfOperation) {
            res.push("cessationOfOperation");
        }
        if (flags & ReasonFlags.keyCompromise) {
            res.push("keyCompromise");
        }
        if (flags & ReasonFlags.privilegeWithdrawn) {
            res.push("privilegeWithdrawn");
        }
        if (flags & ReasonFlags.superseded) {
            res.push("superseded");
        }
        if (flags & ReasonFlags.unused) {
            res.push("unused");
        }
        return res;
    }
    toString() {
        return `[${this.toJSON().join(", ")}]`;
    }
}
let DistributionPointName = class DistributionPointName {
    fullName;
    nameRelativeToCRLIssuer;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: GeneralName$1, context: 0, repeated: "sequence", implicit: true,
    })
], DistributionPointName.prototype, "fullName", void 0);
__decorate([
    AsnProp({
        type: RelativeDistinguishedName, context: 1, implicit: true,
    })
], DistributionPointName.prototype, "nameRelativeToCRLIssuer", void 0);
DistributionPointName = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], DistributionPointName);
class DistributionPoint {
    distributionPoint;
    reasons;
    cRLIssuer;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: DistributionPointName, context: 0, optional: true,
    })
], DistributionPoint.prototype, "distributionPoint", void 0);
__decorate([
    AsnProp({
        type: Reason, context: 1, optional: true, implicit: true,
    })
], DistributionPoint.prototype, "reasons", void 0);
__decorate([
    AsnProp({
        type: GeneralName$1, context: 2, optional: true, repeated: "sequence", implicit: true,
    })
], DistributionPoint.prototype, "cRLIssuer", void 0);
let CRLDistributionPoints = CRLDistributionPoints_1 = class CRLDistributionPoints extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, CRLDistributionPoints_1.prototype);
    }
};
CRLDistributionPoints = CRLDistributionPoints_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: DistributionPoint,
    })
], CRLDistributionPoints);

var FreshestCRL_1;
let FreshestCRL = FreshestCRL_1 = class FreshestCRL extends CRLDistributionPoints {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, FreshestCRL_1.prototype);
    }
};
FreshestCRL = FreshestCRL_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: DistributionPoint,
    })
], FreshestCRL);

class IssuingDistributionPoint {
    static ONLY = false;
    distributionPoint;
    onlyContainsUserCerts = IssuingDistributionPoint.ONLY;
    onlyContainsCACerts = IssuingDistributionPoint.ONLY;
    onlySomeReasons;
    indirectCRL = IssuingDistributionPoint.ONLY;
    onlyContainsAttributeCerts = IssuingDistributionPoint.ONLY;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: DistributionPointName, context: 0, optional: true,
    })
], IssuingDistributionPoint.prototype, "distributionPoint", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Boolean,
        context: 1,
        defaultValue: IssuingDistributionPoint.ONLY,
        implicit: true,
    })
], IssuingDistributionPoint.prototype, "onlyContainsUserCerts", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Boolean,
        context: 2,
        defaultValue: IssuingDistributionPoint.ONLY,
        implicit: true,
    })
], IssuingDistributionPoint.prototype, "onlyContainsCACerts", void 0);
__decorate([
    AsnProp({
        type: Reason, context: 3, optional: true, implicit: true,
    })
], IssuingDistributionPoint.prototype, "onlySomeReasons", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Boolean,
        context: 4,
        defaultValue: IssuingDistributionPoint.ONLY,
        implicit: true,
    })
], IssuingDistributionPoint.prototype, "indirectCRL", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Boolean,
        context: 5,
        defaultValue: IssuingDistributionPoint.ONLY,
        implicit: true,
    })
], IssuingDistributionPoint.prototype, "onlyContainsAttributeCerts", void 0);

const id_ce_cRLReasons = `${id_ce}.21`;
var CRLReasons;
(function (CRLReasons) {
    CRLReasons[CRLReasons["unspecified"] = 0] = "unspecified";
    CRLReasons[CRLReasons["keyCompromise"] = 1] = "keyCompromise";
    CRLReasons[CRLReasons["cACompromise"] = 2] = "cACompromise";
    CRLReasons[CRLReasons["affiliationChanged"] = 3] = "affiliationChanged";
    CRLReasons[CRLReasons["superseded"] = 4] = "superseded";
    CRLReasons[CRLReasons["cessationOfOperation"] = 5] = "cessationOfOperation";
    CRLReasons[CRLReasons["certificateHold"] = 6] = "certificateHold";
    CRLReasons[CRLReasons["removeFromCRL"] = 8] = "removeFromCRL";
    CRLReasons[CRLReasons["privilegeWithdrawn"] = 9] = "privilegeWithdrawn";
    CRLReasons[CRLReasons["aACompromise"] = 10] = "aACompromise";
})(CRLReasons || (CRLReasons = {}));
let CRLReason = class CRLReason {
    reason = CRLReasons.unspecified;
    constructor(reason = CRLReasons.unspecified) {
        this.reason = reason;
    }
    toJSON() {
        return CRLReasons[this.reason];
    }
    toString() {
        return this.toJSON();
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.Enumerated })
], CRLReason.prototype, "reason", void 0);
CRLReason = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], CRLReason);

var ExtendedKeyUsage_1;
const id_ce_extKeyUsage = `${id_ce}.37`;
let ExtendedKeyUsage$1 = ExtendedKeyUsage_1 = class ExtendedKeyUsage extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, ExtendedKeyUsage_1.prototype);
    }
};
ExtendedKeyUsage$1 = ExtendedKeyUsage_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: AsnPropTypes.ObjectIdentifier,
    })
], ExtendedKeyUsage$1);
const id_kp_serverAuth = `${id_kp}.1`;
const id_kp_clientAuth = `${id_kp}.2`;
const id_kp_codeSigning = `${id_kp}.3`;
const id_kp_emailProtection = `${id_kp}.4`;
const id_kp_timeStamping = `${id_kp}.8`;
const id_kp_OCSPSigning = `${id_kp}.9`;

let InhibitAnyPolicy = class InhibitAnyPolicy {
    value;
    constructor(value = new ArrayBuffer(0)) {
        this.value = value;
    }
};
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], InhibitAnyPolicy.prototype, "value", void 0);
InhibitAnyPolicy = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], InhibitAnyPolicy);

const id_ce_invalidityDate = `${id_ce}.24`;
let InvalidityDate = class InvalidityDate {
    value = new Date();
    constructor(value) {
        if (value) {
            this.value = value;
        }
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.GeneralizedTime })
], InvalidityDate.prototype, "value", void 0);
InvalidityDate = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], InvalidityDate);

var IssueAlternativeName_1;
const id_ce_issuerAltName = `${id_ce}.18`;
let IssueAlternativeName = IssueAlternativeName_1 = class IssueAlternativeName extends GeneralNames$1 {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, IssueAlternativeName_1.prototype);
    }
};
IssueAlternativeName = IssueAlternativeName_1 = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], IssueAlternativeName);

const id_ce_keyUsage = `${id_ce}.15`;
var KeyUsageFlags$1;
(function (KeyUsageFlags) {
    KeyUsageFlags[KeyUsageFlags["digitalSignature"] = 1] = "digitalSignature";
    KeyUsageFlags[KeyUsageFlags["nonRepudiation"] = 2] = "nonRepudiation";
    KeyUsageFlags[KeyUsageFlags["keyEncipherment"] = 4] = "keyEncipherment";
    KeyUsageFlags[KeyUsageFlags["dataEncipherment"] = 8] = "dataEncipherment";
    KeyUsageFlags[KeyUsageFlags["keyAgreement"] = 16] = "keyAgreement";
    KeyUsageFlags[KeyUsageFlags["keyCertSign"] = 32] = "keyCertSign";
    KeyUsageFlags[KeyUsageFlags["cRLSign"] = 64] = "cRLSign";
    KeyUsageFlags[KeyUsageFlags["encipherOnly"] = 128] = "encipherOnly";
    KeyUsageFlags[KeyUsageFlags["decipherOnly"] = 256] = "decipherOnly";
})(KeyUsageFlags$1 || (KeyUsageFlags$1 = {}));
class KeyUsage extends BitString {
    toJSON() {
        const flag = this.toNumber();
        const res = [];
        if (flag & KeyUsageFlags$1.cRLSign) {
            res.push("crlSign");
        }
        if (flag & KeyUsageFlags$1.dataEncipherment) {
            res.push("dataEncipherment");
        }
        if (flag & KeyUsageFlags$1.decipherOnly) {
            res.push("decipherOnly");
        }
        if (flag & KeyUsageFlags$1.digitalSignature) {
            res.push("digitalSignature");
        }
        if (flag & KeyUsageFlags$1.encipherOnly) {
            res.push("encipherOnly");
        }
        if (flag & KeyUsageFlags$1.keyAgreement) {
            res.push("keyAgreement");
        }
        if (flag & KeyUsageFlags$1.keyCertSign) {
            res.push("keyCertSign");
        }
        if (flag & KeyUsageFlags$1.keyEncipherment) {
            res.push("keyEncipherment");
        }
        if (flag & KeyUsageFlags$1.nonRepudiation) {
            res.push("nonRepudiation");
        }
        return res;
    }
    toString() {
        return `[${this.toJSON().join(", ")}]`;
    }
}

var GeneralSubtrees_1;
class GeneralSubtree {
    base = new GeneralName$1();
    minimum = 0;
    maximum;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: GeneralName$1 })
], GeneralSubtree.prototype, "base", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, context: 0, defaultValue: 0, implicit: true,
    })
], GeneralSubtree.prototype, "minimum", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, context: 1, optional: true, implicit: true,
    })
], GeneralSubtree.prototype, "maximum", void 0);
let GeneralSubtrees = GeneralSubtrees_1 = class GeneralSubtrees extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, GeneralSubtrees_1.prototype);
    }
};
GeneralSubtrees = GeneralSubtrees_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: GeneralSubtree,
    })
], GeneralSubtrees);
class NameConstraints {
    permittedSubtrees;
    excludedSubtrees;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: GeneralSubtrees, context: 0, optional: true, implicit: true,
    })
], NameConstraints.prototype, "permittedSubtrees", void 0);
__decorate([
    AsnProp({
        type: GeneralSubtrees, context: 1, optional: true, implicit: true,
    })
], NameConstraints.prototype, "excludedSubtrees", void 0);

class PolicyConstraints {
    requireExplicitPolicy;
    inhibitPolicyMapping;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer,
        context: 0,
        implicit: true,
        optional: true,
        converter: AsnIntegerArrayBufferConverter,
    })
], PolicyConstraints.prototype, "requireExplicitPolicy", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer,
        context: 1,
        implicit: true,
        optional: true,
        converter: AsnIntegerArrayBufferConverter,
    })
], PolicyConstraints.prototype, "inhibitPolicyMapping", void 0);

var PolicyMappings_1;
class PolicyMapping {
    issuerDomainPolicy = "";
    subjectDomainPolicy = "";
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], PolicyMapping.prototype, "issuerDomainPolicy", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], PolicyMapping.prototype, "subjectDomainPolicy", void 0);
let PolicyMappings = PolicyMappings_1 = class PolicyMappings extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, PolicyMappings_1.prototype);
    }
};
PolicyMappings = PolicyMappings_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: PolicyMapping,
    })
], PolicyMappings);

var SubjectAlternativeName_1;
const id_ce_subjectAltName = `${id_ce}.17`;
let SubjectAlternativeName = SubjectAlternativeName_1 = class SubjectAlternativeName extends GeneralNames$1 {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, SubjectAlternativeName_1.prototype);
    }
};
SubjectAlternativeName = SubjectAlternativeName_1 = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], SubjectAlternativeName);

class Attribute$2 {
    type = "";
    values = [];
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], Attribute$2.prototype, "type", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, repeated: "set",
    })
], Attribute$2.prototype, "values", void 0);

var SubjectDirectoryAttributes_1;
let SubjectDirectoryAttributes = SubjectDirectoryAttributes_1 = class SubjectDirectoryAttributes extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, SubjectDirectoryAttributes_1.prototype);
    }
};
SubjectDirectoryAttributes = SubjectDirectoryAttributes_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: Attribute$2,
    })
], SubjectDirectoryAttributes);

const id_ce_subjectKeyIdentifier = `${id_ce}.14`;
class SubjectKeyIdentifier extends KeyIdentifier {
}

class PrivateKeyUsagePeriod {
    notBefore;
    notAfter;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.GeneralizedTime, context: 0, implicit: true, optional: true,
    })
], PrivateKeyUsagePeriod.prototype, "notBefore", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.GeneralizedTime, context: 1, implicit: true, optional: true,
    })
], PrivateKeyUsagePeriod.prototype, "notAfter", void 0);

var EntrustInfoFlags;
(function (EntrustInfoFlags) {
    EntrustInfoFlags[EntrustInfoFlags["keyUpdateAllowed"] = 1] = "keyUpdateAllowed";
    EntrustInfoFlags[EntrustInfoFlags["newExtensions"] = 2] = "newExtensions";
    EntrustInfoFlags[EntrustInfoFlags["pKIXCertificate"] = 4] = "pKIXCertificate";
})(EntrustInfoFlags || (EntrustInfoFlags = {}));
class EntrustInfo extends BitString {
    toJSON() {
        const res = [];
        const flags = this.toNumber();
        if (flags & EntrustInfoFlags.pKIXCertificate) {
            res.push("pKIXCertificate");
        }
        if (flags & EntrustInfoFlags.newExtensions) {
            res.push("newExtensions");
        }
        if (flags & EntrustInfoFlags.keyUpdateAllowed) {
            res.push("keyUpdateAllowed");
        }
        return res;
    }
    toString() {
        return `[${this.toJSON().join(", ")}]`;
    }
}
class EntrustVersionInfo {
    entrustVers = "";
    entrustInfoFlags = new EntrustInfo();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.GeneralString })
], EntrustVersionInfo.prototype, "entrustVers", void 0);
__decorate([
    AsnProp({ type: EntrustInfo })
], EntrustVersionInfo.prototype, "entrustInfoFlags", void 0);

var SubjectInfoAccessSyntax_1;
let SubjectInfoAccessSyntax = SubjectInfoAccessSyntax_1 = class SubjectInfoAccessSyntax extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, SubjectInfoAccessSyntax_1.prototype);
    }
};
SubjectInfoAccessSyntax = SubjectInfoAccessSyntax_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: AccessDescription,
    })
], SubjectInfoAccessSyntax);

class AlgorithmIdentifier {
    algorithm = "";
    parameters;
    constructor(params = {}) {
        Object.assign(this, params);
    }
    isEqual(data) {
        return (data instanceof AlgorithmIdentifier
            && data.algorithm == this.algorithm
            && ((data.parameters
                && this.parameters
                && equal(data.parameters, this.parameters))
                || data.parameters === this.parameters));
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], AlgorithmIdentifier.prototype, "algorithm", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any,
        optional: true,
    })
], AlgorithmIdentifier.prototype, "parameters", void 0);

class SubjectPublicKeyInfo {
    algorithm = new AlgorithmIdentifier();
    subjectPublicKey = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], SubjectPublicKeyInfo.prototype, "algorithm", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BitString })
], SubjectPublicKeyInfo.prototype, "subjectPublicKey", void 0);

let Time = class Time {
    utcTime;
    generalTime;
    constructor(time) {
        if (time) {
            if (typeof time === "string" || typeof time === "number" || time instanceof Date) {
                const date = new Date(time);
                date.setMilliseconds(0);
                if (date.getUTCFullYear() > 2049) {
                    this.generalTime = date;
                }
                else {
                    this.utcTime = date;
                }
            }
            else {
                Object.assign(this, time);
            }
        }
    }
    getTime() {
        const time = this.utcTime || this.generalTime;
        if (!time) {
            throw new Error("Cannot get time from CHOICE object");
        }
        return time;
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.UTCTime })
], Time.prototype, "utcTime", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.GeneralizedTime })
], Time.prototype, "generalTime", void 0);
Time = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], Time);

class Validity {
    notBefore = new Time(new Date());
    notAfter = new Time(new Date());
    constructor(params) {
        if (params) {
            this.notBefore = new Time(params.notBefore);
            this.notAfter = new Time(params.notAfter);
        }
    }
}
__decorate([
    AsnProp({ type: Time })
], Validity.prototype, "notBefore", void 0);
__decorate([
    AsnProp({ type: Time })
], Validity.prototype, "notAfter", void 0);

var Extensions_1;
class Extension$1 {
    static CRITICAL = false;
    extnID = "";
    critical = Extension$1.CRITICAL;
    extnValue = new OctetString();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], Extension$1.prototype, "extnID", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Boolean,
        defaultValue: Extension$1.CRITICAL,
    })
], Extension$1.prototype, "critical", void 0);
__decorate([
    AsnProp({ type: OctetString })
], Extension$1.prototype, "extnValue", void 0);
let Extensions = Extensions_1 = class Extensions extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, Extensions_1.prototype);
    }
};
Extensions = Extensions_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: Extension$1,
    })
], Extensions);

var Version$1;
(function (Version) {
    Version[Version["v1"] = 0] = "v1";
    Version[Version["v2"] = 1] = "v2";
    Version[Version["v3"] = 2] = "v3";
})(Version$1 || (Version$1 = {}));

class TBSCertificate {
    version = Version$1.v1;
    serialNumber = new ArrayBuffer(0);
    signature = new AlgorithmIdentifier();
    issuer = new Name$1();
    validity = new Validity();
    subject = new Name$1();
    subjectPublicKeyInfo = new SubjectPublicKeyInfo();
    issuerUniqueID;
    subjectUniqueID;
    extensions;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer,
        context: 0,
        defaultValue: Version$1.v1,
    })
], TBSCertificate.prototype, "version", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer,
        converter: AsnIntegerArrayBufferConverter,
    })
], TBSCertificate.prototype, "serialNumber", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], TBSCertificate.prototype, "signature", void 0);
__decorate([
    AsnProp({ type: Name$1 })
], TBSCertificate.prototype, "issuer", void 0);
__decorate([
    AsnProp({ type: Validity })
], TBSCertificate.prototype, "validity", void 0);
__decorate([
    AsnProp({ type: Name$1 })
], TBSCertificate.prototype, "subject", void 0);
__decorate([
    AsnProp({ type: SubjectPublicKeyInfo })
], TBSCertificate.prototype, "subjectPublicKeyInfo", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.BitString,
        context: 1,
        implicit: true,
        optional: true,
    })
], TBSCertificate.prototype, "issuerUniqueID", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.BitString, context: 2, implicit: true, optional: true,
    })
], TBSCertificate.prototype, "subjectUniqueID", void 0);
__decorate([
    AsnProp({
        type: Extensions, context: 3, optional: true,
    })
], TBSCertificate.prototype, "extensions", void 0);

class Certificate {
    tbsCertificate = new TBSCertificate();
    tbsCertificateRaw;
    signatureAlgorithm = new AlgorithmIdentifier();
    signatureValue = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: TBSCertificate, raw: true,
    })
], Certificate.prototype, "tbsCertificate", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], Certificate.prototype, "signatureAlgorithm", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BitString })
], Certificate.prototype, "signatureValue", void 0);

class RevokedCertificate {
    userCertificate = new ArrayBuffer(0);
    revocationDate = new Time();
    crlEntryExtensions;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RevokedCertificate.prototype, "userCertificate", void 0);
__decorate([
    AsnProp({ type: Time })
], RevokedCertificate.prototype, "revocationDate", void 0);
__decorate([
    AsnProp({
        type: Extension$1, optional: true, repeated: "sequence",
    })
], RevokedCertificate.prototype, "crlEntryExtensions", void 0);
class TBSCertList {
    version;
    signature = new AlgorithmIdentifier();
    issuer = new Name$1();
    thisUpdate = new Time();
    nextUpdate;
    revokedCertificates;
    crlExtensions;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, optional: true,
    })
], TBSCertList.prototype, "version", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], TBSCertList.prototype, "signature", void 0);
__decorate([
    AsnProp({ type: Name$1 })
], TBSCertList.prototype, "issuer", void 0);
__decorate([
    AsnProp({ type: Time })
], TBSCertList.prototype, "thisUpdate", void 0);
__decorate([
    AsnProp({
        type: Time, optional: true,
    })
], TBSCertList.prototype, "nextUpdate", void 0);
__decorate([
    AsnProp({
        type: RevokedCertificate, repeated: "sequence", optional: true,
    })
], TBSCertList.prototype, "revokedCertificates", void 0);
__decorate([
    AsnProp({
        type: Extension$1, optional: true, context: 0, repeated: "sequence",
    })
], TBSCertList.prototype, "crlExtensions", void 0);

class CertificateList {
    tbsCertList = new TBSCertList();
    tbsCertListRaw;
    signatureAlgorithm = new AlgorithmIdentifier();
    signature = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: TBSCertList, raw: true,
    })
], CertificateList.prototype, "tbsCertList", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], CertificateList.prototype, "signatureAlgorithm", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BitString })
], CertificateList.prototype, "signature", void 0);

class IssuerAndSerialNumber {
    issuer = new Name$1();
    serialNumber = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: Name$1 })
], IssuerAndSerialNumber.prototype, "issuer", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], IssuerAndSerialNumber.prototype, "serialNumber", void 0);

let SignerIdentifier = class SignerIdentifier {
    subjectKeyIdentifier;
    issuerAndSerialNumber;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: SubjectKeyIdentifier, context: 0, implicit: true,
    })
], SignerIdentifier.prototype, "subjectKeyIdentifier", void 0);
__decorate([
    AsnProp({ type: IssuerAndSerialNumber })
], SignerIdentifier.prototype, "issuerAndSerialNumber", void 0);
SignerIdentifier = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], SignerIdentifier);

var CMSVersion;
(function (CMSVersion) {
    CMSVersion[CMSVersion["v0"] = 0] = "v0";
    CMSVersion[CMSVersion["v1"] = 1] = "v1";
    CMSVersion[CMSVersion["v2"] = 2] = "v2";
    CMSVersion[CMSVersion["v3"] = 3] = "v3";
    CMSVersion[CMSVersion["v4"] = 4] = "v4";
    CMSVersion[CMSVersion["v5"] = 5] = "v5";
})(CMSVersion || (CMSVersion = {}));
let DigestAlgorithmIdentifier = class DigestAlgorithmIdentifier extends AlgorithmIdentifier {
};
DigestAlgorithmIdentifier = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], DigestAlgorithmIdentifier);
let SignatureAlgorithmIdentifier = class SignatureAlgorithmIdentifier extends AlgorithmIdentifier {
};
SignatureAlgorithmIdentifier = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], SignatureAlgorithmIdentifier);
let KeyEncryptionAlgorithmIdentifier = class KeyEncryptionAlgorithmIdentifier extends AlgorithmIdentifier {
};
KeyEncryptionAlgorithmIdentifier = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], KeyEncryptionAlgorithmIdentifier);
let ContentEncryptionAlgorithmIdentifier = class ContentEncryptionAlgorithmIdentifier extends AlgorithmIdentifier {
};
ContentEncryptionAlgorithmIdentifier = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], ContentEncryptionAlgorithmIdentifier);
let MessageAuthenticationCodeAlgorithm = class MessageAuthenticationCodeAlgorithm extends AlgorithmIdentifier {
};
MessageAuthenticationCodeAlgorithm = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], MessageAuthenticationCodeAlgorithm);
let KeyDerivationAlgorithmIdentifier = class KeyDerivationAlgorithmIdentifier extends AlgorithmIdentifier {
};
KeyDerivationAlgorithmIdentifier = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], KeyDerivationAlgorithmIdentifier);

class Attribute$1 {
    attrType = "";
    attrValues = [];
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], Attribute$1.prototype, "attrType", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, repeated: "set",
    })
], Attribute$1.prototype, "attrValues", void 0);

var SignerInfos_1;
class SignerInfo {
    version = CMSVersion.v0;
    sid = new SignerIdentifier();
    digestAlgorithm = new DigestAlgorithmIdentifier();
    signedAttrs;
    signedAttrsRaw;
    signatureAlgorithm = new SignatureAlgorithmIdentifier();
    signature = new OctetString();
    unsignedAttrs;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], SignerInfo.prototype, "version", void 0);
__decorate([
    AsnProp({ type: SignerIdentifier })
], SignerInfo.prototype, "sid", void 0);
__decorate([
    AsnProp({ type: DigestAlgorithmIdentifier })
], SignerInfo.prototype, "digestAlgorithm", void 0);
__decorate([
    AsnProp({
        type: Attribute$1,
        repeated: "set",
        context: 0,
        implicit: true,
        optional: true,
        raw: true,
    })
], SignerInfo.prototype, "signedAttrs", void 0);
__decorate([
    AsnProp({ type: SignatureAlgorithmIdentifier })
], SignerInfo.prototype, "signatureAlgorithm", void 0);
__decorate([
    AsnProp({ type: OctetString })
], SignerInfo.prototype, "signature", void 0);
__decorate([
    AsnProp({
        type: Attribute$1, repeated: "set", context: 1, implicit: true, optional: true,
    })
], SignerInfo.prototype, "unsignedAttrs", void 0);
let SignerInfos = SignerInfos_1 = class SignerInfos extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, SignerInfos_1.prototype);
    }
};
SignerInfos = SignerInfos_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Set, itemType: SignerInfo,
    })
], SignerInfos);

let CounterSignature$1 = class CounterSignature extends SignerInfo {
};
CounterSignature$1 = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], CounterSignature$1);

let SigningTime$1 = class SigningTime extends Time {
};
SigningTime$1 = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], SigningTime$1);

class ACClearAttrs {
    acIssuer = new GeneralName$1();
    acSerial = 0;
    attrs = [];
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: GeneralName$1 })
], ACClearAttrs.prototype, "acIssuer", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], ACClearAttrs.prototype, "acSerial", void 0);
__decorate([
    AsnProp({
        type: Attribute$2, repeated: "sequence",
    })
], ACClearAttrs.prototype, "attrs", void 0);

var AttrSpec_1;
let AttrSpec = AttrSpec_1 = class AttrSpec extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, AttrSpec_1.prototype);
    }
};
AttrSpec = AttrSpec_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: AsnPropTypes.ObjectIdentifier,
    })
], AttrSpec);

class AAControls {
    pathLenConstraint;
    permittedAttrs;
    excludedAttrs;
    permitUnSpecified = true;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, optional: true,
    })
], AAControls.prototype, "pathLenConstraint", void 0);
__decorate([
    AsnProp({
        type: AttrSpec, implicit: true, context: 0, optional: true,
    })
], AAControls.prototype, "permittedAttrs", void 0);
__decorate([
    AsnProp({
        type: AttrSpec, implicit: true, context: 1, optional: true,
    })
], AAControls.prototype, "excludedAttrs", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Boolean, defaultValue: true,
    })
], AAControls.prototype, "permitUnSpecified", void 0);

class IssuerSerial {
    issuer = new GeneralNames$1();
    serial = new ArrayBuffer(0);
    issuerUID = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: GeneralNames$1 })
], IssuerSerial.prototype, "issuer", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], IssuerSerial.prototype, "serial", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.BitString, optional: true,
    })
], IssuerSerial.prototype, "issuerUID", void 0);

var DigestedObjectType;
(function (DigestedObjectType) {
    DigestedObjectType[DigestedObjectType["publicKey"] = 0] = "publicKey";
    DigestedObjectType[DigestedObjectType["publicKeyCert"] = 1] = "publicKeyCert";
    DigestedObjectType[DigestedObjectType["otherObjectTypes"] = 2] = "otherObjectTypes";
})(DigestedObjectType || (DigestedObjectType = {}));
class ObjectDigestInfo {
    digestedObjectType = DigestedObjectType.publicKey;
    otherObjectTypeID;
    digestAlgorithm = new AlgorithmIdentifier();
    objectDigest = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Enumerated })
], ObjectDigestInfo.prototype, "digestedObjectType", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.ObjectIdentifier, optional: true,
    })
], ObjectDigestInfo.prototype, "otherObjectTypeID", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], ObjectDigestInfo.prototype, "digestAlgorithm", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BitString })
], ObjectDigestInfo.prototype, "objectDigest", void 0);

class V2Form {
    issuerName;
    baseCertificateID;
    objectDigestInfo;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: GeneralNames$1, optional: true,
    })
], V2Form.prototype, "issuerName", void 0);
__decorate([
    AsnProp({
        type: IssuerSerial, context: 0, implicit: true, optional: true,
    })
], V2Form.prototype, "baseCertificateID", void 0);
__decorate([
    AsnProp({
        type: ObjectDigestInfo, context: 1, implicit: true, optional: true,
    })
], V2Form.prototype, "objectDigestInfo", void 0);

let AttCertIssuer = class AttCertIssuer {
    v1Form;
    v2Form;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: GeneralName$1, repeated: "sequence",
    })
], AttCertIssuer.prototype, "v1Form", void 0);
__decorate([
    AsnProp({
        type: V2Form, context: 0, implicit: true,
    })
], AttCertIssuer.prototype, "v2Form", void 0);
AttCertIssuer = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], AttCertIssuer);

class AttCertValidityPeriod {
    notBeforeTime = new Date();
    notAfterTime = new Date();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.GeneralizedTime })
], AttCertValidityPeriod.prototype, "notBeforeTime", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.GeneralizedTime })
], AttCertValidityPeriod.prototype, "notAfterTime", void 0);

class Holder {
    baseCertificateID;
    entityName;
    objectDigestInfo;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: IssuerSerial, implicit: true, context: 0, optional: true,
    })
], Holder.prototype, "baseCertificateID", void 0);
__decorate([
    AsnProp({
        type: GeneralNames$1, implicit: true, context: 1, optional: true,
    })
], Holder.prototype, "entityName", void 0);
__decorate([
    AsnProp({
        type: ObjectDigestInfo, implicit: true, context: 2, optional: true,
    })
], Holder.prototype, "objectDigestInfo", void 0);

var AttCertVersion;
(function (AttCertVersion) {
    AttCertVersion[AttCertVersion["v2"] = 1] = "v2";
})(AttCertVersion || (AttCertVersion = {}));
class AttributeCertificateInfo {
    version = AttCertVersion.v2;
    holder = new Holder();
    issuer = new AttCertIssuer();
    signature = new AlgorithmIdentifier();
    serialNumber = new ArrayBuffer(0);
    attrCertValidityPeriod = new AttCertValidityPeriod();
    attributes = [];
    issuerUniqueID;
    extensions;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], AttributeCertificateInfo.prototype, "version", void 0);
__decorate([
    AsnProp({ type: Holder })
], AttributeCertificateInfo.prototype, "holder", void 0);
__decorate([
    AsnProp({ type: AttCertIssuer })
], AttributeCertificateInfo.prototype, "issuer", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], AttributeCertificateInfo.prototype, "signature", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], AttributeCertificateInfo.prototype, "serialNumber", void 0);
__decorate([
    AsnProp({ type: AttCertValidityPeriod })
], AttributeCertificateInfo.prototype, "attrCertValidityPeriod", void 0);
__decorate([
    AsnProp({
        type: Attribute$2, repeated: "sequence",
    })
], AttributeCertificateInfo.prototype, "attributes", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.BitString, optional: true,
    })
], AttributeCertificateInfo.prototype, "issuerUniqueID", void 0);
__decorate([
    AsnProp({
        type: Extensions, optional: true,
    })
], AttributeCertificateInfo.prototype, "extensions", void 0);

class AttributeCertificate {
    acinfo = new AttributeCertificateInfo();
    signatureAlgorithm = new AlgorithmIdentifier();
    signatureValue = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AttributeCertificateInfo })
], AttributeCertificate.prototype, "acinfo", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], AttributeCertificate.prototype, "signatureAlgorithm", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BitString })
], AttributeCertificate.prototype, "signatureValue", void 0);

var ClassListFlags;
(function (ClassListFlags) {
    ClassListFlags[ClassListFlags["unmarked"] = 1] = "unmarked";
    ClassListFlags[ClassListFlags["unclassified"] = 2] = "unclassified";
    ClassListFlags[ClassListFlags["restricted"] = 4] = "restricted";
    ClassListFlags[ClassListFlags["confidential"] = 8] = "confidential";
    ClassListFlags[ClassListFlags["secret"] = 16] = "secret";
    ClassListFlags[ClassListFlags["topSecret"] = 32] = "topSecret";
})(ClassListFlags || (ClassListFlags = {}));
class ClassList extends BitString {
}

class SecurityCategory {
    type = "";
    value = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.ObjectIdentifier, implicit: true, context: 0,
    })
], SecurityCategory.prototype, "type", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, implicit: true, context: 1,
    })
], SecurityCategory.prototype, "value", void 0);

class Clearance {
    policyId = "";
    classList = new ClassList(ClassListFlags.unclassified);
    securityCategories;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], Clearance.prototype, "policyId", void 0);
__decorate([
    AsnProp({
        type: ClassList, defaultValue: new ClassList(ClassListFlags.unclassified),
    })
], Clearance.prototype, "classList", void 0);
__decorate([
    AsnProp({
        type: SecurityCategory, repeated: "set",
    })
], Clearance.prototype, "securityCategories", void 0);

class IetfAttrSyntaxValueChoices {
    cotets;
    oid;
    string;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: OctetString })
], IetfAttrSyntaxValueChoices.prototype, "cotets", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], IetfAttrSyntaxValueChoices.prototype, "oid", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Utf8String })
], IetfAttrSyntaxValueChoices.prototype, "string", void 0);
class IetfAttrSyntax {
    policyAuthority;
    values = [];
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: GeneralNames$1, implicit: true, context: 0, optional: true,
    })
], IetfAttrSyntax.prototype, "policyAuthority", void 0);
__decorate([
    AsnProp({
        type: IetfAttrSyntaxValueChoices, repeated: "sequence",
    })
], IetfAttrSyntax.prototype, "values", void 0);

var Targets_1;
class TargetCert {
    targetCertificate = new IssuerSerial();
    targetName;
    certDigestInfo;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: IssuerSerial })
], TargetCert.prototype, "targetCertificate", void 0);
__decorate([
    AsnProp({
        type: GeneralName$1, optional: true,
    })
], TargetCert.prototype, "targetName", void 0);
__decorate([
    AsnProp({
        type: ObjectDigestInfo, optional: true,
    })
], TargetCert.prototype, "certDigestInfo", void 0);
let Target = class Target {
    targetName;
    targetGroup;
    targetCert;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: GeneralName$1, context: 0, implicit: true,
    })
], Target.prototype, "targetName", void 0);
__decorate([
    AsnProp({
        type: GeneralName$1, context: 1, implicit: true,
    })
], Target.prototype, "targetGroup", void 0);
__decorate([
    AsnProp({
        type: TargetCert, context: 2, implicit: true,
    })
], Target.prototype, "targetCert", void 0);
Target = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], Target);
let Targets = Targets_1 = class Targets extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, Targets_1.prototype);
    }
};
Targets = Targets_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: Target,
    })
], Targets);

var ProxyInfo_1;
let ProxyInfo = ProxyInfo_1 = class ProxyInfo extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, ProxyInfo_1.prototype);
    }
};
ProxyInfo = ProxyInfo_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: Targets,
    })
], ProxyInfo);

class RoleSyntax {
    roleAuthority;
    roleName;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: GeneralNames$1, implicit: true, context: 0, optional: true,
    })
], RoleSyntax.prototype, "roleAuthority", void 0);
__decorate([
    AsnProp({
        type: GeneralName$1, implicit: true, context: 1,
    })
], RoleSyntax.prototype, "roleName", void 0);

class SvceAuthInfo {
    service = new GeneralName$1();
    ident = new GeneralName$1();
    authInfo;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: GeneralName$1 })
], SvceAuthInfo.prototype, "service", void 0);
__decorate([
    AsnProp({ type: GeneralName$1 })
], SvceAuthInfo.prototype, "ident", void 0);
__decorate([
    AsnProp({
        type: OctetString, optional: true,
    })
], SvceAuthInfo.prototype, "authInfo", void 0);

var CertificateSet_1;
class OtherCertificateFormat {
    otherCertFormat = "";
    otherCert = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], OtherCertificateFormat.prototype, "otherCertFormat", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Any })
], OtherCertificateFormat.prototype, "otherCert", void 0);
let CertificateChoices = class CertificateChoices {
    certificate;
    v2AttrCert;
    other;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({ type: Certificate })
], CertificateChoices.prototype, "certificate", void 0);
__decorate([
    AsnProp({
        type: AttributeCertificate, context: 2, implicit: true,
    })
], CertificateChoices.prototype, "v2AttrCert", void 0);
__decorate([
    AsnProp({
        type: OtherCertificateFormat, context: 3, implicit: true,
    })
], CertificateChoices.prototype, "other", void 0);
CertificateChoices = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], CertificateChoices);
let CertificateSet = CertificateSet_1 = class CertificateSet extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, CertificateSet_1.prototype);
    }
};
CertificateSet = CertificateSet_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Set, itemType: CertificateChoices,
    })
], CertificateSet);

class ContentInfo {
    contentType = "";
    content = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], ContentInfo.prototype, "contentType", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, context: 0,
    })
], ContentInfo.prototype, "content", void 0);

let EncapsulatedContent = class EncapsulatedContent {
    single;
    any;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({ type: OctetString })
], EncapsulatedContent.prototype, "single", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Any })
], EncapsulatedContent.prototype, "any", void 0);
EncapsulatedContent = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], EncapsulatedContent);
class EncapsulatedContentInfo {
    eContentType = "";
    eContent;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], EncapsulatedContentInfo.prototype, "eContentType", void 0);
__decorate([
    AsnProp({
        type: EncapsulatedContent, context: 0, optional: true,
    })
], EncapsulatedContentInfo.prototype, "eContent", void 0);

let EncryptedContent = class EncryptedContent {
    value;
    constructedValue;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: OctetString, context: 0, implicit: true, optional: true,
    })
], EncryptedContent.prototype, "value", void 0);
__decorate([
    AsnProp({
        type: OctetString,
        converter: AsnConstructedOctetStringConverter,
        context: 0,
        implicit: true,
        optional: true,
        repeated: "sequence",
    })
], EncryptedContent.prototype, "constructedValue", void 0);
EncryptedContent = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], EncryptedContent);
class EncryptedContentInfo {
    contentType = "";
    contentEncryptionAlgorithm = new ContentEncryptionAlgorithmIdentifier();
    encryptedContent;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], EncryptedContentInfo.prototype, "contentType", void 0);
__decorate([
    AsnProp({ type: ContentEncryptionAlgorithmIdentifier })
], EncryptedContentInfo.prototype, "contentEncryptionAlgorithm", void 0);
__decorate([
    AsnProp({
        type: EncryptedContent, optional: true,
    })
], EncryptedContentInfo.prototype, "encryptedContent", void 0);

class OtherKeyAttribute {
    keyAttrId = "";
    keyAttr;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], OtherKeyAttribute.prototype, "keyAttrId", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, optional: true,
    })
], OtherKeyAttribute.prototype, "keyAttr", void 0);

var RecipientEncryptedKeys_1;
class RecipientKeyIdentifier {
    subjectKeyIdentifier = new SubjectKeyIdentifier();
    date;
    other;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: SubjectKeyIdentifier })
], RecipientKeyIdentifier.prototype, "subjectKeyIdentifier", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.GeneralizedTime, optional: true,
    })
], RecipientKeyIdentifier.prototype, "date", void 0);
__decorate([
    AsnProp({
        type: OtherKeyAttribute, optional: true,
    })
], RecipientKeyIdentifier.prototype, "other", void 0);
let KeyAgreeRecipientIdentifier = class KeyAgreeRecipientIdentifier {
    rKeyId;
    issuerAndSerialNumber;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: RecipientKeyIdentifier, context: 0, implicit: true, optional: true,
    })
], KeyAgreeRecipientIdentifier.prototype, "rKeyId", void 0);
__decorate([
    AsnProp({
        type: IssuerAndSerialNumber, optional: true,
    })
], KeyAgreeRecipientIdentifier.prototype, "issuerAndSerialNumber", void 0);
KeyAgreeRecipientIdentifier = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], KeyAgreeRecipientIdentifier);
class RecipientEncryptedKey {
    rid = new KeyAgreeRecipientIdentifier();
    encryptedKey = new OctetString();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: KeyAgreeRecipientIdentifier })
], RecipientEncryptedKey.prototype, "rid", void 0);
__decorate([
    AsnProp({ type: OctetString })
], RecipientEncryptedKey.prototype, "encryptedKey", void 0);
let RecipientEncryptedKeys = RecipientEncryptedKeys_1 = class RecipientEncryptedKeys extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, RecipientEncryptedKeys_1.prototype);
    }
};
RecipientEncryptedKeys = RecipientEncryptedKeys_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: RecipientEncryptedKey,
    })
], RecipientEncryptedKeys);
class OriginatorPublicKey {
    algorithm = new AlgorithmIdentifier();
    publicKey = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], OriginatorPublicKey.prototype, "algorithm", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BitString })
], OriginatorPublicKey.prototype, "publicKey", void 0);
let OriginatorIdentifierOrKey = class OriginatorIdentifierOrKey {
    subjectKeyIdentifier;
    originatorKey;
    issuerAndSerialNumber;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: SubjectKeyIdentifier, context: 0, implicit: true, optional: true,
    })
], OriginatorIdentifierOrKey.prototype, "subjectKeyIdentifier", void 0);
__decorate([
    AsnProp({
        type: OriginatorPublicKey, context: 1, implicit: true, optional: true,
    })
], OriginatorIdentifierOrKey.prototype, "originatorKey", void 0);
__decorate([
    AsnProp({
        type: IssuerAndSerialNumber, optional: true,
    })
], OriginatorIdentifierOrKey.prototype, "issuerAndSerialNumber", void 0);
OriginatorIdentifierOrKey = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], OriginatorIdentifierOrKey);
class KeyAgreeRecipientInfo {
    version = CMSVersion.v3;
    originator = new OriginatorIdentifierOrKey();
    ukm;
    keyEncryptionAlgorithm = new KeyEncryptionAlgorithmIdentifier();
    recipientEncryptedKeys = new RecipientEncryptedKeys();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], KeyAgreeRecipientInfo.prototype, "version", void 0);
__decorate([
    AsnProp({
        type: OriginatorIdentifierOrKey, context: 0,
    })
], KeyAgreeRecipientInfo.prototype, "originator", void 0);
__decorate([
    AsnProp({
        type: OctetString, context: 1, optional: true,
    })
], KeyAgreeRecipientInfo.prototype, "ukm", void 0);
__decorate([
    AsnProp({ type: KeyEncryptionAlgorithmIdentifier })
], KeyAgreeRecipientInfo.prototype, "keyEncryptionAlgorithm", void 0);
__decorate([
    AsnProp({ type: RecipientEncryptedKeys })
], KeyAgreeRecipientInfo.prototype, "recipientEncryptedKeys", void 0);

let RecipientIdentifier = class RecipientIdentifier {
    subjectKeyIdentifier;
    issuerAndSerialNumber;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: SubjectKeyIdentifier, context: 0, implicit: true,
    })
], RecipientIdentifier.prototype, "subjectKeyIdentifier", void 0);
__decorate([
    AsnProp({ type: IssuerAndSerialNumber })
], RecipientIdentifier.prototype, "issuerAndSerialNumber", void 0);
RecipientIdentifier = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], RecipientIdentifier);
class KeyTransRecipientInfo {
    version = CMSVersion.v0;
    rid = new RecipientIdentifier();
    keyEncryptionAlgorithm = new KeyEncryptionAlgorithmIdentifier();
    encryptedKey = new OctetString();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], KeyTransRecipientInfo.prototype, "version", void 0);
__decorate([
    AsnProp({ type: RecipientIdentifier })
], KeyTransRecipientInfo.prototype, "rid", void 0);
__decorate([
    AsnProp({ type: KeyEncryptionAlgorithmIdentifier })
], KeyTransRecipientInfo.prototype, "keyEncryptionAlgorithm", void 0);
__decorate([
    AsnProp({ type: OctetString })
], KeyTransRecipientInfo.prototype, "encryptedKey", void 0);

class KEKIdentifier {
    keyIdentifier = new OctetString();
    date;
    other;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: OctetString })
], KEKIdentifier.prototype, "keyIdentifier", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.GeneralizedTime, optional: true,
    })
], KEKIdentifier.prototype, "date", void 0);
__decorate([
    AsnProp({
        type: OtherKeyAttribute, optional: true,
    })
], KEKIdentifier.prototype, "other", void 0);
class KEKRecipientInfo {
    version = CMSVersion.v4;
    kekid = new KEKIdentifier();
    keyEncryptionAlgorithm = new KeyEncryptionAlgorithmIdentifier();
    encryptedKey = new OctetString();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], KEKRecipientInfo.prototype, "version", void 0);
__decorate([
    AsnProp({ type: KEKIdentifier })
], KEKRecipientInfo.prototype, "kekid", void 0);
__decorate([
    AsnProp({ type: KeyEncryptionAlgorithmIdentifier })
], KEKRecipientInfo.prototype, "keyEncryptionAlgorithm", void 0);
__decorate([
    AsnProp({ type: OctetString })
], KEKRecipientInfo.prototype, "encryptedKey", void 0);

class PasswordRecipientInfo {
    version = CMSVersion.v0;
    keyDerivationAlgorithm;
    keyEncryptionAlgorithm = new KeyEncryptionAlgorithmIdentifier();
    encryptedKey = new OctetString();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], PasswordRecipientInfo.prototype, "version", void 0);
__decorate([
    AsnProp({
        type: KeyDerivationAlgorithmIdentifier, context: 0, optional: true,
    })
], PasswordRecipientInfo.prototype, "keyDerivationAlgorithm", void 0);
__decorate([
    AsnProp({ type: KeyEncryptionAlgorithmIdentifier })
], PasswordRecipientInfo.prototype, "keyEncryptionAlgorithm", void 0);
__decorate([
    AsnProp({ type: OctetString })
], PasswordRecipientInfo.prototype, "encryptedKey", void 0);

class OtherRecipientInfo {
    oriType = "";
    oriValue = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], OtherRecipientInfo.prototype, "oriType", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Any })
], OtherRecipientInfo.prototype, "oriValue", void 0);
let RecipientInfo = class RecipientInfo {
    ktri;
    kari;
    kekri;
    pwri;
    ori;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: KeyTransRecipientInfo, optional: true,
    })
], RecipientInfo.prototype, "ktri", void 0);
__decorate([
    AsnProp({
        type: KeyAgreeRecipientInfo, context: 1, implicit: true, optional: true,
    })
], RecipientInfo.prototype, "kari", void 0);
__decorate([
    AsnProp({
        type: KEKRecipientInfo, context: 2, implicit: true, optional: true,
    })
], RecipientInfo.prototype, "kekri", void 0);
__decorate([
    AsnProp({
        type: PasswordRecipientInfo, context: 3, implicit: true, optional: true,
    })
], RecipientInfo.prototype, "pwri", void 0);
__decorate([
    AsnProp({
        type: OtherRecipientInfo, context: 4, implicit: true, optional: true,
    })
], RecipientInfo.prototype, "ori", void 0);
RecipientInfo = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], RecipientInfo);

var RecipientInfos_1;
let RecipientInfos = RecipientInfos_1 = class RecipientInfos extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, RecipientInfos_1.prototype);
    }
};
RecipientInfos = RecipientInfos_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Set, itemType: RecipientInfo,
    })
], RecipientInfos);

var RevocationInfoChoices_1;
class OtherRevocationInfoFormat {
    otherRevInfoFormat = "";
    otherRevInfo = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], OtherRevocationInfoFormat.prototype, "otherRevInfoFormat", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Any })
], OtherRevocationInfoFormat.prototype, "otherRevInfo", void 0);
let RevocationInfoChoice = class RevocationInfoChoice {
    other = new OtherRevocationInfoFormat();
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({
        type: OtherRevocationInfoFormat, context: 1, implicit: true,
    })
], RevocationInfoChoice.prototype, "other", void 0);
RevocationInfoChoice = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], RevocationInfoChoice);
let RevocationInfoChoices = RevocationInfoChoices_1 = class RevocationInfoChoices extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, RevocationInfoChoices_1.prototype);
    }
};
RevocationInfoChoices = RevocationInfoChoices_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Set, itemType: RevocationInfoChoice,
    })
], RevocationInfoChoices);

class OriginatorInfo {
    certs;
    crls;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: CertificateSet, context: 0, implicit: true, optional: true,
    })
], OriginatorInfo.prototype, "certs", void 0);
__decorate([
    AsnProp({
        type: RevocationInfoChoices, context: 1, implicit: true, optional: true,
    })
], OriginatorInfo.prototype, "crls", void 0);

var UnprotectedAttributes_1;
let UnprotectedAttributes = UnprotectedAttributes_1 = class UnprotectedAttributes extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, UnprotectedAttributes_1.prototype);
    }
};
UnprotectedAttributes = UnprotectedAttributes_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Set, itemType: Attribute$1,
    })
], UnprotectedAttributes);
class EnvelopedData {
    version = CMSVersion.v0;
    originatorInfo;
    recipientInfos = new RecipientInfos();
    encryptedContentInfo = new EncryptedContentInfo();
    unprotectedAttrs;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], EnvelopedData.prototype, "version", void 0);
__decorate([
    AsnProp({
        type: OriginatorInfo, context: 0, implicit: true, optional: true,
    })
], EnvelopedData.prototype, "originatorInfo", void 0);
__decorate([
    AsnProp({ type: RecipientInfos })
], EnvelopedData.prototype, "recipientInfos", void 0);
__decorate([
    AsnProp({ type: EncryptedContentInfo })
], EnvelopedData.prototype, "encryptedContentInfo", void 0);
__decorate([
    AsnProp({
        type: UnprotectedAttributes, context: 1, implicit: true, optional: true,
    })
], EnvelopedData.prototype, "unprotectedAttrs", void 0);

const id_data = "1.2.840.113549.1.7.1";
const id_signedData = "1.2.840.113549.1.7.2";

var DigestAlgorithmIdentifiers_1;
let DigestAlgorithmIdentifiers = DigestAlgorithmIdentifiers_1 = class DigestAlgorithmIdentifiers extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, DigestAlgorithmIdentifiers_1.prototype);
    }
};
DigestAlgorithmIdentifiers = DigestAlgorithmIdentifiers_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Set, itemType: DigestAlgorithmIdentifier,
    })
], DigestAlgorithmIdentifiers);
class SignedData {
    version = CMSVersion.v0;
    digestAlgorithms = new DigestAlgorithmIdentifiers();
    encapContentInfo = new EncapsulatedContentInfo();
    certificates;
    crls;
    signerInfos = new SignerInfos();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], SignedData.prototype, "version", void 0);
__decorate([
    AsnProp({ type: DigestAlgorithmIdentifiers })
], SignedData.prototype, "digestAlgorithms", void 0);
__decorate([
    AsnProp({ type: EncapsulatedContentInfo })
], SignedData.prototype, "encapContentInfo", void 0);
__decorate([
    AsnProp({
        type: CertificateSet, context: 0, implicit: true, optional: true,
    })
], SignedData.prototype, "certificates", void 0);
__decorate([
    AsnProp({
        type: RevocationInfoChoices, context: 1, implicit: true, optional: true,
    })
], SignedData.prototype, "crls", void 0);
__decorate([
    AsnProp({ type: SignerInfos })
], SignedData.prototype, "signerInfos", void 0);

const id_ecPublicKey = "1.2.840.10045.2.1";
const id_ecdsaWithSHA1 = "1.2.840.10045.4.1";
const id_ecdsaWithSHA224 = "1.2.840.10045.4.3.1";
const id_ecdsaWithSHA256 = "1.2.840.10045.4.3.2";
const id_ecdsaWithSHA384 = "1.2.840.10045.4.3.3";
const id_ecdsaWithSHA512 = "1.2.840.10045.4.3.4";
const id_secp256r1 = "1.2.840.10045.3.1.7";
const id_secp384r1 = "1.3.132.0.34";
const id_secp521r1 = "1.3.132.0.35";

function create$1(algorithm) {
    return new AlgorithmIdentifier({ algorithm });
}
const ecdsaWithSHA1 = create$1(id_ecdsaWithSHA1);
create$1(id_ecdsaWithSHA224);
const ecdsaWithSHA256 = create$1(id_ecdsaWithSHA256);
const ecdsaWithSHA384 = create$1(id_ecdsaWithSHA384);
const ecdsaWithSHA512 = create$1(id_ecdsaWithSHA512);

let FieldID = class FieldID {
    fieldType;
    parameters;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], FieldID.prototype, "fieldType", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Any })
], FieldID.prototype, "parameters", void 0);
FieldID = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], FieldID);
class ECPoint extends OctetString {
}
let Curve = class Curve {
    a;
    b;
    seed;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.OctetString })
], Curve.prototype, "a", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.OctetString })
], Curve.prototype, "b", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.BitString, optional: true,
    })
], Curve.prototype, "seed", void 0);
Curve = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], Curve);
var ECPVer;
(function (ECPVer) {
    ECPVer[ECPVer["ecpVer1"] = 1] = "ecpVer1";
})(ECPVer || (ECPVer = {}));
let SpecifiedECDomain = class SpecifiedECDomain {
    version = ECPVer.ecpVer1;
    fieldID;
    curve;
    base;
    order;
    cofactor;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], SpecifiedECDomain.prototype, "version", void 0);
__decorate([
    AsnProp({ type: FieldID })
], SpecifiedECDomain.prototype, "fieldID", void 0);
__decorate([
    AsnProp({ type: Curve })
], SpecifiedECDomain.prototype, "curve", void 0);
__decorate([
    AsnProp({ type: ECPoint })
], SpecifiedECDomain.prototype, "base", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], SpecifiedECDomain.prototype, "order", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, optional: true,
    })
], SpecifiedECDomain.prototype, "cofactor", void 0);
SpecifiedECDomain = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], SpecifiedECDomain);

let ECParameters = class ECParameters {
    namedCurve;
    implicitCurve;
    specifiedCurve;
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], ECParameters.prototype, "namedCurve", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.Null })
], ECParameters.prototype, "implicitCurve", void 0);
__decorate([
    AsnProp({ type: SpecifiedECDomain })
], ECParameters.prototype, "specifiedCurve", void 0);
ECParameters = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], ECParameters);

class ECPrivateKey {
    version = 1;
    privateKey = new OctetString();
    parameters;
    publicKey;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], ECPrivateKey.prototype, "version", void 0);
__decorate([
    AsnProp({ type: OctetString })
], ECPrivateKey.prototype, "privateKey", void 0);
__decorate([
    AsnProp({
        type: ECParameters, context: 0, optional: true,
    })
], ECPrivateKey.prototype, "parameters", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.BitString, context: 1, optional: true,
    })
], ECPrivateKey.prototype, "publicKey", void 0);

class ECDSASigValue {
    r = new ArrayBuffer(0);
    s = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], ECDSASigValue.prototype, "r", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], ECDSASigValue.prototype, "s", void 0);

const id_pkcs_1 = "1.2.840.113549.1.1";
const id_rsaEncryption = `${id_pkcs_1}.1`;
const id_RSAES_OAEP = `${id_pkcs_1}.7`;
const id_pSpecified = `${id_pkcs_1}.9`;
const id_RSASSA_PSS = `${id_pkcs_1}.10`;
const id_md2WithRSAEncryption = `${id_pkcs_1}.2`;
const id_md5WithRSAEncryption = `${id_pkcs_1}.4`;
const id_sha1WithRSAEncryption = `${id_pkcs_1}.5`;
const id_sha224WithRSAEncryption = `${id_pkcs_1}.14`;
const id_sha256WithRSAEncryption = `${id_pkcs_1}.11`;
const id_sha384WithRSAEncryption = `${id_pkcs_1}.12`;
const id_sha512WithRSAEncryption = `${id_pkcs_1}.13`;
const id_sha512_224WithRSAEncryption = `${id_pkcs_1}.15`;
const id_sha512_256WithRSAEncryption = `${id_pkcs_1}.16`;
const id_sha1 = "1.3.14.3.2.26";
const id_sha224 = "2.16.840.1.101.3.4.2.4";
const id_sha256 = "2.16.840.1.101.3.4.2.1";
const id_sha384 = "2.16.840.1.101.3.4.2.2";
const id_sha512 = "2.16.840.1.101.3.4.2.3";
const id_sha512_224 = "2.16.840.1.101.3.4.2.5";
const id_sha512_256 = "2.16.840.1.101.3.4.2.6";
const id_md2 = "1.2.840.113549.2.2";
const id_md5 = "1.2.840.113549.2.5";
const id_mgf1 = `${id_pkcs_1}.8`;

function create(algorithm) {
    return new AlgorithmIdentifier({
        algorithm, parameters: null,
    });
}
create(id_md2);
create(id_md5);
const sha1 = create(id_sha1);
create(id_sha224);
create(id_sha256);
create(id_sha384);
create(id_sha512);
create(id_sha512_224);
create(id_sha512_256);
const mgf1SHA1 = new AlgorithmIdentifier({
    algorithm: id_mgf1,
    parameters: AsnConvert.serialize(sha1),
});
const pSpecifiedEmpty = new AlgorithmIdentifier({
    algorithm: id_pSpecified,
    parameters: AsnConvert.serialize(AsnOctetStringConverter.toASN(new Uint8Array([
        0xda, 0x39, 0xa3, 0xee, 0x5e, 0x6b, 0x4b, 0x0d, 0x32, 0x55, 0xbf, 0xef, 0x95, 0x60, 0x18,
        0x90, 0xaf, 0xd8, 0x07, 0x09,
    ]).buffer)),
});
create(id_rsaEncryption);
create(id_md2WithRSAEncryption);
create(id_md5WithRSAEncryption);
create(id_sha1WithRSAEncryption);
create(id_sha512_224WithRSAEncryption);
create(id_sha512_256WithRSAEncryption);
create(id_sha384WithRSAEncryption);
create(id_sha512WithRSAEncryption);
create(id_sha512_224WithRSAEncryption);
create(id_sha512_256WithRSAEncryption);

class RsaEsOaepParams {
    hashAlgorithm = new AlgorithmIdentifier(sha1);
    maskGenAlgorithm = new AlgorithmIdentifier({
        algorithm: id_mgf1,
        parameters: AsnConvert.serialize(sha1),
    });
    pSourceAlgorithm = new AlgorithmIdentifier(pSpecifiedEmpty);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AlgorithmIdentifier, context: 0, defaultValue: sha1,
    })
], RsaEsOaepParams.prototype, "hashAlgorithm", void 0);
__decorate([
    AsnProp({
        type: AlgorithmIdentifier, context: 1, defaultValue: mgf1SHA1,
    })
], RsaEsOaepParams.prototype, "maskGenAlgorithm", void 0);
__decorate([
    AsnProp({
        type: AlgorithmIdentifier, context: 2, defaultValue: pSpecifiedEmpty,
    })
], RsaEsOaepParams.prototype, "pSourceAlgorithm", void 0);
new AlgorithmIdentifier({
    algorithm: id_RSAES_OAEP,
    parameters: AsnConvert.serialize(new RsaEsOaepParams()),
});

class RsaSaPssParams {
    hashAlgorithm = new AlgorithmIdentifier(sha1);
    maskGenAlgorithm = new AlgorithmIdentifier({
        algorithm: id_mgf1,
        parameters: AsnConvert.serialize(sha1),
    });
    saltLength = 20;
    trailerField = 1;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AlgorithmIdentifier, context: 0, defaultValue: sha1,
    })
], RsaSaPssParams.prototype, "hashAlgorithm", void 0);
__decorate([
    AsnProp({
        type: AlgorithmIdentifier, context: 1, defaultValue: mgf1SHA1,
    })
], RsaSaPssParams.prototype, "maskGenAlgorithm", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, context: 2, defaultValue: 20,
    })
], RsaSaPssParams.prototype, "saltLength", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, context: 3, defaultValue: 1,
    })
], RsaSaPssParams.prototype, "trailerField", void 0);
new AlgorithmIdentifier({
    algorithm: id_RSASSA_PSS,
    parameters: AsnConvert.serialize(new RsaSaPssParams()),
});

class DigestInfo {
    digestAlgorithm = new AlgorithmIdentifier();
    digest = new OctetString();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], DigestInfo.prototype, "digestAlgorithm", void 0);
__decorate([
    AsnProp({ type: OctetString })
], DigestInfo.prototype, "digest", void 0);

var OtherPrimeInfos_1;
class OtherPrimeInfo {
    prime = new ArrayBuffer(0);
    exponent = new ArrayBuffer(0);
    coefficient = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], OtherPrimeInfo.prototype, "prime", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], OtherPrimeInfo.prototype, "exponent", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], OtherPrimeInfo.prototype, "coefficient", void 0);
let OtherPrimeInfos = OtherPrimeInfos_1 = class OtherPrimeInfos extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, OtherPrimeInfos_1.prototype);
    }
};
OtherPrimeInfos = OtherPrimeInfos_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: OtherPrimeInfo,
    })
], OtherPrimeInfos);

class RSAPrivateKey {
    version = 0;
    modulus = new ArrayBuffer(0);
    publicExponent = new ArrayBuffer(0);
    privateExponent = new ArrayBuffer(0);
    prime1 = new ArrayBuffer(0);
    prime2 = new ArrayBuffer(0);
    exponent1 = new ArrayBuffer(0);
    exponent2 = new ArrayBuffer(0);
    coefficient = new ArrayBuffer(0);
    otherPrimeInfos;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], RSAPrivateKey.prototype, "version", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPrivateKey.prototype, "modulus", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPrivateKey.prototype, "publicExponent", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPrivateKey.prototype, "privateExponent", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPrivateKey.prototype, "prime1", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPrivateKey.prototype, "prime2", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPrivateKey.prototype, "exponent1", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPrivateKey.prototype, "exponent2", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPrivateKey.prototype, "coefficient", void 0);
__decorate([
    AsnProp({
        type: OtherPrimeInfos, optional: true,
    })
], RSAPrivateKey.prototype, "otherPrimeInfos", void 0);

class RSAPublicKey {
    modulus = new ArrayBuffer(0);
    publicExponent = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPublicKey.prototype, "modulus", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter,
    })
], RSAPublicKey.prototype, "publicExponent", void 0);

var Lifecycle;
(function (Lifecycle) {
    Lifecycle[Lifecycle["Transient"] = 0] = "Transient";
    Lifecycle[Lifecycle["Singleton"] = 1] = "Singleton";
    Lifecycle[Lifecycle["ResolutionScoped"] = 2] = "ResolutionScoped";
    Lifecycle[Lifecycle["ContainerScoped"] = 3] = "ContainerScoped";
})(Lifecycle || (Lifecycle = {}));
var Lifecycle$1 = Lifecycle;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

var INJECTION_TOKEN_METADATA_KEY = "injectionTokens";
function getParamInfo(target) {
    var params = Reflect.getMetadata("design:paramtypes", target) || [];
    var injectionTokens = Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    Object.keys(injectionTokens).forEach(function (key) {
        params[+key] = injectionTokens[key];
    });
    return params;
}

function isClassProvider(provider) {
    return !!provider.useClass;
}

function isFactoryProvider(provider) {
    return !!provider.useFactory;
}

var DelayedConstructor = (function () {
    function DelayedConstructor(wrap) {
        this.wrap = wrap;
        this.reflectMethods = [
            "get",
            "getPrototypeOf",
            "setPrototypeOf",
            "getOwnPropertyDescriptor",
            "defineProperty",
            "has",
            "set",
            "deleteProperty",
            "apply",
            "construct",
            "ownKeys"
        ];
    }
    DelayedConstructor.prototype.createProxy = function (createObject) {
        var _this = this;
        var target = {};
        var init = false;
        var value;
        var delayedObject = function () {
            if (!init) {
                value = createObject(_this.wrap());
                init = true;
            }
            return value;
        };
        return new Proxy(target, this.createHandler(delayedObject));
    };
    DelayedConstructor.prototype.createHandler = function (delayedObject) {
        var handler = {};
        var install = function (name) {
            handler[name] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                args[0] = delayedObject();
                var method = Reflect[name];
                return method.apply(void 0, __spread(args));
            };
        };
        this.reflectMethods.forEach(install);
        return handler;
    };
    return DelayedConstructor;
}());

function isNormalToken(token) {
    return typeof token === "string" || typeof token === "symbol";
}
function isTokenDescriptor(descriptor) {
    return (typeof descriptor === "object" &&
        "token" in descriptor &&
        "multiple" in descriptor);
}
function isTransformDescriptor(descriptor) {
    return (typeof descriptor === "object" &&
        "token" in descriptor &&
        "transform" in descriptor);
}
function isConstructorToken(token) {
    return typeof token === "function" || token instanceof DelayedConstructor;
}

function isTokenProvider(provider) {
    return !!provider.useToken;
}

function isValueProvider(provider) {
    return provider.useValue != undefined;
}

function isProvider(provider) {
    return (isClassProvider(provider) ||
        isValueProvider(provider) ||
        isTokenProvider(provider) ||
        isFactoryProvider(provider));
}

var RegistryBase = (function () {
    function RegistryBase() {
        this._registryMap = new Map();
    }
    RegistryBase.prototype.entries = function () {
        return this._registryMap.entries();
    };
    RegistryBase.prototype.getAll = function (key) {
        this.ensure(key);
        return this._registryMap.get(key);
    };
    RegistryBase.prototype.get = function (key) {
        this.ensure(key);
        var value = this._registryMap.get(key);
        return value[value.length - 1] || null;
    };
    RegistryBase.prototype.set = function (key, value) {
        this.ensure(key);
        this._registryMap.get(key).push(value);
    };
    RegistryBase.prototype.setAll = function (key, value) {
        this._registryMap.set(key, value);
    };
    RegistryBase.prototype.has = function (key) {
        this.ensure(key);
        return this._registryMap.get(key).length > 0;
    };
    RegistryBase.prototype.clear = function () {
        this._registryMap.clear();
    };
    RegistryBase.prototype.ensure = function (key) {
        if (!this._registryMap.has(key)) {
            this._registryMap.set(key, []);
        }
    };
    return RegistryBase;
}());

var Registry = (function (_super) {
    __extends(Registry, _super);
    function Registry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Registry;
}(RegistryBase));

var ResolutionContext = (function () {
    function ResolutionContext() {
        this.scopedResolutions = new Map();
    }
    return ResolutionContext;
}());

function formatDependency(params, idx) {
    if (params === null) {
        return "at position #" + idx;
    }
    var argName = params.split(",")[idx].trim();
    return "\"" + argName + "\" at position #" + idx;
}
function composeErrorMessage(msg, e, indent) {
    if (indent === void 0) { indent = "    "; }
    return __spread([msg], e.message.split("\n").map(function (l) { return indent + l; })).join("\n");
}
function formatErrorCtor(ctor, paramIdx, error) {
    var _a = __read(ctor.toString().match(/constructor\(([\w, ]+)\)/) || [], 2), _b = _a[1], params = _b === void 0 ? null : _b;
    var dep = formatDependency(params, paramIdx);
    return composeErrorMessage("Cannot inject the dependency " + dep + " of \"" + ctor.name + "\" constructor. Reason:", error);
}

function isDisposable(value) {
    if (typeof value.dispose !== "function")
        return false;
    var disposeFun = value.dispose;
    if (disposeFun.length > 0) {
        return false;
    }
    return true;
}

var PreResolutionInterceptors = (function (_super) {
    __extends(PreResolutionInterceptors, _super);
    function PreResolutionInterceptors() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PreResolutionInterceptors;
}(RegistryBase));
var PostResolutionInterceptors = (function (_super) {
    __extends(PostResolutionInterceptors, _super);
    function PostResolutionInterceptors() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PostResolutionInterceptors;
}(RegistryBase));
var Interceptors = (function () {
    function Interceptors() {
        this.preResolution = new PreResolutionInterceptors();
        this.postResolution = new PostResolutionInterceptors();
    }
    return Interceptors;
}());

var typeInfo = new Map();
var InternalDependencyContainer = (function () {
    function InternalDependencyContainer(parent) {
        this.parent = parent;
        this._registry = new Registry();
        this.interceptors = new Interceptors();
        this.disposed = false;
        this.disposables = new Set();
    }
    InternalDependencyContainer.prototype.register = function (token, providerOrConstructor, options) {
        if (options === void 0) { options = { lifecycle: Lifecycle$1.Transient }; }
        this.ensureNotDisposed();
        var provider;
        if (!isProvider(providerOrConstructor)) {
            provider = { useClass: providerOrConstructor };
        }
        else {
            provider = providerOrConstructor;
        }
        if (isTokenProvider(provider)) {
            var path = [token];
            var tokenProvider = provider;
            while (tokenProvider != null) {
                var currentToken = tokenProvider.useToken;
                if (path.includes(currentToken)) {
                    throw new Error("Token registration cycle detected! " + __spread(path, [currentToken]).join(" -> "));
                }
                path.push(currentToken);
                var registration = this._registry.get(currentToken);
                if (registration && isTokenProvider(registration.provider)) {
                    tokenProvider = registration.provider;
                }
                else {
                    tokenProvider = null;
                }
            }
        }
        if (options.lifecycle === Lifecycle$1.Singleton ||
            options.lifecycle == Lifecycle$1.ContainerScoped ||
            options.lifecycle == Lifecycle$1.ResolutionScoped) {
            if (isValueProvider(provider) || isFactoryProvider(provider)) {
                throw new Error("Cannot use lifecycle \"" + Lifecycle$1[options.lifecycle] + "\" with ValueProviders or FactoryProviders");
            }
        }
        this._registry.set(token, { provider: provider, options: options });
        return this;
    };
    InternalDependencyContainer.prototype.registerType = function (from, to) {
        this.ensureNotDisposed();
        if (isNormalToken(to)) {
            return this.register(from, {
                useToken: to
            });
        }
        return this.register(from, {
            useClass: to
        });
    };
    InternalDependencyContainer.prototype.registerInstance = function (token, instance) {
        this.ensureNotDisposed();
        return this.register(token, {
            useValue: instance
        });
    };
    InternalDependencyContainer.prototype.registerSingleton = function (from, to) {
        this.ensureNotDisposed();
        if (isNormalToken(from)) {
            if (isNormalToken(to)) {
                return this.register(from, {
                    useToken: to
                }, { lifecycle: Lifecycle$1.Singleton });
            }
            else if (to) {
                return this.register(from, {
                    useClass: to
                }, { lifecycle: Lifecycle$1.Singleton });
            }
            throw new Error('Cannot register a type name as a singleton without a "to" token');
        }
        var useClass = from;
        if (to && !isNormalToken(to)) {
            useClass = to;
        }
        return this.register(from, {
            useClass: useClass
        }, { lifecycle: Lifecycle$1.Singleton });
    };
    InternalDependencyContainer.prototype.resolve = function (token, context, isOptional) {
        if (context === void 0) { context = new ResolutionContext(); }
        if (isOptional === void 0) { isOptional = false; }
        this.ensureNotDisposed();
        var registration = this.getRegistration(token);
        if (!registration && isNormalToken(token)) {
            if (isOptional) {
                return undefined;
            }
            throw new Error("Attempted to resolve unregistered dependency token: \"" + token.toString() + "\"");
        }
        this.executePreResolutionInterceptor(token, "Single");
        if (registration) {
            var result = this.resolveRegistration(registration, context);
            this.executePostResolutionInterceptor(token, result, "Single");
            return result;
        }
        if (isConstructorToken(token)) {
            var result = this.construct(token, context);
            this.executePostResolutionInterceptor(token, result, "Single");
            return result;
        }
        throw new Error("Attempted to construct an undefined constructor. Could mean a circular dependency problem. Try using `delay` function.");
    };
    InternalDependencyContainer.prototype.executePreResolutionInterceptor = function (token, resolutionType) {
        var e_1, _a;
        if (this.interceptors.preResolution.has(token)) {
            var remainingInterceptors = [];
            try {
                for (var _b = __values(this.interceptors.preResolution.getAll(token)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var interceptor = _c.value;
                    if (interceptor.options.frequency != "Once") {
                        remainingInterceptors.push(interceptor);
                    }
                    interceptor.callback(token, resolutionType);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.interceptors.preResolution.setAll(token, remainingInterceptors);
        }
    };
    InternalDependencyContainer.prototype.executePostResolutionInterceptor = function (token, result, resolutionType) {
        var e_2, _a;
        if (this.interceptors.postResolution.has(token)) {
            var remainingInterceptors = [];
            try {
                for (var _b = __values(this.interceptors.postResolution.getAll(token)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var interceptor = _c.value;
                    if (interceptor.options.frequency != "Once") {
                        remainingInterceptors.push(interceptor);
                    }
                    interceptor.callback(token, result, resolutionType);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.interceptors.postResolution.setAll(token, remainingInterceptors);
        }
    };
    InternalDependencyContainer.prototype.resolveRegistration = function (registration, context) {
        this.ensureNotDisposed();
        if (registration.options.lifecycle === Lifecycle$1.ResolutionScoped &&
            context.scopedResolutions.has(registration)) {
            return context.scopedResolutions.get(registration);
        }
        var isSingleton = registration.options.lifecycle === Lifecycle$1.Singleton;
        var isContainerScoped = registration.options.lifecycle === Lifecycle$1.ContainerScoped;
        var returnInstance = isSingleton || isContainerScoped;
        var resolved;
        if (isValueProvider(registration.provider)) {
            resolved = registration.provider.useValue;
        }
        else if (isTokenProvider(registration.provider)) {
            resolved = returnInstance
                ? registration.instance ||
                    (registration.instance = this.resolve(registration.provider.useToken, context))
                : this.resolve(registration.provider.useToken, context);
        }
        else if (isClassProvider(registration.provider)) {
            resolved = returnInstance
                ? registration.instance ||
                    (registration.instance = this.construct(registration.provider.useClass, context))
                : this.construct(registration.provider.useClass, context);
        }
        else if (isFactoryProvider(registration.provider)) {
            resolved = registration.provider.useFactory(this);
        }
        else {
            resolved = this.construct(registration.provider, context);
        }
        if (registration.options.lifecycle === Lifecycle$1.ResolutionScoped) {
            context.scopedResolutions.set(registration, resolved);
        }
        return resolved;
    };
    InternalDependencyContainer.prototype.resolveAll = function (token, context, isOptional) {
        var _this = this;
        if (context === void 0) { context = new ResolutionContext(); }
        if (isOptional === void 0) { isOptional = false; }
        this.ensureNotDisposed();
        var registrations = this.getAllRegistrations(token);
        if (!registrations && isNormalToken(token)) {
            if (isOptional) {
                return [];
            }
            throw new Error("Attempted to resolve unregistered dependency token: \"" + token.toString() + "\"");
        }
        this.executePreResolutionInterceptor(token, "All");
        if (registrations) {
            var result_1 = registrations.map(function (item) {
                return _this.resolveRegistration(item, context);
            });
            this.executePostResolutionInterceptor(token, result_1, "All");
            return result_1;
        }
        var result = [this.construct(token, context)];
        this.executePostResolutionInterceptor(token, result, "All");
        return result;
    };
    InternalDependencyContainer.prototype.isRegistered = function (token, recursive) {
        if (recursive === void 0) { recursive = false; }
        this.ensureNotDisposed();
        return (this._registry.has(token) ||
            (recursive &&
                (this.parent || false) &&
                this.parent.isRegistered(token, true)));
    };
    InternalDependencyContainer.prototype.reset = function () {
        this.ensureNotDisposed();
        this._registry.clear();
        this.interceptors.preResolution.clear();
        this.interceptors.postResolution.clear();
    };
    InternalDependencyContainer.prototype.clearInstances = function () {
        var e_3, _a;
        this.ensureNotDisposed();
        try {
            for (var _b = __values(this._registry.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), token = _d[0], registrations = _d[1];
                this._registry.setAll(token, registrations
                    .filter(function (registration) { return !isValueProvider(registration.provider); })
                    .map(function (registration) {
                    registration.instance = undefined;
                    return registration;
                }));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    InternalDependencyContainer.prototype.createChildContainer = function () {
        var e_4, _a;
        this.ensureNotDisposed();
        var childContainer = new InternalDependencyContainer(this);
        try {
            for (var _b = __values(this._registry.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), token = _d[0], registrations = _d[1];
                if (registrations.some(function (_a) {
                    var options = _a.options;
                    return options.lifecycle === Lifecycle$1.ContainerScoped;
                })) {
                    childContainer._registry.setAll(token, registrations.map(function (registration) {
                        if (registration.options.lifecycle === Lifecycle$1.ContainerScoped) {
                            return {
                                provider: registration.provider,
                                options: registration.options
                            };
                        }
                        return registration;
                    }));
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return childContainer;
    };
    InternalDependencyContainer.prototype.beforeResolution = function (token, callback, options) {
        if (options === void 0) { options = { frequency: "Always" }; }
        this.interceptors.preResolution.set(token, {
            callback: callback,
            options: options
        });
    };
    InternalDependencyContainer.prototype.afterResolution = function (token, callback, options) {
        if (options === void 0) { options = { frequency: "Always" }; }
        this.interceptors.postResolution.set(token, {
            callback: callback,
            options: options
        });
    };
    InternalDependencyContainer.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.disposed = true;
                        promises = [];
                        this.disposables.forEach(function (disposable) {
                            var maybePromise = disposable.dispose();
                            if (maybePromise) {
                                promises.push(maybePromise);
                            }
                        });
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    InternalDependencyContainer.prototype.getRegistration = function (token) {
        if (this.isRegistered(token)) {
            return this._registry.get(token);
        }
        if (this.parent) {
            return this.parent.getRegistration(token);
        }
        return null;
    };
    InternalDependencyContainer.prototype.getAllRegistrations = function (token) {
        if (this.isRegistered(token)) {
            return this._registry.getAll(token);
        }
        if (this.parent) {
            return this.parent.getAllRegistrations(token);
        }
        return null;
    };
    InternalDependencyContainer.prototype.construct = function (ctor, context) {
        var _this = this;
        if (ctor instanceof DelayedConstructor) {
            return ctor.createProxy(function (target) {
                return _this.resolve(target, context);
            });
        }
        var instance = (function () {
            var paramInfo = typeInfo.get(ctor);
            if (!paramInfo || paramInfo.length === 0) {
                if (ctor.length === 0) {
                    return new ctor();
                }
                else {
                    throw new Error("TypeInfo not known for \"" + ctor.name + "\"");
                }
            }
            var params = paramInfo.map(_this.resolveParams(context, ctor));
            return new (ctor.bind.apply(ctor, __spread([void 0], params)))();
        })();
        if (isDisposable(instance)) {
            this.disposables.add(instance);
        }
        return instance;
    };
    InternalDependencyContainer.prototype.resolveParams = function (context, ctor) {
        var _this = this;
        return function (param, idx) {
            var _a, _b, _c;
            try {
                if (isTokenDescriptor(param)) {
                    if (isTransformDescriptor(param)) {
                        return param.multiple
                            ? (_a = _this.resolve(param.transform)).transform.apply(_a, __spread([_this.resolveAll(param.token, new ResolutionContext(), param.isOptional)], param.transformArgs)) : (_b = _this.resolve(param.transform)).transform.apply(_b, __spread([_this.resolve(param.token, context, param.isOptional)], param.transformArgs));
                    }
                    else {
                        return param.multiple
                            ? _this.resolveAll(param.token, new ResolutionContext(), param.isOptional)
                            : _this.resolve(param.token, context, param.isOptional);
                    }
                }
                else if (isTransformDescriptor(param)) {
                    return (_c = _this.resolve(param.transform, context)).transform.apply(_c, __spread([_this.resolve(param.token, context)], param.transformArgs));
                }
                return _this.resolve(param, context);
            }
            catch (e) {
                throw new Error(formatErrorCtor(ctor, idx, e));
            }
        };
    };
    InternalDependencyContainer.prototype.ensureNotDisposed = function () {
        if (this.disposed) {
            throw new Error("This container has been disposed, you cannot interact with a disposed container");
        }
    };
    return InternalDependencyContainer;
}());
var instance = new InternalDependencyContainer();

function injectable(options) {
    return function (target) {
        typeInfo.set(target, getParamInfo(target));
        if (options && options.token) {
            if (!Array.isArray(options.token)) {
                instance.register(options.token, target);
            }
            else {
                options.token.forEach(function (token) {
                    instance.register(token, target);
                });
            }
        }
    };
}

if (typeof Reflect === "undefined" || !Reflect.getMetadata) {
    throw new Error("tsyringe requires a reflect polyfill. Please add 'import \"reflect-metadata\"' to the top of your entry point.");
}

var PKCS12AttrSet_1;
class PKCS12Attribute {
    attrId = "";
    attrValues = [];
    constructor(params = {}) {
        Object.assign(params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], PKCS12Attribute.prototype, "attrId", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, repeated: "set",
    })
], PKCS12Attribute.prototype, "attrValues", void 0);
let PKCS12AttrSet = PKCS12AttrSet_1 = class PKCS12AttrSet extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, PKCS12AttrSet_1.prototype);
    }
};
PKCS12AttrSet = PKCS12AttrSet_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: PKCS12Attribute,
    })
], PKCS12AttrSet);

var AuthenticatedSafe_1;
let AuthenticatedSafe = AuthenticatedSafe_1 = class AuthenticatedSafe extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, AuthenticatedSafe_1.prototype);
    }
};
AuthenticatedSafe = AuthenticatedSafe_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: ContentInfo,
    })
], AuthenticatedSafe);

class CertBag {
    certId = "";
    certValue = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], CertBag.prototype, "certId", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, context: 0,
    })
], CertBag.prototype, "certValue", void 0);

class CRLBag {
    crlId = "";
    crltValue = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], CRLBag.prototype, "crlId", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, context: 0,
    })
], CRLBag.prototype, "crltValue", void 0);

class EncryptedData extends OctetString {
}
class EncryptedPrivateKeyInfo$1 {
    encryptionAlgorithm = new AlgorithmIdentifier();
    encryptedData = new EncryptedData();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], EncryptedPrivateKeyInfo$1.prototype, "encryptionAlgorithm", void 0);
__decorate([
    AsnProp({ type: EncryptedData })
], EncryptedPrivateKeyInfo$1.prototype, "encryptedData", void 0);

var Attributes_1$1;
var Version;
(function (Version) {
    Version[Version["v1"] = 0] = "v1";
})(Version || (Version = {}));
class PrivateKey extends OctetString {
}
let Attributes$1 = Attributes_1$1 = class Attributes extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, Attributes_1$1.prototype);
    }
};
Attributes$1 = Attributes_1$1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: Attribute$2,
    })
], Attributes$1);
class PrivateKeyInfo {
    version = Version.v1;
    privateKeyAlgorithm = new AlgorithmIdentifier();
    privateKey = new PrivateKey();
    attributes;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], PrivateKeyInfo.prototype, "version", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], PrivateKeyInfo.prototype, "privateKeyAlgorithm", void 0);
__decorate([
    AsnProp({ type: PrivateKey })
], PrivateKeyInfo.prototype, "privateKey", void 0);
__decorate([
    AsnProp({
        type: Attributes$1, implicit: true, context: 0, optional: true,
    })
], PrivateKeyInfo.prototype, "attributes", void 0);

let KeyBag = class KeyBag extends PrivateKeyInfo {
};
KeyBag = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], KeyBag);

let PKCS8ShroudedKeyBag = class PKCS8ShroudedKeyBag extends EncryptedPrivateKeyInfo$1 {
};
PKCS8ShroudedKeyBag = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], PKCS8ShroudedKeyBag);

class SecretBag {
    secretTypeId = "";
    secretValue = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], SecretBag.prototype, "secretTypeId", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, context: 0,
    })
], SecretBag.prototype, "secretValue", void 0);

class MacData {
    mac = new DigestInfo();
    macSalt = new OctetString();
    iterations = 1;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: DigestInfo })
], MacData.prototype, "mac", void 0);
__decorate([
    AsnProp({ type: OctetString })
], MacData.prototype, "macSalt", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Integer, defaultValue: 1,
    })
], MacData.prototype, "iterations", void 0);

class PFX {
    version = 3;
    authSafe = new ContentInfo();
    macData = new MacData();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], PFX.prototype, "version", void 0);
__decorate([
    AsnProp({ type: ContentInfo })
], PFX.prototype, "authSafe", void 0);
__decorate([
    AsnProp({
        type: MacData, optional: true,
    })
], PFX.prototype, "macData", void 0);

var SafeContents_1;
class SafeBag {
    bagId = "";
    bagValue = new ArrayBuffer(0);
    bagAttributes;
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], SafeBag.prototype, "bagId", void 0);
__decorate([
    AsnProp({
        type: AsnPropTypes.Any, context: 0,
    })
], SafeBag.prototype, "bagValue", void 0);
__decorate([
    AsnProp({
        type: PKCS12Attribute, repeated: "set", optional: true,
    })
], SafeBag.prototype, "bagAttributes", void 0);
let SafeContents = SafeContents_1 = class SafeContents extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, SafeContents_1.prototype);
    }
};
SafeContents = SafeContents_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: SafeBag,
    })
], SafeContents);

var ExtensionRequest_1, ExtendedCertificateAttributes_1, SMIMECapabilities_1;
const id_pkcs9 = "1.2.840.113549.1.9";
const id_pkcs9_at_challengePassword = `${id_pkcs9}.7`;
const id_pkcs9_at_extensionRequest = `${id_pkcs9}.14`;
let PKCS9String = class PKCS9String extends DirectoryString {
    ia5String;
    constructor(params = {}) {
        super(params);
    }
    toString() {
        return this.ia5String || super.toString();
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.IA5String })
], PKCS9String.prototype, "ia5String", void 0);
PKCS9String = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], PKCS9String);
let Pkcs7PDU = class Pkcs7PDU extends ContentInfo {
};
Pkcs7PDU = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], Pkcs7PDU);
let UserPKCS12 = class UserPKCS12 extends PFX {
};
UserPKCS12 = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], UserPKCS12);
let EncryptedPrivateKeyInfo = class EncryptedPrivateKeyInfo extends EncryptedPrivateKeyInfo$1 {
};
EncryptedPrivateKeyInfo = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], EncryptedPrivateKeyInfo);
let EmailAddress = class EmailAddress {
    value;
    constructor(value = "") {
        this.value = value;
    }
    toString() {
        return this.value;
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.IA5String })
], EmailAddress.prototype, "value", void 0);
EmailAddress = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], EmailAddress);
let UnstructuredName = class UnstructuredName extends PKCS9String {
};
UnstructuredName = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], UnstructuredName);
let UnstructuredAddress = class UnstructuredAddress extends DirectoryString {
};
UnstructuredAddress = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], UnstructuredAddress);
let DateOfBirth = class DateOfBirth {
    value;
    constructor(value = new Date()) {
        this.value = value;
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.GeneralizedTime })
], DateOfBirth.prototype, "value", void 0);
DateOfBirth = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], DateOfBirth);
let PlaceOfBirth = class PlaceOfBirth extends DirectoryString {
};
PlaceOfBirth = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], PlaceOfBirth);
let Gender = class Gender {
    value;
    constructor(value = "M") {
        this.value = value;
    }
    toString() {
        return this.value;
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.PrintableString })
], Gender.prototype, "value", void 0);
Gender = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], Gender);
let CountryOfCitizenship = class CountryOfCitizenship {
    value;
    constructor(value = "") {
        this.value = value;
    }
    toString() {
        return this.value;
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.PrintableString })
], CountryOfCitizenship.prototype, "value", void 0);
CountryOfCitizenship = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], CountryOfCitizenship);
let CountryOfResidence = class CountryOfResidence extends CountryOfCitizenship {
};
CountryOfResidence = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], CountryOfResidence);
let Pseudonym = class Pseudonym extends DirectoryString {
};
Pseudonym = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], Pseudonym);
let ContentType = class ContentType {
    value;
    constructor(value = "") {
        this.value = value;
    }
    toString() {
        return this.value;
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.ObjectIdentifier })
], ContentType.prototype, "value", void 0);
ContentType = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], ContentType);
let SigningTime = class SigningTime extends Time {
};
SigningTime = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], SigningTime);
let SequenceNumber = class SequenceNumber {
    value;
    constructor(value = 0) {
        this.value = value;
    }
    toString() {
        return this.value.toString();
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], SequenceNumber.prototype, "value", void 0);
SequenceNumber = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], SequenceNumber);
let CounterSignature = class CounterSignature extends SignerInfo {
};
CounterSignature = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], CounterSignature);
let ChallengePassword = class ChallengePassword extends DirectoryString {
};
ChallengePassword = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], ChallengePassword);
let ExtensionRequest = ExtensionRequest_1 = class ExtensionRequest extends Extensions {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, ExtensionRequest_1.prototype);
    }
};
ExtensionRequest = ExtensionRequest_1 = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], ExtensionRequest);
let ExtendedCertificateAttributes = ExtendedCertificateAttributes_1 = class ExtendedCertificateAttributes extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, ExtendedCertificateAttributes_1.prototype);
    }
};
ExtendedCertificateAttributes = ExtendedCertificateAttributes_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Set, itemType: Attribute$1,
    })
], ExtendedCertificateAttributes);
let FriendlyName = class FriendlyName {
    value;
    constructor(value = "") {
        this.value = value;
    }
    toString() {
        return this.value;
    }
};
__decorate([
    AsnProp({ type: AsnPropTypes.BmpString })
], FriendlyName.prototype, "value", void 0);
FriendlyName = __decorate([
    AsnType({ type: AsnTypeTypes.Choice })
], FriendlyName);
let SMIMECapability = class SMIMECapability extends AlgorithmIdentifier {
};
SMIMECapability = __decorate([
    AsnType({ type: AsnTypeTypes.Sequence })
], SMIMECapability);
let SMIMECapabilities = SMIMECapabilities_1 = class SMIMECapabilities extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, SMIMECapabilities_1.prototype);
    }
};
SMIMECapabilities = SMIMECapabilities_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: SMIMECapability,
    })
], SMIMECapabilities);

var Attributes_1;
let Attributes = Attributes_1 = class Attributes extends AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, Attributes_1.prototype);
    }
};
Attributes = Attributes_1 = __decorate([
    AsnType({
        type: AsnTypeTypes.Sequence, itemType: Attribute$2,
    })
], Attributes);

class CertificationRequestInfo {
    version = 0;
    subject = new Name$1();
    subjectPKInfo = new SubjectPublicKeyInfo();
    attributes = new Attributes();
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({ type: AsnPropTypes.Integer })
], CertificationRequestInfo.prototype, "version", void 0);
__decorate([
    AsnProp({ type: Name$1 })
], CertificationRequestInfo.prototype, "subject", void 0);
__decorate([
    AsnProp({ type: SubjectPublicKeyInfo })
], CertificationRequestInfo.prototype, "subjectPKInfo", void 0);
__decorate([
    AsnProp({
        type: Attributes, implicit: true, context: 0, optional: true,
    })
], CertificationRequestInfo.prototype, "attributes", void 0);

class CertificationRequest {
    certificationRequestInfo = new CertificationRequestInfo();
    certificationRequestInfoRaw;
    signatureAlgorithm = new AlgorithmIdentifier();
    signature = new ArrayBuffer(0);
    constructor(params = {}) {
        Object.assign(this, params);
    }
}
__decorate([
    AsnProp({
        type: CertificationRequestInfo, raw: true,
    })
], CertificationRequest.prototype, "certificationRequestInfo", void 0);
__decorate([
    AsnProp({ type: AlgorithmIdentifier })
], CertificationRequest.prototype, "signatureAlgorithm", void 0);
__decorate([
    AsnProp({ type: AsnPropTypes.BitString })
], CertificationRequest.prototype, "signature", void 0);

/*!
 * MIT License
 * 
 * Copyright (c) Peculiar Ventures. All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

const diAlgorithm = "crypto.algorithm";
class AlgorithmProvider {
    getAlgorithms() {
        return instance.resolveAll(diAlgorithm);
    }
    toAsnAlgorithm(alg) {
        ({ ...alg });
        for (const algorithm of this.getAlgorithms()) {
            const res = algorithm.toAsnAlgorithm(alg);
            if (res) {
                return res;
            }
        }
        if (/^[0-9.]+$/.test(alg.name)) {
            const res = new AlgorithmIdentifier({ algorithm: alg.name });
            if ("parameters" in alg) {
                const unknown = alg;
                res.parameters = unknown.parameters;
            }
            return res;
        }
        throw new Error("Cannot convert WebCrypto algorithm to ASN.1 algorithm");
    }
    toWebAlgorithm(alg) {
        for (const algorithm of this.getAlgorithms()) {
            const res = algorithm.toWebAlgorithm(alg);
            if (res) {
                return res;
            }
        }
        const unknown = {
            name: alg.algorithm,
            parameters: alg.parameters,
        };
        return unknown;
    }
}
const diAlgorithmProvider = "crypto.algorithmProvider";
instance.registerSingleton(diAlgorithmProvider, AlgorithmProvider);

var EcAlgorithm_1;
const idVersionOne = "1.3.36.3.3.2.8.1.1";
const idBrainpoolP160r1 = `${idVersionOne}.1`;
const idBrainpoolP160t1 = `${idVersionOne}.2`;
const idBrainpoolP192r1 = `${idVersionOne}.3`;
const idBrainpoolP192t1 = `${idVersionOne}.4`;
const idBrainpoolP224r1 = `${idVersionOne}.5`;
const idBrainpoolP224t1 = `${idVersionOne}.6`;
const idBrainpoolP256r1 = `${idVersionOne}.7`;
const idBrainpoolP256t1 = `${idVersionOne}.8`;
const idBrainpoolP320r1 = `${idVersionOne}.9`;
const idBrainpoolP320t1 = `${idVersionOne}.10`;
const idBrainpoolP384r1 = `${idVersionOne}.11`;
const idBrainpoolP384t1 = `${idVersionOne}.12`;
const idBrainpoolP512r1 = `${idVersionOne}.13`;
const idBrainpoolP512t1 = `${idVersionOne}.14`;
const brainpoolP160r1 = "brainpoolP160r1";
const brainpoolP160t1 = "brainpoolP160t1";
const brainpoolP192r1 = "brainpoolP192r1";
const brainpoolP192t1 = "brainpoolP192t1";
const brainpoolP224r1 = "brainpoolP224r1";
const brainpoolP224t1 = "brainpoolP224t1";
const brainpoolP256r1 = "brainpoolP256r1";
const brainpoolP256t1 = "brainpoolP256t1";
const brainpoolP320r1 = "brainpoolP320r1";
const brainpoolP320t1 = "brainpoolP320t1";
const brainpoolP384r1 = "brainpoolP384r1";
const brainpoolP384t1 = "brainpoolP384t1";
const brainpoolP512r1 = "brainpoolP512r1";
const brainpoolP512t1 = "brainpoolP512t1";
const ECDSA = "ECDSA";
let EcAlgorithm = EcAlgorithm_1 = class EcAlgorithm {
    toAsnAlgorithm(alg) {
        switch (alg.name.toLowerCase()) {
            case ECDSA.toLowerCase():
                if ("hash" in alg) {
                    const hash = typeof alg.hash === "string" ? alg.hash : alg.hash.name;
                    switch (hash.toLowerCase()) {
                        case "sha-1":
                            return ecdsaWithSHA1;
                        case "sha-256":
                            return ecdsaWithSHA256;
                        case "sha-384":
                            return ecdsaWithSHA384;
                        case "sha-512":
                            return ecdsaWithSHA512;
                    }
                }
                else if ("namedCurve" in alg) {
                    let parameters = "";
                    switch (alg.namedCurve) {
                        case "P-256":
                            parameters = id_secp256r1;
                            break;
                        case "K-256":
                            parameters = EcAlgorithm_1.SECP256K1;
                            break;
                        case "P-384":
                            parameters = id_secp384r1;
                            break;
                        case "P-521":
                            parameters = id_secp521r1;
                            break;
                        case brainpoolP160r1:
                            parameters = idBrainpoolP160r1;
                            break;
                        case brainpoolP160t1:
                            parameters = idBrainpoolP160t1;
                            break;
                        case brainpoolP192r1:
                            parameters = idBrainpoolP192r1;
                            break;
                        case brainpoolP192t1:
                            parameters = idBrainpoolP192t1;
                            break;
                        case brainpoolP224r1:
                            parameters = idBrainpoolP224r1;
                            break;
                        case brainpoolP224t1:
                            parameters = idBrainpoolP224t1;
                            break;
                        case brainpoolP256r1:
                            parameters = idBrainpoolP256r1;
                            break;
                        case brainpoolP256t1:
                            parameters = idBrainpoolP256t1;
                            break;
                        case brainpoolP320r1:
                            parameters = idBrainpoolP320r1;
                            break;
                        case brainpoolP320t1:
                            parameters = idBrainpoolP320t1;
                            break;
                        case brainpoolP384r1:
                            parameters = idBrainpoolP384r1;
                            break;
                        case brainpoolP384t1:
                            parameters = idBrainpoolP384t1;
                            break;
                        case brainpoolP512r1:
                            parameters = idBrainpoolP512r1;
                            break;
                        case brainpoolP512t1:
                            parameters = idBrainpoolP512t1;
                            break;
                    }
                    if (parameters) {
                        return new AlgorithmIdentifier({
                            algorithm: id_ecPublicKey,
                            parameters: AsnConvert.serialize(new ECParameters({ namedCurve: parameters })),
                        });
                    }
                }
        }
        return null;
    }
    toWebAlgorithm(alg) {
        switch (alg.algorithm) {
            case id_ecdsaWithSHA1:
                return {
                    name: ECDSA, hash: { name: "SHA-1" },
                };
            case id_ecdsaWithSHA256:
                return {
                    name: ECDSA, hash: { name: "SHA-256" },
                };
            case id_ecdsaWithSHA384:
                return {
                    name: ECDSA, hash: { name: "SHA-384" },
                };
            case id_ecdsaWithSHA512:
                return {
                    name: ECDSA, hash: { name: "SHA-512" },
                };
            case id_ecPublicKey: {
                if (!alg.parameters) {
                    throw new TypeError("Cannot get required parameters from EC algorithm");
                }
                const parameters = AsnConvert.parse(alg.parameters, ECParameters);
                switch (parameters.namedCurve) {
                    case id_secp256r1:
                        return {
                            name: ECDSA, namedCurve: "P-256",
                        };
                    case EcAlgorithm_1.SECP256K1:
                        return {
                            name: ECDSA, namedCurve: "K-256",
                        };
                    case id_secp384r1:
                        return {
                            name: ECDSA, namedCurve: "P-384",
                        };
                    case id_secp521r1:
                        return {
                            name: ECDSA, namedCurve: "P-521",
                        };
                    case idBrainpoolP160r1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP160r1,
                        };
                    case idBrainpoolP160t1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP160t1,
                        };
                    case idBrainpoolP192r1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP192r1,
                        };
                    case idBrainpoolP192t1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP192t1,
                        };
                    case idBrainpoolP224r1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP224r1,
                        };
                    case idBrainpoolP224t1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP224t1,
                        };
                    case idBrainpoolP256r1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP256r1,
                        };
                    case idBrainpoolP256t1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP256t1,
                        };
                    case idBrainpoolP320r1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP320r1,
                        };
                    case idBrainpoolP320t1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP320t1,
                        };
                    case idBrainpoolP384r1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP384r1,
                        };
                    case idBrainpoolP384t1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP384t1,
                        };
                    case idBrainpoolP512r1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP512r1,
                        };
                    case idBrainpoolP512t1:
                        return {
                            name: ECDSA, namedCurve: brainpoolP512t1,
                        };
                }
            }
        }
        return null;
    }
};
EcAlgorithm.SECP256K1 = "1.3.132.0.10";
EcAlgorithm = EcAlgorithm_1 = __decorate([
    injectable()
], EcAlgorithm);
instance.registerSingleton(diAlgorithm, EcAlgorithm);

const NAME = Symbol("name");
const VALUE = Symbol("value");
class TextObject {
    constructor(name, items = {}, value = "") {
        this[NAME] = name;
        this[VALUE] = value;
        for (const key in items) {
            this[key] = items[key];
        }
    }
}
TextObject.NAME = NAME;
TextObject.VALUE = VALUE;
class DefaultAlgorithmSerializer {
    static toTextObject(alg) {
        const obj = new TextObject("Algorithm Identifier", {}, OidSerializer.toString(alg.algorithm));
        if (alg.parameters) {
            switch (alg.algorithm) {
                case id_ecPublicKey: {
                    const ecAlg = new EcAlgorithm().toWebAlgorithm(alg);
                    if (ecAlg && "namedCurve" in ecAlg) {
                        obj["Named Curve"] = ecAlg.namedCurve;
                    }
                    else {
                        obj["Parameters"] = alg.parameters;
                    }
                    break;
                }
                default:
                    obj["Parameters"] = alg.parameters;
            }
        }
        return obj;
    }
}
class OidSerializer {
    static toString(oid) {
        const name = this.items[oid];
        if (name) {
            return name;
        }
        return oid;
    }
}
OidSerializer.items = {
    [id_sha1]: "sha1",
    [id_sha224]: "sha224",
    [id_sha256]: "sha256",
    [id_sha384]: "sha384",
    [id_sha512]: "sha512",
    [id_rsaEncryption]: "rsaEncryption",
    [id_sha1WithRSAEncryption]: "sha1WithRSAEncryption",
    [id_sha224WithRSAEncryption]: "sha224WithRSAEncryption",
    [id_sha256WithRSAEncryption]: "sha256WithRSAEncryption",
    [id_sha384WithRSAEncryption]: "sha384WithRSAEncryption",
    [id_sha512WithRSAEncryption]: "sha512WithRSAEncryption",
    [id_ecPublicKey]: "ecPublicKey",
    [id_ecdsaWithSHA1]: "ecdsaWithSHA1",
    [id_ecdsaWithSHA224]: "ecdsaWithSHA224",
    [id_ecdsaWithSHA256]: "ecdsaWithSHA256",
    [id_ecdsaWithSHA384]: "ecdsaWithSHA384",
    [id_ecdsaWithSHA512]: "ecdsaWithSHA512",
    [id_kp_serverAuth]: "TLS WWW server authentication",
    [id_kp_clientAuth]: "TLS WWW client authentication",
    [id_kp_codeSigning]: "Code Signing",
    [id_kp_emailProtection]: "E-mail Protection",
    [id_kp_timeStamping]: "Time Stamping",
    [id_kp_OCSPSigning]: "OCSP Signing",
    [id_signedData]: "Signed Data",
};
class TextConverter {
    static serialize(obj) {
        return this.serializeObj(obj).join("\n");
    }
    static pad(deep = 0) {
        return "".padStart(2 * deep, " ");
    }
    static serializeObj(obj, deep = 0) {
        const res = [];
        let pad = this.pad(deep++);
        let value = "";
        const objValue = obj[TextObject.VALUE];
        if (objValue) {
            value = ` ${objValue}`;
        }
        res.push(`${pad}${obj[TextObject.NAME]}:${value}`);
        pad = this.pad(deep);
        for (const key in obj) {
            if (typeof key === "symbol") {
                continue;
            }
            const value = obj[key];
            const keyValue = key ? `${key}: ` : "";
            if (typeof value === "string"
                || typeof value === "number"
                || typeof value === "boolean") {
                res.push(`${pad}${keyValue}${value}`);
            }
            else if (value instanceof Date) {
                res.push(`${pad}${keyValue}${value.toUTCString()}`);
            }
            else if (Array.isArray(value)) {
                for (const obj of value) {
                    obj[TextObject.NAME] = key;
                    res.push(...this.serializeObj(obj, deep));
                }
            }
            else if (value instanceof TextObject) {
                value[TextObject.NAME] = key;
                res.push(...this.serializeObj(value, deep));
            }
            else if (buildExports.BufferSourceConverter.isBufferSource(value)) {
                if (key) {
                    res.push(`${pad}${keyValue}`);
                    res.push(...this.serializeBufferSource(value, deep + 1));
                }
                else {
                    res.push(...this.serializeBufferSource(value, deep));
                }
            }
            else if ("toTextObject" in value) {
                const obj = value.toTextObject();
                obj[TextObject.NAME] = key;
                res.push(...this.serializeObj(obj, deep));
            }
            else {
                throw new TypeError("Cannot serialize data in text format. Unsupported type.");
            }
        }
        return res;
    }
    static serializeBufferSource(buffer, deep = 0) {
        const pad = this.pad(deep);
        const view = buildExports.BufferSourceConverter.toUint8Array(buffer);
        const res = [];
        for (let i = 0; i < view.length;) {
            const row = [];
            for (let j = 0; j < 16 && i < view.length; j++) {
                if (j === 8) {
                    row.push("");
                }
                const hex = view[i++].toString(16).padStart(2, "0");
                row.push(hex);
            }
            res.push(`${pad}${row.join(" ")}`);
        }
        return res;
    }
    static serializeAlgorithm(alg) {
        return this.algorithmSerializer.toTextObject(alg);
    }
}
TextConverter.oidSerializer = OidSerializer;
TextConverter.algorithmSerializer = DefaultAlgorithmSerializer;

var _AsnData_rawData;
class AsnData {
    get rawData() {
        if (!__classPrivateFieldGet(this, _AsnData_rawData, "f")) {
            __classPrivateFieldSet(this, _AsnData_rawData, AsnConvert.serialize(this.asn), "f");
        }
        return __classPrivateFieldGet(this, _AsnData_rawData, "f");
    }
    constructor(...args) {
        _AsnData_rawData.set(this, void 0);
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            this.asn = AsnConvert.parse(args[0], args[1]);
            __classPrivateFieldSet(this, _AsnData_rawData, buildExports.BufferSourceConverter.toArrayBuffer(args[0]), "f");
            this.onInit(this.asn);
        }
        else {
            this.asn = args[0];
            this.onInit(this.asn);
        }
    }
    equal(data) {
        if (data instanceof AsnData) {
            return buildExports.isEqual(data.rawData, this.rawData);
        }
        return false;
    }
    toString(format = "text") {
        switch (format) {
            case "asn":
                return AsnConvert.toString(this.rawData);
            case "text":
                return TextConverter.serialize(this.toTextObject());
            case "hex":
                return buildExports.Convert.ToHex(this.rawData);
            case "base64":
                return buildExports.Convert.ToBase64(this.rawData);
            case "base64url":
                return buildExports.Convert.ToBase64Url(this.rawData);
            default:
                throw TypeError("Argument 'format' is unsupported value");
        }
    }
    getTextName() {
        const constructor = this.constructor;
        return constructor.NAME;
    }
    toTextObject() {
        const obj = this.toTextObjectEmpty();
        obj[""] = this.rawData;
        return obj;
    }
    toTextObjectEmpty(value) {
        return new TextObject(this.getTextName(), {}, value);
    }
}
_AsnData_rawData = new WeakMap();
AsnData.NAME = "ASN";

class Extension extends AsnData {
    constructor(...args) {
        let raw;
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            raw = buildExports.BufferSourceConverter.toArrayBuffer(args[0]);
        }
        else {
            raw = AsnConvert.serialize(new Extension$1({
                extnID: args[0],
                critical: args[1],
                extnValue: new OctetString(buildExports.BufferSourceConverter.toArrayBuffer(args[2])),
            }));
        }
        super(raw, Extension$1);
    }
    onInit(asn) {
        this.type = asn.extnID;
        this.critical = asn.critical;
        this.value = asn.extnValue.buffer;
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        obj[""] = this.value;
        return obj;
    }
    toTextObjectWithoutValue() {
        const obj = this.toTextObjectEmpty(this.critical ? "critical" : undefined);
        if (obj[TextObject.NAME] === Extension.NAME) {
            obj[TextObject.NAME] = OidSerializer.toString(this.type);
        }
        return obj;
    }
}

var _a;
class CryptoProvider {
    static isCryptoKeyPair(data) {
        return data && data.privateKey && data.publicKey;
    }
    static isCryptoKey(data) {
        return data && data.usages && data.type && data.algorithm && data.extractable !== undefined;
    }
    constructor() {
        this.items = new Map();
        this[_a] = "CryptoProvider";
        if (typeof self !== "undefined" && typeof crypto !== "undefined") {
            this.set(CryptoProvider.DEFAULT, crypto);
        }
        else if (typeof global !== "undefined" && global.crypto && global.crypto.subtle) {
            this.set(CryptoProvider.DEFAULT, global.crypto);
        }
    }
    clear() {
        this.items.clear();
    }
    delete(key) {
        return this.items.delete(key);
    }
    forEach(callbackfn, thisArg) {
        return this.items.forEach(callbackfn, thisArg);
    }
    has(key) {
        return this.items.has(key);
    }
    get size() {
        return this.items.size;
    }
    entries() {
        return this.items.entries();
    }
    keys() {
        return this.items.keys();
    }
    values() {
        return this.items.values();
    }
    [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }
    get(key = CryptoProvider.DEFAULT) {
        const crypto = this.items.get(key.toLowerCase());
        if (!crypto) {
            throw new Error(`Cannot get Crypto by name '${key}'`);
        }
        return crypto;
    }
    set(key, value) {
        if (typeof key === "string") {
            if (!value) {
                throw new TypeError("Argument 'value' is required");
            }
            this.items.set(key.toLowerCase(), value);
        }
        else {
            this.items.set(CryptoProvider.DEFAULT, key);
        }
        return this;
    }
}
_a = Symbol.toStringTag;
CryptoProvider.DEFAULT = "default";
const cryptoProvider = new CryptoProvider();

const OID_REGEX = /^[0-2](?:\.[1-9][0-9]*)+$/;
function isOID(id) {
    return new RegExp(OID_REGEX).test(id);
}
class NameIdentifier {
    constructor(names = {}) {
        this.items = {};
        for (const id in names) {
            this.register(id, names[id]);
        }
    }
    get(idOrName) {
        return this.items[idOrName] || null;
    }
    findId(idOrName) {
        if (!isOID(idOrName)) {
            return this.get(idOrName);
        }
        return idOrName;
    }
    register(id, name) {
        this.items[id] = name;
        this.items[name] = id;
    }
}
const names = new NameIdentifier();
names.register("CN", "2.5.4.3");
names.register("L", "2.5.4.7");
names.register("ST", "2.5.4.8");
names.register("O", "2.5.4.10");
names.register("OU", "2.5.4.11");
names.register("C", "2.5.4.6");
names.register("DC", "0.9.2342.19200300.100.1.25");
names.register("E", "1.2.840.113549.1.9.1");
names.register("G", "2.5.4.42");
names.register("I", "2.5.4.43");
names.register("SN", "2.5.4.4");
names.register("T", "2.5.4.12");
function replaceUnknownCharacter(text, char) {
    return `\\${buildExports.Convert.ToHex(buildExports.Convert.FromUtf8String(char)).toUpperCase()}`;
}
function escape$1(data) {
    return data
        .replace(/([,+"\\<>;])/g, "\\$1")
        .replace(/^([ #])/, "\\$1")
        .replace(/([ ]$)/, "\\$1")
        .replace(/([\r\n\t])/, replaceUnknownCharacter);
}
class Name {
    static isASCII(text) {
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code > 0xFF) {
                return false;
            }
        }
        return true;
    }
    static isPrintableString(text) {
        return /^[A-Za-z0-9 '()+,-./:=?]*$/g.test(text);
    }
    constructor(data, extraNames = {}) {
        this.extraNames = new NameIdentifier();
        this.asn = new Name$1();
        for (const key in extraNames) {
            if (Object.prototype.hasOwnProperty.call(extraNames, key)) {
                const value = extraNames[key];
                this.extraNames.register(key, value);
            }
        }
        if (typeof data === "string") {
            this.asn = this.fromString(data);
        }
        else if (data instanceof Name$1) {
            this.asn = data;
        }
        else if (buildExports.BufferSourceConverter.isBufferSource(data)) {
            this.asn = AsnConvert.parse(data, Name$1);
        }
        else {
            this.asn = this.fromJSON(data);
        }
    }
    getField(idOrName) {
        const id = this.extraNames.findId(idOrName) || names.findId(idOrName);
        const res = [];
        for (const name of this.asn) {
            for (const rdn of name) {
                if (rdn.type === id) {
                    res.push(rdn.value.toString());
                }
            }
        }
        return res;
    }
    getName(idOrName) {
        return this.extraNames.get(idOrName) || names.get(idOrName);
    }
    toString() {
        return this.asn.map((rdn) => rdn.map((o) => {
            const type = this.getName(o.type) || o.type;
            const value = o.value.anyValue
                ? `#${buildExports.Convert.ToHex(o.value.anyValue)}`
                : escape$1(o.value.toString());
            return `${type}=${value}`;
        })
            .join("+"))
            .join(", ");
    }
    toJSON() {
        var _a;
        const json = [];
        for (const rdn of this.asn) {
            const jsonItem = {};
            for (const attr of rdn) {
                const type = this.getName(attr.type) || attr.type;
                (_a = jsonItem[type]) !== null && _a !== void 0 ? _a : (jsonItem[type] = []);
                jsonItem[type].push(attr.value.anyValue ? `#${buildExports.Convert.ToHex(attr.value.anyValue)}` : attr.value.toString());
            }
            json.push(jsonItem);
        }
        return json;
    }
    fromString(data) {
        const asn = new Name$1();
        const regex = /(\d\.[\d.]*\d|[A-Za-z]+)=((?:"")|(?:".*?[^\\]")|(?:[^,+"\\](?=[,+]|$))|(?:[^,+].*?(?:[^\\][,+]))|(?:))([,+])?/g;
        let matches = null;
        let level = ",";
        while (matches = regex.exec(`${data},`)) {
            let [, type, value] = matches;
            const lastChar = value[value.length - 1];
            if (lastChar === "," || lastChar === "+") {
                value = value.slice(0, value.length - 1);
                matches[3] = lastChar;
            }
            const next = matches[3];
            type = this.getTypeOid(type);
            const attr = this.createAttribute(type, value);
            if (level === "+") {
                asn[asn.length - 1].push(attr);
            }
            else {
                asn.push(new RelativeDistinguishedName([attr]));
            }
            level = next;
        }
        return asn;
    }
    fromJSON(data) {
        const asn = new Name$1();
        for (const item of data) {
            const asnRdn = new RelativeDistinguishedName();
            for (const type in item) {
                const typeId = this.getTypeOid(type);
                const values = item[type];
                for (const value of values) {
                    const asnAttr = this.createAttribute(typeId, value);
                    asnRdn.push(asnAttr);
                }
            }
            asn.push(asnRdn);
        }
        return asn;
    }
    getTypeOid(type) {
        if (!/[\d.]+/.test(type)) {
            type = this.getName(type) || "";
        }
        if (!type) {
            throw new Error(`Cannot get OID for name type '${type}'`);
        }
        return type;
    }
    createAttribute(type, value) {
        const attr = new AttributeTypeAndValue({ type });
        if (typeof value === "object") {
            for (const key in value) {
                switch (key) {
                    case "ia5String":
                        attr.value.ia5String = value[key];
                        break;
                    case "utf8String":
                        attr.value.utf8String = value[key];
                        break;
                    case "universalString":
                        attr.value.universalString = value[key];
                        break;
                    case "bmpString":
                        attr.value.bmpString = value[key];
                        break;
                    case "printableString":
                        attr.value.printableString = value[key];
                        break;
                }
            }
        }
        else if (value[0] === "#") {
            attr.value.anyValue = buildExports.Convert.FromHex(value.slice(1));
        }
        else {
            const processedValue = this.processStringValue(value);
            if (type === this.getName("E") || type === this.getName("DC")) {
                attr.value.ia5String = processedValue;
            }
            else {
                if (Name.isPrintableString(processedValue)) {
                    attr.value.printableString = processedValue;
                }
                else {
                    attr.value.utf8String = processedValue;
                }
            }
        }
        return attr;
    }
    processStringValue(value) {
        const quotedMatches = /"(.*?[^\\])?"/.exec(value);
        if (quotedMatches) {
            value = quotedMatches[1];
        }
        return value
            .replace(/\\0a/ig, "\n")
            .replace(/\\0d/ig, "\r")
            .replace(/\\0g/ig, "\t")
            .replace(/\\(.)/g, "$1");
    }
    toArrayBuffer() {
        return AsnConvert.serialize(this.asn);
    }
    async getThumbprint(...args) {
        var _a;
        let crypto;
        let algorithm = "SHA-1";
        if (args.length >= 1 && !((_a = args[0]) === null || _a === void 0 ? void 0 : _a.subtle)) {
            algorithm = args[0] || algorithm;
            crypto = args[1] || cryptoProvider.get();
        }
        else {
            crypto = args[0] || cryptoProvider.get();
        }
        return await crypto.subtle.digest(algorithm, this.toArrayBuffer());
    }
}

const ERR_GN_CONSTRUCTOR = "Cannot initialize GeneralName from ASN.1 data.";
const ERR_GN_STRING_FORMAT = `${ERR_GN_CONSTRUCTOR} Unsupported string format in use.`;
const ERR_GUID = `${ERR_GN_CONSTRUCTOR} Value doesn't match to GUID regular expression.`;
const GUID_REGEX = /^([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})$/i;
const id_GUID = "1.3.6.1.4.1.311.25.1";
const id_UPN = "1.3.6.1.4.1.311.20.2.3";
const DNS = "dns";
const DN = "dn";
const EMAIL = "email";
const IP = "ip";
const URL = "url";
const GUID = "guid";
const UPN = "upn";
const REGISTERED_ID = "id";
class GeneralName extends AsnData {
    constructor(...args) {
        let name;
        if (args.length === 2) {
            switch (args[0]) {
                case DN: {
                    const derName = new Name(args[1]).toArrayBuffer();
                    const asnName = AsnConvert.parse(derName, Name$1);
                    name = new GeneralName$1({ directoryName: asnName });
                    break;
                }
                case DNS:
                    name = new GeneralName$1({ dNSName: args[1] });
                    break;
                case EMAIL:
                    name = new GeneralName$1({ rfc822Name: args[1] });
                    break;
                case GUID: {
                    const matches = new RegExp(GUID_REGEX, "i").exec(args[1]);
                    if (!matches) {
                        throw new Error("Cannot parse GUID value. Value doesn't match to regular expression");
                    }
                    const hex = matches
                        .slice(1)
                        .map((o, i) => {
                        if (i < 3) {
                            return buildExports.Convert.ToHex(new Uint8Array(buildExports.Convert.FromHex(o)).reverse());
                        }
                        return o;
                    })
                        .join("");
                    name = new GeneralName$1({
                        otherName: new OtherName({
                            typeId: id_GUID,
                            value: AsnConvert.serialize(new OctetString(buildExports.Convert.FromHex(hex))),
                        }),
                    });
                    break;
                }
                case IP:
                    name = new GeneralName$1({ iPAddress: args[1] });
                    break;
                case REGISTERED_ID:
                    name = new GeneralName$1({ registeredID: args[1] });
                    break;
                case UPN: {
                    name = new GeneralName$1({
                        otherName: new OtherName({
                            typeId: id_UPN,
                            value: AsnConvert.serialize(AsnUtf8StringConverter.toASN(args[1])),
                        }),
                    });
                    break;
                }
                case URL:
                    name = new GeneralName$1({ uniformResourceIdentifier: args[1] });
                    break;
                default:
                    throw new Error("Cannot create GeneralName. Unsupported type of the name");
            }
        }
        else if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            name = AsnConvert.parse(args[0], GeneralName$1);
        }
        else {
            name = args[0];
        }
        super(name);
    }
    onInit(asn) {
        if (asn.dNSName != undefined) {
            this.type = DNS;
            this.value = asn.dNSName;
        }
        else if (asn.rfc822Name != undefined) {
            this.type = EMAIL;
            this.value = asn.rfc822Name;
        }
        else if (asn.iPAddress != undefined) {
            this.type = IP;
            this.value = asn.iPAddress;
        }
        else if (asn.uniformResourceIdentifier != undefined) {
            this.type = URL;
            this.value = asn.uniformResourceIdentifier;
        }
        else if (asn.registeredID != undefined) {
            this.type = REGISTERED_ID;
            this.value = asn.registeredID;
        }
        else if (asn.directoryName != undefined) {
            this.type = DN;
            this.value = new Name(asn.directoryName).toString();
        }
        else if (asn.otherName != undefined) {
            if (asn.otherName.typeId === id_GUID) {
                this.type = GUID;
                const guid = AsnConvert.parse(asn.otherName.value, OctetString);
                const matches = new RegExp(GUID_REGEX, "i").exec(buildExports.Convert.ToHex(guid));
                if (!matches) {
                    throw new Error(ERR_GUID);
                }
                this.value = matches
                    .slice(1)
                    .map((o, i) => {
                    if (i < 3) {
                        return buildExports.Convert.ToHex(new Uint8Array(buildExports.Convert.FromHex(o)).reverse());
                    }
                    return o;
                })
                    .join("-");
            }
            else if (asn.otherName.typeId === id_UPN) {
                this.type = UPN;
                this.value = AsnConvert.parse(asn.otherName.value, DirectoryString).toString();
            }
            else {
                throw new Error(ERR_GN_STRING_FORMAT);
            }
        }
        else {
            throw new Error(ERR_GN_STRING_FORMAT);
        }
    }
    toJSON() {
        return {
            type: this.type,
            value: this.value,
        };
    }
    toTextObject() {
        let type;
        switch (this.type) {
            case DN:
            case DNS:
            case GUID:
            case IP:
            case REGISTERED_ID:
            case UPN:
            case URL:
                type = this.type.toUpperCase();
                break;
            case EMAIL:
                type = "Email";
                break;
            default:
                throw new Error("Unsupported GeneralName type");
        }
        let value = this.value;
        if (this.type === REGISTERED_ID) {
            value = OidSerializer.toString(value);
        }
        return new TextObject(type, undefined, value);
    }
}
class GeneralNames extends AsnData {
    constructor(params) {
        let names;
        if (params instanceof GeneralNames$1) {
            names = params;
        }
        else if (Array.isArray(params)) {
            const items = [];
            for (const name of params) {
                if (name instanceof GeneralName$1) {
                    items.push(name);
                }
                else {
                    const asnName = AsnConvert.parse(new GeneralName(name.type, name.value).rawData, GeneralName$1);
                    items.push(asnName);
                }
            }
            names = new GeneralNames$1(items);
        }
        else if (buildExports.BufferSourceConverter.isBufferSource(params)) {
            names = AsnConvert.parse(params, GeneralNames$1);
        }
        else {
            throw new Error("Cannot initialize GeneralNames. Incorrect incoming arguments");
        }
        super(names);
    }
    onInit(asn) {
        const items = [];
        for (const asnName of asn) {
            let name = null;
            try {
                name = new GeneralName(asnName);
            }
            catch {
                continue;
            }
            items.push(name);
        }
        this.items = items;
    }
    toJSON() {
        return this.items.map((o) => o.toJSON());
    }
    toTextObject() {
        const res = super.toTextObjectEmpty();
        for (const name of this.items) {
            const nameObj = name.toTextObject();
            let field = res[nameObj[TextObject.NAME]];
            if (!Array.isArray(field)) {
                field = [];
                res[nameObj[TextObject.NAME]] = field;
            }
            field.push(nameObj);
        }
        return res;
    }
}
GeneralNames.NAME = "GeneralNames";

const rPaddingTag = "-{5}";
const rEolChars = "\\n";
const rNameTag = `[^${rEolChars}]+`;
const rBeginTag = `${rPaddingTag}BEGIN (${rNameTag}(?=${rPaddingTag}))${rPaddingTag}`;
const rEndTag = `${rPaddingTag}END \\1${rPaddingTag}`;
const rEolGroup = "\\n";
const rHeaderKey = `[^:${rEolChars}]+`;
const rHeaderValue = `(?:[^${rEolChars}]+${rEolGroup}(?: +[^${rEolChars}]+${rEolGroup})*)`;
const rBase64Chars = "[a-zA-Z0-9=+/]+";
const rBase64 = `(?:${rBase64Chars}${rEolGroup})+`;
const rPem = `${rBeginTag}${rEolGroup}(?:((?:${rHeaderKey}: ${rHeaderValue})+))?${rEolGroup}?(${rBase64})${rEndTag}`;
class PemConverter {
    static isPem(data) {
        return typeof data === "string"
            && new RegExp(rPem, "g").test(data.replace(/\r/g, ""));
    }
    static decodeWithHeaders(pem) {
        pem = pem.replace(/\r/g, "");
        const pattern = new RegExp(rPem, "g");
        const res = [];
        let matches = null;
        while (matches = pattern.exec(pem)) {
            const base64 = matches[3]
                .replace(new RegExp(`[${rEolChars}]+`, "g"), "");
            const pemStruct = {
                type: matches[1],
                headers: [],
                rawData: buildExports.Convert.FromBase64(base64),
            };
            const headersString = matches[2];
            if (headersString) {
                const headers = headersString.split(new RegExp(rEolGroup, "g"));
                let lastHeader = null;
                for (const header of headers) {
                    const [key, value] = header.split(/:(.*)/);
                    if (value === undefined) {
                        if (!lastHeader) {
                            throw new Error("Cannot parse PEM string. Incorrect header value");
                        }
                        lastHeader.value += key.trim();
                    }
                    else {
                        if (lastHeader) {
                            pemStruct.headers.push(lastHeader);
                        }
                        lastHeader = {
                            key, value: value.trim(),
                        };
                    }
                }
                if (lastHeader) {
                    pemStruct.headers.push(lastHeader);
                }
            }
            res.push(pemStruct);
        }
        return res;
    }
    static decode(pem) {
        const blocks = this.decodeWithHeaders(pem);
        return blocks.map((o) => o.rawData);
    }
    static decodeFirst(pem) {
        const items = this.decode(pem);
        if (!items.length) {
            throw new RangeError("PEM string doesn't contain any objects");
        }
        return items[0];
    }
    static encode(rawData, tag) {
        if (Array.isArray(rawData)) {
            const raws = new Array();
            if (tag) {
                rawData.forEach((element) => {
                    if (!buildExports.BufferSourceConverter.isBufferSource(element)) {
                        throw new TypeError("Cannot encode array of BufferSource in PEM format. Not all items of the array are BufferSource");
                    }
                    raws.push(this.encodeStruct({
                        type: tag,
                        rawData: buildExports.BufferSourceConverter.toArrayBuffer(element),
                    }));
                });
            }
            else {
                rawData.forEach((element) => {
                    if (!("type" in element)) {
                        throw new TypeError("Cannot encode array of PemStruct in PEM format. Not all items of the array are PemStrut");
                    }
                    raws.push(this.encodeStruct(element));
                });
            }
            return raws.join("\n");
        }
        else {
            if (!tag) {
                throw new Error("Required argument 'tag' is missed");
            }
            return this.encodeStruct({
                type: tag,
                rawData: buildExports.BufferSourceConverter.toArrayBuffer(rawData),
            });
        }
    }
    static encodeStruct(pem) {
        var _a;
        const upperCaseType = pem.type.toLocaleUpperCase();
        const res = [];
        res.push(`-----BEGIN ${upperCaseType}-----`);
        if ((_a = pem.headers) === null || _a === void 0 ? void 0 : _a.length) {
            for (const header of pem.headers) {
                res.push(`${header.key}: ${header.value}`);
            }
            res.push("");
        }
        const base64 = buildExports.Convert.ToBase64(pem.rawData);
        let sliced;
        let offset = 0;
        const rows = Array();
        while (offset < base64.length) {
            if (base64.length - offset < 64) {
                sliced = base64.substring(offset);
            }
            else {
                sliced = base64.substring(offset, offset + 64);
                offset += 64;
            }
            if (sliced.length !== 0) {
                rows.push(sliced);
                if (sliced.length < 64) {
                    break;
                }
            }
            else {
                break;
            }
        }
        res.push(...rows);
        res.push(`-----END ${upperCaseType}-----`);
        return res.join("\n");
    }
}
PemConverter.CertificateTag = "CERTIFICATE";
PemConverter.CrlTag = "CRL";
PemConverter.CertificateRequestTag = "CERTIFICATE REQUEST";
PemConverter.PublicKeyTag = "PUBLIC KEY";
PemConverter.PrivateKeyTag = "PRIVATE KEY";

class PemData extends AsnData {
    static isAsnEncoded(data) {
        return buildExports.BufferSourceConverter.isBufferSource(data) || typeof data === "string";
    }
    static toArrayBuffer(raw) {
        if (typeof raw === "string") {
            if (PemConverter.isPem(raw)) {
                return PemConverter.decode(raw)[0];
            }
            else if (buildExports.Convert.isHex(raw)) {
                return buildExports.Convert.FromHex(raw);
            }
            else if (buildExports.Convert.isBase64(raw)) {
                return buildExports.Convert.FromBase64(raw);
            }
            else if (buildExports.Convert.isBase64Url(raw)) {
                return buildExports.Convert.FromBase64Url(raw);
            }
            else {
                throw new TypeError("Unsupported format of 'raw' argument. Must be one of DER, PEM, HEX, Base64, or Base4Url");
            }
        }
        else {
            const buffer = buildExports.BufferSourceConverter.toUint8Array(raw);
            if (buffer.length > 0 && buffer[0] === 0x30) {
                return buildExports.BufferSourceConverter.toArrayBuffer(raw);
            }
            const stringRaw = buildExports.Convert.ToBinary(raw);
            if (PemConverter.isPem(stringRaw)) {
                return PemConverter.decode(stringRaw)[0];
            }
            else if (buildExports.Convert.isHex(stringRaw)) {
                return buildExports.Convert.FromHex(stringRaw);
            }
            else if (buildExports.Convert.isBase64(stringRaw)) {
                return buildExports.Convert.FromBase64(stringRaw);
            }
            else if (buildExports.Convert.isBase64Url(stringRaw)) {
                return buildExports.Convert.FromBase64Url(stringRaw);
            }
            throw new TypeError("Unsupported format of 'raw' argument. Must be one of DER, PEM, HEX, Base64, or Base4Url");
        }
    }
    constructor(...args) {
        if (PemData.isAsnEncoded(args[0])) {
            super(PemData.toArrayBuffer(args[0]), args[1]);
        }
        else {
            super(args[0]);
        }
    }
    toString(format = "pem") {
        switch (format) {
            case "pem":
                return PemConverter.encode(this.rawData, this.tag);
            default:
                return super.toString(format);
        }
    }
}

class PublicKey extends PemData {
    static async create(data, crypto = cryptoProvider.get()) {
        if (data instanceof PublicKey) {
            return data;
        }
        else if (CryptoProvider.isCryptoKey(data)) {
            if (data.type !== "public") {
                throw new TypeError("Public key is required");
            }
            const spki = await crypto.subtle.exportKey("spki", data);
            return new PublicKey(spki);
        }
        else if (data.publicKey) {
            return data.publicKey;
        }
        else if (buildExports.BufferSourceConverter.isBufferSource(data)) {
            return new PublicKey(data);
        }
        else {
            throw new TypeError("Unsupported PublicKeyType");
        }
    }
    constructor(param) {
        if (PemData.isAsnEncoded(param)) {
            super(param, SubjectPublicKeyInfo);
        }
        else {
            super(param);
        }
        this.tag = PemConverter.PublicKeyTag;
    }
    async export(...args) {
        let crypto;
        let keyUsages = ["verify"];
        let algorithm = {
            hash: "SHA-256", ...this.algorithm,
        };
        if (args.length > 1) {
            algorithm = args[0] || algorithm;
            keyUsages = args[1] || keyUsages;
            crypto = args[2] || cryptoProvider.get();
        }
        else {
            crypto = args[0] || cryptoProvider.get();
        }
        let raw = this.rawData;
        const asnSpki = AsnConvert.parse(this.rawData, SubjectPublicKeyInfo);
        if (asnSpki.algorithm.algorithm === id_RSASSA_PSS) {
            raw = convertSpkiToRsaPkcs1(asnSpki, raw);
        }
        return crypto.subtle.importKey("spki", raw, algorithm, true, keyUsages);
    }
    onInit(asn) {
        const algProv = instance.resolve(diAlgorithmProvider);
        const algorithm = this.algorithm = algProv.toWebAlgorithm(asn.algorithm);
        switch (asn.algorithm.algorithm) {
            case id_rsaEncryption:
                {
                    const rsaPublicKey = AsnConvert.parse(asn.subjectPublicKey, RSAPublicKey);
                    const modulus = buildExports.BufferSourceConverter.toUint8Array(rsaPublicKey.modulus);
                    algorithm.publicExponent = buildExports.BufferSourceConverter.toUint8Array(rsaPublicKey.publicExponent);
                    algorithm.modulusLength = (!modulus[0] ? modulus.slice(1) : modulus).byteLength << 3;
                    break;
                }
        }
    }
    async getThumbprint(...args) {
        var _a;
        let crypto;
        let algorithm = "SHA-1";
        if (args.length >= 1 && !((_a = args[0]) === null || _a === void 0 ? void 0 : _a.subtle)) {
            algorithm = args[0] || algorithm;
            crypto = args[1] || cryptoProvider.get();
        }
        else {
            crypto = args[0] || cryptoProvider.get();
        }
        return await crypto.subtle.digest(algorithm, this.rawData);
    }
    async getKeyIdentifier(...args) {
        let crypto;
        let algorithm = "SHA-1";
        if (args.length === 1) {
            if (typeof args[0] === "string") {
                algorithm = args[0];
                crypto = cryptoProvider.get();
            }
            else {
                crypto = args[0];
            }
        }
        else if (args.length === 2) {
            algorithm = args[0];
            crypto = args[1];
        }
        else {
            crypto = cryptoProvider.get();
        }
        const asn = AsnConvert.parse(this.rawData, SubjectPublicKeyInfo);
        return await crypto.subtle.digest(algorithm, asn.subjectPublicKey);
    }
    toTextObject() {
        const obj = this.toTextObjectEmpty();
        const asn = AsnConvert.parse(this.rawData, SubjectPublicKeyInfo);
        obj["Algorithm"] = TextConverter.serializeAlgorithm(asn.algorithm);
        switch (asn.algorithm.algorithm) {
            case id_ecPublicKey:
                obj["EC Point"] = asn.subjectPublicKey;
                break;
            case id_rsaEncryption:
            default:
                obj["Raw Data"] = asn.subjectPublicKey;
        }
        return obj;
    }
}
function convertSpkiToRsaPkcs1(asnSpki, raw) {
    asnSpki.algorithm = new AlgorithmIdentifier({
        algorithm: id_rsaEncryption,
        parameters: null,
    });
    raw = AsnConvert.serialize(asnSpki);
    return raw;
}

class AuthorityKeyIdentifierExtension extends Extension {
    static async create(param, critical = false, crypto = cryptoProvider.get()) {
        if ("name" in param && "serialNumber" in param) {
            return new AuthorityKeyIdentifierExtension(param, critical);
        }
        const key = await PublicKey.create(param, crypto);
        const id = await key.getKeyIdentifier(crypto);
        return new AuthorityKeyIdentifierExtension(buildExports.Convert.ToHex(id), critical);
    }
    constructor(...args) {
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
        }
        else if (typeof args[0] === "string") {
            const value = new AuthorityKeyIdentifier({ keyIdentifier: new KeyIdentifier(buildExports.Convert.FromHex(args[0])) });
            super(id_ce_authorityKeyIdentifier, args[1], AsnConvert.serialize(value));
        }
        else {
            const certId = args[0];
            const certIdName = certId.name instanceof GeneralNames
                ? AsnConvert.parse(certId.name.rawData, GeneralNames$1)
                : certId.name;
            const value = new AuthorityKeyIdentifier({
                authorityCertIssuer: certIdName,
                authorityCertSerialNumber: buildExports.Convert.FromHex(certId.serialNumber),
            });
            super(id_ce_authorityKeyIdentifier, args[1], AsnConvert.serialize(value));
        }
    }
    onInit(asn) {
        super.onInit(asn);
        const aki = AsnConvert.parse(asn.extnValue, AuthorityKeyIdentifier);
        if (aki.keyIdentifier) {
            this.keyId = buildExports.Convert.ToHex(aki.keyIdentifier);
        }
        if (aki.authorityCertIssuer || aki.authorityCertSerialNumber) {
            this.certId = {
                name: aki.authorityCertIssuer || [],
                serialNumber: aki.authorityCertSerialNumber ? buildExports.Convert.ToHex(aki.authorityCertSerialNumber) : "",
            };
        }
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        const asn = AsnConvert.parse(this.value, AuthorityKeyIdentifier);
        if (asn.authorityCertIssuer) {
            obj["Authority Issuer"] = new GeneralNames(asn.authorityCertIssuer).toTextObject();
        }
        if (asn.authorityCertSerialNumber) {
            obj["Authority Serial Number"] = asn.authorityCertSerialNumber;
        }
        if (asn.keyIdentifier) {
            obj[""] = asn.keyIdentifier;
        }
        return obj;
    }
}
AuthorityKeyIdentifierExtension.NAME = "Authority Key Identifier";

class BasicConstraintsExtension extends Extension {
    constructor(...args) {
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
            const value = AsnConvert.parse(this.value, BasicConstraints);
            this.ca = value.cA;
            this.pathLength = value.pathLenConstraint;
        }
        else {
            const value = new BasicConstraints({
                cA: args[0],
                pathLenConstraint: args[1],
            });
            super(id_ce_basicConstraints, args[2], AsnConvert.serialize(value));
            this.ca = args[0];
            this.pathLength = args[1];
        }
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        if (this.ca) {
            obj["CA"] = this.ca;
        }
        if (this.pathLength !== undefined) {
            obj["Path Length"] = this.pathLength;
        }
        return obj;
    }
}
BasicConstraintsExtension.NAME = "Basic Constraints";

var ExtendedKeyUsage;
(function (ExtendedKeyUsage) {
    ExtendedKeyUsage["serverAuth"] = "1.3.6.1.5.5.7.3.1";
    ExtendedKeyUsage["clientAuth"] = "1.3.6.1.5.5.7.3.2";
    ExtendedKeyUsage["codeSigning"] = "1.3.6.1.5.5.7.3.3";
    ExtendedKeyUsage["emailProtection"] = "1.3.6.1.5.5.7.3.4";
    ExtendedKeyUsage["timeStamping"] = "1.3.6.1.5.5.7.3.8";
    ExtendedKeyUsage["ocspSigning"] = "1.3.6.1.5.5.7.3.9";
})(ExtendedKeyUsage || (ExtendedKeyUsage = {}));
class ExtendedKeyUsageExtension extends Extension {
    constructor(...args) {
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
            const value = AsnConvert.parse(this.value, ExtendedKeyUsage$1);
            this.usages = value.map((o) => o);
        }
        else {
            const value = new ExtendedKeyUsage$1(args[0]);
            super(id_ce_extKeyUsage, args[1], AsnConvert.serialize(value));
            this.usages = args[0];
        }
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        obj[""] = this.usages.map((o) => OidSerializer.toString(o)).join(", ");
        return obj;
    }
}
ExtendedKeyUsageExtension.NAME = "Extended Key Usages";

var KeyUsageFlags;
(function (KeyUsageFlags) {
    KeyUsageFlags[KeyUsageFlags["digitalSignature"] = 1] = "digitalSignature";
    KeyUsageFlags[KeyUsageFlags["nonRepudiation"] = 2] = "nonRepudiation";
    KeyUsageFlags[KeyUsageFlags["keyEncipherment"] = 4] = "keyEncipherment";
    KeyUsageFlags[KeyUsageFlags["dataEncipherment"] = 8] = "dataEncipherment";
    KeyUsageFlags[KeyUsageFlags["keyAgreement"] = 16] = "keyAgreement";
    KeyUsageFlags[KeyUsageFlags["keyCertSign"] = 32] = "keyCertSign";
    KeyUsageFlags[KeyUsageFlags["cRLSign"] = 64] = "cRLSign";
    KeyUsageFlags[KeyUsageFlags["encipherOnly"] = 128] = "encipherOnly";
    KeyUsageFlags[KeyUsageFlags["decipherOnly"] = 256] = "decipherOnly";
})(KeyUsageFlags || (KeyUsageFlags = {}));
class KeyUsagesExtension extends Extension {
    constructor(...args) {
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
            const value = AsnConvert.parse(this.value, KeyUsage);
            this.usages = value.toNumber();
        }
        else {
            const value = new KeyUsage(args[0]);
            super(id_ce_keyUsage, args[1], AsnConvert.serialize(value));
            this.usages = args[0];
        }
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        const asn = AsnConvert.parse(this.value, KeyUsage);
        obj[""] = asn.toJSON().join(", ");
        return obj;
    }
}
KeyUsagesExtension.NAME = "Key Usages";

class SubjectKeyIdentifierExtension extends Extension {
    static async create(publicKey, critical = false, crypto = cryptoProvider.get()) {
        const key = await PublicKey.create(publicKey, crypto);
        const id = await key.getKeyIdentifier(crypto);
        return new SubjectKeyIdentifierExtension(buildExports.Convert.ToHex(id), critical);
    }
    constructor(...args) {
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
            const value = AsnConvert.parse(this.value, SubjectKeyIdentifier);
            this.keyId = buildExports.Convert.ToHex(value);
        }
        else {
            const identifier = typeof args[0] === "string"
                ? buildExports.Convert.FromHex(args[0])
                : args[0];
            const value = new SubjectKeyIdentifier(identifier);
            super(id_ce_subjectKeyIdentifier, args[1], AsnConvert.serialize(value));
            this.keyId = buildExports.Convert.ToHex(identifier);
        }
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        const asn = AsnConvert.parse(this.value, SubjectKeyIdentifier);
        obj[""] = asn;
        return obj;
    }
}
SubjectKeyIdentifierExtension.NAME = "Subject Key Identifier";

class SubjectAlternativeNameExtension extends Extension {
    constructor(...args) {
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
        }
        else {
            super(id_ce_subjectAltName, args[1], new GeneralNames(args[0] || []).rawData);
        }
    }
    onInit(asn) {
        super.onInit(asn);
        const value = AsnConvert.parse(asn.extnValue, SubjectAlternativeName);
        this.names = new GeneralNames(value);
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        const namesObj = this.names.toTextObject();
        for (const key in namesObj) {
            obj[key] = namesObj[key];
        }
        return obj;
    }
}
SubjectAlternativeNameExtension.NAME = "Subject Alternative Name";

class ExtensionFactory {
    static register(id, type) {
        this.items.set(id, type);
    }
    static create(data) {
        const extension = new Extension(data);
        const Type = this.items.get(extension.type);
        if (Type) {
            return new Type(data);
        }
        return extension;
    }
}
ExtensionFactory.items = new Map();

class CertificatePolicyExtension extends Extension {
    constructor(...args) {
        var _a;
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
            const asnPolicies = AsnConvert.parse(this.value, CertificatePolicies);
            this.policies = asnPolicies.map((o) => o.policyIdentifier);
        }
        else {
            const policies = args[0];
            const critical = (_a = args[1]) !== null && _a !== void 0 ? _a : false;
            const value = new CertificatePolicies(policies.map((o) => (new PolicyInformation({ policyIdentifier: o }))));
            super(id_ce_certificatePolicies, critical, AsnConvert.serialize(value));
            this.policies = policies;
        }
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        obj["Policy"] = this.policies.map((o) => new TextObject("", {}, OidSerializer.toString(o)));
        return obj;
    }
}
CertificatePolicyExtension.NAME = "Certificate Policies";
ExtensionFactory.register(id_ce_certificatePolicies, CertificatePolicyExtension);

class CRLDistributionPointsExtension extends Extension {
    constructor(...args) {
        var _a;
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
        }
        else if (Array.isArray(args[0]) && typeof args[0][0] === "string") {
            const urls = args[0];
            const dps = urls.map((url) => {
                return new DistributionPoint({
                    distributionPoint: new DistributionPointName({ fullName: [new GeneralName$1({ uniformResourceIdentifier: url })] }),
                });
            });
            const value = new CRLDistributionPoints(dps);
            super(id_ce_cRLDistributionPoints, args[1], AsnConvert.serialize(value));
        }
        else {
            const value = new CRLDistributionPoints(args[0]);
            super(id_ce_cRLDistributionPoints, args[1], AsnConvert.serialize(value));
        }
        (_a = this.distributionPoints) !== null && _a !== void 0 ? _a : (this.distributionPoints = []);
    }
    onInit(asn) {
        super.onInit(asn);
        const crlExt = AsnConvert.parse(asn.extnValue, CRLDistributionPoints);
        this.distributionPoints = crlExt;
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        obj["Distribution Point"] = this.distributionPoints.map((dp) => {
            var _a;
            const dpObj = {};
            if (dp.distributionPoint) {
                dpObj[""] = (_a = dp.distributionPoint.fullName) === null || _a === void 0 ? void 0 : _a.map((name) => new GeneralName(name).toString()).join(", ");
            }
            if (dp.reasons) {
                dpObj["Reasons"] = dp.reasons.toString();
            }
            if (dp.cRLIssuer) {
                dpObj["CRL Issuer"] = dp.cRLIssuer.map((issuer) => issuer.toString()).join(", ");
            }
            return dpObj;
        });
        return obj;
    }
}
CRLDistributionPointsExtension.NAME = "CRL Distribution Points";

class AuthorityInfoAccessExtension extends Extension {
    constructor(...args) {
        var _a, _b, _c, _d;
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
        }
        else if (args[0] instanceof AuthorityInfoAccessSyntax) {
            const value = new AuthorityInfoAccessSyntax(args[0]);
            super(id_pe_authorityInfoAccess, args[1], AsnConvert.serialize(value));
        }
        else {
            const params = args[0];
            const value = new AuthorityInfoAccessSyntax();
            addAccessDescriptions(value, params, id_ad_ocsp, "ocsp");
            addAccessDescriptions(value, params, id_ad_caIssuers, "caIssuers");
            addAccessDescriptions(value, params, id_ad_timeStamping, "timeStamping");
            addAccessDescriptions(value, params, id_ad_caRepository, "caRepository");
            super(id_pe_authorityInfoAccess, args[1], AsnConvert.serialize(value));
        }
        (_a = this.ocsp) !== null && _a !== void 0 ? _a : (this.ocsp = []);
        (_b = this.caIssuers) !== null && _b !== void 0 ? _b : (this.caIssuers = []);
        (_c = this.timeStamping) !== null && _c !== void 0 ? _c : (this.timeStamping = []);
        (_d = this.caRepository) !== null && _d !== void 0 ? _d : (this.caRepository = []);
    }
    onInit(asn) {
        super.onInit(asn);
        this.ocsp = [];
        this.caIssuers = [];
        this.timeStamping = [];
        this.caRepository = [];
        const aia = AsnConvert.parse(asn.extnValue, AuthorityInfoAccessSyntax);
        aia.forEach((accessDescription) => {
            switch (accessDescription.accessMethod) {
                case id_ad_ocsp:
                    this.ocsp.push(new GeneralName(accessDescription.accessLocation));
                    break;
                case id_ad_caIssuers:
                    this.caIssuers.push(new GeneralName(accessDescription.accessLocation));
                    break;
                case id_ad_timeStamping:
                    this.timeStamping.push(new GeneralName(accessDescription.accessLocation));
                    break;
                case id_ad_caRepository:
                    this.caRepository.push(new GeneralName(accessDescription.accessLocation));
                    break;
            }
        });
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        if (this.ocsp.length) {
            addUrlsToObject(obj, "OCSP", this.ocsp);
        }
        if (this.caIssuers.length) {
            addUrlsToObject(obj, "CA Issuers", this.caIssuers);
        }
        if (this.timeStamping.length) {
            addUrlsToObject(obj, "Time Stamping", this.timeStamping);
        }
        if (this.caRepository.length) {
            addUrlsToObject(obj, "CA Repository", this.caRepository);
        }
        return obj;
    }
}
AuthorityInfoAccessExtension.NAME = "Authority Info Access";
function addUrlsToObject(obj, key, urls) {
    if (urls.length === 1) {
        obj[key] = urls[0].toTextObject();
    }
    else {
        const names = new TextObject("");
        urls.forEach((name, index) => {
            const nameObj = name.toTextObject();
            const indexedKey = `${nameObj[TextObject.NAME]} ${index + 1}`;
            let field = names[indexedKey];
            if (!Array.isArray(field)) {
                field = [];
                names[indexedKey] = field;
            }
            field.push(nameObj);
        });
        obj[key] = names;
    }
}
function addAccessDescriptions(value, params, method, key) {
    const items = params[key];
    if (items) {
        const array = Array.isArray(items) ? items : [items];
        array.forEach((url) => {
            if (typeof url === "string") {
                url = new GeneralName("url", url);
            }
            value.push(new AccessDescription({
                accessMethod: method,
                accessLocation: AsnConvert.parse(url.rawData, GeneralName$1),
            }));
        });
    }
}

class IssuerAlternativeNameExtension extends Extension {
    constructor(...args) {
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
        }
        else {
            super(id_ce_issuerAltName, args[1], new GeneralNames(args[0] || []).rawData);
        }
    }
    onInit(asn) {
        super.onInit(asn);
        const value = AsnConvert.parse(asn.extnValue, GeneralNames$1);
        this.names = new GeneralNames(value);
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        const namesObj = this.names.toTextObject();
        for (const key in namesObj) {
            obj[key] = namesObj[key];
        }
        return obj;
    }
}
IssuerAlternativeNameExtension.NAME = "Issuer Alternative Name";

class Attribute extends AsnData {
    constructor(...args) {
        let raw;
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            raw = buildExports.BufferSourceConverter.toArrayBuffer(args[0]);
        }
        else {
            const type = args[0];
            const values = Array.isArray(args[1])
                ? args[1].map((o) => buildExports.BufferSourceConverter.toArrayBuffer(o))
                : [];
            raw = AsnConvert.serialize(new Attribute$2({
                type, values,
            }));
        }
        super(raw, Attribute$2);
    }
    onInit(asn) {
        this.type = asn.type;
        this.values = asn.values;
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        obj["Value"] = this.values.map((o) => new TextObject("", { "": o }));
        return obj;
    }
    toTextObjectWithoutValue() {
        const obj = this.toTextObjectEmpty();
        if (obj[TextObject.NAME] === Attribute.NAME) {
            obj[TextObject.NAME] = OidSerializer.toString(this.type);
        }
        return obj;
    }
}
Attribute.NAME = "Attribute";

class ChallengePasswordAttribute extends Attribute {
    constructor(...args) {
        var _a;
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
        }
        else {
            const value = new ChallengePassword({ printableString: args[0] });
            super(id_pkcs9_at_challengePassword, [AsnConvert.serialize(value)]);
        }
        (_a = this.password) !== null && _a !== void 0 ? _a : (this.password = "");
    }
    onInit(asn) {
        super.onInit(asn);
        if (this.values[0]) {
            const value = AsnConvert.parse(this.values[0], ChallengePassword);
            this.password = value.toString();
        }
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        obj[TextObject.VALUE] = this.password;
        return obj;
    }
}
ChallengePasswordAttribute.NAME = "Challenge Password";

class ExtensionsAttribute extends Attribute {
    constructor(...args) {
        var _a;
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            super(args[0]);
        }
        else {
            const extensions = args[0];
            const value = new Extensions();
            for (const extension of extensions) {
                value.push(AsnConvert.parse(extension.rawData, Extension$1));
            }
            super(id_pkcs9_at_extensionRequest, [AsnConvert.serialize(value)]);
        }
        (_a = this.items) !== null && _a !== void 0 ? _a : (this.items = []);
    }
    onInit(asn) {
        super.onInit(asn);
        if (this.values[0]) {
            const value = AsnConvert.parse(this.values[0], Extensions);
            this.items = value.map((o) => ExtensionFactory.create(AsnConvert.serialize(o)));
        }
    }
    toTextObject() {
        const obj = this.toTextObjectWithoutValue();
        const extensions = this.items.map((o) => o.toTextObject());
        for (const extension of extensions) {
            obj[extension[TextObject.NAME]] = extension;
        }
        return obj;
    }
}
ExtensionsAttribute.NAME = "Extensions";

class AttributeFactory {
    static register(id, type) {
        this.items.set(id, type);
    }
    static create(data) {
        const attribute = new Attribute(data);
        const Type = this.items.get(attribute.type);
        if (Type) {
            return new Type(data);
        }
        return attribute;
    }
}
AttributeFactory.items = new Map();

const diAsnSignatureFormatter = "crypto.signatureFormatter";
class AsnDefaultSignatureFormatter {
    toAsnSignature(algorithm, signature) {
        return buildExports.BufferSourceConverter.toArrayBuffer(signature);
    }
    toWebSignature(algorithm, signature) {
        return buildExports.BufferSourceConverter.toArrayBuffer(signature);
    }
}

var RsaAlgorithm_1;
let RsaAlgorithm = RsaAlgorithm_1 = class RsaAlgorithm {
    static createPssParams(hash, saltLength) {
        const hashAlgorithm = RsaAlgorithm_1.getHashAlgorithm(hash);
        if (!hashAlgorithm) {
            return null;
        }
        return new RsaSaPssParams({
            hashAlgorithm,
            maskGenAlgorithm: new AlgorithmIdentifier({
                algorithm: id_mgf1,
                parameters: AsnConvert.serialize(hashAlgorithm),
            }),
            saltLength,
        });
    }
    static getHashAlgorithm(alg) {
        const algProv = instance.resolve(diAlgorithmProvider);
        if (typeof alg === "string") {
            return algProv.toAsnAlgorithm({ name: alg });
        }
        if (typeof alg === "object" && alg && "name" in alg) {
            return algProv.toAsnAlgorithm(alg);
        }
        return null;
    }
    toAsnAlgorithm(alg) {
        switch (alg.name.toLowerCase()) {
            case "rsassa-pkcs1-v1_5":
                if ("hash" in alg) {
                    let hash;
                    if (typeof alg.hash === "string") {
                        hash = alg.hash;
                    }
                    else if (alg.hash && typeof alg.hash === "object"
                        && "name" in alg.hash && typeof alg.hash.name === "string") {
                        hash = alg.hash.name.toUpperCase();
                    }
                    else {
                        throw new Error("Cannot get hash algorithm name");
                    }
                    switch (hash.toLowerCase()) {
                        case "sha-1":
                            return new AlgorithmIdentifier({
                                algorithm: id_sha1WithRSAEncryption, parameters: null,
                            });
                        case "sha-256":
                            return new AlgorithmIdentifier({
                                algorithm: id_sha256WithRSAEncryption, parameters: null,
                            });
                        case "sha-384":
                            return new AlgorithmIdentifier({
                                algorithm: id_sha384WithRSAEncryption, parameters: null,
                            });
                        case "sha-512":
                            return new AlgorithmIdentifier({
                                algorithm: id_sha512WithRSAEncryption, parameters: null,
                            });
                    }
                }
                else {
                    return new AlgorithmIdentifier({
                        algorithm: id_rsaEncryption, parameters: null,
                    });
                }
                break;
            case "rsa-pss":
                if ("hash" in alg) {
                    if (!("saltLength" in alg && typeof alg.saltLength === "number")) {
                        throw new Error("Cannot get 'saltLength' from 'alg' argument");
                    }
                    const pssParams = RsaAlgorithm_1.createPssParams(alg.hash, alg.saltLength);
                    if (!pssParams) {
                        throw new Error("Cannot create PSS parameters");
                    }
                    return new AlgorithmIdentifier({
                        algorithm: id_RSASSA_PSS, parameters: AsnConvert.serialize(pssParams),
                    });
                }
                else {
                    return new AlgorithmIdentifier({
                        algorithm: id_RSASSA_PSS, parameters: null,
                    });
                }
        }
        return null;
    }
    toWebAlgorithm(alg) {
        switch (alg.algorithm) {
            case id_rsaEncryption:
                return { name: "RSASSA-PKCS1-v1_5" };
            case id_sha1WithRSAEncryption:
                return {
                    name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-1" },
                };
            case id_sha256WithRSAEncryption:
                return {
                    name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" },
                };
            case id_sha384WithRSAEncryption:
                return {
                    name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-384" },
                };
            case id_sha512WithRSAEncryption:
                return {
                    name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-512" },
                };
            case id_RSASSA_PSS:
                if (alg.parameters) {
                    const pssParams = AsnConvert.parse(alg.parameters, RsaSaPssParams);
                    const algProv = instance.resolve(diAlgorithmProvider);
                    const hashAlg = algProv.toWebAlgorithm(pssParams.hashAlgorithm);
                    return {
                        name: "RSA-PSS",
                        hash: hashAlg,
                        saltLength: pssParams.saltLength,
                    };
                }
                else {
                    return { name: "RSA-PSS" };
                }
        }
        return null;
    }
};
RsaAlgorithm = RsaAlgorithm_1 = __decorate([
    injectable()
], RsaAlgorithm);
instance.registerSingleton(diAlgorithm, RsaAlgorithm);

let ShaAlgorithm = class ShaAlgorithm {
    toAsnAlgorithm(alg) {
        switch (alg.name.toLowerCase()) {
            case "sha-1":
                return new AlgorithmIdentifier({ algorithm: id_sha1 });
            case "sha-256":
                return new AlgorithmIdentifier({ algorithm: id_sha256 });
            case "sha-384":
                return new AlgorithmIdentifier({ algorithm: id_sha384 });
            case "sha-512":
                return new AlgorithmIdentifier({ algorithm: id_sha512 });
        }
        return null;
    }
    toWebAlgorithm(alg) {
        switch (alg.algorithm) {
            case id_sha1:
                return { name: "SHA-1" };
            case id_sha256:
                return { name: "SHA-256" };
            case id_sha384:
                return { name: "SHA-384" };
            case id_sha512:
                return { name: "SHA-512" };
        }
        return null;
    }
};
ShaAlgorithm = __decorate([
    injectable()
], ShaAlgorithm);
instance.registerSingleton(diAlgorithm, ShaAlgorithm);

class AsnEcSignatureFormatter {
    addPadding(pointSize, data) {
        const bytes = buildExports.BufferSourceConverter.toUint8Array(data);
        const res = new Uint8Array(pointSize);
        res.set(bytes, pointSize - bytes.length);
        return res.buffer;
    }
    removePadding(data, positive = false) {
        let bytes = buildExports.BufferSourceConverter.toUint8Array(data);
        for (let i = 0; i < bytes.length; i++) {
            if (!bytes[i]) {
                continue;
            }
            bytes = bytes.slice(i);
            break;
        }
        if (positive && bytes[0] > 127) {
            const result = new Uint8Array(bytes.length + 1);
            result.set(bytes, 1);
            return result.buffer;
        }
        return bytes.buffer;
    }
    toAsnSignature(algorithm, signature) {
        if (algorithm.name === "ECDSA") {
            const namedCurve = algorithm.namedCurve;
            const pointSize = AsnEcSignatureFormatter.namedCurveSize.get(namedCurve)
                || AsnEcSignatureFormatter.defaultNamedCurveSize;
            const ecSignature = new ECDSASigValue();
            const uint8Signature = buildExports.BufferSourceConverter.toUint8Array(signature);
            ecSignature.r = this.removePadding(uint8Signature.slice(0, pointSize), true);
            ecSignature.s = this.removePadding(uint8Signature.slice(pointSize, pointSize + pointSize), true);
            return AsnConvert.serialize(ecSignature);
        }
        return null;
    }
    toWebSignature(algorithm, signature) {
        if (algorithm.name === "ECDSA") {
            const ecSigValue = AsnConvert.parse(signature, ECDSASigValue);
            const namedCurve = algorithm.namedCurve;
            const pointSize = AsnEcSignatureFormatter.namedCurveSize.get(namedCurve)
                || AsnEcSignatureFormatter.defaultNamedCurveSize;
            const r = this.addPadding(pointSize, this.removePadding(ecSigValue.r));
            const s = this.addPadding(pointSize, this.removePadding(ecSigValue.s));
            return buildExports.combine(r, s);
        }
        return null;
    }
}
AsnEcSignatureFormatter.namedCurveSize = new Map();
AsnEcSignatureFormatter.defaultNamedCurveSize = 32;

const idX25519 = "1.3.101.110";
const idX448 = "1.3.101.111";
const idEd25519 = "1.3.101.112";
const idEd448 = "1.3.101.113";
let EdAlgorithm = class EdAlgorithm {
    toAsnAlgorithm(alg) {
        let algorithm = null;
        switch (alg.name.toLowerCase()) {
            case "ed25519":
                algorithm = idEd25519;
                break;
            case "x25519":
                algorithm = idX25519;
                break;
            case "eddsa":
                switch (alg.namedCurve.toLowerCase()) {
                    case "ed25519":
                        algorithm = idEd25519;
                        break;
                    case "ed448":
                        algorithm = idEd448;
                        break;
                }
                break;
            case "ecdh-es":
                switch (alg.namedCurve.toLowerCase()) {
                    case "x25519":
                        algorithm = idX25519;
                        break;
                    case "x448":
                        algorithm = idX448;
                        break;
                }
        }
        if (algorithm) {
            return new AlgorithmIdentifier({ algorithm });
        }
        return null;
    }
    toWebAlgorithm(alg) {
        switch (alg.algorithm) {
            case idEd25519:
                return { name: "Ed25519" };
            case idEd448:
                return {
                    name: "EdDSA", namedCurve: "Ed448",
                };
            case idX25519:
                return { name: "X25519" };
            case idX448:
                return {
                    name: "ECDH-ES", namedCurve: "X448",
                };
        }
        return null;
    }
};
EdAlgorithm = __decorate([
    injectable()
], EdAlgorithm);
instance.registerSingleton(diAlgorithm, EdAlgorithm);

var _Pkcs10CertificateRequest_tbs, _Pkcs10CertificateRequest_subjectName, _Pkcs10CertificateRequest_subject, _Pkcs10CertificateRequest_signatureAlgorithm, _Pkcs10CertificateRequest_signature, _Pkcs10CertificateRequest_publicKey, _Pkcs10CertificateRequest_attributes, _Pkcs10CertificateRequest_extensions;
class Pkcs10CertificateRequest extends PemData {
    get subjectName() {
        if (!__classPrivateFieldGet(this, _Pkcs10CertificateRequest_subjectName, "f")) {
            __classPrivateFieldSet(this, _Pkcs10CertificateRequest_subjectName, new Name(this.asn.certificationRequestInfo.subject), "f");
        }
        return __classPrivateFieldGet(this, _Pkcs10CertificateRequest_subjectName, "f");
    }
    get subject() {
        if (!__classPrivateFieldGet(this, _Pkcs10CertificateRequest_subject, "f")) {
            __classPrivateFieldSet(this, _Pkcs10CertificateRequest_subject, this.subjectName.toString(), "f");
        }
        return __classPrivateFieldGet(this, _Pkcs10CertificateRequest_subject, "f");
    }
    get signatureAlgorithm() {
        if (!__classPrivateFieldGet(this, _Pkcs10CertificateRequest_signatureAlgorithm, "f")) {
            const algProv = instance.resolve(diAlgorithmProvider);
            __classPrivateFieldSet(this, _Pkcs10CertificateRequest_signatureAlgorithm, algProv.toWebAlgorithm(this.asn.signatureAlgorithm), "f");
        }
        return __classPrivateFieldGet(this, _Pkcs10CertificateRequest_signatureAlgorithm, "f");
    }
    get signature() {
        if (!__classPrivateFieldGet(this, _Pkcs10CertificateRequest_signature, "f")) {
            __classPrivateFieldSet(this, _Pkcs10CertificateRequest_signature, this.asn.signature, "f");
        }
        return __classPrivateFieldGet(this, _Pkcs10CertificateRequest_signature, "f");
    }
    get publicKey() {
        if (!__classPrivateFieldGet(this, _Pkcs10CertificateRequest_publicKey, "f")) {
            __classPrivateFieldSet(this, _Pkcs10CertificateRequest_publicKey, new PublicKey(this.asn.certificationRequestInfo.subjectPKInfo), "f");
        }
        return __classPrivateFieldGet(this, _Pkcs10CertificateRequest_publicKey, "f");
    }
    get attributes() {
        if (!__classPrivateFieldGet(this, _Pkcs10CertificateRequest_attributes, "f")) {
            __classPrivateFieldSet(this, _Pkcs10CertificateRequest_attributes, this.asn.certificationRequestInfo.attributes
                .map((o) => AttributeFactory.create(AsnConvert.serialize(o))), "f");
        }
        return __classPrivateFieldGet(this, _Pkcs10CertificateRequest_attributes, "f");
    }
    get extensions() {
        if (!__classPrivateFieldGet(this, _Pkcs10CertificateRequest_extensions, "f")) {
            __classPrivateFieldSet(this, _Pkcs10CertificateRequest_extensions, [], "f");
            const extensions = this.getAttribute(id_pkcs9_at_extensionRequest);
            if (extensions instanceof ExtensionsAttribute) {
                __classPrivateFieldSet(this, _Pkcs10CertificateRequest_extensions, extensions.items, "f");
            }
        }
        return __classPrivateFieldGet(this, _Pkcs10CertificateRequest_extensions, "f");
    }
    get tbs() {
        if (!__classPrivateFieldGet(this, _Pkcs10CertificateRequest_tbs, "f")) {
            __classPrivateFieldSet(this, _Pkcs10CertificateRequest_tbs, this.asn.certificationRequestInfoRaw
                || AsnConvert.serialize(this.asn.certificationRequestInfo), "f");
        }
        return __classPrivateFieldGet(this, _Pkcs10CertificateRequest_tbs, "f");
    }
    constructor(param) {
        const args = PemData.isAsnEncoded(param) ? [param, CertificationRequest] : [param];
        super(args[0], args[1]);
        _Pkcs10CertificateRequest_tbs.set(this, void 0);
        _Pkcs10CertificateRequest_subjectName.set(this, void 0);
        _Pkcs10CertificateRequest_subject.set(this, void 0);
        _Pkcs10CertificateRequest_signatureAlgorithm.set(this, void 0);
        _Pkcs10CertificateRequest_signature.set(this, void 0);
        _Pkcs10CertificateRequest_publicKey.set(this, void 0);
        _Pkcs10CertificateRequest_attributes.set(this, void 0);
        _Pkcs10CertificateRequest_extensions.set(this, void 0);
        this.tag = PemConverter.CertificateRequestTag;
    }
    onInit(_asn) {
    }
    getAttribute(type) {
        for (const attr of this.attributes) {
            if (attr.type === type) {
                return attr;
            }
        }
        return null;
    }
    getAttributes(type) {
        return this.attributes.filter((o) => o.type === type);
    }
    getExtension(type) {
        for (const ext of this.extensions) {
            if (ext.type === type) {
                return ext;
            }
        }
        return null;
    }
    getExtensions(type) {
        return this.extensions.filter((o) => o.type === type);
    }
    async verify(crypto = cryptoProvider.get()) {
        const algorithm = {
            ...this.publicKey.algorithm, ...this.signatureAlgorithm,
        };
        const publicKey = await this.publicKey.export(algorithm, ["verify"], crypto);
        const signatureFormatters = instance
            .resolveAll(diAsnSignatureFormatter)
            .reverse();
        let signature = null;
        for (const signatureFormatter of signatureFormatters) {
            signature = signatureFormatter.toWebSignature(algorithm, this.signature);
            if (signature) {
                break;
            }
        }
        if (!signature) {
            throw Error("Cannot convert WebCrypto signature value to ASN.1 format");
        }
        const ok = await crypto.subtle.verify(this.signatureAlgorithm, publicKey, signature, this.tbs);
        return ok;
    }
    toTextObject() {
        const obj = this.toTextObjectEmpty();
        const req = AsnConvert.parse(this.rawData, CertificationRequest);
        const tbs = req.certificationRequestInfo;
        const data = new TextObject("", {
            Version: `${Version$1[tbs.version]} (${tbs.version})`,
            Subject: this.subject,
            "Subject Public Key Info": this.publicKey,
        });
        if (this.attributes.length) {
            const attrs = new TextObject("");
            for (const ext of this.attributes) {
                const attrObj = ext.toTextObject();
                attrs[attrObj[TextObject.NAME]] = attrObj;
            }
            data["Attributes"] = attrs;
        }
        obj["Data"] = data;
        obj["Signature"] = new TextObject("", {
            Algorithm: TextConverter.serializeAlgorithm(req.signatureAlgorithm),
            "": req.signature,
        });
        return obj;
    }
}
_Pkcs10CertificateRequest_tbs = new WeakMap(), _Pkcs10CertificateRequest_subjectName = new WeakMap(), _Pkcs10CertificateRequest_subject = new WeakMap(), _Pkcs10CertificateRequest_signatureAlgorithm = new WeakMap(), _Pkcs10CertificateRequest_signature = new WeakMap(), _Pkcs10CertificateRequest_publicKey = new WeakMap(), _Pkcs10CertificateRequest_attributes = new WeakMap(), _Pkcs10CertificateRequest_extensions = new WeakMap();
Pkcs10CertificateRequest.NAME = "PKCS#10 Certificate Request";

class Pkcs10CertificateRequestGenerator {
    static async create(params, crypto = cryptoProvider.get()) {
        if (!params.keys.privateKey) {
            throw new Error("Bad field 'keys' in 'params' argument. 'privateKey' is empty");
        }
        if (!params.keys.publicKey) {
            throw new Error("Bad field 'keys' in 'params' argument. 'publicKey' is empty");
        }
        const spki = await crypto.subtle.exportKey("spki", params.keys.publicKey);
        const asnReq = new CertificationRequest({
            certificationRequestInfo: new CertificationRequestInfo({ subjectPKInfo: AsnConvert.parse(spki, SubjectPublicKeyInfo) }),
        });
        if (params.name) {
            const name = params.name instanceof Name
                ? params.name
                : new Name(params.name);
            asnReq.certificationRequestInfo.subject = AsnConvert.parse(name.toArrayBuffer(), Name$1);
        }
        if (params.attributes) {
            for (const o of params.attributes) {
                asnReq.certificationRequestInfo.attributes.push(AsnConvert.parse(o.rawData, Attribute$2));
            }
        }
        if (params.extensions && params.extensions.length) {
            const attr = new Attribute$2({ type: id_pkcs9_at_extensionRequest });
            const extensions = new Extensions();
            for (const o of params.extensions) {
                extensions.push(AsnConvert.parse(o.rawData, Extension$1));
            }
            attr.values.push(AsnConvert.serialize(extensions));
            asnReq.certificationRequestInfo.attributes.push(attr);
        }
        const signingAlgorithm = {
            ...params.signingAlgorithm, ...params.keys.privateKey.algorithm,
        };
        const algProv = instance.resolve(diAlgorithmProvider);
        asnReq.signatureAlgorithm = algProv.toAsnAlgorithm(signingAlgorithm);
        const tbs = AsnConvert.serialize(asnReq.certificationRequestInfo);
        const signature = await crypto.subtle.sign(signingAlgorithm, params.keys.privateKey, tbs);
        const signatureFormatters = instance
            .resolveAll(diAsnSignatureFormatter)
            .reverse();
        let asnSignature = null;
        for (const signatureFormatter of signatureFormatters) {
            asnSignature = signatureFormatter.toAsnSignature(signingAlgorithm, signature);
            if (asnSignature) {
                break;
            }
        }
        if (!asnSignature) {
            throw Error("Cannot convert WebCrypto signature value to ASN.1 format");
        }
        asnReq.signature = asnSignature;
        return new Pkcs10CertificateRequest(AsnConvert.serialize(asnReq));
    }
}

var _X509Certificate_tbs, _X509Certificate_serialNumber, _X509Certificate_subjectName, _X509Certificate_subject, _X509Certificate_issuerName, _X509Certificate_issuer, _X509Certificate_notBefore, _X509Certificate_notAfter, _X509Certificate_signatureAlgorithm, _X509Certificate_signature, _X509Certificate_extensions, _X509Certificate_publicKey;
class X509Certificate extends PemData {
    get publicKey() {
        if (!__classPrivateFieldGet(this, _X509Certificate_publicKey, "f")) {
            __classPrivateFieldSet(this, _X509Certificate_publicKey, new PublicKey(this.asn.tbsCertificate.subjectPublicKeyInfo), "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_publicKey, "f");
    }
    get serialNumber() {
        if (!__classPrivateFieldGet(this, _X509Certificate_serialNumber, "f")) {
            const tbs = this.asn.tbsCertificate;
            let serialNumberBytes = new Uint8Array(tbs.serialNumber);
            if (serialNumberBytes.length > 1
                && serialNumberBytes[0] === 0x00
                && serialNumberBytes[1] > 0x7F) {
                serialNumberBytes = serialNumberBytes.slice(1);
            }
            __classPrivateFieldSet(this, _X509Certificate_serialNumber, buildExports.Convert.ToHex(serialNumberBytes), "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_serialNumber, "f");
    }
    get subjectName() {
        if (!__classPrivateFieldGet(this, _X509Certificate_subjectName, "f")) {
            __classPrivateFieldSet(this, _X509Certificate_subjectName, new Name(this.asn.tbsCertificate.subject), "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_subjectName, "f");
    }
    get subject() {
        if (!__classPrivateFieldGet(this, _X509Certificate_subject, "f")) {
            __classPrivateFieldSet(this, _X509Certificate_subject, this.subjectName.toString(), "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_subject, "f");
    }
    get issuerName() {
        if (!__classPrivateFieldGet(this, _X509Certificate_issuerName, "f")) {
            __classPrivateFieldSet(this, _X509Certificate_issuerName, new Name(this.asn.tbsCertificate.issuer), "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_issuerName, "f");
    }
    get issuer() {
        if (!__classPrivateFieldGet(this, _X509Certificate_issuer, "f")) {
            __classPrivateFieldSet(this, _X509Certificate_issuer, this.issuerName.toString(), "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_issuer, "f");
    }
    get notBefore() {
        if (!__classPrivateFieldGet(this, _X509Certificate_notBefore, "f")) {
            const notBefore = this.asn.tbsCertificate.validity.notBefore.utcTime
                || this.asn.tbsCertificate.validity.notBefore.generalTime;
            if (!notBefore) {
                throw new Error("Cannot get 'notBefore' value");
            }
            __classPrivateFieldSet(this, _X509Certificate_notBefore, notBefore, "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_notBefore, "f");
    }
    get notAfter() {
        if (!__classPrivateFieldGet(this, _X509Certificate_notAfter, "f")) {
            const notAfter = this.asn.tbsCertificate.validity.notAfter.utcTime
                || this.asn.tbsCertificate.validity.notAfter.generalTime;
            if (!notAfter) {
                throw new Error("Cannot get 'notAfter' value");
            }
            __classPrivateFieldSet(this, _X509Certificate_notAfter, notAfter, "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_notAfter, "f");
    }
    get signatureAlgorithm() {
        if (!__classPrivateFieldGet(this, _X509Certificate_signatureAlgorithm, "f")) {
            const algProv = instance.resolve(diAlgorithmProvider);
            __classPrivateFieldSet(this, _X509Certificate_signatureAlgorithm, algProv
                .toWebAlgorithm(this.asn.signatureAlgorithm), "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_signatureAlgorithm, "f");
    }
    get signature() {
        if (!__classPrivateFieldGet(this, _X509Certificate_signature, "f")) {
            __classPrivateFieldSet(this, _X509Certificate_signature, this.asn.signatureValue, "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_signature, "f");
    }
    get extensions() {
        if (!__classPrivateFieldGet(this, _X509Certificate_extensions, "f")) {
            __classPrivateFieldSet(this, _X509Certificate_extensions, [], "f");
            if (this.asn.tbsCertificate.extensions) {
                __classPrivateFieldSet(this, _X509Certificate_extensions, this.asn.tbsCertificate.extensions.map((o) => (ExtensionFactory.create(AsnConvert.serialize(o)))), "f");
            }
        }
        return __classPrivateFieldGet(this, _X509Certificate_extensions, "f");
    }
    get tbs() {
        if (!__classPrivateFieldGet(this, _X509Certificate_tbs, "f")) {
            __classPrivateFieldSet(this, _X509Certificate_tbs, this.asn.tbsCertificateRaw || AsnConvert.serialize(this.asn.tbsCertificate), "f");
        }
        return __classPrivateFieldGet(this, _X509Certificate_tbs, "f");
    }
    constructor(param) {
        const args = PemData.isAsnEncoded(param) ? [param, Certificate] : [param];
        super(args[0], args[1]);
        _X509Certificate_tbs.set(this, void 0);
        _X509Certificate_serialNumber.set(this, void 0);
        _X509Certificate_subjectName.set(this, void 0);
        _X509Certificate_subject.set(this, void 0);
        _X509Certificate_issuerName.set(this, void 0);
        _X509Certificate_issuer.set(this, void 0);
        _X509Certificate_notBefore.set(this, void 0);
        _X509Certificate_notAfter.set(this, void 0);
        _X509Certificate_signatureAlgorithm.set(this, void 0);
        _X509Certificate_signature.set(this, void 0);
        _X509Certificate_extensions.set(this, void 0);
        _X509Certificate_publicKey.set(this, void 0);
        this.tag = PemConverter.CertificateTag;
    }
    onInit(_asn) {
    }
    getExtension(type) {
        for (const ext of this.extensions) {
            if (typeof type === "string") {
                if (ext.type === type) {
                    return ext;
                }
            }
            else {
                if (ext instanceof type) {
                    return ext;
                }
            }
        }
        return null;
    }
    getExtensions(type) {
        return this.extensions.filter((o) => {
            if (typeof type === "string") {
                return o.type === type;
            }
            else {
                return o instanceof type;
            }
        });
    }
    async verify(params = {}, crypto = cryptoProvider.get()) {
        let keyAlgorithm;
        let publicKey;
        const paramsKey = params.publicKey;
        try {
            if (!paramsKey) {
                keyAlgorithm = {
                    ...this.publicKey.algorithm, ...this.signatureAlgorithm,
                };
                publicKey = await this.publicKey.export(keyAlgorithm, ["verify"], crypto);
            }
            else if ("publicKey" in paramsKey) {
                keyAlgorithm = {
                    ...paramsKey.publicKey.algorithm, ...this.signatureAlgorithm,
                };
                publicKey = await paramsKey.publicKey.export(keyAlgorithm, ["verify"], crypto);
            }
            else if (paramsKey instanceof PublicKey) {
                keyAlgorithm = {
                    ...paramsKey.algorithm, ...this.signatureAlgorithm,
                };
                publicKey = await paramsKey.export(keyAlgorithm, ["verify"], crypto);
            }
            else if (buildExports.BufferSourceConverter.isBufferSource(paramsKey)) {
                const key = new PublicKey(paramsKey);
                keyAlgorithm = {
                    ...key.algorithm, ...this.signatureAlgorithm,
                };
                publicKey = await key.export(keyAlgorithm, ["verify"], crypto);
            }
            else {
                keyAlgorithm = {
                    ...paramsKey.algorithm, ...this.signatureAlgorithm,
                };
                publicKey = paramsKey;
            }
        }
        catch {
            return false;
        }
        const signatureFormatters = instance
            .resolveAll(diAsnSignatureFormatter)
            .reverse();
        let signature = null;
        for (const signatureFormatter of signatureFormatters) {
            signature = signatureFormatter.toWebSignature(keyAlgorithm, this.signature);
            if (signature) {
                break;
            }
        }
        if (!signature) {
            throw Error("Cannot convert ASN.1 signature value to WebCrypto format");
        }
        const ok = await crypto.subtle.verify(this.signatureAlgorithm, publicKey, signature, this.tbs);
        if (params.signatureOnly) {
            return ok;
        }
        else {
            const date = params.date || new Date();
            const time = date.getTime();
            return ok && this.notBefore.getTime() < time && time < this.notAfter.getTime();
        }
    }
    async getThumbprint(...args) {
        let crypto;
        let algorithm = "SHA-1";
        if (args[0]) {
            if (!args[0].subtle) {
                algorithm = args[0] || algorithm;
                crypto = args[1];
            }
            else {
                crypto = args[0];
            }
        }
        crypto !== null && crypto !== void 0 ? crypto : (crypto = cryptoProvider.get());
        return await crypto.subtle.digest(algorithm, this.rawData);
    }
    async isSelfSigned(crypto = cryptoProvider.get()) {
        return this.subject === this.issuer && await this.verify({ signatureOnly: true }, crypto);
    }
    toTextObject() {
        const obj = this.toTextObjectEmpty();
        const cert = AsnConvert.parse(this.rawData, Certificate);
        const tbs = cert.tbsCertificate;
        const data = new TextObject("", {
            Version: `${Version$1[tbs.version]} (${tbs.version})`,
            "Serial Number": tbs.serialNumber,
            "Signature Algorithm": TextConverter.serializeAlgorithm(tbs.signature),
            Issuer: this.issuer,
            Validity: new TextObject("", {
                "Not Before": tbs.validity.notBefore.getTime(),
                "Not After": tbs.validity.notAfter.getTime(),
            }),
            Subject: this.subject,
            "Subject Public Key Info": this.publicKey,
        });
        if (tbs.issuerUniqueID) {
            data["Issuer Unique ID"] = tbs.issuerUniqueID;
        }
        if (tbs.subjectUniqueID) {
            data["Subject Unique ID"] = tbs.subjectUniqueID;
        }
        if (this.extensions.length) {
            const extensions = new TextObject("");
            for (const ext of this.extensions) {
                const extObj = ext.toTextObject();
                extensions[extObj[TextObject.NAME]] = extObj;
            }
            data["Extensions"] = extensions;
        }
        obj["Data"] = data;
        obj["Signature"] = new TextObject("", {
            Algorithm: TextConverter.serializeAlgorithm(cert.signatureAlgorithm),
            "": cert.signatureValue,
        });
        return obj;
    }
}
_X509Certificate_tbs = new WeakMap(), _X509Certificate_serialNumber = new WeakMap(), _X509Certificate_subjectName = new WeakMap(), _X509Certificate_subject = new WeakMap(), _X509Certificate_issuerName = new WeakMap(), _X509Certificate_issuer = new WeakMap(), _X509Certificate_notBefore = new WeakMap(), _X509Certificate_notAfter = new WeakMap(), _X509Certificate_signatureAlgorithm = new WeakMap(), _X509Certificate_signature = new WeakMap(), _X509Certificate_extensions = new WeakMap(), _X509Certificate_publicKey = new WeakMap();
X509Certificate.NAME = "Certificate";

class X509Certificates extends Array {
    constructor(param) {
        super();
        if (PemData.isAsnEncoded(param)) {
            this.import(param);
        }
        else if (param instanceof X509Certificate) {
            this.push(param);
        }
        else if (Array.isArray(param)) {
            for (const item of param) {
                this.push(item);
            }
        }
    }
    export(format) {
        const signedData = new SignedData();
        signedData.version = 1;
        signedData.encapContentInfo.eContentType = id_data;
        signedData.encapContentInfo.eContent = new EncapsulatedContent({ single: new OctetString() });
        signedData.certificates = new CertificateSet(this.map((o) => new CertificateChoices({ certificate: AsnConvert.parse(o.rawData, Certificate) })));
        const cms = new ContentInfo({
            contentType: id_signedData,
            content: AsnConvert.serialize(signedData),
        });
        const raw = AsnConvert.serialize(cms);
        if (format === "raw") {
            return raw;
        }
        return this.toString(format);
    }
    import(data) {
        const raw = PemData.toArrayBuffer(data);
        const cms = AsnConvert.parse(raw, ContentInfo);
        if (cms.contentType !== id_signedData) {
            throw new TypeError("Cannot parse CMS package. Incoming data is not a SignedData object.");
        }
        const signedData = AsnConvert.parse(cms.content, SignedData);
        this.clear();
        for (const item of signedData.certificates || []) {
            if (item.certificate) {
                this.push(new X509Certificate(item.certificate));
            }
        }
    }
    clear() {
        while (this.pop()) {
        }
    }
    toString(format = "pem") {
        const raw = this.export("raw");
        switch (format) {
            case "pem":
                return PemConverter.encode(raw, "CMS");
            case "pem-chain":
                return this
                    .map((o) => o.toString("pem"))
                    .join("\n");
            case "asn":
                return AsnConvert.toString(raw);
            case "hex":
                return buildExports.Convert.ToHex(raw);
            case "base64":
                return buildExports.Convert.ToBase64(raw);
            case "base64url":
                return buildExports.Convert.ToBase64Url(raw);
            case "text":
                return TextConverter.serialize(this.toTextObject());
            default:
                throw TypeError("Argument 'format' is unsupported value");
        }
    }
    toTextObject() {
        const contentInfo = AsnConvert.parse(this.export("raw"), ContentInfo);
        const signedData = AsnConvert.parse(contentInfo.content, SignedData);
        const obj = new TextObject("X509Certificates", {
            "Content Type": OidSerializer.toString(contentInfo.contentType),
            Content: new TextObject("", {
                Version: `${CMSVersion[signedData.version]} (${signedData.version})`,
                Certificates: new TextObject("", { Certificate: this.map((o) => o.toTextObject()) }),
            }),
        });
        return obj;
    }
}

class X509ChainBuilder {
    constructor(params = {}) {
        this.certificates = [];
        if (params.certificates) {
            this.certificates = params.certificates;
        }
    }
    async build(cert, crypto = cryptoProvider.get()) {
        const chain = new X509Certificates(cert);
        let current = cert;
        while (current = await this.findIssuer(current, crypto)) {
            const thumbprint = await current.getThumbprint(crypto);
            for (const item of chain) {
                const thumbprint2 = await item.getThumbprint(crypto);
                if (buildExports.isEqual(thumbprint, thumbprint2)) {
                    throw new Error("Cannot build a certificate chain. Circular dependency.");
                }
            }
            chain.push(current);
        }
        return chain;
    }
    async findIssuer(cert, crypto = cryptoProvider.get()) {
        if (!await cert.isSelfSigned(crypto)) {
            const akiExt = cert.getExtension(id_ce_authorityKeyIdentifier);
            for (const item of this.certificates) {
                if (item.subject !== cert.issuer) {
                    continue;
                }
                if (akiExt) {
                    if (akiExt.keyId) {
                        const skiExt = item.getExtension(id_ce_subjectKeyIdentifier);
                        if (skiExt && skiExt.keyId !== akiExt.keyId) {
                            continue;
                        }
                    }
                    else if (akiExt.certId) {
                        const sanExt = item.getExtension(id_ce_subjectAltName);
                        if (sanExt
                            && !(akiExt.certId.serialNumber === item.serialNumber && buildExports.isEqual(AsnConvert.serialize(akiExt.certId.name), AsnConvert.serialize(sanExt)))) {
                            continue;
                        }
                    }
                }
                try {
                    const algorithm = {
                        ...item.publicKey.algorithm, ...cert.signatureAlgorithm,
                    };
                    const publicKey = await item.publicKey.export(algorithm, ["verify"], crypto);
                    const ok = await cert.verify({
                        publicKey, signatureOnly: true,
                    }, crypto);
                    if (!ok) {
                        continue;
                    }
                }
                catch {
                    continue;
                }
                return item;
            }
        }
        return null;
    }
}

function generateCertificateSerialNumber(input, crypto = cryptoProvider.get()) {
    const inputView = buildExports.BufferSourceConverter.toUint8Array(buildExports.Convert.FromHex(input || ""));
    let serialNumber = inputView && inputView.length && inputView.some((o) => o > 0)
        ? new Uint8Array(inputView)
        : undefined;
    if (!serialNumber) {
        serialNumber = crypto.getRandomValues(new Uint8Array(16));
    }
    let firstNonZero = 0;
    while (firstNonZero < serialNumber.length - 1 && serialNumber[firstNonZero] === 0) {
        firstNonZero++;
    }
    serialNumber = serialNumber.slice(firstNonZero);
    if (serialNumber[0] > 0x7F) {
        const newSerialNumber = new Uint8Array(serialNumber.length + 1);
        newSerialNumber[0] = 0x00;
        newSerialNumber.set(serialNumber, 1);
        serialNumber = newSerialNumber;
    }
    return serialNumber.buffer;
}

class X509CertificateGenerator {
    static async createSelfSigned(params, crypto = cryptoProvider.get()) {
        if (!params.keys.privateKey) {
            throw new Error("Bad field 'keys' in 'params' argument. 'privateKey' is empty");
        }
        if (!params.keys.publicKey) {
            throw new Error("Bad field 'keys' in 'params' argument. 'publicKey' is empty");
        }
        return this.create({
            serialNumber: params.serialNumber,
            subject: params.name,
            issuer: params.name,
            notBefore: params.notBefore,
            notAfter: params.notAfter,
            publicKey: params.keys.publicKey,
            signingKey: params.keys.privateKey,
            signingAlgorithm: params.signingAlgorithm,
            extensions: params.extensions,
        }, crypto);
    }
    static async create(params, crypto = cryptoProvider.get()) {
        var _a;
        let spki;
        if (params.publicKey instanceof PublicKey) {
            spki = params.publicKey.rawData;
        }
        else if ("publicKey" in params.publicKey) {
            spki = params.publicKey.publicKey.rawData;
        }
        else if (buildExports.BufferSourceConverter.isBufferSource(params.publicKey)) {
            spki = params.publicKey;
        }
        else {
            spki = await crypto.subtle.exportKey("spki", params.publicKey);
        }
        const serialNumber = generateCertificateSerialNumber(params.serialNumber, crypto);
        const notBefore = params.notBefore || new Date();
        const notAfter = params.notAfter || new Date(notBefore.getTime() + 31536000000);
        const asnX509 = new Certificate({
            tbsCertificate: new TBSCertificate({
                version: Version$1.v3,
                serialNumber,
                validity: new Validity({
                    notBefore,
                    notAfter,
                }),
                extensions: new Extensions(((_a = params.extensions) === null || _a === void 0 ? void 0 : _a.map((o) => AsnConvert.parse(o.rawData, Extension$1))) || []),
                subjectPublicKeyInfo: AsnConvert.parse(spki, SubjectPublicKeyInfo),
            }),
        });
        if (params.subject) {
            const name = params.subject instanceof Name
                ? params.subject
                : new Name(params.subject);
            asnX509.tbsCertificate.subject = AsnConvert.parse(name.toArrayBuffer(), Name$1);
        }
        if (params.issuer) {
            const name = params.issuer instanceof Name
                ? params.issuer
                : new Name(params.issuer);
            asnX509.tbsCertificate.issuer = AsnConvert.parse(name.toArrayBuffer(), Name$1);
        }
        const defaultSigningAlgorithm = { hash: "SHA-256" };
        const signatureAlgorithm = ("signingKey" in params)
            ? {
                ...defaultSigningAlgorithm, ...params.signingAlgorithm, ...params.signingKey.algorithm,
            }
            : {
                ...defaultSigningAlgorithm, ...params.signingAlgorithm,
            };
        const algProv = instance.resolve(diAlgorithmProvider);
        asnX509.tbsCertificate.signature = asnX509.signatureAlgorithm = algProv
            .toAsnAlgorithm(signatureAlgorithm);
        const tbs = AsnConvert.serialize(asnX509.tbsCertificate);
        const signatureValue = ("signingKey" in params)
            ? await crypto.subtle.sign(signatureAlgorithm, params.signingKey, tbs)
            : params.signature;
        const signatureFormatters = instance
            .resolveAll(diAsnSignatureFormatter)
            .reverse();
        let asnSignature = null;
        for (const signatureFormatter of signatureFormatters) {
            asnSignature = signatureFormatter.toAsnSignature(signatureAlgorithm, signatureValue);
            if (asnSignature) {
                break;
            }
        }
        if (!asnSignature) {
            throw Error("Cannot convert ASN.1 signature value to WebCrypto format");
        }
        asnX509.signatureValue = asnSignature;
        return new X509Certificate(AsnConvert.serialize(asnX509));
    }
}

var _X509CrlEntry_serialNumber, _X509CrlEntry_revocationDate, _X509CrlEntry_reason, _X509CrlEntry_invalidity, _X509CrlEntry_extensions;
var X509CrlReason;
(function (X509CrlReason) {
    X509CrlReason[X509CrlReason["unspecified"] = 0] = "unspecified";
    X509CrlReason[X509CrlReason["keyCompromise"] = 1] = "keyCompromise";
    X509CrlReason[X509CrlReason["cACompromise"] = 2] = "cACompromise";
    X509CrlReason[X509CrlReason["affiliationChanged"] = 3] = "affiliationChanged";
    X509CrlReason[X509CrlReason["superseded"] = 4] = "superseded";
    X509CrlReason[X509CrlReason["cessationOfOperation"] = 5] = "cessationOfOperation";
    X509CrlReason[X509CrlReason["certificateHold"] = 6] = "certificateHold";
    X509CrlReason[X509CrlReason["removeFromCRL"] = 8] = "removeFromCRL";
    X509CrlReason[X509CrlReason["privilegeWithdrawn"] = 9] = "privilegeWithdrawn";
    X509CrlReason[X509CrlReason["aACompromise"] = 10] = "aACompromise";
})(X509CrlReason || (X509CrlReason = {}));
class X509CrlEntry extends AsnData {
    get serialNumber() {
        if (!__classPrivateFieldGet(this, _X509CrlEntry_serialNumber, "f")) {
            __classPrivateFieldSet(this, _X509CrlEntry_serialNumber, buildExports.Convert.ToHex(this.asn.userCertificate), "f");
        }
        return __classPrivateFieldGet(this, _X509CrlEntry_serialNumber, "f");
    }
    get revocationDate() {
        if (!__classPrivateFieldGet(this, _X509CrlEntry_revocationDate, "f")) {
            __classPrivateFieldSet(this, _X509CrlEntry_revocationDate, this.asn.revocationDate.getTime(), "f");
        }
        return __classPrivateFieldGet(this, _X509CrlEntry_revocationDate, "f");
    }
    get reason() {
        if (__classPrivateFieldGet(this, _X509CrlEntry_reason, "f") === undefined) {
            void this.extensions;
        }
        return __classPrivateFieldGet(this, _X509CrlEntry_reason, "f");
    }
    get invalidity() {
        if (__classPrivateFieldGet(this, _X509CrlEntry_invalidity, "f") === undefined) {
            void this.extensions;
        }
        return __classPrivateFieldGet(this, _X509CrlEntry_invalidity, "f");
    }
    get extensions() {
        if (!__classPrivateFieldGet(this, _X509CrlEntry_extensions, "f")) {
            __classPrivateFieldSet(this, _X509CrlEntry_extensions, [], "f");
            if (this.asn.crlEntryExtensions) {
                __classPrivateFieldSet(this, _X509CrlEntry_extensions, this.asn.crlEntryExtensions.map((o) => {
                    const extension = ExtensionFactory.create(AsnConvert.serialize(o));
                    switch (extension.type) {
                        case id_ce_cRLReasons:
                            if (__classPrivateFieldGet(this, _X509CrlEntry_reason, "f") === undefined) {
                                __classPrivateFieldSet(this, _X509CrlEntry_reason, AsnConvert
                                    .parse(extension.value, CRLReason).reason, "f");
                            }
                            break;
                        case id_ce_invalidityDate:
                            if (__classPrivateFieldGet(this, _X509CrlEntry_invalidity, "f") === undefined) {
                                __classPrivateFieldSet(this, _X509CrlEntry_invalidity, AsnConvert.parse(extension.value, InvalidityDate).value, "f");
                            }
                            break;
                    }
                    return extension;
                }), "f");
            }
        }
        return __classPrivateFieldGet(this, _X509CrlEntry_extensions, "f");
    }
    constructor(...args) {
        let raw;
        if (buildExports.BufferSourceConverter.isBufferSource(args[0])) {
            raw = buildExports.BufferSourceConverter.toArrayBuffer(args[0]);
        }
        else if (typeof args[0] === "string") {
            raw = AsnConvert.serialize(new RevokedCertificate({
                userCertificate: generateCertificateSerialNumber(args[0]),
                revocationDate: new Time(args[1]),
                crlEntryExtensions: args[2],
            }));
        }
        else if (args[0] instanceof RevokedCertificate) {
            raw = args[0];
        }
        if (!raw) {
            throw new TypeError("Cannot create X509CrlEntry instance. Wrong constructor arguments.");
        }
        super(raw, RevokedCertificate);
        _X509CrlEntry_serialNumber.set(this, void 0);
        _X509CrlEntry_revocationDate.set(this, void 0);
        _X509CrlEntry_reason.set(this, void 0);
        _X509CrlEntry_invalidity.set(this, void 0);
        _X509CrlEntry_extensions.set(this, void 0);
    }
    onInit(_asn) {
    }
}
_X509CrlEntry_serialNumber = new WeakMap(), _X509CrlEntry_revocationDate = new WeakMap(), _X509CrlEntry_reason = new WeakMap(), _X509CrlEntry_invalidity = new WeakMap(), _X509CrlEntry_extensions = new WeakMap();

var _X509Crl_tbs, _X509Crl_signatureAlgorithm, _X509Crl_issuerName, _X509Crl_thisUpdate, _X509Crl_nextUpdate, _X509Crl_entries, _X509Crl_extensions;
class X509Crl extends PemData {
    get version() {
        return this.asn.tbsCertList.version;
    }
    get signatureAlgorithm() {
        if (!__classPrivateFieldGet(this, _X509Crl_signatureAlgorithm, "f")) {
            const algProv = instance.resolve(diAlgorithmProvider);
            __classPrivateFieldSet(this, _X509Crl_signatureAlgorithm, algProv
                .toWebAlgorithm(this.asn.signatureAlgorithm), "f");
        }
        return __classPrivateFieldGet(this, _X509Crl_signatureAlgorithm, "f");
    }
    get signature() {
        return this.asn.signature;
    }
    get issuer() {
        return this.issuerName.toString();
    }
    get issuerName() {
        if (!__classPrivateFieldGet(this, _X509Crl_issuerName, "f")) {
            __classPrivateFieldSet(this, _X509Crl_issuerName, new Name(this.asn.tbsCertList.issuer), "f");
        }
        return __classPrivateFieldGet(this, _X509Crl_issuerName, "f");
    }
    get thisUpdate() {
        if (!__classPrivateFieldGet(this, _X509Crl_thisUpdate, "f")) {
            const thisUpdate = this.asn.tbsCertList.thisUpdate.getTime();
            if (!thisUpdate) {
                throw new Error("Cannot get 'thisUpdate' value");
            }
            __classPrivateFieldSet(this, _X509Crl_thisUpdate, thisUpdate, "f");
        }
        return __classPrivateFieldGet(this, _X509Crl_thisUpdate, "f");
    }
    get nextUpdate() {
        var _a;
        if (__classPrivateFieldGet(this, _X509Crl_nextUpdate, "f") === undefined) {
            __classPrivateFieldSet(this, _X509Crl_nextUpdate, ((_a = this.asn.tbsCertList.nextUpdate) === null || _a === void 0 ? void 0 : _a.getTime()) || undefined, "f");
        }
        return __classPrivateFieldGet(this, _X509Crl_nextUpdate, "f");
    }
    get entries() {
        var _a;
        if (!__classPrivateFieldGet(this, _X509Crl_entries, "f")) {
            __classPrivateFieldSet(this, _X509Crl_entries, ((_a = this.asn.tbsCertList
                .revokedCertificates) === null || _a === void 0 ? void 0 : _a.map((o) => new X509CrlEntry(o))) || [], "f");
        }
        return __classPrivateFieldGet(this, _X509Crl_entries, "f");
    }
    get extensions() {
        if (!__classPrivateFieldGet(this, _X509Crl_extensions, "f")) {
            __classPrivateFieldSet(this, _X509Crl_extensions, [], "f");
            if (this.asn.tbsCertList.crlExtensions) {
                __classPrivateFieldSet(this, _X509Crl_extensions, this.asn.tbsCertList.crlExtensions.map((o) => ExtensionFactory.create(AsnConvert.serialize(o))), "f");
            }
        }
        return __classPrivateFieldGet(this, _X509Crl_extensions, "f");
    }
    get tbs() {
        if (!__classPrivateFieldGet(this, _X509Crl_tbs, "f")) {
            __classPrivateFieldSet(this, _X509Crl_tbs, this.asn.tbsCertListRaw || AsnConvert.serialize(this.asn.tbsCertList), "f");
        }
        return __classPrivateFieldGet(this, _X509Crl_tbs, "f");
    }
    get tbsCertListSignatureAlgorithm() {
        return this.asn.tbsCertList.signature;
    }
    get certListSignatureAlgorithm() {
        return this.asn.signatureAlgorithm;
    }
    constructor(param) {
        super(param, PemData.isAsnEncoded(param) ? CertificateList : undefined);
        this.tag = PemConverter.CrlTag;
        _X509Crl_tbs.set(this, void 0);
        _X509Crl_signatureAlgorithm.set(this, void 0);
        _X509Crl_issuerName.set(this, void 0);
        _X509Crl_thisUpdate.set(this, void 0);
        _X509Crl_nextUpdate.set(this, void 0);
        _X509Crl_entries.set(this, void 0);
        _X509Crl_extensions.set(this, void 0);
    }
    onInit(_asn) {
    }
    getExtension(type) {
        for (const ext of this.extensions) {
            if (typeof type === "string") {
                if (ext.type === type) {
                    return ext;
                }
            }
            else {
                if (ext instanceof type) {
                    return ext;
                }
            }
        }
        return null;
    }
    getExtensions(type) {
        return this.extensions.filter((o) => {
            if (typeof type === "string") {
                return o.type === type;
            }
            else {
                return o instanceof type;
            }
        });
    }
    async verify(params, crypto = cryptoProvider.get()) {
        if (!this.certListSignatureAlgorithm.isEqual(this.tbsCertListSignatureAlgorithm)) {
            throw new Error("algorithm identifier in the sequence tbsCertList and CertificateList mismatch");
        }
        let keyAlgorithm;
        let publicKey;
        const paramsKey = params.publicKey;
        try {
            if (paramsKey instanceof X509Certificate) {
                keyAlgorithm = {
                    ...paramsKey.publicKey.algorithm,
                    ...paramsKey.signatureAlgorithm,
                };
                publicKey = await paramsKey.publicKey.export(keyAlgorithm, ["verify"]);
            }
            else if (paramsKey instanceof PublicKey) {
                keyAlgorithm = {
                    ...paramsKey.algorithm, ...this.signatureAlgorithm,
                };
                publicKey = await paramsKey.export(keyAlgorithm, ["verify"]);
            }
            else {
                keyAlgorithm = {
                    ...paramsKey.algorithm, ...this.signatureAlgorithm,
                };
                publicKey = paramsKey;
            }
        }
        catch {
            return false;
        }
        const signatureFormatters = instance
            .resolveAll(diAsnSignatureFormatter)
            .reverse();
        let signature = null;
        for (const signatureFormatter of signatureFormatters) {
            signature = signatureFormatter.toWebSignature(keyAlgorithm, this.signature);
            if (signature) {
                break;
            }
        }
        if (!signature) {
            throw Error("Cannot convert ASN.1 signature value to WebCrypto format");
        }
        return await crypto.subtle.verify(this.signatureAlgorithm, publicKey, signature, this.tbs);
    }
    async getThumbprint(...args) {
        let crypto;
        let algorithm = "SHA-1";
        if (args[0]) {
            if (!args[0].subtle) {
                algorithm = args[0] || algorithm;
                crypto = args[1];
            }
            else {
                crypto = args[0];
            }
        }
        crypto !== null && crypto !== void 0 ? crypto : (crypto = cryptoProvider.get());
        return await crypto.subtle.digest(algorithm, this.rawData);
    }
    findRevoked(certOrSerialNumber) {
        const serialNumber = typeof certOrSerialNumber === "string" ? certOrSerialNumber : certOrSerialNumber.serialNumber;
        const serialBuffer = generateCertificateSerialNumber(serialNumber);
        for (const revoked of this.asn.tbsCertList.revokedCertificates || []) {
            if (buildExports.BufferSourceConverter.isEqual(revoked.userCertificate, serialBuffer)) {
                return new X509CrlEntry(AsnConvert.serialize(revoked));
            }
        }
        return null;
    }
}
_X509Crl_tbs = new WeakMap(), _X509Crl_signatureAlgorithm = new WeakMap(), _X509Crl_issuerName = new WeakMap(), _X509Crl_thisUpdate = new WeakMap(), _X509Crl_nextUpdate = new WeakMap(), _X509Crl_entries = new WeakMap(), _X509Crl_extensions = new WeakMap();

class X509CrlGenerator {
    static async create(params, crypto = cryptoProvider.get()) {
        var _a;
        const name = params.issuer instanceof Name
            ? params.issuer
            : new Name(params.issuer);
        const asnX509Crl = new CertificateList({
            tbsCertList: new TBSCertList({
                version: Version$1.v2,
                issuer: AsnConvert.parse(name.toArrayBuffer(), Name$1),
                thisUpdate: new Time(params.thisUpdate || new Date()),
            }),
        });
        if (params.nextUpdate) {
            asnX509Crl.tbsCertList.nextUpdate = new Time(params.nextUpdate);
        }
        if (params.extensions && params.extensions.length) {
            asnX509Crl.tbsCertList.crlExtensions = new Extensions(params.extensions.map((o) => AsnConvert.parse(o.rawData, Extension$1)) || []);
        }
        if (params.entries && params.entries.length) {
            asnX509Crl.tbsCertList.revokedCertificates = [];
            for (const entry of params.entries) {
                const userCertificate = PemData.toArrayBuffer(entry.serialNumber);
                const index = asnX509Crl.tbsCertList.revokedCertificates
                    .findIndex((cert) => buildExports.isEqual(cert.userCertificate, userCertificate));
                if (index > -1) {
                    throw new Error(`Certificate serial number ${entry.serialNumber} already exists in tbsCertList`);
                }
                const revokedCert = new RevokedCertificate({
                    userCertificate: userCertificate,
                    revocationDate: new Time(entry.revocationDate || new Date()),
                });
                if ("extensions" in entry && ((_a = entry.extensions) === null || _a === void 0 ? void 0 : _a.length)) {
                    revokedCert.crlEntryExtensions = entry.extensions.map((o) => (AsnConvert.parse(o.rawData, Extension$1)));
                }
                else {
                    revokedCert.crlEntryExtensions = [];
                }
                if (!(entry instanceof X509CrlEntry)) {
                    if (entry.reason) {
                        revokedCert.crlEntryExtensions.push(new Extension$1({
                            extnID: id_ce_cRLReasons,
                            critical: false,
                            extnValue: new OctetString(AsnConvert.serialize(new CRLReason(entry.reason))),
                        }));
                    }
                    if (entry.invalidity) {
                        revokedCert.crlEntryExtensions.push(new Extension$1({
                            extnID: id_ce_invalidityDate,
                            critical: false,
                            extnValue: new OctetString(AsnConvert.serialize(new InvalidityDate(entry.invalidity))),
                        }));
                    }
                    if (entry.issuer) {
                        const name = params.issuer instanceof Name
                            ? params.issuer
                            : new Name(params.issuer);
                        revokedCert.crlEntryExtensions.push(new Extension$1({
                            extnID: id_ce_certificateIssuer,
                            critical: false,
                            extnValue: new OctetString(AsnConvert.serialize(AsnConvert.parse(name.toArrayBuffer(), Name$1))),
                        }));
                    }
                }
                asnX509Crl.tbsCertList.revokedCertificates.push(revokedCert);
            }
        }
        const signingAlgorithm = {
            ...params.signingAlgorithm, ...params.signingKey.algorithm,
        };
        const algProv = instance.resolve(diAlgorithmProvider);
        asnX509Crl.tbsCertList.signature = asnX509Crl.signatureAlgorithm = algProv
            .toAsnAlgorithm(signingAlgorithm);
        const tbs = AsnConvert.serialize(asnX509Crl.tbsCertList);
        const signature = await crypto.subtle.sign(signingAlgorithm, params.signingKey, tbs);
        const signatureFormatters = instance
            .resolveAll(diAsnSignatureFormatter)
            .reverse();
        let asnSignature = null;
        for (const signatureFormatter of signatureFormatters) {
            asnSignature = signatureFormatter.toAsnSignature(signingAlgorithm, signature);
            if (asnSignature) {
                break;
            }
        }
        if (!asnSignature) {
            throw Error("Cannot convert ASN.1 signature value to WebCrypto format");
        }
        asnX509Crl.signature = asnSignature;
        return new X509Crl(AsnConvert.serialize(asnX509Crl));
    }
}

ExtensionFactory.register(id_ce_basicConstraints, BasicConstraintsExtension);
ExtensionFactory.register(id_ce_extKeyUsage, ExtendedKeyUsageExtension);
ExtensionFactory.register(id_ce_keyUsage, KeyUsagesExtension);
ExtensionFactory.register(id_ce_subjectKeyIdentifier, SubjectKeyIdentifierExtension);
ExtensionFactory.register(id_ce_authorityKeyIdentifier, AuthorityKeyIdentifierExtension);
ExtensionFactory.register(id_ce_subjectAltName, SubjectAlternativeNameExtension);
ExtensionFactory.register(id_ce_cRLDistributionPoints, CRLDistributionPointsExtension);
ExtensionFactory.register(id_pe_authorityInfoAccess, AuthorityInfoAccessExtension);
ExtensionFactory.register(id_ce_issuerAltName, IssuerAlternativeNameExtension);
AttributeFactory.register(id_pkcs9_at_challengePassword, ChallengePasswordAttribute);
AttributeFactory.register(id_pkcs9_at_extensionRequest, ExtensionsAttribute);
instance.registerSingleton(diAsnSignatureFormatter, AsnDefaultSignatureFormatter);
instance.registerSingleton(diAsnSignatureFormatter, AsnEcSignatureFormatter);
AsnEcSignatureFormatter.namedCurveSize.set("P-256", 32);
AsnEcSignatureFormatter.namedCurveSize.set("K-256", 32);
AsnEcSignatureFormatter.namedCurveSize.set("P-384", 48);
AsnEcSignatureFormatter.namedCurveSize.set("P-521", 66);

var x509_es = /*#__PURE__*/Object.freeze({
	__proto__: null,
	AlgorithmProvider: AlgorithmProvider,
	AsnData: AsnData,
	AsnDefaultSignatureFormatter: AsnDefaultSignatureFormatter,
	AsnEcSignatureFormatter: AsnEcSignatureFormatter,
	Attribute: Attribute,
	AttributeFactory: AttributeFactory,
	AuthorityInfoAccessExtension: AuthorityInfoAccessExtension,
	AuthorityKeyIdentifierExtension: AuthorityKeyIdentifierExtension,
	BasicConstraintsExtension: BasicConstraintsExtension,
	CRLDistributionPointsExtension: CRLDistributionPointsExtension,
	CertificatePolicyExtension: CertificatePolicyExtension,
	ChallengePasswordAttribute: ChallengePasswordAttribute,
	CryptoProvider: CryptoProvider,
	DN: DN,
	DNS: DNS,
	DefaultAlgorithmSerializer: DefaultAlgorithmSerializer,
	EMAIL: EMAIL,
	get EcAlgorithm () { return EcAlgorithm; },
	get EdAlgorithm () { return EdAlgorithm; },
	get ExtendedKeyUsage () { return ExtendedKeyUsage; },
	ExtendedKeyUsageExtension: ExtendedKeyUsageExtension,
	Extension: Extension,
	ExtensionFactory: ExtensionFactory,
	ExtensionsAttribute: ExtensionsAttribute,
	GUID: GUID,
	GeneralName: GeneralName,
	GeneralNames: GeneralNames,
	IP: IP,
	IssuerAlternativeNameExtension: IssuerAlternativeNameExtension,
	get KeyUsageFlags () { return KeyUsageFlags; },
	KeyUsagesExtension: KeyUsagesExtension,
	Name: Name,
	NameIdentifier: NameIdentifier,
	OidSerializer: OidSerializer,
	PemConverter: PemConverter,
	PemData: PemData,
	Pkcs10CertificateRequest: Pkcs10CertificateRequest,
	Pkcs10CertificateRequestGenerator: Pkcs10CertificateRequestGenerator,
	PublicKey: PublicKey,
	REGISTERED_ID: REGISTERED_ID,
	get RsaAlgorithm () { return RsaAlgorithm; },
	get ShaAlgorithm () { return ShaAlgorithm; },
	SubjectAlternativeNameExtension: SubjectAlternativeNameExtension,
	SubjectKeyIdentifierExtension: SubjectKeyIdentifierExtension,
	TextConverter: TextConverter,
	TextObject: TextObject,
	UPN: UPN,
	URL: URL,
	X509Certificate: X509Certificate,
	X509CertificateGenerator: X509CertificateGenerator,
	X509Certificates: X509Certificates,
	X509ChainBuilder: X509ChainBuilder,
	X509Crl: X509Crl,
	X509CrlEntry: X509CrlEntry,
	X509CrlGenerator: X509CrlGenerator,
	get X509CrlReason () { return X509CrlReason; },
	cryptoProvider: cryptoProvider,
	diAlgorithm: diAlgorithm,
	diAlgorithmProvider: diAlgorithmProvider,
	diAsnSignatureFormatter: diAsnSignatureFormatter,
	idEd25519: idEd25519,
	idEd448: idEd448,
	idX25519: idX25519,
	idX448: idX448
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(x509_es);

var hasRequiredSelfsigned;

function requireSelfsigned () {
	if (hasRequiredSelfsigned) return selfsigned;
	hasRequiredSelfsigned = 1;
	const { X509CertificateGenerator, X509Certificate, cryptoProvider,  X509ChainBuilder, BasicConstraintsExtension, KeyUsagesExtension, KeyUsageFlags, ExtendedKeyUsageExtension, ExtendedKeyUsage, SubjectAlternativeNameExtension, GeneralName } = require$$0;
	const nodeCrypto = require$$1__default["default"];

	// Use Node.js native webcrypto
	const crypto = nodeCrypto.webcrypto;

	// Patch global CryptoProvider to use Node.js crypto
	cryptoProvider.set(crypto);

	// a hexString is considered negative if it's most significant bit is 1
	// because serial numbers use ones' complement notation
	// this RFC in section 4.1.2.2 requires serial numbers to be positive
	// http://www.ietf.org/rfc/rfc5280.txt
	function toPositiveHex(hexString) {
	  var mostSiginficativeHexAsInt = parseInt(hexString[0], 16);
	  if (mostSiginficativeHexAsInt < 8) {
	    return hexString;
	  }

	  mostSiginficativeHexAsInt -= 8;
	  return mostSiginficativeHexAsInt.toString() + hexString.substring(1);
	}

	function getAlgorithmName(key) {
	  switch (key) {
	    case "sha256":
	      return "SHA-256";
	    case 'sha384':
	      return "SHA-384";
	    case 'sha512':
	      return "SHA-512";
	    default:
	      return "SHA-1";
	  }
	}

	function getSigningAlgorithm(hashKey, keyType) {
	  const hashAlg = getAlgorithmName(hashKey);
	  if (keyType === 'ec') {
	    return {
	      name: "ECDSA",
	      hash: hashAlg
	    };
	  }
	  return {
	    name: "RSASSA-PKCS1-v1_5",
	    hash: hashAlg
	  };
	}

	function getKeyAlgorithm(options) {
	  const keyType = options.keyType || 'rsa';
	  const hashAlg = getAlgorithmName(options.algorithm || 'sha1');

	  if (keyType === 'ec') {
	    const curve = options.curve || 'P-256';
	    return {
	      name: "ECDSA",
	      namedCurve: curve
	    };
	  }

	  return {
	    name: "RSASSA-PKCS1-v1_5",
	    modulusLength: options.keySize || 2048,
	    publicExponent: new Uint8Array([1, 0, 1]),
	    hash: hashAlg
	  };
	}

	// Build extensions array from options or use defaults
	// Supports the old node-forge extension format for backwards compatibility
	function buildExtensions(userExtensions, commonName) {
	  if (!userExtensions || userExtensions.length === 0) {
	    // Default extensions
	    return [
	      new BasicConstraintsExtension(false, undefined, true),
	      new KeyUsagesExtension(KeyUsageFlags.digitalSignature | KeyUsageFlags.keyEncipherment, true),
	      new ExtendedKeyUsageExtension([ExtendedKeyUsage.serverAuth, ExtendedKeyUsage.clientAuth], false),
	      new SubjectAlternativeNameExtension([
	        { type: 'dns', value: commonName },
	        ...(commonName === 'localhost' ? [{ type: 'ip', value: '127.0.0.1' }] : [])
	      ], false)
	    ];
	  }

	  // Convert user extensions from node-forge format to @peculiar/x509 format
	  const extensions = [];

	  for (const ext of userExtensions) {
	    const critical = ext.critical || false;

	    switch (ext.name) {
	      case 'basicConstraints':
	        extensions.push(new BasicConstraintsExtension(
	          ext.cA || false,
	          ext.pathLenConstraint,
	          critical
	        ));
	        break;

	      case 'keyUsage':
	        let flags = 0;
	        if (ext.digitalSignature) flags |= KeyUsageFlags.digitalSignature;
	        if (ext.nonRepudiation || ext.contentCommitment) flags |= KeyUsageFlags.nonRepudiation;
	        if (ext.keyEncipherment) flags |= KeyUsageFlags.keyEncipherment;
	        if (ext.dataEncipherment) flags |= KeyUsageFlags.dataEncipherment;
	        if (ext.keyAgreement) flags |= KeyUsageFlags.keyAgreement;
	        if (ext.keyCertSign) flags |= KeyUsageFlags.keyCertSign;
	        if (ext.cRLSign) flags |= KeyUsageFlags.cRLSign;
	        if (ext.encipherOnly) flags |= KeyUsageFlags.encipherOnly;
	        if (ext.decipherOnly) flags |= KeyUsageFlags.decipherOnly;
	        extensions.push(new KeyUsagesExtension(flags, critical));
	        break;

	      case 'extKeyUsage':
	        const usages = [];
	        if (ext.serverAuth) usages.push(ExtendedKeyUsage.serverAuth);
	        if (ext.clientAuth) usages.push(ExtendedKeyUsage.clientAuth);
	        if (ext.codeSigning) usages.push(ExtendedKeyUsage.codeSigning);
	        if (ext.emailProtection) usages.push(ExtendedKeyUsage.emailProtection);
	        if (ext.timeStamping) usages.push(ExtendedKeyUsage.timeStamping);
	        extensions.push(new ExtendedKeyUsageExtension(usages, critical));
	        break;

	      case 'subjectAltName':
	        const altNames = (ext.altNames || []).map(alt => {
	          // node-forge type values:
	          // 1 = email (rfc822Name)
	          // 2 = DNS
	          // 6 = URI
	          // 7 = IP
	          switch (alt.type) {
	            case 1: // email
	              return { type: 'email', value: alt.value };
	            case 2: // DNS
	              return { type: 'dns', value: alt.value };
	            case 6: // URI
	              return { type: 'url', value: alt.value };
	            case 7: // IP
	              return { type: 'ip', value: alt.ip || alt.value };
	            default:
	              // Try to infer type from properties
	              if (alt.ip) return { type: 'ip', value: alt.ip };
	              if (alt.dns) return { type: 'dns', value: alt.dns };
	              if (alt.email) return { type: 'email', value: alt.email };
	              if (alt.uri || alt.url) return { type: 'url', value: alt.uri || alt.url };
	              return { type: 'dns', value: alt.value };
	          }
	        });
	        extensions.push(new SubjectAlternativeNameExtension(altNames, critical));
	        break;

	      default:
	        // Skip unknown extensions with a warning
	        console.warn(`Unknown extension "${ext.name}" ignored`);
	    }
	  }

	  return extensions;
	}

	// Convert attributes from node-forge format to X509 name format
	function convertAttributes(attrs) {
	  const nameMap = {
	    'commonName': 'CN',
	    'countryName': 'C',
	    'ST': 'ST',
	    'localityName': 'L',
	    'organizationName': 'O',
	    'OU': 'OU'
	  };

	  return attrs.map(attr => {
	    const key = attr.name || attr.shortName;
	    const oid = nameMap[key] || key;
	    return `${oid}=${attr.value}`;
	  }).join(', ');
	}

	// Map Node.js curve names to Web Crypto curve names
	function normalizeECCurve(curveName) {
	  const curveMap = {
	    'prime256v1': 'P-256',
	    'secp384r1': 'P-384',
	    'secp521r1': 'P-521',
	    'P-256': 'P-256',
	    'P-384': 'P-384',
	    'P-521': 'P-521'
	  };
	  return curveMap[curveName] || curveName;
	}

	// Get EC curve from key object
	function getECCurve(keyObject) {
	  const details = keyObject.asymmetricKeyDetails;
	  if (details && details.namedCurve) {
	    return normalizeECCurve(details.namedCurve);
	  }
	  return 'P-256'; // default
	}

	// Convert PEM key to CryptoKey
	async function importPrivateKey(pemKey, algorithm, keyType) {
	  // Auto-detect key type if not provided
	  const keyObject = nodeCrypto.createPrivateKey(pemKey);
	  const detectedKeyType = keyObject.asymmetricKeyType;
	  const actualKeyType = keyType || detectedKeyType;

	  // Convert to PKCS#8 format
	  const pkcs8Pem = keyObject.export({ type: 'pkcs8', format: 'pem' });
	  const pemContents = pkcs8Pem
	    .replace(/-----BEGIN PRIVATE KEY-----/, '')
	    .replace(/-----END PRIVATE KEY-----/, '')
	    .replace(/\s/g, '');
	  const binaryDer = Buffer.from(pemContents, 'base64');

	  let importAlgorithm;
	  if (actualKeyType === 'ec') {
	    const curve = getECCurve(keyObject);
	    importAlgorithm = {
	      name: 'ECDSA',
	      namedCurve: curve
	    };
	  } else {
	    importAlgorithm = {
	      name: 'RSASSA-PKCS1-v1_5',
	      hash: getAlgorithmName(algorithm)
	    };
	  }

	  return await crypto.subtle.importKey(
	    'pkcs8',
	    binaryDer,
	    importAlgorithm,
	    true,
	    ['sign']
	  );
	}

	async function importPublicKey(pemKey, algorithm, keyType, curve) {
	  const pemContents = pemKey
	    .replace(/-----BEGIN PUBLIC KEY-----/, '')
	    .replace(/-----END PUBLIC KEY-----/, '')
	    .replace(/\s/g, '');

	  const binaryDer = Buffer.from(pemContents, 'base64');

	  let importAlgorithm;
	  if (keyType === 'ec') {
	    importAlgorithm = {
	      name: 'ECDSA',
	      namedCurve: curve || 'P-256'
	    };
	  } else {
	    importAlgorithm = {
	      name: 'RSASSA-PKCS1-v1_5',
	      hash: getAlgorithmName(algorithm)
	    };
	  }

	  return await crypto.subtle.importKey(
	    'spki',
	    binaryDer,
	    importAlgorithm,
	    true,
	    ['verify']
	  );
	}

	async function generatePemAsync(keyPair, attrs, options, ca) {
	  const { privateKey, publicKey } = keyPair;

	  // Generate serial number
	  const serialBytes = crypto.getRandomValues(new Uint8Array(9));
	  const serialHex = toPositiveHex(Buffer.from(serialBytes).toString('hex'));

	  // Set up dates
	  const notBefore = options.notBeforeDate || new Date();
	  let notAfter;
	  if (options.notAfterDate) {
	    notAfter = options.notAfterDate;
	  } else {
	    notAfter = new Date(notBefore);
	    notAfter.setDate(notAfter.getDate() + 365);
	  }

	  // Default attributes
	  attrs = attrs || [
	    {
	      name: "commonName",
	      value: "example.org",
	    },
	    {
	      name: "countryName",
	      value: "US",
	    },
	    {
	      shortName: "ST",
	      value: "Virginia",
	    },
	    {
	      name: "localityName",
	      value: "Blacksburg",
	    },
	    {
	      name: "organizationName",
	      value: "Test",
	    },
	    {
	      shortName: "OU",
	      value: "Test",
	    },
	  ];

	  const subjectName = convertAttributes(attrs);
	  const keyType = options.keyType || 'rsa';
	  const signingAlg = getSigningAlgorithm(options.algorithm, keyType);

	  // Extract common name for SAN extension
	  const commonNameAttr = attrs.find(attr => attr.name === 'commonName' || attr.shortName === 'CN');
	  const commonName = commonNameAttr ? commonNameAttr.value : 'localhost';

	  // Build extensions array
	  const extensions = buildExtensions(options.extensions, commonName);

	  let cert;

	  if (ca) {
	    // Generate certificate signed by CA
	    const caCert = new X509Certificate(ca.cert);
	    const caPrivateKey = await importPrivateKey(ca.key, options.algorithm || "sha256", keyType);

	    cert = await X509CertificateGenerator.create({
	      serialNumber: serialHex,
	      subject: subjectName,
	      issuer: caCert.subject,
	      notBefore: notBefore,
	      notAfter: notAfter,
	      signingAlgorithm: signingAlg,
	      publicKey: publicKey,
	      signingKey: caPrivateKey,
	      extensions: extensions
	    });
	  } else {
	    // Generate self-signed certificate
	    cert = await X509CertificateGenerator.createSelfSigned({
	      serialNumber: serialHex,
	      name: subjectName,
	      notBefore: notBefore,
	      notAfter: notAfter,
	      signingAlgorithm: signingAlg,
	      keys: {
	        privateKey: privateKey,
	        publicKey: publicKey
	      },
	      extensions: extensions
	    });
	  }

	  // Calculate fingerprint (SHA-1 hash of the certificate)
	  const certRaw = cert.rawData;
	  const fingerprintBuffer = await crypto.subtle.digest('SHA-1', certRaw);
	  const fingerprint = Buffer.from(fingerprintBuffer)
	    .toString('hex')
	    .match(/.{2}/g)
	    .join(':');

	  // Export keys to PEM
	  const privateKeyDer = await crypto.subtle.exportKey('pkcs8', privateKey);
	  const publicKeyDer = await crypto.subtle.exportKey('spki', publicKey);

	  let privatePem;
	  if (options.passphrase) {
	    // Encrypt the private key with the passphrase using Node.js crypto
	    const keyObject = nodeCrypto.createPrivateKey({
	      key: Buffer.from(privateKeyDer),
	      format: 'der',
	      type: 'pkcs8'
	    });
	    privatePem = keyObject.export({
	      type: 'pkcs8',
	      format: 'pem',
	      cipher: 'aes-256-cbc',
	      passphrase: options.passphrase
	    });
	  } else {
	    privatePem =
	      '-----BEGIN PRIVATE KEY-----\n' +
	      Buffer.from(privateKeyDer).toString('base64').match(/.{1,64}/g).join('\n') +
	      '\n-----END PRIVATE KEY-----\n';
	  }

	  const publicPem =
	    '-----BEGIN PUBLIC KEY-----\n' +
	    Buffer.from(publicKeyDer).toString('base64').match(/.{1,64}/g).join('\n') +
	    '\n-----END PUBLIC KEY-----\n';

	  const certPem = cert.toString('pem');

	  const pem = {
	    private: privatePem,
	    public: publicPem,
	    cert: certPem,
	    fingerprint: fingerprint,
	  };

	  // Client certificate support
	  if (options && options.clientCertificate) {
	    // Parse clientCertificate options - can be boolean or object
	    const clientOpts = typeof options.clientCertificate === 'object' ? options.clientCertificate : {};

	    // Resolve client certificate options with fallbacks to deprecated options
	    const clientKeySize = clientOpts.keySize || options.clientCertificateKeySize || 2048;
	    const clientAlgorithm = clientOpts.algorithm || options.algorithm || "sha1";
	    const clientCN = clientOpts.cn || options.clientCertificateCN || "John Doe jdoe123";
	    // Client cert uses same key type and curve as main cert by default
	    const clientKeyType = clientOpts.keyType || keyType;
	    const clientCurve = clientOpts.curve || options.curve || 'P-256';

	    const clientKeyAlg = getKeyAlgorithm({
	      keyType: clientKeyType,
	      keySize: clientKeySize,
	      algorithm: clientAlgorithm,
	      curve: clientCurve
	    });

	    const clientKeyPair = await crypto.subtle.generateKey(
	      clientKeyAlg,
	      true,
	      ["sign", "verify"]
	    );

	    const clientSerialBytes = crypto.getRandomValues(new Uint8Array(9));
	    const clientSerialHex = toPositiveHex(Buffer.from(clientSerialBytes).toString('hex'));

	    // Resolve client certificate validity dates
	    const clientNotBefore = clientOpts.notBeforeDate || new Date();
	    let clientNotAfter;
	    if (clientOpts.notAfterDate) {
	      clientNotAfter = clientOpts.notAfterDate;
	    } else {
	      clientNotAfter = new Date(clientNotBefore);
	      clientNotAfter.setFullYear(clientNotBefore.getFullYear() + 1);
	    }

	    const clientAttrs = JSON.parse(JSON.stringify(attrs));
	    for (let i = 0; i < clientAttrs.length; i++) {
	      if (clientAttrs[i].name === "commonName") {
	        clientAttrs[i] = {
	          name: "commonName",
	          value: clientCN
	        };
	      }
	    }

	    const clientSubjectName = convertAttributes(clientAttrs);
	    const issuerName = convertAttributes(attrs);

	    // Signing algorithm for client cert - uses main key type since signed by root
	    const clientSigningAlg = getSigningAlgorithm(clientAlgorithm, keyType);

	    // Create client cert signed by root key
	    const clientCertRaw = await X509CertificateGenerator.create({
	      serialNumber: clientSerialHex,
	      subject: clientSubjectName,
	      issuer: issuerName,
	      notBefore: clientNotBefore,
	      notAfter: clientNotAfter,
	      signingAlgorithm: clientSigningAlg,
	      publicKey: clientKeyPair.publicKey,
	      signingKey: privateKey // Sign with root private key
	    });

	    // Export client keys
	    const clientPrivateKeyDer = await crypto.subtle.exportKey('pkcs8', clientKeyPair.privateKey);
	    const clientPublicKeyDer = await crypto.subtle.exportKey('spki', clientKeyPair.publicKey);

	    pem.clientprivate =
	      '-----BEGIN PRIVATE KEY-----\n' +
	      Buffer.from(clientPrivateKeyDer).toString('base64').match(/.{1,64}/g).join('\n') +
	      '\n-----END PRIVATE KEY-----\n';

	    pem.clientpublic =
	      '-----BEGIN PUBLIC KEY-----\n' +
	      Buffer.from(clientPublicKeyDer).toString('base64').match(/.{1,64}/g).join('\n') +
	      '\n-----END PUBLIC KEY-----\n';

	    pem.clientcert = clientCertRaw.toString('pem');
	  }

	  // Verify certificate chain
	  const x509Cert = new X509Certificate(cert.rawData);
	  const certificates = [x509Cert];

	  // If CA-signed, include CA cert in the chain for verification
	  if (ca) {
	    const caCert = new X509Certificate(ca.cert);
	    certificates.push(caCert);
	  }

	  const chainBuilder = new X509ChainBuilder({
	    certificates: certificates
	  });

	  const chain = await chainBuilder.build(x509Cert);
	  if (chain.length === 0) {
	    throw new Error("Certificate could not be verified.");
	  }

	  return pem;
	}

	/**
	 * Generate a certificate (async)
	 *
	 * @param {CertificateField[]} attrs Attributes used for subject.
	 * @param {object} options
	 * @param {string} [options.keyType="rsa"] Key type: "rsa" or "ec" (elliptic curve)
	 * @param {number} [options.keySize=2048] the size for the private key in bits (RSA only)
	 * @param {string} [options.curve="P-256"] The elliptic curve to use: "P-256", "P-384", or "P-521" (EC only)
	 * @param {object} [options.extensions] additional extensions for the certificate
	 * @param {string} [options.algorithm="sha1"] The signature algorithm sha256, sha384, sha512 or sha1
	 * @param {Date} [options.notBeforeDate=new Date()] The date before which the certificate should not be valid
	 * @param {Date} [options.notAfterDate] The date after which the certificate should not be valid (default: notBeforeDate + 365 days)
	 * @param {boolean|object} [options.clientCertificate=false] Generate client cert signed by the original key. Can be `true` for defaults or an options object.
	 * @param {number} [options.clientCertificate.keySize=2048] Key size for the client certificate in bits (RSA only)
	 * @param {string} [options.clientCertificate.keyType] Key type for client cert (defaults to main keyType)
	 * @param {string} [options.clientCertificate.curve] Elliptic curve for client cert (EC only)
	 * @param {string} [options.clientCertificate.algorithm] Signature algorithm for client cert (defaults to options.algorithm or "sha1")
	 * @param {string} [options.clientCertificate.cn="John Doe jdoe123"] Client certificate's common name
	 * @param {Date} [options.clientCertificate.notBeforeDate=new Date()] The date before which the client certificate should not be valid
	 * @param {Date} [options.clientCertificate.notAfterDate] The date after which the client certificate should not be valid (default: notBeforeDate + 1 year)
	 * @param {string} [options.clientCertificateCN="John Doe jdoe123"] @deprecated Use options.clientCertificate.cn instead
	 * @param {number} [options.clientCertificateKeySize] @deprecated Use options.clientCertificate.keySize instead
	 * @param {object} [options.ca] CA certificate and key for signing (if not provided, generates self-signed)
	 * @param {string} [options.ca.key] CA private key in PEM format
	 * @param {string} [options.ca.cert] CA certificate in PEM format
	 * @param {string} [options.passphrase] Passphrase to encrypt the private key (uses AES-256-CBC)
	 * @returns {Promise<object>} Promise that resolves with certificate data
	 */
	selfsigned.generate = async function generate(attrs, options) {
	  attrs = attrs || undefined;
	  options = options || {};

	  const keyType = options.keyType || 'rsa';
	  const curve = options.curve || 'P-256';

	  let keyPair;

	  if (options.keyPair) {
	    // Import existing key pair
	    keyPair = {
	      privateKey: await importPrivateKey(options.keyPair.privateKey, options.algorithm || "sha1", keyType),
	      publicKey: await importPublicKey(options.keyPair.publicKey, options.algorithm || "sha1", keyType, curve)
	    };
	  } else {
	    // Generate new key pair using appropriate algorithm
	    const keyAlg = getKeyAlgorithm(options);
	    keyPair = await crypto.subtle.generateKey(
	      keyAlg,
	      true,
	      ["sign", "verify"]
	    );
	  }

	  return await generatePemAsync(keyPair, attrs, options, options.ca);
	};
	return selfsigned;
}

/**
 * WebSocket 与 TCP 之间共用的数据格式工具。
 */
var socketTools;
var hasRequiredSocketTools;
function requireSocketTools() {
  if (hasRequiredSocketTools) return socketTools;
  hasRequiredSocketTools = 1;
  /** 将 Buffer / Uint8Array 转为两位十六进制字符串数组 */
  function byteToHex(value) {
    return Array.from(value).map(v => v.toString(16).padStart(2, "0"));
  }

  /** 将带空格的十六进制字符串转为 Buffer，用于下发 RFID 指令 */
  function hexStringToBuffer(hexStr) {
    return Buffer.from(hexStr.replace(/\s+/g, ""), "hex");
  }

  /** 封装 WebSocket 下行消息（统一 JSON 字符串） */
  function getParams(value) {
    return JSON.stringify(value);
  }

  /** 解析 WebSocket 上行消息，失败时返回默认值 */
  function getJSON(value, def) {
    if (!value) return def;
    try {
      return JSON.parse(value);
    } catch {
      return def;
    }
  }
  socketTools = {
    byteToHex,
    hexStringToBuffer,
    getParams,
    getJSON
  };
  return socketTools;
}

/**
 * 局域网 RFID 设备扫描：在指定 TCP 端口上探测存活主机，并尝试读取 ARP MAC。
 *
 * 典型场景：串口/RFID 网关将设备映射为网口 TCP 服务（如 8899），
 * 本模块在 192.168.x.1–254 上并发探测该端口。
 */
var socketPing;
var hasRequiredSocketPing;
function requireSocketPing() {
  if (hasRequiredSocketPing) return socketPing;
  hasRequiredSocketPing = 1;
  const net = require$$0__default["default"];
  const {
    exec
  } = require$$1__default$1["default"];

  /** 单 IP 探测超时（毫秒），越小扫描越快，但易漏检 */
  const SCAN_TIMEOUT_MS = 100;
  /** 并发探测数，避免 254 路同时 connect 占满句柄 */
  const SCAN_CONCURRENCY = 64;

  /**
   * 构建扫描网段前缀（192.168.{thirdOctet}）
   * @param {number|string|undefined|null} thirdOctet - 网段第三段，空时默认 10
   */
  function getLocalSubnet(thirdOctet) {
    const segment = thirdOctet === undefined || thirdOctet === null || thirdOctet === "" ? 10 : Number(thirdOctet);
    return `192.168.${segment}`;
  }

  /** 检测目标 IP:port 是否有 TCP 服务监听 */
  function checkPort(ip, port) {
    return new Promise(resolve => {
      const socket = new net.Socket();
      socket.setTimeout(SCAN_TIMEOUT_MS);
      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("timeout", () => {
        socket.destroy();
        resolve(false);
      });
      socket.once("error", () => resolve(false));
      socket.connect(port, ip);
    });
  }

  /** 通过系统 ARP 表解析 MAC（Windows: arp -a） */
  function parseMac(ip) {
    return new Promise(resolve => {
      exec(`arp -a ${ip}`, (_err, stdout) => {
        const m = stdout.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);
        resolve(m ? m[0] : null);
      });
    });
  }

  /** 限制并发执行异步任务 */
  async function mapWithConcurrency(items, limit, fn) {
    const results = new Array(items.length);
    let next = 0;
    async function worker() {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }
    await Promise.all(Array.from({
      length: Math.min(limit, items.length)
    }, () => worker()));
    return results;
  }

  /**
   * 扫描当前网段内开放 port 的设备
   * @param {number} port - RFID/串口网关 TCP 端口
   * @param {number|string|undefined|null} [subnet] - 网段第三段，空时默认 10
   * @returns {Promise<Array<{ ip: string, mac: string|null, port: number }>>}
   */
  async function scanFast(port, subnet) {
    const subnetPrefix = getLocalSubnet(subnet);
    console.log("📡 扫描网段:", subnetPrefix + ".x", "端口:", port);
    const ips = Array.from({
      length: 254
    }, (_, i) => `${subnetPrefix}.${i + 1}`);
    const found = await mapWithConcurrency(ips, SCAN_CONCURRENCY, async ip => {
      if (!(await checkPort(ip, port))) return null;
      const mac = await parseMac(ip);
      return {
        ip,
        mac,
        port
      };
    });
    return found.filter(Boolean);
  }
  socketPing = scanFast;
  return socketPing;
}

/**
 * 串口 RFID 设备：列举 COM 口、校验参数、打开串口连接。
 *
 * 与 socket-ping.js（网口扫描）对称，供 socket-server.js 在 serial-ports / open-serial 时使用。
 */
var socketSerial;
var hasRequiredSocketSerial;
function requireSocketSerial() {
  if (hasRequiredSocketSerial) return socketSerial;
  hasRequiredSocketSerial = 1;
  const {
    SerialPort
  } = require("serialport");
  const VALID_DATA_BITS = new Set([5, 6, 7, 8]);
  const VALID_STOP_BITS = new Set([1, 2]);
  const VALID_PARITY = new Set(["none", "even", "odd", "mark", "space"]);

  /** 列举本机可用串口 */
  async function listSerialPorts() {
    return SerialPort.list();
  }

  /**
   * 校验并规范化 open-serial 参数
   * @returns {{ path: string, baudRate: number, dataBits: number, stopBits: number, parity: string } | null}
   */
  function parseSerialConfig(info) {
    const path = String(info.path || "").trim();
    const baudRate = Number(info.baudRate);
    const dataBits = Number(info.dataBits);
    const stopBits = Number(info.stopBits);
    const parity = String(info.parity || "").toLowerCase();
    if (!path || !Number.isFinite(baudRate) || baudRate <= 0) return null;
    if (!VALID_DATA_BITS.has(dataBits)) return null;
    if (!VALID_STOP_BITS.has(stopBits)) return null;
    if (!VALID_PARITY.has(parity)) return null;
    return {
      path,
      baudRate,
      dataBits,
      stopBits,
      parity
    };
  }

  /** 打开串口，在 open 事件 resolve，error 事件 reject */
  function openSerialPort(config) {
    return new Promise((resolve, reject) => {
      const port = new SerialPort({
        ...config,
        autoOpen: true
      });
      const onError = err => {
        port.removeListener("open", onOpen);
        reject(err);
      };
      const onOpen = () => {
        port.removeListener("error", onError);
        resolve(port);
      };
      port.once("open", onOpen);
      port.once("error", onError);
    });
  }
  socketSerial = {
    listSerialPorts,
    parseSerialConfig,
    openSerialPort
  };
  return socketSerial;
}

/**
 * ============================================================================
 * RFID 设备桥接服务（WSS）
 * ============================================================================
 *
 * 【作用】
 * 本进程作为「中间层」：前端（浏览器 / Electron）无法直接访问局域网 TCP 或串口，
 * 因此通过加密的 WebSocket（WSS）与本服务通信；本服务再与 RFID 设备建立
 * TCP 或串口连接，实现扫描、连接、收发指令。
 *
 * 【典型拓扑】
 *
 *   前端客户端  <--WSS-->  socket-server.js  <--TCP-->  网口 RFID 网关 (如 8899)
 *                              |
 *                         socket-ping.js（网口扫描）
 *                              |
 *                         socket-serial.js（串口列举/连接）
 *                              |
 *                         串口 RFID (COMx)
 *
 * 【为何使用 WSS】
 * 浏览器/Electron 页面在 HTTPS 或安全上下文中只能连接 wss://，不能使用 ws://。
 * 本服务用 Node https + ws 库在 9989 端口提供 WSS。
 *
 * --------------------------------------------------------------------------
 * 上行消息（客户端 → 服务端，JSON 字符串）
 * --------------------------------------------------------------------------
 *
 * 1. 扫描局域网设备
 *    { "action": "ports", "port": 8899, "subnet": 10 }
 *    - port：要探测的 TCP 端口（RFID/串口网关映射端口，常见 8899）
 *    - subnet：网段第三段，如 10 表示 192.168.10.x；省略时默认 10
 *
 * 2. 连接指定设备
 *    { "action": "open", "rIP": "192.168.1.8_8899" }
 *    - rIP：设备地址，格式固定为「IP_端口」，下划线分隔
 *    - 同一 WebSocket 会话重复 open 会先断开旧 TCP 再连新地址
 *
 * 3. 向已连接设备发送数据
 *    { "action": "send", "data": [221, 17, 239, ...] }
 *    - data：字节数组（十进制 0–255），对应 RFID 协议帧
 *    - 须先 open 或 open-serial 成功，否则返回 error
 *
 * 4. 列举串口
 *    { "action": "serial-ports" }
 *
 * 5. 连接串口 RFID
 *    { "action": "open-serial", "path": "COM3", "baudRate": 115200,
 *      "dataBits": 8, "stopBits": 1, "parity": "none" }
 *    - path：串口路径（Windows 如 COM3，Linux 如 /dev/ttyUSB0）
 *    - baudRate / dataBits / stopBits / parity：完整串口参数
 *    - 同一 WebSocket 会话重复 open / open-serial 会先断开旧连接
 *
 * --------------------------------------------------------------------------
 * 下行消息（服务端 → 客户端，JSON 字符串）
 * --------------------------------------------------------------------------
 *
 * | type          | 含义           | 字段说明
 * |---------------|----------------|------------------------------------------
 * | ports         | 网口扫描结果   | data: [{ ip, mac, port }, ...]
 * | serial-ports  | 串口列表       | data: [{ path, manufacturer, ... }, ...]
 * | open-success  | 设备连接成功   | 无额外字段，可开始 send
 * | data          | 设备上报数据   | data: Buffer 序列化后的字节（见 tools）
 * | error         | 错误           | msg: 错误描述
 *
 * --------------------------------------------------------------------------
 * 环境变量（可选，生产建议使用正式证书）
 * --------------------------------------------------------------------------
 *
 * WSS_CERT  证书 PEM 路径，默认 ./certs/cert.pem
 * WSS_KEY   私钥 PEM 路径，默认 ./certs/key.pem
 *
 * 首次启动若证书不存在，会自动生成 localhost 自签名证书（仅适合开发）。
 *
 * 启动：node socket-server.js
 * 地址：wss://localhost:9989
 * ============================================================================
 */
var hasRequiredSocketServer;
function requireSocketServer() {
  if (hasRequiredSocketServer) return socketServer$1;
  hasRequiredSocketServer = 1;
  const WebSocket = require("ws");
  const https = require$$0__default$1["default"];
  const fs = require$$1__default$2["default"];
  const path = require$$2__default["default"];
  const net = require$$0__default["default"];
  const {
    randomUUID
  } = require$$1__default["default"];
  const selfsigned = requireSelfsigned();
  const tools = requireSocketTools();
  const scanFast = requireSocketPing();
  const {
    listSerialPorts,
    parseSerialConfig,
    openSerialPort
  } = requireSocketSerial();

  // ---------------------------------------------------------------------------
  // 配置常量
  // ---------------------------------------------------------------------------

  /** WSS 监听端口，与前端约定一致 */
  const WSS_PORT = 9989;

  /** 证书存放目录（已加入 .gitignore，勿提交私钥） */
  const CERT_DIR = path.join(__dirname, "certs");

  /**
   * TLS 证书与私钥路径
   * 可通过环境变量覆盖，便于部署时挂载正式证书
   */
  const CERT_PATH = process.env.WSS_CERT || path.join(CERT_DIR, "localhost.pem");
  const KEY_PATH = process.env.WSS_KEY || path.join(CERT_DIR, "localhost-key.pem");

  // ---------------------------------------------------------------------------
  // 运行时状态
  // ---------------------------------------------------------------------------

  /**
   * 设备连接表（TCP 或 Serial）
   * 键：ws.uuid（每个 WebSocket 连接唯一 ID）
   * 值：{ kind: "tcp"|"serial", handle: net.Socket|SerialPort }
   *
   * 约束：一个 WebSocket 会话同时只维护一条设备连接；
   *       断开 WebSocket 或重新 open / open-serial 时会清理对应条目。
   */
  const deviceConnections = {};

  // ---------------------------------------------------------------------------
  // 工具函数
  // ---------------------------------------------------------------------------

  /**
   * 解析客户端传入的设备地址字符串
   *
   * @param {string} rIP - 格式 "192.168.1.8_8899"（IP 与端口用下划线连接）
   * @returns {{ ip: string, port: number } | null} 解析失败返回 null
   *
   * @example
   * parseDeviceAddress("192.168.1.8_8899")  // { ip: "192.168.1.8", port: 8899 }
   * parseDeviceAddress("invalid")           // null
   */
  function parseDeviceAddress(rIP) {
    const [ip, portStr] = String(rIP).split("_");
    const port = Number(portStr);
    if (!ip || !Number.isFinite(port) || port <= 0 || port > 65535) {
      return null;
    }
    return {
      ip,
      port
    };
  }

  /**
   * 向 WebSocket 客户端发送 JSON 消息
   * 仅在连接仍为 OPEN 时发送，避免向已关闭连接写入
   *
   * @param {import("ws")} ws
   * @param {object} payload - 将序列化为 JSON，如 { type: "data", data: [...] }
   */
  function send(ws, payload) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(tools.getParams(payload));
    }
  }

  /**
   * 关闭并清理当前 WebSocket 会话关联的设备连接
   *
   * @param {import("ws") & { uuid: string }} ws
   */
  function closeDevice(ws) {
    const conn = deviceConnections[ws.uuid];
    if (!conn) return;
    const {
      kind,
      handle
    } = conn;
    handle.removeAllListeners();
    if (kind === "tcp") {
      handle.destroy();
    } else {
      handle.close();
    }
    delete deviceConnections[ws.uuid];
  }

  /**
   * 绑定设备 IO：data 上行、close/error 清理
   *
   * @param {import("ws") & { uuid: string }} ws
   * @param {import("net").Socket | import("@serialport/stream").SerialPort} handle
   * @param {string} label - 日志用连接标识
   */
  function attachDeviceIO(ws, handle, label) {
    handle.on("data", data => {
      send(ws, {
        type: "data",
        data
      });
    });
    handle.on("close", () => {
      closeDevice(ws);
      ws.close();
    });
    handle.on("error", err => {
      console.error(`设备连接错误 ${label}`, err.message);
      send(ws, {
        type: "error",
        msg: err.message
      });
      closeDevice(ws);
    });
  }

  /**
   * 建立到 RFID 网关的 TCP 连接，并配置双向数据转发
   *
   * @param {import("ws") & { uuid: string }} ws
   * @param {string} ip   - 网关 IP
   * @param {number} port - 网关 TCP 端口
   */
  function connectDevice(ws, ip, port) {
    closeDevice(ws);
    const sock = new net.Socket();
    deviceConnections[ws.uuid] = {
      kind: "tcp",
      handle: sock
    };
    sock.on("connect", () => {
      console.log(`设备已连接 ${ip}:${port} (${ws.uuid})`);
      send(ws, {
        type: "open-success"
      });
    });
    attachDeviceIO(ws, sock, `${ip}:${port}`);
    sock.connect(port, ip);
  }

  /**
   * 打开串口 RFID 设备并配置双向数据转发
   *
   * @param {import("ws") & { uuid: string }} ws
   * @param {{ path: string, baudRate: number, dataBits: number, stopBits: number, parity: string }} config
   */
  async function connectSerialDevice(ws, config) {
    closeDevice(ws);
    const {
      path
    } = config;
    const port = await openSerialPort(config);
    deviceConnections[ws.uuid] = {
      kind: "serial",
      handle: port
    };
    attachDeviceIO(ws, port, path);
    console.log(`串口已连接 ${path} (${ws.uuid})`);
    send(ws, {
      type: "open-success"
    });
  }

  // ---------------------------------------------------------------------------
  // TLS / WSS 证书
  // ---------------------------------------------------------------------------

  /**
   * 确保磁盘上存在 TLS 证书与私钥
   *
   * 开发环境：不存在时用 selfsigned 生成自签名证书（CN=localhost，有效期 1 年）
   * 生产环境：请提前放置正式证书，或设置 WSS_CERT / WSS_KEY 指向挂载路径
   */
  async function ensureTlsCerts() {
    if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) return;
    fs.mkdirSync(CERT_DIR, {
      recursive: true
    });
    const notAfter = new Date();
    notAfter.setFullYear(notAfter.getFullYear() + 1);
    const {
      cert,
      private: key
    } = await selfsigned.generate([{
      name: "commonName",
      value: "localhost"
    }], {
      notAfterDate: notAfter,
      keySize: 2048
    });
    fs.writeFileSync(CERT_PATH, cert);
    fs.writeFileSync(KEY_PATH, key);
    console.warn(`已生成自签名 WSS 证书: ${CERT_PATH}`);
  }

  /**
   * 读取 TLS 配置供 https.createServer 使用
   * @returns {Promise<{ cert: Buffer, key: Buffer }>}
   */
  async function loadTlsOptions() {
    await ensureTlsCerts();
    return {
      cert: fs.readFileSync(CERT_PATH),
      key: fs.readFileSync(KEY_PATH)
    };
  }

  // ---------------------------------------------------------------------------
  // WebSocket 消息分发
  // ---------------------------------------------------------------------------

  /**
   * 处理单条 WebSocket 文本消息（JSON）
   *
   * @param {import("ws") & { uuid: string }} ws
   * @param {string|Buffer} message - 客户端发来的原始消息
   */
  async function handleMessage(ws, message) {
    const info = tools.getJSON(message, {});
    switch (info.action) {
      // 扫描：委托 socket-ping 在本机网段探测指定端口
      case "ports":
        {
          const port = Number(info.port);
          if (!Number.isFinite(port)) {
            return send(ws, {
              type: "error",
              msg: "invalid port"
            });
          }
          const devices = await scanFast(port, info.subnet);
          send(ws, {
            type: "ports",
            data: devices
          });
          break;
        }

      // 连接：解析 rIP 并建立 TCP
      case "open":
        {
          const target = parseDeviceAddress(info.rIP);
          if (!target) {
            return send(ws, {
              type: "error",
              msg: "invalid rIP, use ip_port"
            });
          }
          connectDevice(ws, target.ip, target.port);
          break;
        }

      // 下发：将字节数组写入已连接的设备（TCP 或 Serial）
      case "send":
        {
          const conn = deviceConnections[ws.uuid];
          if (!conn) {
            return send(ws, {
              type: "error",
              msg: "Not Found Device"
            });
          }
          conn.handle.write(Buffer.from(info.data));
          break;
        }

      // 列举本机串口
      case "serial-ports":
        {
          const ports = await listSerialPorts();
          send(ws, {
            type: "serial-ports",
            data: ports
          });
          break;
        }

      // 连接串口 RFID
      case "open-serial":
        {
          const config = parseSerialConfig(info);
          if (!config) {
            return send(ws, {
              type: "error",
              msg: "invalid serial config"
            });
          }
          await connectSerialDevice(ws, config);
          break;
        }
      default:
        send(ws, {
          type: "error",
          msg: `unknown action: ${info.action}`
        });
    }
  }

  // ---------------------------------------------------------------------------
  // 服务启动
  // ---------------------------------------------------------------------------

  /**
   * 启动 HTTPS 服务器并在其上挂载 WebSocket.Server
   *
   * verifyClient 当前放行所有握手（内网/本地桥接场景）；
   * 若需鉴权可在此校验 Origin、Token 等。
   */
  async function start() {
    const httpsServer = https.createServer(await loadTlsOptions());
    const wsServer = new WebSocket.Server({
      server: httpsServer,
      verifyClient: (_info, done) => done(true)
    });
    httpsServer.listen(WSS_PORT, () => {
      console.log(`WebSocket 已启动: wss://localhost:${WSS_PORT}`);
    });
    wsServer.on("connection", ws => {
      // 为每个前端连接生成唯一 ID，作为 deviceConnections 的键
      ws.uuid = randomUUID();
      console.log("WebSocket 新连接:", ws.uuid);
      ws.on("message", message => {
        handleMessage(ws, message).catch(err => {
          console.error("处理消息失败:", err);
          send(ws, {
            type: "error",
            msg: err.message
          });
        });
      });

      // 前端关闭或刷新页面：同步释放设备连接，避免残留
      ws.on("close", () => {
        console.log("WebSocket 断开:", ws.uuid);
        closeDevice(ws);
      });
    });
  }
  start().catch(err => {
    console.error("WebSocket 服务启动失败:", err);
    process.exit(1);
  });

  // ---------------------------------------------------------------------------
  // 进程级异常处理（服务需长期运行，不因单次异常退出）
  // ---------------------------------------------------------------------------

  process.on("uncaughtException", err => {
    console.error("未捕获异常:", err);
  });
  process.on("unhandledRejection", reason => {
    console.error("未处理 Promise Rejection:", reason);
  });
  return socketServer$1;
}

var socketServerExports = requireSocketServer();
var socketServer = /*@__PURE__*/getDefaultExportFromCjs(socketServerExports);

module.exports = socketServer;
