/* 
--------------------------------------------------------------------------
*********   SCORM 1.2 Runtime Service Library Version 1.0  *************** 
--------------------------------------------------------------------------
	
	Author: Aris David P. Mantes
	Date: Sep 2018
	Version: 1.0
    
	
	** This library performs the basic functions of a SCORM Compliant LMS for SCORM Version 1.2
	** For List of Runtime Requirements  https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/#section-2
	** To envoke the library just call API = new SCORMLMS(elementJSONData);  
		- Note: The object name "API" is required by SCORM 1.2, as this is the name that SCORM Packages look for to begin communication with the Runtime Service
		- The data to be passed contains a JSON containing initial SCORM data from selected user
		
-----------------------------------------------------------------------------------------
*****************************************************************************************
-----------------------------------------------------------------------------------------
*/



//---------------------------------------------------------------------------------------------------------------------------//
//Initialize LMS Library and put it in a SCORM required Object called "API" 
//---------------------------------------------------------------------------------------------------------------------------//



function SCORMLMS(elJSON){


	// ----------------------------------------------------------
	//   Main Variables
	// ----------------------------------------------------------
	
	var firstRun = true;	
	var lmsConnectionActive = false;
	var completionStatus = "";
	var isLMSInitialized = false;
	var lastErrorNum = 0;
	var	lastErrorString = "";
	
	var curCallBackFunction = function(){};
	
	// -----------------------------------------------------------------------------------------
	//   Initialize SCORM Elements with JSON Object
	// -----------------------------------------------------------------------------------------
	
	var elementJSON;
	
	function validateJSONData(data){
		
		if(true){
			elementJSON = data;
		}else{
			elementJSON = {"cmi.core._children": "student_id, student_name, lesson_location, credit, lesson_status, entry, score, total_time, lesson_mode, exit, session_time" ,
						"cmi.core.student_id": "0000000-0000-0000-0000-00000000000" ,
						"cmi.core.student_name": "Anderson, Neo" ,
						"cmi.core.lesson_location": "" ,
						"cmi.core.credit": "" ,
						"cmi.core.lesson_status": "" ,
						"cmi.core.entry": "" ,
						"cmi.core.score_children": "cmi.core.score.raw, cmi.core.score.max, cmi.core.score.min" ,
						"cmi.core.score.raw": "" ,
						"cmi.core.score.max": "" ,
						"cmi.core.score.min": "" ,
						"cmi.core.total_time": "" ,
						"cmi.core.lesson_mode": "" ,
						"cmi.core.exit": "" ,
						"cmi.core.session_time": "" ,
						"cmi.student_data.mastery_score": "" ,
						"cmi.launch_data": "" ,
						"cmi.suspend_data": "" 
			};
		}
	}
	
	
	
	validateJSONData(elJSON);
	
	var validDataJSON = {					
						"cmi.core.lesson_location": "" ,				
						"cmi.core.lesson_status": ["passed", "completed", "failed", "incomplete", "browsed", "not attempted"] ,					
						"cmi.core.score.raw": "" ,
						"cmi.core.score.max": "" ,
						"cmi.core.score.min": "" ,						
						"cmi.core.exit": ["time-out", "suspend", "logout", ""] ,
						"cmi.core.session_time": ""						
				
	};
	
	//SCO should not be able to write to these elements
	var readOnlyElementsArr = ["cmi.core.student_id", "cmi.core.student_name", "cmi.core.credit", "cmi.core.entry", "cmi.core.score_children","cmi.core.total_time","cmi.core.lesson_mode", "cmi.student_data.mastery_score", "cmi.launch_data"];
	
	//SCO should not be able to read from these elements	
	var writeOnlyElementsArr = ["cmi.core.exit", "cmi.core.session_time"];
	 
	// -----------------------------------------------------------------------------------------
	//   Initialize Error Codes and Messages
	// -----------------------------------------------------------------------------------------
	 
	 
	 var errorJSON = {
		 "0": "",
		 "101": "No specific error code exists to describe the error. Use LMSGetDiagnostic for more information.",
		 "201": "Argument represents an invalid data model element or is otherwise incorrect",
		 "202": "LMSGetValue was called with a data model element name that ends in _children for a data model element that does not support the _children suffix.",
		 "203": "Data model element does not support count",
		 "301": "LMS not yet initialized. Please call API.LMSInitialize()",
		 "401": "Element not found",
		 "402": "Invalid set value, element is a keyword",
		 "403": "Element is read only",
		 "404": "Element is write only",
		 "405": "Invalid data format"		 
	 };
	 
	/*	
	•	cmi.core._children
	•	cmi.core.student_id
	•	cmi.core.student_name
	•	cmi.core.lesson_location
	•	cmi.core.credit
	•	cmi.core.lesson_status
	•	cmi.core.entry
	•	cmi.core.score
	•	cmi.core.total_time
	•	cmi.core.lesson_mode
	•	cmi.core.exit
	•	cmi.core.session_time
	•	cmi.student_data.mastery_score
	•	cmi.launch_data
	•	cmi.suspend_data
	
	*/

	//////////////   BEGIN SCO COMMUNICATION FUNCTIONS  ////////////////////////
	console.log(firstRun);
	this.LMSInitialize = function(){
		ResetErrorNum();
		//Let us check if this is the first run, if not, do not allow to Initialize again		 
		returnVal = true;
		if(firstRun){	
			console.log("First Run");
			 initializeFunctions();			
			returnVal =  "true";
		}else{
			console.log("false");
			returnVal =  "false";
		}
		
		FireCallback("INIT", returnVal, "");
		return returnVal;
	}
	
	
	 
	this.LMSFinish = function(){
		if(!CheckIfLMSInitialized()){return false;}	
		console.log("course called LMS Finish");
		newwindow.close();  //If you want to close the Course window when it calls LMSFinish
		
		FireCallback("FINISH", "", "");
		return true;
	}
	
	//  -------------------------------------------------------- //
	//              GET VALUE         
	//  -------------------------------------------------------- //
	this.LMSGetValue = function(element){
		ResetErrorNum();
		console.log("course getting value for " + element);
		if(!CheckIfLMSInitialized()){return false;}		
		if(!ElementExists(element)){return false;}
		
		//Check if element is WRITE ONLY, if YES, do not allow SCO to read value
		if(writeOnlyElementsArr.indexOf(element) > -1){
			//Element is WRITE ONLY
			console.log("Read only error");
			lastErrorNum = 404;
			return false;
		}
		
		
		var value = elementJSON[element];
	
		console.log("LMS Returned: " + value);
		
		FireCallback("GETDATA", element, "");
		return value;
	}
	
	
	
	
	
	//  -------------------------------------------------------- //
	//              SET VALUE         
	//  -------------------------------------------------------- //	
	this.LMSSetValue = function(element, value){
		ResetErrorNum();
		console.log("course trying to set " + element + " with value " + value);
		if(!CheckIfLMSInitialized()){return false;}
		
		if(!ElementExists(element)){return false;}
		
		
		//Check if element is READ ONLY, if YES, do not allow SCO to set value
		if(readOnlyElementsArr.indexOf(element) > -1){
			//Element is read only
			lastErrorNum = 403;
			return false;
		}
		
		elementJSON[element] = value;
		//firstRun = false;
		
		
		//Perform functions for certain conditions depending on element/value passed
		switch(element){
			
			//Check if the SCO passes a score and compare with mastery score (If it exists) to determine PASS/FAIL STATUS
			case "cmi.core.score.raw":
			
				var curMasterySscore = elementJSON["cmi.student_data.mastery_score"];
					if(curMasterySscore > ""){
						elementJSON["cmi.core.lesson_status"] = value >= curMasterySscore ? "passed" : "failed"; 
						console.log(elementJSON["cmi.core.lesson_status"]);
					}
				break;
			case "cmi.core.lesson_status":
				var acceptedValues = ["passed", "completed", "failed", "incomplete", "browsed", "not attempted",""];
				if(acceptedValues.indexOf(value) < 0){
					lastErrorNum = 201;
					return false;
				}
				break;
			
			case "cmi.core.exit":
				var acceptedValues = ["time-out", "suspend", "logout", ""];
				if(acceptedValues.indexOf(value) < 0){
					lastErrorNum = 201;
					return false;
				}
				break;	
				
			case "cmi.core.session_time":
				//Check Format of Time Here, should be 00:00:00 HRS, MINS, SECS
				//  format: CMITimeSpan - HHHH:MM:SS.SS. Hours have a minimum of 2 digits and a maximum of 4 digits.  Minutes shall consist of exactly 2 digits.  Seconds shall contain 2 digits, with an optional decimal point and 1 or 2 additional digit)
				
				break;

			case "cmi.core.score.min":
			case "cmi.core.score.max":
			case "cmi.core.score.raw":
				//Check if Value is a Number
				break;
				if(!isNaN(value)){ 
					lastErrorNum = 201;
					return false;
				}
				 
			
			default:
			break;			
		}
		
		
		FireCallback("SETDATA",element, value);
	  	console.log("saved element with value: " + value);
		return true;
	}
	
	
	
	this.LMSCommit = function(){
		if(!CheckIfLMSInitialized()){return false;}	
		FireCallback("COMMIT", "", "");
		return ___Commit();
		
	}
	
	
	
	// ////////      ERROR REPORTING      /////////////////////////////
	
	this.LMSGetLastError = function(){
		if(!CheckIfLMSInitialized()){return false;}	
		console.log("Geting Last Error LMSGetLastError : " + lastErrorNum);
		return lastErrorNum;
	}
	
	
	this.LMSGetErrorString = function(errNum){
		if(!CheckIfLMSInitialized()){return false;}	
		if(errorJSON[String(errNum)]){
			return errorJSON[String(errNum)];
		} 
	}
	
	
	this.LMSGetDiagnostic = function(errorNumber){
		if(!CheckIfLMSInitialized()){return false;}	
		console.log("LMSGetDiagnostic");
		return "";
	}


	
	
	
	// ------------------------------------------------------//
	//           SUPPLEMENTARY FUNCTIONS
	// ------------------------------------------------------//
	
	 
	function initializeFunctions(){
		isLMSInitialized = true;			
		console.log("course called LMSInitialize");
		
		//If this is first run of user ever, set completion to not attempted
		if(	elementJSON["cmi.core.entry"] == ""){
			//elementJSON["cmi.core.lesson_status"] = "not attempted";
		}
	}
	
	function ResetErrorNum(){
		lastErrorNum = 0;
	}
	
	function CheckIfLMSInitialized(){
		if(isLMSInitialized){
			return true;			
		}else{
			lastErrorNum = 301;
			return false;
		}
	}
	
	
	// ---- Checks if element is supported in this LIBRARY  ----//////
	function ElementExists(element){		 
		if(elementJSON[element] != undefined){			
			return true;
		}else{
			console.log("element doesnt exist");
			lastErrorNum = 401;
			return false;
		}
		
	}
	
	
	function ___Commit(){
		return "true";
	}
	
	/////    CALLBACKS      ////////////////////
	this.setCallBack = function(p){
		curCallBackFunction = p;
	}

	function FireCallback(type, elem, val){
		curCallBackFunction(type, elem, val);
	}	
	
	
	
	
}
