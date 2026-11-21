    const map = L.map('map').setView([11.5564, 104.9282], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; OpenStreetMap contributors'}).addTo(map);
    let following = true;
    let lastlatlng = null;
    let locationmarker = null;
    let searchmarker = null;
    const locatebtn = document.getElementById('locatebtn');
    function setFollowing(value){
        following = value;
        locatebtn.classList.toggle('following', value);
    }
    setFollowing(true);
    if ('geolocation' in navigator){
        let fixed= true;
        navigator.geolocation.watchPosition(function(position){
            lastlatlng = [position.coords.latitude, position.coords.longitude];

            if (!locationmarker){
                locationmarker = L.marker(lastlatlng).addTo(map).bindPopup('អ្នកនៅទីនេះ!');
            }else{
                locationmarker.setLatLng(lastlatlng);
            }
            if (fixed){
                map.setView(lastlatlng,15);
                locationmarker.openPopup();
                fixed = false;
            }else if (following){
                map.panTo(lastlatlng);
            }
        },
        function(error){
            console.warn('Geolocation error:', error.message);
        },
        {enableHighAccuracy: true, maximumAge: 5000}
    );
    }else{
    alert('Geolocation is not supported in this browser ');
    }
    map.on('dragstart', function(){setFollowing(false);});
    locatebtn.addEventListener('click', function(){setFollowing(true);
        if (lastlatlng) map.flyTo(lastlatlng, 16);
    });

    const geocoder = L.Control.Geocoder.nominatim()

    function performSearch(){ 
        const query = document.getElementById('search-input').value.trim();
        if (!query) return;
        
        geocoder.geocode(query, function(results){
            if (results && results.length > 0){
                const top = results[0];
                setFollowing(false);

                if (searchmarker) map.removeLayer(searchmarker);
                searchmarker= L.marker(top.center).addTo(map).bindPopup(top.name).openPopup();
                map.flyTo(top.center,14)
            }else{
                alert('Location not found. Try different address');
            }
        });
    };
    document.getElementById('search-btn').addEventListener('click',performSearch);
    document.getElementById('search-input').addEventListener('keydown', function (e){
        if (e.key == 'Enter') performSearch();
    });
   