var	sanitizeHtml = require('sanitize-html'),
	fs = require('fs-extra'),
	pluginData = require('./plugin.json'),
	path = require('path'),
	async = require('async'),
	log = require('tiny-logger').init(process.env.NODE_ENV === 'development' ? 'debug' : 'info,warn,error', '[' + pluginData.id + ']'),
	$ = require('jquery'),
	meta = module.parent.require('./meta');

(function(Plugin){
	Plugin.config = {};

	Plugin.init = function(callback){
		log.debug('init()');
		var _self = this,
			hashes = Object.keys(pluginData.defaults).map(function(field) { return pluginData.id + ':options:' + field });

		meta.configs.getFields(hashes, function(err, options){
			if (err) throw err;

			for (field in options) {
				meta.config[field] = options[field];
			}
			if (typeof _self.softInit == 'function') {
				_self.softInit(callback);
			} else if (typeof callback == 'function'){
				callback();
			}

		});
	};

	Plugin.reload = function(hookVals) {
		var	isThisPlugin = new RegExp(pluginData.id + ':options:' + Object.keys(pluginData.defaults)[0]);
		if (isThisPlugin.test(hookVals.key)) {
			this.init(this.softInit.bind(this));
		}
	};

	Plugin.admin = {
		menu: function(custom_header) {
			custom_header.plugins.push({
				"route": '/plugins/' + pluginData.name,
				"icon": 'icon-edit',
				"name": pluginData.name
			});

			return custom_header;
		},
		route: function(custom_routes, callback) {
			fs.readFile(path.join(__dirname, 'public/templates/admin.tpl'), function(err, tpl) {
				if (err) throw err;

				custom_routes.routes.push({
					route: '/plugins/' + pluginData.name,
					method: "get",
					options: function(req, res, callback) {
						callback({
							req: req,
							res: res,
							route: '/plugins/' + pluginData.name,
							name: Plugin,
							content: tpl
						});
					}
				});

				callback(null, custom_routes);
			});
		},
		activate: function(id) {
			log.debug('activate()');
			if (id === pluginData.id) {
				async.each(Object.keys(pluginData.defaults), function(field, next) {
					meta.configs.setOnEmpty(pluginData.id + ':options:' + field, pluginData.defaults[field], next);
				});
			}
		}
	};

	Plugin.softInit = function(callback) {
		log.debug('softInit()');

		var	_self = this;

		if (!meta.config) {
			this.init(callback);
		}

		var prefix = pluginData.id + ':options:';
		Object.keys(meta.config).forEach(function(field, i) {
			var option, value;
			if (field.indexOf(pluginData.id + ':options:') === 0 ) {

				option = field.slice(prefix.length);

				value = meta.config[field];

				var obj;
				if (field !== 'parseAgain') {
					obj = value == 'undefined' /* redis wat */ || !value ? option == 'allowedAttributes' ? '{}' : '[]' : value;
					try {
						obj = JSON.parse(obj);
					} catch (e) {
						log.debug('e1: ' + e + ' can\'t parse option ' + field + ' falling back to default.');
						obj = JSON.parse(pluginData.defaults[option]);
					}
				} else {
					var noop = function (c){return c;};
					try {
						// Function.apply(context, args (csv string), function-code (string))
						obj = Function.apply( _self, ['content, $', (value ? value : pluginData.defaults['parseAgain']) + '\nreturn content;' ]);

					} catch (e) {
						log.debug('e2: ' + e + ' can\'t parse function "' + field + '" falling back to noop.');
						obj = noop;
					}
					// let's see if it doesn't crash
					try {
						obj("test", $, "1", "2", "3");
					} catch (e) {
						// if it did, then too bad, you had a good run, but no thanks
						log.debug('e3: ' + e + ' | parseAgain code:[start] ' + obj + ' [end] has error, falling back to noop.');
						obj = noop;
					}
				}
				_self.config[option] = obj;
			}
		});
		_self.initialized = true;
		if (typeof callback == 'function') {
			callback();
		}
	};

	Plugin.unescapeHtml = function(unsafe) {
		return unsafe
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, "\"")
			.replace(/&#039;/g, "'");
	};

	Plugin.sanitize = function(raw) {
		return this.config.parseAgain(sanitizeHtml(this.unescapeHtml(raw), this.config), $);
	};

	Plugin.init();

})(exports);