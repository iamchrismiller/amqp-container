
/**
 * Generic Options Parser
 * @param options
 * @param defaults
 * @returns {*}
 * @constructor
 */
var OptionsParser = function (options, defaults) {
  this.options = options || {};
  this.defaults = defaults || {};
  return this;
};

/**
 * Getter Method That Retrieves Option Value
 * If Not In Options Look In Defaults
 * @param key
 * @returns {*}
 */
OptionsParser.prototype.get = function(key) {
  return this.options[key] ? this.options[key] : this.defaults[key] ? this.defaults[key] : false;
};

/**
 * Get An InstanceKey Containing Multiple Keys
 * Seperated by a colon
 * @param keys
 * @returns {string}
 */
OptionsParser.prototype.getInstanceKey = function (keys) {
  var self = this, formattedString = "";

  keys.forEach(function(key) {
    formattedString += self.get(key) + ":";
  });

  //Return Formatted String Without last :
  return formattedString.slice(0,-1);
};

module.exports = OptionsParser;