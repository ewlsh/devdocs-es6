app.config = {
  db_filename: 'db.json',
  default_docs: "<%= App.default_docs.to_json %>",
  docs_origin: '<%= App.docs_origin %>',
  env: '<%= App.environment %>',
  history_cache_size: 10,
  index_filename: 'index.json',
  index_path: '/<%= App.docs_prefix %>',
  max_results: 50,
  production_host: 'devdocs.io',
  search_param: 'q',
  sentry_dsn: '<%= App.sentry_dsn %>',
  version: "<%= Time.now.to_i %>",
  release: "<%= Time.now.utc.httpdate.to_json %>",
  mathml_stylesheet: '<%= App.cdn_origin %>/mathml.css'
};
