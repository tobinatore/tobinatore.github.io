function updateAllowedCommands() {
    let allowedCommandsList = ['help', 'cls', 'exit', 'dir'];
    for (let i = 0; i < allowedCommandsList.length; i++) {
        allowedCommandsList[i] = {
            'show': '<span class="yellow">' + allowedCommandsList[i] + '</span>',
            'mean': allowedCommandsList[i]
        };
    }
    let children = currentNode.children;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        let command = '';
        let className = '';
        if (child.type === 'file') {
            command = 'type';
            className = 'green';
        }
        if (child.type === 'folder') {
            command = 'cd';
            className = 'blue';
        }

        let show = '<span class="yellow">'
            + command
            + '</span>'
            + '&nbsp;'
            + '<span class="' + className + '">'
            + child.name
            + '</span>';
        let mean = command + ' ' + child.name;
        allowedCommandsList.push({
            'show': show,
            'mean': mean
        });
        if (child.name !== child.alternativeName) {
            show = '<span class="yellow">'
                + command
                + '</span>'
                + '&nbsp;'
                + '<span class="' + className + '">'
                + child.alternativeName
                + '</span>';
            mean = command + ' ' + child.alternativeName;
            allowedCommandsList.push({
                'show': show,
                'mean': mean
            });
        }
    }
    allowedCommands = allowedCommandsList;
}

/**
 * Display the various commands and in the tooltip, their functions
 */
function help() {
    printLine('The following commands work. Hover over them for more information.');
    printLine('' +
        ' <span class="yellow" title="Explains the commands">help</span>,' +
        ' <span class="yellow" title="Clears the screen">cls</span>,' +
        ' <span class="yellow" title="List all the files in this directory">dir</span>,' +
        ' <span class="yellow" title="List all links on the website">tree</span>,' +
        ' <span class="yellow" title="Change directory to `dirname`">cd </span>' +
        '<span class="blue" title="Change directory to `dirname`"><em>dirname</em></span>,' +
        ' <span class="yellow" title="Show the contents of `filename`">type </span>' +
        '<span class="green" title="Show the contents of `filename`"><em>filename</em></span>'
    );
}

/**
 * Clear the screen by reloading the page
 */
function clear() {
    window.location.reload(true);
}

/**
 * Say goodbye and then apologize for the limitations of JavaScript
 */
function exit() {
    printLine('<span class="yellow">Goodbye!</span>');
    printLine('JavaScript is not allowed to close this window.');
}

/**
 * List the various subdirectories and files in the current directory
 */
function list() {
    let string = '';
    for (let i = 0; i < currentNode.children.length; i++) {
        let child = currentNode.children[i];
        if (child.type === 'folder') {
            string = string + '<a class="blue" onclick="changeDirectoryWalkthrough(absolutePathTo(nodeNamed(\'' + child.name + '\')))">';
            string = string + child.name;
            string = string + '</a>';
        } else {
            string = string + '<a class="green" onclick="concatenateWalkthrough(absolutePathTo(nodeNamed(\'' + child.name + '\')))">';
            string = string + child.name;
            string = string + '</a>';
        }
        string = string + separator;
    }
    printLine(string);
}

/**
 * Change to another directory
 * @param path: the location of the directory to switch to
 */
function changeDirectory(path) {
    let nextNode = nodeFrom(path.replace(/\\/g,"/"));
    if (nextNode === undefined || nextNode.type === 'file') {
        badCommand();
        return;
    }
    currentNode = nextNode;
    currentPointer = currentNode.name;
    window.location.hash = currentPointer;
    let $inputParagraph = $terminal.find('div').find('p').last();
    $inputParagraph.attr('data-prompt', getPrompt());
    updateAllowedCommands();
}

/**
 * Show the contents of a file on the screen or, in the case of PDFs, a new tab
 * @param path: the location of the file to display
 * @param callback: the action to perform after displaying the file
 */
function concatenate(path, callback) {
    let node = nodeFrom(path.replace(/\\/g,"/"));
    if (node === undefined || node.type === 'folder') {
        badCommand();
        callback();
        return;
    }
    let filename = node.name;
    if (filename.includes('.md')) {
        $.ajax({
            url: window.location.origin + '/markdowns/' + filename.replace('.', '') + '.html',
            method: 'GET',
            cache: false,
            success: [
                function (response) {
                    printLine(response);
                    callback();
                }
            ],
            error: [
                function () {
                    badCommand();
                    callback();
                }
            ]
        });
    } else if (filename.includes('.pdf')) {
        window.open(window.location.origin + '/pdf/' + filename);
        callback();
    }
}


/**
 * If the command is invalid, say so and link to the help command if needed
 */
function badCommand() {
    printLine('Bad command. See <a class="yellow" onclick="helpWalkthrough()">help</a> or use the links to browse.');
}