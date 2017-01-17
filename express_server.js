var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const urlGenerator = require("./tiny_app_functions.js");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": `http://lighthouselabs.ca`,
  "9sm4xK": `http://www.google.com`
};

app.get('/u/:shortURL', (request, response) => {
  if(request.params.shortURL !== 'undefined') {
    response.redirect(urlDatabase[request.params.shortURL]);
  }
  else {
    response.render("404");
  }
});

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


app.get('/:incorrecturl', (request, response) => {
  response.render("404");
});

app.post('/urls', (request, response) => {
  var shortUrl = urlGenerator();
  urlDatabase[shortUrl] = request.body.longURL;
  console.log("Added new URL");
  console.log(urlDatabase);
  response.send("OKAY!");
});

app.listen(PORT, () => {
  console.log("Server Started");
});
