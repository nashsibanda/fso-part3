const mongoose = require("mongoose");

const name = process.argv[2] || null;
const number = process.argv[3] || null;

const url = process.env.MONGODB_URI;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(result => {
    console.log("Connected to MongoDB!");
  })
  .catch(error => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model("Person", personSchema);

module.exports = Person;

// if (name && number) {
//   const newPerson = new Person({
//     name,
//     number,
//   });
//   newPerson.save().then(result => {
//     console.log(`added ${name} number ${number} to phonebook`);
//     mongoose.connection.close();
//   });
// } else if (name || number) {
//   console.log(
//     "Both a name and number must be provided: node mongo.js <name> <number>"
//   );
//   mongoose.connection.close();
// } else {
//   Person.find().then(result => {
//     result.forEach(person => {
//       console.log(person.name, person.number);
//     });
//     mongoose.connection.close();
//   });
// }
