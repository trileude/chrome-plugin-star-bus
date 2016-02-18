var timeoutNotif = 5;

function notify() {
	var arrived = new Date(this.alt);
	
	//call background script
	chrome.extension.getBackgroundPage().createAlarm(arrived - (timeoutNotif * 60 * 1000));
}

function add_option_arret(arretName) {
	var listeArrets = document.getElementById('listeArrets');
	var option = document.createElement("option");
	option.value = arretName;
	option.text = arretName;
	listeArrets.appendChild(option);
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
            
            while(ul.firstChild) 
    			ul.removeChild(ul.firstChild);
            
            for(i=0;i<jsonResponse['records'].length;i++) {
				var li = document.createElement("li");
				var bus = new Date(jsonResponse['records'][i]['fields']['arrivee']).getTime();
				console.log(jsonResponse['records'][i]['fields']['arrivee']);
            	var diffMin = Math.floor((bus - now)/1000/60); 
				var text = diffMin + " min";
  				
  				var img = document.createElement('img');
				img.src = 'pictos_bus/' + jsonResponse['records'][i]['fields']['nomcourtligne']  + '.png';
				li.appendChild(img);
				
  				li.appendChild(document.createTextNode(text));
  				
  				if(diffMin >= timeoutNotif) {
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

function change_arret() {
	var listeArret = document.getElementById('listeArrets');
	document.getElementById('loader').style.display = 'block';
	refreshBus(listeArrets.options[listeArrets.selectedIndex].value, function(errorMessage) {
		renderStatus('Cannot fetch explore.star.fr data. ' + errorMessage);
	});
}

function renderStatus(statusText) {
  	document.getElementById('status').textContent = statusText;
}

window.onload = function() {
	document.getElementById('listeArrets').addEventListener('change', change_arret);
	
	chrome.storage.sync.get({
		stops: new Array(),
		timeoutNotif: 10
	}, function(items) {
		for(i=0;i<items.stops.length;i++) {
			add_option_arret(items.stops[i]);
		}
		if(items.stops.length > 0) {
			refreshBus(items.stops[0], function(errorMessage) {
				renderStatus('Cannot fetch explore.star.fr data. ' + errorMessage);
			});
		}
		else {
			renderStatus('Vous devez configurer au moins un arrêt.Faire clic droit et Options pour configurer.');
		}
		timeoutNotif = items.timeoutNotif;
	});
	/*refreshBus(1164, function(errorMessage) {
		renderStatus('Cannot fetch explore.star.fr data. ' + errorMessage);
	});*/
};
