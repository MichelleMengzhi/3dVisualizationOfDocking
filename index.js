// save the path of json as a var
let path = './results_CESA.json';
// create a http request
let request = new XMLHttpRequest();
// open a new request
request.open('GET', path);
// set XHR to JSON
request.responseType = 'text';
// send request
request.send();

var pre_resi = 0;

// deal with data from server
request.onload = function () {
    let contact_freq_text = request.response;
    let contact_freq = JSON.parse(contact_freq_text);

    $('#btn_CESA1').on('click', function () {
        $('#viewer1').append("<span><div id='" + "CESA1" + "'class='mol-container'></div></span>");
        pipeline_for_one_pair(contact_freq, "CESA1", "flupoxam");
    })
    $('#btn_CESA2').on('click', function () {
        $('#viewer2').append("<span><div id='" + "CESA3Final1" + "'class='mol-container'></div></span>");
        pipeline_for_one_pair(contact_freq, "CESA3Final1", "flupoxam")
    })
    $('#btn_CESA3').on('click', function () {
        $('#viewer3').append("<span><div id='" + "CESA6Force" + "'class='mol-container'></div></span>");
        pipeline_for_one_pair(contact_freq, "CESA6Force", "flupoxam")
    })
    $('#btn_CESA4').on('click', function () {
        $('#viewer4').append("<span><div id='" + "CESA1" + "'class='mol-container'></div></span>");
        pipeline_for_one_pair(contact_freq, "CESA1", "isoxaben")
    })
    $('#btn_CESA5').on('click', function () {
        $('#viewer5').append("<span><div id='" + "CESA3Final1" + "'class='mol-container'></div></span>");
        pipeline_for_one_pair(contact_freq, "CESA3Final1", "isoxaben")
    })
    $('#btn_CESA6').on('click', function () {
        $('#viewer6').append("<span><div id='" + "CESA6Force" + "'class='mol-container'></div></span>");
        pipeline_for_one_pair(contact_freq, "CESA6Force", "isoxaben")
    })


}

var v =null;

function find_range(json_file, receptor_name) {
    var result = { max: 0, min: 0 };
    var max = -100000000;
    var min = 0;
    // for (var i in json_file[receptor_name][ligand_name]) {
    //     if (max <= json_file[receptor_name][ligand_name][i]) {
    //         max = json_file[receptor_name][ligand_name][i];
    //     } else if (min >= json_file[receptor_name][ligand_name][i]) {
    //         min = json_file[receptor_name][ligand_name][i];
    //     }
    // }
    for (var i in json_file[receptor_name]) {
        for (var j in json_file[receptor_name][i]) {
            //console.log(json_file[receptor_name][i][j]);
            if (max <= json_file[receptor_name][i][j]) {
                max = json_file[receptor_name][i][j];
            } else if (min >= json_file[receptor_name][i][j]) {
                min = json_file[receptor_name][i][j];
            }
        }
    }

    result.max = max;
    result.min = min;
    //console.log(result.max+" "+result.min);
    return result;

}


function norm(value, min, max) {
    return (value - min) / (max - min);
}


// return the arrary of contact frequency result for the given receptor and ligand pair
function pos_confreq_array_generator(json_file, receptor_name, ligand_name, range) {
    //console.log("atom: "+receptor_name.substring(0,4)+" ligand: "+ligand_name)
    // let normalized_data = {};
    //console.log(json_file[receptor_name][ligand_name]);
    var max = range.max;
    var min = range.min;
    for (var i in json_file[receptor_name][ligand_name]) {
        json_file[receptor_name][ligand_name][i] = norm(json_file[receptor_name][ligand_name][i], min, max);
    }
    //console.log(json_file[receptor_name][ligand_name]);
    return json_file[receptor_name][ligand_name];
}


// return the contact frequency of the given atom position from the given position: contact frequency array
// note that atom_position should be in type of string
function contfreq_generator(pos_confreq_array, atom_position) {
    return pos_confreq_array[atom_position];
}


function coloring_function(data, atom) { // data -> array; atom ->   
    
    let d, d_inv, d_inv_text;
    if (atom.resi in data) {
        d = Math.floor(data[atom.resi] * 255)
        if (d.toString(16).length == 1) {
            d_text = "0" + d.toString(16);
        } else {
            d_text = d.toString(16);
        }
        d_inv = 255 - d;
        //d_inv_text_text = (255-d_text).toString(16);
        if (d_inv.toString(16).length == 1) {
            d_inv_text = "0" + d_inv.toString(16);
        } else {
            d_inv_text = d_inv.toString(16);
        }
        pre_resi = atom.resi;
        return "0xff" + d_text + "00";
    } else {
        return "0xcccccc"
    }
}


var atomcallback = function(atom, viewer) {
    if (atom.clickLabel === undefined
            || !atom.clickLabel instanceof $3Dmol.Label) {
        atom.clickLabel = viewer.addLabel(atom.elem + atom.serial, {
            fontSize : 14,
            position : {
                x : atom.x,
                y : atom.y,
                z : atom.z
            },
            backgroundColor: "black"
        });
        atom.clicked = true;
    }

    //toggle label style
    else {

        if (atom.clicked) {
            var newstyle = atom.clickLabel.getStyle();
            newstyle.backgroundColor = 0x66ccff;

            viewer.setLabelStyle(atom.clickLabel, newstyle);
            atom.clicked = !atom.clicked;
        }
        else {
            viewer.removeLabel(atom.clickLabel);
            delete atom.clickLabel;
            atom.clicked = false;
        }

    }
};




function threeDmol_single_viewer_generator(receptor, data) { // data -> array

    // //$('#viewers').append("<span><div id='" + receptor + "'class='mol-container'></div></span>");
    // let viewer = $3Dmol.createViewer(receptor);
    let receptor_path = '../receptors/' + receptor + '.pdb';
    // jQuery.ajax(receptor_path, {
    //     success: function (data, pdb) {
    //         let v = viewer;
    //         //console.log(data);
    //         //console.log(receptor);
    //         //console.log("receptor: " + receptor.substring(0, 4));

    //         v.addModel(pdb, "pdb");                        /* load data */
    //         v.setStyle({}, { cartoon: { color: 'spectrum' } });  /* style all atoms */
    //         v.zoomTo();                                      /* set camera */
    //         v.render();                                      /* render scene */
    //         v.zoom(1.2, 1000);                               /* slight zoom */
    //         v.addSurface($3Dmol.SurfaceType.SAS, { // addSurgace(type($3Dmol.SurfaceType), style(SurfaceStyleSpec))
    //             // opacity:0.9,
    //             colorfunc: coloring_function.bind(null, data) //SurfaceStyleSpec(opacity:, colorscheme:type(ColorschemeSpec: colorfunc)) 
    //         });
    //     }.bind(null, data),
    //     error: function (hdr, status, err) {
    //         console.error("Failed to load PDB " + receptor_path + ": " + err);
    //     },
    // });

    var viewers = $3Dmol.createViewerGrid(
        receptor, //id of div to create canvas in
        {
          rows: 1,
          cols: 2,
          control_all: true  //mouse controls all viewers
        },
        { backgroundColor: 0xf6f6f6 }
      );
      $.get(receptor_path, function(data, pdb) {
        v = viewers[0][0];
        m = v.addModel(pdb,'pdb');
        atoms = m.selectedAtoms({});
        for ( var i in atoms) {
            var atom = atoms[i];
            atom.clickable = true;
            atom.callback = atomcallback;
        }
        v.setStyle({}, { cartoon: { color: 'spectrum' } });
        v.mapAtomProperties($3Dmol.applyPartialCharges); //mapAtomPtoperties(props,, sel) 
                                                        //-> props,: either array of atom selectors 
                                                        //           with associated props, or function 
                                                        //           that takes atom and sets its properties
                                                        //-> sel:  subset of atoms to work on - model 
                                                        //         selection must be specified here
        v.zoomTo(1.2, 1000);
        v.render( );
        v.addSurface($3Dmol.SurfaceType.SAS, { // addSurgace(type($3Dmol.SurfaceType), style(SurfaceStyleSpec))
            opacity:0.9,
            colorfunc: coloring_function.bind(null, data) //SurfaceStyleSpec(opacity:, colorscheme:type(ColorschemeSpec: colorfunc)) 
        });
        

        v = viewers[0][1];
        v.addModel(pdb,'pdb');
        //m = v.addModel(pdb,'pdb');
        // for ( var i in atoms) {
        //     var atom = atoms[i];
        //     atom.clickable = true;
        //     atom.callback = atomcallback;
        // }
        v.setStyle({},{sphere:{radius:0.3}, stick:{radius:0.1}});
        v.mapAtomProperties($3Dmol.applyPartialCharges); //mapAtomPtoperties(props,, sel) 
                                                        //-> props,: either array of atom selectors 
                                                        //           with associated props, or function 
                                                        //           that takes atom and sets its properties
                                                        //-> sel:  subset of atoms to work on - model 
                                                        //         selection must be specified here
        v.zoomTo(1.2, 1000);     
        v.render( );
        v.addSurface($3Dmol.SurfaceType.SAS, { // addSurgace(type($3Dmol.SurfaceType), style(SurfaceStyleSpec))
            opacity:0.5,
            colorfunc: coloring_function.bind(null, data) //SurfaceStyleSpec(opacity:, colorscheme:type(ColorschemeSpec: colorfunc)) 
        });


        
      }.bind(null, data));
}


function pipeline_for_one_pair(jsonFile, receptor_name, ligand_name) {
    receptor_range = find_range(jsonFile, receptor_name);
    threeDmol_single_viewer_generator(receptor_name, pos_confreq_array_generator(jsonFile, receptor_name, ligand_name, receptor_range));
}
