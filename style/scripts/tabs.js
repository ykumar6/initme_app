var CodeModule  = function(codeBoxes) {

   var codeBoxArray = codeBoxes;
   var codeEditors = new Array(codeBoxArray.length);   
   var codeEditorHandles = {};

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
		codeEditorHandles["main.php"].refresh();
	}
	else {
		codeEditorHandles["additional.php"].refresh();
		codeEditorHandles["css.php"].refresh();

	}
   };

   function doFocus() {
	codeEditorHandles["main"].focus();
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
	$(".theBtn.fork").removeClass("disabled");
	if (!$(".saveStatus").hasClass("active")) {
		$(".saveStatus").addClass("active");
	}
   }
   
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
	"focus": doFocus
   }
   
   
};
