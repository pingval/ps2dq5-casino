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
        token : "variable",
        regex : "7777|55555|66666",
      },
      {
        token : "variable",
        regex : "777|5555|6666",
      },
      {
        token : "comment",
        regex : "[0-9/-]",
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
          token : "variable",
          regex : "777|5555|6666",
        },
        {
          token : "comment",
          regex : "[0-9/-]",
        },
        ],
    };
 };
oop.inherits(PS2DQ5_100cHighlightRules, TextHighlightRules);
const PS2DQ5_100cMode = function() { this.HighlightRules = PS2DQ5_100cHighlightRules; };
oop.inherits(PS2DQ5_100cMode, TextMode);

// const createDiffView = ace.require("ace/ext/diff").createDiffView;

//container function to create side-by-side editors
const createSplitEditor = function (editor10C, editor100C) {
    const el = document.getElementById('container');
    var e0 = document.getElementById('editor10C');
    var e1 = document.getElementById('editor100C');

    var split = { $container: el };

    split.resize = function resize() {
      const height = document.documentElement.clientHeight - el.offsetTop;
      // console.log(document.documentElement.clientHeight, el.offsetTop);
      el.style.display = "grid";
      el.style.gridAutoFlow = "column";
      el.style.gridTemplateColumns = "670px 670px 780px";
      el.style.gridTemplateRows = `${height-30}px 20px`;

      editor10C.resize();
      editor100C.resize();
    };

    window.addEventListener("resize", split.resize);
    split.resize();
    return split;
};

fetch("./ps2dq5-10C.txt")
  .then(response => response.text())
  .then(text => editor10C.setValue(text) && editor10C.session.getUndoManager().reset());
fetch("./ps2dq5-100C.txt")
  .then(response => response.text())
  .then(text => editor100C.setValue(text) && editor100C.session.getUndoManager().reset());

// Create the editor (left side)
const editor10C = ace.edit("editor10C", {
  
  mode: new PS2DQ5_10cMode(),
});

// Create the editor (right side)
const editor100C = ace.edit("editor100C", {
  mode: new PS2DQ5_100cMode(),
});

for (const ed of [editor10C, editor100C]) {
  ed.setOption("firstLineNumber", -14);
  ed.setKeyboardHandler("ace/keyboard/emacs");
  // ed.setTheme("ace/theme/monokai");
//   ed.setReadOnly(true);
//   ed.$readOnlyCallback = function(){};
//   ed.commands.addCommand({
//     name: "extendSearchTerm",
//     bindKey: {win: "2|3|4|5|6|7|/", mac: "2|3|4|5|6|7|/"},
//     exec: IncrementalSearch.addString,
//   });
  ed.commands.addCommand({
    name: "toggleFocus",
    bindKey: {win: "Tab", mac: "Tab"},
    exec: (e) => {
      const next = (ed == editor10C) ? editor100C : editor10C;
      next.focus();
    }});
  ed.commands.addCommand({
    name: "openJackpotList",
    bindKey: {win: "Shift+Tab", mac: "Shift+Tab"},
    exec: (e) => {
        document.querySelector("#jackpot-list .tabulator-tableholder").focus();
    }});

  // Enterで改行しないように(readOnlyは有効にするとisearchできなくなる)
  ed.commands.removeCommand("insertstring");

  ed.commands.addCommand({
    name: "openJackpotListAndstartTimer",
    bindKey: {win: "Enter", mac: "Enter"},
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
}
editor10C.setTheme("ace/theme/twilight");
editor10C.setStyle("ace_10c");
editor100C.setTheme("ace/theme/twilight");
editor100C.setStyle("ace_100c");


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

// const options = {
//     syncSelections: true,
//     ignoreTrimWhitespace: true,
// }

// const diffView = createDiffView({
//     editor10C: editor10C,
//     editor100C: editor100C,
// }, options);
createSplitEditor(editor10C, editor100C);

const CmdLine = function(el, ed, placeholder) {
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

    editor.setOption("placeholder", placeholder);
    editor.setOption("fontSize", 20);
    editor.editor = ed;
    ed.cmdLine = editor;

    ed.showCommandLine = function(val) {
        this.cmdLine.focus();
        if (typeof val == "string")
            this.cmdLine.setValue(val, 1);
    };
}

CmdLine(document.getElementById('console10C'), editor10C, "10コインスロット出目表 | 🍒2/🔵3/🔔4/🍉5/BAR6/7️⃣7");
CmdLine(document.getElementById('console100C'), editor100C, "100コインスロット出目表 | 🍒2/🔵3/🔔4/🍉5/BAR6/7️⃣7");

const msecfmt = function(val) {
    const min = Math.floor(val / 60);
    const sec = Math.abs(Math.floor(val % 60));
    const msec = Math.abs(Math.floor(val % 1 * 1000));
    return `${min}:${sec.toString().padStart(2, 0)}.${msec.toString().padEnd(3, 0)}`;
}

const JackpotList = new Tabulator("#jackpot-list", {
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
    rowFormatter: function(row) {
      const payout = row.getData().payout;

      if (payout.includes("0万")) {
        row.getElement().style.backgroundColor = "#396";
        row.getElement().style.color = "white";
        row.getElement().style.fontWeight = "bold";
      } else if (payout.includes("万")) {
        row.getElement().style.backgroundColor = "#9fc";
      }
    },
    columns:[
    {title:"&nbsp;&nbsp;待ち時間&nbsp;&nbsp;", field:"wait", sorter: "time",
        formatter: function(cell, _, __){
            const val = cell.getValue();
            if (isNaN(val)) return "";

            return msecfmt(val);
        },
    },
    {title:"スロット", field:"slot"},
    {title:"回転数", field:"roll", sorter: "number"}, // roll?
    {title:"パターン", field:"reel", sorter: "number"}, // reel?
    {title:"獲得コイン枚数", field:"payout", sorter: "number"},
    {title:"必要コイン枚数", field:"bet", sorter: "number"},
    {title:"当選確率", field:"odds", sorter: "number"},
    {title:"備考", field:"note", hozAlign: "left"},
    ],
});

document.querySelector("#jackpot-list").addEventListener("keydown", function(e){
  if (e.key != "Enter") return;
  e.preventDefault();
  
  const idx = 1 + JackpotList.getRanges()[0].getTopEdge();
  // console.log(JackpotList.getRow(idx));
  const rowData = JackpotList.getRow(idx).getData();
  // console.log(rowData.roll, rowData.reel, rowData.wait);

  const [row, col] = ps2dq5_rollreel2rowcol(rowData.roll, rowData.reel);
  Target.wait = rowData.wait;
  Target.roll = rowData.roll;
  Target.reel = rowData.reel;
  // console.log(row, col, rowData.wait*1000);

  const _100cp = rowData.slot == "100C";

  if (_100cp) {
    editor100C.focus();
    editor100C.gotoLine(row+ps2dq5_jackpotJump_row_offset, col);
  } else {
    editor10C.focus();
    editor100C.gotoLine(row+ps2dq5_jackpotJump_row_offset, col);
  }
});

const ps2dq5_jackpotJump_row_offset = -15;

let T = null;
const Target = {
  wait: null,
  roll: null,
  reel: null,
};
const CountdownTimerElement = document.querySelector("#countdown-timer");
const CountdownTimer = function () {
  const baseTime = new Date;
  clearInterval(T);
  T = setInterval(function() {
    const elapsed = msecfmt((new Date - baseTime) / 1000);
    if (Target.wait === null) {
      CountdownTimerElement.innerHTML = `目標未設定 (${elapsed}経過)`;
      return;
    }
    const target = `${Target.roll}-${Target.reel}`;
    const remaining = msecfmt((Target.wait * 1000 - (new Date - baseTime)) / 1000);
    CountdownTimerElement.innerHTML = `目標${target} / 残り${remaining} (${elapsed}経過)`;    
  });
};

window.onload = function() {
  const containerList = [
    [editor10C, document.querySelector("#editor10C")],
    [editor100C, document.querySelector("#editor100C")],
    [document.querySelector("#jackpot-list .tabulator-tableholder"), document.querySelector("#jackpot-list")],
  ];

  for (const [ed, container] of containerList) {
    // console.log([ed, container]);
    ed.addEventListener('focus',(e) => {
      // console.log(e);
      for (const [_ed, _container] of containerList) {
        if (ed == _ed)
          _container.classList.remove('inactive')
        else
          _container.classList.add('inactive');
      }
      if (ed == editor10C) {
        document.querySelector("#container").style.gridTemplateColumns = "670px 0px 780px";
      } else if (ed == editor100C) {
        document.querySelector("#container").style.gridTemplateColumns = "0px 670px 780px";
      }
    });
  }
  editor10C.focus();
  editor10C.gotoLine(0, 0);
}

function syncEditors(source, target) {
  // スクロール同期
  const scrollTop = source.session.getScrollTop();
  const scrollLeft = source.session.getScrollLeft();
  target.session.setScrollTop(scrollTop);
  target.session.setScrollLeft(scrollLeft);

  // カーソル同期
  const cursor = source.getCursorPosition();
  target.moveCursorTo(cursor.row, cursor.column);
}

editor10C.session.on('changeScrollTop', () => syncEditors(editor10C, editor100C));
editor100C.session.on('changeScrollTop', () => syncEditors(editor100C, editor10C));
editor10C.selection.on('changeCursor', () => syncEditors(editor10C, editor100C));
editor100C.selection.on('changeCursor', () => syncEditors(editor100C, editor10C));

// 水色と赤
