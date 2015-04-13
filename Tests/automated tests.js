<SCRIPT LANGUAGE="JavaScript">

//all tests should be copied to javascipt console in chrome.
function loginTest(){												//run from index.html
	document.getElementById("email").value = "partykid@swbell.net";	//chosen because it is 
																	//integral to the system
	document.getElementById("password").value = "partykid";
	document.getElementById("loginButton").click();
}
loginTest();


//this test is special in that it will only work once, creating a user will make it so that
//the same user cannot be added twice. the email must be changed for each test or the 
//parse entry must be deleted each time this test is run. it was chosen to because it is an 
//integral part of the system and it adds data to the database
//this test is to be run from register.html
function registerTest(){
	document.getElementById("name").value = "Nick Renaldo";
	document.getElementById("email").value = "nickyreginald@gmail.com";	
	document.getElementById("address").value = "123 this street";
	document.getElementById("phone").value = "1234567890";
	document.getElementById("password").value = "partykid";
	document.getElementById("signup-button").click();
}

registerTest();


//we chose this test because again it changes values in the database
//log in (using the above test if you like) first and be from any 
function changeUserInfo(){
	document.getElementById("namei").value = "Eli Ricardo";
	document.getElementById("emaili").value = "eli@gmail.com";	
	document.getElementById("addressi").value = "123 the street";
	document.getElementById("phonei").value = "0987654321";
	document.getElementById("updateInfo").click();
}

changeUserInfo();
		
	