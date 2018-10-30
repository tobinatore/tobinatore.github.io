function changeDirectoryWalkthrough(dirname) {
    typeText('cd ' + dirname.replace("/","\\"), focus);
}

function concatenateWalkthrough(filename) {
    typeText('type ' + filename.replace("/","\\"), focus);
}

function listWalkthrough() {
    typeText('dir', focus);
}

function helpWalkthrough() {
    typeText('help', focus);
}
