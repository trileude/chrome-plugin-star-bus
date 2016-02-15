function notify() {
	var arrived = new Date(this.alt);
	//call background script
	chrome.extension.getBackgroundPage().createAlarm(arrived - 600000);
}

/**
 * @param {string} arret - Bus stop number
 * @param {function(string)} errorCallback - Called when the XMLHttpRequest failed
 *   The callback gets a string that describes the failure reason.
 */
function refreshBus(arret, errorCallback) {
	var searchUrl = 'https://data.explore.star.fr/api/records/1.0/search/?dataset=tco-bus-circulation-passages-tr&lang=fr&sort=-depart&refine.idarret=' + arret;
	
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            var jsonResponse = JSON.parse(xmlhttp.response);
            var ul = document.getElementById("listeBus");
            var now = new Date().getTime();
            
            document.getElementById('loader').style.display = 'none';
            
            var arret = jsonResponse['records'][0]['fields']['nomarret'];
            document.getElementById('arret').textContent = arret;
            
            for(i=0;i<jsonResponse['records'].length;i++) {
				var li = document.createElement("li");
				var bus = new Date(jsonResponse['records'][i]['fields']['arrivee']).getTime();
            	var diffMin = Math.floor((bus - now)/1000/60); 
				var text = diffMin + " min";
  				
  				var img = document.createElement('img');
				img.src = 'pictos_bus/' + jsonResponse['records'][i]['fields']['nomcourtligne']  + '.png';
				li.appendChild(img);
				
  				li.appendChild(document.createTextNode(text));
  				
  				if(diffMin >= 10) {
					var bell = document.createElement('img');
					bell.src = 'bell.png';
					bell.className = "bell";
					bell.title = "Notify me 10 minutes before it left !";
					bell.onclick = notify;
					bell.alt = jsonResponse['records'][i]['fields']['arrivee'];
					li.appendChild(bell);
				}
				
				ul.appendChild(li);
			}
        }
    }
    
    xmlhttp.onerror = function() {
		errorCallback('Network error : status='+xmlhttp.status);
	}
    
    xmlhttp.open("GET", searchUrl, true);
    xmlhttp.send();
}

function renderStatus(statusText) {
  	document.getElementById('status').textContent = statusText;
}

window.onload = function() {
	chrome.storage.sync.get({
		favoriteStop: '1164'
	}, function(items) {
		refreshBus(items.favoriteStop, function(errorMessage) {
			renderStatus('Cannot fetch explore.star.fr data. ' + errorMessage);
		});
	});
	/*refreshBus(1164, function(errorMessage) {
		renderStatus('Cannot fetch explore.star.fr data. ' + errorMessage);
	});*/
};
