define([
    'underscore',
    'base/utils',
    'base/class',
    'base/intervals',
    'base/events'
], function(_, utils, Class, Intervals, Events) {

    var model = Class.extend({

        //receives values and, optionally, external intervals and events
        init: function(values, intervals, events) {
            this._id = _.uniqueId("m"); //model unique id
            this._data = {};
            this.intervals = (this.intervals || intervals) || new Intervals();
            this.events = events || new Events();

            if (values) {
                this.set(values, true);
            }
        },

        /*
         * Getters and Setters
         */

        //get accepts multiple levels. e.g: get("time.start.value")
        get: function(attr) {
            //optimize for common cases
            if (!attr) return this._data;
            else if (attr.indexOf('.') === -1) return this._data[attr];
            //search deeper levels
            var attrs = attr.split('.'),
                current = this;
            while (attrs.length) {
                curr_attr = attrs.shift();
                if (typeof current.get === 'function') {
                    current = current.get(curr_attr);
                } else {
                    current = current[curr_attr];
                }
            }
            return current;
        },

        //set an attribute for the model, or an entire object
        set: function(attr, val, silent, block_validation) {

            if (typeof attr !== 'object') {
                this._data[attr] = (typeof val === 'object') ? _.clone(val) : val;
                if (!silent) this.events.trigger("change:" + attr, this._data);
            } else {
                block_validation = silent;
                silent = val;
                for (var att in attr) {
                    var val = attr[att];
                    this._data[att] = (typeof val === 'object') ? _.clone(val) : val;
                    if (!silent) this.events.trigger("change:" + att, this._data);
                }
            }
            //trigger change if not silent
            if (!silent) this.events.trigger("change", this._data);
            //if we don't block validation, validate
            if (!block_validation) this.validate(silent);
        },

        reset: function(values, silent) {
            this.events.unbindAll();
            this.intervals.clearAllIntervals();
            this._data = {};
            this.set(values, silent);
        },

        getObject: function() {
            var obj = {};
            for (var i in this._data) {
                //if it's a submodel
                if (this._data[i] && typeof this._data[i].getObject === 'function') {
                    obj[i] = this._data[i].getObject();
                } else {
                    obj[i] = this._data[i];
                }
            }
            return obj;
        },

        /*
         * Validation methods
         */

        validate: function() {
            // placeholder for validate function
        },

        /*
         * Event methods
         */

        on: function(name, func) {
            this.events.bind(name, func);
        },

        trigger: function(name, val) {
            this.events.trigger(name, val);
        }

    });

    return model;

});