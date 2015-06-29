/**
 * @license nouage https://github.com/podefr/nouage
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2015 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

var compareNumbers = require("compare-numbers"),
    simpleLoop = require("simple-loop"),
    toArray = require("to-array"),
    nestedProperty = require("nested-property"),
    getNodes = require("get-nodes"),
    getDataset =  require("get-dataset"),
    observePlus = require("observe-plus");

function setAttribute(node, property, value) {
    if ('ownerSVGElement' in node) {
        node.setAttribute(property, value);
        return true;
    } else if ('ownerDocument' in node) {
        node[property] = value;
        return true;
    } else {
        throw new Error("invalid element type");
    }
}

/**
 * @class
 * This plugin links dom nodes to a model
 */
module.exports = function BindPluginConstructor($model, $bindings) {

    /**
     * The model to watch
     * @private
     */
    var _model = null,

    /**
     * The list of custom bindings
     * @private
     */
    _bindings = {},

    /**
     * The list of itemRenderers
     * each foreach has its itemRenderer
     * @private
     */
    _itemRenderers = {},

    /**
     * The observers handlers
     * @private
     */
    _observers = {},

    /**
     * The observe-plus wrapper
     * @private
     */
    _observer;

    /**
     * Exposed for debugging purpose
     * @private
     */
    this.observers = _observers;

    function _removeObserversForId(id) {
        if (_observers[id]) {
            _observers[id].forEach(function (handler) {
                handler();
            });
            delete _observers[id];
        }
    }

    /**
     * Define the model to watch for
     * @param {Store} model the model to watch for changes
     * @returns {Boolean} true if the model was set
     */
    this.setModel = function setModel(model) {
        _model = model;
        _observer = observePlus.observe(model);
    };

    /**
     * Get the store that is watched for
     * for debugging only
     * @private
     * @returns the Store
     */
    this.getModel = function getModel() {
        return _model;
    };

    /**
     * The item renderer defines a dom node that can be duplicated
     * It is made available for debugging purpose, don't use it
     * @private
     */
    this.ItemRenderer = function ItemRenderer($plugins, $rootNode) {

        /**
         * The node that will be cloned
         * @private
         */
        var _node = null,

            /**
             * The object that contains plugins.name and plugins.apply
             * @private
             */
            _plugins = null,

            /**
             * The _rootNode where to append the created items
             * @private
             */
            _rootNode = null,

            /**
             * The lower boundary
             * @private
             */
            _start = null,

            /**
             * The number of item to display
             * @private
             */
            _nb = null,

            /**
             * Keep track by item of the dom elements that are created
             * @type {Window.WeakMap}
             * @private
             */
            _domMap = new WeakMap(),

            /**
             * Keep track by index of the dom elements that are created
             * @type {Array}
             * @private
             */
            _items = [];

        /**
         * Set the duplicated node
         * @private
         */
        this.setRenderer = function setRenderer(node) {
            _node = node;
            return true;
        };

        /**
         * Returns the node that is going to be used for rendering
         * @private
         * @returns the node that is duplicated
         */
        this.getRenderer = function getRenderer() {
            return _node;
        };

        /**
         * Sets the rootNode and gets the node to copy
         * @private
         * @param {HTMLElement|SVGElement} rootNode
         * @returns
         */
        this.setRootNode = function setRootNode(rootNode) {
            var renderer;
            _rootNode = rootNode;
            renderer = _rootNode.querySelector("*");
            this.setRenderer(renderer);
            if (renderer) {
                _rootNode.removeChild(renderer);
            }
        };

        /**
         * Gets the rootNode
         * @private
         * @returns _rootNode
         */
        this.getRootNode = function getRootNode() {
            return _rootNode;
        };

        /**
         * Set the plugins objet that contains the name and the apply function
         * @private
         * @param plugins
         * @returns true
         */
        this.setPlugins = function setPlugins(plugins) {
            _plugins = plugins;
            return true;
        };

        /**
         * Get the plugins object
         * @private
         * @returns the plugins object
         */
        this.getPlugins = function getPlugins() {
            return _plugins;
        };

        /**
         * Set the start limit
         * @private
         * @param {Number} start the value to start rendering the items from
         * @returns the value
         */
        this.setStart = function setStart(start) {
            _start = parseInt(start, 10);
            return _start;
        };

        /**
         * Get the start value
         * @private
         * @returns the start value
         */
        this.getStart = function getStart() {
            return _start;
        };

        /**
         * Set the number of item to display
         * @private
         * @param {Number/String} nb the number of item to display or "*" for all
         * @returns the value
         */
        this.setNb = function setNb(nb) {
            _nb = nb == "*" ? nb : parseInt(nb, 10);
            return _nb;
        };

        /**
         * Get the number of item to display
         * @private
         * @returns the value
         */
        this.getNb = function getNb() {
            return _nb;
        };

        /**
         * Adds a new item and adds it in the items list
         * @private
         * @param {Number} id the id of the item
         * @returns
         */
        this.addItem = function addItem(id) {
            var node;

            if (typeof id == "number" && !_items[id]) {
                node = this.create(id);
                if (node) {
                    _rootNode.appendChild(node);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };

        /**
         * Remove an item from the dom and the items list
         * @private
         * @param {Number} id the id of the item to remove
         * @returns
         */
        this.removeItemById = function removeItemById(id) {
            var domElement = _items[id];
            if (domElement) {
                _rootNode.removeChild(domElement);
                delete _items[id];
                _removeObserversForId(id);
                return true;
            } else {
                return false;
            }
        };

        /**
         * Remove an item from the dom given the item itself
         * @param item
         * @returns {boolean}
         */
        this.removeItemByItem = function removeItemByItem(item) {
            var domElement = _domMap.get(item);
            var index;
            if (domElement) {
                _rootNode.removeChild(domElement);
                _domMap.delete(item);
                index = _items.indexOf(domElement);
                delete _items[index];
                _removeObserversForId(index);
                return true;
            } else {
                return false;
            }
        };

        /**
         * create a new node. Actually makes a clone of the initial one
         * and adds pluginname_id to each node, then calls plugins.apply to apply all plugins
         * @private
         * @param id
         * @param pluginName
         * @returns the associated node
         */
        this.create = function create(id) {
            if (id in _model) {
                var newNode = _node.cloneNode(true),
                    nodes = getNodes(newNode);

                toArray(nodes).forEach(function (child) {
                    child.setAttribute("data-" + _plugins.name + "_id", id);
                });

                _items[id] = newNode;

                _domMap.set(_model[id], newNode);
                _plugins.apply(newNode);
                return newNode;
            }
        };

        /**
         * Renders the dom tree, adds nodes that are in the boundaries
         * and removes the others
         * @private
         * @returns true boundaries are set
         */
        this.render = function render() {
            // If the number of items to render is all (*)
            // Then get the number of items
            var _tmpNb = _nb == "*" ? _model.length : _nb;

            // This will store the items to remove
            var marked = [];

            // Render only if boundaries have been set
            if (_nb !== null && _start !== null) {

                // Loop through the existing items
                _items.forEach(function (value, idx) {
                    // If an item is out of the boundary
                    if (idx < _start || idx >= (_start + _tmpNb) || _model.indexOf(idx) == -1) {
                        // Mark it
                        marked.push(idx);
                    }
                }, this);

                // Remove the marked item from the highest id to the lowest
                // Doing this will avoid the id change during removal
                // (removing id 2 will make id 3 becoming 2)
                marked.sort(compareNumbers.desc).forEach(this.removeItemById, this);

                // Now that we have removed the old nodes
                // Add the missing one
                for (var i=_start, l=_tmpNb+_start; i<l; i++) {
                    this.addItem(i);
                }
                return true;
            } else {
                return false;
            }
        };

        if ($plugins) {
            this.setPlugins($plugins);
        }
        if ($rootNode) {
            this.setRootNode($rootNode);
        }
    };

    /**
     * Save an itemRenderer according to its id
     * @private
     * @param {String} id the id of the itemRenderer
     * @param {ItemRenderer} itemRenderer an itemRenderer object
     */
    this.setItemRenderer = function setItemRenderer(id, itemRenderer) {
        id = id || "default";
        _itemRenderers[id] = itemRenderer;
    };

    /**
     * Get an itemRenderer
     * @private
     * @param {String} id the name of the itemRenderer
     * @returns the itemRenderer
     */
    this.getItemRenderer = function getItemRenderer(id) {
        return _itemRenderers[id];
    };

    /**
     * Expands the inner dom nodes of a given dom node, filling it with model's values
     * @param {HTMLElement|SVGElement} node the dom node to apply foreach to
     */
    this.foreach = function foreach(node, idItemRenderer, start, nb) {
        var itemRenderer = new this.ItemRenderer(this.plugins, node);

        itemRenderer.setStart(start || 0);
        itemRenderer.setNb(nb || "*");

        itemRenderer.render();

        // Add the newly created item
        _observer.observe("added", itemRenderer.render, itemRenderer);

        // If an item is deleted
        _observer.observe("splice", function (event) {
            event.removed.forEach(itemRenderer.removeItemByItem, itemRenderer);
        });
        this.setItemRenderer(idItemRenderer, itemRenderer);
    };

    /**
     * Update the lower boundary of a foreach
     * @param {String} id the id of the foreach to update
     * @param {Number} start the new value
     * @returns true if the foreach exists
     */
    this.updateStart = function updateStart(id, start) {
        var itemRenderer = this.getItemRenderer(id);
        if (itemRenderer) {
            itemRenderer.setStart(start);
            return true;
        } else {
            return false;
        }
    };

    /**
     * Update the number of item to display in a foreach
     * @param {String} id the id of the foreach to update
     * @param {Number} nb the number of items to display
     * @returns true if the foreach exists
     */
    this.updateNb = function updateNb(id, nb) {
        var itemRenderer = this.getItemRenderer(id);
        if (itemRenderer) {
            itemRenderer.setNb(nb);
            return true;
        } else {
            return false;
        }
    };

    /**
     * Refresh a foreach after having modified its limits
     * @param {String} id the id of the foreach to refresh
     * @returns true if the foreach exists
     */
    this.refresh = function refresh(id) {
        var itemRenderer = this.getItemRenderer(id);
        if (itemRenderer) {
            itemRenderer.render();
            return true;
        } else {
            return false;
        }
    };

    /**
     * Both ways binding between a dom node attributes and the model
     * @param {HTMLElement|SVGElement} node the dom node to apply the plugin to
     * @param {String} name the name of the property to look for in the model's value
     * @returns
     */
    this.bind = function bind(node, property, name) {
        // Name can be unset if the value of a row is plain text
        name = name || "";

        // If the model is an array, the id is the index of the model's item to look for
        var id = node.getAttribute("data-" + this.plugins.name + "_id"),

            prefixedName = id ? id + "." + name : name,

            // Get the model's value
             val = nestedProperty.get(_model, prefixedName),

            // When calling bind like bind:newBinding,param1, param2... we need to get them
            extraParam = toArray(arguments).slice(3);

        // 0 and false are acceptable falsy values
        if (val || val === 0 || val === false) {
            // If the binding hasn't been overriden
            if (!this.execBinding.apply(this,
                [node, property, val]
                    // Extra params are passed to the new binding too
                    .concat(extraParam))) {
                // Execute the default one which is a simple assignation

                setAttribute(node, property, val);
            }
        }

        // Only watch for changes (two way data binding) if the binding
        // has not been redefined
        if (!this.hasBinding(property)) {
            node.addEventListener("change", function () {
                if (nestedProperty.has(_model, prefixedName)) {
                    nestedProperty.set(_model, prefixedName, node[property]);
                }
            }, true);
        }

        // Watch for changes
        this.observers[prefixedName] = this.observers[prefixedName] || [];

        this.observers[prefixedName].push(_observer.observeValue(prefixedName, function (event) {
            var value = event.value;

            if (!this.execBinding.apply(this,
                [node, property, value]
                    // passing extra params too
                    .concat(extraParam))) {

                setAttribute(node, property, value);
            }
        }, this));

    };

    this.getItemIndex = function getElementId(dom) {
        var dataset = getDataset(dom);

        if (dataset && typeof dataset[this.plugins.name + "_id"] != "undefined") {
            return +dataset[this.plugins.name + "_id"];
        } else {
            return false;
        }
    };

    /**
     * Prevents the submit and set the model with all form's inputs
     * @param {HTMLFormElement} DOMfrom
     * @returns true if valid form
     */
    this.form = function form(DOMform) {
        if (DOMform && DOMform.nodeName == "FORM") {
            var that = this;
            DOMform.addEventListener("submit", function (event) {
                toArray(DOMform.querySelectorAll("[name]")).forEach(that.set, that);
                event.preventDefault();
            }, true);
            return true;
        } else {
            return false;
        }
    };

    /**
     * Add a new way to handle a binding
     * @param {String} name of the binding
     * @param {Function} binding the function to handle the binding
     * @returns
     */
    this.addBinding = function addBinding(name, binding) {
        if (name && typeof name == "string" && typeof binding == "function") {
            _bindings[name] = binding;
            return true;
        } else {
            return false;
        }
    };

    /**
     * Execute a binding
     * Only used by the plugin
     * @private
     * @param {HTMLElement} node the dom node on which to execute the binding
     * @param {String} name the name of the binding
     * @param {Any type} value the value to pass to the function
     * @returns
     */
    this.execBinding = function execBinding(node, name) {
        if (this.hasBinding(name)) {
            _bindings[name].apply(node, Array.prototype.slice.call(arguments, 2));
            return true;
        } else {
            return false;
        }
    };

    /**
     * Check if the binding exists
     * @private
     * @param {String} name the name of the binding
     * @returns
     */
    this.hasBinding = function hasBinding(name) {
        return _bindings.hasOwnProperty(name);
    };

    /**
     * Get a binding
     * For debugging only
     * @private
     * @param {String} name the name of the binding
     * @returns
     */
    this.getBinding = function getBinding(name) {
        return _bindings[name];
    };

    /**
     * Add multiple binding at once
     * @param {Object} list the list of bindings to add
     * @returns
     */
    this.addBindings = function addBindings(list) {
        return simpleLoop(list, function (binding, name) {
            this.addBinding(name, binding);
        }, this);
    };

    // Inits the model
    this.setModel($model);
    // Inits bindings

    if ($bindings) {
        this.addBindings($bindings);
    }
};
