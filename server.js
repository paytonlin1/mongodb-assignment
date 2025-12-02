// server.js
// where your node app starts
//MongoDB Connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://pal109:0rangesm0ng0@cluster0.vfvxquk.mongodb.net/?appName=Cluster0";
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://pal109:0rangesm0ng0@cluster0.vfvxquk.mongodb.net/?appName=Cluster0');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// init project
const express = require('express');
const app = express();
app.use(express.json()); // this allow express to read JSON from the body of the HTML request


//load my .json file of catbreeds and catnames
const catbreedsJSON = require('./catbreeds.json')
const catnamesJSON = require('./catnames.json');

const catbreedsSchema = new mongoose.Schema({
  name: String,
  origin_location: String,
  origin_date: String,
  colors_patterns: String,
  popularity: Number
})

const catbreed = mongoose.model('CatBreed', catbreedsSchema)
//define your routes here. don't forget about error handling
//GET REQUESTS
app.get('/', function (request, response) {
  response.json({
    message: "Please see the README.md for documentation",
  })
});

//GET all resources
app.get('/all', function (request, response) {
  response.json({
    catbreeds: catbreeds,
    catnames: catnames
  });
});

//GET all cat breeds
app.get('/catbreeds', async function (request, response) {
  try {
    const breed = request.params.breed;
    const search = await.catbreed.find({});
    response.json(breeds);
  } catch(error) {
    response.status(500).json({ error: 'Database error' })
  }

});

//GET cat breeds by name
app.get('/catbreeds/:breed', function (request, response) {
  const breed = request.params.breed.toLowerCase();
  const search = catbreeds.find(b => b.breed.toLowerCase() === breed)
  if (!search) {
    return response.status(404).json({ error: `Breed not found` });
  }

  response.json(search)
});

//GET path for colors and patterns
app.get('/catbreeds/:breed/colors_patterns', function (request, response) {
  const breed = request.params.breed.toLowerCase();

  const search = catbreeds.find(b => b.breed.toLowerCase() === breed)
  if (!search) {
    return response.status(404).json({ error: `Breed not found` });
  }

  response.json(search.colors_patterns)
});

//GET all names
app.get('/catnames', function (request, response) {
  response.json(catnames)
});

//GET path for specific letters
app.get('/catnames/:letter', function (request, response) {
  const letter = request.params.letter.toUpperCase();

  const names = catnames[letter];
  if (!names) {
    return response.status(404).json({ error: `No names found` })
  }

  response.json(names);
});

//POST new cat breed
app.post('/catbreeds', function (request, response) {
  const { breed, origin_location, origin_date, colors_patterns, popularity } = request.body;

  //validate input
  if (!breed || !origin_location || !origin_date || !colors_patterns || !popularity) {
    return response.status(400).json({ error: `Please provide 'breed', 'origin_location', 'origin_date', 'colors_patterns', and 'popularity'.` });
  }

  //check if breed already exists
  const check = catbreeds.some(b => b.breed.toLowerCase() === breed.toLowerCase());
  if (check) {
    return res.status(409).json({ error: `The breed ${breed} already exists in the list.` });
  }

  //add new word (in-memory)
  const newBreed = {
    breed,
    origin_location,
    origin_date,
    colors_patterns,
    popularity
  };

  catbreeds.push(newBreed)

  response.status(201).json({
    message: `The breed ${breed} was added successfully.`,
    entry: newBreed
  });
});

//POST new cat name
app.post('/catnames', function (request, response) {
  const { name } = request.body;

  //validate input
  if (!name || typeof name !== 'string') {
    return response.status(400).json({ error: `Name is not valid.` })
  }

  //determine first letter
  const letter = name[0].toUpperCase();

  //create new array if letter does not exist
  if (!catnames[letter]) {
    catnames[letter] = [];
  }

  //check if name exists 
  if (catnames[letter].includes(name)) {
    return response.status(400).json({ error: `Name already exists.` })
  }

  //add name (in-memory)
  catnames[letter].push(name);

  response.status(201).json({
    message: `The name ${name} was added successfully`,
    entry: name
  });
});

//PUT update an existing breed
app.put('/catbreeds/:breed', function (request, response) {
  const search = request.params.breed.toLowerCase();
  const { origin_date, origin_location, colors_patterns, popularity } = request.body;

  //find breed
  const index = catbreeds.findIndex(b => b.breed.toLowerCase() === search)
  if (index === -1) {
    return response.status(404).json({ error: `Breed ${request.params.breed} not found.` })
  }

  //check inputs
  if (origin_date) catbreeds[index].origin_date = origin_date;
  if (origin_location) catbreeds[index].origin_location = origin_location;
  if (colors_patterns) catbreeds[index].colors_patterns = colors_patterns;
  if (popularity) catbreeds[index].popularity = popularity;

  response.json({
    message: `Breed ${catbreeds[index].breed} updated successfully.`,
    entry: catbreeds[index]
  });
});

//PUT update an existing name
app.put('/catnames/:letter/:oldName', function (request, response) {
  const letter = request.params.letter.toUpperCase();
  const oldName = request.params.oldName;
  const { newName } = request.body;

  //validate input
  if (!newName || typeof newName !== 'string') {
    return response.status(404).json({ error: `Name not valid` });
  }

  //check letter
  if (!catnames[letter]) {
    return response.status(404).json({ error: `No names found under letter ${letter}.` });
  }

  //index oldName
  const index = catnames[letter].indexOf(oldName);
  if (index === -1) {
    return response.status(404).json({ error: `Name ${oldName} not found under ${letter}.` });
  }

  //check name is not duplicate
  if (catnames[letter].includes(newName)) {
    return response.status(409).json({ error: `The name ${newName} already exists under ${letter}.` });
  }

  catnames[letter][index] = newName;
  response.json({
    message: `The name ${oldName} was updated successfully to ${newName}.`,
    entry: catnames[letter]
  });
});

// DELETE a breed
app.delete('/catbreeds/:breed', function (request, response) {
  const breed = request.params.breed.toLowerCase();

  //index breed
  const index = catbreeds.findIndex(b => b.breed.toLowerCase() === breed);

  if (index === -1) {
    return response.status(404).json({ error: `Breed '${request.params.breed}' not found.` });
  }

  //remove from array
  const deletedBreed = catbreeds.splice(index, 1)[0];

  response.json({
    message: `Breed '${deletedBreed.breed}' deleted successfully.`,
    entry: deletedBreed
  });
});

//DELETE a name
app.delete('/catnames/:letter/:name', function (request, response) {
  const letter = request.params.letter.toUpperCase();
  const name = request.params.name;

  //check letter
  if (!catnames[letter]) {
    return response.status(404).json({ error: `No names found under letter ${letter}.` });
  }

  //index name
  const index = catnames[letter].indexOf(name);
  if (index === -1) {
    return response.status(404).json({ error: `Name ${name} not found under ${letter}.` });
  }

  //delete name
  const deletedName = catnames[letter].splice(index, 1)[0];

  //delete letter if array is empty
  if (catnames[letter].length == 0) {
    delete catnames[letter];
  }

  response.json({
    message: `Name ${deletedName} was successfully deleted from ${letter}.`,
    entry: deletedName
  })
});

// listen for requests :)
const listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
