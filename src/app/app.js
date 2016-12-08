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

/* fd-view app module declaration */

angular
  .module('fd-view', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ngAnimate',
    'ui.bootstrap',
    'toastr',
    'ngTagsInput',
    'ngProgress',
    'angularMoment',
    'config',
    'http-auth-interceptor',
    'ng.jsoneditor',
    'ui.ace',
    'infinite-scroll',
    'sticky',
    'fd-view.diagrams',
    'fd-view.modeler'
  ]);
