
const navbar = document.querySelector('.top_frame');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

function createLoadingBar() {
    const loadingBar = document.createElement('div');
    loadingBar.id = 'loading-bar';
    loadingBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #4a59ff, #a855f7, #68009d);
        z-index: 10000;
        transition: width 0.3s ease;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
    `;
    document.body.appendChild(loadingBar);
    return loadingBar;
}

function animateLoadingBar(loadingBar, callback) {
    let progress = 0;
    const intervals = [
        { target: 30, duration: 200 },
        { target: 60, duration: 300 },
        { target: 90, duration: 400 },
        { target: 100, duration: 200 }
    ];
    
    let currentInterval = 0;
    
    function updateProgress() {
        if (currentInterval >= intervals.length) {
            setTimeout(() => {
                loadingBar.style.opacity = '0';
                setTimeout(() => {
                    loadingBar.remove();
                    if (callback) callback();
                }, 300);
            }, 100);
            return;
        }
        
        const interval = intervals[currentInterval];
        const startProgress = progress;
        const targetProgress = interval.target;
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const percent = Math.min(elapsed / interval.duration, 1);
            
            progress = startProgress + (targetProgress - startProgress) * percent;
            loadingBar.style.width = progress + '%';
            
            if (percent < 1) {
                requestAnimationFrame(animate);
            } else {
                currentInterval++;
                updateProgress();
            }
        }
        
        animate();
    }
    
    updateProgress();
}

function navigateWithLoading(url) {
    const loadingBar = createLoadingBar();

    document.body.style.pointerEvents = 'none';
    document.body.style.opacity = '0.7';
    
    animateLoadingBar(loadingBar, () => {
        window.location.href = url;
    });
}

const navButtons = document.querySelectorAll('.nav_button');
navButtons.forEach(button => {
    button.addEventListener('click', (input) => {
        input.preventDefault();
        const buttonText = button.textContent.toLowerCase();

        if (buttonText === 'docs') {
            navigateWithLoading('/home/src/docs/docs.html');
        } else if (buttonText === 'download') {
            navigateWithLoading('/website/src/download/download.html');
        } else if (buttonText === 'libraries') {
            navigateWithLoading('/website/src/libraries/libraries.html');
        } else if (buttonText === 'support') {
            navigateWithLoading('/website/src/support/support.html');
        }
    });
});

const installButton = document.querySelector('.install_button');
const libraryButton = document.querySelector('.library_button');

if (installButton) {
    installButton.addEventListener('click', (e) => {
        e.preventDefault();
        navigateWithLoading('/website/src/download/download.html');
    });
}

if (libraryButton) {
    libraryButton.addEventListener('click', (e) => {
        e.preventDefault();
        navigateWithLoading('/website/src/libraries/libraries.html');
    });
}

window.addEventListener('DOMContentLoaded', () => {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        monaco.languages.register({ id: 'vix' });
        monaco.languages.setMonarchTokensProvider('vix', {
            keywords: [
                'func', 'var', 'const', 'if', 'else', 'while', 'for', 'return',
                'import', 'export', 'class', 'struct', 'interface', 'type',
                'true', 'false', 'null', 'undefined', 'new', 'delete',
                'public', 'private', 'protected', 'static', 'async', 'await',
                'try', 'catch', 'finally', 'throw', 'break', 'continue', 'end'
            ],
            typeKeywords: [
                'int', 'float', 'string', 'bool', 'void', 'array', 'map'
            ],
            operators: [
                '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
                '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
                '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
                '%=', '<<=', '>>=', '>>>='
            ],
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

            tokenizer: {
                root: [
                    [/[a-z_$][\w$]*/, {
                        cases: {
                            '@typeKeywords': 'type.identifier',
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],
                    [/[A-Z][\w\$]*/, 'type.identifier'],
                    { include: '@whitespace' },
                    [/[{}()\[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'operator',
                            '@default': ''
                        }
                    }],
                    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/\d+/, 'number'],
                    [/[;,.]/, 'delimiter'],
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                    [/'[^\\']'/, 'string'],
                    [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                    [/'/, 'string.invalid']
                ],

                comment: [
                    [/[^\/*]+/, 'comment'],
                    [/\/\*/, 'comment', '@push'],
                    ["\\*/", 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ],

                string: [
                    [/[^\\"]+/, 'string'],
                    [/@escapes/, 'string.escape'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
                ],

                whitespace: [
                    [/[ \t\r\n]+/, 'white'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\/\/.*$/, 'comment'],
                ],
            },
        });

        monaco.editor.defineTheme('vix-friendly', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
                { token: 'type.identifier', foreground: '10b981' },
                { token: 'identifier', foreground: 'e2e8f0' },
                { token: 'string', foreground: 'fbbf24' },
                { token: 'number', foreground: 'ec4899' },
                { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
                { token: 'operator', foreground: '94a3b8' },
            ],
            colors: {
                'editor.background': '#1a1a2e',
                'editor.foreground': '#e2e8f0',
                'editorLineNumber.foreground': '#475569',
                'editorCursor.foreground': '#a78bfa',
                'editor.selectionBackground': '#7c3aed40',
                'editor.lineHighlightBackground': '#1e1e35'
            }
        });

        const defaultCode = `// Welcome to Vix! :D!


func greet(name: String): String
    return "Hello, " + name + ", :D!"
end

func main():

    var friends = ["Alice", "Bob", "Charlie"]
    

    for friend in friends {
        var message = greet(friend)
        print(message)
    }
    

    var sum = add(10, 20)
    print("10 + 20 = " + sum)
end

func add(a: int, b: int) -> int {
    return a + b
}


 `;

 
        const clearBtn = document.querySelector('.btn-clear');
        const runBtn = document.querySelector('.btn-run');
        const editor = monaco.editor.create(document.getElementById('editor-area'), {
            value: defaultCode,
            language: 'vix',
            theme: 'vix-friendly',
            fontSize: 15,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: true },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true
        });

        clearBtn.addEventListener('click', () => {
            editor.setValue('// Start coding here! ✨\n\n');
            editor.focus();
        });

        runBtn.addEventListener('click', () => {
            const code = editor.getValue();
            console.log('Running Vix code:', code);
            

            runBtn.textContent = '⏳ Running...';
            runBtn.style.opacity = '0.7';
            
            setTimeout(() => {
                runBtn.textContent = '▶ Run';
                runBtn.style.opacity = '1';
                
                const codePreview = code.substring(0, 80).replace(/\n/g, ' ');
                alert('success: Your Vix code is ready!\n\n' + 
                      'Code execution will be available soon.\n\n' +
                      'Preview: ' + codePreview + '...');
            }, 600);
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
            runBtn.click();
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const primaryBtn = document.querySelector('.btn-primary');
    const secondaryBtn = document.querySelector('.btn-secondary');
    const navCta = document.querySelector('.nav-cta');
    
    if (primaryBtn) {
        primaryBtn.addEventListener('click', () => {
            alert('🚀 Installation guide coming soon!\n\nFor now, check out the docs to get started.');
        });
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', () => {
            alert('📚 Documentation is being prepared!\n\nStay tuned for comprehensive guides and tutorials.');
        });
    }
    
    if (navCta) {
        navCta.addEventListener('click', () => {
            document.querySelector('.hero').scrollIntoView({ behavior: 'smooth' });
        });
    }
});