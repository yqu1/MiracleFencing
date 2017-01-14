'use strict'

angular.module('fencingApp')
.service('blogService', ['$http', function($http) {
	var url = 'https://www.googleapis.com/blogger/v3/blogs/7067178439209854231/posts?key=AIzaSyClkD7VwG7pUmxVqDqBcTUZ5PzjWbSHGXA'
	this.getNewBlog = function(callback) {
		$http.get(url).then(function(response) {
			callback(response.data)
		})
	}
}])


.controller('fencingController', ['$scope', 'blogService', '$sce', function($scope, blogService, $sce) {
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

