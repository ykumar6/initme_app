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
	$(".button.save").removeClass("disabled");
	$(".button.reset").removeClass("disabled");
   }
   
   function _initEditor(index) {
       var textArea = $(".code", codeBoxArray[index]);
       var editorMode = textArea.attr("mode");
       
       var codeEditor = CodeMirror.fromTextArea(textArea[0], {
            lineNumbers: true,
            mode: editorMode,
	     matchBrackets : true,
	     onChange: function() {
			codeChanged(index);
	     }
       });       

	codeEditorHandles[editorMode] = codeEditor;

       return codeEditor;
   };
   

   //hide all tabs, attach event handlers
   for (var i=0; i<codeBoxArray.length; i++) {
       codeBoxArray [i] = $(codeBoxArray[i]);
   }

   for (var j=0; j<codeBoxArray.length; j++) {
   	codeEditors[j] = {"editor": _initEditor(j), "changed": false, "fileName": codeBoxArray[j].attr("fileName")};
   }

  $(".floatTab.css").click(function() {
  	$(".floatTab.javascript").removeClass("active");
       $(".editor.javascript").removeClass("active");
        		      
       $(".floatTab.css").addClass("active");
   	$(".editor.css").addClass("active");

	codeEditorHandles["css"].refresh();
   });
        		      		
   $(".floatTab.javascript").click(function() {
          $(".floatTab.css").removeClass("active");
          $(".editor.css").removeClass("active");
                      
          $(".floatTab.javascript").addClass("active");
          $(".editor.javascript").addClass("active");

	   codeEditorHandles["javascript"].refresh();
   });

   return {
	"push": push,
	"save": save,
	"reset": reset
   }
   
   
};
