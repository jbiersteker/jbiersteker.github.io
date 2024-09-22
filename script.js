document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminal-output');
    let isInitialized = false;
    let inputLine = ''; // Current input line
    let commandHistory = [];
    let historyIndex = -1;
    let currentPath = '/home/guest';

    // Prompt String
    function getPromptString() {
        const pathDisplay = currentPath === '/home/guest' ? '~' : currentPath.replace('/home/guest', '~');
        return `<span class="color-green">guest</span>@<span class="color-blue">Jasper-OS</span>:<span class="color-cyan">${pathDisplay}</span>$&nbsp;`;
    }
    let promptString = getPromptString();

    // Startup Messages and ASCII Art
    const startupMessages = [
        'Initializing Jasper-OS...',
        'Loading modules...',
        'Starting services...',
        'Welcome to Jasper-OS!'
    ];

    const asciiArt = `
<span class="color-green">   ___  ___   ___________ ___________                </span>
<span class="color-green">  |_  |/ _ \\\\ /  ___| ___ \\\\  ___| ___ \\\\               </span>
<span class="color-green">    | / /_\\\\ \\\\ \`--.| |_/ / |__ | |_/ /_____ ___  ___ </span>
<span class="color-green">    | |  _  | \`--. \\\\  __/|  __||    /______/ _ \\\\ __|</span>
<span class="color-green">/\\\\__/ / | | |/\\\\__/ / |   | |___| |\\\\ \\\\     | (_) \\\\__ \\\\</span>
<span class="color-green">\\\\____/\\\\_| |_/\\\\____/\\\\_|   \\\\____/\\\\_| \\\\_|     \\\\___/|___/</span>
<span class="color-green">                                                     </span>
<span class="color-green">                                                     </span>
`;

    // Virtual File System
    const fileSystem = {
        '/home': {
            type: 'directory',
            content: {
                'guest': {
                    type: 'directory',
                    content: {
                        'readme.txt': {
                            type: 'file',
                            content: 'Welcome to Jasper-OS. This is a simple readme file.'
                        },
                        'documents': {
                            type: 'directory',
                            content: {}
                        }
                    }
                }
            }
        }
    };

    // Helper Functions for File System
    function getCurrentDirectory() {
        const pathParts = currentPath.split('/').filter(part => part);
        let currentDir = fileSystem;
        for (let part of pathParts) {
            if (currentDir[part] && currentDir[part].type === 'directory') {
                currentDir = currentDir[part].content;
            } else {
                return null;
            }
        }
        return currentDir;
    }

    function resolvePath(path) {
        if (!path || path === '.') {
            return currentPath;
        }
        let newPath = path;
        if (!path.startsWith('/')) {
            newPath = currentPath + '/' + path;
        }
        const parts = newPath.split('/').filter(part => part && part !== '.');
        const resolvedParts = [];
        for (let part of parts) {
            if (part === '..') {
                resolvedParts.pop();
            } else {
                resolvedParts.push(part);
            }
        }
        return '/' + resolvedParts.join('/');
    }

    function getDirectoryFromPath(path) {
        const parts = path.split('/').filter(part => part);
        let currentDir = fileSystem;
        for (let part of parts) {
            if (currentDir[part] && currentDir[part].type === 'directory') {
                currentDir = currentDir[part].content;
            } else {
                return null;
            }
        }
        return currentDir;
    }

    function getFileFromPath(path) {
        const parts = path.split('/').filter(part => part);
        let currentDir = fileSystem;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (currentDir[part] && currentDir[part].type === 'directory') {
                currentDir = currentDir[part].content;
            } else {
                return null;
            }
        }
        const fileName = parts[parts.length - 1];
        return currentDir[fileName] || null;
    }

    // Commands
    const commands = {
        help: {
            description: 'List available commands',
            action: function() {
                let commandList = '';
                for (let cmd in commands) {
                    if (commands.hasOwnProperty(cmd)) {
                        let description = commands[cmd].description || 'No description available';
                        commandList += `<span class="color-green">${cmd}</span> - ${description}\n`;
                    }
                }
                return commandList.trim();
            }
        },
        ls: {
            description: 'List directory contents',
            action: function(args) {
                const dirPath = args[0] ? resolvePath(args[0]) : currentPath;
                const dir = getDirectoryFromPath(dirPath);
                if (dir) {
                    const contents = Object.keys(dir).join('  ');
                    return contents;
                } else {
                    return `<span class="color-red">ls: cannot access '${args[0]}': No such file or directory</span>`;
                }
            }
        },
        cd: {
            description: 'Change the current directory',
            action: function(args) {
                if (!args[0]) {
                    currentPath = '/home/guest';
                    return '';
                }
                const newPath = resolvePath(args[0]);
                const dir = getDirectoryFromPath(newPath);
                if (dir) {
                    currentPath = newPath;
                    return '';
                } else {
                    return `<span class="color-red">cd: ${args[0]}: No such file or directory</span>`;
                }
            }
        },
        cat: {
            description: 'Display file contents',
            action: function(args) {
                if (!args[0]) {
                    return `<span class="color-red">cat: missing file operand</span>`;
                }
                const filePath = resolvePath(args[0]);
                const file = getFileFromPath(filePath);
                if (file && file.type === 'file') {
                    return file.content;
                } else {
                    return `<span class="color-red">cat: ${args[0]}: No such file or directory</span>`;
                }
            }
        },
        mkdir: {
            description: 'Create a new directory',
            action: function(args) {
                if (!args[0]) {
                    return `<span class="color-red">mkdir: missing operand</span>`;
                }
                const dirPath = resolvePath(args[0]);
                const parts = dirPath.split('/').filter(part => part);
                const dirName = parts.pop();
                const parentPath = '/' + parts.join('/');
                const parentDir = getDirectoryFromPath(parentPath);
                if (parentDir) {
                    if (!parentDir[dirName]) {
                        parentDir[dirName] = {
                            type: 'directory',
                            content: {}
                        };
                        return '';
                    } else {
                        return `<span class="color-red">mkdir: cannot create directory '${args[0]}': File exists</span>`;
                    }
                } else {
                    return `<span class="color-red">mkdir: cannot create directory '${args[0]}': No such file or directory</span>`;
                }
            }
        },
        touch: {
            description: 'Create a new empty file',
            action: function(args) {
                if (!args[0]) {
                    return `<span class="color-red">touch: missing file operand</span>`;
                }
                const filePath = resolvePath(args[0]);
                const parts = filePath.split('/').filter(part => part);
                const fileName = parts.pop();
                const parentPath = '/' + parts.join('/');
                const parentDir = getDirectoryFromPath(parentPath);
                if (parentDir) {
                    if (!parentDir[fileName]) {
                        parentDir[fileName] = {
                            type: 'file',
                            content: ''
                        };
                        return '';
                    } else {
                        return '';
                    }
                } else {
                    return `<span class="color-red">touch: cannot touch '${args[0]}': No such file or directory</span>`;
                }
            }
        },
        echo: {
            description: 'Display a line of text',
            action: function(args) {
                return args.join(' ');
            }
        },
        clear: {
            description: 'Clear the terminal screen',
            action: function() {
                terminalOutput.innerHTML = '';
                showPrompt();
                return ''; // Return empty string to avoid printing undefined
            }
        }
    };

    // Initialize Terminal
    function initializeTerminal() {
        printOutput('', asciiArt);
        simulateStartupMessages(0, () => {
            isInitialized = true; // Only set to true after startup sequence
            printOutput('', 'Type <span class="color-green">\'help\'</span> to see a list of available commands.\n');
            showPrompt();
            addEventListeners(); // Add event listeners after initialization
        });
    }

    function simulateStartupMessages(index, callback) {
        if (index < startupMessages.length) {
            printOutput('', startupMessages[index]);
            setTimeout(() => {
                simulateStartupMessages(index + 1, callback);
            }, 500);
        } else {
            callback();
        }
    }

    // Event Listener Functions
    function onKeyDown(event) {
        if (!isInitialized) return;

        // Check if editor mode is active
        if (document.getElementById('editor')) return;

        const key = event.key;

        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            inputLine += key;
        } else if (key === 'Backspace') {
            inputLine = inputLine.slice(0, -1);
        } else if (key === 'Enter') {
            removeCurrentLine();
            commandHistory.push(inputLine);
            historyIndex = commandHistory.length;
            let output = processCommand(inputLine);
            if (output !== null) { // Only show prompt if command is not asynchronous
                printOutput(inputLine, output);
                showPrompt();
            }
            inputLine = '';
        } else if (key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                inputLine = commandHistory[historyIndex];
                updateInputLine();
            }
            event.preventDefault();
        } else if (key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                inputLine = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                inputLine = '';
            }
            updateInputLine();
            event.preventDefault();
        } else if (key === 'Tab') {
            event.preventDefault();
            // Optional: Implement tab completion here
        }
        updateInputLine();
    }

    function addEventListeners() {
        document.addEventListener('keydown', onKeyDown);
    }

    function removeEventListeners() {
        document.removeEventListener('keydown', onKeyDown);
    }

    // Process Command Function
    function processCommand(input) {
        const args = input.split(' ').filter(arg => arg);
        const commandName = args.shift();
        const command = commands[commandName];

        if (command) {
            try {
                let output = command.action(args);
                if (output instanceof Promise) {
                    output.then(result => {
                        if (typeof result === 'undefined') {
                            result = '';
                        }
                        printOutput('', result);
                        showPrompt();
                    }).catch(error => {
                        printOutput('', `<span class="color-red">Error: ${error}</span>`);
                        showPrompt();
                    });
                    return null; // Indicate that prompt will be shown after async operation
                } else {
                    if (typeof output === 'undefined') {
                        output = '';
                    }
                    return output;
                }
            } catch (error) {
                return `<span class="color-red">Error: ${error.message}</span>`;
            }
        } else if (input.trim() === '') {
            return '';
        } else {
            return `<span class="color-red">${commandName}: command not found</span>`;
        }
    }

    // Output Functions
    function printOutput(input, output) {
        let inputHTML = '';
        if (typeof input !== 'undefined' && input !== '') {
            inputHTML = `<div>${getPromptString()}${input}</div>`;
        }
        let outputHTML = '';
        if (typeof output !== 'undefined' && output !== '') {
            outputHTML = `<div>${output}</div>`;
        }
        terminalOutput.innerHTML += inputHTML + outputHTML;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function showPrompt() {
        promptString = getPromptString();
        terminalOutput.innerHTML += `<div id="current-line">${promptString}<span id="input-line"></span></div>`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function removeCurrentLine() {
        const currentLine = document.getElementById('current-line');
        if (currentLine) {
            currentLine.remove();
        }
    }

    function updateInputLine() {
        const inputLineElement = document.getElementById('input-line');
        if (inputLineElement) {
            inputLineElement.innerHTML = inputLine.replace(/ /g, '&nbsp;');
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }

    // Focus on the window to receive key events
    window.focus();

    // Initialize the terminal
    initializeTerminal();
});
