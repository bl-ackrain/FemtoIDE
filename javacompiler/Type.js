let {Unit, getUnit} = require("./Unit.js");

const nativeTypeList = "long,ulong,int,uint,short,ushort,char,byte,ubyte,boolean,float,void,double,pointer".split(",");

let typeId = 1;

class Type {

    constructor( node, key, cppType, parent ){
        this.scope = parent;
        this.cppType = cppType;
        this.id = typeId++;
        this.isType = true;

        if( typeof node == "string" ){
            this.name = node;
            this.isPublic = true;
            this.isNative = false;
            return;
        }

        let modifierNode = (node.children.classModifier||[])[0];
        this.isPublic = (modifierNode && !!modifierNode.children.Public) || false;
        if( !key ){
            this.name = "__anon__" + typeId;
        }else{
            let declNode = (node.children[ key ]||[])[0];
            if( !declNode )
                throw new Error("Expected " + key + JSON.stringify(node));
            
            let identNode = (declNode.children.typeIdentifier||[])[0];
            if( !identNode )
                throw new Error("Expected typeIdentifier");

            this.name = identNode.children
                .Identifier[0].image.replace(/^__(.*?)_internal_placeholder__$/, "$1");

            this.isNative = nativeTypeList.indexOf(this.name) != -1;
        }
        
    }

}

module.exports = { Type, nativeTypeList };
