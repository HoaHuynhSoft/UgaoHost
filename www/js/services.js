angular.module('app.services', [])

.factory("UserService", function($http,$q){ // Service cho user
    var headers = {"Authorization": "Basic YWJjOjEyMw=="};
  var hostURL='http://192.168.1.200:3000/api/';
  var self = { 
    'getUser': function(username){  // Hàm lấy user
        var d = $q.defer();
        $http.get(hostURL+"users/"+username,{headers: headers})
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getAllUser': function(){  // Hàm lấy user
        var d = $q.defer();
        $http.get(hostURL+"users",{headers: headers})
        .success(function(data){
            
            d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getAllStaff': function(){  // Hàm lấy user
        var d = $q.defer();
        $http.get(hostURL+"staffs",{headers: headers})
        .success(function(data){
            d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    }
  };
  return self;
})
.factory("ItemService", function($http,$q){ // Service cho post
    var headers = {"Authorization": "Basic YWJjOjEyMw=="};
    var hostURL='http://192.168.1.200:3000/api/';
    var self = {  // tạo một đối tượng service, chứa các hàm và biến
    'items' : [], // chứa posts lấy về
    'getItemById': function(itemId){ // Hàm lấy tất cả bài của một userId
        var d = $q.defer();
        $http.get(hostURL+"items",{headers: headers})
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getAllItems': function(){ // Hàm lấy tất cả các bài post hiện tại
        var d = $q.defer();
        $http.get(hostURL+"items",{headers: headers})
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'updateItem': function(item){ // Hàm cập nhật thông tin product
        var d = $q.defer();
        $http.put(hostURL+"items/"+item._id,item,{headers: headers})
        .success(function(data){
          d.resolve("success");
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'addItem': function(item){ // Hàm cập nhật thông tin product
        var d = $q.defer();
        $http.post(hostURL+"items",item,{headers: headers})
        .success(function(data){
          d.resolve("success");
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
  };
  return self;
})
.factory("CartService", function($http,$q){ // Service cho post
    var headers = {"Authorization": "Basic YWJjOjEyMw=="};
  var self = {  // tạo một đối tượng service, chứa các hàm và biến
    'cart' : {
        OrderDetails:[],
        Total:0
    }, // chứa posts lấy về
    'getCurCart': function(){ // Hàm lấy user hiện tại
        return self.cart;
    },
    'setCurCart': function(temp){ // Hàm lấy user hiện tại
        self.cart=temp;
    },
    'addItemCurCart': function(item1){ // Hàm lấy user hiện tại
        console.log("item: "+JSON.stringify(item1));
        console.log("curCart before: "+JSON.stringify( self.cart));
        self.cart.Items.push(item1);
        console.log("curCart after: "+JSON.stringify( self.cart));
        var temp = 0;
        self.cart.Items.forEach(function(item, index){
            if (item.isFull)
                temp+=item.priceFull;
            else
                temp+=item.price;
        })
        self.cart.Total = temp;
    },
    'emptyCurCart': function(){ // Hàm lấy user hiện tại
        self.cart.Items= [];
        self.cart.Total = 0;
    },
    'removeItemCurCart': function(item1){ // Hàm lấy user hiện tại
        var index = self.cart.Items.indexOf(item1);
        self.cart.Items.splice(index,1);
        var temp = 0;
        self.cart.Items.forEach(function(item, index){
            if (item.isFull)
                temp+=item.priceFull;
            else
                temp+=item.price;
        })
        self.cart.Total = temp;
    }
  };
  return self;
})
.factory('sharedUtils',function($ionicLoading,toaster){
    var functionObj={};
    functionObj.showLoading=function(){ 
      $ionicLoading.show({
        content: '<i class=" ion-loading-c"></i> ', // The text to display in the loading indicator
        animation: 'fade-in', // The animation to use
        showBackdrop: true, // Will a dark overlay or backdrop cover the entire view
        maxWidth: 200, // The maximum width of the loading indicator. Text will be wrapped if longer than maxWidth
        showDelay: 0 // The delay in showing the indicator
      });
    };
    functionObj.hideLoading=function(){
      $ionicLoading.hide();
    };
    functionObj.showAlert = function(type,message) {
        toaster.pop({ type: type, body: message, timeout: 2000 });
    };

    return functionObj;

}) 
.factory('OrderService', function($http,$q){
    var headers = {"Authorization": "Basic YWJjOjEyMw=="};
    var hostURL='http://192.168.1.200:3000/api/';
    var self = {  // tạo một đối tượng service, chứa các hàm và biến
    'getOrderByUserId': function(userId){ // Hàm lấy tất cả bài của một userId      
        var d = $q.defer();
        $http.get(hostURL+"orders/1/"+userId,{headers: headers})    
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getOrderByShipperId': function(userId){ // Hàm lấy tất cả bài của một userId      
        var d = $q.defer();
        $http.get(hostURL+"orders/2/"+userId,{headers: headers})    
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getOrderById': function(itemId){ // Hàm lấy tất cả bài của một userId
        var d = $q.defer();
        $http.get(hostURL+"orders/"+itemId,{headers: headers})
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getAllOrders': function(){ // Hàm lấy tất cả bài của một userId
        var d = $q.defer();
        $http.get(hostURL+"orders",{headers: headers})
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'updateOrder': function(order){ // Hàm cập nhật thông tin user
        var d = $q.defer();
        $http.put(hostURL+"orders/"+order._id,order,{headers: headers})
        .success(function(data){
          d.resolve("success");
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'addOrder': function(newOrder){ // Hàm thêm một order mới
        var d = $q.defer();
        $http.post(hostURL+"orders/",newOrder,{headers: headers}) 
        .success(function(data){
          d.resolve(data._id);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    }
  };
  return self;
  })
.factory('ReportService', function($http,$q){
    var headers = {"Authorization": "Basic YWJjOjEyMw=="};
    var hostURL='http://192.168.1.200:3000/api/';
    var self = {  // tạo một đối tượng service, chứa các hàm và biến
    'getReportedData': function(){ // Hàm lấy tất cả bài của một userId      
        var d = $q.defer();
        $http.get(hostURL+"GetReportData",{headers: headers})    
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getShipperReportedData': function(userId){ // Hàm lấy tất cả bài của một userId     
        var d = $q.defer();
        $http.get(hostURL+"getshipperdatareport/"+userId,{headers: headers})    
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    }
  
  };
  return self;
})
