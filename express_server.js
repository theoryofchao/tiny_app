const express = require("express");
const app = express();
const bcrypt = require('bcrypt');

var PORT = process.env.PORT || 8080;
const randomGenerator = require("./tiny_app_functions.js");
const bodyParser = require("body-parser");
let cookieSession = require("cookie-session");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: '12345',
  maxAge: 1000 * 60 * 5 //5 minutes  
}));
app.set("view engine", "ejs");

//"Database" of Users, 123456 for Testing
var registeredUsers = {};

//"Database" of urls, all under 123456
var urlDatabase = {
    'b2xVn2': {
                'url' : 'http://lighthouselabs.ca',
                'user_id' : '123456'
              },
    "9sm4xK": {
                'url' : 'http://www.google.com',
                'user_id' : '123456'
              },
};

//Home Page
app.get('/', (request, response) => {
  console.log( request.session.user_id);  //TODO: remove later
  var templateVars = {urls: urlDatabase, user_id: request.session.user_id};
  response.render("urls_index", templateVars);
});

//Also Home Page
app.get('/urls', (request, response) => {
  let templateVars = {urls: urlDatabase, user_id: request.session.user_id};
  response.render("urls_index", templateVars);
});

//Registration Page
app.get('/register', (request, response) => {
  response.render("registration"); 
});

//Login Page
app.get('/login', (request, response) => {
  response.render('login');
});

//Shortened URL Link
app.get('/u/:shortURL', (request, response) => {
  if(request.params.shortURL !== 'undefined') {
    response.redirect(urlDatabase[request.params.shortURL].url);
  }
  else {
    response.redirect("/404");
  }
});

//Page to Generate New URL
app.get('/urls/new', (request, response) => {
  templateVars = {user_id: request.session.user_id}
  response.render("urls_new", templateVars);
});

//Page to Update URL
app.get('/urls/:id', (request, response) => {
  if(urlDatabase[request.params.id].user_id !== request.session.user_id){
    response.redirect("/401");
    return;
  }


  let templateVars = { shortUrl: request.params.id, urls: urlDatabase, user_id: request.session.user_id };
  response.render("urls_show", templateVars);
});

//401 Page
app.get('/401', (request, response) => {
  response.render("401");
});

//404 Page
app.get('/404', (request, response) => {
  response.render("404");
});

//404 placed at bottom in case all top cases were unable to find your location
/*app.get('/:incorrecturl', (request, response) => {
  response.render("404");
});*/

/*------------------------------------------------------------------------------------------*/

//Creates URL LINK
app.post('/urls/new', (request, response) => { 
  var generatedURL = randomGenerator.generateRandomUrl();
  //Check to see if the entry is still available
  while(typeof urlDatabase[generatedURL] !== 'undefined') {
    generatedURL = urlGenerator();
  }
  //Save the URL to the database along with the user_id of the person who created it.
  urlDatabase[generatedURL] = {url : request.body.longURL, user_id : request.session.user_id};
  //Redirects back home
  response.redirect('/');
});

//Updates URL Link
app.post('/urls/:id', (request, response) => {
  if(typeof request.session.user_id !== 'undefined') {
    urlDatabase[request.params.id].url = request.body.URLToUpdate;
    response.redirect('/');
    return;
  }
});

//Deletes a URL Link
app.post('/urls/:shortURL/delete', (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect('/');
});

//Registration
app.post('/register', (request, response) => {
  var username = request.body.username;
  var password = bcrypt.hashSync(request.body.password, 10);
  var generatedId = randomGenerator.generateRandomId();
  console.log(password); 
  //Check to see if email is already taken
  for (var id in registeredUsers) {
    if(registeredUsers[id].username === username) {
     response.status(400).send('Sorry this email is already taken');
     return;
    }
  }

  //Check to see if the randomly generated id is already taken (unlikely)
  while(typeof registeredUsers[generatedId] !== 'undefined') {
    generatedId = randomGenerator.generateRandomId();
    console.log('test');
  }

  //The "Database" enters the user information and a cookie is generated for the user that lasts 100 seconds
  registeredUsers[generatedId] = {id: generatedId, username: username, password: password};
  request.session.user_id = generatedId;
  response.redirect('/');
});

//Login
app.post('/login', (request, response) => {
  var username = request.body.username;
  var password = request.body.password;

  //Check to see if user credentials, then redirects back to home page if so
  for(var id in registeredUsers) {
    if((registeredUsers[id].username === username) && bcrypt.compareSync(password,registeredUsers[id].password)) {
      request.session.user_id = registeredUsers[id].id;
      response.redirect('/');
      return;
    }
  }

  response.status(403).send('Incorrect email or password supplied');
});

//Logout
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/');
});

//Default 404
app.use( (request, response) => {
  var templateVars = {user_id: request.session.user_id};      
  response.render("404", templateVars);
});

app.listen(PORT, () => {
  console.log("Server Started");
});
