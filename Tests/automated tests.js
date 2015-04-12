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
		function waiting(){ 
				
				document.documentURI = document.baseURI;
				console.log(document.documentURI);
				
				document.getElementById("name").value = "Nick Renaldo";
				document.getElementById("email").value = "nickyr@gmail.com";	
				document.getElementById("address").value = "123 this street";
				document.getElementById("phone").value = "1234567890";
				document.getElementById("password").value = "partykid";
				document.getElementById("signup-button").click();
		}
		function registerTest(){
			document.getElementById("registerButton").click();
			setTimeout(waiting(), 10000);
		}
		
		registerTest();