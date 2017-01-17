
let alphaNumeric = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Returns a random integer beween 0 and n
let getRandom0ToN = function(n) {
  return Math.floor((Math.random() * n));
};

let randomString = function(length, chars) {
  let result = '';
  for(let i = length; i > 0; i--) {
    result += chars[getRandom0ToN(62)];       
  }
  return result;
};

// Generates a Random String of 6 Alphanumeric Characters
// Generates at random one of 56800235564 combinations, we're good here ;)
let generateRandomString = function() {
  return randomString(6, alphaNumeric);
};

module.exports = generateRandomString;
