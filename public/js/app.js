angular.module('chat', ['ngRoute', 'btford.socket-io'])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: '/partials/username.html'
	})
	.when('/:room', {
		templateUrl: '/partials/chat.html'
	})
	.otherwise({
		redirectTo: '/'
	});
}])
.factory('socket', function(socketFactory) {
	return socketFactory();
})
.controller('Chat', ['$scope', '$http', '$location', '$routeParams', 'socket', function($scope, $http, $location, $routeParams, socket) {
	$scope.messages = [];
	$scope.init = false;
	$scope.user = {
		username: ''
	};
	$scope.chat = {
		message: ''
	};
	$scope.defaultRooms = ['general', 'random', 'meta'];

	$scope.$on('$routeChangeSuccess', function() {
		if ($location.path != '/' && $scope.user.username.length === 0) {
			$location.path('/');
		} else if ($routeParams.room) {
			$scope.changeRoom($routeParams.room);
		}
	});

	socket.on('send:message', function(message) {
		$scope.messages.push(message);
	});

	$scope.sendUsername = function() {
		if ($scope.user.username.length !== 0) {
			socket.emit('username', $scope.user.username);
			$scope.init = true;
		}
	};

	$scope.sendMessage = function() {
		if ($scope.chat.message.length !== 0) {
			socket.emit('message', $scope.chat.message);
			$scope.chat.message = '';
			setTimeout(function() {
				$('#message').focus();
			}, 0);
		}
	};

	$scope.redirectRoom = function(room) {
		$location.path('/' + room);
	};

	$scope.changeRoom = function(room) {
		$scope.messages = [];
		$scope.room = room;
		socket.emit('change', room);
	};

	$scope.differentUser = function(index) {
		return $scope.messages[index].user != $scope.messages[index - 1].user || $scope.messages[index - 1].type == 'join';
	};
}]).directive('enter', function() {
	return function($scope, $element, $attrs) {
		$element.bind('keydown keypress', function(e) {
			if (e.which === 13) {
				$scope.$apply(function() {
					$scope.$eval($attrs.enter);
				});
				e.preventDefault();
			}
		});
	};
});