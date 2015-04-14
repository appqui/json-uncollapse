





var t;

function FormatAndShow(json, div, level1_collapse) {
    //var json = json;
    var textarea = $("textarea", div);
    t = div;
    var jsonFormatted = GetJsonFormatted(json, level1_collapse);


    textarea.val(jsonFormatted);
    textarea.scroll(function () { div.find('.scr')[0].scrollTop = this.scrollTop; });
    textarea.blur(function () { Restruct(t) });

    Restruct(div, true);
}

function GetJsonFormatted(json, level1_collapse) {
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

function Restruct(div/*, doLoad, re*/) {

    var strs = $('textarea', div).val().split('\n'); // get array of lines
    var str = ''; // buffer for + and linenumbers
    var kol = 0;

    //generate line numbers and plus/minus for each
    for (var i = 0; i < strs.length; i++) {
        str += '<span class="ln">' + i + '</span><span i="' + i + '">-</span><br>'; kol = i;
    }
    str += '<br>';
    $('.scr', div).html(str);

    $.each(strs, function (i, n) {
        var plus = (n.indexOf('{') != -1 && n.indexOf('}') != -1);
        if (n.search(/^(\s|\S)*(?!})(\s|\S)*{(\s|\S)*(?!})(\s|\S)*$/) != -1 || plus) {
            if (plus) { $('.scr [i=' + i + ']', div).html('+'); }
        } else {
            $('.scr [i=' + i + ']', div).hide();
        }
    });

    $('.scr [i]', div).click(function () {
        var i = parseInt($(this).attr('i'));
        if ($(this).html() == '-') {
            Collapse(i, t);
        } else {
            Uncollapse(i, t);
        }
    });
}

function Uncollapse(n, div) {
    var ta = $('textarea', div);
    var cola = ta.val().split('\n');
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

    if (jsonObj.Url || jsonObj.Table || jsonObj.TableMain || jsonObj.Change) {
        cola[n] = begofstr + GetJsonFormatted(jsonObj, true) + (iscomma ? ',' : '');
    } else {
        cola[n] = begofstr + GetJsonFormatted(jsonObj, false) + (iscomma ? ',' : '');
    }
    var coland = cola[n].split('\n');
    cola[n] = '';

    $.each(coland, function (i, n1) { cola[n] += spaces + n1 + '\n'; });

    cola[n] = cola[n].substr(0, cola[n].length - 1);

    var colaJoined = cola.join('\n');
    ta.val(colaJoined);
    Restruct(div);
}


function Collapse(n, div) {
    var ta = $('textarea', div);
    var cola = ta.val().split('\n');
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
    var tv = ta.val();

    tv = tv.replace(colas, cl(colas));
    ta.val(tv);
    Restruct(div);
}