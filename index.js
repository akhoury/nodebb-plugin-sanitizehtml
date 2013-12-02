var	sanitizeHtml = require('sanitize-html'),
	fse = require('fs-extra'),
	path = require('path'),
	async = require('async'),
	RDB = module.parent.require('./redis'),
	defaultsGlobal = {
		allowedTags: '[ "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol", "nl", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div", "table", "thead", "caption", "tbody", "tr", "th", "td", "pre" ]',
		allowedAttributes: '{"a": [ "href", "name", "target" ], "img": ["src"] }',
		selfClosing: '[ "img", "br", "hr", "area", "base","basefont", "input", "link", "meta" ]'
	},
	SanitizeHtml = {
		config: {},
		init: function() {
			// Load saved config
			var	_self = this,
				fields = [
					'allowedTags',
					'allowedAttributes',
					'selfClosing'
				],
				hashes = fields.map(function(field) { return 'nodebb-plugin-sanitizehtml:options:' + field });

			RDB.hmget('config', hashes, function(err, options) {

				fields.forEach(function(field, idx) {
					var obj;
					options[idx] = options[idx] == 'undefined' /* redis wat */ || !options[idx] ? idx == 1 ? '{}' : '[]' : options[idx];
					try {
						obj = JSON.parse(options[idx]);
					} catch (e) {
					    console.log('[nodebb-plugin-sanitizehtml] e1: ' + e + ' can\'t parse option ' + field + ' falling back to default.');
						obj = JSON.parse(defaultsGlobal[field]);
					}
					options[idx] = obj;
					_self.config[field] = options[idx];
				});
			});
		},
		unescapeHtml: function(unsafe) {
			return unsafe
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&quot;/g, "\"")
				.replace(/&#039;/g, "'");
		},
		sanitize: function(raw) {
			return sanitizeHtml(this.unescapeHtml(raw), this.config);
		},
		reload: function(hookVals) {
			var	isSanitizeHtmlPlugin = /^nodebb-plugin-sanitizehtml:options:allowedTags/;
			if (isSanitizeHtmlPlugin.test(hookVals.key)) {
				this.init();
			}
		},
		admin: {
			menu: function(custom_header, callback) {
				custom_header.plugins.push({
					"route": '/plugins/sanitizehtml',
					"icon": 'icon-edit',
					"name": 'SanitizeHtml'
				});

				return custom_header;
			},
			route: function(custom_routes, callback) {
				fse.readFile(path.join(__dirname, 'public/templates/admin.tpl'), function(err, tpl) {
					custom_routes.routes.push({
						route: '/plugins/sanitizehtml',
						method: "get",
						options: function(req, res, callback) {
							callback({
								req: req,
								res: res,
								route: '/plugins/sanitizehtml',
								name: SanitizeHtml,
								content: tpl
							});
						}
					});

					callback(null, custom_routes);
				});
			},
			activate: function(id) {
				if (id === 'nodebb-plugin-sanitizehtml') {
					var	Meta = module.parent.require('./meta'),
						defaults = [
							{ field: 'allowedTags', value: defaultsGlobal.allowedTags },
							{ field: 'allowedAttributes', value: defaultsGlobal.allowedAttributes },
							{ field: 'selfClosing', value: defaultsGlobal.selfClosing }
						];

					async.each(defaults, function(optObj, next) {
						console.log(optObj.value);
						Meta.configs.setOnEmpty('nodebb-plugin-sanitizehtml:options:' + optObj.field, optObj.value, next);
					});
				}
			}
		}
	};

SanitizeHtml.init();
module.exports = SanitizeHtml;