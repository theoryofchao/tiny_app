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

//Home Page
app.get('/', (request, response) => {
  let templateVars = {urls: urlDatabase};
  response.render("urls_index", templateVars);
});

//Also Home Page
app.get('/urls', (request, response) => {
  let templateVars = {urls: urlDatabase};
  response.render("urls_index", templateVars);
});

//Shortened URL Link
app.get('/u/:shortURL', (request, response) => {
  if(request.params.shortURL !== 'undefined') {
    response.redirect(urlDatabase[request.params.shortURL]);
  }
  else {
    response.render("404");
  }
});

//Page to Generate New URL
app.get('/urls/new', (request, response) => {
  response.render("urls_new");
});

//Page to Update URL
app.get('/urls/:id', (request, response) => {
  let templateVars = { shortUrl: request.params.id, urls: urlDatabase };
  response.render("urls_show", templateVars);
});

//404 placed at bottom in case all top cases were unable to find your location
app.get('/:incorrecturl', (request, response) => {
  response.render("404");
});

/*------------------------------------------------------------------------------------------*/

//Updates URL Link
app.post('/urls/:id', (request, response) => {
  urlDatabase[request.params.id] = request.body.URLToUpdate;
  response.redirect('/');
});

//Deletes a URL Link
app.post('/urls/:shortURL/delete', (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect('/');
});

app.listen(PORT, () => {
  console.log("Server Started");
});
