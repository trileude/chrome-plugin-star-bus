var timeoutStopTyping = null;

function add_option_arret(arretName) {
	var listeArrets = document.getElementById('listeArrets');
	var option = document.createElement("option");
	option.value = arretName;
	option.text = arretName;
	listeArrets.appendChild(option);
}

function add_arret() {
	var stop = document.getElementById('codeTimeo').value;
	add_option_arret(stop);
}

function remove_arret() {
	var listeArrets = document.getElementById('listeArrets');
	listeArrets.remove(listeArrets.selectedIndex);
}

// Saves options to chrome.storage.sync.
function save_options() {
	var listeArrets = document.getElementById('listeArrets');
	var timeout = document.getElementById('timeoutNotif').value;
	var arrets  = new Array();
	for(i=0;i<listeArrets.options.length;i++) {
		arrets.push(listeArrets.options[i].value);
	}
	
	chrome.storage.sync.set({
		stops: arrets,
		timeoutNotif: timeout
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		stops: new Array(),
		timeoutNotif: '10'
	}, function(items) {
		document.getElementById('timeoutNotif').value = items.timeoutNotif;
		
		var listeArrets = document.getElementById('listeArrets');
		while(listeArrets.firstChild) 
    		listeArrets.removeChild(listeArrets.firstChild);
    	for(i=0;i<items.stops.length;i++) {
			add_option_arret(items.stops[i]);
		}
	});
}

function chooseArret(e) {
	var searchUrl = "https://data.explore.star.fr/api/records/1.0/search/?dataset=tco-bus-topologie-pointsarret-td&refine.nom=" + this.innerText;
	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            var jsonResponse = JSON.parse(xmlhttp.response);
            var listeLigneArret = document.getElementById("listeLigneArret");
			
			while(listeLigneArret.firstChild) 
    			listeLigneArret.removeChild(listeLigneArret.firstChild);
			for(i=0;i<jsonResponse['records'].length;i++) {
				var li = document.createElement("li");
				var text = "Timeo n° : " ;
				li.appendChild(document.createTextNode(text));
				var link = document.createElement("a");
				link.text = jsonResponse['records'][i]['fields']['code'];
				link.href = "http://m.starbusmetro.fr/arret/" + jsonResponse['records'][i]['fields']['code'];
				link.target = "_blank";
				li.appendChild(link);
				listeLigneArret.appendChild(li);
			}
        }
    }
    
    xmlhttp.onerror = function() {
		
	}
    
    xmlhttp.open("GET", searchUrl, true);
    xmlhttp.send();
}

function researchArretName() {
	var arretName = document.getElementById("arretName");
	if(arretName.value.length > 3) {
		var searchurl = 'http://m.starbusmetro.fr/?q=rennes_gtfs_poisuggestions/' + arretName.value;
		searchurl = encodeURI(searchurl);
		
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
				var jsonResponse = JSON.parse(xmlhttp.response);
				var results = document.getElementById("resultResearch");
				
				//clear the result zone
				while(results.firstChild) 
    				results.removeChild(results.firstChild);
				
				for(i=0;i<jsonResponse.length;i++) {
					if(jsonResponse[i]["poi_type"] == "stop") {
						var li = document.createElement("li");
						var link = document.createElement("a");
						var linkText = document.createTextNode(jsonResponse[i]["poi_name"]);
						link.appendChild(linkText);
						link.title = jsonResponse[i]["poi_name"];
						link.href = "#";
						link.onclick = chooseArret;
						li.appendChild(link);
						results.appendChild(li);
					}
				}
			}
		}
		
		xmlhttp.onerror = function() {
			
		}
		
		xmlhttp.open("GET", searchurl, true);
		xmlhttp.send();
	}
}

document.addEventListener('DOMContentLoaded', restore_options);

var arretName = document.getElementById("arretName");
arretName.onkeyup = function (e) {
    clearTimeout(timeoutStopTyping);
    timeoutStopTyping = setTimeout(function () {
        researchArretName();
    }, 500);
};

document.getElementById('save').addEventListener('click', save_options);
document.getElementById('add').addEventListener('click', add_arret);
document.getElementById('delete').addEventListener('click', remove_arret);
