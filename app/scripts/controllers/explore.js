/*
 *
 *  Copyright (c) 2012-2016 "FlockData LLC"
 *
 *  This file is part of FlockData.
 *
 *  FlockData is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  FlockData is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FlockData.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

fdView.controller('ExploreCtrl', ['$scope', '$http', 'MatrixRequest', '$compile', '$controller', 'configuration', 'toastr',
  function ($scope, $http, MatrixRequest, $compile, $controller, configuration, toastr) {
    $scope.matrix = MatrixRequest.lastMatrix();
    if(_.isEmpty($scope.matrix)) {
      angular.element('[data-target="#search"]').tab('show');
      $scope.graphData = [];
    } else {
      $scope.graphData=$scope.matrix;
    }

    $scope.layouts = [{name: 'cose'},
      {name: 'grid'},{name: 'concentric'},
      {name: 'circle'},{name: 'random'},{name: 'breadthfirst'}];
    $scope.layout = $scope.layouts[0];

    $scope.styles = [
      {'selector': 'node',
      'css': {
        'content': 'data(name)',
        'font-size': '15pt',
        'min-zoomed-font-size': '9pt',
        'text-halign': 'center',
        'text-valign': 'center',
        'color': 'white',
        'text-outline-width': 2,
        'text-outline-color': '#888',
        'width': '40',//'mapData(degree,0,5,20,80)',
        'height': '40',//'mapData(degree,0,5,20,80)',
        // 'shape': 'roundrectangle'
      }},
      {'selector':'edge',
        'css':{
          'width': 3,
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle'
        }},
      {'selector':':selected',
        'css':{
          'background-color': 'black',
          'line-color': 'black',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black',
          'text-outline-color': 'black'
        }},
      {'selector':'.mouseover',
        'css':{
          'color':'#499ef0'
      }}
    ];

    $scope.search = function () {
      angular.element('[data-target="#view"]').tab('show');

      MatrixRequest.matrixSearch().then(function (data) {
        if (!data || data.edges.length === 0) {
          toastr.info('No data was found. Try altering your criteria');
          return data;
        }
        $scope.graphData = data;
      });
    };
  }]);
