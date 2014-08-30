angular.module('blogAdmin').controller('NavController', ["$scope", "$location", "$rootScope", function ($scope, $location, $rootScope) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path() || $location.path().startsWith(viewLocation + "/");
    };
    $scope.IsPrimary = $rootScope.SiteVars.IsPrimary;
    $scope.showBlogsTab = canManageBlogs();
    $scope.showUsersTab = canManageUsers();
    $scope.showSettingsTab = canManageSettings();
}]);

angular.module('blogAdmin').controller('SubNavController', ["$scope", "$location", function ($scope, $location) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.showRolesTab = canManageRoles();
    $scope.showUsersTab = canManageUsers();
    $scope.showWidgetsTab = canManageWidgets();
    $scope.showContentPages = canManagePages();
}]);

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

function spinOn() {
    $("#spinner").removeClass("loaded");
    $("#spinner").addClass("loading");
}

function spinOff() {
    $("#spinner").removeClass("loading");
    $("#spinner").addClass("loaded");
}

function loading(id) {
    $("#" + id + "-spinner").removeClass("loaded");
    $("#" + id + "-spinner").addClass("loading");
}

function loaded(id) {
    $("#" + id + "-spinner").removeClass("loading");
    $("#" + id + "-spinner").addClass("loaded");
}

function selectedOption(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].OptionValue == val) return arr[i];
    }
}

function findInArray(arr, name, value) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (name in arr[i] && arr[i][name] == value) return arr[i];
    };
    return false;
}

function webRoot(url) {
    var result = SiteVars.ApplicationRelativeWebRoot;
    if (url.substring(0, 1) === "/") {
        return result + url.substring(1);
    }
    else {
        return result + url;
    }
}

function canManageRoles() {
    return SiteVars.UserRights.indexOf("ViewRoles") > -1 ? true : false;
}

function canManageUsers() {
    return SiteVars.UserRights.indexOf("EditOtherUsers") > -1 ? true : false;
}

function canManageSettings() {
    return SiteVars.UserRights.indexOf("AccessAdminSettingsPages") > -1 ? true : false;
}

function canManageWidgets() {
    return SiteVars.UserRights.indexOf("ManageWidgets") > -1 ? true : false;
}

function canManagePages() {
    return SiteVars.UserRights.indexOf("EditOwnPages") > -1 ? true : false;
}

function canManageBlogs() {
    if (SiteVars.IsPrimary == "True") {
        if (SiteVars.IsAdmin == "True") {
            return true;
        }
    }
    return false;
}