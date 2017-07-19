angular.module('app.controllers', [])

.controller('loginCtrl', function($scope,UserService,$window,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
    $rootScope.extras = false; // Ẩn thanh slide menu
    $rootScope.userName = "";
    $scope.user = {};
    /// Khi logout thì xóa hết dữ liệu tạm
    $scope.$on('$ionicView.enter', function(ev) {
      //sharedUtils.showAlert("warning","vaologin");
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
        sharedUtils.showAlert("warning","Vui lòng nhập tài khoản và mật khẩu!");
        return;
      }
      sharedUtils.showLoading();
      UserService.getUser(user.UserName) // lấy user bằng user name
        .then(function success(data){
            sharedUtils.hideLoading();
            if(data==null){
              sharedUtils.showAlert("warning","Tài khoản không tồn tại!");
              return;
            }
            if(user.UserName.toLowerCase() == data.UserName.toLowerCase() 
            && user.Pass.toLowerCase() == data.Pass.toLowerCase() && data.Type == 2){
              $window.localStorage['username'] = user.UserName;
              $window.localStorage['pass'] = user.Pass;
              $rootScope.userName =data.FullName;
              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
              $rootScope.extras = true;
              sharedUtils.hideLoading();
              if ($rootScope.orderId == null){
                $state.go('report', {}, {location: "replace"});
                $rootScope.loginStatus = true;
              }
              else
                $state.go('orderDetail',{id: data.id});
              $scope.user = {};
            }
              else{
                sharedUtils.showAlert("warning","Thông tin tài khoản không hợp lệ");
              }
        }, function error(msg){
          sharedUtils.showAlert("warning","Connection Fail");
          console.log(msg);
        });
    };



})
.controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,$state,$ionicHistory) {
    $rootScope.extras = false; // For hiding the side bar and nav icon

    $scope.signupEmail = function (formName, cred) {
    }

  })
.controller('indexCtrl', function($scope,$window,UserService,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate) {
    $scope.logout=function(){
      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        $window.localStorage['username']="";
        $window.localStorage['pass']="";
        sharedUtils.hideLoading();
      $state.go('tabLogin.login', {}, {location: "replace"});
    }

  })

.controller('myCartCtrl', function($scope,sharedUtils,$ionicPopup,$rootScope,$state,CartService,OrderService,UserService,ItemService) {
    $scope.curUser = {};
    $scope.rootNote = {};
    $scope.items= {};
    $scope.headerInfo = true;
    $scope.headerAddProduct = true;
    $scope.showProducts = true;
    $rootScope.extras=true;
    $scope.curCart = {};
    $scope.weight=10; 
    $scope.Total=0;
    $scope.data={};
    $scope.data.numOfBag =1;
    $scope.OrderDetails=[];
    $scope.clientSideList = [
      { text: "10 kg", value: 10 },
      { text: "20 kg", value: 20 },
      { text: "50 kg", value: 50 },
      { text: "100 kg", value: 100 }
    ];
    $scope.headerInfoClick = function(){ // Hàm xử lí sự kiện click vào dòng info
      if ( $scope.headerInfo == false)
          $scope.headerInfo = true;
      else  
          $scope.headerInfo = false;
   }
   $scope.getKilo=function(item){
     $scope.weight=item.value;
   }
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
    $scope.AddToCart=function(item){
      var myPopup = $ionicPopup.show({
        scope: $scope,
        title: 'Bạn muốn mua bao nhiêu kilogram?',
        templateUrl:'templates/addItem.html',
        //template:'<ion-radio ng-repeat="item in clientSideList" ng-value="item.value" ng-click="getKilo(item)" ng-model="data"> {{ item.text }} </ion-radio>',
        buttons: [
          { text: 'Đóng' },
        {
          text: '<b>Thêm</b>',
          type: 'button-positive',
          onTap: function(e) {
            console.log($scope.weight+$scope.data.numOfBag);
            $scope.updateCurCartService(item,$scope.weight,parseInt($scope.data.numOfBag));
           
          }
        }
        ]
      });
    };
    $scope.removeFromCart=function(detail){
       var index = $scope.OrderDetails.indexOf(detail);
        $scope.OrderDetails.splice(index,1);
        $scope.Total =0;
        $scope.OrderDetails.forEach(function(detail,index){
           $scope.Total += detail.Item.price*detail.kilogramType*detail.numOfKilogramType;
        });
        
    }
    $scope.numBagChange=function(detail){

      if (detail.numOfKilogramType <0){
        sharedUtils.showAlert("warning","Vui lòng nhập số lượng");
        detail.numOfKilogramType =1
      }
      var temp =0;
      $scope.OrderDetails.forEach(function(detail,index){
        temp += detail.Item.price*detail.kilogramType*detail.numOfKilogramType;;
      });
      $scope.Total= temp;
      $scope.updateCart();
    };
    
    $scope.order=function(){
        if ($scope.OrderDetails.length <1)  {
           sharedUtils.showAlert("warning","Bạn chưa chọn sản phẩm nào cả, vui lòng chọn một sản phẩm ở màn hình chính");
           return;
        }
        if (!$scope.curUser.Phone){
           sharedUtils.showAlert("warning","Cung cấp tối thiểu là số điện thoại để đặt hàng");
           return;
        };
        var order ={};
        order.OwnerId="Default_User";
        order.OrderDetails=$scope.OrderDetails;
		    order.Total=$scope.Total;
        order.Status=1;
		    order.Name=$scope.curUser.FullName;
        order.PhoneNumber=$scope.curUser.Phone;
		    order.Address=$scope.curUser.Address;
		    order.Note= $scope.rootNote.Note
		    order.OrderDate = new Date();
        OrderService.addOrder(order)
        .then(function success(data){
            sharedUtils.showAlert("success","Tạo đơn hàng mới thành công");
            //$scope.curUser.DayRemain = $scope.curUser.DayUse;
            //UserService.updateUser($scope.curUser);
            // Navigation to Order details
            console.log(data);
            $state.go('orderDetail',{id: data});
        }, function error(msg){
             sharedUtils.showAlert("warning","Đã có lỗi xảy ra, Vui lòng liên hệ đại lý để được hỗ trợ");
        });
    };
    $scope.updateCurCartService=function(item,kilogramType,numofbag){
        var isExist = false;
        if($scope.OrderDetails!=null){
            $scope.OrderDetails.forEach(function(detail, index){
                if (detail.Item._id == item._id && detail.kilogramType==kilogramType ){
                    isExist = true;
                    detail.numOfKilogramType=detail.numOfKilogramType+numofbag;
                }
            });
        }
        if (!isExist){
            var detailTemp = {};
            detailTemp.Item = item;
            detailTemp.numOfKilogramType = numofbag;
            detailTemp.kilogramType=kilogramType;
            $scope.OrderDetails.push(detailTemp);
        }
        $scope.Total=0;
        $scope.OrderDetails.forEach(function(detail,index){
          //temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
          $scope.Total+=detail.Item.price*detail.kilogramType*detail.numOfKilogramType;
        });
        console.log($scope.OrderDetails);
        $scope.showProducts=false;
        sharedUtils.showAlert("success","Đã bỏ vào giỏ hàng");
    };
    $scope.headerAddProductClick = function(){ // Hàm xử lí sự kiện click vào dòng info  
        if ( $scope.headerAddProduct == false){
          $scope.headerAddProduct = true;
        }       
        else {
          $scope.headerAddProduct = false;
        }
    }
    $scope.ShowProductsInCart=function(){
    if ( $scope.showProducts == false){
            $scope.showProducts = true;
        }  
        else {
            $scope.showProducts = false;
        } 
  }
    
})
.controller('ordersCtrl', function($scope,$state,$filter,$rootScope,sharedUtils,OrderService,UserService) {
    $scope.orders = [];
    $scope.numberMaxItem= 10;
    $scope.filterOrder="";
    $scope.focusNewButton="";
    $scope.focusDeliverButton="";
    $scope.focusCancelButton="";
    $rootScope.extras = true;
    $scope.noMoreItemsAvailable = true;
    $scope.$on('$ionicView.enter', function(ev) {
      $scope.Init();
    });
    $scope.Init=function(){
      sharedUtils.showLoading();
       OrderService.getAllOrders()
        .then(function success(data){
           data.forEach(function(item, index){
            if (item.Status === 0){
              item.css="cancel";
              item.StatusString = "Đã hủy";
            }
                
            if (item.Status === 1){
              item.css="waiting";
              item.StatusString = "Đang đặt hàng";
            }    
            if (item.Status === 2){
              item.css="confirmed";
              item.StatusString = "Đã xác nhận";
            }
                
            if (item.Status === 3){
              item.css="waiting";
              item.StatusString = "Đã chuyển đi";
            }
                
            if (item.Status === 4){
              item.css="Done";
              item.StatusString = "Thành công";
            }
                
           });
           $scope.orders = data;
           $scope.noMoreItemsAvailable = false;
           sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.showAlert("warning","Không lấy được danh sách đơn hàng");
            sharedUtils.hideLoading();
            console.log(msg);
        });
    }
    $scope.doRefresh = function() {
      $scope.Init();
      $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.ResetFilter=function(){
      $scope.filterOrder="";
      $scope.focusNewButton="";
      $scope.focusDeliverButton="";
      $scope.focusCancelButton="";
    }
    $scope.FilterOrders=function(status){
         switch (status) {
            case 1:{
              if( $scope.filterOrder==="Đang đặt hàng"){
                $scope.filterOrder="";
                $scope.focusNewButton="";
              }
              else{
                $scope.filterOrder="Đang đặt hàng";
                $scope.focusNewButton="fucusingButton";
              }
               $scope.focusDeliverButton="";
               $scope.focusCancelButton="";             
                break;
            }       
            case 2:{
               if( $scope.filterOrder==="Đã chuyển đi"){
                $scope.filterOrder="";
                $scope.focusDeliverButton="";
              }
              else{
                $scope.filterOrder="Đã chuyển đi";
                $scope.focusDeliverButton="fucusingButton";
              }
               $scope.focusNewButton="";
               $scope.focusCancelButton="";             
                break;
            }
            default:{
              if( $scope.filterOrder==="Đã hủy"){
                $scope.filterOrder="";
                $scope.focusCancelButton="";
              }
              else{
                $scope.filterOrder="Đã hủy";
                $scope.focusCancelButton="fucusingButton";
              }
               $scope.focusNewButton="";
               $scope.focusDeliverButton="";             
                break;
            }

        }
    }
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
          sharedUtils.showLoading();
          ItemService.updateItem($scope.curItemClick)
          .then(function success(data){
            sharedUtils.hideLoading();
            sharedUtils.showAlert("success","Sửa sản phẩm thành công");
          }, function error(msg){
            sharedUtils.hideLoading();
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
.controller('staffDetailCtrl', function(ReportService,$scope,$state,$rootScope,$stateParams,sharedUtils,UserService,OrderService,$ionicPopup) {
    $scope.curUser = {};
    $scope.headerInfo=true;
    $scope.$on('$ionicView.enter', function(ev) {
      $scope.Init();
    });
    $scope.headerInfoClick = function(){ // Hàm xử lí sự kiện click vào dòng info
     if ( $scope.headerInfo == false)
       $scope.headerInfo = true;
    else  $scope.headerInfo = false;
   }
    $scope.orderClick = function(_id){
      $state.go('orderDetail',{id: _id});
    };
    $scope.doRefresh = function() {
      $scope.Init();
      $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.Init=function(){
      sharedUtils.showLoading();
      var userName = $stateParams.username;
      UserService.getUser(userName)
      .then(function success(udata){
          $scope.curUser = udata;
          $scope.ordersNew=[];
          $scope.orders=[];
          $scope.totalOrdersPrice=0;
          OrderService.getOrderByShipperId(udata._id)
          .then(function success(odata){
            odata.forEach(function(item, index){
                    
              if (item.Status === 3){
                  item.StatusString = "Đang nhận giao";
                  $scope.ordersNew.push(item);
              }             
              else if (item.Status === 4){
                  item.StatusString = "Thành công";
                  $scope.totalOrdersPrice += item.Total;
                  $scope.orders.push(item);
              }   
            });
            $scope.numOrders = odata.length;
            ReportService.getShipperReportedData(udata._id)
              .then(function success(reportData){
                sharedUtils.hideLoading();
                $scope.reportData=reportData;
                console.log( $scope.reportData);
              },function error(err){
                  console.log(err);
                  sharedUtils.hideLoading();
                  sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 0873008888 để được hỗ trợ");
              })
            
          }, function error(omsg){
                console.log(omsg);
                sharedUtils.hideLoading();
                sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 0873008888 để được hỗ trợ");
          });
        }, function error(umsg){
              console.log(umsg);
              sharedUtils.hideLoading();
              sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 0873008888 để được hỗ trợ");
        });
    };
})
.controller('customerDetailCtrl', function($scope,$state,$rootScope,$stateParams,sharedUtils,UserService,OrderService,$ionicPopup) {
    $scope.curUser = {};
    $scope.orders = [];
    $scope.headerInfo =true;
    $scope.numOrders = 0;
    $scope.totalOrdersPrice = 0;
    $scope.$on('$ionicView.enter', function(ev) {
    sharedUtils.showLoading();
    var userName = $stateParams.username;
    UserService.getUser(userName)
    .then(function success(udata){
        $scope.curUser = udata;
        OrderService.getOrderByUserId(udata._id)
        .then(function success(odata){
          sharedUtils.hideLoading();
          odata.forEach(function(item, index){
             if (item.Status === 0)
                item.StatusString = "Đã hủy";
             else if (item.Status === 1)
                item.StatusString = "Đang đặt hàng";
             else if (item.Status === 2)
                item.StatusString = "Đã xác nhận";
             else if (item.Status === 3)
                item.StatusString = "Đã chuyển đi";
             else if (item.Status === 4){
                item.StatusString = "Thành công";
                 $scope.totalOrdersPrice += item.Total;
             }       
           });
           $scope.numOrders = odata.length;
           $scope.orders = odata;
        }, function error(omsg){
              console.log(omsg);
              sharedUtils.hideLoading();              
              sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
        });
      }, function error(umsg){
            console.log(umsg);
            sharedUtils.hideLoading();
            sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
    });
     $scope.headerInfoClick = function(){ // Hàm xử lí sự kiện click vào dòng info
        if ( $scope.headerInfo == false)
          $scope.headerInfo = true;
        else  $scope.headerInfo = false;
      }
    $scope.orderClick = function(_id){
      $state.go('orderDetail',{id: _id});
    }
})
.controller('orderDetailCtrl', function($scope,$state,$rootScope,$stateParams,sharedUtils,OrderService,$ionicPopup,ItemService) {
  $rootScope.extras=true;
  $scope.curOrder = {};
  $scope.items = [];
  $scope.curShipper = {};
  $scope.headerInfo = true;
  $scope.headerInfoDeliver = true;
  $scope.headerAddProduct=true;
  $scope.showProducts=false;
  $scope.isShowSaveButon = false;
  $scope.isShowConfirmButton = false;
  $scope.isShowUnConfirmButton = false;
  $scope.isShowCancelButton = false;
  $scope.weight=10; 
  $scope.data={};
  $scope.data.numOfBag =1;
  $scope.clientSideList = [
    { text: "10 kg", value: 10 },
    { text: "20 kg", value: 20 },
    { text: "50 kg", value: 50 },
    { text: "100 kg", value: 100 }
  ];
   $scope.headerAddProductClick = function(){ // Hàm xử lí sự kiện click vào dòng info  
        if ( $scope.headerAddProduct == false){
          $scope.headerAddProduct = true;
        }       
        else {
          $scope.headerAddProduct = false;
        }
    }
  $scope.headerInfoDeliverClick = function(){ // Hàm xử lí sự kiện click vào dòng info
    if ( $scope.headerInfoDeliver == false)
      $scope.headerInfoDeliver = true;
  else  $scope.headerInfoDeliver = false;
  }
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
  $scope.getKilo=function(item){
     $scope.weight=item.value;
   }
   $scope.AddItem = function(item,kilogramType,numofbag){
      $scope.isShowSaveButon = true;
       var isExist = false;
        if( $scope.curOrder.OrderDetails!=null){
             $scope.curOrder.OrderDetails.forEach(function(detail, index){
                if (detail.Item._id == item._id && detail.kilogramType==kilogramType ){
                    isExist = true;
                    detail.numOfKilogramType=detail.numOfKilogramType+numofbag;
                }
            });
        }
        if (!isExist){
            var detailTemp = {};
            detailTemp.Item = item;
            detailTemp.numOfKilogramType = numofbag;
            detailTemp.kilogramType=kilogramType;
            $scope.curOrder.OrderDetails.push(detailTemp);
        }
        $scope.curOrder.Total=0;
         $scope.curOrder.OrderDetails.forEach(function(detail,index){
          //temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
          $scope.curOrder.Total+=detail.Item.price*detail.kilogramType*detail.numOfKilogramType;
        });
        console.log($scope.OrderDetails);
        $scope.showProducts=false;
        sharedUtils.showAlert("success","Đã bỏ vào giỏ hàng");
    }
    $scope.AddToCart= function(item){
      var myPopup = $ionicPopup.show({
      templateUrl: 'templates/addItem.html',
      scope: $scope,
      title: 'Thông tin chi tiết',
      buttons: [
          { text: 'Đóng' },
        {
          text: '<b>Thêm</b>',
          type: 'button-positive',
          onTap: function(e) {
            console.log($scope.weight+$scope.data.numOfBag);
            $scope.AddItem(item,$scope.weight,parseInt($scope.data.numOfBag));
           
          }
        }
        ]
    });
    }
   
    $scope.decreaseNumofBag=function(){
      if($scope.data.numOfBag>1){
        $scope.data.numOfBag--;
      }
    }
  $scope.increaseNumofBag=function(){
    if($scope.data.numOfBag<10){
      $scope.data.numOfBag++;
    }
  }
    $scope.removeDetail=function(detail){
       var index = $scope.curOrder.OrderDetails.indexOf(detail);
        $scope.curOrder.OrderDetails.splice(index,1);
        var Total =0;
        $scope.curOrder.OrderDetails.forEach(function(detail,index){
           Total += detail.Item.price*detail.kilogramType*detail.numOfKilogramType;
        });
        $scope.curOrder.Total = Total;
    };
    $scope.save=function(){
      OrderService.updateOrder($scope.curOrder)
      .then(function success(data){
        sharedUtils.showAlert("success","Sửa đơn hàng thành công");
        $scope.isShowSaveButon = false;
        $state.go('orders');
      }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 0873008888 để được hỗ trợ");
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
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 0873008888 để được hỗ trợ");
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
  $scope.ShowProductsInCart=function(){
    if ( $scope.showProducts == false){
            $scope.showProducts = true;
        }  
        else {
            $scope.showProducts = false;
        } 
  }
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
.controller('reportCtrl', function($scope,$rootScope,ReportService,sharedUtils,OrderService,$state ) {
    $scope.dataReport={};
    $scope.ordersInDelivery=[];
    $scope.ordersWaiting=[];
    $scope.totalMoney=0;
    $scope.successOrder=0;
    $scope.failedOrder=0;
    $scope.$on('$ionicView.enter', function(ev) {
        $scope.Init();
    }); 
    $scope.orderClick = function(_id){
      $state.go('orderDetail',{id: _id});
    };
    $scope.doRefresh = function() {
      $scope.Init();
      $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.Init=function(){
      sharedUtils.showLoading();
        ReportService.getReportedData()
        .then(function success(data){          
            
            $scope.dataReport=data;
            console.log($scope.dataReport);
            $scope.failedOrder=0;
              $scope.totalMoney=0;
              $scope.successOrder=0;
            data.ordersInMonth.forEach(function(item,index){
              
              if (item.Status === 0){
                  $scope.failedOrder++;
              }               
              if (item.Status === 4){
                $scope.totalMoney += item.Total;
                $scope.successOrder++;
              }               
           });
            OrderService.getAllOrders()
            .then(function success(odata){
              sharedUtils.hideLoading();
                $scope.ordersWaiting=[];
                $scope.ordersInDelivery=[];
                odata.forEach(function(item, index){
                   
                  if (item.Status === 1){
                      item.StatusString = "Chờ xác nhận";
                      $scope.ordersWaiting.push(item);
                  }                      
                  else if (item.Status === 3){
                      item.StatusString = "Đang chuyển đi";
                      $scope.ordersInDelivery.push(item);
                  }             
                      
                });
                $scope.numOrders = odata.length;
                
              }, function error(omsg){
                    console.log(omsg);
                    sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
              });
        }, function error(msg){
          sharedUtils.hideLoading();
          console.log(msg);
        });
    };
})
.controller('addingProduct', function($ionicPopup,$scope,ItemService,sharedUtils,$state) {
  $scope.item={};
  $scope.item.name=null;
  $scope.item.description=null;
  $scope.item.price=null;
  $scope.item.image=null;
  $scope.item.stock=200;
  $scope.item.available=true;
  $scope.FocusCss="";
  $scope.imageUrl="";
  $scope.ChoosingPhoto=function(){
    var myPopup = $ionicPopup.show({
        scope: $scope,
        title: 'Hình ảnh mẫu',
        templateUrl:'templates/ChoosePhoto.html',
        //template:'<ion-radio ng-repeat="item in clientSideList" ng-value="item.value" ng-click="getKilo(item)" ng-model="data"> {{ item.text }} </ion-radio>',
        buttons: [
          { text: 'Đóng' },
        {
          text: '<b>Thêm</b>',
          type: 'button-positive'      
          }
        
        ]
      });
  }
  $scope.SetPhoto=function(index){
    console.log(index); 
    $scope.item.image=index;
    $scope.imageUrl='img/'+ index +'.jpg';
  }
  $scope.CreateProductInfo=function(){
    console.log($scope.item);
    if($scope.item.image===null){
      sharedUtils.showAlert("warning","Bạn chưa chọn hình ảnh cho sản phẩm");
      return;
    }
     if($scope.item.name===null){
      sharedUtils.showAlert("warning","Bạn chưa nhập tên sản phẩm");
      return;
    }
    if($scope.item.price===null){
      sharedUtils.showAlert("warning","Bạn chưa giá cho sản phẩm");
      return;
    }
    if($scope.item.description===null){
      sharedUtils.showAlert("warning","Bạn chưa nhập mô tả cho sản phẩm");
      return;
    }
    ItemService.addItem($scope.item).then(function success(res){
      sharedUtils.showAlert("success","Thêm mới sản phẩm thành công");
      $state.go("products");
    },function error(err){
      sharedUtils.showAlert("warning","Đã xãy ra lỗi");
    })
  }
})
.controller('feedbacksCtrl', function($scope,$rootScope,sharedUtils,UserService) {
    $scope.feedbacks = [];
    $scope.numberMaxItem= 10;
    $scope.noMoreItemsAvailable = true;
    $scope.$on('$ionicView.enter', function(ev) {
      sharedUtils.showLoading();
       UserService.getAllFeedback()
        .then(function success(data){
          data.forEach(function(item, index){
            if (item.catalogue == 1)
              item.catalogue = "Phục vụ";
            else if (item.catalogue == 2)
              item.catalogue = "Đặt hàng";
            else if (item.catalogue == 3)
              item.catalogue = "Sản phẩm";
            else if (item.catalogue == 4)
              item.catalogue = "Khác";
          });
           $scope.feedbacks = data;
           $scope.noMoreItemsAvailable = false;
           sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.showAlert("warning","Không lấy được danh sách phản hồi");
            sharedUtils.hideLoading();
            console.log(msg);
        });
    });
     $scope.loadMore = function() {
      if ($scope.numberMaxItem+3<=$scope.orders.length)
       {
         $scope.numberMaxItem+=3
         $scope.noMoreItemsAvailable = false;
       }
      else
        $scope.noMoreItemsAvailable = true;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }
    $scope.ResetFilter=function(){
      $scope.filterOrder="";
    }
});