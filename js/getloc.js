// Declare GoSomewhere app as Object / Create GS Namespace
var GS = GS || {};
GS.user = { // Create User object to store coordinates
    latitude: null,
    longitude: null
}
GS.event = {}; //Initialize empty event object to store event details
GS.events = []; // Initialize empty events array to store data from eventbrite API
GS.eventCount = 0; //Initialize eventCount to loop through array on Click
$(document).ajaxSend(function () {
    $('#getEvents').addClass("loading").removeClass("success");
$('.circle').css('box-shadow', '');
});
$(document).ajaxStop(function () {
    $('#getEvents').removeClass("loading").addClass('success');
    $("#getEvents").one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
        $('#getEvents').addClass('move-up');

    });

});

$(window).load(function () { // Get users location on window load

    GS.showLocation = function (position) { //Function stores users coordinates is GS object and changes button color to green when coordinates have been received
        GS.user.latitude = position.coords.latitude;
        GS.user.longitude = position.coords.longitude;
        if (typeof GS.user.latitude != 'undefined') {
            $('#getEvents').removeClass("alert");
            $('#getEvents').addClass("success");
            $('.location-check').slideUp('easeOutBounce');
        } else {

            $('#getEvents').removeClass("success");
        }
    }
    GS.errorHandler = function (err) { //Error when user does not allow GeoLocation
        if (err.code == 1) {
            alert("Error: Access is denied!");
        } else if (err.code == 2) {
            alert("Error: Position is unavailable!");
        }
    }
    if (navigator.geolocation) { //HTML5 Geolocation API gets location upon user approval
        // timeout at 60 seconds
        var options = {
            timeout: 60000
        };
        navigator.geolocation.getCurrentPosition(GS.showLocation,
            GS.errorHandler,
            options);
    } else {
        alert("Sorry, browser does not support geolocation!");
    }
});

GS.today = moment().format("YYYY-MM-DDThh:mm:ss");
GS.tomorrow = moment().add(1, 'd').format("YYYY-MM-DDThh:mm:ss");

GS.showEvent = function () { //Displays event details in HTML
    $('.container').show();
    $('#yourEvent').append(GS.event[GS.eventCount].name.html);
    $('#description').append("<h3>Description:</h3>" + GS.event[GS.eventCount].description.html);
    $('#description *').removeAttr('style');
    $('#description *')
        .filter(function () {
            return $.trim($(this).text()) === '' && $(this).children().length == 0
        })
        .remove()

    //    $('#description').text($('#description').text().substring(0,1300) + "<a href='#'>Read more</a>");
    $('#time').append("Start Time: " + moment(GS.event[GS.eventCount].start.local).format("dddd, hA"));
    $('#findOutMore').attr('href', GS.event[GS.eventCount].url);
    $('#findOutMore').append("Find out more about this event!");
    if (GS.event[GS.eventCount].logo === null) { // If event has no logo hide the container
        $('#image').hide();
    } else {
        $('#image').show();
        $('#image').attr('src', GS.event[GS.eventCount].logo.url);
    }

    GS.map();
}
GS.getEvents = function () { //Gets events from eventbrite API
    console.log(GS.user.latitude, GS.user.longitude);
    $('.clear').empty();
    if ($.isEmptyObject(GS.event) === true) { //If GS.event object is empty then get JSON data from Eventbrite
        $.getJSON("https://www.eventbriteapi.com/v3/events/search/?location.within=10mi&location.latitude=" + GS.user.latitude + "&location.longitude=" + GS.user.longitude + "&start_date.range_start=" + GS.today + "Z&start_date.range_end=" + GS.tomorrow + "Z&token=UY5UA5QPSJGY7TAHKSML", function (data) {
            console.log(data);
            GS.events.push(data.events); // Store event JSON data in GS.events array
            console.log(GS.events);
            GS.event = GS.events[Math.floor(Math.random() * GS.events.length)]; //randomize events
            console.log(GS.event[0]);
            GS.showEvent(); //Show Event Details
        })
    } else { //Loop through data stored in GS.events

        GS.eventCount = (GS.eventCount + 1) % GS.event.length;
        console.log(GS.event[GS.eventCount]);
        GS.showEvent();
    }
}
GS.map = function () { //Load Google maps
    var mapOptions = { //Map Options
        zoom: 16
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var options = {
        map: map,
        position: new google.maps.LatLng(GS.event[GS.eventCount].venue.latitude, GS.event[GS.eventCount].venue.longitude) //Set Map Coordinates to events location

    };
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var marker = new google.maps.Marker(options);
    map.setCenter(options.position);

    function calcRoute() {
        var start = (GS.user.latitude,
            GS.user.longitude);
        var end = (GS.event[GS.eventCount].venue.latitude,
            GS.event[GS.eventCount].venue.longitude);
        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(result);
            }
        });
    }

}