document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. JavaScript is running.');

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
    // (Same as previous code)
    // Add console.log statements as needed

    // Helper Functions for File System
    // (Same as previous code)
    // Add console.log statements as needed

    // Function to generate ASCII tree
    // (Same as previous code)
    // Add console.log statements as needed

    // Commands
    // (Same as previous code)
    // Add console.log statements in command actions if necessary

    // Editor Function
    // (Same as previous code)
    // Add console.log statements as needed

    // Initialize Terminal
    function initializeTerminal() {
        console.log('Initializing terminal...');
        printOutput('', asciiArt);
        simulateStartupMessages(0, () => {
            isInitialized = true; // Only set to true after startup sequence
            printOutput('', 'Type <span class="color-green">\'help\'</span> to see a list of available commands.\n');
            showPrompt();
            addEventListeners(); // Add event listeners after initialization
            console.log('Terminal initialized and ready for input.');
        });
    }

    function simulateStartupMessages(index, callback) {
        if (index < startupMessages.length) {
            printOutput('', startupMessages[index]);
            console.log(`Startup message displayed: ${startupMessages[index]}`);
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
        console.log(`Key pressed: ${key}`);

        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            inputLine += key;
        } else if (key === 'Backspace') {
            inputLine = inputLine.slice(0, -1);
        } else if (key === 'Enter') {
            removeCurrentLine();
            commandHistory.push(inputLine);
            historyIndex = commandHistory.length;
            console.log(`Command entered: ${inputLine}`);
            let output = processCommand(inputLine);
            if (output !== null) { // Only show prompt if command is not asynchronous
                if (output !== '') {
                    printOutput(inputLine, output);
                } else {
                    printOutput(inputLine, '');
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
    }

    function addEventListeners() {
        document.addEventListener('keydown', onKeyDown);
        console.log('Event listeners added.');
    }

    function removeEventListeners() {
        document.removeEventListener('keydown', onKeyDown);
    }

    // Process Command Function
    function processCommand(input) {
        const args = input.split(' ').filter(arg => arg);
        const commandName = args.shift();
        const command = commands[commandName];

        console.log(`Processing command: ${commandName} with arguments: ${args}`);

        if (command) {
            let output = command.action(args);
            if (output instanceof Promise) {
                output.then(result => {
                    if (result !== '') {
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

    // Output Functions
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

    // Focus on the window to receive key events
    window.focus();

    // Initialize the terminal
    initializeTerminal();
});
