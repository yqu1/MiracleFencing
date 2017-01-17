'use strict'

angular.module('fencingApp')
.run(function ($rootScope, $state, AuthFactory) {
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    if (toState.authenticate && !AuthFactory.isAuthenticated()){
      // User isn’t authenticated
      console.log("fuck")
      $state.transitionTo("app.login");
      event.preventDefault(); 
    }
  });
})
.run(function($rootScope, AuthFactory) {
  if(AuthFactory.getUsername() != '') {
    $rootScope.loggedin = true
    $rootScope.username = AuthFactory.getUsername()
  }
  else {
    $rootScope.loggedin = false
  }
})
.constant("baseURL", "http://localhost:8080/")
.service('blogService', ['$http', function($http) {
	var url = 'https://www.googleapis.com/blogger/v3/blogs/7067178439209854231/posts?key=AIzaSyClkD7VwG7pUmxVqDqBcTUZ5PzjWbSHGXA'
	this.getNewBlog = function(callback) {
		$http.get(url).then(function(response) {
			callback(response.data)
		})
	}
}])

.factory('userFactory', ['$resource', 'baseURL', function($resource, baseURL) {
  return $resource(baseURL + "users", null, {
    'query': {
      method: 'GET', isArray: true
    }
  })
}])

.factory('requestFactory', ['$resource', 'baseURL', function($resource, baseURL) {
  return $resource(baseURL + "requests/:id", null, {
    'update': {
      method: 'PUT'
    },
    'query': {
      method: 'GET', isArray: true
    }
  })
}])

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])

.factory('AuthFactory', ['$resource', '$http', '$state', '$localStorage', '$rootScope', '$window', 'baseURL', 'ngDialog', function($resource, $http, $state, $localStorage, $rootScope, $window, baseURL, ngDialog){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var userId = '';
    var authToken = undefined;
    

  function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    isAuthenticated = true;
    username = credentials.username;
    authToken = credentials.token;
    userId = credentials.userId;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    userId = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
     
    authFac.login = function(loginData) {
        
        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:loginData.username, token: response.token, userId: response.userId});
              $rootScope.$broadcast('login:Successful');
              Materialize.toast('Welcome, swordsman ' + loginData.username, 3000)
           },
           function(response){
              isAuthenticated = false;
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Login Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>'
            
                ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        
        );

    };
    
    authFac.Logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
        $rootScope.loggedin = false;
        Materialize.toast('You are successfully logged out!', 3000)
        $state.go('app')
    };
    
    authFac.getUserId = function() {
      return userId;
    }

    authFac.register = function(registerData) {
        
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
              authFac.login({username:registerData.username, password:registerData.password});
            if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
            }
           
              $rootScope.$broadcast('registration:Successful');
           },
           function(response){
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';

                ngDialog.openConfirm({ template: message, plain: 'true'});

           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };

    loadUserCredentials();
    
    return authFac;
    
}])


.controller('fencingController', ['$scope', 'blogService', 'AuthFactory', '$sce', function ($scope, blogService, AuthFactory, $sce) {
    $scope.logout = function() {
      AuthFactory.Logout()
    }
    blogService.getNewBlog(function(data) {
  		$scope.post1 = {
  			newPost: data.items[0]["content"],
	  		newPost_url: data.items[0]["url"],
	  		title:  data.items[0]["title"],
	  		author:  data.items[0]["author"]["displayName"],
	  		author_url:  data.items[0]["author"]["url"],
	  		newDate:  new Date(data.items[0]["published"])
  		}

  		$scope.post2 = {
  			newPost: data.items[1]["content"],
	  		newPost_url: data.items[1]["url"],
	  		title:  data.items[1]["title"],
	  		author:  data.items[1]["author"]["displayName"],
	  		author_url:  data.items[1]["author"]["url"],
	  		newDate:  new Date(data.items[1]["published"])
  		}

      $scope.post3 = {
        newPost: data.items[2]["content"],
        newPost_url: data.items[2]["url"],
        title:  data.items[2]["title"],
        author:  data.items[2]["author"]["displayName"],
        author_url:  data.items[2]["author"]["url"],
        newDate:  new Date(data.items[2]["published"])
      }
  	})
  	$scope.scrollBottom = function() {
  		window.scrollTo(0,document.body.scrollHeight);
  	}
 }])


.controller('loginController', ['$scope', '$rootScope', '$state', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, $rootScope, $state, ngDialog, $localStorage, AuthFactory) {
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);
        $rootScope.$on('login:Successful', function() {
          $rootScope.loggedin = true;
          $rootScope.username = AuthFactory.getUsername();
          $state.go('app')
        })
        ngDialog.close();

    };
            
    
}])

.controller('signupController', ['$scope', '$rootScope', '$state', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, $rootScope, $state, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);
        $rootScope.$on('registration:Successful', function() {
          $rootScope.loggedin = true
          $rootScope.username = AuthFactory.getUsername();
          $state.go('app')
        })
        ngDialog.close();

    };
}])

.controller('duelController', ['$scope', 'userFactory', 'requestFactory', 'AuthFactory', function($scope, userFactory, requestFactory, AuthFactory) {
  var nameMap = {};
  $scope.op = {}
  $scope.duelReq = {}
  $scope.challenge = {}
  userFactory.query().$promise.then(function(allUsers) {
    $scope.allUsers = allUsers.filter(function(user) {
      return user._id != AuthFactory.getUserId()
    })

    allUsers.forEach(function(user) {
      nameMap[user._id] = user;
    })

    requestFactory.query().$promise.then(function(allRequests){
        console.log(allRequests)
        $scope.allRequests = allRequests.map(function(r) {
            return {
              _id: r._id,
              from: nameMap[r.from],
              to: r.to,
              date: r.date,
              message: r.message,
              created_at: r.created_at
            }
          })
    })
  })
  $scope.setOpponent = function(user) {
    $scope.op = user
  }
  $scope.sendRequest = function() {
    $scope.duelReq.to = $scope.op._id
    requestFactory.save($scope.duelReq)
  }
  $scope.set = function(req) {
    $scope.challenge = req
    console.log($scope.challenge)
  }
  $scope.subReq = function() {
    requestFactory.delete({id: $scope.challenge._id})
    $scope.allRequests = $scope.allRequests.filter(function(r) {
      return r._id != $scope.challenge._id
    })
  }
}])
