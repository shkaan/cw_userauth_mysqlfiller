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
            }
        },

        copy: {
            options: {},
            views: {
                expand: true,
                cwd: 'views',
                src: ['static/**'],
                dest: 'dist'
            }
        },


        uglify: {
            options: {
                banner: '/*! created by <%= pkg.author %> ver. <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                expand: true,
                cwd: 'dist',
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
                cwd: 'dist',
                src: ['**/*.css'],
                dest: 'dist',
                ext: '.min.css'
            }
        },

        watch: {
            options: {
                spawn: true
            },
            static: {
                files: ['views/static/scripts/*.js', 'views/static/css/*.css'],
                tasks: ['dev']
            }
        }
    });
    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
        // console.log(target + ': ' + filepath + ' has ' + action);

    });

    // Load plugins to use
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // Default task(s)

    grunt.registerTask('default', ['clean:dist', 'copy', 'uglify', 'cssmin', 'clean:source', 'watch']);
    grunt.registerTask('dev', ['clean:dist', 'copy', 'uglify', 'cssmin', 'clean:source']);
    grunt.registerTask('production', ['clean:dist', 'copy', 'uglify', 'cssmin', 'clean:source']);

};