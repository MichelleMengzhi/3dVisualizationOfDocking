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


function find_range(json_file, receptor_name) {
    var result = { max: 0, min: 0 };
    var max = -100000000;
    var min = 0;
    for (var i in json_file[receptor_name]) {
        for (var j in json_file[receptor_name][i]) {
            if (max <= json_file[receptor_name][i][j]) {
                max = json_file[receptor_name][i][j];
            } else if (min >= json_file[receptor_name][i][j]) {
                min = json_file[receptor_name][i][j];
            }
        }
    }

    result.max = max;
    result.min = min;
    return result;

}


function norm(value, min, max) {
    return (value - min) / (max - min);
}


// return the arrary of contact frequency result for the given receptor and ligand pair
function pos_confreq_array_generator(json_file, receptor_name, ligand_name, range) {
    var max = range.max;
    var min = range.min;
    for (var i in json_file[receptor_name][ligand_name]) {
        json_file[receptor_name][ligand_name][i] = norm(json_file[receptor_name][ligand_name][i], min, max);
    }
    return json_file[receptor_name][ligand_name];
}


function coloring_function(data, atom) { // data -> array  
    let d, d_inv, d_inv_text;
    if (atom.resi in data) {
        d = Math.floor(data[atom.resi] * 255)
        if (d.toString(16).length == 1) {
            d_text = "0" + d.toString(16);
        } else {
            d_text = d.toString(16);
        }
        d_inv = 255 - d;
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

function threeDmol_single_viewer_generator(receptor, data) { // data -> array
    let receptor_path = './receptors/' + receptor + '.pdb';

    var viewers = $3Dmol.createViewerGrid(
        receptor, //id of div to create canvas in
        {
          rows: 1,
          cols: 2,
          control_all: true  //mouse controls all viewers
        },
        { backgroundColor: 'lightgrey' }
      );
      $.get(receptor_path, function(data, pdb) {
        var viewer = viewers[0][0];
        viewer.addModel(pdb,'pdb');
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewer.zoomTo(1.2, 1000);
        viewer.render( );
        viewer.addSurface($3Dmol.SurfaceType.SAS, { // addSurgace(type($3Dmol.SurfaceType), style(SurfaceStyleSpec))
            // opacity:0.9,
            colorfunc: coloring_function.bind(null, data) //SurfaceStyleSpec(opacity:, colorscheme:type(ColorschemeSpec: colorfunc)) 
        });
        viewer = viewers[0][1];
        viewer.addModel(pdb,'pdb');
        viewer.setStyle({},{sphere:{radius:0.5}, stick:{radius:0.2}});
        viewer.zoomTo(1.2, 1000);     
        viewer.render( );
        
      }.bind(null, data));
}


function pipeline_for_one_pair(jsonFile, receptor_name, ligand_name) {
    receptor_range = find_range(jsonFile, receptor_name);
    threeDmol_single_viewer_generator(receptor_name, pos_confreq_array_generator(jsonFile, receptor_name, ligand_name, receptor_range));
}
