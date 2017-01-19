const express = require("express");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const app = express();

const PORT = process.env.PORT || 8080;
const randomGenerator = require("./tiny_app_functions.js");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: '12345',
  maxAge: 1000 * 60 * 5 //5 minutes  
}));
app.set("view engine", "ejs");
app.use(methodOverride('_method'));

//"Database" of Users, 123456 for Testing
let registeredUsers = {};

//"Database" of urls, all under 123456
let urlDatabase = {};

//Redirects to Login or to URLs
app.get('/', (request, response) => {
  if(request.session.user_id) {
    response.redirect('/urls');
    return;
  }
  else{
    response.redirect('/login');
    return;
  }
});

//URLS page if logged in
app.get('/urls', (request, response) => {
  if(!request.session.user_id) {
    response.status(401).render('401_login');
    return;
  }

  let templateVars = {urls: urlDatabase, user_id: request.session.user_id};
  response.render("urls_index", templateVars);
});

//Registration Page
app.get('/register', (request, response) => {
  if(request.session.user_id) {
    response.redirect('/');  
    return;
  }
  response.render("registration"); 
});

//Login Page
app.get('/login', (request, response) => {
  if(request.session.user_id) {
    response.redirect('/');
    return;
  }
  response.render('login');
});

//Shortened URL Link
app.get('/u/:shortURL', (request, response) => {
  //If the response exists
  if(urlDatabase[request.params.shortURL] && urlDatabase[request.params.shortURL].url) {
    response.redirect(urlDatabase[request.params.shortURL].url);
  }
  else {
    let templateVars = {user_id: request.session.user_id, error_message: "This link don't exist yo!"};
    response.status(404).render("404", templateVars);
    return;
  }
});

//Page to Generate New URL
app.get('/urls/new', (request, response) => {
  if(!request.session.user_id) {
    response.status(401).render('401_login');
    return;
  }
  templateVars = {user_id: request.session.user_id}
  response.status(200).render("urls_new", templateVars);
});

//Page to Update URL
app.get('/urls/:id', (request, response) => {
  let templateVars;
  //if user not login in
  if(!request.session.user_id) {
    templateVars = {user_id: request.session.user_id};
    response.status(401).render("401_login", templateVars);
    return;
  }

  //if :id does not exist
  if(!urlDatabase[request.params.id]) {
    templateVars = {user_id: request.session.user_id, error_message: "This id does not exist."};
    response.status(404).render("404", templateVars);
    return; 
  }

  //if user does not own this url
  if(urlDatabase[request.params.id].user_id != request.session.user_id) {
    templateVars = {user_id: request.session.user_id, error_message: "You do not own this url."};
    response.status(403).render("403", templateVars);
    return;
  }

  templateVars = { shortUrl: request.params.id, urls: urlDatabase, user_id: request.session.user_id };
  response.render("urls_show", templateVars);
});

/*------------------------------------------------------------------------------------------*/

//Creates URL LINK
app.post('/urls', (request, response) => {

  if(request.session.user_id) {
    let templateVars = {user_id: request.session.user_id};
    response.status(401).render("401_login", templateVars);
  }

  var generatedURL = randomGenerator.generateRandomUrl();
  //Check to see if the entry is still available
  while(typeof urlDatabase[generatedURL] !== 'undefined') {
    generatedURL = urlGenerator();
  }
  //Save the URL to the database along with the user_id of the person who created it.
  urlDatabase[generatedURL] = {url : request.body.longURL, user_id : request.session.user_id};
  //Redirects back home
  response.redirect('/urls/'+generatedURL);
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

  response.status(403).render('login');
});

//Logout
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/');
});

//Default 404
app.use( (request, response) => {
  var templateVars = {user_id: request.session.user_id, error_message: "Something went wrong"};      
  response.render("404", templateVars);
  return;
});

app.listen(PORT, () => {
  console.log("Server Started");
});
