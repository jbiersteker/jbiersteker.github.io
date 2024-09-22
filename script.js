document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const promptString = 'guest@mywebsite:~$';

    const commands = {
        help: {
            description: 'List available commands',
            action: function() {
                let commandList = '';
                for (let cmd in commands) {
                    commandList += `${cmd} - ${commands[cmd].description}\n`;
                }
                return commandList.trim();
            }
        },
        ls: {
            description: 'List directory contents',
            action: function() {
                return 'projects  games  about.txt  contact.txt';
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
                        return 'Hello! I am [Your Name], a coder and gamer. Welcome to my website!';
                    case 'contact.txt':
                        return 'Email: your.email@example.com\nGitHub: github.com/yourusername';
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
                    return 'Linux mywebsite 5.4.0-42-generic x86_64 GNU/Linux';
                } else {
                    return 'Linux';
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

    let commandHistory = [];
    let historyIndex = -1;

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
            output = `${commandName}: command not found`;
        }

        return output;
    }

    function printOutput(input, output) {
        const inputLine = `<div><span>${promptString}</span> ${input}</div>`;
        const outputLine = output ? `<div>${output}</div>` : '';
        terminalOutput.innerHTML += inputLine + outputLine;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    terminalInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const input = terminalInput.value.trim();
            commandHistory.push(input);
            historyIndex = commandHistory.length;
            const output = processCommand(input);
            printOutput(input, output);
            terminalInput.value = '';
        } else if (event.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            }
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
            event.preventDefault();
        }
    });

    // Focus on input when anywhere in the terminal is clicked
    document.getElementById('terminal').addEventListener('click', () => {
        terminalInput.focus();
    });
});
