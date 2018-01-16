var requestCatalog = function(data) {
  data = _.extend({
    success: function(result, status) {
      jQuery("#content").html(result);
      History.pushState(null, document.title, decodeURIComponent(data.url));
    },
    dataType: 'html'
  }, data);
  jQuery.ajax(data);
}


var onAggregationClick = function(element, aggregation, value) {
  var checked = jQuery(element).is(':checked');
  var uri = getUpdatedAggregationsUrl({
    key: aggregation,
    value: value,
    checked: checked
  });

  requestCatalog({
    url: uri.href()
  });
}

var aggregationTrigger = function(aggregation_name, value) {
  var uri = getUpdatedAggregationsUrl({
    key: aggregation_name,
    value: value,
    checked: true
  });

  requestCatalog({
    url: uri.href()
  });
}


var gotoPage = function(page) {

  var uri = URI();
  uri.removeSearch('page');
  uri.addSearch('page', page);

  requestCatalog({
    url: uri.href()
  });
}

var showAmount = function(amount) {

  var uri = URI();
  uri.removeSearch('per_page');
  uri.addSearch('per_page', amount);

  requestCatalog({
    url: uri.href()
  });
}

var removeFilter = function(key, value) {
  var uri = getUpdatedAggregationsUrl({
    key: key,
    value: value,
    checked: false
  });
  requestCatalog({
    url: uri.href()
  });
}

var addNotFilter = function(aggregation, value) {

  var uri = URI();

  var qs = uri.search(true);
  var not_filters = JSON.parse(qs.not_filters || '{}');

  not_filters[aggregation] = not_filters[aggregation] || [];
  not_filters[aggregation].push(value)
  not_filters[aggregation] = _.uniq(not_filters[aggregation]);

  qs.not_filters = JSON.stringify(not_filters);
  uri.search(qs);

  requestCatalog({
    url: uri.href()
  });
}

var removeNotFilter = function(aggregation, value) {

  var uri = URI();

  var qs = uri.search(true);
  var not_filters = JSON.parse(qs.not_filters || '{}');
  var index = not_filters[aggregation].indexOf(value);
  not_filters[aggregation].splice(index, 1);

  qs.not_filters = JSON.stringify(not_filters);
  uri.search(qs);

  requestCatalog({
    url: uri.href()
  });
}

var getUpdatedAggregationsUrl = function(options) {
  var uri = options.uri || new URI();
  var qs = uri.search(true);
  var filters = JSON.parse(qs.filters || '{}');



  var aggregation = options.key;
  var value = options.value;
  var checked = options.checked;

  if (!filters[aggregation]) {
    filters[aggregation] = [];
  }

  var chunks = uri.directory().split('/');
  if (chunks.length > 2 && chunks[1] === 'filter') {
    if (typeof globalconfig != 'undefined' && globalconfig.filter) {
      filters[globalconfig.filter.key] = [globalconfig.filter.val]
    } else {
      filters[chunks[2]] = [];
      filters[chunks[2]].push(decodeURIComponent(uri.filename()))
    }
  }

  //if (uri.path() !== '/catalog' && uri.path() !== '/') {
    //uri.path('/catalog');
  //}

  if (checked === true) {
    filters[aggregation].push(value)
    filters[aggregation] = _.uniq(filters[aggregation]);
  } else {
    var index = filters[aggregation].indexOf(value);
    filters[aggregation].splice(index, 1);
  }

  qs.filters = JSON.stringify(filters);
  delete qs['page'];
  uri.search(qs);
  return uri;
}

var removeQuery = function() {

  var uri = URI();

  uri.removeSearch('query');
  $("#main_query").val('');

  requestCatalog({
    url: uri.href()
  });
}

var clearFilters = function() {

  var uri = URI();

  uri.removeSearch('query');
  uri.removeSearch('filters');
  uri.removeSearch('not_filters');
  uri.removeSearch('page');
  $("#main_query").val('');

  requestCatalog({
    url: uri.href()
  });
}

var makeSorting = function(sort_asc, sort_desc) {

  var uri = URI();
  var qs = uri.search(true);

  uri.removeSearch('sort');
  if (qs.sort === sort_asc && sort_desc) {

    uri.addSearch('sort', sort_desc);
  } else {

    uri.addSearch('sort', sort_asc);
  }

  requestCatalog({
    url: uri.href()
  });

  return false;
}

jQuery(document).ready(function() {
  $('.previous-page').on('click', function(event) {
    History.back()
    event.preventDefault()
  })

  var myTimer = 0;
  $('#main_query').keyup(function() {
    var query = $(this).val()

    if (myTimer) {
      clearTimeout(myTimer);
    }

    myTimer = setTimeout(function() {

      var uri = URI();

      uri.removeSearch('query');
      uri.removeSearch('page');
      uri.addSearch('query', query);

      requestCatalog({
        url: uri.href()
      });
    }, 500);


  });

  $('#main_query').keypress(function (e) {
    if (e.which == 13) {
      e.preventDefault();
    }
  });

})

$(document).on('change', '#select_per_page', function(event) {

  var uri = URI();
  uri.removeSearch('per_page');
  uri.addSearch('per_page', $(this).val());

  requestCatalog({
    url: uri.href()
  });
})

