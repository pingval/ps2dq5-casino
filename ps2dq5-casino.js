// ace editor 

"use strict";

var oop = ace.require("ace/lib/oop");
var TextHighlightRules = ace.require("ace/mode/text_highlight_rules").TextHighlightRules;
const TextMode = ace.require("ace/mode/text").Mode;

var PS2DQ5_10cHighlightRules = function() {
  this.$rules = {
    "start": [
      {
        token : "keyword",
        regex : "77777",
      },
      {
        token : "string",
        regex : "7777|55555|66666",
      },
      {
        token : "string",
        regex : "777|5555|6666",
      },
      {
        token : "comment",
        regex : "[0-9/]",
      },
      ],
  };
};
oop.inherits(PS2DQ5_10cHighlightRules, TextHighlightRules);
const PS2DQ5_10cMode = function() { this.HighlightRules = PS2DQ5_10cHighlightRules; };
oop.inherits(PS2DQ5_10cMode, TextMode);

var PS2DQ5_100cHighlightRules = function() {
    this.$rules = {
      "start": [
        {
          token : "keyword",
          regex : "7777|55555|66666|77777",
        },
        {
          token : "string",
          regex : "777|5555|6666",
        },
        {
          token : "comment",
          regex : "[0-9/]",
        },
        ],
    };
 };
oop.inherits(PS2DQ5_100cHighlightRules, TextHighlightRules);
const PS2DQ5_100cMode = function() { this.HighlightRules = PS2DQ5_100cHighlightRules; };
oop.inherits(PS2DQ5_100cMode, TextMode);

// const HighlightRules10C = function() {
//     this.$rules = {
//         "start" : [
//             { token: "constant.numeric", regex: "-?\\d+" }, // 数値
//             { token: "keyword", regex: "(?:LEFT|RIGHT|PANEL)" }, // 特定のキーワード
//             { token: "string", regex: '".*?"' }, // 文字列
//             { token: "comment", regex: "//.*$" } // コメント
//         ]
//     };
// };
// const oop = ace.require("ace/lib/oop");
// const TextMode = ace.require("ace/mode/text").Mode;
// const CustomMode = function() { this.HighlightRules = HighlightRules10C; };
// oop.inherits(CustomMode, TextMode);

// leftEditor.session.setMode(new CustomMode());
// rightEditor.session.setMode(new CustomMode());


//samples/side by side diff example

/**@type{typeof import("ace-builds/src-noconflict/ext-diff").createDiffView}*/
const createDiffView = ace.require("ace/ext/diff").createDiffView;

//example function to create side-by-side editors
const createSplitEditor = function (editorA, editorB) {
    const el = document.getElementById('example');
    var e0 = document.getElementById('editorA');
    // var s = document.getElementById('splitter');
    var e1 = document.getElementById('editorB');
    // e0.style.position = e1.style.position = s.style.position = "absolute";
    e0.style.position = e1.style.position = "absolute";
    el.style.position = "relative";

    const ratio = 0.5;

    var split = { $container: el };

    split.resize = function resize() {
        // var height = el.parentNode["clientHeight"] - el.offsetTop;
        var height = 500;
        var total = el.clientWidth;
        var w1 = total * ratio;
        var w2 = total * (1 - ratio);
        // s.style.left = w1 - 1 + "px";
        // s.style.height = el.style.height = height + "px";

        var st0 = editorA.container.style;
        var st1 = editorB.container.style;
        st0.width = w1 + "px";
        st1.width = w2 + "px";
        st0.left = 0 + "px";
        st1.left = w1 + "px";

        st0.top = st1.top = "0px";
        st0.height = st1.height = height + "px";

        editorA.resize();
        editorB.resize();
    };

    window.addEventListener("resize", split.resize);
    split.resize();
    return split;
};

const valueA = value10C;
const valueB = value100C;

// Create the editor (left side)
const editorA = ace.edit("editorA", {
    value: valueA,
    mode: new PS2DQ5_10cMode(),
});

// Create the editor (right side)
const editorB = ace.edit("editorB", {
    value: valueB,
    mode: new PS2DQ5_100cMode(),
});

for (const ed of [editorA, editorB]) {
  ed.setOption("firstLineNumber", -14);
  ed.setKeyboardHandler("ace/keyboard/emacs");
  ed.setTheme("ace/theme/twilight");
//   ed.setReadOnly(true);
//   ed.$readOnlyCallback = function(){};
//   ed.commands.addCommand({
//     name: "extendSearchTerm",
//     bindKey: {win: "2|3|4|5|6|7|/", mac: "2|3|4|5|6|7|/"},
//     exec: IncrementalSearch.addString,
//   });
  ed.commands.addCommand({
    name: "toggleFocus",
    bindKey: {win: "Ctrl+Tab", mac: "Ctrl+Tab"},
    exec: (e) => {
      const next = (ed == editorA) ? editorB : editorA;
      next.focus();
    }});
  ed.commands.addCommand({
    name: "openJackpotList",
    bindKey: {win: "Shift+Tab", mac: "Shift+Tab"},
    exec: (e) => {
        document.querySelector("#jackpot-list .tabulator-tableholder").focus();
    }});
  ed.commands.addCommand({
    name: "openJackpotListAndstartTimer",
    bindKey: {win: "Tab", mac: "Tab"},
    exec: (e) => {
        CountdownTimer(null);

        console.log([e.getCursorPosition().row, e.getCursorPosition().column]);
        const [from_roll, from_reel] = ps2dq5_rowcol2rollreel(e.getCursorPosition().row, e.getCursorPosition().column);
        console.log([from_roll, from_reel]);
        document.querySelector("#jackpot-list .tabulator-tableholder").focus();

        const data = JackpotList.getData();
        for (const row of data) {
          row.wait = ps2dq5_calc_wait ([from_roll, from_reel], [row.roll, row.reel]);
          console.log(row.wait);
        }
        JackpotList.updateData(data);
    }});
  ed.addEventListener('focus',(e) => {
    const prev = (ed == editorA) ? editorB : editorA;
    const next = ed;
    prev.container.classList.add('inactive')
    next.container.classList.remove('inactive');
    activeEditor = next;
  });
}

const ps2dq5_wait_offset = 0.5;
const ps2dq5_calc_wait = function (from, to) {
  const r = (to[0] - from[0]) / 6 + (to[1] - from[1]) * 1/30 + ps2dq5_wait_offset;
  return Math.round(r * 1000) / 1000;
}

const ps2dq5_rollreel2rowcol = function (roll, reel) {
  const row = roll + 14;
  const col = (reel - 1) * 18;
  return [row, col];
}
const ps2dq5_rowcol2rollreel = function (row, col) {
  const roll = row - 14;
  const reel = Math.floor(col / 18) + 1;
  return [roll, reel];
}

// Highlight Active Line

/**@type{import("ace-builds/src-noconflict/ext-diff").DiffViewOptions}*/
const options = {
    syncSelections: true, //Whether to synchronize selections between both editors
    ignoreTrimWhitespace: true, //Whether to ignore trimmed whitespace when computing diffs
}

// Turn on the split diff
const diffView = createDiffView({
    editorA: editorA,  // left-hand editor
    editorB: editorB    // right-hand editor
}, options);

// prepare layout for two editors
createSplitEditor(editorA, editorB);

const CmdLine = function(el, ed) {
    var renderer = new (ace.require("ace/virtual_renderer").VirtualRenderer)(el);
    el.style.overflow = "hidden";

    renderer.screenToTextCoordinates = function(x, y) {
        var pos = this.pixelToScreenCoordinates(x, y);
        return this.session.screenToDocumentPosition(
            Math.min(this.session.getScreenLength() - 1, Math.max(pos.row, 0)),
            Math.max(pos.column, 0)
        );
    };

    renderer.$maxLines = 4;

    renderer.setStyle("ace_one-line");
    var editor = new (ace.require("ace/editor").Editor)(renderer);

    editor.setShowPrintMargin(false);
    editor.renderer.setShowGutter(false);
    editor.renderer.setHighlightGutterLine(false);
    editor.$mouseHandler.$focusWaitTimout = 0;

    editor.setOption("placeholder", "Enter a command...");
    editor.editor = ed;
    ed.cmdLine = editor;

    ed.showCommandLine = function(val) {
        this.cmdLine.focus();
        if (typeof val == "string")
            this.cmdLine.setValue(val, 1);
    };
}

CmdLine(document.getElementById('consoleA'), editorA);
CmdLine(document.getElementById('consoleB'), editorB);

// const JackpotData = fetch('./ps2dq5-jackpotdata.json').then(response => response.json()).then( data => data);

const msecfmt = function(val) {
    const min = Math.floor(val / 60);
    const sec = Math.floor(val % 60);
    const msec = Math.floor(val % 1 * 1000);
    return `${min}:${sec.toString().padStart(2, 0)}.${msec.toString().padEnd(3, 0)}`;
}

const JackpotList = new Tabulator("#jackpot-list", {
    height:"500",
    // layout : "fitColumns",
    ajaxURL: './ps2dq5-casino-jackpotdata.json',
    selectableRange : true , 
    selectableRangeColumns: true,
    columnDefaults: {
      headerHozAlign: "center",
      hozAlign: "right",
      headerSort: false,
    },
    keybindings:{
        // "navPrev" : false,
        // "navNext" : false,
    },
    columns:[
    {title:"待ち時間", field:"wait", sorter: "time",
        formatter: function(cell, _, __){
            const val = cell.getValue();
            if (val == -1) return "";

            return msecfmt(val);
        },
    },
    {title:"スロット", field:"slot"},
    {title:"回転数", field:"roll", sorter: "number"}, // roll?
    {title:"ライン", field:"reel", sorter: "number"}, // reel?
    {title:"獲得コイン枚数", field:"payout", sorter: "number"},
    {title:"必要コイン枚数", field:"bet", sorter: "number"},
    {title:"当選確率", field:"odds", sorter: "number"},
    {title:"備考", field:"note", hozAlign: "left"},
    ],
});

// JackpotList.on("rowClick", function(e, row){
//     alert("Row " + row.getIndex() + " Clicked!!!!")
// });

document.querySelector("#jackpot-list").addEventListener("keydown", function(e){
  if (e.key != "Tab") return;
  
//   const activeRow = document.querySelector("#jackpot-list .tabulator-row.tabulator-range-highlight");
//   console.log(activeRow);
//   const idx = 1 + Array.prototype.indexOf.call(document.querySelectorAll("#jackpot-list .tabulator-row"), activeRow);
//   console.log(idx);

  const idx = 1 + JackpotList.getRanges()[0].getTopEdge();
  console.log(JackpotList.getRow(idx));
  const rowData = JackpotList.getRow(idx).getData();
  console.log(rowData.roll, rowData.reel, rowData.wait);

  const [row, col] = ps2dq5_rollreel2rowcol(rowData.roll, rowData.reel);
  targetTime = rowData.wait;
  console.log(row, col, rowData.wait*1000);

  const _100cp = rowData.slot == "100C";

  if (_100cp) {
    editorB.focus();
    editorB.gotoLine(row+ps2dq5_jackpotJump_row_offset, col);
  } else {
    editorA.focus();
    editorB.gotoLine(row+ps2dq5_jackpotJump_row_offset, col);
  }


// e.blur();
});

const ps2dq5_jackpotJump_row_offset = -15;


// JackpotList.on("cellEditing", function(cell){
    // alert();
// });

// hozAlign 
// headerSort 

let activeEditor = editorA;

// tabulator-range-selected tabulator-range-only-cell-selected
// tabulator-range-highlight

// 横分割、縦分割どちらもいける
// 10c/100cはどちらかだけ表示する

let T = null;
let targetTime = null;
const CountdownTimerElement = document.querySelector("#countdown-timer");
const CountdownTimer = function () {
    const baseTime = new Date;
    clearInterval(T);
    T = setInterval(function() {
        const remaining = (!targetTime
                           ? "未設定"
                           : msecfmt((targetTime * 1000 - (new Date - baseTime)) / 1000));
        const elapsed = msecfmt((new Date - baseTime) / 1000);
        CountdownTimerElement.innerHTML = `残り${remaining} (${elapsed}経過)`;
    });
};
