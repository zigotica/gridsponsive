module.exports = function(grunt) {
    'use strict';

    // LOAD MODULES, MAGICALLY
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // PACKAGE INFO
        pkg: grunt.file.readJSON('package.json'),
        
        // FOLDERS
        SOURCE : {
            JS      : 'sources/js',
            CSS     : 'sources/compass'
        },

        BUILDS : {
            JS      : 'public/js',
            CSS     : 'public/css'
        },

        // TASKS
        jshint: {
            main: ['gruntfile.js', '<%= SOURCE.JS %>/debug/debug.js', '<%= SOURCE.JS %>/grids/grid.js', '<%= SOURCE.JS %>/dev/*.js'],
            options: {
                laxcomma: true,
                proto: true,
                boss: true
            }
        },

        concat: {
            options: {
                banner: '/*! \n<%= pkg.name %> <%= pkg.version %>, <%= pkg.author %>\n<%= pkg.homepage %>\n*/\n',
                separator: ';'
            },
            head: {
                src: ['<%= SOURCE.JS %>/libs/modernizr.js','<%= SOURCE.JS %>/libs/respond.js','<%= SOURCE.JS %>/libs/jq.js','<%= SOURCE.JS %>/dev/main.js'],
                dest: '<%= SOURCE.JS %>/head.js'
            }
        },

        uglify: {
            options: {
                compress:  true,
                mangle: true,
                preserveComments: 'some'
            },
            head: {
                files: {
                    '<%= BUILDS.JS %>/head.min.js': ['<%= concat.head.dest %>']
                }
            }
        },

        connect: {
            uses_defaults: {}
        },

        watch: {
            main: {
                files: ['*.html', '*.php', 'Gruntfile.js', 'dev/*.html', 'dev/*.php', '<%= jshint.main %>', '<%= SOURCE.JS %>/grids/grid.css', '<%= SOURCE.JS %>/*.js', '<%= BUILDS.JS %>/*.js', '<%= SOURCE.JS %>/libs/*.js', '<%= BUILDS.CSS %>/*.css'],
                tasks: 'default'
            },
            options: {
                livereload: true,
                interrupt: true,
                nospawn: true
            }
        }
    });

    // REGISTER TASKS
    grunt.registerTask('default', ['jshint:main', 'concat:head', 'uglify:head']);
    grunt.registerTask('live', ['connect', 'watch:main']);
    
    // write file actions to terminal
    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

};