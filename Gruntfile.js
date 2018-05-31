/* This file is executed when the user runs the Grunt command from their terminal. It converts the source files to the 
 * required format and then moves the necessary files into the dist directory. If the directory is not present, it is
 * created. When loading the module, Grafana ignores the src directory and reads the contents of the dist directory.
 */

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig({
        clean: ["dist"],

        copy: {
            src_to_dist: {
                cwd: 'src',
                expand: true,
                src: ['**/*', '!**/*.js', '!**/*.scss'],
                dest: 'dist',
            },
            externals: {
                cwd: 'src',
                expand: true,
                src: ['**/external/*'],
                dest: 'dist',
            },
            pluginDef: {
                expand: true,
                src: ['README.md' ],
                dest: 'dist',
            },
        },

        watch: {
            rebuild_all: {
                files: ['src/**/*', 'plugin.json'],
                tasks: ['default'],
                options: {spawn: false}
            },
        },

        babel: {
            options: {
                ignore: ['src/external/tree.js', 'src/external/d3.min.js'],
                sourceMap: true,
                presets:  ["es2015"],
                plugins: ['transform-es2015-modules-systemjs', "transform-es2015-for-of"],
            },
            dist: {
                files: [{
                    cwd: 'src',
                    expand: true,
                    src: ['*.js'],
                    dest: 'dist',
                    ext:'.js'
                }]
            },
        },

    });

    grunt.registerTask('default', ['clean', 'copy:src_to_dist', 'copy:pluginDef', 'babel', 'copy:externals']);
};
