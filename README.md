# Anna

Anna is a file type agnostic static analyzer.

## Installation

    npm install dschnare/anna --save-dev

## Quick Start

**Asset Analysis**

Enumerate all assets referenced in a JavaScript source file. Any string literal
of the form `('|")path/to/file.ext('|")` will be interpreted as an asset.

    const Anna = require('@dschnare/anna')

    Anna
      // Create an instance of Anna
      .create()
      // Install the provided jsAssets plugin that will look for assets in
      // string literals. We tell Anna to save the result to the 'assets'
      // property of the result object and only analyze files with an '.js'
      // extension.
      .use('assets', /\.js$/, Anna.jsAssets())
      .analyze('src/compoents/Badge/index.js')
      .then(result => {
        console.log('Analysis done!')
        // Log the asset objects, where each asset object has the following
        // shape: { assetUrl, assetFile }
        // NOTE: assetFile can be null if a file was not found.
        console.log('assets:', result.assets)
      })
      .catch(error => console.error(error))

One of Anna's main goals was to make asset colocation easy. We can quite easily
modify the example above so that Anna will copy our assets to a directory for
us. In this example all assets will be copied to `dist/${assetUrl}`.

    Anna
      .create()
      .use('assets', /\.js$/, Anna.jsAssets())
      .analyze('src/compoents/Badge/index.js')
      .then(result => {
        return Anna.copyAssets(result.assets, 'dist')
          // Pass the result object on so that other things can be done with it
          // further down the Promise chain.
          .then(() => result)
      })
      .catch(error => console.error(error))

**Dependency Analysis**

What about dependencies that are imported or required? Anna can handle that out
of the box too. Out of the box Anna has analyzers that return arrays of absolute
file paths to the dependent files for common dependency import patterns.

    Anna
      .create()
      // Match ES2015 import statements and CommonJS require statements.
      .use('deps.js', /\.(js|ts|coffee)$/, Anna.jsDependencies())
      // Match @import, less @import statements, stylus @require statements and
      // index styles.
      .use('deps.css', /\.(css|less|sass|scss|stylus)/, Anna.cssDependencies())
      .analyze([
        'src/components/Badge/index.js',
        'src/components/Badge/style.css'
      ])
      .then(result => {
        // logs: { js: [...], css: [...] }
        console.log(result.deps)
      })
      // If a dependency cannot be resolved then an error is thrown.
      .catch(error => console.error(error))

## How the default asset resolution works

Anna's builtin asset resolution works by finding the physical file that can be
associated with each asset URL. Where asset URLs can be absolute like
`/my-assets/file.ext` or relative like `my-assets/file.ext` or
`../my-assets/file.ext` (remote URLs are ignored).

Physical files are found by traversing up the directory hierarchy starting with
the directory of the source file and searching for the first matching file by
removing path segments from the left side of the URL. Typically, the first
matching file has the longest path (i.e. the most specific file).

If the source file `src/components/Badge/index.js` contained the following asset
URL `Badge/default-badge.svg` then the following locations will be visited to
find the asset file associated with the asset URL.

    src/components/Badge/Badge/default-badge.svg
    src/components/Badge/default-badge.svg
    src/components/Badge/default-badge.svg
    src/components/default-badge.svg
    src/Badge/default-badge.svg
    src/default-badge.svg
    Badge/default-badge.svg
    default-badge.svg

and so on up to the current working directory (i.e. project root). These
locations are the same regardless if the asset URL is absolute
(`/Badge/default-badge.svg`) or relative (`Badge/default-badge.svg`). However,
if the asset URL is relative and contains `../` in the URL then it will change
the locations visited due to path normalization, and the file with the longest
path may not always be chosen.

For example, had the asset URL been `../Badge/default-badge.svg` then the
following locations would have been visited.

    src/components/Badge/default-badge.svg
    src/components/Badge/Badge/default-badge.svg
    src/components/Badge/default-badge.svg
    src/Badge/default-badge.svg
    src/components/Badge/default-badge.svg
    src/components/default-badge.svg
    Badge/default-badge.svg
    src/Badge/default-badge.svg
    src/default-badge.svg
    ../Badge/default-badge.svg
    Badge/default-badge.svg
    default-badge.svg

Because of this path normalization and the affect it has on the resolution
algorithm, it's not recommended that `../` be used in your asset URLs unless you
are fully aware of the side effects (i.e. you could unintentionally match asset
files in locations further up the directory hierarchy).

Relative asset URLs can also lead to unstable URLs in the production code, that
is the URLs being used by the code will need to be translated/compiled to update
their pathing. It's better to always use absolute URLs so that the code is
expecting assets to load from the web server root. This is far easier to handle
at the server level via custom routing. The only time using relative or
arbitrary URLs makes sense is if you're not using the URL directly or in your
code you translate the URL before use.

Example:

    // Normal usage as usual, but we call our own asset() function.

    fetch(asset('badge.svg')).then(...)

    // In our code we deliberately translate URLs that Anna picks up into
    // production URLs.
    function asset (url) {
      // TODO: Do something with the URL, perhaps
      // do a lookup in an embed table or just prepend a path to the URL.
    }

This asset file resolution algorithm is the same regardless of what source file
the asset URL is parsed from.

## API

Coming soon!
