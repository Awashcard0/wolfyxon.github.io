let allowInput = true;
let commandActive = false;

const commands = [];

/* --== Getters ==-- */

function getConsole() {
    return document.getElementById("console");
}

function getPrompt() {
    return document.getElementById("prompt");
}

function getInput() {
    return document.getElementById("input");
}

/* --== Printing ==-- */

function echoHTML(html) {
   getConsole().innerHTML += html;
}

function echo(text) {
    const pre = document.createElement("pre");
    pre.innerText = text;

    getConsole().append(pre);
}


/* --== Command processing ==-- */

class CommandContext {
    constructor(command, args, flags) {
        this.argValues = {};
        this.command = command;
        this.args = args;
        this.flags = flags;

        for(let i = 0; i < args.length; i++) {
            const arg = args[i];
            const argInfo = this.command.args[i];
            if(!argInfo) break;

            this.argValues[argInfo.name] = arg;
        }
    }

    getArg(name) {
        return this.argValues[name];
    }
}

class Command {
    constructor(prefixes) {
        this.prefixes = prefixes;
        this.args = [];
        
    }

    setCallback(callback) {
        this.callback = callback;

        return this;
    }

    addArg(name, description, required) {
        this.args.push({
            name: name,
            description: description,
            required: required
        });

        return this;
    }

    execute(args, flags) {
        const ctx = new CommandContext(this, args, flags);
        console.log(ctx)
        this.callback(ctx);
    }
}

function registerCommand(command) {
    commands.push(command);
}


function execute(text) {    
    const chars = text.split("");
    if(chars.length === 0) return;

    // Split the string by spaces, " and '
    let split = [];
    let current = "";
    let strOpen = null;
    for(const char of chars) {
        if(char == "\"" || char == "'") {
            if(strOpen) {
                if(char == strOpen) {
                    strOpen = null;
                }
            } else {
                strOpen = char;
            }
        } else {
            if(char == " " && !strOpen) {
                split.push(current);
                current = "";
                continue;
            }
        }

        current += char;
    }

    if(strOpen) {
        echo(`error: Expected closing ${strOpen}`)
        return;
    }

    if(current != "") {
        split.push(current);
    }

    // Separate arguments from flags

    let args = [];
    let flags = [];

    for(const param of split) {
        if(param.startsWith("--")) {
            flags.push(param.replace("--", ""));
        } else {
            args.push(param);
        }
    }

    // Execute the command
    const prefix = split[0];

    for(const cmd of commands) {

        if(cmd.prefixes.includes(prefix)) {
            cmd.execute(args, flags);
            return;
        }
    }

    echo(`bash: ${prefix}: command not found`);
}

/* --== Input processing ==-- */

function sendText(text) {
    if(!allowInput) return;
    let prefix = "";

    if(!commandActive) prefix = getPrompt().innerText;

    echo(prefix + " " + text);

    if(!commandActive) execute(text);
}

function focusInput() {
    getInput().focus();
}

window.addEventListener("load", () => {
    const input = getInput();
    
    window.addEventListener("keydown", (e) => {
        if(document.activeElement !== input) return;

        if(e.key == "Enter") {
            const txt = input.value;
            input.value = "";
            sendText(txt);
        }
    });

    document.getElementById("main").addEventListener("click", focusInput);

    focusInput();
});