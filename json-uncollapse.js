function Show(p) {
    FormatAndShow(p.GridConfig, $('div[config=GridConfig]'), null, true);
    FormatAndShow(p.UserConfig, $('div[config=UserConfig]'), null, true);
}

//function LoadFromLocalStorage(div) {
//    var lsname = localStorage.CurrentDatabase + '_' + div.attr('config');
//    var ta = $('textarea', $('div[config=' + div.attr('config') + ']'));
//    if (localStorage[lsname] != null && JSON.stringify(JSON.parse(localStorage[lsname])) == JSON.stringify(JSON.parse(ta.val())))
//        ta.val(localStorage[lsname]);
//}

function TextAreaChange(div) {
    if (div.target) { div = $(div.target).parents('div[dbname]'); var istarget = true; }
    //if (!window.firsttime) {
    //    var lsname = localStorage.CurrentDatabase + '_' + div.attr('config');
    //    localStorage[lsname] = $('textarea', $('div[config=' + div.attr('config') + ']')).val();
    //}

    if (istarget) { Restruct(div, false, true); }
}

function FormatAndShow(json, div, toshow, level1_collapse) {
    var json = json;
    var textarea = $("textarea", div);

    var jsonFormatted = GetJsonFormatted(json, level1_collapse);
    var jsonSplit = SplitJsonFormatted(jsonFormatted);


    textarea.val(jsonFormatted);
    Restruct(div, true);
    textarea.scroll(function () { console.log('scroll'); $(this).parents('div:first').find('.scr')[0].scrollTop = this.scrollTop; });
    textarea.blur(function () { Restruct($('#t'))  });
    ReCountRowsCols(textarea, jsonSplit);
}
function GetJsonFormatted(json, level1_collapse) {
    var jsonFormatted;
    if (level1_collapse) {
        jsonFormatted = "{ \n";
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
function SplitJsonFormatted(jsonFormatted) {
    return jsonFormatted.split(/\r\n|\r|\n/);
}

function ReCountRowsCols(textarea, jsonSplit) {
    if ((typeof (jsonSplit) == 'string')) {
        jsonSplit = SplitJsonFormatted(jsonSplit);
    }
    textarea[0].cols = jsonSplit.sort(function (a, b) { return b.length - a.length })[0].length;

    if (jsonSplit.length > 50) {
        jsonSplit.length = 50;
    }

    textarea[0].rows = jsonSplit.length;

    textarea.parents('tr').find('.scr').height($(textarea[0]).height());
}

function Restruct(div, doLoad, re) {
    var strs = $('textarea', div).val().split('\n');
    var str = '';
    var kol = 0;
    for (var i = 0; i < strs.length; i++) {
        str += '<span style="margin-right: 10px">' + i + '</span><span i="' + i + '">-</span><br>'; kol = i;
    }
    for (var i = 0; i < 10; i++) { str += '<br>'; }
    $('.scr', div).html(str);

    var arr = []; var ob = {}; var ii = 0;
    $('.scr [i]', div).show();
    $.each(strs, function (i, n) {
        var plus = (n.indexOf('{') != -1 && n.indexOf('}') != -1);
        if (n.search(/^(\s|\S)*(?!})(\s|\S)*{(\s|\S)*(?!})(\s|\S)*$/) != -1 || plus) {
            var p = arr.pop();
            if (p) { p.k = ii; arr.push(p); }
            arr.push({ l: i }); ii = 0;
            if (plus) { $('.scr [i=' + i + ']', div).html('+'); }
        } else {
            $('.scr [i=' + i + ']', div).hide();
        }
        ii++;
    });

    $('.scr [i]', div).click(function () {
        var i = parseInt($(this).attr('i'));
        var p = $('#t');
        if ($(this).html() == '-') {
            Collapse(i, p);
        } else {
            Uncollapse(i, p);
        }
    });

    if (!re) TextAreaChange(div);
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
        cola[n] = begofstr + JSON.stringify(jsonObj, null, 4) + (iscomma ? ',' : '');
    }
    var coland = cola[n].split('\n');
    cola[n] = '';

    $.each(coland, function (i, n1) { cola[n] += spaces + n1 + '\n'; });

    cola[n] = cola[n].substr(0, cola[n].length - 1);

    var colaJoined = cola.join('\n');
    ta.val(colaJoined);
    ReCountRowsCols(ta, colaJoined);
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
    var t = ta.val();

    t = t.replace(colas, cl(colas));
    ta.val(t);
    ReCountRowsCols(ta, t);
    Restruct(div);
}