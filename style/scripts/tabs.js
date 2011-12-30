var tabsModule = function(tabBtns, tabStack) {

   var tabButtons = tabBtns;
   var tabs = tabStack;
   var codeArea = new Array(tabs.length);   
   
   function _initEditor(tab) {
       var textArea = $(".code", tab);
       var editorMode = textArea.attr("mode");
       
       var codeEditor = CodeMirror.fromTextArea(textArea[0], {
            lineNumbers: true,
            mode: editorMode
       });
       
       return codeEditor;
   };


   function handleTabClick(index) {
       
       //hide all tabs
       
       for (var i=0; i<tabs.length; i++) {
           tabs[i] = $(tabs[i]);
           tabs[i].hide();
           
           tabButtons[i].removeClass("active");
       }
       
       tabButtons[index].addClass("active");
       tabs[index].show();
       codeArea[index].refresh();
       
   };
   
   function createClickHandler(index) {
       return function() {
           handleTabClick(index)
       };
   };

   //hide all tabs, attach event handlers
   for (var i=0; i<tabs.length; i++) {
       tabs[i] = $(tabs[i]);
	
	if (!tabs[i].hasClass("active")) {
		tabs[i].hide();
	}
   }

   for (var j=0; j<codeArea.length; j++) {
   	codeArea[j] = _initEditor(tabs[j]);
   }
   
};
