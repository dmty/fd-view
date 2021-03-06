/*
 *
 *  Copyright (c) 2012-2017 "FlockData LLC"
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

class Footer {
  /** @ngInject */
  constructor($http, configuration) {
    this.server = configuration.engineUrl();
    $http.get(`${configuration.engineUrl()}/api/v1/admin/health`)
      .then(res => {
        this.fdVersion = res.data['fd.version'];
      });
    /* Page height fix */
    $.AdminLTE.layout.fix();
  }
}

angular
  .module('fd-view')
  .component('infoFooter', {
    templateUrl: 'app/layout/footer.html',
    controller: Footer
  });

