'use strict';
var thisapp = angular.module('myApp.testsearchsetup', ['ngResource', 'myApp.parameterAdmin','myApp.ibtestadmin']);

thisapp.factory('ibDataFactory', function($resource)
{
    var rest1 = $resource('resources/ibdata/', {}, 
    {
        compoundQueryTest: { url : 'resources/ibdata/test', method: 'GET'},
        compoundQuery: { url : 'resources/ibdata/compoundquery/:inputCompName', method: 'GET', params:{inputCompName:'@inputCompName'}},
        getResultKeys: { url : 'resources/ibdata/getResultKeys/:inputCompName/:inputTestName', method: 'GET',  params:{inputCompName:'@inputCompName', inputTestName:'@inputTestName'}},
        getAllResults: { url : 'resources/ibdata/getallresults', method: 'POST'},
        getAllNoparam: { url : 'resources/ibdata/getallresultsnoparam', method: 'POST'}
    });
    return rest1; 
});


thisapp.controller('SearchSetupCtrl', function($scope, $rootScope, alertService, ibDataFactory, $resource, Ibtestdeffactory, Testmethodfactory) {
    
    window.ps = $scope;
    $scope.$resource = $resource;
    $scope.ib = ibDataFactory;    
    window.rps = $rootScope;
    $scope.isLoading = false;
    $scope.isDisabled = false;
    //list of all tests to be shown
    $rootScope.ibtestList = Ibtestdeffactory.query();
    $rootScope.sessionSelectedTest = Ibtestdeffactory.query();
    $scope.limitedTestList = Ibtestdeffactory.query();
    $scope.mymethodfact = Testmethodfactory;
    //checking fro poten
    
    //////////////////////////////////////////////////
    $rootScope.sessionSelectedTest.$promise.then(function() {
        for(var p= 0; p < $rootScope.sessionSelectedTest.length;)
        {
            if($rootScope.sessionSelectedTest[p].testMethod.etestMethod === "Poten")
            {
                $rootScope.sessionSelectedTest.splice(p, 1);
            }
            else
                p = p + 1;
        }
    });
            
    $scope.limitedTestList.$promise.then(function() {
        for(var p= 0; p < $scope.limitedTestList.length;)
        {
            if($scope.limitedTestList[p].testMethod.etestMethod == "Poten")
            {
                $scope.limitedTestList.splice(p, 1);
            }
            else
                p = p +1 ;
        }
    });
        
    
    $scope.compoundsTextArea = "";
    $scope.PotenTextArea = "";
    $rootScope.sessionCompounds = [];
    $scope.sessionName = "";
    $scope.sessionUser = "";
    //////////////////////////////////////////////////for filtering tests///////////////////////////
    $scope.indexedMethods = [];
    $scope.testToFilter = function() {
        $scope.indexedMethods = [];
        return $scope.limitedTestList;
    };
    
    $scope.filterMethods = function(test) {
        var methodIsNew = $scope.indexedMethods.indexOf(test.testMethod.id) == -1;
        if (methodIsNew) {
            $scope.indexedMethods.push(test.testMethod.id);
        }
        return methodIsNew;
    };
    ///////////////////////////////////////////////////////////////////////////////////
    $scope.searchSetup = function () {
        var formIsright = false;
        if($scope.searchSetupform.$valid){ 
            formIsright = true;
        }
        else{
            if($scope.searchSetupform.$error.required){
                var errors = "";
                $scope.searchSetupform.$error.required.forEach(function(entry){
                    errors += entry.$name + ", ";
                });
                alertService.add('danger', 'Some required fields are not filled in. Please check: ' + errors.substr(0, errors.length-2));
            }else if($scope.searchSetupform.$error.pattern){
                var errors = "";
                $scope.searchSetupform.$error.pattern.forEach(function(entry){
                    errors += entry.$name + ", ";
                });
                alertService.add('danger', 'Compound names and Poten Assays must follow the Pattern. Please check: ' + errors.substr(0, errors.length-2));
            }else{
                alertService.add('danger', 'Values missing or incorrect');
            };
        }
            
         if(!formIsright) return;
         
        //getting comp name entered by user
        $rootScope.sessionCompounds = [];
        for(var k=0; k<$scope.compoundsTextArea.length; k++)
        {
            $rootScope.sessionCompounds.push($scope.compoundsTextArea[k]);
        }
        
        //getting test names selected by user
        $rootScope.sessionTestName = [];
        for(var j = 0; j < $rootScope.sessionSelectedTest.length; j++)
        {
            $rootScope.sessionTestName.push($rootScope.sessionSelectedTest[j].testName);
        }
        
        //adding test names from poten list
        var testExists = false;
        $scope.potenMethod = {};
        var duplicateTest = false;
        
        $scope.ibtestMethods = Testmethodfactory.query();
        
        //find Poten test method
        $scope.ibtestMethods.$promise.then(function() {
        for(var p=0; p < $scope.ibtestMethods.length; p++)
        {
            if($scope.ibtestMethods[p].etestMethod == "Poten")
            {
                $scope.potenMethod = $scope.ibtestMethods[p];
            }
        }
        
        if($scope.potenMethod == null)
        {
            alertService.add('danger', 'Problem: poten test method does not Exists!')
        }
        
            for(var k=0; k<$scope.PotenTextArea.length; k++)
            {
                //check if this test already exists
                testExists = false;
                for(var t= 0; t < $rootScope.ibtestList.length ; t++)
                {
                    if($rootScope.ibtestList[t].testName == $scope.PotenTextArea[k])
                        testExists = true;
                }
                if(!testExists) //if the test does not exists
                {
                    var newIBtest = {};
                    newIBtest.testName = $scope.PotenTextArea[k];
                    newIBtest.testMethod = $scope.potenMethod;
                    Ibtestdeffactory.save(newIBtest, 
                    function success(d) {
                        $scope.ibtestList = Ibtestdeffactory.query();
                        newIBtest = {};
                    },
                    function fail(d) {
                        alert('Saving new IB test poten failed');
                    }
                            );
                     $rootScope.sessionTestName.push($scope.PotenTextArea[k]);
                }
                else
                {
                    duplicateTest = false;
                    for(var r = 0; r <$rootScope.sessionTestName.length; r++)
                    {
                        if ($rootScope.sessionTestName[r] == $scope.PotenTextArea[k])
                        {
                            duplicateTest = true;
                        }
                        
                    }
                    if(!duplicateTest)
                    {
                        $rootScope.sessionTestName.push($scope.PotenTextArea[k]);
                    }
                }
            }
         
        if($rootScope.sessionCompounds.length !== 0 && $rootScope.sessionTestName.length!==0)
        {
            $scope.session = {};
            $rootScope.reqCompTestDTO = {};
            $rootScope.reqCompTestDTO.compNameList = $rootScope.sessionCompounds;
            $rootScope.reqCompTestDTO.testNameList = $rootScope.sessionTestName;
            $rootScope.reqCompTestDTO.sessionName = $scope.sessionName;
            $rootScope.reqCompTestDTO.sessionUser = $scope.sessionUser;
            
            $scope.isLoading = true;
            $scope.isDisabled = true;
            
            $rootScope.CurrentSession = ibDataFactory.getAllResults($rootScope.reqCompTestDTO,
            function(d) {
                $scope.isLoading = false;
                $scope.isDisabled = false;
                //console.log("d = ", d);
                window.location.href = "#/testresult";
                return d;
            },
            function(d) {
                //console.log("fail d = ", d);
                return d;
            }
                    );
        }
        else
        {
            alertService.add('danger', 'search failed! Either compounds are empty or no test is selected.');
        }
    }); 
    };
      
    // **************************for test list checkboxes *****************************
    $scope.findaTest = function (itest)
    {
        var idx = -1;
        for(var t=0 ; t <$rootScope.sessionSelectedTest.length; t++)
        {
            if(itest.testName === $rootScope.sessionSelectedTest[t].testName 
                    && itest.testMethod.etestMethod === $rootScope.sessionSelectedTest[t].testMethod.etestMethod)
            {
                idx = t;
            }
        }
        return idx;
    };
    $scope.toggleSelectionF = function toggleSelectionF(itest) {
        var idx = $scope.findaTest(itest);
        // is currently selected
        if (idx > -1) {
            $rootScope.sessionSelectedTest.splice(idx, 1);
        }
        // is newly selected
        else {
            $rootScope.sessionSelectedTest.push(itest);
        }
    };
    
});