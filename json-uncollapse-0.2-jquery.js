

(function ($) {
    $.fn.json_uncollapse = function (options) {
        if (typeof options === 'string') {
            var jo = $('.json-collapse', this).data('object');
            if (options == 'val') { return jo.text.val(); }
        }

        return this.each(function () {
            if (typeof options === 'object') {
                var juc = new JsonUncollapse(options);

                $(this).append(juc.bindTemplate());

                juc.init();
            }
        })
    }

    var JsonUncollapse = (function () {
        function JsonUncollapse(options) {
            this.options = $.extend({}, this.defaultOptions, options);
        }
        return JsonUncollapse;
    })();

    var jcls = JsonUncollapse.prototype;

    jcls.defaultOptions = { level1: true };

    jcls.bindTemplate = function () {
        this.root = $('<div class="json-collapse"></div>').data('object', this);
        this.lines = $('<div class="scr"></div>').appendTo(this.root);
        this.text = $('<textarea wrap="off"></textarea>').appendTo(this.root);

        return this.root;
    }

    jcls.init = function () {
        var jo = this;
        var jsonFormatted = this.format(this.options.json, this.options.level1);

        this.text.val(jsonFormatted);
        this.text.scroll(function () { jo.lines.scrollTop(this.scrollTop); });
        this.text.blur(function () { jo.restruct() });

        this.restruct();
    }

    jcls.format = function (json, level1_collapse) {
        var jsonFormatted;
        if (level1_collapse) {
            jsonFormatted = "{\n";
            for (var k in json) {
                jsonFormatted += "    \"" + k + "\": ";
                if ($.isArray(json[k])) {
                    jsonFormatted += "[\n";
                    for (var ari in json[k]) {
                        jsonFormatted += "        " + JSON.stringify(json[k][ari]) + (ari != json[k].length - 1 ? "," : "") + "\n";
                    }
                    jsonFormatted += "    ]";
                } else {
                    jsonFormatted += JSON.stringify(json[k]);
                }

                jsonFormatted += ",\n";
            }
            jsonFormatted = jsonFormatted.substring(0, jsonFormatted.length - 2);
            jsonFormatted += "\n}";
        } else {
            jsonFormatted = JSON.stringify(json, null, 4);
        }
        return jsonFormatted;
    }

    jcls.restruct = function () {
        var jo = this;
        var strs = this.text.val().split('\n'); // get array of lines
        var str = ''; // buffer for + and linenumbers
        var kol = 0;

        //generate line numbers and plus/minus for each
        for (var i = 0; i < strs.length; i++) {
            str += '<span class="ln">' + i + '</span><span i="' + i + '">-</span><br>'; kol = i;
        }

        var lines = this.lines.html(str + '<br>');

        $.each(strs, function (i, n) {
            var plus = (n.indexOf('{') != -1 && n.indexOf('}') != -1);
            if (n.search(/^(\s|\S)*(?!})(\s|\S)*{(\s|\S)*(?!})(\s|\S)*$/) != -1 || plus) {
                if (plus) { $('[i=' + i + ']', lines).html('+'); }
            } else {
                $('[i=' + i + ']', lines).hide();
            }
        });

        $('[i]', lines).click(function () {
            var i = parseInt($(this).attr('i'));
            if ($(this).html() == '-') {
                jo.collapse(i);
            } else {
                jo.uncollapse(i);
            }
        });
    }

    jcls.collapse = function (n) {
        var tv = this.text.val();
        var cola = tv.split('\n');
        var g = 0; var pi = n + 1; var colas = cola[pi - 1] + '\n';
        function m(mm) {
            return mm == null ? 0 : mm.length;
        }
        function cl(s) {
            var s1i = s.indexOf('\n'); var s1li = s.lastIndexOf('\n');
            var colpart = s.substr(s1i + 1, s1li - s1i - 1);
            var newstr = '';
            $.each(colpart.split('\n'), function (i, n) { newstr += n.trim() });

            return s.substr(0, s1i) + newstr + '\n';
        }

        while (g != -1) {
            colas += cola[pi] + '\n';
            g -= m(cola[pi].match(/}/g));
            g += m(cola[pi].match(/{/g));
            pi++;
        }

        this.text.val(tv.replace(colas, cl(colas)));
        this.restruct();
    }

    jcls.uncollapse = function (n) {
        var cola = this.text.val().split('\n');
        var iscomma = cola[n][cola[n].length - 1] == ',';
        var begofstr = '';
        if (iscomma) {
            var tojson = cola[n].substr(0, cola[n].length - 1);
        } else {
            var tojson = cola[n];
        }
        var spaces = tojson.match(/ +/g)[0];

        if (tojson[0] != '{') {
            tojson = tojson.replace(spaces, '');
            begofstr = tojson.substr(0, tojson.indexOf('{'));
            tojson = tojson.substr(tojson.indexOf('{'), cola[n].length);
        }
        var jsonObj = JSON.parse(tojson);

        if (this.options.level1when(jsonObj)) {
            cola[n] = begofstr + this.format(jsonObj, true) + (iscomma ? ',' : '');
        } else {
            cola[n] = begofstr + this.format(jsonObj, false) + (iscomma ? ',' : '');
        }
        var coland = cola[n].split('\n');
        cola[n] = '';

        $.each(coland, function (i, n1) { cola[n] += spaces + n1 + '\n'; });

        cola[n] = cola[n].substr(0, cola[n].length - 1);

        var colaJoined = cola.join('\n');
        this.text.val(colaJoined);
        this.restruct();
    }

})(jQuery)