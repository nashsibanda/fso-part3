require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");

const Person = require("./models/person");

app.use(express.json());
app.use(
  morgan((tokens, req, res) =>
    [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ")
  )
);
app.use(express.static("build"));

const infoHtml = length => `
  <p>Phonebook has info for ${length} people</p>
  <p>${Date().toLocaleString()}</p>
`;

app.get("/api/persons", (req, res) => {
  Person.find().then(persons => res.json(persons));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(contact => {
      console.log("HI");
      if (contact) {
        res.json(contact);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(deletedContact => {
      res.json(deletedContact);
    })
    .catch(error => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const newContact = new Person(req.body);

  if (!newContact.name) {
    return res.status(422).json({ error: "Name field must be included" });
  } else if (!newContact.number) {
    return res.status(422).json({ error: "Number field must be included" });
  } else {
    newContact
      .save()
      .then(newRecord => res.json(newRecord))
      .catch(error => next(error));
  }
});

app.put("/api/persons/:id", (req, res, next) => {
  const { body } = req;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then(updatedContact => res.json(updatedContact))
    .catch(error => next(error));
});

app.get("/info", (req, res) => {
  Person.find().then(contacts => res.send(infoHtml(contacts.length)));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
