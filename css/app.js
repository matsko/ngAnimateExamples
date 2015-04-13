angular.module('AnimationApp', ['ngAnimate'])

  .run(['$rootScope', function($rootScope) {
    $rootScope.cssAnimations = [
      'fade',
      'slide'
    ];
  }])
