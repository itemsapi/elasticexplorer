const config = require('config');

module.exports = require('./../../../elasticitems')({
  host: config.get('elasticsearch.host'),
  index: config.get('elasticsearch.index'),
  type: config.get('elasticsearch.type'),
}, config.get('search'));

