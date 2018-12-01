let $body = $('body');
let terminal = new Terminal('terminal');
$body.append(terminal.html);

let tree;
let currentNode;
let currentPointer;
let allowedCommands;

let commandHistory = [];
let commandHistoryUp = [];
let commandHistoryDown = [];

let domParser = new DOMParser();
let $terminal = $('#terminal');

let separator = '&nbsp;&nbsp; ';
let global = getCookie('locale');

$(document).ready(documentReady);

/**
 * All the tasks to perform as soon as the HTML document is ready
 */
function documentReady() {
    styleTerminal();

    // Asynchronous AJAX
    getStructure(function (basicTree) {
        // Convert the JSON to a proper tree implementation
        generateTree(basicTree);

        // Start at ~
        currentNode = tree.root;
        currentPointer = currentNode.name;

        // Remainder of the document ready function
        printTopBlock();

        hashToDirectory();
        window.onhashchange = hashChange;

        // Once everything is ready, take input
        takeInput();
    });
}

/**
 * Compute the prompt text that is placed before the input cursor
 * @returns {string} prompt text
 */
function getPrompt() {
    return 'PS C:\\Administrator\\Portfolio\\' + currentPointer + '> ';
}

/**
 *
 * @param $element
 * @param text
 * @param callback
 * @param typeSpeed
 */
function typeText(text, callback) {
    let $element = $terminal.find('div').find('p').last().find('span').first();
    $element.typed({
        strings: [text],
        typeSpeed: 50,
        content: 'text',
        showCursor: false,
        callback: callback
    });
}

/**
 * This does nothing, works as a callback when you don't need one
 */
function doNothing() {
    // This does nothing, works as a callback when you don't need one
}

/**
 * This pulls the focus to the hidden input field acting as the prompt
 */
function focus() {
    $('input').focus();
}

/**
 * Set the background color, text color and size of the terminal
 * Uses the Solarized theme
 */
function styleTerminal() {
    terminal.setHeight('100vh');

    terminal.setBackgroundColor('#0a3087');
    terminal.setTextColor('#FFFFFFF');
    terminal.setTextSize('14px');
}

/**
 * The top block introduces people to the me and the site
 * It also helps informs them of the supported commands
 */
function printTopBlock() {
	if(global == 'en-US'){
		printLine('<span >Windows PowerShell</span>')
		printLine('<span >Copyright (C) 2009 Microsoft Corporation. All Rights reserved.</span>')
		printLine('<span ><br></span>')
		printLine('<span >PS C:\\Windows\\System32\\WindowsPowerShell\\v1.0> cd C:\\Administrator\\Portfolio\\~</span>')
		printLine('<span >PS C:\\Administrator\\Portfolio\\~> type ~\introduction.md</span>')
		printLine('<span >==================</span>');
		printLine('<span class="green">&nbsp;Tobias Nöthlich</span>');
		printLine('<span>==================</span>');
		printLine('<strong>software developer and student @ TU Dresden</strong>');
		printLine('This site sets a cookie to store your language settings, by continuing to use this site you agree with this.');
		printLine('The cookie expires after one (1) day.');
		printLine('<br>');
		help();
		printLine('<br>');
		printTree();
		printLine('<br>');
	}
	else{
		printLine('<span >Windows PowerShell</span>')
		printLine('<span >Copyright (C) 2009 Microsoft Corporation. Alle Rechte vorbehalten.</span>')
		printLine('<span ><br></span>')
		printLine('<span >PS C:\\Windows\\System32\\WindowsPowerShell\\v1.0> cd C:\\Administrator\\Portfolio\\~</span>')
		printLine('<span >PS C:\\Administrator\\Portfolio\\~> type ~\einführung.md</span>')
		printLine('<span >==================</span>');
		printLine('<span class="green">&nbsp;Tobias Nöthlich</span>');
		printLine('<span>==================</span>');
		printLine('<strong>Softwareentwickler und Student an der TU Dresden</strong>');
		printLine('Diese Seite setzt ein Cookie um Ihre Spracheinstellung zu speichern. Bei weiterer Benutzung erklären Sie sich damit einverstanden.');
		printLine('Das Cookie verfällt nach einem (1) Tag.');
		printLine('<br>');
		help();
		printLine('<br>');
		printTree();
		printLine('<br>');
	}
}

/**
 * Attach listeners for presses of up, down and tab keys
 */
function attachListeners() {
    let $input = $('input');
    $input.on('keydown', goUp);
    $input.on('keydown', goDown);
    $input.on('keydown', autoComplete);
}

/**
 * Show the prompt and attach a listener to process the input
 */
function takeInput() {
    terminal.input('', processInput);

    let $inputParagraph = $terminal.find('div').find('p').last();
    $inputParagraph.attr('data-prompt', getPrompt());
    attachListeners();
}

/**
 * Process the entered input and then prompt for more input
 * @param input: the entered commands
 */
function processInput(input) {
    
	input = input.replace(/\\/g,"/")
	let $last = $terminal.find('div').find('p').find('div').last();
    $last.html(getPrompt() + $last.html());


    let helpRe = /^help$/;
    let clearRe = /^cls$/;
    let exitRe = /^exit$/;
    let listRe = /^dir$/;
    let treeRe = /^tree$/;
    let changeDirectoryRe = /^cd\s[~]?[a-zA-Zé\/.\-_]*$/;
    let concatenateRe = /^type\s[~]?[a-zA-Zé\/.()\-_↵\s]+$/;
	let setLocalRe = /^Set-WinSystemLocale\s[de][en]-[UD][SE]/

    let commandType;
    if (helpRe.test(input)) {
        commandType = 'help';
    } else if (clearRe.test(input)) {
        commandType = 'clear';
    } else if (exitRe.test(input)) {
        commandType = 'exit';
    } else if (listRe.test(input)) {
        commandType = 'list';
    } else if (treeRe.test(input)) {
        commandType = 'tree';
    } else if (changeDirectoryRe.test(input)) {
        commandType = 'changeDirectory';
    } else if (concatenateRe.test(input)) {
        commandType = 'concatenate';
	} else if (setLocalRe.test(input)) {
        commandType = 'setLocale';
    } else {
        commandType = 'badCommand';
    }

    commandHistory.push(input);
    commandHistoryUp = commandHistory.slice();
    commandHistoryDown = [];

    switch (commandType) {
        case 'help':
            help();
            break;
        case 'clear':
            clear();
            break;
        case 'exit':
            exit();
            break;
        case 'list':
            list();
            break;
        case 'tree':
            printTree();
            break;
        case 'changeDirectory':
            changeDirectory(input.substring(3));
            break;
        case 'concatenate':
            concatenate(input.substring(5), takeInput);
            return;
		case 'setLocale':
            setLocale(input.substring(20));
            return;
        case 'badCommand':
            badCommand();
            break;
    }

    takeInput();
}

/**
 * Print the line to the screen, rendering entered html tags
 * @param output: the line to print to the screen
 */
function printLine(output) {
    terminal.print(output);
    let $last = $terminal.find('div').find('p').find('div').last();
    let encodedStr = $last.html();
    let dom = domParser.parseFromString(
        '<!DOCTYPE html><html><body>' + encodedStr + '</body></html>',
        'text/html'
    );
    let decodedString = dom.body.textContent;
    $last.html(decodedString);
}

/**
 * Go to the directory indicated by the hash
 */
function hashToDirectory() {
    let hash = window.location.hash.replace('#', '');
    if (hash === '' || hash === 'undefined') {
        hash = '~';
    }
    let node = nodeNamed(hash);
    if (node !== undefined && node.type === 'folder') {
        changeDirectory(node.name);
    }
}

/**
 * Update current node and pointer to match hash
 */
function hashChange() {
    let hash = window.location.hash.replace('#', '');
    if (hash === '' || hash === 'undefined') {
        hash = '~';
    }
    currentPointer = hash;
    tree.traverseBreadthFirst(function (node) {
        if (node.name === currentPointer || node.alternativeName === currentPointer) {
            currentNode = node;
        }
    });
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}