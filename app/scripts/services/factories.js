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


fdView.factory('QueryService', ['$http', 'configuration', function ($http, configuration) {
  var lastMatrixQuery={},
      lastMatrixResult={};
  return {
      general: function (queryName) {
        return $http.get(configuration.engineUrl() + '/api/v1/' + queryName + '/').then(function (response) {
            return response.data;
          }
        );
      },
      query: function (queryName, params) {
        return $http.post(configuration.engineUrl() + '/api/v1/query/' + queryName + '/', params).then(function (response) {
            return response.data;
          }
        );
      },
      matrixSearch: function (fortresses, searchText, resultSize, documents, sumByCount, concepts, fromRlxs, toRlxs, minCount, reciprocals, byKey) {
        var dataParam = {
          documents: documents,
          sampleSize: resultSize,
          fortresses: fortresses,
          sumByCol: !sumByCount,
          queryString: searchText,
          concepts: concepts,
          fromRlxs: fromRlxs,
          toRlxs: toRlxs,
          minCount: minCount,
          reciprocalExcluded: reciprocals,
          byKey: byKey
        };
        if(dataParam === lastMatrixQuery) return lastMatrixResult;
        else lastMatrixQuery = dataParam;
        console.log(dataParam);
        var promise = $http.post(configuration.engineUrl() + '/api/v1/query/matrix/', dataParam).then(function (response) {
          angular.copy(response.data, lastMatrixResult);
          if(byKey===false) {
            return response.data.edges;
          } else return response.data;
        });
        return promise;
      },
      lastMatrix: function () {
        return lastMatrixResult;
      },
      tagCloud: function (searchText, documents, fortress, tags, relationships) {
        var tagCloudParams = {
          searchText: searchText,
          types: documents,
          fortress: fortress[0],
          tags: tags,
          relationships: relationships
        };
        return $http.post(configuration.engineUrl() + '/api/v1/query/tagcloud/', tagCloudParams).then(function (response) {
          return response.data;
        });
      }
    };
  }]
)
.factory('ContentModel', ['$http', '$q', 'configuration',
  function ($http, $q, configuration) {
    var cplist = [],      // list of all content models in the database
      cp = {},            // actual content model
      cpGraph = {},       // latest graph visualization of the content model
      cpFortress, cpType, // fortress and doctype of the current content model
      colDefs = [],       // list of column definitions with type
      tags = [];          // list of tags

    var addTag = function (tag) {
      tag.$$id = _.uniqueId('tag_');
      tags.push({label: tag.label || tag.code, id: tag.$$id});
      return tag.$$id;
    };

    var findTag = function (id) {
      var tag = {};
      (function findInList(list, id) {
        _.find(list, function (o) {
          if (o.$$id === id) {
            return tag = o;//[o.label] = o;
          }
          if (o.targets) findInList(o.targets, id);
        });
      })(cp.content, id);
      return tag;
    };

    return {
      getAll: function () {
        return $http.get(configuration.engineUrl() + '/api/v1/model/')
          .success(function (data) {
            angular.copy(data, cplist);
          });
      },
      getColDefs: function () {
        return colDefs;
      },
      getTags: function () {
        return tags;
      },
      findTag: function(id) {
        return findTag(id);
      },
      addCol: function (col) {
        colDefs.push(col);
        var column = {};
        column[col.name]={dataType: col.dataType, persistent:true};
        _.extend(cp.content,column);
      },
      addEntitylink: function (col, el) {
        var cd = cp.content[col];
        if (_.has(cd, 'entityLinks'))
          cd.entityLinks.push(el);
        else
          cd['entityLinks'] = [el];

        // add to graph
        // cpGraph.nodes.push({
        //   data: {
        //     id: el.documentName,
        //     name: el.documentName,
        //     type: 'entity'
        //   }
        // });
        // cpGraph.edges.push({
        //   data: {
        //     source: cpGraph.nodes[0].data.id,
        //     target: el.documentName,
        //     label: el.relationshipName
        //   }
        // });
      },
      addTag: function(tag){
        return addTag(tag);
      },
      addAlias: function (tag, alias) {
        var t = findTag(tag.id);
        console.log(t);
        if (_.has(t, 'aliases'))
          t.aliases.push(alias);
        else
          t['aliases'] = [alias];
      },
      getCurrent: function () {
        return cp;
      },
      createEmpty: function (content) {
        cpFortress = content.fortress.name;
        cpType = content.documentType.name;
        cp = content;
        cp.content = {};
      },
      createDefault: function (fortress, doctype) {
        angular.copy(fortress, cpFortress);
        angular.copy(doctype, cpType);
        return $http.post(configuration.engineUrl() + '/api/v1/model/default/');
      },
      getFortress: function () {
        if (cpFortress) { return cpFortress; }
      },
      getDocType: function () {
        if (cpType) { return cpType; }
      },
      getModel: function (profile) {
        if (!profile || (profile.fortress===cpFortress && profile.documentType===cpType && cp!=={}) || (!profile.fortress && cp.length>0)) {
          var deferred = $q.defer();
          deferred.resolve(cp);
          return deferred.promise;
        } else {
          if (profile.fortress!==cpFortress) cpFortress=profile.fortress;
          if (profile.documentType!==cpType) cpType=profile.documentType;

          return $http.get(configuration.engineUrl() + '/api/v1/model/' + profile.key)
            .success(function (data) {
              cp = data.contentModel;
              tags = [];
              _.chain(cp.content)
                .filter(function (c) {
                  return !!c.tag;
                })
                .each(function (t) {
                  addTag(t);
                  var tagTargets = function (tag) {
                    if (!!tag.targets && tag.targets.length > 0)
                      _(tag.targets).each(function (tg) {
                        addTag(tg);
                        tagTargets(tg);
                      });
                  };
                  tagTargets(t);
                });
            });
        }
      },
      getDefault: function (data) {
        var payload;
        if(_.isEmpty(cp.content)) {
          payload = data;
        } else {
          payload = angular.extend({contentModel: cp}, data);
        }
        return $http.post(configuration.engineUrl() + '/api/v1/model/default', payload)
          .success(function (res) {
            cp.content = res.content;
          });
      },
      graphModel: function () {
        if (!_.isEmpty(cp)) {
          var graph = {nodes: [], edges: []};
          colDefs = [];

          var createEntity = function (name, data) {
            var entity = new Object({id: name, name: name, type: 'entity'});
            _.extend(entity, data);
            return entity;
          };
          var isTag = function (o) {
            return Boolean(o.tag) === true || o.tagOrEntity === 'tag';
          };
          var createTag = function (id, data) {
            var tag = new Object({id: id, name: id, type: 'tag'});
            _.extend(tag, data);
            return tag;
          };
          var connect = function (source, target, rel, reverse) {
            if (reverse) {
              return {source: target, target: source, relationship: rel};
            } else {
              return {source: source, target: target, relationship: rel};
            }

          };

          var hasTargets = function (obj) {
            return !!obj.targets && obj.targets.length > 0;
          };

          var hasEntityLinks = function (obj) {
            return !!obj.entityLinks && obj.entityLinks.length > 0;
          };

          var hasAliases = function (obj) {
            return !!obj.aliases && obj.aliases.length > 0;
          };

          var containsEdge = function (edge) { // to check if edge is already in the graph
            return _.findIndex(graph.edges,function(o){return _.isMatch(o.data,edge)})>=0;
          };

          var containsTag = function (tag) {
            var t = graph.nodes[_.findIndex(graph.nodes,function(o){
              return _.isMatch(o.data,{type: 'tag', label: tag.label, code: tag.code});
            })];
            if (!!t)
              return t.data;
            else return false;
          };

          var createTargets = function (tag) {
            _.each(tag.targets, function (target) {
              var t = createTag(target.$$id  || addTag(target), {label: target.label, code: target.code});
              if(!containsTag(t)) {
                graph.nodes.push({data: t});
                var edge = connect(t.id, tag.$$id, target.relationship, target.reverse);
                if (!containsEdge(edge))
                  graph.edges.push({data: edge});
              }
              if (hasTargets(target)) createTargets(target);
            })
          };

          var root = {};

          if (!isTag(cp)) {
            root = createEntity(cp.documentName || cp.documentType.name);
            graph.nodes.push({data: root});
          } else {
            root = createTag(cp.documentName);
            graph.nodes.push({data: root});
          }
          _.each(cp.content, function (obj, key) {
            if (isTag(obj)) {
              colDefs.push({name: key, type: 'tag'});
              var label = (obj.label || key);
              var tag = containsTag(obj);
              if(!tag) {
                tag = createTag(obj.$$id || addTag(obj), {label: label, code: obj.code});
                graph.nodes.push({data: tag});
              }
              var edge = connect(root.id, tag.id, obj.relationship, obj.reverse);
              if (!containsEdge(edge)) {
                graph.edges.push({data: edge});
              }

              if (hasTargets(obj)) {
                createTargets(obj);
              }
              if (hasAliases(obj)) {
                _.each(obj.aliases, function (alias) {
                  var a = {id: alias.code, code: alias.code, description: alias.description, type: 'alias'};
                  graph.nodes.push({data: a});
                  graph.edges.push({data: connect(tag.id, a.id)});
                })
              }
            } else {
              colDefs.push({name: key, type: 'coldef'});
            }
            if (hasEntityLinks(obj)) {
              _.each(obj.entityLinks, function (entity) {
                var e = createEntity(entity.documentName);
                graph.nodes.push({data: e});
                graph.edges.push({data: connect(root.id, e.id, entity.relationshipName,obj.reverse)});
              })
            }
          });
          cpGraph = graph;
          console.log(graph);
          return graph;
        }
      },
      updateModel: function (profile) {
        cp = profile;
      },
      saveModel: function () {
        var fcode = cpFortress.toLowerCase().replace(/\s/g, '');

        return $http.post(configuration.engineUrl() + '/api/v1/model/' + fcode +'/'+cpType+'/', cp);
      }
  };
}]);

fdView.service('modalService',['$uibModal', function ($uibModal) {
  var modalDefaults = {
    backdrop: true,
    keyboard: true,
    modalFade: true,
    templateUrl: 'views/partials/confirmModal.html'
  };

  this.showModal = function (customModalDefaults, customModalOptions) {
    if (!customModalDefaults) customModalDefaults = {};
    customModalDefaults.backdrop = 'static';
    return this.show(customModalDefaults, customModalOptions);
  };

  this.show = function (customModalDefaults, customModalOptions) {
    var tempModalDefaults = {};
    var tempModalOptions = {};

    angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
    angular.extend(tempModalOptions, customModalOptions);

    if(!tempModalDefaults.controller) {
      tempModalDefaults.controller = ['$scope','$uibModalInstance','$http','configuration', function ($scope, $uibModalInstance, $http, configuration) {
        if (!tempModalOptions.disable) {

          $http.get(configuration.engineUrl() + '/api/v1/fortress/timezones').then(function (res) {
            $scope.timezones = res.data;
            if (!$scope.obj)
              $scope.obj = {
                searchEnabled: true,
                timeZone: moment.tz.guess()
              };
          });
        }
        $scope.modalOptions = tempModalOptions;
        $scope.obj = $scope.modalOptions.obj;
        $scope.ok = function (res) {
          $uibModalInstance.close(res);
        };
        $scope.close = $uibModalInstance.dismiss;
      }];
    }

    return $uibModal.open(tempModalDefaults).result;
  };

}]);
