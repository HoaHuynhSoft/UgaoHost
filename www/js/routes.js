angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })
  .state('myCart', {
    url: '/cart',
    templateUrl: 'templates/myCart.html',
    controller: 'myCartCtrl'
  })
  .state('orders', {
    url: '/orders',
    templateUrl: 'templates/orders.html',
    controller: 'ordersCtrl'
  })
  .state('feedbacks', {
    url: '/feedbacks',
    templateUrl: 'templates/feedbacks.html',
    controller: 'feedbacksCtrl'
  })
  .state('report', {
    url: '/report',
    templateUrl: 'templates/report.html',
    controller: 'reportCtrl'
  })
  .state('products', {
    url: '/products',
    templateUrl: 'templates/products.html',
    controller: 'productsCtrl'
  })
  .state('nortify', {
    url: '/nortify',
    templateUrl: 'templates/nortify.html',
    controller: 'nortifyCtrl'
  })
  .state('customers', {
    url: '/customers',
    templateUrl: 'templates/customers.html',
    controller: 'customersCtrl'
  })
  .state('customerDetail', {
    url: '/customerDetail/:username',
    templateUrl: 'templates/customerDetail.html',
    controller: 'customerDetailCtrl'
  })
  .state('staff', {
    url: '/staff',
    templateUrl: 'templates/staff.html',
    controller: 'staffCtrl'
  })
  .state('staffDetail', {
    url: '/staffDetail/:username',
    templateUrl: 'templates/staffDetail.html',
    controller: 'staffDetailCtrl'
  })
  .state('orderDetail', {
    url: '/orderDetail/:id',
    templateUrl: 'templates/orderDetail.html',
    controller: 'orderDetailCtrl'
  })
  .state('settings', {
    url: '/settings',
    templateUrl: 'templates/settings.html',
    controller: 'settingsCtrl'
  })

  .state('support', {
    url: '/tabLogin3',
    templateUrl: 'templates/support.html',
    controller: 'supportCtrl'
  })
  .state('addProduct',{
    url:'/addProduct',
    templateUrl:'templates/addProduct.html',
    controller:'addingProduct'
  })

$urlRouterProvider.otherwise('/login')



});
