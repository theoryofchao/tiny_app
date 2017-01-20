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
  if(registeredUsers[request.session.user_id]) {
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
  if(!registeredUsers[request.session.user_id]) {
    response.status(401).render('401_login');
    return;
  }

  let templateVars = {urls: urlDatabase, email: registeredUsers[request.session.user_id].username, user_id: request.session.user_id};
  response.render("urls_index", templateVars);
});

//Registration Page
app.get('/register', (request, response) => {
  if(registeredUsers[request.session.user_id]) {
    response.redirect('/');  
    return;
  }

  response.render("registration"); 
});

//Login Page
app.get('/login', (request, response) => {
  if(registeredUsers[request.session.user_id]) {
    response.redirect('/');
    return;
  }
  response.render('login');
});

//Shortened URL Link
app.get('/u/:shortURL', (request, response) => {
  //If the response exists
  if(urlDatabase[request.params.shortURL] && urlDatabase[request.params.shortURL].url) {
    urlDatabase[request.params.shortURL].num_visit++;
    if(!request.session.uniq){
      request.session.uniq = randomGenerator.generateRandomId();
      console.log(request.session.uniq);
      urlDatabase[request.params.shortURL].num_unique_visit.push(request.session.uniq);
    }
    response.redirect(urlDatabase[request.params.shortURL].url);
  }
  else {
    let templateVars = {user_id: request.session.user_id, email: registeredUsers[request.session.user_id].username, error_message: "This link don't exist yo!"};
    response.status(404).render("404", templateVars);
    return;
  }
});

//Page to Generate New URL
app.get('/urls/new', (request, response) => {
  if(!registeredUsers[request.session.user_id]) {
    response.status(401).render('401_login');
    return;
  }
  templateVars = {user_id: request.session.user_id, email: registeredUsers[request.session.user_id].username}
  response.status(200).render("urls_new", templateVars);
});

//Page to Update URL
app.get('/urls/:id', (request, response) => {
  let templateVars;
  //if user not login in
  if(!registeredUsers[request.session.user_id]) {
    templateVars = {user_id: request.session.user_id , email: ''};
    response.status(401).render("401_login", templateVars);
    return;
  }

  //if :id does not exist
  if(!urlDatabase[request.params.id]) {
    templateVars = {user_id: request.session.user_id , email: registeredUsers[request.session.user_id].username, error_message: "This id does not exist."};
    response.status(404).render("404", templateVars);
    return; 
  }

  //if user does not own this url
  if(urlDatabase[request.params.id].user_id != request.session.user_id) {
    templateVars = {user_id: request.session.user_id, email: registeredUsers[request.session.user_id].username, error_message: "You do not own this url."};
    response.status(403).render("403", templateVars);
    return;
  }

  templateVars = { shortUrl: request.params.id, urls: urlDatabase, user_id: request.session.user_id, email: registeredUsers[request.session.user_id].username };
  response.render("urls_show", templateVars);
});

/*------------------------------------------------------------------------------------------*/

//Creates URL LINK
app.post('/urls', (request, response) => {

  if(!registeredUsers[request.session.user_id]) {
    let templateVars = {user_id: request.session.user_id};
    response.status(401).render("401_login", templateVars);
    return;
  }

  let generatedURL = randomGenerator.generateRandomUrl();
  //Check to see if the entry is still available
  while(typeof urlDatabase[generatedURL] !== 'undefined') {
    generatedURL = urlGenerator();
  }
  //Save the URL to the database along with the user_id of the person who created it.
  var date = new Date();
  var time = date.getTime();

  urlDatabase[generatedURL] = {url : request.body.longURL, user_id : request.session.user_id, date : time , num_visit : 0 , num_unique_visit : [] };
  //Redirects back home
  console.log(urlDatabase); 
  response.redirect('/urls/'+generatedURL);
});

//Updates URL Link
app.post('/urls/:id', (request, response) => {
  if(!registeredUsers[request.session.user_id]){
    response.status(401).render("401_login");
    return;
  }

  //if url with :id does not exist
  if(!urlDatabase[request.params.id]){
    let templateVars = {user_id: request.session.user_id, email: registeredUsers[request.session.user_id].username, error_message: "Url does not exist"};
    response.status(404).render("404", templateVars);
    return;
  }

  //if user does not match the url owner
  if(urlDatabase[request.params.id].user_id !== request.session.user_id) {
    let templateVars = {user_id: request.session.user_id, email: registeredUsers[request.session.user_id].username,error_message: "You do not own this URL"};
    response.status(403).render("403", templateVars);
    return;
  }

  urlDatabase[request.params.id].url = request.body.URLToUpdate;
  response.redirect(`/urls/${request.params.id}`);
  return;
  
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
  let templateVars;
  
  if(username.length == 0 && password.length == 0) {
    templateVars={error_message: "Username or Email cannot be empty"};
    response.status(400).render('400', templateVars);
    return;
  }
  
  //Check to see if email is already taken
  for (var id in registeredUsers) {
    if(registeredUsers[id].username === username) {
     templateVars={error_message: "Sorry this email is already taken"};
     response.status(400).render('400', templateVars);
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

  let templateVars = {error_message: "Invalid email/password"};
  response.status(401).render('401', templateVars);
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
