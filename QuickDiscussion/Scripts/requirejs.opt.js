// requirejs bundling for optimization configuration file
// see http://requirejs.org/docs/optimization.html#onejs
({
    baseUrl: '.',          // The root folder for relative paths.
    name: 'main',          // The root JS that defines minimal set of dependency for app to load and to be combined.
    excludeShallow: ['app/resources/zh/strings'],    // Files whose paths are dynamically mapped and therefore need to be excluded.
    out: 'main.bundle.js',        // Output file.
    optimize: 'none'       // No minification.
})