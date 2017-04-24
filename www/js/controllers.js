angular.module('app.controllers', [])

.controller('loginCtrl', function($scope,UserService,$window,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
    $rootScope.extras = false; // Ẩn thanh slide menu
    $rootScope.userName = "";
    $scope.user = {};
    /// Khi logout thì xóa hết dữ liệu tạm
    $scope.$on('$ionicView.enter', function(ev) {
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
       var un = $window.localStorage['username'];
      var pass = $window.localStorage['pass'];
      console.log(un+pass);
      if (un != "" && pass != ""){
        var user = {};
        user.UserName = un;
        user.Pass = pass;
        $scope.login(user);
      }
    });
    $scope.login = function(user) {
      if (!(user.UserName)||!(user.Pass)){
        sharedUtils.showAlert("warning","Bạn nhập dữ liệu chưa đúng");
        return;
      }
      UserService.getUser(user.UserName) // lấy user bằng user name
        .then(function success(data){
           console.log(data);
            if((user.UserName == data.UserName) && (user.Pass == data.Pass) && data.Type == 2){
              $window.localStorage['username'] = user.UserName;
              $window.localStorage['pass'] = user.Pass;
              $rootScope.userName =data.FullName;
              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
              $rootScope.extras = true;
              sharedUtils.hideLoading();
              $state.go('report', {}, {location: "replace"});
              $scope.user = {};
            }
              else{
                sharedUtils.showAlert("warning","Entered data is not valid");
              }
        }, function error(msg){
          sharedUtils.showAlert("warning",msg);
          console.log(msg);
        });
    };



})
.controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,$state,$ionicHistory) {
    $rootScope.extras = false; // For hiding the side bar and nav icon

    $scope.signupEmail = function (formName, cred) {
    }

  })
.controller('indexCtrl', function($scope,UserService,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate) {
    $scope.logout=function(){
      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
      $state.go('tabLogin.login', {}, {location: "replace"});
    }

  })

.controller('myCartCtrl', function($scope,sharedUtils,$ionicPopup,$rootScope,$state,CartService,OrderService,UserService,ItemService) {
    $scope.curUser = {};
    $scope.rootNote = {};
    $scope.items= {};
    $scope.headerInfo = false;
    $rootScope.extras=true;
    $scope.curCart = {};
    $scope.headerInfoClick = function(){ // Hàm xử lí sự kiện click vào dòng info
     if ( $scope.headerInfo == false)
       $scope.headerInfo = true;
    else  $scope.headerInfo = false;
   }
    $scope.$on('$ionicView.enter', function(ev) {
        $scope.curCart = CartService.getCurCart();
        ItemService.getAllItems()
        .then(function success(data){
            $scope.items=data;
        }, function error(msg){
          console.log(msg);
        });
        });
    $scope.addItemClick= function(){
      var myPopup = $ionicPopup.show({
      templateUrl: 'templates/addItem.html',
      scope: $scope,
      title: 'Thông tin chi tiết',
      buttons: [
      { text: 'OK' },
      ]
    });}
    $scope.addItem = function(item){
      $scope.isShowSaveButon = true;
      var isExist = false;
       $scope.curCart.OrderDetails.forEach(function(detail, index){
          if (detail.Item._id == item._id){
              isExist = true;
              detail.NumGas++;
          }
      });
      if (!isExist){
            var detailTemp = {}
            detailTemp.Item = item;
            detailTemp.NumGas = 1;
            detailTemp.NumGasAndCylinder = 0;
            $scope.curCart.OrderDetails.push(detailTemp);
        }
      var temp =0;
      $scope.curCart.OrderDetails.forEach(function(detail,index){
        temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
      });
      $scope.curCart.Total = temp;
      CartService.setCurCart($scope.curCart);
      sharedUtils.showAlert("success","Thêm thành công");
    };
     $scope.numGasChange=function(detail){
      if (detail.NumGas <0) detail.NumGas =0
      else if(detail.NumGas ==0 && detail.NumGasAndCylinder == 0)
          $scope.curCart.splice($scope.curCart.indexOf(detail),1);
      else{
        var temp =0;
        $scope.curCart.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
        });
        $scope.curCart.Total = temp;
        CartService.setCurCart($scope.curCart);
      }
    };
    $scope.numGasAndCylinderChange=function(detail){
      $scope.isShowSaveButon =true;
      if (detail.NumGasAndCylinder <0) detail.NumGasAndCylinder =0
      else if(detail.NumGas ==0 && detail.NumGasAndCylinder == 0)
          $scope.curCart.splice($scope.curCart.indexOf(detail),1);
      else{
        var temp =0;
        $scope.curCart.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
        });
        $scope.curCart.Total = temp;
        CartService.setCurCart($scope.curCart);
      }
    };
    $scope.removeDetail=function(detail){
       $scope.curCart.OrderDetails.splice($scope.curCart.OrderDetails.indexOf(detail),1);
       var temp =0;
        $scope.curCart.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
        });
        $scope.curCart.Total = temp;
        CartService.setCurCart($scope.curCart);
    };
    $scope.order=function(){
        if ($scope.curCart.OrderDetails.length <1)  {
           sharedUtils.showAlert("warning","Bạn chưa chọn sản phẩm nào cả, vui lòng chọn một sản phẩm");
           return;
        }
        if (!$scope.curUser.Phone){
           sharedUtils.showAlert("warning","Cung cấp tối thiểu là sđt để đặt hàng");
           return;
        };
        var order ={};
        order.OrderDetails=$scope.curCart.OrderDetails;
		    order.Total=$scope.curCart.Total;
        order.Status=1;
		    order.Name=$scope.curUser.FullName;
        order.PhoneNumber=$scope.curUser.Phone;
		    order.Address=$scope.curUser.Address;
		    order.Note= $scope.rootNote.Note
		    order.OrderDate = new Date();
        OrderService.addOrder(order)
        .then(function success(data){
            sharedUtils.showAlert("success","Đặt hàng hành công");
            // Navigation to Order details
            $state.go('orderDetail',{id: data._id});
        }, function error(msg){
             sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
        });
    };
})
.controller('ordersCtrl', function($scope,$state,$filter,$rootScope,sharedUtils,OrderService,UserService) {
    $scope.orders = [];
    $scope.numberMaxItem= 10;
    $scope.filterOrder="";
    $rootScope.extras = true;
    $scope.noMoreItemsAvailable = true;
    $scope.$on('$ionicView.enter', function(ev) {
      sharedUtils.showLoading();
       OrderService.getAllOrders()
        .then(function success(data){
           data.forEach(function(item, index){
             if (item.Status === 0)
                item.StatusString = "Đã hủy";
             else if (item.Status === 1)
                item.StatusString = "Đang đặt hàng";
             else if (item.Status === 2)
                item.StatusString = "Đã xác nhận";
             else if (item.Status === 3)
                item.StatusString = "Đã chuyển đi";
             else if (item.Status === 4)
                item.StatusString = "Thành công";
           });
           $scope.orders = data;
           $scope.noMoreItemsAvailable = false;
           sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.showAlert("warning","Không lấy được danh sách đơn hàng");
            sharedUtils.hideLoading();
            console.log(msg);
        });
    });
    $scope.createNew = function(){
      $state.go('addProduct');
    }
    $scope.loadMore = function() {
      console.log('load more');
      if ($scope.numberMaxItem+3<=$scope.orders.length)
       {
         $scope.numberMaxItem+=3
         $scope.noMoreItemsAvailable = false;
       }
      else
        $scope.noMoreItemsAvailable = true;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.orderClick = function(_id){
      $state.go('orderDetail',{id: _id});
    }

})
.controller('productsCtrl', function($scope,$state,$filter,$rootScope,sharedUtils,ItemService,$ionicPopup) {
    $scope.items = [];
    $scope.numberMaxItem= 10;
    $scope.filterOrder="";
    $rootScope.extras = true;
    $scope.noMoreItemsAvailable = true;
    $scope.$on('$ionicView.enter', function(ev) {
        sharedUtils.showLoading();
        ItemService.getAllItems()
        .then(function success(data){
            $scope.items=data;
            sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.hideLoading();
          console.log(msg);
        });
    });
    $scope.createNew = function(){
     
    }
    $scope.loadMore = function() {
      console.log('load more');
      if ($scope.numberMaxItem+3<=$scope.orders.length)
       {
         $scope.numberMaxItem+=3
         $scope.noMoreItemsAvailable = false;
       }
      else
        $scope.noMoreItemsAvailable = true;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    $scope.itemClick=function (item) {
    $scope.curItemClick=item;
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/itemDetail.html',
      scope: $scope,
      title: 'Thông tin chi tiết',
      buttons: [
      { text: 'Đóng' },
      {
        text: '<b>Lưu</b>',
        type: 'button-positive',
        onTap: function(e) {
          ItemService.updateItem($scope.curItemClick)
          .then(function success(data){
            sharedUtils.showAlert("success","Sửa sản phẩm thành công");
          }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, Vui lòng kiểm tra kết nối");
          });
        }
      }
      ]
    });
  };
})
.controller('customersCtrl', function($scope,$state,$filter,$rootScope,sharedUtils,UserService,$ionicPopup) {
    $scope.users = [];
    $scope.numberMaxItem= 10;
    $scope.filterOrder="";
    $rootScope.extras = true;
    $scope.noMoreItemsAvailable = true;
    $scope.$on('$ionicView.enter', function(ev) {
        sharedUtils.showLoading();
        UserService.getAllUser()
        .then(function success(data){

            $scope.users=data;
            sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.hideLoading();
          console.log(msg);
        });
    });
    $scope.loadMore = function() {
      console.log('load more');
      if ($scope.numberMaxItem+3<=$scope.users.length)
       {
         $scope.numberMaxItem+=3
         $scope.noMoreItemsAvailable = false;
       }
      else
        $scope.noMoreItemsAvailable = true;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    $scope.userClick=function (user) {
      $state.go('customerDetail',{username: user.UserName});
  };
})
.controller('staffCtrl', function($scope,$state,$filter,$rootScope,sharedUtils,UserService,$ionicPopup) {
    $scope.users = [];
    $scope.numberMaxItem= 10;
    $scope.filterOrder="";
    $rootScope.extras = true;
    $scope.noMoreItemsAvailable = true;
    $scope.$on('$ionicView.enter', function(ev) {
        sharedUtils.showLoading();
        UserService.getAllStaff()
        .then(function success(data){

            $scope.users=data;
            sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.hideLoading();
          console.log(msg);
        });
    });
    $scope.loadMore = function() {
      console.log('load more');
      if ($scope.numberMaxItem+3<=$scope.users.length)
       {
         $scope.numberMaxItem+=3
         $scope.noMoreItemsAvailable = false;
       }
      else
        $scope.noMoreItemsAvailable = true;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    $scope.userClick=function (user) {
      $state.go('staffDetail',{username: user.UserName});
  };
})
.controller('nortifyCtrl', function($scope,$rootScope) {
    $rootScope.extras=true;
    $scope.nors = [1,2,3,4];

})
.controller('staffDetailCtrl', function($scope,$state,$rootScope,$stateParams,sharedUtils,UserService,OrderService,$ionicPopup) {
    $scope.curUser = {};
    $scope.orders = [];
    $scope.numOrders = 0;
    $scope.totalOrdersPrice = 0;
    $scope.$on('$ionicView.enter', function(ev) {
    var userName = $stateParams.username;
    UserService.getUser(userName)
    .then(function success(udata){
        $scope.curUser = udata;
        OrderService.getOrderByUserId(udata._id)
        .then(function success(odata){
          odata.forEach(function(item, index){
             if(item.Status ==4)
              $scope.totalOrdersPrice += item.Total;
             if (item.Status === 0)
                item.StatusString = "Đã hủy";
             else if (item.Status === 1)
                item.StatusString = "Đang đặt hàng";
             else if (item.Status === 2)
                item.StatusString = "Đã xác nhận";
             else if (item.Status === 3)
                item.StatusString = "Đã chuyển đi";
             else if (item.Status === 4)
                item.StatusString = "Thành công";
           });
           $scope.numOrders = odata.length;
           $scope.orders = odata;
        }, function error(omsg){
              console.log(omsg);
              sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
        });
      }, function error(umsg){
            console.log(umsg);
            sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
    });

    $scope.orderClick = function(_id){
      $state.go('orderDetail',{id: _id});
    }
})
.controller('customerDetailCtrl', function($scope,$state,$rootScope,$stateParams,sharedUtils,UserService,OrderService,$ionicPopup) {
    $scope.curUser = {};
    $scope.orders = [];
    $scope.numOrders = 0;
    $scope.totalOrdersPrice = 0;
    $scope.$on('$ionicView.enter', function(ev) {
    var userName = $stateParams.username;
    UserService.getUser(userName)
    .then(function success(udata){
        $scope.curUser = udata;
        OrderService.getOrderByUserId(udata._id)
        .then(function success(odata){
          odata.forEach(function(item, index){
             if(item.Status ==4)
              $scope.totalOrdersPrice += item.Total;
             if (item.Status === 0)
                item.StatusString = "Đã hủy";
             else if (item.Status === 1)
                item.StatusString = "Đang đặt hàng";
             else if (item.Status === 2)
                item.StatusString = "Đã xác nhận";
             else if (item.Status === 3)
                item.StatusString = "Đã chuyển đi";
             else if (item.Status === 4)
                item.StatusString = "Thành công";
           });
           $scope.numOrders = odata.length;
           $scope.orders = odata;
        }, function error(omsg){
              console.log(omsg);
              sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
        });
      }, function error(umsg){
            console.log(umsg);
            sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
    });

    $scope.orderClick = function(_id){
      $state.go('orderDetail',{id: _id});
    }
})
.controller('orderDetailCtrl', function($scope,$state,$rootScope,$stateParams,sharedUtils,OrderService,$ionicPopup,ItemService) {
  $rootScope.extras=true;
  $scope.curOrder = {};
  $scope.items = [];
  $scope.curShipper = {};
  $scope.headerInfo = false;
  $scope.isShowSaveButon = false;
  $scope.isShowConfirmButton = false;
  $scope.isShowUnConfirmButton = false;
  $scope.isShowCancelButton = false;
  $scope.headerInfoClick = function(){ // Hàm xử lí sự kiện click vào dòng info
     if ( $scope.headerInfo == false)
       $scope.headerInfo = true;
    else  $scope.headerInfo = false;
   }
  $scope.$on('$ionicView.enter', function(ev) {
    var orderId = $stateParams.id;
    OrderService.getOrderById(orderId)
    .then(function success(data){
      $scope.isShowSaveButon = false;
      if(data.Status ==1){
        $scope.isShowConfirmButton = true;
        $scope.isShowUnConfirmButton = false;
        $scope.isShowCancelButton = true;
      }
      else if(data.Status ==2){
        $scope.isShowConfirmButton = false;
        $scope.isShowUnConfirmButton = true;
        $scope.isShowCancelButton = true;
      }
      else if(data.Status ==3){
        $scope.isShowConfirmButton = false;
        $scope.isShowUnConfirmButton = false;
        $scope.isShowCancelButton = true;
      }
      else if(data.Status ==4){
        $scope.isShowConfirmButton = false;
        $scope.isShowUnConfirmButton = false;
        $scope.isShowCancelButton = false;
      }
      else if(data.Status == 0){
        $scope.isShowConfirmButton = true;
        $scope.isShowUnConfirmButton = false;
        $scope.isShowCancelButton = false;
      }
      if (data.Status === 0)
        data.StatusString = "Đã hủy";
      else if (data.Status === 1)
        data.StatusString = "Đang đặt hàng";
      else if (data.Status === 2)
        data.StatusString = "Đã xác nhận";
      else if (data.Status === 3)
        data.StatusString = "Đã chuyển đi";
      else if (data.Status === 4)
        data.StatusString = "Thành công";
      $scope.curOrder = data;
      
    }, function error(msg){
          console.log(msg);
    });
    ItemService.getAllItems()
    .then(function success(data){
        $scope.items=data;
    }, function error(msg){
      console.log(msg);
    });
  });
    $scope.addItem = function(item){
      $scope.isShowSaveButon = true;
      var isExist = false;
       $scope.curOrder.OrderDetails.forEach(function(detail, index){
          if (detail.Item._id == item._id){
              isExist = true;
              detail.NumGas++;
          }
      });
      if (!isExist){
            var detailTemp = {}
            detailTemp.Item = item;
            detailTemp.NumGas = 1;
            detailTemp.NumGasAndCylinder = 0;
            $scope.curOrder.OrderDetails.push(detailTemp);
        }
      var temp =0;
        $scope.curOrder.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
        });
        $scope.curOrder.Total = temp;  
      sharedUtils.showAlert("success","Thêm thành công");
    }
    $scope.addItemClick= function(){
      var myPopup = $ionicPopup.show({
      templateUrl: 'templates/addItem.html',
      scope: $scope,
      title: 'Thông tin chi tiết',
      buttons: [
      { text: 'OK' },
      ]
    });
    }
    $scope.numGasChange=function(detail){
      $scope.isShowSaveButon =true;
      if (detail.NumGas <0) detail.NumGas =0
      else if(detail.NumGas ==0 && detail.NumGasAndCylinder == 0)
          $scope.curOrder.OrderDetails.splice($scope.curOrder.OrderDetails.indexOf(detail),1);
      else{
        var temp =0;
        $scope.curOrder.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
        });
        $scope.curOrder.Total = temp;
      }
    };
    $scope.numGasAndCylinderChange=function(detail){
      $scope.isShowSaveButon =true;
      if (detail.NumGasAndCylinder <0) detail.NumGasAndCylinder =0
      else if(detail.NumGas ==0 && detail.NumGasAndCylinder == 0)
          $scope.curOrder.splice($scope.curOrder.indexOf(detail),1);
      else{
        var temp =0;
        $scope.curOrder.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
        });
        $scope.curOrder.Total = temp;
      }
    };
    $scope.removeDetail=function(detail){
       $scope.isShowSaveButon = true;
       $scope.curOrder.splice($scope.curOrder.OrderDetails.indexOf(detail),1);
       var temp =0;
        $scope.curOrder.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
        });
        $scope.curOrder.Total = temp;
    };
    $scope.save=function(){
      OrderService.updateOrder($scope.curOrder)
      .then(function success(data){
        sharedUtils.showAlert("success","Sửa đơn hàng thành công");
        $scope.isShowSaveButon = false;
        $state.go('orders');
      }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
    };
    $scope.confirm=function(){
      $scope.curOrder.Status=2; // xác nhận
      OrderService.updateOrder($scope.curOrder)
      .then(function success(data){
        sharedUtils.showAlert("success","Xác nhận đơn hàng thành công");
        $scope.isShowSaveButon = false;
        $state.go('orders');
      }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
    };
    $scope.unConfirm=function(){
      $scope.curOrder.Status=1; 
      OrderService.updateOrder($scope.curOrder)
      .then(function success(data){
        sharedUtils.showAlert("success","Xác nhận đơn hàng thành công");
         $scope.isShowSaveButon = false;
         $scope.isShowConfirmButton = true;
         $scope.isShowUnConfirmButton = false;
         $scope.isShowCancelButton = true;
         if ($scope.curOrder.Status == 0)
          $scope.curOrder.Status = "Đã hủy";
          else if ($scope.curOrder.Status === 1)
            $scope.curOrder.StatusString = "Đang đặt hàng";
          else if ($scope.curOrder.Status === 2)
            $scope.curOrder.StatusString = "Đã xác nhận";
          else if ($scope.curOrder.Status === 3)
            $scope.curOrder.StatusString = "Đã chuyển đi";
          else if ($scope.curOrder.Status === 4)
            $scope.curOrder.StatusString = "Thành công";
      }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
      
    };
    $scope.cancel=function(){
      var myPopup = $ionicPopup.show({
        scope: $scope,
        title: 'Thông tin chi tiết',
        template: 'Bạn chắc chắn muốn hủy đơn hàng này không?',
        buttons: [
        { text: 'Đóng' },
        {
          text: '<b>Hủy</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.curOrder.Status=0; // xác nhận
            OrderService.updateOrder($scope.curOrder)
            .then(function success(data){
              sharedUtils.showAlert("success","Đã hủy đơn hàng thành công");
              $scope.isShowSaveButon = false;
              $state.go('orders');
            }, function error(msg){
                sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
            });
            }
        }
        ]
      });
      
    };
})

.controller('settingsCtrl', function($scope,$rootScope,
                                     $ionicPopup,$state,$window,
                                     sharedUtils) {
    //Bugs are most prevailing here
    $rootScope.extras=true;
})

.controller('supportCtrl', function($scope,$rootScope) {
    $rootScope.extras=true;
})
.controller('reportCtrl', function($scope,$rootScope,ReportService,sharedUtils) {
    $scope.dataReport={};
    $scope.$on('$ionicView.enter', function(ev) {
        sharedUtils.showLoading();
        ReportService.getReportedData()
        .then(function success(data){
            $scope.dataReport=data;
            console.log($scope.dataReport);
            sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.hideLoading();
          console.log(msg);
        });
    });
})
.controller('addingProduct', function($scope, Camera,ItemService,$cordovaFile, $cordovaFileTransfer) {
   $scope.takePicture = function (options) {
	
      var options = {
         quality : 100,
         targetWidth: 300,
         targetHeight: 300,
         sourceType: 1
      };

      Camera.getPicture(options).then(function(imageData) {
         $scope.imgURI = imageData;
         console.log($scope.imgURI);
        $scope.uploadImage();
      }, function(err) {
         console.log(err);
      });
		
   };
    $scope.uploadImage = function() {
      // Destination URL
      var url = "http://192.168.1.17:3000/api/items/";
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = "test name";
      options.mimeType = "Image";
      var targetPath =$scope.imgURI;
      var params = {};
      params.value1 = "test";
      params.value2 = "param";
      console.log(options);
      var ft = new FileTransfer();
      ft.upload(targetPath, encodeURI("http://192.168.1.17:3000/api/items/"), function(r){
        console.log(r);
      }, function(e){
          console.log(e);
      }, options);
    
      /*// File for Upload
      var targetPath =$scope.imgURI;
      console.log(targetPath);
    
      // File name only
      var filename = "hihi";
    
      var options = {
        fileKey: "file",
        fileName: filename,
        chunkedMode: false,
        mimeType: "image",
        params : {'fileName': filename}
      };
       $cordovaFileTransfer.upload(url, targetPath, options)
      .then(function(result) {
        // Success!
      }, function(err) {
        // Error
      }, function (progress) {
        // constant progress updates
      });*/
      }

});