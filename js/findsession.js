'use strict';
var thisapp = angular.module('myApp.findsession', ['ngResource']);

thisapp.factory('Sessionfactory', function($resource)
{
    var rest1 = $resource('resources/crsession/:id', {id: '@id'}, {
        myDel : {url: 'resources/crsession/:delId', method: 'DELETE', params:{'delId': '@id'}},
        getAllSessionDto: { url : 'resources/crsession/getallsessiondto', method: 'GET', isArray: true},
        getOneSessionDto: {url : 'resources/crsession/getonesessiondto/:id', method: 'GET' , params: {id: '@id'}, isArray: false},
        delteOneSessionDto : {url: 'resources/crsesion/deleteonesessiondto/:id', method: 'DELETE', params:{id: '@id'}},
        updateOneSessionDto : {url: 'resources/crsession/updateonesessiondto', method: 'PUT'},
        update: { method: 'PUT'}
    });
   
    return rest1; 
});

thisapp.controller('findsessionCtrl', function($scope, $rootScope, Sessionfactory, alertService) 
{
    window.ps = $scope;
    $scope.sf = Sessionfactory;
    $scope.sessionList = Sessionfactory.getAllSessionDto();
    
    $scope.confirmSessionDeletion = function(obj)
    {
        if (confirm('Are you sure you want to delete this session?')) 
        {
            obj.$delete(         
            function success(d) {
                $scope.sessionList = Sessionfactory.getAllSessionDto();
                alertService.add('success', 'The selected session is deleted');
                },
            function fail(d) {
                alertService.add('deleting selected session test failed');
                });
        }
    };
   
});
