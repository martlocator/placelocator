const nearbyLayer = L.layerGroup().addTo(map);

const CATEGORIES = {
    cafe: {label: "Cafe", tag: '"amenity"="cafe"'},
    mall: {label: "Mall", tag: '"shop"="mall"'},
    restaurant: {label: "Restaurant", tag: '"amenity"="restaurant"'},
    pharmacy: {label: "Pharmacy", tag: '"amenity"="pharmacy"'},
    atm: {label: "Atm", tag: '"amenity"="atm"'},
    hospital: {label: "Hospital", tag: '"amenity"="hospital"'}
}
function escapeHtml(text){
    return String(text).replace(/[&<>"']/g, function(c){
        return{'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
async function findNearby(){
    if (!lastlatlng){
        alert('Your location is not available, Allow location access and try again.');
        return;
    }
    const category = CATEGORIES[document.getElementById('nearby-type').value];
    const radius = 1500;
    const [lat, lon] = lastlatlng;
    const query = `
    [out:json][timeout:25];nwr[${category.tag}](around:${radius},${lat},${lon});
    out center 50;`;
    const button = document.getElementById('nearby-btn');
    button.disabled = true;
    button.textContent = 'Searching...';

    try{
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST', 
            body: 'data=' + encodeURIComponent(query)
        });
        if (!response.ok) throw new Error (' Server returned ' + response.status);
        const data = await response.json();
        nearbyLayer.clearLayers();
        // keep places that is in the data, and calculate the distance
        const places= data.elements
        .map(function(el){
            const pLat = el.lat !== undefined ? el.lat: el.center && el.center.lat;
            const pLon = el.lon !== undefined ? el.lon:el.center && el.center.lon;
            if (pLat === undefined || pLon === undefined) return null;
            return {
                name: (el.tags && el.tags.name) || 'Unnamed ' + category.label.toLowerCase(),
                latlng: [pLat,pLon],
                distance: Math.round(map.distance(lastlatlng, [pLat, pLon]))
            };
        })
        .filter(Boolean)
        .sort(function(a,b){return a.distance - b.distance;});
        if (places.length === 0){
            alert('No ' + category.label.toLowerCase() + ' found at ' + radius + ' m.');
            return;
        }
        places.forEach(function(place){
            L.circleMarker(place.latlng, {
                radius: 8,
                color: '#6aeb1a',
                fillColor: '#bbf436',
                fillOpacity: 0.85,
            })
            .bindPopup('<b>' + escapeHtml(place.name) + '</b><br>' + place.distance + 'm away')
            .addTo(nearbyLayer);
        });
        // Stop auto-follow so the map stays on the results, then zoom to fit them
        setFollowing(false);
        const bounds = L.latLngBounds(places.map(function(p){
            return p.latlng;
        }));
        bounds.extend(lastlatlng);
        map.fitBounds(bounds, {padding: [40,40], maxZoom: 10});
    }catch(error){
        console.error(error);
        alert('Could not load nearby places. Please try again in a moment.');
    } finally{
        button.disabled = false;
        button.textContent = 'Near me';
    }
}
document.getElementById('nearby-btn').addEventListener('click', findNearby);
