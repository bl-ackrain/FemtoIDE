function writeDraw8BPP( block, src ){
    let out = `static const uint8_t data[] = {\n`;    
    let palettes = require("./palParser.js").getPalettes();
    let lumBias = require("./palParser.js").getLuminanceBias();
    let palette = (block.palette || palettes[ (Object.keys(palettes)[0]) ])
        .colors32.map( c => [
            (c>>16)&0xFF,
            (c>>8)&0xFF,
            c&0xFF
        ]);

    if( !palette ){
        throw new Error (`image ${block.name} has no palette`);
    }

    let data = src.data;
    let lines = "";
    out += src.width + "," + src.height;

    let i=0, len, bytes;
    let run = [];
    let maxcolors = Math.min(256, palette.length);

    for( let y=0; y<src.height; ++y ){
        out += ",\n";
        run.length = 0;

        for( let x=0; x<src.width; ++x ){
            let closest = 0;
            let closestDist = Number.POSITIVE_INFINITY;
            let R = data[i++];
            let G = data[i++];
            let B = data[i++];
            let L = (R*0.2126 + G*0.7152 + B*0.0722)*lumBias;
            let A = data[i++];

            if( A > 128 ){
                for( let c=0; c<maxcolors; ++c ){
                    let ca = palette[c];
                    let lum = (ca[0]*0.2126 + ca[1]*0.7152 + ca[2]*0.0722)*lumBias;
		    let dist = (R-ca[0])*(R-ca[0])
                        + (G-ca[1])*(G-ca[1])
                        + (B-ca[2])*(B-ca[2])
                        + (L-lum)*(L-lum);

                    if( dist < closestDist ){
                        closest = c;
                        closestDist = dist;
                    }
                }
            }
            
            run[x] = `0x` + closest.toString(16);
        }

        out += run.join(",");
    }
    
    out += `};`;

    out += "return data;\n";

    return out;
}

function writeDraw( block, src ){
    let out = `static const uint8_t data[] = {\n`;    
    let palettes = require("./palParser.js").getPalettes();
    let lumBias = require("./palParser.js").getLuminanceBias();
    let palette = (block.palette || palettes[ (Object.keys(palettes)[0]) ]);
    let offset = block.palOffset|0;

//    require("./Log.js").log(...Object.keys(block));

    if( !palette ){
        throw new Error (`image ${block.name} has no palette`);
    }

    palette = palette.colors32.map( c => [
            (c>>16)&0xFF,
            (c>>8)&0xFF,
            c&0xFF
        ]);

    let data = src.data;
    let lines = "";
    out += src.width + "," + src.height;

    let i=0, len, bytes;
    let run = [];
    let maxcolors = Math.min(16, palette.length);

    for( let y=0; y<src.height; ++y ){
        out += ",\n";
        run.length = 0;

        for( let x=0; x<src.width; ++x ){
            let closest = 0;
            let closestDist = Number.POSITIVE_INFINITY;
            let R = data[i++];
            let G = data[i++];
            let B = data[i++];
            let L = (R*0.2126 + G*0.7152 + B*0.0722)*lumBias;
            let A = data[i++];

            if( A > 128 ){
                for( let c=0; c<maxcolors; ++c ){
                    let ca = palette[(c+offset)%palette.length];
                    let lum = (ca[0]*0.2126 + ca[1]*0.7152 + ca[2]*0.0722)*lumBias;
		    let dist = (R-ca[0])*(R-ca[0])
                        + (G-ca[1])*(G-ca[1])
                        + (B-ca[2])*(B-ca[2])
                        + (L-lum)*(L-lum);

                    if( dist < closestDist ){
                        closest = c;
                        closestDist = dist;
                    }
                }
            }
            
            run[x>>1] = (run[x>>1]||0) + (x&1?closest:closest<<4);
        }

        out += run.join(",");
    }
    
    out += `};`;

    out += "return data;\n";

    return out;
}

function writeImage( block ){
    if(block.bits == 8)
        return writeDraw8BPP(block, block.image);
    return writeDraw( block, block.image );
}

module.exports = writeImage;
