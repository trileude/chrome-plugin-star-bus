function createAlarm(date) {
	//delete old alarm
	chrome.alarms.clear("busArrived");
	
	var dateToDisplay = new Date(date);
	
	console.log("Create alarm for next bus at : " + dateToDisplay.toString());
	
	chrome.alarms.create("busArrived", {
    	when: date
    });
}

chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name == "busArrived") {
		chrome.notifications.create('reminder', {
			type: 'basic',
			iconUrl: 'star128.png',
			title: 'Il est temps de partir !',
			message: 'Votre bus est en approche !'
		}, function(notificationId) {});
	}
});
