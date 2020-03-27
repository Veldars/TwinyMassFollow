
var g_twitterError = false;
var g_canFollow = false;

var storageKey = 'userFollowed';
var nbToFollowKey = "nbToFollowKey";
var timeToWaitKey = "timeToWaitKey";
var timeToWaitMaxKey = "timeToWaitMaxKey";

var idList = [];

var timeToWait = 1000;
var timeToWaitMax = 3000;
var nbToFollow = 200;

var descRequired = false;
var skipFollowers = false;
var skipProtected = false;
var skipVerified = false;
var minNbFollowers = 0;
var maxNbFollowers = 0;
var minTweetNumber = 0;

var counterToast = $.toast({
  icon: 'info', 
  text : '<h3>You already followed 0 accounts</h3>',
  hideAfter : false,
  bgColor : '#001A4A'
});

async function massFollow() {

  var profiles_list = await getUsersToFollow();
  var btnsFollow = $(`[data-testid*="-follow"]`);
  var counter = 0;
  var prev_counter = 0;

  chrome.storage.local.set({ canFollow: false }, () => { });
  g_canFollow = false;
  await sleep(500);
  console.log("First Load: " + profiles_list.length);
  let btnCounter = 0;

  while (!g_twitterError) {
    /*if (profiles_list.length < 1) {
      alert("No profil found");
      return;
    }*/

    console.log(btnsFollow);

    if (btnCounter > 5) {
      counterToast.update({
        icon: 'success', 
        heading: 'End',
        text : `You followed ${counter} accounts. Twiny do not found anymore users`
      });
      console.log("End process, no more people to follow");
      return ;
    }

    if (btnsFollow.length === 0) {
      btnCounter += 1;
      window.scrollBy(0, 500);
      await sleep(2000);
      var new_profiles_list = await loadProfiles(profiles_list); 
      profiles_list = profiles_list.concat(new_profiles_list);
      btnsFollow = $(`[data-testid*="-follow"]`);
      console.log(btnCounter, btnsFollow);
    }
    if (btnsFollow.length < 1) continue;
    else btnCounter = 0;

    const btnFollow = $(btnsFollow[0]);

    console.log(btnFollow.attr('data-testid').split('-')[0]);
    
    var profileIndex = profiles_list.findIndex(prof => prof.rest_id === btnFollow.attr('data-testid').split('-')[0] || prof.id_str === btnFollow.attr('data-testid').split('-')[0])

    console.log(profileIndex);

    if (profileIndex === -1) {
      btnsFollow.splice(0, 1);
      continue ;
    }

    var profile = profiles_list[profileIndex];

    var nodeValue = profile.id_str || profile.rest_id;
    var blocked_by = profile.legacy ? profile.legacy.blocked_by : profile.blocked_by;
    

    if (nodeValue && btnFollow && btnFollow.length > 0 && !blocked_by) {
      if (testCondition(profile.legacy ? profile.legacy : profile, nodeValue)) {
        var maxIteration = 0;
        var isFollowed = false;
        var btnNoClicked = true;
        while (!isFollowed) {
          var tmpTime = Math.floor(Math.random() * (timeToWaitMax - timeToWait + 1)) + timeToWait;
          await sleep(tmpTime / 2);
          if (btnNoClicked) {
            btnFollow.click();
            btnNoClicked = false;
            chrome.runtime.sendMessage({ greeting: "isTwitterError" }, async function (response) {
              if (response.farewell == 'true') {
                rmId(nodeValue);
                if (maxIteration > 2) {
                  g_twitterError = true;
                  notifyAlert("Twitter say that you cannot follow more people for now, end of retry.");
                  console.log("Twitter say cannot follow more people");
                  return ;
                } else {
                  notifyAlert("Twitter say that you cannot follow more people for now, will retry in 30 seconds");
                  maxIteration += 1;
                  await sleep(30000);
                  btnNoClicked = true;
                }
              } else {
                isFollowed = true;
              }
            });
          }
        }
        await sleep(tmpTime / 2);
        counter += 1;
      }
    }
    profiles_list.splice(profileIndex, 1);
    if (counter != prev_counter) {
      counterToast.update({
        text : `<h3>You already followed <strong>${counter}</strong> accounts</h3>`
        });
      prev_counter = counter;
    }
    if (counter >= nbToFollow) {
      console.log("nb to follow reach");
      counterToast.update({
        icon: 'success', 
        heading: 'Success',
        text : `You followed ${counter} accounts`
      });
      return ;
    }
  }
}

function testCondition(user, nodeValue) {
  var result = true;

  console.log("testCondition", user);
  // Not refollow 
  if (descRequired && (!user.description || "" === user.description)) {
    return false;
  }
  if (skipFollowers && user.followed_by) {
    return false;
  }
  if (skipProtected && user.protected) {
    return false;
  }
  if (user.followers_count < minNbFollowers) {
    return false;
  }
  if (maxNbFollowers != 0 && user.followers_count > maxNbFollowers) {
    return false;
  }
  if (user.statuses_count < minTweetNumber) {
    return false;
  }
  if (listContain(idList, nodeValue)) {
    return false;
  }


  return result;
}

async function loadProfiles(profiles_list) {
  var new_profiles_list = [];
  var maxIteration = 0;
  while (!g_canFollow) {
    await sleep(3000);
    var new_profiles_list = await getUsersToFollow();
    if (g_canFollow) {
      break;
    }
    maxIteration += 1;
    if (maxIteration === 5) {
      console.log('scroll');
      $(document).scrollTop($(document).height());
    }
    if (maxIteration > 10) {
      return [];
    }
  }
  g_canFollow = false;
  for (var i = 0; i < new_profiles_list.length; i += 1) {
    if (!arrayContain(profiles_list, new_profiles_list[i].id)) {
      profiles_list.push(new_profiles_list[i]);
    }
  }
  console.log("After Try-Scroll: " + profiles_list.length);
  await sleep(3000);
  return profiles_list;
}

function getUsersToFollow() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ userToFollow: [], canFollow: false }, function (result) {
      console.log(result);
      g_canFollow = result.canFollow;
      chrome.storage.local.set({ userToFollow: [], canFollow: false }, () => { });
      resolve(result.userToFollow);
    });
  });
}

function arrayContain(vendors, value) {
  var found = false;
  for (var i = 0; i < vendors.length; i++) {
    if (vendors[i].id == value) {
      console.log(true);
      found = true;
      break;
    }
  }
  return found;
}

function listContain(vendors, value) {
  var found = false;
  for (var i = 0; i < vendors.length; i++) {
    if (vendors[i] == value) {
      found = true;
      break;
    }
  }
  if (found == false) {
    pushId(value);
  }
  return found;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


chrome.storage.local.get([storageKey], function (result) {
  result[storageKey] ? idList = result[storageKey] : idList = [];
  console.log('Value currently is => ' + idList);
});
chrome.storage.sync.get([nbToFollowKey], function (result) {
  result[nbToFollowKey] ? nbToFollow = parseInt(result[nbToFollowKey]) : '';
  console.log('Value currently is nbToFollowKey => ' + nbToFollow);
});

chrome.storage.sync.get([timeToWaitKey], function (result) {
  result[timeToWaitKey] ? timeToWait = parseInt(result[timeToWaitKey]) : '';
  console.log('Value currently is timeToWaitKey => ' + timeToWait);
});
chrome.storage.sync.get([timeToWaitMaxKey], function (result) {
  result[timeToWaitMaxKey] ? timeToWaitMax = parseInt(result[timeToWaitMaxKey]) : '';
  console.log('Value currently is timeToWaitMax => ' + timeToWaitMax);
});

chrome.storage.sync.get({descRequired: false}, function(result) {
  descRequired = result.descRequired;
  console.log('Value currently is descRequired => ' + descRequired);
});
chrome.storage.sync.get({skipFollowers: false}, function(result) {
  skipFollowers = result.skipFollowers;
  console.log('Value currently is skipFollowers => ' + skipFollowers);
});
chrome.storage.sync.get({skipProtected: false}, function(result) {
  skipProtected = result.skipProtected;
  console.log('Value currently is skipProtected => ' + skipProtected);
});
chrome.storage.sync.get({skipVerified: false}, function(result) {
  skipVerified = result.skipVerified;
  console.log('Value currently is skipVerified => ' + skipVerified);
});
chrome.storage.sync.get({minNbFollowers: 0}, function(result) {
  minNbFollowers = result.minNbFollowers;
  console.log('Value currently is minNbFollowers => ' + minNbFollowers);
});
chrome.storage.sync.get({maxNbFollowers: 0}, function(result) {
  maxNbFollowers = result.maxNbFollowers;
  console.log('Value currently is maxNbFollowers => ' + maxNbFollowers);
});
chrome.storage.sync.get({minTweetNumber: 0}, function(result) {
  minTweetNumber = result.minTweetNumber;
  console.log('Value currently is minTweetNumber => ' + minTweetNumber);
});

function rmId(id) {
  for (var i = idList.length - 1; i >= 0; i--) {
    if (idList[i] === id) {
      idList.splice(i, 1);
      break;
    }
  }
  chrome.storage.local.set({ [storageKey]: idList }, function () { });
}

function pushId(id) {
  idList.push(id);
  chrome.storage.local.set({ [storageKey]: idList }, function () { });
}


function notifyAlert(messageToSend) {
  $.toast({
    icon: 'error', 
    text : messageToSend,
    hideAfter : false,
    bgColor : '#FF260D'
  });
}



massFollow();