import angular from 'angular';
import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import angularMoment from 'angular-moment';
import ngInfiniteScroll from 'ng-infinite-scroll';
import 'ng-tags-input';
import 'ng-tags-input/build/ng-tags-input.css';

import './search.scss';

import config from '../config';
import services from '../services';
import components from '../components';
import viewEntity from './viewEntity';
import {searchView} from './search.component';
import SearchService from './search.service';
import cleanCode from './clean-code.filter';
import SearchConfig from './search.config';

export default angular
  .module('fd-view.search', [
    uiRouter, uiBootstrap, angularMoment, ngInfiniteScroll, 'ngTagsInput',
    config, services, components, viewEntity
  ])
  .component('searchView', searchView)
  .factory('SearchService', SearchService)
  .filter('cleanCode', cleanCode)
  .config(SearchConfig)
  .name;
