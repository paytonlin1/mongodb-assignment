Express.js CATalogAPI
=================
This API has works as a catalog of cat breeds and cat names.
MongoDB Server: https://cloud.mongodb.com/v2/692ee876a7488b7751e4eb46#/metrics/replicaSet/692ee941b56cc97e82d032e1/explorer/catDatabase

* GET all - retrieves all information

* GET catbreeds/:breed - retrieves information (breed name, origin location, origin date, colors and patterns, and popularity) about the cat breed
* GET catbreed/:breed/colors_patterns - retrieves the array of colors and patterns of a given breed
* POST catbreeds - creates a new cat breed object
* PUT catbreeds/:breed - updates cat breed with new information (breed cannot be changed)
    * JSON format is "origin_location": ":input"...
* DELETE catbreeds/:breed - deletes the specified breed
    * CASE SENSITIVE

* GET catnames/:letter - retrieves cat names based on letter
* POST catnames - creates a new cat name and adds it to the corresponding letter array
* PUT catnames/:letter/:oldName - updates oldName with newName 
    * JSON format is "newName": ":input" CASE-SENSITIVE
* DELETE catnames/:letter/:name - deletes the specified cat name
    * CASE SENSITIVE

to run use 'node server.js'