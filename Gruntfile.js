module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            options: {},
            dist: {
                src: ['dist']
            },
            source: {
                src: ['dist/**/*.js', 'dist/**/*.css', '!dist/**/*.min.css', '!dist/**/*.min.js']
            },
            minjs: {
                src: ['dist/**/*.min.js']
            },
            mincss: {
                src: ['dist/**/*.min.css']
            }
        },

        copy: {
            options: {},
            views: {
                expand: true,
                cwd: 'views',
                src: ['static/'],
                dest: 'dist'
            },
            favicon: {
                expand: true,
                cwd: 'views',
                src: ['static/*.ico'],
                dest: 'dist'
            }
        },


        uglify: {
            options: {
                banner: '/*! created by <%= pkg.author %> ver. <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                expand: true,
                cwd: 'views',
                src: ['**/*.js'],
                dest: 'dist',
                ext: '.min.js'
            }
        },

        cssmin: {
            options: {
                banner: '/*! created by <%= pkg.author %> ver. <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                expand: true,
                cwd: 'views',
                src: ['**/*.css'],
                dest: 'dist',
                ext: '.min.css'
            }
        },

        watch: {
            options: {
                // spawn: true,
                livereload: true
            },
            js: {
                files: ['views/static/scripts/*.js'],
                tasks: ['devjs']
            },
            css: {
                files: ['views/static/css/*.css'],
                tasks: ['devcss']
            }
        }
    });
    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
        // console.log(target + ': ' + filepath + ' has ' + action);

    });

    require('jit-grunt')(grunt);
    // Load plugins to use
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-contrib-cssmin');
    // grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // Default task(s)

    grunt.registerTask('default', ['clean:dist', 'uglify', 'cssmin','copy:favicon', 'watch']);
    grunt.registerTask('devjs', ['clean:minjs', 'uglify']);
    grunt.registerTask('devcss', ['clean:mincss', 'cssmin']);
    grunt.registerTask('production', ['clean:dist', 'uglify','copy:favicon', 'cssmin']);

};