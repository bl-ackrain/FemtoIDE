APP.addPlugin("Java", ["Text"], TextView => {
    const extensions = ["JAVA"];
    
    class JavaView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/java");
            ace.require("ace/ext/language_tools");
            this.ace.setOptions({
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            });

            this.ace.completers = [{
                getCompletions(editor, session, pos, prefix, callback) {
                    // callback(null, APP.complete() || []);
                    APP.complete(callback.bind(null, null));
                }
            }];
        }

        doAction(){
            APP.compileAndRun();
        }

        beautify(){
            if( typeof js_beautify == "undefined" )
                return;
            let ret = js_beautify(this.ace.session.getValue());
            this.ace.session.setValue(ret);
        }

        complete(callback){
            let pos = this.ace.getCursorPosition();
            pos = this.ace.session.doc.positionToIndex(pos);
            APP.completionAtPoint(this.buffer, pos, callback);
        }

        resolveJavaUnderCursor(){
            let pos = this.ace.getCursorPosition();
            let offset = this.ace.session.doc.positionToIndex(pos);
            return APP.resolveJava(this.buffer, offset);
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = JavaView;
                vf.priority = 1;
            }
            
        }
        
    });

    return JavaView;
});
