function StoreView(owner) {
Parse.$ = jQuery;
	
  // Initialize Parse with your Parse application javascript keys
  	Parse.initialize("KOUvrLMv1oAp2DFoSJQpvl0VIqQKXOYk9HTtRVII",
                   "xBi5mgy6McXhZtUwJXdyS20uVSl6N555lWJTaDyF");
    var Menuitem = Parse.Object.extend("Menuitem",{})

    var MenuitemCollection = Parse.Collection.extend({
        model: Menuitem,

         initialize: function(options) {
        },

        comparator: function(item) {
            return item.objectId;
            }
    });

    var Item = Parse.Object.extend("Item",{
    //contains menuitem and quanity
        update: function(amount) {
            this.set({'quantity': amount}, {silent: true});
            this.collection.trigger('change', this);
        },
        price: function() {
            console.log(this.get('menuitem').get('content'), this.get('quantity'));
            return this.get('menuitem').get('price') * this.get('quantity');
        },
        calories: function() {
            
            return this.get('menuitem').get('calories') * this.get('quantity');
        },
        status: function() {
            
            return this.get('menuitem').get('status') ;
        },
        itemid: function() {
            return this.get('menuitem').id;
        },
        itemstorage:function(){
        	return this.get('menuitem');
        }
    });

    var ItemCollection = Parse.Collection.extend({
        model:Item,
        
//searches cart for id of the item in question
        getOrCreateItemForMenuitem: function(menuitem) {
            var i, 
            pid = menuitem.id,
            //searches through each object in cart
            o = this.find(function(obj) { return (obj.get('menuitem').id == pid); });
     
            if (o) { 
                return o;
            }
            i = new Item({'menuitem': menuitem, 'quantity': 0, 'itemname': menuitem.get('content')});
            this.add(i, {silent: true})
            return i;
        },
		
        getTotalCount: function() {
            return this.reduce(function(memo, obj) { 
                return obj.get('quantity') + memo; }, 0);
        },

        getTotalCost: function() {
            return this.reduce(function(memo, obj) { 
                return obj.price() + memo; }, 0);
        },
        
        getTotalCal: function() {
            return this.reduce(function(memo, obj) { 
                return obj.calories() + memo; }, 0);
        },
        //if bool for any item is false 
         getTotalStatus: function() {
            return this.reduce(function(memo, obj) { 
                return obj.status() + memo; }, 0);
        }
        
    });
    
    var _BaseView = Parse.View.extend({
        parent: $('#maincart'),
        className: 'viewport',

        initialize: function() {
            this.el = $(this.el);
            this.el.hide();
            this.parent.append(this.el);
            return this;
        },

        hide: function() {
            if (this.el.is(":visible") === false) {
                return null;
            }
            promise = $.Deferred(_.bind(function(dfd) { 
                this.el.fadeOut('fast', dfd.resolve)}, this));
            return promise.promise();
        },

        show: function() {
            if (this.el.is(':visible')) {
                return;
            }       
            promise = $.Deferred(_.bind(function(dfd) { 
                this.el.fadeIn('fast', dfd.resolve) }, this))
            return promise.promise();
        }
    });
    
    

	var MenuitemListView = _BaseView.extend({
        id: 'menuitemlistview',
        template: $("#store_index_template").html(),
        
		events: {
        "click #refresh": "refreshCollection"
    	},

        initialize: function(options) {
       		 _.bindAll(this, 'refreshCollection');
            this.constructor.__super__.initialize.apply(this, [options])
            this.collection.bind('reset', _.bind(this.render, this));
        },
        
		refreshCollection: function () {
			
        	this.collection.query = new Parse.Query(Menuitem);
        	
      		this.collection.query.equalTo("user", user);
      		this.collection.fetch({reset:true});
        	this.render();
    	},
    	
        render: function() {
        
            this.el.html(_.template(this.template, 
                                    {'menuitems': this.collection.toJSON()}))
            return this;
        }
    });
    


    var MenuitemView = _BaseView.extend({
        id: 'menuitemview',
        template: $("#store_item_template").html(),
        //options are item: and itemcollection(this cart)
        initialize: function(options) {
        	//contains
        	_.bindAll(this, 'render', 'update', 'updateOnEnter');
            this.constructor.__super__.initialize.apply(this, [options]);
            
            this.itemcollection = options.itemcollection;
           
            //searches itemcollection ie. this.cart for item
            this.item = this.itemcollection.getOrCreateItemForMenuitem(this.model);
          
            return this;
        },

        events: {
            "keypress .uqf" : "updateOnEnter",
            "click .uq"     : "update",
        },

        update: function(e) {
            e.preventDefault();
            //console.log("itemupdate");
            this.item.update(parseInt(this.$('.uqf').val()));
            console.log(this);
        },
        
        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                return this.update(e);
            }
        },

        render: function() {
        	
            this.el.html(_.template(this.template, this.model.toJSON()));
            return this;
            }
    });


    var CartWidget = Parse.View.extend({
        el: $('.cart-info'),
        template: $('#store_cart_template').html(),
        
        initialize: function() {
        	_.bindAll(this, "render");
            this.collection.bind('change', this.render);
           // console.log(this);
        },
        
        render: function() {
        	//console.log(this);
            $(this.el).html(_.template(this.template, {
                    'count': this.collection.getTotalCount(),
                    'cost': this.collection.getTotalCost(),
                    'calories': this.collection.getTotalCal(),
                    'message': "Are you really going to eat that?"
                })).animate({paddingTop: '30px'}).animate({paddingTop: '10px'});
        }
    });
    
    var Checkout = Parse.View.extend({
        el: $('.checkout'),
        template: $('#checkout_template').html(),
        
        initialize: function() {
        	_.bindAll(this, "render");
            this.collection.bind('change', this.render);
           // console.log(this);
        },
        
        render: function() {
       
        
            $(this.el).html(_.template(this.template, {
            		
            		'customer': Parse.User.current().id,
                    'count': this.collection.getTotalCount(),
                    'cost': this.collection.getTotalCost(),
                    'calories': this.collection.getTotalCal(),
                    'status': this.collection.getTotalStatus(),
					'thiscart': this.collection.toJSON()
                })).animate({paddingTop: '30px'}).animate({paddingTop: '10px'});
    	 
        }
    });
    

	
    var ParseStore = Parse.Router.extend({
        views: {},
        menuitems: null,
        cart: null,

        routes: {
            "": "index",
            "item/:objectId": "menuitem"
           
        },

        initialize: function(data) {
        //create cart collection
            this.cart = new ItemCollection();
        //create widget to show cart saved under collection attr
            new CartWidget({collection: this.cart});
			new Checkout({collection: this.cart});
			var userid=Parse.User.current().id;
			var ownerid=Parse.User.current();
			ownerid.id=data;
            this.menuitems = new MenuitemCollection([]);
            console.log(this.menuitems);
            this.menuitems.query = new Parse.Query(Menuitem);
      		this.menuitems.query.equalTo("user", ownerid);
      		this.menuitems.fetch();
      		Parse.User.current().id=userid;
          this.views = {
                '_index': new MenuitemListView({collection: this.menuitems})
            };
            
            $.when(this.menuitems.fetch({reset: true}))
                .then(function() { window.location.hash = ''; });
            return this;
        },
        hideAllViews: function () {
            return _.select(
                _.map(this.views, function(v) { return v.hide(); }), 
                function (t) { return t != null });
        },
        index: function() {
            var view = this.views['_index'];
            $.when(this.hideAllViews()).then(
                function() { return view.show(); });
        },
        menuitem: function(objectId) {
            var menuitem, v, view;
       
            //search through to find element == to clicked item through 
            menuitem = this.menuitems.find(function(p){ return p.id == objectId;});
            		//console.log(menuitem);
            		
        //sets view to indexitem.objid OR creates new item view
            view = ((v = this.views)['item.' + objectId]) || (v['item.' + objectId] = (new MenuitemView({model: menuitem, itemcollection: this.cart}).render()))
           
           
            $.when(this.hideAllViews()).then(
               function() { view.show(); });
        }
	 });
    $(document).ready(function() {
        new ParseStore(owner);
        Parse.history.start();
    });

}
