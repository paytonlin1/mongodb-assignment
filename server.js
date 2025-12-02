// server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const uri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const catBreedSchema = new mongoose.Schema({
  breed: { type: String, required: true, unique: true },
  origin_location: { type: String, required: true },
  origin_date: { type: String, required: true },
  colors_patterns: [String],
  popularity: { type: String, required: true }
});

const catNameSchema = new mongoose.Schema({
  letter: { type: String, required: true },
  names: [String]
});

// Create Models
const CatBreed = mongoose.model('CatBreed', catBreedSchema);
const CatName = mongoose.model('CatName', catNameSchema);

// Initialize Express
const app = express();
app.use(express.json());

// Routes
app.get('/', function (request, response) {
  response.json({
    message: "Please see the README.md for documentation",
  });
});

// GET all resources
app.get('/all', async function (request, response) {
  try {
    const breeds = await CatBreed.find({});
    const names = await CatName.find({});
    
    // Transform names into letter-keyed object
    const namesObj = {};
    names.forEach(doc => {
      namesObj[doc.letter] = doc.names;
    });
    
    response.json({
      catbreeds: breeds,
      catnames: namesObj
    });
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// GET all cat breeds
app.get('/catbreeds', async function (request, response) {
  try {
    const breeds = await CatBreed.find({});
    response.json(breeds);
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// GET cat breed by name
app.get('/catbreeds/:breed', async function (request, response) {
  try {
    const breed = request.params.breed;
    const search = await CatBreed.findOne({ 
      breed: new RegExp(`^${breed}$`, 'i') 
    });
    
    if (!search) {
      return response.status(404).json({ error: `Breed not found` });
    }
    
    response.json(search);
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// GET colors and patterns for a breed
app.get('/catbreeds/:breed/colors_patterns', async function (request, response) {
  try {
    const breed = request.params.breed;
    const search = await CatBreed.findOne({ 
      breed: new RegExp(`^${breed}$`, 'i') 
    });
    
    if (!search) {
      return response.status(404).json({ error: `Breed not found` });
    }
    
    response.json(search.colors_patterns);
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// GET all names
app.get('/catnames', async function (request, response) {
  try {
    const names = await CatName.find({});
    const namesObj = {};
    names.forEach(doc => {
      namesObj[doc.letter] = doc.names;
    });
    response.json(namesObj);
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// GET names by letter
app.get('/catnames/:letter', async function (request, response) {
  try {
    const letter = request.params.letter.toUpperCase();
    const doc = await CatName.findOne({ letter });
    
    if (!doc) {
      return response.status(404).json({ error: `No names found` });
    }
    
    response.json(doc.names);
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// POST new cat breed
app.post('/catbreeds', async function (request, response) {
  try {
    const { breed, origin_location, origin_date, colors_patterns, popularity } = request.body;
    
    // Validate input
    if (!breed || !origin_location || !origin_date || !colors_patterns || !popularity) {
      return response.status(400).json({ 
        error: `Please provide 'breed', 'origin_location', 'origin_date', 'colors_patterns', and 'popularity'.` 
      });
    }
    
    // Check if breed already exists
    const existing = await CatBreed.findOne({ 
      breed: new RegExp(`^${breed}$`, 'i') 
    });
    
    if (existing) {
      return response.status(409).json({ 
        error: `The breed ${breed} already exists in the list.` 
      });
    }
    
    // Create new breed
    const newBreed = new CatBreed({
      breed,
      origin_location,
      origin_date,
      colors_patterns,
      popularity
    });
    
    await newBreed.save();
    
    response.status(201).json({
      message: `The breed ${breed} was added successfully.`,
      entry: newBreed
    });
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// POST new cat name
app.post('/catnames', async function (request, response) {
  try {
    const { name } = request.body;
    
    // Validate input
    if (!name || typeof name !== 'string') {
      return response.status(400).json({ error: `Name is not valid.` });
    }
    
    const letter = name[0].toUpperCase();
    
    // Find or create letter document
    let doc = await CatName.findOne({ letter });
    
    if (!doc) {
      doc = new CatName({ letter, names: [] });
    }
    
    // Check if name exists
    if (doc.names.includes(name)) {
      return response.status(400).json({ error: `Name already exists.` });
    }
    
    // Add name
    doc.names.push(name);
    await doc.save();
    
    response.status(201).json({
      message: `The name ${name} was added successfully`,
      entry: name
    });
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// PUT update an existing breed
app.put('/catbreeds/:breed', async function (request, response) {
  try {
    const breedName = request.params.breed;
    const { origin_date, origin_location, colors_patterns, popularity } = request.body;
    
    // Find breed
    const breed = await CatBreed.findOne({ 
      breed: new RegExp(`^${breedName}$`, 'i') 
    });
    
    if (!breed) {
      return response.status(404).json({ 
        error: `Breed ${breedName} not found.` 
      });
    }
    
    // Update fields
    if (origin_date) breed.origin_date = origin_date;
    if (origin_location) breed.origin_location = origin_location;
    if (colors_patterns) breed.colors_patterns = colors_patterns;
    if (popularity) breed.popularity = popularity;
    
    await breed.save();
    
    response.json({
      message: `Breed ${breed.breed} updated successfully.`,
      entry: breed
    });
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// PUT update an existing name
app.put('/catnames/:letter/:oldName', async function (request, response) {
  try {
    const letter = request.params.letter.toUpperCase();
    const oldName = request.params.oldName;
    const { newName } = request.body;
    
    // Validate input
    if (!newName || typeof newName !== 'string') {
      return response.status(404).json({ error: `Name not valid` });
    }
    
    // Find letter document
    const doc = await CatName.findOne({ letter });
    
    if (!doc) {
      return response.status(404).json({ 
        error: `No names found under letter ${letter}.` 
      });
    }
    
    // Find old name index
    const index = doc.names.indexOf(oldName);
    if (index === -1) {
      return response.status(404).json({ 
        error: `Name ${oldName} not found under ${letter}.` 
      });
    }
    
    // Check for duplicate
    if (doc.names.includes(newName)) {
      return response.status(409).json({ 
        error: `The name ${newName} already exists under ${letter}.` 
      });
    }
    
    // Update name
    doc.names[index] = newName;
    await doc.save();
    
    response.json({
      message: `The name ${oldName} was updated successfully to ${newName}.`,
      entry: doc.names
    });
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// DELETE a breed
app.delete('/catbreeds/:breed', async function (request, response) {
  try {
    const breedName = request.params.breed;
    
    const deletedBreed = await CatBreed.findOneAndDelete({ 
      breed: new RegExp(`^${breedName}$`, 'i') 
    });
    
    if (!deletedBreed) {
      return response.status(404).json({ 
        error: `Breed '${breedName}' not found.` 
      });
    }
    
    response.json({
      message: `Breed '${deletedBreed.breed}' deleted successfully.`,
      entry: deletedBreed
    });
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

// DELETE a name
app.delete('/catnames/:letter/:name', async function (request, response) {
  try {
    const letter = request.params.letter.toUpperCase();
    const name = request.params.name;
    
    // Find letter document
    const doc = await CatName.findOne({ letter });
    
    if (!doc) {
      return response.status(404).json({ 
        error: `No names found under letter ${letter}.` 
      });
    }
    
    // Find name index
    const index = doc.names.indexOf(name);
    if (index === -1) {
      return response.status(404).json({ 
        error: `Name ${name} not found under ${letter}.` 
      });
    }
    
    // Remove name
    const deletedName = doc.names.splice(index, 1)[0];
    
    // Delete document if no names left
    if (doc.names.length === 0) {
      await CatName.deleteOne({ letter });
    } else {
      await doc.save();
    }
    
    response.json({
      message: `Name ${deletedName} was successfully deleted from ${letter}.`,
      entry: deletedName
    });
  } catch (error) {
    response.status(500).json({ error: 'Database error' });
  }
});

const listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});