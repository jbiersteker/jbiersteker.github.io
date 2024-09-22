document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminal-output');
    const promptString = '<span class="color-green">guest</span>@<span class="color-blue">Jasper-OS</span>:<span class="color-cyan">~</span>$&nbsp;';

    let isInitialized = false;
    let inputLine = ''; // Current input line
    let commandHistory = [];
    let historyIndex = -1;

    // Startup Messages and ASCII Art
    const startupMessages = [
        'Initializing Jasper-OS...',
        'Loading modules...',
        'Starting services...',
        'Welcome to Jasper-OS!'
    ];

    const asciiArt = `
<span class="color-green">      ___           ___           ___           ___           ___           ___           ___</span>
<span class="color-green">     /\\  \\         /\\__\\         /\\__\\         /\\  \\         /\\  \\         /\\  \\         /\\__\\</span>
<span class="color-green">    /::\\  \\       /:/ _/_       /:/ _/_       /::\\  \\       \\:\\  \\       /::\\  \\       /:/ _/_</span>
<span class="color-green">   /:/\\:\\  \\     /:/ /\\__\\     /:/ /\\__\\     /:/\\:\\  \\       \\:\\  \\     /:/\\:\\  \\     /:/ /\\__\\</span>
<span class="color-green">  /:/  \\:\\  \\   /:/ /:/ _/_   /:/ /:/ _/_   /:/  \\:\\  \\  ___  \\:\\  \\   /:/  \\:\\  \\   /:/ /:/ _/_</span>
<span class="color-green"> /:/__/ \\:\\__\\ /:/_/:/ /\\__\\ /:/_/:/ /\\__\\ /:/__/ \\:\\__\\/\\  \\ \\:\\__\\ /:/__/ \\:\\__\\ /:/_/:/ /\\__\\</span>
<span class="color-green"> \\:\\  \\ /:/  / \\:\\/:/ /:/  / \\:\\/:/ /:/  / \\:\\  \\ /:/  /\\:\\  \\ /:/  / \\:\\  \\ /:/  / \\:\\/:/ /:/  /</span>
<span class="color-green">  \\:\\  /:/  /   \\::/_/:/  /   \\::/_/:/  /   \\:\\  /:/  /  \\:\\  /:/  /   \\:\\  /:/  /   \\::/_/:/  /</span>
<span class="color-green">   \\:\\/:/  /     \\:\\/:/  /     \\:\\/:/  /     \\:\\/:/  /    \\:\\/:/  /     \\:\\/:/  /     \\:\\/:/  /</span>
<span class="color-green">    \\::/  /       \\::/  /       \\::/  /       \\::/  /      \\::/  /       \\::/  /       \\::/  /</span>
<span class="color-green">     \\/__/         \\/__/         \\/__/         \\/__/        \\/__/         \\/__/         \\/__/</span>
`;

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
            action: function() {
                return '<span class="color-blue">projects</span>  <span class="color-blue">games</span>  <span class="color-white">about.txt</span>  <span class="color-white">contact.txt</span>';
            }
        },
        cd: {
            description: 'Change directory',
            action: function(args) {
                return 'Permission denied';
            }
        },
        cat: {
            description: 'Read file contents',
            action: function(args) {
                switch (args[0]) {
                    case 'about.txt':
                        return 'Hello! I am <span class="color-green">[Your Name]</span>, a coder and gamer. Welcome to my website!';
                    case 'contact.txt':
                        return 'Email: <span class="color-cyan">your.email@example.com</span>\nGitHub: <span class="color-cyan">github.com/yourusername</span>';
                    default:
                        return `cat: ${args[0]}: No such file or directory`;
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
                return '/home/guest';
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
        games: {
            description: 'List available games',
            action: function() {
                return '1. Snake\n2. Tetris\n3. Pong\nType \'play [game]\' to start a game.';
            }
        },
        play: {
            description: 'Play a game',
            action: function(args) {
                switch (args[0]) {
                    case 'snake':
                        return 'Starting Snake... (Not implemented)';
                    case 'tetris':
                        return 'Starting Tetris... (Not implemented)';
                    case 'pong':
                        return 'Starting Pong... (Not implemented)';
                    default:
                        return `play: ${args[0]}: Game not found`;
                }
            }
        },
        exit: {
            description: 'Exit the terminal',
            action: function() {
                window.close();
                return 'Session terminated.';
            }
        },
        // Add more commands here
    };

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

        let output = '';

        if (command) {
            output = command.action(args);
        } else if (input.trim() === '') {
            output = '';
        } else {
            output = `<span class="color-red">${commandName}: command not found</span>`;
        }

        return output;
    }

    function printOutput(input, output) {
        let inputHTML = '';
        if (input) {
            inputHTML = `<div>${promptString}${input}</div>`;
        }
        const outputHTML = output ? `<div>${output}</div>` : '';
        terminalOutput.innerHTML += inputHTML + outputHTML;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function showPrompt() {
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

        const key = event.key;

        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            inputLine += key;
        } else if (key === 'Backspace') {
            inputLine = inputLine.slice(0, -1);
        } else if (key === 'Enter') {
            removeCurrentLine();
            commandHistory.push(inputLine);
            historyIndex = commandHistory.length;
            const output = processCommand(inputLine);
            printOutput(inputLine, output);
            inputLine = '';
            showPrompt();
        } else if (key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                inputLine = commandHistory[historyIndex];
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
