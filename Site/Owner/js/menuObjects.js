

/************************************************************************/
/**************************CURTIAN OPEN**********************************/
/************************************************************************/


$(function() {
/**************************PROLOG**********************************/
  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
    	Parse.initialize("KOUvrLMv1oAp2DFoSJQpvl0VIqQKXOYk9HTtRVII",
                   "xBi5mgy6McXhZtUwJXdyS20uVSl6N555lWJTaDyF");
                   
/*****************ACT ONE:OBJECTS AND COLLECTIONS*********************/
  // basic Ingredient model has `name`, `price`, and `status`, 'order' attributes.
  // 'status' default is active
  var Ingredient = Parse.Object.extend("Ingredient", {
    // Default attributes for the Ingredient.
    defaults: {
      content: "please add a name",
      status: true,
      initem: false
    },

    // Ensure that each Ingredient created has a 'content'.
    initialize: function() {
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
        this.set({"status": !this.defaults.status});
      }
    },

    // Toggle the `status` state of this Ingredient item.
    toggle: function() {
      this.save({status: !this.get("status")});
    }
  
  });
/******************************************************/
/********Begin of IngredientList Model*********/

  var IngredientList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Ingredient,

    // Filter down the list of all Ingredient items that are inactive.
    status: function() {
      return this.filter(function(ingredient){ return ingredient.get('status'); });
    },

    // Filter down the list to only Ingredient items that are still not active.
    activeStatus: function() {
      return this.without.apply(this, this.status());
    },
    
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Ingredients are sorted by their original insertion order.
    comparator: function(ingredient) {
      return ingredient.get('order');
    },
    
    //returns items with initem true
    status: function(){
    	return this.filter(function(ingredient){return ingredient.get('status');});
    }
    
  });
  
/********Begin of Menuitem Model*********/

  // basic Menuitem model has `name`, `price`, and `status`, 'order' attributes.
  // 'status' default is active
  var Menuitem = Parse.Object.extend("Menuitem", {
    // Default attributes for the Menuitem.
    defaults: {
      content: "please add a name",
      description: "item description here",
      price: 0.00,
      status: true,
      menuitem : []
    },
    //checks for content and initialized empty array of ingredients
    initialize: function() {
        this.set('ingredientlist', new IngredientList(this.ingredientlist));
        
    	if (!this.get("content")) {
        	this.set({"content": this.defaults.content});
        	}
        if (!this.get("description")) {
        	this.set({"description": this.defaults.description});
        	}	
         if (!this.get("price")) {
        	this.set({"price": this.defaults.price});
        	}		
    },


    // Toggle the `status` state of this Menuitem item.
    toggle: function() {
      this.save({status: !this.get("status")});
    }
  });

/********End of Menuitem Model*********/


/********Begin of Menu Model*********/

  var Menu = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Menuitem,

    // Filter down the list of all Menuitem items that are finished.
    status: function() {
      return this.filter(function(menuitem){ return menuitem.get('status'); });
    },

    // Filter down the list to only Menuitem items that are still not active.
    activeStatus: function() {
      return this.without.apply(this, this.status());
    },

    // We keep the Menuitems in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    //order here is the order in which they appear '! list of menu items' 
    //first declaration of attribute 'order' or each menuitem
    
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Menuitems are sorted by their original insertion order.
    comparator: function(menuitem) {
      return menuitem.get('order');
    }

  });
  
  /***sets filter default to all*******/
  
  // This is the transient application state, not persisted on Parse
  //called at end of code
  var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });
  
/**************************ACT TWO: VIEWS**********************************/

  /************* Menuitem Item View***********************/

  // The DOM element for a Menuitem item...
  var MenuitemView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.

    events: {
      
    },

    // The MenuitemView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a Menuitem and a MenuitemView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render');
    },
                                         
    // Re-render the contents of the menuitem item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }

  });

/****************Begin Application View***************************/

  // The main view that lets a user manage their menuitem items
  var ManageMenuitemsView = Parse.View.extend({

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing inactive ones.
	//was new-todo, clear-completed/clearCompleted, toggleAllComplete
    events: {
      "click .log-out": "logOut",
      "click ul#filters a": "selectFilter"
    },

    el: ".content",

	// At initialization we bind to the relevant events on the `Menuitems`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting menuitems that might be saved to Parse.
    initialize: function() {
      var self = this;

      _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render','logOut');

	/*************** Main menuitem management template**************/
//was #manage-todos-template
      this.$el.html(_.template($("#manage-menuitems-template").html()));


      // Create our collection of Menuitems
      this.menuitems = new Menu;

      // Setup the query for the collection to look for menuitems from the current user
      this.menuitems.query = new Parse.Query(Menuitem);
      this.menuitems.query.equalTo("user", Parse.User.current());
        
      this.menuitems.bind('add',     this.addOne);
      this.menuitems.bind('reset',   this.addAll);
      this.menuitems.bind('all',     this.render);

      // Fetch all the menuitem items for this user
      this.menuitems.fetch();
	//console.log(this.menuitems);
      state.on("change", this.filter, this);
    },
    
	/*******************Log Out Routine***************************/
    // Logs out the user and shows the login view
    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      delete this;
    },
    
	/***********Render/Refresh List of Menuitems**********************/
    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
  
    render: function() {
      var activeStatus = this.menuitems.status().length;
      var status = this.menuitems.activeStatus().length;

      this.$('#menuitem-stats').html(this.statsTemplate({
        total:      this.menuitems.length,
        status:       status,
        activeStatus:  activeStatus
      }));

      this.delegateEvents();

    },
	/**********List Filters*******************************/
	//item != Item
    // Filters the list based on which type of filter is selected
    selectFilter: function(e) {
      var el = $(e.target);
      var filterValue = el.attr("id");
      state.set({filter: filterValue});
      Parse.history.navigate(filterValue);
    },

    filter: function() {
      var filterValue = state.get("filter");
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#" + filterValue).addClass("selected");
      if (filterValue === "all") {
        this.addAll();
      } else if (filterValue === "active") {
        this.addSome(function(item) { return item.get('status') });
      } else {
        this.addSome(function(item) { return !item.get('status') });//inactive items
      }
    },

    // Resets the filters to display all menuitems
    resetFilters: function() {
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#all").addClass("selected");
      this.addAll();
    },
	/**********Defines Previously Binded Events Related to Editing Item********/
    // Add a single menuitem item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
	
    addOne: function(menuitem) {
      var view = new MenuitemView({model: menuitem});
      this.$("#menu").append(view.render().el);
    },

    // Add all items in the Menuitems collection at once.
    addAll: function(collection, filter) {
      this.$("#menu").html("");
      this.menuitems.each(this.addOne);
    },

    // Only adds some menuitems, based on a filtering function that is passed in
    addSome: function(filter) {
      var self = this;
      this.$("#menu").html("");
      this.menuitems.chain().filter(filter).each(function(item) { self.addOne(item) });
    }
  });
/*************End of Application View*******************************/

/*************Begin Login/Signup Views**************************************/
  var LogInView = Parse.View.extend({
    events: {
      "submit form.login-form": "logIn",
      "submit form.signup-form": "signUp"
    },
//calls .css menuitemapp .content
    el: ".content",
    
    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },
	/**********Parse Login function****************/
	//sends error if not found in parse database
    logIn: function(e) {
      var self = this;
      var username = this.$("#login-username").val();
      var password = this.$("#login-password").val();
      
      Parse.User.logIn(username, password, {
     
        success: function(user) {
          new ManageMenuitemsView();
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
          self.$(".login-form button").removeAttr("disabled");
        }
      });
		
      this.$(".login-form button").attr("disabled", "disabled");

      return false;
    },
    
	/**********Parse Sign UP routine****************/
	//sends new user to parse database or error
    signUp: function(e) {
      var self = this;
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();
      
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
        success: function(user) {
          new ManageMenuitemsView();
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".signup-form .error").html(_.escape(error.message)).show();
          self.$(".signup-form button").removeAttr("disabled");
        }
      });

      this.$(".signup-form button").attr("disabled", "disabled");

      return false;
    },

    render: function() {
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    }
  });
/**********End of Login/Signup Views********************************/

  
 /**********Begin of Main App View********************************/
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    
    el: $("#menuitemapp"),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (Parse.User.current()) {
        new ManageMenuitemsView();
      } else {
        new LogInView();
      }
    }
  });
/**********End of Main App View********************************/

/**************************ACT THREE: ROUTER**********************************/
/**********Begin of Router Declaration********************************/
  var AppRouter = Parse.Router.extend({
    routes: {
      "all": "all",
      "active": "active",
      "inactivated": "inactivated"
    },

    initialize: function(options) {
    },

    all: function() {
      state.set({ filter: "all" });
    },

    active: function() {
      state.set({ filter: "active" });
    },

    inactivated: function() {
      state.set({ filter: "inactivated" });
    }
  });
/**********End of Router Declaration********************************/

/*******************************************************************/
/**************************FINALE!**********************************/
/*******************************************************************/

  //create AppState which is a parse object defaulting to 'all' filters
  var state = new AppState;
  //creates AppRouter to handle filters
  new AppRouter;
  //creates main Appview
  new AppView;
  //starts history log
  Parse.history.start();
});
/**********End of Function********************************/