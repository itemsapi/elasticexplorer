var express = require('express');
var app = express();
var Promise = require('bluebird');
Promise.config({
  warnings: false
})
var _ = require('lodash');
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
const logger = require('./src/clients/logger');

var nunenv = require('./src/clients/nunenv')(app, './', {
  autoescape: true,
  watch: true,
  noCache: true
})

var compression = require('compression');

app.use('/bootstrap', express.static('node_modules/bootstrap'));
app.use('/assets', express.static('assets'));
app.use('/docs', express.static('docs'));
app.use('/libs', express.static('bower_components'));

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.set('view engine', 'html.twig');
app.set('view cache', false);
app.engine('html.twig', nunenv.render);

const config = require('config');
const elasticitems = require('./src/clients/elasticitems');

app.all('*', function(req, res, next) {
  next();
})

app.get(['/'], compression(), function(req, res) {

  var page = parseInt(req.query.page, 10);

  var queries = {
    per_page: req.query.per_page || 12,
    query: req.query.query,
    sort: req.query.sort,
    page: page || 1
  }

  if (req.query.filters) {
    queries.filters = JSON.parse(req.query.filters);
  }

  if (req.query.not_filters) {
    queries.not_filters = JSON.parse(req.query.not_filters);
  }

  var is_ajax = req.query.is_ajax || req.xhr;

  return elasticitems.search(queries)
  .then(function(result) {

    return res.render('views/catalog', {
      items: result.data.items,
      is_search_box: true,
      pagination: result.pagination,
      page: page,
      is_ajax: is_ajax,
      query: req.query.query,
      url: req.url,
      aggregations: result.data.aggregations,
      filters: queries.filters,
      not_filters: queries.not_filters,
    });
  })
})

app.get('/facet/:name', function(req, res) {

  elasticitems.aggregation({
    field: req.params.name,
    sort: req.query.sort || '_terms',
    order: req.query.order || 'asc',
    size: req.query.size || 100000,
    aggregation_query: req.query.query
  })
  .then(function(result) {
    return res.json(_.map(result.data.buckets, function(val) {
      return {
        value: val.key,
        label: val.key
      }
    }))
  })
})

app.listen(PORT, function () {
  logger.info('Your app listening on port %s!', PORT);
});
