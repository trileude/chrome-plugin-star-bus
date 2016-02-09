// Saves options to chrome.storage.sync.
function save_options() {
  var stop = document.getElementById('stop').value;
  chrome.storage.sync.set({
    favoriteStop: stop
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
  // Use default value 1164
  chrome.storage.sync.get({
    favoriteStop: '1164'
  }, function(items) {
    document.getElementById('stop').value = items.favoriteStop;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
