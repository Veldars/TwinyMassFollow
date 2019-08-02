 
let cleanFollow = $('#cleanFollow');

cleanFollow.click(function() {
  var storageKey = 'userFollowed';
  chrome.storage.local.set({[storageKey]: []}, function() { });
});
