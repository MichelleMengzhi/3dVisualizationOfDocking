// Get the quote from header abd section
// let header  = document.querySelector('header');
// let section = document.querySelector('section');

// save the path of json as a var
//let path = 'file://D:/0temp/BCB430/recaptulization/recap_2020/back_end/results_CESA.json';
let path = 'file://D:/0temp/BCB430/recaptulization/recap_2020/back_end/results_TDIF.json';
//let path = 'file://D:/0temp/BCB430/recaptulization/recap_2020/results/results.json'
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

    //pipeline_for_one_pair(contact_freq, "CESA1", "flupoxam")
    //pipeline_for_one_pair(contact_freq, "CESA3Final1", "flupoxam")
    //pipeline_for_one_pair(contact_freq, "CESA6Force", "flupoxam")
    //pipeline_for_one_pair(contact_freq, "CESA1", "isoxaben")
    //pipeline_for_one_pair(contact_freq, "CESA3Final1", "isoxaben")
    //pipeline_for_one_pair(contact_freq, "CESA6Force", "isoxaben")
    //pipeline_for_one_pair(contact_freq, "3riz", "cle")
    //pipeline_for_one_pair(contact_freq, "3riz", "TDIF_5gij")
    //pipeline_for_one_pair(contact_freq, "3riz", "TDIF_5gr9")
    //pipeline_for_one_pair(contact_freq, "3riz", "TDIF_5jfi")
    //pipeline_for_one_pair(contact_freq, "5gij", "cle")
    //pipeline_for_one_pair(contact_freq, "5gij", "TDIF_5gij")
    //pipeline_for_one_pair(contact_freq, "5gij", "TDIF_5gr9")
    //pipeline_for_one_pair(contact_freq, "5gij", "TDIF_5jfi")

    
}


function find_range(json_file, receptor_name) {
    var result = {max: 0, min: 0};
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
    //console.log("running coloring function");
    //console.log("atom.resi: "+atom.resi);
    let d, d_inv, d_inv_text;
    if (atom.resi in data) {
        //console.log("atom.resi "+atom.resi+" in data\n Contact frequency: "+data[atom.resi]);
        //console.log("pre_resi: "+pre_resi);
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


function threeDmol_generator(receptor, data) { // data -> array
    $('#viewers').append("<span><div id='" + receptor + "'class='mol-container'></div></span>");
    let viewer = $3Dmol.createViewer(receptor);
    let receptor_path = '../receptors/' + receptor + '.pdb';
    jQuery.ajax(receptor_path, {
        success: function (data, pdb) {
            let v = viewer;
            //console.log(data);
            //console.log(receptor);
            //console.log("receptor: " + receptor.substring(0, 4));

            v.addModel(pdb, "pdb");                        /* load data */
            v.setStyle({}, { cartoon: { color: 'spectrum' } });  /* style all atoms */
            v.zoomTo();                                      /* set camera */
            v.render();                                      /* render scene */
            v.zoom(1.2, 1000);                               /* slight zoom */
            v.addSurface($3Dmol.SurfaceType.SAS, { // addSurgace(type($3Dmol.SurfaceType), style(SurfaceStyleSpec))
                // opacity:0.9,
                colorfunc: coloring_function.bind(null, data) //SurfaceStyleSpec(opacity:, colorscheme:type(ColorschemeSpec: colorfunc)) 
            });
        }.bind(null, data),
        error: function (hdr, status, err) {
            console.error("Failed to load PDB " + receptor_path + ": " + err);
        },
    });
}

function pipeline_for_one_pair(jsonFile, receptor_name, ligand_name) {
    receptor_range = find_range(jsonFile, receptor_name);
    threeDmol_generator(receptor_name, pos_confreq_array_generator(jsonFile, receptor_name, ligand_name, receptor_range));
}