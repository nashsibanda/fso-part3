const mongoose = require("mongoose");
const secrets = require("./config/secrets");

const password = secrets.mongoDbPass;
const name = process.argv[2] || null;
const number = process.argv[3] || null;

const url = `mongodb+srv://fso_user:${password}@fso-phonebook.iy6ey.mongodb.net/phonebookdb?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (name && number) {
  const newPerson = new Person({
    name,
    number,
  });
  newPerson.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else if (name || number) {
  console.log(
    "Both a name and number must be provided: node mongo.js <name> <number>"
  );
  mongoose.connection.close();
} else {
  Person.find().then(result => {
    result.forEach(person => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}
