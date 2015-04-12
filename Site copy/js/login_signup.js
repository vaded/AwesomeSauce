

/************************************************************************/
/**************************CURTIAN OPEN**********************************/
/************************************************************************/


$(function() {
/**************************PROLOG**********************************/
  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("aXmHuEt5s8gAoUUjEbck18M7xbrKDNFP60OdVGyr",
                   "ESvCa0f5dbLZ21HIEfSqIrWmm5EHEEFPaWZW29je");

  

  
/**************************ACT TWO: VIEWS**********************************/

  

/****************Begin Application View***************************/

  // The main view that lets a user manage their menuitem items
  var ManageLoginView = Parse.View.extend({

    // Delegated events for creating new items, and clearing inactive ones.
	//was new-todo, clear-completed/clearCompleted, toggleAllComplete
    events: {
      "click .log-out": "logOut",
    },

    el: ".contentuser",
    
	/*******************Log Out Routine***************************/
    // Logs out the user and shows the login view
    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      delete this;
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
    el: ".contentlogin",
    
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
    //was menuitemapp
    el: $("#startview"),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (Parse.User.current()) {
        new LoginSignup();
      } else {
        new LogInView();
      }
    }
  });
/**********End of Main App View********************************/

/*******************************************************************/
/**************************FINALE!**********************************/
/*******************************************************************/

  //creates main Appview
  new AppView;
  //starts history log
  Parse.history.start();
});
/**********End of Function********************************/