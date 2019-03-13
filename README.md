# scormlms
 
--------------------------------------------------------------------------
*********   SCORM 1.2 Runtime Service Library Version 1.0  *************** 
--------------------------------------------------------------------------

	** This library performs the basic functions of a SCORM Compliant LMS for SCORM Version 1.2
	** For List of Runtime Requirements  https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/#section-2
	** To envoke the library just call API = new SCORMLMS(elementJSONData);  
		- Note: The object name "API" is required by SCORM 1.2, as this is the name that SCORM Packages look for to begin communication with the Runtime Service
		- The data to be passed contains a JSON containing initial SCORM data from selected user
		
		
	Author: Aris David P. Mantes
	Date: Sep 2018
	Version: 1.0    


	HOW TO USE:
	
	Constructor:   
	var API = new SCORMLMS([elementJSONData]);  
	
	Note: The object name "API" is required by SCORM 1.2, as this is the name that SCORM Packages look for to begin communication with the Runtime Service
	

		
		
