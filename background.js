
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

    // Get users to follow
    if (request.userToFollow) {
      const parsedRequest = JSON.parse(request.userToFollow);
      if (parsedRequest.users && parsedRequest.users.length > 0) {
        chrome.storage.local.set({userToFollow: parsedRequest.users, canFollow: true}, function() {
        });
        return sendResponse({farewell: "thanks for the user list : " + parsedRequest.users.length});
      }
      return sendResponse({farewell: "no user in your list script, so no thanks..."});
    }
    // Get users to follow
    if (request.userToFollowFromSearch) {
      const parsedRequest = JSON.parse(request.userToFollowFromSearch);
      var users = parseButtonFromSearch(parsedRequest);
      if (users && users.length > 0) {
        chrome.storage.local.set({userToFollow: users, canFollow: true}, function() {
        });
        return sendResponse({farewell: "thanks for the user list : " + users.length});
      }
      return sendResponse({farewell: "no user in your list script, so no thanks..."});
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