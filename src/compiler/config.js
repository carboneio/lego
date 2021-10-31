export default {
  // Path to the Lego Component class.
  // When relative, it should be referenced from within the dist folder
  // where the compiled bricks reside
  importPath: 'https://unpkg.com/@polight/lego@$master/dist/lego.min.js',

  // When building a Component, set the default name of the class to extend.
  // This is the name that you will extend with `export default class extends Xxx`
  baseClassName: 'Lego',

  // Folder where HTML bricks are stored
  sourceDir: './bricks',

  // Folder where to store built js bricks
  targetDir: './dist',

  // Boolean value to watch for file changes. `null` for using command line
  watch: null
}
