const total_ranks = 3;
var rank_values = [1, 2, 3];
var subject;

// Handle Page Load
$(function() {

    $.get('/subject', function(res){
        subject = res.message;
        $("#subject-id")
        .prepend("<h4>Subject: " + subject + "</h4>")
        .children(':first');

    });

    $("#hintArea")
        .prepend("<h4 class='hint'>Use the Graph Controls Above to Begin Survey</h4>")
        .children(':first')
        .delay(8000)
        .fadeOut(500);

});

// Handle Drawing Additions
graph.on(L.Draw.Event.CREATED, function (e) {
    // Determine Rank Being Added
    rank_values.sort();
    rank = rank_values.shift();

    if (rank == undefined){
        $("#hintArea").empty();
        $("#hintArea")
        .prepend("<h4 class='hint'>Please Submit or Edit Existing Responses</h4>")
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

// Handle Deletes
graph.on(L.Draw.Event.DELETED, function (e) {
    for (layer in e.layers._layers) {
        rank_values.push(e.layers._layers[layer].rank)
        $('#' + e.layers._layers[layer]._leaflet_id).remove();
    }
});

// Collect Values on Submit Click 
function handle_response() {

    var div_els = $("#form").find(".id_input");

    if (div_els.length < total_ranks) {
            $("#hintArea").empty();
            $("#hintArea")
            .prepend("<h4 class='hint'>Create More "+ String(total_ranks - div_els.length) + " Identities Using the Graph</h4>")
            .children(':first')
            .delay(3000)
            .fadeOut(500);
            return;
    }

    sql_statements = [];
    for (i = 0; i < div_els.length; i++) {

        // Extract Values
        var layer_data = feature_group._layers[div_els[i].id];
        var lat    = layer_data._latlng.lat; 
        var lng    = layer_data._latlng.lng;
        var radius = layer_data._mRadius;
        var rank   = div_els[i].children[0].childNodes[0].data;
        var s_id   = div_els[i].children[2].value;

        if (s_id.length == 0) {
            $("#hintArea").empty();
            $("#hintArea")
            .prepend("<h4 class='hint'>All Social IDs Must Have Values</h4>")
            .children(':first')
            .delay(3000)
            .fadeOut(500);
            return;
        }

        var sql = String(
            "insert into survey (subject, rank, social, geog) values \
            (" + subject + "," + rank + ",'" + s_id + "',\
            ST_Buffer(ST_MakePoint(" + lng + "," + lat + ")::geography, " + radius + "));"
            );

        sql_statements.push(sql);
    }

    $("#hintArea").empty();
    $.post('/insert', {sql: sql_statements}, function(res){
        $("#hintArea")
        .prepend("<h4 class='hint'>" + res.message + "</h4>")
        .children(':first')
        .delay(3000)
        .fadeOut(500);

        if (res.success) {
            $('#submit-btn').prop('disabled', true);
        }
    });

}