
var g_twitterError = false;

function extractStatus(line) {
  var match = line.match(/[^ ]* (\d{3}) (.*)/);
  if(match) {
    return {code: match[1], message: match[2]};
  } else {
    return undefined;
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "start_network_watcher") {
      chrome.webRequest.onHeadersReceived.addListener(
        function(details) {
          if(details.statusCode == '403' && details.url.indexOf("https://api.twitter.com/1.1/friendships/create.json") != -1) {
            g_twitterError = true;
          }
        },
        {urls: ["*://*.twitter.com/*"]}
      );
      sendResponse({farewell: "Service Started"});
    }
    if (request.greeting == "isTwitterError") {
      sendResponse({farewell: "" + g_twitterError});
      if (g_twitterError) g_twitterError = false;
    }

    // Get users to follow New Version
    if (request.userToFollowNew) {
      const parsedRequest = JSON.parse(request.userToFollowNew);
      if (parsedRequest.data && parsedRequest.data.user) {
        let timeline = {};
        if (parsedRequest.data.user.followers_timeline)
          timeline = parsedRequest.data.user.followers_timeline;
        if (parsedRequest.data.user.following_timeline) {
          timeline = parsedRequest.data.user.following_timeline;
        }
        if(timeline.timeline && timeline.timeline.instructions && timeline.timeline.instructions.length > 0) {
          const instructions = timeline.timeline.instructions;
          var index = 0;
          for (let i = 0; i < instructions.length; i += 1) {
            if (instructions[i].type === "TimelineAddEntries") {
              index = i;
              break;
            }
          }
          if (instructions[index].entries
            && instructions[index].entries.length > 0) {
              chrome.storage.local.set({userToFollow: instructions[index].entries.map(e => e.content && e.content.itemContent && e.content.itemContent.user ? e.content.itemContent.user : {}), canFollow: true}, function() {});
              return sendResponse({farewell: "3: thanks for the user list : " + instructions[index].entries.length});
          }
        }
      }
      return sendResponse({farewell: "3: no user in your list script, so no thanks..."});
    }
    
    // Get users to follow
    if (request.userToFollow) {
      const parsedRequest = JSON.parse(request.userToFollow);
      if (parsedRequest.users && parsedRequest.users.length > 0) {
        chrome.storage.local.set({userToFollow: parsedRequest.users, canFollow: true}, function() {
        });
        return sendResponse({farewell: "2: thanks for the user list : " + parsedRequest.users.length});
      }
      return sendResponse({farewell: "2: no user in your list script, so no thanks..."});
    }
    // Get users to follow
    if (request.userToFollowFromSearch) {
      const parsedRequest = JSON.parse(request.userToFollowFromSearch);
      var users = parseButtonFromSearch(parsedRequest);
      if (users && users.length > 0) {
        chrome.storage.local.set({userToFollow: users, canFollow: true}, function() {
        });
        return sendResponse({farewell: "1: thanks for the user list : " + users.length});
      }
      return sendResponse({farewell: "1: no user in your list script, so no thanks..."});
    }
});

function parseButtonFromSearch(response) {
  var userList = [];
  if (response && response.globalObjects && response.globalObjects.users && response.globalObjects.users != {}) {
    var users =  response.globalObjects.users;
    var keys = Object.keys(users);
    for (let i = 0; i < keys.length; i += 1) {
      userList.push(users[keys[i]]);
    }
  }
  return userList;
};