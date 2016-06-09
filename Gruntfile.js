module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['*.js', 'views/**/*.js'],
                dest: 'build/',
                ext: '.min.js'
            }
        }

    });

    // Load plugins to use
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    // Default task(s)
    grunt.registerTask('default', ['uglify']);

};