var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var urlGenerator = require("./tiny_app_functions.js");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": `http://lighthouselabs.ca`,
  "9sm4xK": `http://www.google.com`
};

app.get('/urls', (request, response) => {
  let templateVars = {urls: urlDatabase};
  response.render("urls_index", templateVars);
});


app.get('/urls/new', (request, response) => {
  response.render("urls_new");
});

app.get('/urls/:id', (request, response) => {
  let templateVars = { shortUrl: request.params.id, urls: urlDatabase };
  response.render("urls_show", templateVars);
});

app.post('/urls', (request, response) => {
  console.log(request.body);
  response.send("OKAY!");
});

app.listen(PORT, () => {
  console.log("Server Started");
});
