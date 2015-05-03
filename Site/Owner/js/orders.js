$(function() {
	Parse.$ = jQuery;

	Parse.initialize("KOUvrLMv1oAp2DFoSJQpvl0VIqQKXOYk9HTtRVII",
                   "xBi5mgy6McXhZtUwJXdyS20uVSl6N555lWJTaDyF");
                   
	var Order = Parse.Object.extend("Order",{
	
	cancel: function() {
            this.set({'status': cancel}, {silent: true});
            this.collection.trigger('change', this);
        },
    working: function() {
            this.set({'status': working}, {silent: true});
            this.collection.trigger('change', this);
        },
    finished: function() {
            this.set({'status': finished}, {silent: true});
            this.collection.trigger('change', this);
        },
    paid: function() {
            this.set({'status': paid}, {silent: true});
            this.collection.trigger('change', this);
        }
});
    
	var OrderList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Order

  });

    var _BaseView = Parse.View.extend({
        parent: $('#ordercontainer'),
        className: 'orderviewport',

        initialize: function() {
            this.el = $(this.el);
            
            this.parent.append(this.el);
            return this;
        }
    });
    
  var OrderListView = _BaseView.extend({
         id: 'orderlistview',
        template: $("#orderlist_index_template").html(),
       
		  events: {
      		"click li .cancel"              : "cancelStatus"
     	 },
     	 
        initialize: function(options) {
            this.constructor.__super__.initialize.apply(this, [options])
            this.collection.bind('reset', _.bind(this.render, this));
    	},
    	
        cancelStatus: function(order) {
          		//console.log(this.$("#ordercontents"));
      			this.$("#ordercontents").cancel();
    	},
    	
        render: function() {
            this.el.html(_.template(this.template, 
                                    {'orderlist': this.collection.toJSON()}))
            return this;
        }
        
    });
    
var OrderRouter = Parse.Router.extend({
        views: {},
        menuitems: null,
        cart: null,

        routes: {
            "": "index",
            
           
        },

        initialize: function(data) {
        	this.orderlist = new OrderList([]);

      // Setup the query for the collection to look for menuitems from the current user
      this.orderlist.query = new Parse.Query(Order);
      
    if(Parse.User.current().get("title")=="Owner"){
    	//console.log(this.orderlist);
    	this.orderlist.query.equalTo("ownerId", Parse.User.current().id);
    }
    else{
      this.orderlist.query.equalTo("ownerId", Parse.User.current().get("employee"));
      }
      this.orderlist.fetch();
     // console.log(this.orderlist);
      
       this.views = {
                '_index': new OrderListView({collection: this.orderlist})
            };
        
        },
        
        index: function() {
            var view = this.views['_index'];
        }
        
    });
    
 $(document).ready(function() {
 	new OrderRouter;
  	//Parse.history.start();
  	
  	});
});