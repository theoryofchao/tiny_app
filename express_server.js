var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": `http://lighthouselabs.ca`,
  "9sm4xK": `http://www.google.com`
};

app.get('/urls', (request, response) => {
  let templateVars = {urls: urlDatabase};
  response.render("urls_index", templateVars);
});

app.get('/urls/:id', (request, response) => {
  let templateVars = { shortUrl: request.params.id, urls: urlDatabase };
  response.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log("Server Started");
});
