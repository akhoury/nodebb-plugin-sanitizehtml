<h1><i class="fa {faIcon}"></i> {name}</h1>

<h3>Options (still shy)</h3>
 <p>
 	These raw options are strictly the <a href="https://github.com/punkave/sanitize-html" target="_blank">sanitize-html</a> module options.
 	At this early version, these options must be entered as <b>valid</b> JSON values, <b>non-valid</b> JSON will be ignored and fall back to defaults below.
 	 I will make this more user friendly as soon as I get a chance.
 </p>
<form role="form" class="{nbbId}-settings form">

<br />
<br />

	    <div class="form-group">
			<label for="allowedTags">
				This is an <i>Array</i> of allowed tags
			</label>
		    <input class="form-control" placeholder="leave blank or [ ] for none" type="text" name="allowedTags" id="allowedTags"/>
			<p class="help-block">
				if invalid entry, default is:
				<pre>[ "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol", "nl", "li", "b", "img", "i", "strong", "em", "strike", "code", "hr", "br", "div", "table", "thead", "caption", "tbody", "tr", "th", "td", "pre" ]</pre>
			</p>
		</div>

<br />
<br />

		<div class="form-group">
			<label for="allowedAttributes">
				This is an <i>Object</i> of allowed attributes of each each allowed tags
			</label>
			<input class="form-control" placeholder="leave blank or { } for none" type="text" name="allowedAttributes" id="allowedAttributes" />
			<p class="help-block">
				if invalid entry, default is:
				<pre>{"a": [ "href", "name", "target" ], "img": ["src", "class", "alt", "title"] }</pre>
			</p>
		</div>

<br />
<br />

		<div class="form-group">

			<label for="selfClosing">
				This is an <i>Array</i> of self closing option of each allowed tag
			</label>
			<input class="form-control" placeholder="leave blank or [ ] for none" type="text" name="selfClosing" id="selfClosing" />
			<p class="help-block">
				if invalid entry, default is:
				<pre>[ "img", "br", "hr", "area", "base","basefont", "input", "link", "meta" ]</pre>
			</p>
		</div>

<br />
<br />

    <label for="advancedShown">
        <input id="advancedShown" name="advancedShown" type="checkbox" data-toggle-target="div[for='parseAgain']"/> Show Advanced Option
    </label>

    <div for="parseAgain" class="form-group">

            <label>An extra parse function to be called on the content</label>

            <p class="help-block">
            This is a function that mutates the content even more, as the last call before showing the post,
            modify the "content" string at will, then return it, complete this function"s body, and only the body,
            (however you can "return" early - just don"t close the function block)
            if unsure, leave blank, if your syntax is invalid, it will be ignored.
            <br /> @Context: null
            <br /> @Arguments: {content} (just a String), {$} (THE jQuery, cuz i"m nice)
            <br /> Note: remember this is executing on the server side, so don"t compute heavy stuff, and there is no window object
            </p>

            <pre>
            var parseAgain = function (content, $) {
            </pre>

            <textarea placeholder="content = content.replace(/apples/g, 'oranges');" class="form-control" name="parseAgain" id="parseAgain"></textarea>

            <pre>
              return content;
            };
            </pre>
    </div>

    <br />

    <p class="help-block">
        If you"re not sure what to do, don"t change anything, or refer to the <a href="https://github.com/punkave/sanitize-html" target="_blank">sanitize-html readme</a> for more details.
    </p>

    <button type="button" class="btn btn-lg btn-primary" id="save">Save</button>
</form>

<script type="text/javascript">
	require(["settings"], function(Settings) {
     		var nbbId = "{nbbId}",
     		    klass = nbbId + "-settings";
     		    wrapper = $("." + klass);

             wrapper.find("input[type='checkbox']").on("change", function(e) {
                 var target = $(e.target),
                     toggle = wrapper.find(target.attr("data-toggle-target"));
                 if (target.is(":checked")) {
                     toggle.removeClass("hidden");
                 } else {
                     toggle.addClass("hidden");
                 }
             });

     		Settings.load(nbbId, wrapper, function(err, values) {
                // backward compatible
                var redeserialize = false;

                // do that again because we want to force parseable values to re-become strings again.
                ['allowedAttributes', 'allowedTags', 'selfClosing'].forEach(function(prop) {
                    if (values[prop] && typeof values[prop] != 'string') {
                       redeserialize = true;
                       values[prop] = JSON.stringify(values[prop]);
                    }
                });
				redeserialize && wrapper.deserialize(values);

                wrapper.find("input[type='checkbox']").trigger("change");
     		});

     		wrapper.find("#save").on("click", function(e) {
                 Settings.save(nbbId, wrapper, function() {
                        app.alert({
                            type: 'success',
                            alert_id: 'sanitizehtml-saved',
                            title: 'Reload Required',
                            message: 'Settings saved. Please reload your NodeBB to have your changes take effect',
                            clickfn: function() {
                                socket.emit('admin.reload');
                            }
                        });
                 });
     		});


     	});
</script>