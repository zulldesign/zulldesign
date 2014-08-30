angular.module('blogAdmin').controller('PostsController', ["$rootScope", "$scope", "$location", "$http", "$filter", "dataService", function ($rootScope, $scope, $location, $http, $filter, dataService) {
    $scope.items = [];
    $scope.filter = ($location.search()).fltr;

    $scope.load = function () {
        spinOn();
        var url = '/api/posts';
        var p = { take: 0, skip: 0 }
        dataService.getItems(url, p)
        .success(function (data) {
            angular.copy(data, $scope.items);
            gridInit($scope, $filter);
            if ($scope.filter) {
                $scope.setFilter($scope.filter);
            }
            spinOff();
        })
        .error(function () {
            toastr.error($rootScope.lbl.errorLoadingPosts);
            spinOff();
        });
    }

    $scope.load();
	
	$scope.processChecked = function (action) {
	    spinOn();
	    var i = $scope.items.length;
	    var checked = [];
	    while (i--) {
	        var item = $scope.items[i];
	        if (item.IsChecked === true) {
	            checked.push(item);
	        }
	    }
	    if (checked.length < 1) {
	        spinOff();
	        return false;
	    }
        dataService.processChecked("/api/posts/processchecked/" + action, $scope.items)
        .success(function (data) {
            $scope.load();
            gridInit($scope, $filter);
            toastr.success($rootScope.lbl.completed);
            spinOff();
        })
        .error(function () {
            toastr.error($rootScope.lbl.failed);
            spinOff();
        });
    }

	$scope.setFilter = function (filter) {
	    if ($scope.filter === 'pub') {
	        $scope.gridFilter('IsPublished', true, 'pub');
	    }
	    if ($scope.filter === 'dft') {
	        $scope.gridFilter('IsPublished', false, 'dft');
	    }
	}

}]);