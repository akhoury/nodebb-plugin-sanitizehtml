var	sanitizeHtml = require('sanitize-html'),
		fs = require('fs-extra'),
		pluginData = require('./plugin.json'),
		path = require('path'),
		async = require('async'),
		extend = require('extend'),
		$ = require('jquery'),
		winston = module.parent.require('winston'),
		meta = module.parent.require('./meta'),
		Plugin;

pluginData.nbbId = pluginData.id.replace(/nodebb-plugin-/, '');

Plugin = {

	settings: function(settings, callback) {
		if (typeof settings === 'function') {
			callback = settings;
			settings = undefined;
		}
		if (typeof callback !== 'function') {
			callback = function(){};
		}
		if (settings) {
			meta.settings.set(pluginData.nbbId, settings, callback);
		} else {
			meta.settings.get(pluginData.nbbId, function(err, config) {
				if (err) {
					winston.warn('[plugins/' + pluginData.nbbId + '] Settings are not set or could not be retrieved!');
					return callback(err);
				}

				Plugin.config = extend(true, {}, Plugin.config, config);
				callback(null, config);
			});
		}
	},

	config: {
		textFilter: function (text) {
			return Plugin.unescapeHtml(text);
		}
	},

	onLoad: function (params, callback) {

		var app = params.router, middleware = params.middleware;

		function render(req, res, next) {
			res.render('admin/plugins/' + pluginData.nbbId, pluginData);
		}

		app.get('/admin/plugins/' + pluginData.nbbId, middleware.applyCSRF, middleware.admin.buildHeader, render);
		app.get('/api/admin/plugins/' + pluginData.nbbId, middleware.applyCSRF, render);

		Plugin.init(callback);
	},

	init: function(callback) {

		// Load saved config
		var defaults = pluginData.defaultSettings,
				fields = Object.keys(defaults);

		meta.settings.get(pluginData.nbbId, function (err, options) {

			fields.forEach(function(field, i) {

				var savedValue = options[field],
						defaultValue = defaults[field],
						obj;

				if (field !== 'parseAgain') {
					obj = !savedValue ? field === 'allowedAttributes' ? '{}' : '[]' : savedValue;

					if (obj && typeof obj == 'string') {
						try {
							obj = JSON.parse(obj);
						} catch (e) {
							winston.warn('[plugins/' + pluginData.nbbId + '] e1: ' + e + ' can\'t JSON.parse option: ' + field + ' value: ' + obj + ' falling back to default.');
							obj = JSON.parse(defaultValue);
						}
					}
				} else {
					var noop = function (c) {
						return c;
					};
					try {
						// Function.apply(context, args (csv string), function-code (string))
						obj = Function.apply(Plugin, ['content, $', (savedValue ? savedValue : defaultValue) + '\nreturn content;' ]);

					} catch (e) {
						winston.warn('[plugins/' + pluginData.nbbId + '] e2: ' + e + ' can\'t parse function "' + field + '" falling back to noop.');
						obj = noop;
					}
					// let's see if it doesn't crash
					try {
						obj("test", $, "1", "2", "3");
					} catch (e) {
						// if it did, then too bad, you had a good run, but no thanks
						winston.warn('[plugins/' + pluginData.nbbId + '] e3: ' + e + ' | parseAgain code:[start] ' + obj + ' [end] has error, falling back to noop.');
						obj = noop;
					}
				}

				Plugin.config[field] = obj;
			});

			if (typeof callback === 'function') {
				callback();
			}
		});
	},

	sanitize: function (content) {
		return Plugin.config.parseAgain(sanitizeHtml(Plugin.unescapeHtml(content || ''), Plugin.config), $);
	},

	sanitizeSave: function (post, callback) {
		if (post && post.content) {
			post.content = Plugin.sanitize(post.content);
		}
		callback(null, post);
	},

	sanitizePost: function (data, callback) {
		if (data && data.postData && data.postData.content) {
			data.postData.content = Plugin.sanitize(data.postData.content);
		}
		callback(null, data);
	},

	sanitizeRaw: function (raw, callback) {
		callback(null, raw ? Plugin.sanitize(raw) : raw);
	},

	sanitizeSignature: function (data, callback) {
		if (data && data.userData && data.userData.signature) {
			data.userData.signature = Plugin.sanitize(data.userData.signature);
		}
		callback(null, data);
	},

	unescapeHtml: function (unsafe) {
		return unsafe
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&quot;/g, "\"")
				.replace(/&#039;/g, "'");
	},

	renderHelp: function (helpContent, callback) {
		helpContent += "<h2>Sanitized HTML</h2>"
		+ "<p>You can still use safe HTML, provided by <a href='https://github.com/akhoury/nodebb-plugin-sanitizehtml'>nodebb-plugin-sanitizehtml</a></p>"
		+ (function () {
			var allowedTags = "<h4>&nbsp;Allowed Tags</h4>";
			allowedTags += "<p class='text-muted'>&nbsp;&nbsp;";
			Plugin.config.allowedTags.forEach(function (tag, i) {
				if (i > 0) {
					allowedTags += ", ";
				}

				allowedTags += tag
			});
			allowedTags += !Plugin.config.allowedTags.length ? "No HTML tags allowed" : "";
			allowedTags += "</p>";
			return allowedTags;
		})()
		+ (function () {
			var allowedAttributes = "<h4>&nbsp;Allowed Attributes</h4>";
			allowedAttributes += "<p class='text-muted'>&nbsp;&nbsp;";
			var keys = Object.keys(Plugin.config.allowedAttributes || {});
			keys.forEach(function (tagName, i) {
				if (i > 0) {
					allowedAttributes += ", ";
				}
				var tag = Plugin.config.allowedAttributes[tagName];
				tag.forEach(function (attr, j) {
					if (j > 0) {
						allowedAttributes += ", ";
					}
					allowedAttributes += tagName + "." + attr;
				});
			});
			allowedAttributes += "</p>";
			return allowedAttributes;
		})()
		+ "<p class='text-warning'>&nbsp;Eveything else will be sanitized</p>";

		callback(null, helpContent);
	},
	admin: {
		menu: function (custom_header, callback) {
			custom_header.plugins.push({
				"route": '/plugins/' + pluginData.nbbId,
				"icon": pluginData.faIcon,
				"name": pluginData.name
			});
			callback(null, custom_header);
		},
		activate: function (id) {
			if (id === 'nodebb-plugin-' + pluginData.nbbId) {
				var defaults = pluginData.defaultSettings;

				async.each(defaults, function (optObj, next) {
					meta.settings.setOnEmpty(pluginData.nbbId, optObj.field, optObj.value, next);
				});
			}
		}
	}
};

Plugin.init();
module.exports = Plugin;