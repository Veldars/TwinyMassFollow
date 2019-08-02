function interceptData() {
    var xhrOverrideScript = document.createElement('script');
    xhrOverrideScript.type = 'text/javascript';
    xhrOverrideScript.innerHTML = `
    (function() {
      var XHR = XMLHttpRequest.prototype;
      var send = XHR.send;
      var open = XHR.open;
      XHR.open = function(method, url) {
          this.url = url; // the request url
          return open.apply(this, arguments);
      }
      XHR.send = function() {
          this.addEventListener('load', function() {
              
              if (this.url.includes('/lists/members.json') ||
                    this.url.includes('/lists/subscribers.json') ||
                    this.url.includes('followers/list.json') ||
                    this.url.includes('friends/list.json')) {
                  var dataDOMElement = document.createElement('div');
                  dataDOMElement.id = '__interceptedData';
                  dataDOMElement.innerText = this.response;
                  dataDOMElement.style.height = 0;
                  dataDOMElement.style.overflow = 'hidden';
                  document.body.appendChild(dataDOMElement);
              }               
          });
          return send.apply(this, arguments);
      };
    })();
    `
    document.head.prepend(xhrOverrideScript);

    // for search purpose
    var xhrOverrideScript2 = document.createElement('script');
    xhrOverrideScript2.type = 'text/javascript';
    xhrOverrideScript2.innerHTML = `
    (function() {
      var XHR = XMLHttpRequest.prototype;
      var send = XHR.send;
      var open = XHR.open;
      XHR.open = function(method, url) {
          this.url = url; // the request url
          return open.apply(this, arguments);
      }
      XHR.send = function() {
          this.addEventListener('load', function() {
              
              if (this.url.includes('timeline/liked_by.json') ||
                    this.url.includes('timeline/retweeted_by.json') ||
                    this.url.includes('search/adaptive.json')) {
                  var dataDOMElement = document.createElement('div');
                  dataDOMElement.id = '__interceptedData2';
                  dataDOMElement.innerText = this.response;
                  dataDOMElement.style.height = 0;
                  dataDOMElement.style.overflow = 'hidden';
                  document.body.appendChild(dataDOMElement);
              }               
          });
          return send.apply(this, arguments);
      };
    })();
    `
    document.head.prepend(xhrOverrideScript2);
}

function checkForDOM() {
    if (document.body && document.head) {
        interceptData();
    } else {
        setTimeout(() => checkForDOM(), 100);
    }
}

checkForDOM();

function scrapeData() {
    var responseContainingEle = document.getElementById('__interceptedData');
    if (responseContainingEle) {
        chrome.runtime.sendMessage({ userToFollow: responseContainingEle.innerHTML }, function (response) {
            console.log(response.farewell);
        });
        responseContainingEle.remove();
    }
    setTimeout(() => requestIdleCallback(scrapeData), 1000);
}
requestIdleCallback(scrapeData); 

function scrapeData2() {
    var responseContainingEle = document.getElementById('__interceptedData2');
    if (responseContainingEle) {
        chrome.runtime.sendMessage({ userToFollowFromSearch: responseContainingEle.innerHTML }, function (response) {
            console.log(response.farewell);
        });
        responseContainingEle.remove();
    }
    setTimeout(() => requestIdleCallback(scrapeData2), 1000);
}
requestIdleCallback(scrapeData2); 

chrome.runtime.sendMessage({ greeting: "start_network_watcher" }, function (response) {
    console.log(response.farewell);
});
