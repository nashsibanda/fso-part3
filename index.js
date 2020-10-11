const express = require("express");
const app = express();
const morgan = require("morgan");

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

let contacts = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

const infoHtml = `
  <p>Phonebook has info for ${contacts.length} people</p>
  <p>${Date().toLocaleString()}</p>
`;

app.get("/api/persons", (req, res) => {
  res.json(contacts);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number.parseInt(req.params.id);
  const contact = contacts.find(contact => contact.id === id);
  if (contact) return res.json(contact);
  res.status(404).json({ error: `Contact with id ${id} not found` });
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number.parseInt(req.params.id);
  const contact = contacts.find(contact => contact.id === id);

  if (contact) {
    contacts = contacts.filter(contact => contact.id !== id);
    return res.json(contact);
  } else {
    res.status(404).json({ error: `Contact with id ${id} not found` });
  }
});

app.post("/api/persons", (req, res) => {
  const newContactId =
    contacts.length > 0
      ? Math.max(...contacts.map(contact => contact.id)) + 1
      : 1;

  const newContact = req.body;
  newContact.id = newContactId;

  if (!newContact.name) {
    return res.status(422).json({ error: "Name field must be included" });
  } else if (!newContact.number) {
    return res.status(422).json({ error: "Number field must be included" });
  } else if (contacts.find(x => x.name === newContact.name)) {
    return res.status(422).json({ error: "Name must be unique" });
  } else {
    contacts = contacts.concat(newContact);
    res.json(newContact);
  }
});

app.get("/info", (req, res) => res.send(infoHtml));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
