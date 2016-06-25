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

angular.module('fdView.directives', [])
  .directive('ngAbTable', function () {
    return {
      restrict: 'E, A, C',
      link: function (scope, element, attrs, controller) {
        // If Actions Defined
        if (scope.actions) {
          scope.options.aoColumns.push(scope.actions);
        }
        var dataTable = element.dataTable(scope.options);

        scope.$watch('options.aaData', handleModelUpdates, true);

        function handleModelUpdates(newData) {
          var data = newData || null;
          if (data) {
            dataTable.fnClearTable();
            dataTable.fnAddData(data);
          }
        }
      },
      scope: {
        options: '=',
        actions: '='
      }
    };
  })
  .directive('ngJsonabview', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$watch(attrs.abData, function (newValue) {
          var container = document.getElementById(attrs.id);
          $('#' + attrs.id).empty();
          var options = {
            mode: 'view'
          };
          var editor = new JSONEditor(container, options);
          var data = scope.$eval(attrs.abData);

          editor.set(data);
        });

//                var container = document.getElementById(attrs.id);
//                var options = {
//                    mode: 'view'
//                };
//                var editor = new JSONEditor(container,options);
//                var data = scope.$eval(attrs.abData);
//
//                editor.set(data);
      }
    };
  })
  .directive('ngJsondiff', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var left = scope.$eval(attrs.abLeft);
        var right = scope.$eval(attrs.abRight);

        var delta = jsondiffpatch.create({
          objectHash: function (obj) {
            return obj._id || obj.id || obj.name || JSON.stringify(obj);
          }
        }).diff(left, right);

        jsondiffpatch.formatters.html.hideUnchanged();
        // beautiful html diff
        document.getElementById('visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);
        // self-explained json
        document.getElementById('annotated').innerHTML = jsondiffpatch.formatters.annotated.format(delta, left);
      }
    }
  })
  .directive('ngJsondiff2', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        //scope.$watchCollection(['attr.abLeft','attrs.abRight'], function (newValue) {
        scope.$watch(attrs.abLeft, function (newValue) {
          var left = scope.$eval(attrs.abLeft);
          var right = scope.$eval(attrs.abRight);

          var delta = jsondiffpatch.create({
            objectHash: function (obj) {
              return obj._id || obj.id || obj.name || JSON.stringify(obj);
            }
          }).diff(left, right);

          jsondiffpatch.formatters.html.hideUnchanged();
          // beautiful html diff
          document.getElementById('visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);
        });
      }
    }
  })
  .directive('ngFlockdeltapopup', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/deltaPopup.html'
    }
  })
  .directive('ngFlocksinglelogpopup', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/singleLogPopup.html'
    }
  })
  .directive('autofocus', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link : function($scope, $element) {
        $timeout(function() {
          $element[0].focus();
        });
      }
    }
  }])
  .directive('ngHeight', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var winHeight = $window.innerHeight;
            var headerHeight = attrs.ngHeight ? attrs.ngHeight : 0;
            elem.css('height', winHeight - headerHeight + 'px');
        }
    }
  }])
  .directive('fileBox', ['$parse', function($parse) {
      return {
        restrict: 'AE',
        scope: false,
        template: '<div class="file-box-input">'+
                  '<input type="file" id="file" class="box-file">'+
                  '<label for="file" align="center"><strong>'+
                  '<i class="fa fa-cloud-download"></i> Click</strong>'+
                  '<span> to choose a CSV file, or drop it here</span>.</label></div>'+
                  '<div class="file-box-success"><strong>Done!</strong>&nbsp;{{fileName}} is loaded</div>',
        link: function(scope, element, attrs) {
          var fn = $parse(attrs.fileBox);

          element.on('dragover dragenter', function(e) {
            e.preventDefault();
            e.stopPropagation();
            element.addClass('is-dragover');
          });
          element.on('dragleave dragend',function() {
            element.removeClass('is-dragover');
          });
          element.on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if(e.originalEvent.dataTransfer){
              if (e.originalEvent.dataTransfer.files.length>0) {
                var reader = new FileReader();
                reader.fileName = e.originalEvent.dataTransfer.files[0].name;
                reader.onload = function(onLoadEvent) {
                  scope.$apply(function() {
                    fn(scope, {$fileContent:onLoadEvent.target.result, $fileName:reader.fileName});
                  });
                  element.addClass('is-success');
                };
              };
            };
            reader.readAsText(e.originalEvent.dataTransfer.files[0]);
          });
          element.on('change', function(onChangeEvent) {
            var reader = new FileReader();
            reader.fileName = onChangeEvent.target.files[0].name;
            reader.onload = function(onLoadEvent) {
              scope.$apply(function() {
                fn(scope, {$fileContent:onLoadEvent.target.result, $fileName:reader.fileName});
              });
              element.addClass('is-success');
            };
            reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
          });
        }
      };
    }])
  .directive('cytoscape', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      template: '<div id="cy"></div>',
      replace: true,
      scope: {
        elements: '=',
        styles: '=',
        layout: '=',
        selectedNodes: '=',
        highlightByName: '=',
        onComplete: '=',
        onChange: '=',
        nodeClick: '=',
        navigatorContainerId: '@',
        contextMenuCommands: '='
      },
      link: function(scope, element, attributes, controller) {
        scope.$watchGroup(['elements', 'styles', 'layout'], function(newValues, oldValues, scope) {
          var safe = true;
          for ( var i in newValues)
            if (!newValues[i]) safe = false;
          if (safe) {
            var elements = newValues[0];
            var styles = newValues[1];
            var layout = newValues[2];
            cytoscape({
              container: element[0],
              elements: elements,
              style: styles,
              layout: layout,
              boxSelectionEnabled: true,
              motionBlur: false,
              wheelSensitivity: 0.2,
              ready: function() {
                var cy = this;
                // Run layout after add new elements
                var runLayout = function(addedElements) {
                  if (addedElements) {
                    layout.maxSimulationTime = 10;
                    layout.fit = false;
                    var addLayout = addedElements.makeLayout(layout);
                    addLayout.pon('layoutstop').then(function(event) {
                      layout.maxSimulationTime = 2000;
                      cy.elements().makeLayout(layout).run();
                    });
                    addLayout.run();
                  }
                };
                // Tap
                cy.on('tap', function(event) {
                  if (event.cyTarget === cy)
                    $timeout(function() {
                      scope.selectedNodes = [];
                      // scope.selectedElements = cy.$(':selected');
                      // console.log(cy.$(':selected'));
                  }, 10);
                  else
                    $timeout(function() {
                      scope.selectedNodes = cy.$(':selected');
                      // console.log(scope.selectedNodes[0].data());
                    }, 10);
                });
                // cy.on('tap', 'node', function (event) {
                //   console.log(event.cyTarget.data());
                //   scope.$apply(function () {
                //     scope.selectedNodes.push(event.cyTarget.data());
                //   });
                // });
                // Mouseout
                cy.on('mouseout', function() {
                  cy.elements().removeClass('mouseover');
                  cy.elements().removeClass('edge-related');
                });
                // Mouseover
                cy.on('mouseover', function(event) {
                  var target = event.cyTarget;
                  if (target != event.cy) {
                    target.addClass('mouseover');
                    target.neighborhood().edges()
                      .addClass('edge-related');
                  }
                });
                cy.on('cxttapstart', 'node', function (event) {
                  console.log(event);
                });
                cy.on('mouseup', function (event) {
                  console.log(event);
                });
                cy.on('drop',function (event) {
                  console.log(event);
                });

                // Add elements
                scope.$on('cytoscapeAddElements', function(event, data) {
                  var addElements = data.elements;
                  var addedElements = cy.add(addElements);
                  runLayout(addedElements);
                  //scope.onChange(cy, data.forceApply);
                });
                // Delete elements
                scope.$on('cytoscapeDeleteElements', function(event, data) {
                  var deleteElements = data.elements;
                  try {
                    cy.remove(deleteElements);
                  } catch (exception) {
                    for ( var i in deleteElements) {
                      cy.remove(cy.$('#'
                        + deleteElements[i].data.id));
                    }
                  }
                  scope.onChange(cy, data.forceApply);
                });
                scope.$on('cytoscapeReset', function (event) {
                  cy.resize();
                  cy.fit(elements,15);
                });
                scope.$on('cytoscapeFitOne', function () {
                  cy.fit(elements, cy.width()/5);
                });
                scope.$on('dropped', function (event, data) {
                  console.log('dropped', event);
                });
                // Filter nodes by name
                scope.$watch('highlightByName', function(name) {
                  cy.elements().addClass('searched');
                  if (name && name.length > 0) {
                    var cleanName = name.toLowerCase().trim();
                    var doHighlight = function(i, node) {
                      var currentName = node.data().name.toLowerCase()
                        .trim();
                      if (currentName.indexOf(cleanName) > -1)
                        node.removeClass('searched');
                    };
                    cy.nodes().each(doHighlight);
                  } else {
                    cy.elements().removeClass('searched');
                  }
                });
                // Navigator
                if (scope.navigatorContainerId) {
                  cy.navigator({
                    container: document.getElementById(scope.navigatorContainerId)
                  });
                }
                // Context menu
                if (scope.contextMenuCommands) {
                  cy.cxtmenu({
                    menuRadius: 75,
                    indicatorSize: 17,
                    activePadding: 10,
                    selector: 'node',
                    commands: scope.contextMenuCommands
                  });
                }
                // On complete
                if (scope.onComplete) {
                  scope.onComplete({
                    graph: cy,
                    layout: layout
                  });
                }
              }
            });
          }
        });
      }
    }
  }])
  .directive('draggable', function () {
    return function (scope, element) {
      // this gives us the native JS object
      var el = element[0];
      el.draggable = true;

      el.addEventListener('dragstart', function (e) {
        console.log(this);

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('id', this.id);
        this.classList.add('dragging');
        return false;
      }, false);

      el.addEventListener('dragend', function () {
        this.classList.remove('dragging');

        return false;
      }, false);
    };
  })
  .directive('droppable', function () {
    return {
      scope: {
        droppable: '='
      },
      link: function (scope, element) {
        var el = element[0];

        el.addEventListener('dragover', function (e) {
          e.dataTransfer.dropEffect = 'move';

          if (e.preventDefault) {
            e.preventDefault();
          }

          return false;
        }, false);

        el.addEventListener('drop', function (e) {
          // Stops some browsers from redirecting.
          if (e.stopPropagation) {
            e.stopPropagation();
          }

          var elementDropped = document.getElementById(e.dataTransfer.getData('id')),
            dropMethod = scope.droppable;

          // call the drop passed drop function
          if (typeof dropMethod === 'function') {
            scope.droppable(elementDropped, element[0], e);
          }

          return false;
        }, false);
      }
    };
  })

  // .directive('draggable',['$compile',function($compile){
  //   return {
  //     restrict: 'EA',
  //     transclude: true,
  //     replace: true,
  //     scope: {},
  //     template: '<div class="cursor" ng-transclude></div>',
  //     link: function(scope,el,attrs,ctrlr,transFn){
  //         // object properties, will be passed through jQuery UI events
  //         scope.obj = {
  //           id: null,
  //           content: '',
  //           group: null
  //         };
  //
  //         scope.placeholder = false;
  //
  //
  //         // get the content from the transclusion function
  //         transFn(scope,function(clone,innerScope){
  //           // need to compile the content to make sure we get any HTML that was transcluded
  //           var dummy = angular.element('<div></div>');
  //           dummy.append($compile(clone)(innerScope));
  //           scope.obj.content = dummy.html();
  //           dummy = null;
  //
  //           // remove ng-scope spans/classes & empty class attributes added by angular to get true content
  //           scope.obj.content = scope.obj.content.replace(/<span class="ng\-scope">([^<]+)<\/span>/gi,"$1");
  //           scope.obj.content = scope.obj.content.replace(/\s*ng\-scope\s*/gi,'');
  //           scope.obj.content = scope.obj.content.replace(/\s*class\=\"\"\s*/gi,'');
  //         });
  //
  //         // save the object's id if there is one
  //         if(angular.isDefined(attrs.id))
  //           scope.obj.id = attrs.id;
  //
  //         if(angular.isDefined(attrs.placeholder))
  //           scope.placeholder = scope.$eval(attrs.placeholder);
  //
  //         // setup the options object to pass to jQuery UI's draggable method
  //         var opts = (angular.isDefined(attrs.options)) ? scope.$eval(attrs.options) : {};
  //
  //         // assign the object's group if any
  //         if(angular.isDefined(attrs.group)){
  //           scope.obj.group = attrs.group;
  //           opts.stack = '.' + attrs.group;
  //         }
  //
  //         var evts = {
  //           start: function(evt,ui){
  //             if(scope.placeholder)
  //               ui.helper.wrap('<div class="dragging"></div>');
  //             scope.$apply(function(){ scope.$emit('drag.started',{obj: scope.obj}); });
  //           },
  //           drag: function(evt){
  //             scope.$apply(function(){ scope.$emit('drag.dragging',{obj: scope.obj}); });
  //           },
  //           stop: function(evt,ui){
  //             if(scope.placeholder)
  //               ui.helper.unwrap();
  //             scope.$apply(function(){ scope.$emit('drag.stopped',{obj: scope.obj}); });
  //           }
  //         };
  //
  //         // combine options passed through element attributes with events
  //         var options = $.extend({},opts,evts);
  //         el.draggable(options); // make element draggable
  //     }
  //   };
  // }])
  // .directive('droppable',['$compile',function($compile){
  //   return {
  //     restrict: 'AE',
  //     replace: true,
  //     // scope: {},
  //     // templateUrl: function(el,attrs){
  //     //   return (angular.isDefined(attrs.template)) ? attrs.template : '/tmpls/droppable-default';
  //     // },
  //     link: function(scope,el,attrs,ctrlr,transFn){
  //       scope.obj = {
  //         id: null,
  //         dropped: []
  //       };
  //
  //       // save the object's id if there is one
  //       if(angular.isDefined(attrs.id))
  //         scope.obj.id = attrs.id;
  //
  //       // setup the options object to pass to jQuery UI's draggable method
  //       var opts = (angular.isDefined(attrs.options)) ? scope.$eval(attrs.options) : {};
  //
  //       var evts = {
  //         drop: function(evt,ui){ // apply content
  //           console.log('drop', evt, ui);
  //           scope.$apply(function(){
  //             scope.obj.dropped.push(angular.copy(scope.$parent.obj));
  //             scope.$emit('data.clean');
  //             scope.$broadcast('dropped',ui);
  //           });
  //         },
  //         dragover: function(e) {
  //           console.log('dragover', e);
  //           e.preventDefault();
  //           e.stopPropagation();
  //           element.addClass('is-dragover');
  //         },
  //         dragleave: function() {
  //           element.removeClass('is-dragover');
  //         }
  //       };
  //
  //       var options = angular.extend({},opts,evts);
  //       el.droppable(options);
  //     } // end link
  //
  //   }; // end return
  // }]); // end directive(droppable)

  .directive('textcomplete', ['Textcomplete', function(Textcomplete) {
    return {
      restrict: 'EA',
      scope: {
        columns: '=',
        message: '=',
        id: '@',
        name: '@',
        placeholder: '@',
        disabled: '='
      },
      template: '<textarea id="{{id}}" name="{{name}}" ng-model="message" type="text"  class="form-control code" msd-elastic ng-disabled="disabled" placeholder="{{placeholder}}"></textarea>',
      link: function(scope, iElement, iAttrs) {

        var cols = scope.columns;
        var codes = ['data'];
        var ta = iElement.find('textarea');
        var textcomplete = new Textcomplete(ta, [
          {
            match: /(^|\s)([\w\-]*)$/,
            search: function(term, callback) {
              callback($.map(cols, function(colName) {
                return colName.toLowerCase().indexOf(term.toLowerCase()) === 0 ? colName : null;
              }));
            },
            index: 2,
            replace: function(colName) {
              return '$1' + colName + '';
            }
          },
          {
            match: /(^|\s)#([\w\-]*)$/,
            search: function(term, callback) {
              callback($.map(codes, function(code) {
                return code.toLowerCase().indexOf(term.toLowerCase()) === 0 ? code : null;
              }));
            },
            index: 2,
            replace: function(code) {
              return '$1#' + code + '[';
            }
          }
        ]);

        $(textcomplete).on({
          'textComplete:select': function (e, value) {
            scope.$apply(function() {
              scope.message = value
            })
          },
          'textComplete:show': function (e) {
            $(this).data('autocompleting', true);
          },
          'textComplete:hide': function (e) {
            $(this).data('autocompleting', false);
          }
        });
      }
    }
  }]);

// Directives
