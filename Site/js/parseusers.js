(function($){
	Parse.initialize("KOUvrLMv1oAp2DFoSJQpvl0VIqQKXOYk9HTtRVII", "xBi5mgy6McXhZtUwJXdyS20uVSl6N555lWJTaDyF");

	
	function signUp(e) {
			console.log("hello");
			var user = new Parse.User();
			//var fullname = document.getElementById("name").value;
			var username = document.getElementById("email").value;
			//var address = document.getElementById("address").value;
			//var phone = document.getElementById("phone").value;
			var pass = document.getElementById("password").value;
			//console.log(String("fullname"));

			user.set("username", username);
			user.set("password", pass);
			//user.set("fullname", String(fullname));

			//user.set("address", address);
			//user.set("phone", phone);
			//user.set("name", name);

			user.signUp(null, {
			//Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
			success: function(user) {
			  console.log("The deed is done");
			},

			error: function(user, error) {
			  console.log("Error has occured");
			  console.log("Error: " + error.code + " " + error.message);
			}
		});
	}
})(jQuery);