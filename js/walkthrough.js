function changeDirectoryWalkthrough(dirname) {
    typeText('cd ' + dirname.replace(/\//g,"\\"), focus);
}

function concatenateWalkthrough(filename) {
    typeText('type ' + filename.replace(/\//g,"\\"), focus);
}

function listWalkthrough() {
    typeText('dir', focus);
}

function helpWalkthrough() {
    typeText('help', focus);
}

function changeLanguageWalkthrough(locale) {
	typeText('Set-WinSystemLocale ' + locale, focus);
}
