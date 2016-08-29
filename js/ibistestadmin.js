'use strict';
var thisapp = angular.module('myApp.ibtestadmin', ['ngResource']);

thisapp.factory('Ibtestdeffactory', function($resource)
{
    var rest1 = $resource('resources/ibtestdef/:id', {id: '@id'}, {
        update: { url:'resources/ibtestdef/ibtestupdate', method: 'PUT'}
    });
    
    return rest1; 
});

thisapp.factory('Testmethodfactory', function($resource)
{
    var rest2 = $resource('resources/testmethoddefault/:id', {id: '@id'}, {
        update: { url:'resources/testmethoddefault/methodupdate', method: 'PUT'}
    });
    
    return rest2; 
});

thisapp.controller('ibtestadminCtrl', function($scope, Ibtestdeffactory, Testmethodfactory, alertService) 
{
    window.ps = $scope;
    $scope.ibtestList = Ibtestdeffactory.query();
    $scope.ibtestMethods = Testmethodfactory.query();
    
    $scope.create = function(newIBtest)
    {
        var formIsright = false;
        if($scope.testcreate.$valid){ 
            formIsright = true;
        }
        else{
            if($scope.testcreate.$error.required){
                var errors = "";
                $scope.testcreate.$error.required.forEach(function(entry){
                    errors += entry.$name + ", ";
                });
                alertService.add('danger', 'Some required fields are not filled in. Please check: ' + errors.substr(0, errors.length-2));
            }else if($scope.testcreate.$error.pattern){
                var errors = "";
                $scope.testcreate.$error.pattern.forEach(function(entry){
                    errors += entry.$name + ", ";
                });
                alertService.add('danger', 'Test names must follow the Pattern. Please check: ' + errors.substr(0, errors.length-2));
            }else{
                alertService.add('danger', 'Values missing or incorrect');
            };
        }
        
        //check test no to be duplicate
        for(var k =0; k < $scope.ibtestList.length; k++)
        {
            if($scope.ibtestList[k].testMethod.etestMethod == newIBtest.testMethod.etestMethod && $scope.ibtestList[k].testName == newIBtest.testName)
            {
                formIsright = false;
                alertService.add('danger', 'An IB test with this information exists. You can not create duplicate tests!');
            }
        }
        $scope.ibtestList
        if(!formIsright) return;
        
        Ibtestdeffactory.save(newIBtest, 
        function success(d) {
            $scope.ibtestList = Ibtestdeffactory.query();
            $scope.newIBtest = {};
            
            alertService.add('success', 'The new IB test is created')
        },
        function fail(d) {
            alert('Saving new IB test failed');
        }
                );
        
    };
    
    $scope.updateTest = function(iTest)
    {
        
        Ibtestdeffactory.update(iTest, function() {alertService.add('success', 'The IB test was updated')},
        function() {alertService.add('danger', 'The IB test was not updated!')}
                );
    };
    
    $scope.confirmDeletionTest = function(iTest)
    {
        if (confirm('Are you sure you want to delete this test?')) {
            
            Ibtestdeffactory.delete(iTest, 
            function success(d) {
                $scope.ibtestList = Ibtestdeffactory.query();
                
                alertService.add('success', 'The selected IB test is deleted')
            },
            function fail(d) {
                alertService.add('danger', 'Deleting selected IB test failed! The test is in use for sessions!');
            });
            
        }
        
    };
    
});