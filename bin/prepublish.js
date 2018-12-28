var path = require('path').join(__dirname, '..', 'package.json');
var pkg = require(path);
['babel', 'greenkeeper', 'bundlesize', 'devDependencies', 'eslintConfig'].forEach(function (key) {
    delete pkg[key]
});
pkg.scripts = {
    postinstall: pkg.scripts.postinstall,
    donate: pkg.scripts.donate
};
require('fs').writeFileSync(__dirname + `/../lib/package.json`, JSON.stringify(pkg, null, 2));