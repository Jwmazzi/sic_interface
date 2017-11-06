let rank_values = [1, 2, 3]

graph.on(L.Draw.Event.CREATED, function (e) {
    // Determine Rank Being Added
    rank_values.sort();
    rank = rank_values.shift();

    if (rank == undefined){
        $("#hintArea")
        .prepend("<span class='hint'>Please Submit or Edit Existing Responses . . .</span>")
        .children(':first')
        .delay(3000)
        .fadeOut(100);
    }

    else {
        feature_group.addLayer(e.layer);
        e.layer.rank = rank;

        // Create DOM Element
        $("#form").append(`
          <div id="` + e.layer._leaflet_id + `" class="input-group id_input">
            <span class="input-group-addon">` + e.layer.rank + `</span>
            <span class="input-group-addon">Social ID</span>
            <input type="text" class="form-control" name="social_id">
          </div>
        `);
    }
});

graph.on(L.Draw.Event.DELETED, function (e) {
    // Remove DOM Elements
    for (layer in e.layers._layers) {
        rank_values.push(e.layers._layers[layer].rank)
        $('#' + e.layers._layers[layer]._leaflet_id).remove();
    }
});


function check_responses(vals) {

    console.log('checks');

    for (i = 0; i < vals.length; i++) {
        console.log(vals[i]);
    }

}



// Collect Values on Submit Click 
function get_form_response() {
    console.log('get_form_response');

    var div_els = $("#form").find(".id_input");

    sql_inserts = [];

    for (i = 0; i < div_els.length; i++) {

        // Extract Circle Info
        var layer_data = feature_group._layers[div_els[i].id];
        var lat    = layer_data._latlng.lat; 
        var lng    = layer_data._latlng.lng;
        var radius = layer_data._mRadius;

        // Extract Other Info
        var rank = div_els[i].children[0].childNodes[0].data;

        var s_id = div_els[i].children[2].value;

        if (s_id) {
            console.log('Keep going . . .');
        } else {

            $("#hintArea").empty();
            $("#hintArea")
            .prepend("<h4 class='hint'>All Responses Must Have Social IDs</h4>")
            .children(':first')
            .delay(3000)
            .fadeOut(500);
            return;
        }

        var sql = String("insert into t1 values ('" + rank + "' ,'" + s_id + "', ST_Buffer(ST_MakePoint(" + lng + "," + lat + ")::geography, " + radius + "));");

        sql_inserts.push(sql);
    }

    if (sql_inserts.length >= rank_values) {

        $("#hintArea").empty();
        $.post('/insert', {sql: sql_inserts}, function(res){
            $("#hintArea")
            .prepend("<h4 class='hint'>" + res.message + "</h4>")
            .children(':first')
            .delay(3000)
            .fadeOut(500);
        });
    }

    else {
        $("#hintArea").empty();
        $("#hintArea")
        .prepend("<h4 class='hint'>Please Create More Geometries Using the Graph</h4>")
        .children(':first')
        .delay(3000)
        .fadeOut(500);
    }
}


$(function() {

    console.log('Load');

    $.get('/subject', function(res){
        $("#subject-id")
        .prepend("<h4>Subject: " + res.message + "</h4>")
        .children(':first');

    });

    $("#hintArea")
        .prepend("<h4 class='hint'>Use the Graph Controls Above to Begin Survey</h4>")
        .children(':first')
        .delay(5000)
        .fadeOut(500);

});