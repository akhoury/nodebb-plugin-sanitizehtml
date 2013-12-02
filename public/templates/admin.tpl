<!-- todo: move this out! -->
<style>
	input {
		display: block;
		width: 100%;
	}
	label {
		display: block;
		margin: 10px 5px;
	}
	form {
		width: 100%;
	}
	code {
		max-width: 100%;
		overflow: auto;
	}
	.nodebb-plugin-sanitizehtml-option {
		margin-bottom: 50px;
	}
</style>

<h2> Sanitize HTML </h2>

<h3>Options (still shy)</h3>
 <p>
 	These raw options are strictly the <a href="https://github.com/punkave/sanitize-html" target="_blank">sanitize-html</a> module options.
 	At this early version, these options must be entered as <b>valid</b> JSON values, <b>non-valid</b> JSON will be ignored and fall back to defaults below.
 	 I will make this more user friendlsy as soon as I get a chance.
 </p>
<form class='form'>
	<div class='form-group'>

		<div class="nodebb-plugin-sanitizehtml-option">
			<label for='allowedTags'>
				This is an <i>Array</i> of allowed tags
				<input placeholder='leave blank or [ ] for none' type='text' data-field='nodebb-plugin-sanitizehtml:options:allowedTags' id='allowedTags'/>
			</label>
			<p>
				if invalid entry default is:
				<pre>[ "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol", "nl", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div", "table", "thead", "caption", "tbody", "tr", "th", "td", "pre" ]</pre>
			</p>
		</div>

		<div class="nodebb-plugin-sanitizehtml-option">
			<label for='allowedAttributes'>
				This is an <i>Object</i> of allowed attributes of each each allowed tags
				<input placeholder='leave blank or { } for none' type='text' data-field='nodebb-plugin-sanitizehtml:options:allowedAttributes' id='allowedAttributes' />
			</label>
			<p>
				if invalid entry default is:
				<pre>{"a": [ "href", "name", "target" ], "img": ["src"] }</pre>
			</p>
		</div>

		<div class="nodebb-plugin-sanitizehtml-option">
			<label for='selfClosing'>
				This is an <i>Array</i> of self closing option of each allowed tag
				<input placeholder='leave blank or [ ] for none' type='text'  data-field='nodebb-plugin-sanitizehtml:options:selfClosing' id='selfClosing' />
			</label>
			<p>
				if invalid entry default is:
				<pre>[ "img", "br", "hr", "area", "base","basefont", "input", "link", "meta" ]</pre>
			</p>
		</div>
        <br />
		<p>If you're not sure what to do, don't change them, or refer to the <a href="https://github.com/punkave/sanitize-html" target="_blank">sanitize-html readme</a> for more details.

	</div>
	<button class='btn btn-lg btn-primary' id='save'>Save</button>
</form>

<script type='text/javascript'>
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
</script>