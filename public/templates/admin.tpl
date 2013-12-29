<!-- todo: move this out! -->
<style>
	input[type='text'],
	textarea {
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
				<input class='form-control' placeholder='leave blank or [ ] for none' type='text' data-field='nodebb-plugin-sanitizehtml:options:allowedTags' id='allowedTags'/>
			</label>
			<p>
				if invalid entry, default is:
				<pre>[ "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol", "nl", "li", "b", "img", "i", "strong", "em", "strike", "code", "hr", "br", "div", "table", "thead", "caption", "tbody", "tr", "th", "td", "pre" ]</pre>
			</p>
		</div>

		<div class="nodebb-plugin-sanitizehtml-option">
			<label for='allowedAttributes'>
				This is an <i>Object</i> of allowed attributes of each each allowed tags
				<input class='form-control' placeholder='leave blank or { } for none' type='text' data-field='nodebb-plugin-sanitizehtml:options:allowedAttributes' id='allowedAttributes' />
			</label>
			<p>
				if invalid entry, default is:
				<pre>{"a": [ "href", "name", "target" ], "img": ["src"] }</pre>
			</p>
		</div>

		<div class="nodebb-plugin-sanitizehtml-option">
			<label for='selfClosing'>
				This is an <i>Array</i> of self closing option of each allowed tag
				<input class='form-control' placeholder='leave blank or [ ] for none' type='text'  data-field='nodebb-plugin-sanitizehtml:options:selfClosing' id='selfClosing' />
			</label>
			<p>
				if invalid entry, default is:
				<pre>[ "img", "br", "hr", "area", "base","basefont", "input", "link", "meta" ]</pre>
			</p>
		</div>

<!-- dafuq is dis chit? -->
<label for="advancedShown">
<input type="checkbox" onclick="$('label[for=\'parseAgain\']').parent().toggle();" style="display:inline-block"/>
Show Advanced Option
</label>

<div class='nodebb-plugin-sanitizehtml-option' style='display:none;'>
<label for='parseAgain' >
An extra parse function to be called on the content
<pre>
// this is a function that mutates the content even more, as the last call before showing the post
// modify the 'content' string at will, then return it

// complete this function's body, and only the body
// (however you can 'return' early - just don't close the function block)
// !! if unsure, leave blank
// if your syntax is invalid, it will be ignored.


// @Context: null
// @Arguments:
      {content} just a String
      {$} THE jQuery, cuz i'm nice

// note: remember this is executing on the server side, so don't compute heavy stuff, and there is no window object

</pre>
<pre>
var parseAgain = function (content, $) {
</pre>
<textarea class='form-control' data-field='nodebb-plugin-sanitizehtml:options:parseAgain' id='parseAgain'>
</textarea>
<pre>
  return content;
};
</pre>
</label>

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