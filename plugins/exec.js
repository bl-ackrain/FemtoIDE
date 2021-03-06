APP.addPlugin("Exec", [], _=>{
    const modes = ["APP"];
    const log = [];
    let logCursor = 0;
    let cwd = DATA.appPath;
    

    APP.customSetVariables({ execMode:"APP" });

    APP.add(new class Exec {
        onOpenProject(){
            cwd = DATA.projectPath;
        }

        onCMDKey( event ){
            let key = event.key;
            let element = event.target;

            if( !log.length )
                return;

            console.log(key);

            switch( key ){
            case "ArrowUp":
                logCursor--;
                if( logCursor < 0 )
                    logCursor = log.length - 1;
                element.value = log[logCursor];
                break;
            case "ArrowDown":
                logCursor++;
                if( logCursor >= log.length )
                    logCursor = 0;
                element.value = log[logCursor];
                break;
            }
        }

        pushExecMode( mode ){
            let i = modes.indexOf(mode);
            if( i != -1 ){
                modes.length = i+1;
            }else{
                modes.push( mode );
            }
            APP.customSetVariables({ execMode:mode });
        }

        popExecMode(){
            modes.pop();
            APP.customSetVariables({
                execMode:modes[modes.length-1] || "APP"
            });
        }

        exec( cmd ){
            if( log[log.length-1] != cmd ){
                log.push(cmd);
                logCursor = log.length;
            }

            if( DATA.execMode != "APP" ) return undefined;

            if( cmd[0] == '=' ){
                return (new Function([], `return (_=>${cmd.substr(1)})();`))();
            }

            if( cmd[0] == '#' ){
                return term(cmd.substr(1));
            }

            const m = cmd.match(/^\s*([^(\s]+)\s*\((.*)\)$/);
            if( !m ) return undefined;
            const name = m[1];
            const args = JSON.parse(`[` + m[2] + `]`);
            return APP[ name ]( ...args );
        }
    });

    const builtin = {
        cd( args ){

            if( !args.length )
                args = [DATA.projectPath];

            let str = args[0];

            if( !path.isAbsolute(str) )
                str = path.join(cwd, str);

            let newcwd = path.resolve(str);
            try{
                let stat = fs.statSync( newcwd );
                if( stat.isDirectory() ){
                    cwd = newcwd;
                    APP.log(newcwd);
                }else{
                    APP.error(`${newcwd} is not a directory`);
                }
            }catch(ex){
                APP.error(`${newcwd}: no such file or directory`);
            }
        }
    };

    function shellexec(cmd, args){
        APP.spawn( cmd, { cwd }, args )
            .on("data-out", str=>{
                APP.log(str);
            })
            .on("data-err", str=>{
                APP.error(str);
            });
    }

    function term(cmd){
        let args = [];
        cmd.replace(/"([^"]*)"|(?:[^ \n\\]|\\.)+/g, (match, str)=>{
            args.push( APP.replaceDataInString( str || match) );
            return "";
        });

        cmd = args.shift();
        (builtin[cmd] || shellexec.bind(null, cmd))(args);
    }
});
