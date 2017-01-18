
let alphaNumeric = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Returns a random integer beween 0 and n
let getRandom0ToN = (n) => {
  return Math.floor((Math.random() * n));
};

let randomString = (length, chars) =>  {
  let result = '';
  for(let i = length; i > 0; i--) {
    result += chars[getRandom0ToN(62)];       
  }
  return result;
};

// Generates a Random String of 6 Alphanumeric Characters
// Generates at random one of 56800235564 combinations, we're good here ;)
let generateRandomUrl = () => {
  return randomString(6, alphaNumeric);
};

// Generates a Random String of 10 Alphanumeric Characters
let generateRandomId = () => {
  return randomString(10, alphaNumeric);
};

module.exports = {  generateRandomUrl: generateRandomUrl,
                    generateRandomId: generateRandomId
};
