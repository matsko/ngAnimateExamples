function noop() {}

class Observable {
  constructor(forEach) {
    this._forEach = forEach;
  }
      
  forEach(onNext, onError, onCompleted) {
    if (typeof onNext === 'function') {
      return this._forEach({
        onNext:onNext,
        onError:onError || noop,
        onCompleted:onCompleted || noop
      });
    } else {
      return this._forEach(onNext);
    }
  }
  
  map(projectionFn) {
    return new Observable(
      (observer) => this.forEach({
        onNext: (data) => observer.onNext(projectionFn(data)),
        onError: (error) => observer.onError(error),
        onCompleted: () => observer.onCompleted()
      })
    );
  }
  
  filter(predicateFn) {
    return new Observable(
      (observer) => this.forEach({
        onNext: function(data) {
          if (predicateFn(data)) {
            observer.onNext(data);
          }
        },
        onError: (error) => observer.onError(error),
        onCompleted: () => observer.onCompleted()
      })
    );
  }
} 


var YOUTUBE_JSON = 'https://gdata.youtube.com/feeds/api/videos/?alt=json&v=2&q={VALUE}';

function searchYoutube(value) {
  var url = YOUTUBE_JSON.replace('{VALUE}', value);
  return Observable.json(url);
}

Observable.of = function(...args) {
  return new Observable(function forEach(observer) {
    args.forEach(function(arg) {
      observer.onNext(arg);
    });
    observer.onCompleted();
    return {
      dispose: function() {
      }
    };
  });
};

Observable.fromEvent = function(domNode, eventName) {
  return new Observable(function forEach(observer) {

    function eventHandler(e) {
      observer.onNext(e);
    }

    domNode.addEventListener(eventName, eventHandler);
    
    return {
      dispose: function() {
        domNode.removeEventListener(eventName, eventHandler);
      }
    };
  });
};

Observable.json = function(path) {
  return new Observable(function forEach(observer) {

    var xhr = $.getJSON(path, function(data) {
      observer.onCompleted(data);
    });
    
    return {
      dispose: function() {
        xhr.abort();
      }
    };
  });
};

var elm = $('#test')[0];
var keyups = Observable.fromEvent(elm, 'keyup');
var keyCodes = keyups.map(function(e) {
  return e.keyCode;
});
var sub = keyCodes.forEach(function(keyCode) {
  if (keyCode === 27) {
    sub.dispose();
  }
  console.log(keyCode);  
});
