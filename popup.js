let massFollow = $('#massFollow');
let nbToFollow = $('#nbToFollow');
let timeToWait = $('#timeToWait');
let timeToWaitMax = $('#timeToWaitMax');

let descRequired = $('#descRequired');
let skipFollowers = $('#skipFollowers');
let skipProtected = $('#skipProtected');
let skipVerified = $('#skipVerified');
let minNbFollowers = $('#minNbFollowers');

let maxNbFollowers = $('#maxNbFollowers');
let minTweetNumber = $('#minTweetNumber');

let nbToFollowKey = "nbToFollowKey";
let timeToWaitKey = "timeToWaitKey";
let timeToWaitMaxKey = "timeToWaitMaxKey";

let nbFollowed = $('#nbFollowed');
  
  massFollow.click(function() {
    console.log("start mass follow");
    chrome.tabs.executeScript({
      file: 'massFollow.js'
    }); 
  });
   

nbToFollow.change(function() {
  chrome.storage.sync.set({[nbToFollowKey]: nbToFollow.val()}, function() {
  });
});
timeToWait.change(function() {
  chrome.storage.sync.set({[timeToWaitKey]: timeToWait.val()}, function() {
  });
});
timeToWaitMax.change(function() {
  chrome.storage.sync.set({[timeToWaitMaxKey]: timeToWaitMax.val()}, function() {
  });
});

descRequired.change(function() {
  chrome.storage.sync.set({descRequired: descRequired.prop( "checked" )}, function() {
  });
});
skipFollowers.change(function() {
  chrome.storage.sync.set({skipFollowers: skipFollowers.prop( "checked" )}, function() {
  });
});
skipProtected.change(function() {
  chrome.storage.sync.set({skipProtected: skipProtected.prop( "checked" )}, function() {
  });
});
skipVerified.change(function() {
  chrome.storage.sync.set({skipVerified: skipVerified.prop( "checked" )}, function() {
  });
});
minNbFollowers.change(function() {
  chrome.storage.sync.set({minNbFollowers: minNbFollowers.val()}, function() {
  });
});
maxNbFollowers.change(function() {
  chrome.storage.sync.set({maxNbFollowers: maxNbFollowers.val()}, function() {
  });
});
minTweetNumber.change(function() {
  chrome.storage.sync.set({minTweetNumber: minTweetNumber.val()}, function() {
  });
});
  
chrome.storage.sync.get([nbToFollowKey], function(result) {
  result[nbToFollowKey] ? nbToFollow.val(result[nbToFollowKey]) : '';
});
chrome.storage.sync.get(timeToWaitKey, function(result) {
  result[timeToWaitKey] ? timeToWait.val(result[timeToWaitKey]) : '';
});
chrome.storage.sync.get(timeToWaitMaxKey, function(result) {
  result[timeToWaitMaxKey] ? timeToWaitMax.val(result[timeToWaitMaxKey]) : '';
});

chrome.storage.sync.get({descRequired: false}, function(result) {
  descRequired.prop("checked", (result.descRequired));
});
chrome.storage.sync.get({skipFollowers: false}, function(result) {
  skipFollowers.prop("checked", (result.skipFollowers));
});
chrome.storage.sync.get({skipProtected: false}, function(result) {
  skipProtected.prop("checked", (result.skipProtected));
});
chrome.storage.sync.get({skipVerified: false}, function(result) {
  skipVerified.prop("checked", (result.skipVerified));
});
chrome.storage.sync.get({minNbFollowers: 0}, function(result) {
  minNbFollowers.val(result.minNbFollowers);
  console.log(result);
});
chrome.storage.sync.get({maxNbFollowers: 0}, function(result) {
  maxNbFollowers.val(result.maxNbFollowers);
  console.log(result);
});
chrome.storage.sync.get({minTweetNumber: 0}, function(result) {
  minTweetNumber.val(result.minTweetNumber);
  console.log(result);
});

chrome.storage.local.get({userFollowed: []}, function(result) {
  nbFollowed.html(`You already followed <b>${result.userFollowed.length}</b> account with this extension`);
});