// Base Graph
var graph = L.map('graph', {
	center: [0, 0],
	zoom: 5,
	zoomControl: false,
	dragging: false,
	doubleClickZoom: false,
	keyboard: false,
	scrollWheelZoom: false,
	touchZoom: false
});

// Visual Guides for Graph
L.circle(
	[0, 0], {
    color: 'black',
    opacity: .15,
    interactive: false
}).addTo(graph);

L.polyline(
	[[90, 0], [-90, 0]], { 
	color: 'black',
	weight: 2,
	opacity: .15, 
	interactive: false
}).addTo(graph);

L.polyline(
	[[0, 180], [0, -180]], {
	color: 'black',
	weight: 2,
	opacity: .15, 
	interactive: false
}).addTo(graph);

// Leaflet Draw Control
var feature_group  = new L.FeatureGroup().addTo(graph);
var draw_control = new L.Control.Draw({
    edit: {
        featureGroup: feature_group
    },
    draw: {
        circle: true,
        marker: false,
        polygon: false,
        polyline: false,
        rectangle: false
    }
});
graph.addControl(draw_control);