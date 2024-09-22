document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminal-output');
    let promptString = getPromptString();

    let isInitialized = false;
    let inputLine = ''; // Current input line
    let commandHistory = [];
    let historyIndex = -1;
    let currentPath = '/home/guest';

    // Startup Messages and ASCII Art
    const startupMessages = [
        'Initializing Jasper-OS...',
        'Loading modules...',
        'Starting services...',
        'Welcome to Jasper-OS!'
    ];

    const asciiArt = `
<span class="color-green">   ___  ___   ___________ ___________                </span>
<span class="color-green">  |_  |/ _ \\ /  ___| ___ \\  ___| ___ \\               </span>
<span class="color-green">    | / /_\\ \\\\ \`--.| |_/ / |__ | |_/ /_____ ___  ___ </span>
<span class="color-green">    | |  _  | \`--. \\  __/|  __||    /______/ _ \\/ __|</span>
<span class="color-green">/\\__/ / | | |/\\__/ / |   | |___| |\\ \\     | (_) \\__ \\</span>
<span class="color-green">\\____/\\_| |_/\\____/\\_|   \\____/\\_| \\_|     \\___/|___/</span>
<span class="color-green">                                                     </span>
<span class="color-green">                                                     </span>
`;

    // Virtual File System
    const fileSystem = {
        '/': {
            type: 'directory',
            contents: {
                'home': {
                    type: 'directory',
                    contents: {
                        'guest': {
                            type: 'directory',
                            contents: {
                                'docs': {
                                    type: 'directory',
                                    contents: {
                                        'resume.txt': {
                                            type: 'file',
                                            content: 'This is my resume.',
                                        },
                                        'project_list.txt': {
                                            type: 'file',
                                            content: 'List of projects.',
                                        },
                                    },
                                },
                                'photos': {
                                    type: 'directory',
                                    contents: {
                                        'vacation.jpg': {
                                            type: 'file',
                                            content: '[Image content]',
                                        },
                                        'profile.png': {
                                            type: 'file',
                                            content: '[Image content]',
                                        },
                                    },
                                },
                                'scripts': {
                                    type: 'directory',
                                    contents: {
                                        'hello_world.js': {
                                            type: 'file',
                                            content: 'console.log("Hello, world!");',
                                            executable: true,
                                        },
                                        'calculator.py': {
                                            type: 'file',
                                            content: 'print("Calculator script")',
                                            executable: true,
                                        },
                                    },
                                },
                                'about.txt': {
                                    type: 'file',
                                    content: 'Hello! I am [Your Name], a coder and gamer. Welcome to my website!',
                                },
                                'contact.txt': {
                                    type: 'file',
                                    content: 'Email: your.email@example.com\nGitHub: github.com/yourusername',
                                },
                            },
                        },
                    },
                },
                'var': {
                    type: 'directory',
                    contents: {
                        'log': {
                            type: 'directory',
                            contents: {
                                'system.log': {
                                    type: 'file',
                                    content: 'System log contents.',
                                },
                            },
                        },
                    },
                },
                'etc': {
                    type: 'directory',
                    contents: {
                        'config.cfg': {
                            type: 'file',
                            content: 'Configuration settings.',
                        },
                    },
                },
            },
        },
    };

    // Helper Functions for File System
    function resolvePath(path) {
        if (!path.startsWith('/')) {
            path = currentPath + '/' + path;
        }
        const parts = path.split('/').filter(part => part && part !== '.');
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

    function getPathObject(path) {
        let resolvedPath = resolvePath(path);
        let parts = resolvedPath.split('/').filter(Boolean);
        let obj = fileSystem['/'];
        for (let part of parts) {
            if (obj.type === 'directory' && obj.contents[part]) {
                obj = obj.contents[part];
            } else {
                return null;
            }
        }
        return obj;
    }

    // Function to generate ASCII tree
    function generateTree(obj, prefix = '') {
        let tree = '';
        const entries = Object.entries(obj.contents);
        entries.forEach((entry, index) => {
            const [name, item] = entry;
            const isLast = index === entries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            tree += `${prefix}${connector}${name}\n`;
            if (item.type === 'directory') {
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                tree += generateTree(item, newPrefix);
            }
        });
        return tree;
    }

    // Commands
    const commands = {
        help: {
            description: 'List available commands',
            action: function() {
                let commandList = '';
                for (let cmd in commands) {
                    commandList += `<span class="color-green">${cmd}</span> - ${commands[cmd].description}\n`;
                }
                return commandList.trim();
            }
        },
        ls: {
            description: 'List directory contents',
            action: function(args) {
                let path = args[0] || '.';
                const dir = getPathObject(path);
                if (dir && dir.type === 'directory') {
                    return generateTree(dir);
                } else {
                    return `ls: cannot access '${path}': No such file or directory`;
                }
            }
        },
        cd: {
            description: 'Change directory',
            action: function(args) {
                let path = args[0];
                if (!path) {
                    // Go to home directory
                    currentPath = '/home/guest';
                    return '';
                }
                const dir = getPathObject(path);
                if (dir && dir.type === 'directory') {
                    currentPath = resolvePath(path);
                    return '';
                } else {
                    return `cd: ${path}: No such file or directory`;
                }
            }
        },
        cat: {
            description: 'Read file contents',
            action: function(args) {
                let path = args[0];
                const file = getPathObject(path);
                if (file && file.type === 'file') {
                    return file.content;
                } else {
                    return `cat: ${path}: No such file or directory`;
                }
            }
        },
        edit: {
            description: 'Edit a file',
            action: function(args) {
                let path = args[0];
                const file = getPathObject(path);
                if (file && file.type === 'file') {
                    return new Promise((resolve) => {
                        openEditor(file, resolve);
                    });
                } else {
                    return `edit: ${path}: No such file or directory`;
                }
            }
        },
        clear: {
            description: 'Clear the terminal screen',
            action: function() {
                terminalOutput.innerHTML = '';
                return '';
            }
        },
        echo: {
            description: 'Display a line of text',
            action: function(args) {
                return args.join(' ');
            }
        },
        date: {
            description: 'Display the current date and time',
            action: function() {
                return new Date().toString();
            }
        },
        whoami: {
            description: 'Display the current user',
            action: function() {
                return 'guest';
            }
        },
        uname: {
            description: 'Display system information',
            action: function(args) {
                if (args[0] === '-a') {
                    return 'Jasper-OS 1.0.0 x86_64 GNU/Linux';
                } else {
                    return 'Jasper-OS';
                }
            }
        },
        pwd: {
            description: 'Print working directory',
            action: function() {
                return currentPath;
            }
        },
        history: {
            description: 'Show command history',
            action: function() {
                return commandHistory.join('\n');
            }
        },
        sudo: {
            description: 'Execute a command as superuser',
            action: function() {
                return 'guest is not in the sudoers file. This incident will be reported.';
            }
        },
        exit: {
            description: 'Exit the terminal',
            action: function() {
                window.close();
                return 'Session terminated.';
            }
        },
        // Additional commands can be added here
    };

    // Editor Function
    function openEditor(file, callback) {
        removeCurrentLine();
        terminalOutput.innerHTML += `<div>Edit mode - Press ESC to exit</div>`;
        let editorContent = file.content;
        terminalOutput.innerHTML += `<div id="editor"><pre>${editorContent}</pre></div>`;
        let editorMode = true;

        function editorKeyHandler(event) {
            if (event.key === 'Escape') {
                // Exit editor
                document.removeEventListener('keydown', editorKeyHandler);
                file.content = editorContent;
                editorMode = false;
                showPrompt();
                callback('');
            } else if (event.key === 'Backspace') {
                editorContent = editorContent.slice(0, -1);
                updateEditorContent(editorContent);
                event.preventDefault();
            } else if (event.key === 'Enter') {
                editorContent += '\n';
                updateEditorContent(editorContent);
            } else if (event.key.length === 1) {
                editorContent += event.key;
                updateEditorContent(editorContent);
            }
        }

        document.addEventListener('keydown', editorKeyHandler);

        function updateEditorContent(content) {
            const editorElement = document.getElementById('editor').querySelector('pre');
            editorElement.textContent = content;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }

    // Prompt String
    function getPromptString() {
        const pathDisplay = currentPath === '/home/guest' ? '~' : currentPath.replace('/home/guest', '~');
        return `<span class="color-green">guest</span>@<span class="color-blue">Jasper-OS</span>:<span class="color-cyan">${pathDisplay}</span>$&nbsp;`;
    }

    // Initialize Terminal
    function initializeTerminal() {
        isInitialized = true;
        printOutput('', asciiArt);
        simulateStartupMessages(0);
    }

    function simulateStartupMessages(index) {
        if (index < startupMessages.length) {
            printOutput('', startupMessages[index]);
            setTimeout(() => {
                simulateStartupMessages(index + 1);
            }, 500);
        } else {
            printOutput('', 'Type <span class="color-green">\'help\'</span> to see a list of available commands.\n');
            showPrompt();
        }
    }

    function processCommand(input) {
        const args = input.split(' ').filter(arg => arg);
        const commandName = args.shift();
        const command = commands[commandName];

        if (command) {
            let output = command.action(args);
            if (output instanceof Promise) {
                output.then(result => {
                    if (result) {
                        printOutput('', result);
                    }
                    showPrompt();
                });
                return null; // Indicate that prompt will be shown after async operation
            } else {
                return output;
            }
        } else if (input.trim() === '') {
            return '';
        } else {
            return `<span class="color-red">${commandName}: command not found</span>`;
        }
    }

    function printOutput(input, output) {
        let inputHTML = '';
        if (input) {
            inputHTML = `<div>${getPromptString()}${input}</div>`;
        }
        const outputHTML = output ? `<div>${output}</div>` : '';
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

    document.addEventListener('keydown', function(event) {
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
                if (output !== '') {
                    printOutput(inputLine, output);
                }
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
    });

    // Focus on the window to receive key events
    window.focus();

    // Initialize the terminal
    initializeTerminal();
});
