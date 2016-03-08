var config = {};

config.path = "/PATH/TO/PROJECT/"; // include trailing "/"

config.database = {
  "name": "infobox",
  "port": 8554
};

config.auth = {
  user: 'ML_USER',
  pass: 'ML_PASSWORD',
  sendImmediately: false
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = config;
}
