var CodeModule  = function(codeBoxes) {

   var codeBoxArray = codeBoxes;
   var codeEditors = new Array(codeBoxArray.length);   
   var codeEditorHandles = {};
   var isCodeChanged = false;
   
   function _save(cb) {
	async.forEach(codeEditors,
 		function(item, callback) {
			if (item.changed) {
				$.ajax({
					type: "POST",
					url: "http://" + document.domain + "/" + document.projectId + "-portal/files/" + item.fileName,
					data: item.editor.getValue(),
					success: function() {
						callback(null);
					},
					error: function() {
						callback(true);
					}
				});
			} else {
				callback(null);
			}
		},
		function(err) {
			if (!err) {
				for (var i=0; i<codeEditors.length; i++) {
					codeEditors[i].changed = false;
				}
				isCodeChanged = false;
				$(".saveStatus").removeClass("active");
			}
			cb(err);
		}
	);
   }

   function push(cb) {
	_save(function(err) {
		$("body").trigger("push", [{result: err ? false : true}]);
		if (cb) cb(err);
	});
	
   };

   function save(cb) {
	_save(function(err) {
		$("body").trigger("save", [{result: err ? false : true}]);
		if (cb) cb(err);
	});
	
   };

   function refresh(area) {
	if (area === "main") {
		codeEditorHandles["main"].refresh();
	}
	else {
		codeEditorHandles["additional"].refresh();
		codeEditorHandles["css"].refresh();

	}
   };
   
   function setLine(editor, lineNumber, lineText) {
   		codeEditorHandles[editor].setLine(lineNumber, lineText);
   };

   function doFocus() {
		codeEditorHandles["javascript"].focus();
   };


   function reset(cb) {
	for (var i=0; i<codeEditors.length; i++) {
		var editor = codeEditors[i].editor;
		var undoSize = editor.historySize().undo;
		for (var j=0; j<undoSize; j++) {
			editor.undo();
		}
	}
   };

   function codeChanged(index) {
	codeEditors[index].changed = true;
	isCodeChanged = true;
	$(".reloadCode .btn").removeClass("disabled");
	if (!$(".saveStatus").hasClass("active")) {
		$(".saveStatus").text("Unsaved Changes... Click run");
		$(".saveStatus").addClass("active");
	}
   }

   function isChanged() {
	return isCodeChanged;
   };

   
   function _initEditor(index) {
       var textArea = $(".code", codeBoxArray[index]);
       var editorName = textArea.attr("name");
       var editorMode = textArea.attr("mode");

	var onFocus = function() {

	};

	var unFocus = function() {
		
	};
	
       var codeEditor = CodeMirror.fromTextArea(textArea[0], {
	     lineNumbers: true,
            mode: editorMode,
	     matchBrackets : true,
	     onChange: function() {
			codeChanged(index);
	     }
       });       

	codeEditorHandles[editorName] = codeEditor;

       return codeEditor;
   };
   

   //hide all tabs, attach event handlers
   for (var i=0; i<codeBoxArray.length; i++) {
       codeBoxArray [i] = $(codeBoxArray[i]);
   }

   for (var j=0; j<codeBoxArray.length; j++) {
   	codeEditors[j] = {"editor": _initEditor(j), "changed": false, "fileName": codeBoxArray[j].attr("fileName")};
   }

	$('a[data-toggle="tab"]').on('shown', function (e) {
 	 	var tabName = ($(e.target).attr("href") || "").replace("#", "");
		codeEditorHandles[tabName].refresh();
	});

   return {
	"push": push,
	"save": save,
	"reset": reset,
	"refresh": refresh,
	"focus": doFocus,
	"isChanged": isChanged,
	"setLine": setLine
   }
   
   
};
