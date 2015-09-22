module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-sass');

  //update broken bootstrap bower.json
  grunt.registerMultiTask("updatebootstrap", "Fixes bootstrap's bower.json", function() {
    var bootBower = "bower_components/bootstrap/bower.json";
    if (!grunt.file.exists(bootBower)) {
      grunt.log.error("file " + bootBower + " not found");
      return true;
    }

    var bower = grunt.file.readJSON(bootBower);
    bower["main"] = ["dist/css/bootstrap.css", "dist/js/bootstrap.js"]
    grunt.file.write(bootBower, JSON.stringify(bower, null, 2));
  });

  grunt.initConfig({
    updatebootstrap: {
      target: {}
    },
    wiredep: {
      target: {
        src: 'index.html'
      }
    },
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'css/main.css': 'css/scss/main.scss',
        }
      }
    }
  });

  grunt.registerTask('default', ['updatebootstrap', 'wiredep', 'sass']);
}
