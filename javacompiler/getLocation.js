function getLocation( obj, node ){
    const {getUnit} = require("./Unit.js");
    let unit = getUnit(obj);
    obj.location = Object.assign({ unit:unit.file }, node.location);
    if( obj.resolve )
        unit.index.push(obj);
    return obj;
}

module.exports = getLocation;
