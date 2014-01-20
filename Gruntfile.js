module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ''
      },
      dist: {
		
	  src: ['lib/header.js',
			'lib/config.js',
			'lib/util.js',
			'lib/stats.js',
			'lib/loop/loop.js',
			'lib/loop/multiloop.js',
			'lib/monitoring/collectors.js',
			'lib/monitoring/statslogger.js',
			'lib/monitoring/monitor.js',
			'lib/monitoring/monitorgroup.js',
			'lib/http.js',
			'lib/reporting/*.tpl.js',
			'lib/reporting/template.js',
			'lib/reporting/report.js',
			'lib/reporting/reportmanager.js',
			'lib/reporting/external.js',
			'lib/loadtesting.js ',
			'lib/remote/endpoint.js',
			'lib/remote/endpointclient.js',
			'lib/remote/slave.js',
			'lib/remote/slaves.js',
			'lib/remote/slavenode.js',
			'lib/remote/cluster.js',
			'lib/remote/httphandler.js',
			'lib/remote/remotetesting.js'],
        dest: 'NodeLoad.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('procTemplate', 'Template for adding Requires for specified files', function(varname, src) {
	
	/**
	 * ReplaceAll by Fagner Brack (MIT Licensed)
	 * Replaces all occurrences of a substring in a string
	 */
	String.prototype.replaceAll = function( token, newToken, ignoreCase ) {
		var _token;
		var str = this + "";
		var i = -1;

		if ( typeof token === "string" ) {

			if ( ignoreCase ) {

				_token = token.toLowerCase();

				while( (
					i = str.toLowerCase().indexOf(
						token, i >= 0 ? i + newToken.length : 0
					) ) !== -1
				) {
					str = str.substring( 0, i ) +
						newToken +
						str.substring( i + token.length );
				}

			} else {
				return this.split( token ).join( newToken );
			}

		}
	return str;

	};

	var file = require('fs').readFileSync(src).toString();
	// var output = 'var ' + varname + '= exports.' + varname + '=' + JSON.stringify(file).replace('\\r\\n','\\n') + ';' + '\n';
	var output = 'var ' + varname + '= exports.' + varname + '='
                        + JSON.stringify(file).replaceAll('\\r\\n','\\n', true) + ';' + '\n';
	require('fs').writeFileSync(src + '.js', output);

});

  grunt.registerTask('procAllTemplates', 'Single task for processing all templates', function() {
	  grunt.task.run('procTemplate:REPORT_SUMMARY_TEMPLATE:lib/reporting/summary.tpl');
	  grunt.task.run('procTemplate:DYGRAPH_SOURCE:lib/reporting/dygraph.tpl');
});
  
  grunt.registerTask('default', ['procAllTemplates', 'concat']);

};