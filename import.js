// only ran once to import data from JSON files
const mongoose = require('mongoose');
require('.env').config();

const uri = process.env.MONGODB_URI;

const catbreedsJSON = require('./catbreeds.json');
const catnamesJSON = require('./catnames.json');

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

const CatBreed = mongoose.model('CatBreed', catBreedSchema);
const CatName = mongoose.model('CatName', catNameSchema);

async function importData() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB!');

    // Clear existing data
    await CatBreed.deleteMany({});
    await CatName.deleteMany({});
    console.log('Cleared existing data');

    // Import cat breeds
    if (Array.isArray(catbreedsJSON)) {
      await CatBreed.insertMany(catbreedsJSON);
      console.log(`Imported ${catbreedsJSON.length} cat breeds`);
    }

    // Import cat names
    const namesDocs = Object.keys(catnamesJSON).map(letter => ({
      letter: letter,
      names: catnamesJSON[letter]
    }));
    
    await CatName.insertMany(namesDocs);
    console.log(`Imported names for ${namesDocs.length} letters`);
    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

importData();