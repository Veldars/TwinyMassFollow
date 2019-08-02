var storageKey = 'userFollowed';

chrome.storage.local.set({[storageKey]: []}, function() { });