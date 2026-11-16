if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position){
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    
    
    var map= L.map('map').setView([lat,lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    new L.Control.Geocoder().addTo(map);
    var marker = L.marker([lat,lon]).addTo(map).bindPopup('Current location you are at').openPopup();
    navigator.getLocation.watchPosition(function(newPosition){
        var newlat = newPosition.coords.latitude;
        var newlon = newPosition.coords.longitude;
        marker.setLatLng([newlat,newlon]);
        map.setView([newlat,newlon]);
    })

    });
    }else{
    alert('geolocation not supported in this browser.')
    }