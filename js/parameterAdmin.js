'use strict';
angular.module('myApp.parameterAdmin', ['ngResource'])
        
    .factory('Parameterfactory', function($resource)
    {
        var rest1 = $resource('resources/parameter/:id', {id: '@id'}, {
            update: { url:'resources/parameter/parameterupdate', method: 'PUT'}
    });
    return rest1; 
    })
   
    .controller('parameterAdminCtrl', function($scope, Parameterfactory, alertService) 
    {
        window.ps = $scope;
        $scope.paramRest2 = Parameterfactory;
        $scope.allParameters = [];
        $scope.allParameters = Parameterfactory.query();
        
        $scope.allParameters.$promise.then(function() {
            console.log("111all parameters " + $scope.allParameters.length);
            
            for(var i= 0; i < $scope.allParameters.length; i++)
            {
                if($scope.allParameters[i].isDefault)
                {
                    $scope.parameterDefault = $scope.allParameters[i];
                }
            }
            console.log("2222all parameters " + $scope.allParameters.length);
            console.log("$scope.parameterDefault: " + $scope.parameterDefault);
            
        });
        
        
        $scope.updateParamDef = function () {
        
        Parameterfactory.update($scope.parameterDefault, 
        function() {alertService.add('success', 'The default parameters are updated')},
        function() {alertService.add('danger', 'There is a problem in updating default parameters!')}
                );
        };
});

