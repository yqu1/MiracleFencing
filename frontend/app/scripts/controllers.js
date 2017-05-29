'use strict'

angular.module('fencingApp')
.run(function ($rootScope, $state, AuthFactory) {
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    if (toState.authenticate && !AuthFactory.isAuthenticated()){
      // User isn’t authenticated
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
        // $rootScope.$on('registration:Successful', function() {
        //   $rootScope.loggedin = true
        //   $rootScope.username = AuthFactory.getUsername();
        //   $state.go('app')
        // })
        ngDialog.close();

    };
}])

.controller('regController', ['$scope', 'regFactory', function($scope, regFactory) {
    
   $scope.reginfo = {
    firstname: "", 
      lastname: "", 
      gender: "", 
      dob: "", 
      email: "",
      address: "",
      phone: "",
      regclass: "",
      additional: "",
      membership: ""
   }

   $scope.sendEmail = function() {
      regFactory.query($scope.reginfo).$promise.then(function(response) {
        $scope.reginfo = {
          firstname: "", 
            lastname: "", 
            gender: "", 
            dob: "", 
            email: "",
            address: "",
            phone: "",
            regclass: "",
            additional: "",
            membership: ""
         }
         Materialize.toast("Sent!", 3000)
         console.log("sent")
      })
    }

}])

.controller('duelController', ['$scope', 'userFactory', 'matchFactory', 'AuthFactory', function($scope, userFactory, matchFactory, AuthFactory) {

  var nameMap = {};
  $scope.allRequests = {} //all pending and declined requests
  $scope.allMatches = {} //all uncompleted and declined matches
  $scope.allRecords = {} //all completed matches
  $scope.record = {
    winner: null,
    winScore: 0,
    loseScore: 0
  }

  $scope.op = {}
  $scope.duelReq = {}
  $scope.challenge = {}

  //get all users and all requests
  userFactory.query().$promise.then(function(allUsers) {
    allUsers.forEach(function(user) {
      nameMap[user._id] = user;
    })

    $scope.allUsers = allUsers.filter(function(user) {
      return user._id != AuthFactory.getUserId()
    })

    $scope.getAllThings = function() {
          var query1 = JSON.stringify({
      '$and': [{$or: [{'from': AuthFactory.getUserId()}, {'to': AuthFactory.getUserId()}]}, {$or: [{'status': 'pending'}, {'status': 'declined'}]}],
      'date': {$gte: new Date()}
    })
    matchFactory.query({q: query1}).$promise.then(function(allRequests){
        console.log(allRequests)
        $scope.allRequests = allRequests.map(function(r) {
            return {
              _id: r._id,
              from: nameMap[r.from],
              to: nameMap[r.to],
              date: r.date,
              message: r.message,
              status: r.status,
              created_at: r.created_at
            }
          })
    })

    var query2 = JSON.stringify({
      '$and': [{$or: [{'from': AuthFactory.getUserId()}, {'to': AuthFactory.getUserId()}]}, {$or: [{'status': 'uncompleted'}, {'status': 'cancelled'}]}],
      'date': {$gte: new Date()}
    })
    matchFactory.query({q: query2}).$promise.then(function(allMatches) {
      $scope.allMatches = allMatches.map(function(m) {
        return {
          _id: m._id,
          from: nameMap[m.from],
          to: nameMap[m.to],
          date: m.date,
          message: m.message,
          status: m.status,
          created_at: m.created_at
        }
      })
    })

    var query3 = JSON.stringify({
      '$or': [{'from': AuthFactory.getUserId()}, {'to': AuthFactory.getUserId()}],
      'status': 'completed',
      'date': {$lte: new Date()}
    })
    matchFactory.query({q: query3}).$promise.then(function(allCompleted) {
      $scope.allCompleted = allCompleted.map(function(c) {
          c.record.winner = nameMap[c.record.winner].firstname + ", " + nameMap[c.record.winner].lastname;
          console.log(c.record)
          return {
            _id: c._id,
            from: nameMap[c.from],
            to: nameMap[c.to],
            date: c.date,
            message: c.message,
            status: c.status,
            record: c.record,
            created_at: c.created_at
          }
      })
    })
  }

  $scope.getAllThings();

  })



  $scope.setOpponent = function(user) {
    $scope.op = user
  }
  $scope.sendRequest = function() {
    $scope.duelReq.from = AuthFactory.getUserId();
    $scope.duelReq.to = $scope.op._id;
    $scope.duelReq.date = new Date($scope.duelReq.date);
    $scope.duelReq.date = $scope.duelReq.date.setHours(23);
    console.log($scope.duelReq.date)
    $scope.duelReq.status = 'pending';
    matchFactory.save($scope.duelReq).$promise.then(function(response) {
      $scope.getAllThings();
    })
  }
  $scope.set1 = function(req) {
    $scope.req = req;
    $scope.fromMeAndPending = (req.from._id !== AuthFactory.getUserId()) && (req.status === "pending");
  }

  $scope.set2 = function(match) {
    $scope.match = match;
    $scope.fromMeAndUncompleted = (match.status === "uncompleted");
  }

  $scope.set3 = function(completed) {
    $scope.completed = completed;
  }

  $scope.reqFuncs = {
      subReq: function() {

        console.log($scope.req.to._id)
        console.log($scope.req.from._id)
        console.log($scope.req.date)
          matchFactory.save({
            from: $scope.req.from._id,
            to: $scope.req.to._id,
            date: $scope.req.date,
            message: $scope.req.message,
            status: 'uncompleted',
            record: {
              winner: null,
              winScore: 0,
              loseScore: 0
            }
          }).$promise.then(function(response) {
            $scope.getAllThings();
          })
        },
      declineReq: function() {
        matchFactory.save({
            from: $scope.req.from._id,
            to: $scope.req.to._id,
            date: $scope.req.date,
            message: $scope.req.message,
            status: 'declined',
            record: {
              winner: null,
              winScore: 0,
              loseScore: 0
            }
          }).$promise.then(function(res) {
            $scope.getAllThings();
          })
      }
  }


  $scope.matchFuncs = {
      subMatch: function() {
          if($scope.record.winner) {
            $scope.record.winner = AuthFactory.getUserId()
          }
          else {
            if($scope.match.to._id === AuthFactory.getUserId()) {
              $scope.record.winner  = $scope.match.from._id
            }
            else {
              $scope.record.winner  = $scope.match.to._id
            }
          }
          matchFactory.save({
            from: $scope.match.from._id,
            to: $scope.match.to._id,
            date: $scope.match.date,
            message: $scope.match.message,
            status: 'completed',
            record: $scope.record
          }).$promise.then(function(res) {
            $scope.getAllThings();
          })
        },
      cancelMatch: function() {
        matchFactory.save({
            from: $scope.match.from._id,
            to: $scope.match.to._id,
            date: $scope.match.date,
            message: $scope.match.message,
            status: 'cancelled',
            record: {
              winner: null,
              winScore: 0,
              loseScore: 0
            }
          }).$promise.then(function(res) {
            $scope.getAllThings();
          })
      }
  }


}])
