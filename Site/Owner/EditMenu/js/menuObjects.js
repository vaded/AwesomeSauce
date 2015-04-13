

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
    },
    // Toggle the `status` state of this Ingredient item.
    togglein: function() {
      this.save({initem: !this.get("initem")});
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
    },
    
    //returns items with initem true
    initem: function(){
    	return this.filter(function(ingredient){return ingredient.get('initem');});
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
      calories: 0,
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
        	this.set({"price": this.defaults.calories});
        	}
        if (!this.get("calories")) {
        	this.set({"calories": this.defaults.calories});
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

/************* Ingredient Item View***********************/

  // The DOM element for a Ingredient item...
  var IngredientView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",
    

    // Cache the template function for a single item.
    template: _.template($('#iitem-template').html()),

    // The DOM events specific to an item.
    //was toggleDone todo-content and todo-destroy
    events: {
      "click .toggle"              : "toggleStatus",
      "click .togglein"              : "toggleInitem",
      "dblclick label.ingredient-content" : "edit",
      "click .ingredient-destroy"   : "clear",
      "keypress .edit"      : "updateOnEnter",
      "blur .edit"          : "close"
    },

    // The IngredientView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a Ingredient and a IngredientView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
    },
    // Toggle the `"status"` state of the model.
    toggleStatus: function() {
      this.model.toggle();
    },
    
    toggleInitem: function() {
      this.model.togglein();
    },
                                         
    // Re-render the contents of the ingredient item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.inputName = this.$('.edit');
      return this;
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.inputName.focus();
    },
                                         
     close: function() {
      this.model.save({content: this.inputName.val()});
      
      $(this.el).removeClass("editing");
    },
                                         
    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },
                                         
    // Close the `"editing"` mode, saving changes to the ingredient.
    //was save{(content:
    

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });
  
 /************* Ingredients  View***********************/ 
// The main view that lets a user manage their ingredients
  var ManageIngredientsView = Parse.View.extend({

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#istats-template').html()),

    // Delegated events for creating new items, and clearing inactive ones.
	//was new-todo, clear-completed/clearCompleted, toggleAllComplete
    events: {
      "keypress #new-ingredient-name":  "createOnEnter",
      "click #clear-inactive": "clearInactive",
      "click #toggle-all": "toggleAllInactive",
      "click .log-out": "logOut",
      "click ul#filters a": "selectFilter"
    },

    el: ".contenti",

	// At initialization we bind to the relevant events on the `Ingredients`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting ingredients that might be saved to Parse.
    initialize: function() {
      var self = this;

      _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'toggleAllInactive', 'logOut', 'createOnEnter');

/*************** Main ingredient management template**************/

      this.$el.html(_.template($("#manage-ingredients-template").html()));
      this.inputName = this.$("#new-ingredient-name");
      this.inputPrice = this.$("#new-ingredient-price");
      this.allCheckbox = this.$("#toggle-all")[0];

      // Create our collection of Ingredients
      this.ingredients = new IngredientList;

      // Setup the query for the collection to look for ingredients from the current user
      this.ingredients.query = new Parse.Query(Ingredient);
      this.ingredients.query.equalTo("user", Parse.User.current());
        
      this.ingredients.bind('add',     this.addOne);
      this.ingredients.bind('reset',   this.addAll);
      this.ingredients.bind('all',     this.render);

      // Fetch all the ingredient items for this user
      this.ingredients.fetch();

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
    
	/***********Render/Refresh List of Ingredients**********************/
    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
  
    render: function() {
      var activeStatus = this.ingredients.status().length;
      var status = this.ingredients.activeStatus().length;

      this.$('#ingredient-stats').html(this.statsTemplate({
        total:      this.ingredients.length,
        status:       status,
        activeStatus:  activeStatus
      }));

      this.delegateEvents();

      this.allCheckbox.checked = activeStatus;
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

    // Resets the filters to display all ingredients
    resetFilters: function() {
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#all").addClass("selected");
      this.addAll();
    },
	/**********Defines Previously Binded Events Related to Editing Item********/
    // Add a single ingredient item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
	
    addOne: function(ingredient) {
      var view = new IngredientView({model: ingredient});
      this.$("#ingredient-list").append(view.render().el);
    },

    // Add all items in the Ingredients collection at once.
    addAll: function(collection, filter) {
      this.$("#ingredient-list").html("");
      this.ingredients.each(this.addOne);
    },

    // Only adds some ingredients, based on a filtering function that is passed in
    addSome: function(filter) {
      var self = this;
      this.$("#ingredient-list").html("");
      this.ingredients.chain().filter(filter).each(function(item) { self.addOne(item) });
    },

    // If you hit return in the main input field, create new Ingredient model
    createOnEnter: function(e) {
      var self = this;
      if (e.keyCode != 13) return;

      this.ingredients.create({
        content: this.inputName.val(),
        price:   this.inputPrice.val(),
        order:   this.ingredients.nextOrder(),
        status:  true,
        user:    Parse.User.current(),
        ACL:     new Parse.ACL(Parse.User.current())
      });

      this.inputName.val('');
    
      this.resetFilters();
    },

    // Clear all inactive ingredient items, destroying their models.
    clearInactive: function() {
      _.each(this.ingredients.activeStatus(), function(ingredient){ ingredient.destroy(); });
      return false;
    },

    toggleAllInactive: function () {
      var status = this.allCheckbox.checked;
      this.ingredients.each(function (ingredient) { ingredient.save({'status': status}); });
    }
  });
  
  /************* Menuitem Item View***********************/

  // The DOM element for a Menuitem item...
  var MenuitemView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",
    

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.

    events: {
      "click .toggle"              : "toggleStatus",
      "dblclick label.menuitem-content" : "edit",
      "click .menuitem-destroy"   : "clear",
      "keypress .edit"      : "updateOnEnter",
      "blur .edit"          : "close"
    },

    // The MenuitemView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a Menuitem and a MenuitemView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
    },
    // Toggle the `"status"` state of the model.
    toggleStatus: function() {
      this.model.toggle();
    },
                                         
    // Re-render the contents of the menuitem item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.inputName = this.$('.edit');
      return this;
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.inputName.focus();
    },
                                         
     close: function() {
      this.model.save({content: this.inputName.val()});
      
      $(this.el).removeClass("editing");
    },
                                         
    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },
                                         
    // Close the `"editing"` mode, saving changes to the menuitem.
    //was save{(content:
    
    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
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
      "keypress #new-menuitem-name":  "createOnEnter",
      "click #clear-inactive": "clearInactive",
      "click #toggle-all": "toggleAllInactive",
      "click .log-out": "logOut",
      "click ul#filters a": "selectFilter"
    },

    el: ".content",

	// At initialization we bind to the relevant events on the `Menuitems`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting menuitems that might be saved to Parse.
    initialize: function() {
      var self = this;

      _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'toggleAllInactive', 'logOut', 'createOnEnter');

	/*************** Main menuitem management template**************/
//was #manage-todos-template
      this.$el.html(_.template($("#manage-menuitems-template").html()));
      
      this.inputName = this.$("#new-menuitem-name");
      this.inputCal = this.$("#new-menuitem-calories");
      this.inputPrice = this.$("#new-menuitem-price");
      this.inputDescript =this.$("#new-menuitem-descript");
      this.inputIngredientList = this.$("#new-menuitem-ingredientlist");
      this.allCheckbox = this.$("#toggle-all")[0];

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

      this.allCheckbox.checked = activeStatus;
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
    },

    // If you hit return in the main input field, create new Menuitem model
    createOnEnter: function(e) {
      var self = this;
      if (e.keyCode != 13) return;

      this.menuitems.create({
        content: this.inputName.val(),
        price:   this.inputPrice.val(),
        cal:   this.inputCal.val(),
        description: this.inputDescript.val(),
        order:   this.menuitems.nextOrder(),
        status:  true,
        user:    Parse.User.current(),
        ACL:     new Parse.ACL(Parse.User.current())
      });
		this.inputCal.val('');
      this.inputName.val('');
      this.inputPrice.val('');
      this.inputDescript.val('');
      this.resetFilters();
    },

    // Clear all inactive menuitem items, destroying their models.
    clearInactive: function() {
      _.each(this.menuitems.activeStatus(), function(menuitem){ menuitem.destroy(); });
      return false;
    },

    toggleAllInactive: function () {
      var status = this.allCheckbox.checked;
      this.menuitems.each(function (menuitem) { menuitem.save({'status': status}); });
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

 /**********Begin of ingredient App View********************************/
 var AppViewi = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    
    el: $("#ingredientapp"),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (Parse.User.current()) {
        new ManageIngredientsView();
      } else {
        new LogInView();
      }
    }
  });
  
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
  new AppViewi;
  //creates main Appview
  new AppView;

  //starts history log
  Parse.history.start();
});
/**********End of Function********************************/