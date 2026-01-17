/* --- docs.js --- */


const installBtn = document.getElementById('triggerInstallBtn');
const modal = document.getElementById('installModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const startInstallBtn = document.getElementById('startInstallBtn');
const cancelInstallBtn = document.getElementById('cancelInstallBtn');
const osSelect = document.getElementById('osSelect');
const osVersionInput = document.getElementById('osVersion');

const step1 = document.getElementById('installStep1');
const step2 = document.getElementById('installStep2');

const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const consoleOutput = document.getElementById('consoleOutput');

if(installBtn) {
    installBtn.addEventListener('click', () => {
        osSelect.value = ""; 
        osVersionInput.value = "latest";
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        modal.classList.add('active');
    });
}


if(cancelInstallBtn) {
    cancelInstallBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

if(closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}


if(startInstallBtn) {
    startInstallBtn.addEventListener('click', () => {
        const osType = osSelect.value;
        const osVer = osVersionInput.value.trim() || "Standard";

        if (!osType) {
            alert("Please select an Operating System.");
            return;
        }


        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        

        progressBar.style.width = '0%';
        consoleOutput.innerHTML = '';
        closeModalBtn.style.display = 'none';
        statusText.style.color = 'var(--text-gray)';


        runSimulation(osType, osVer);
    });
}


function logToConsole(msg, type = 'info') {
    const line = document.createElement('span');
    line.className = `console-line ${type}`;
    const timestamp = new Date().toLocaleTimeString('en-US', {hour12: false, hour: "numeric", minute: "numeric", second: "numeric"});
    line.textContent = `[${timestamp}] ${msg}`;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}


function runSimulation(osType, osVer) {
    let steps = [];


    if (osType === 'windows') {
        steps = [
            { pct: 10, status: 'Checking Registry...', log: `Detected OS: Windows ${osVer}`, type: 'info' },
            { pct: 25, status: 'Downloading...', log: 'Connecting to vixlanguage.github.io...', type: 'info' },
            { pct: 40, status: 'Downloading .exe...', log: 'Downloading vix_setup_x64.exe (14.2 MB)...', type: 'warn' },
            { pct: 60, status: 'Installing...', log: 'Extracting files to Program Files...', type: 'info' },
            { pct: 80, status: 'Setting Path...', log: 'Updating PATH environment variable...', type: 'warn' },
            { pct: 95, status: 'Verifying...', log: 'Checksum verified successfully.', type: 'success' },
            { pct: 100, status: 'Done!', log: 'Installation Complete. Restart terminal.', type: 'success' }
        ];
    } else if (osType === 'linux') {
        steps = [
            { pct: 10, status: 'Detecting Distro...', log: `Target System: Linux ${osVer}`, type: 'info' },
            { pct: 25, status: 'Updating Lists...', log: 'Running apt-get update...', type: 'warn' },
            { pct: 40, status: 'Fetching Binary...', log: 'Downloading vix-linux-amd64...', type: 'info' },
            { pct: 60, status: 'Dependencies...', log: 'Installing clang, libssl-dev...', type: 'info' },
            { pct: 75, status: 'Permissions...', log: 'chmod +x /usr/local/bin/vix', type: 'warn' },
            { pct: 90, status: 'Compiling Libs...', log: 'Building std.vx...', type: 'info' },
            { pct: 100, status: 'Done!', log: 'Run "vix --version" to verify.', type: 'success' }
        ];
    } else if (osType === 'macos') {
        steps = [
            { pct: 10, status: 'Checking Build...', log: `Target System: macOS ${osVer}`, type: 'info' },
            { pct: 25, status: 'Checking Xcode...', log: 'xcode-select --install verification...', type: 'info' },
            { pct: 45, status: 'Downloading...', log: 'Fetching vix-macos-universal.pkg...', type: 'warn' },
            { pct: 65, status: 'Mounting...', log: 'Mounting /Volumes/VixInstaller...', type: 'info' },
            { pct: 85, status: 'Copying...', log: 'Symlinking executables...', type: 'info' },
            { pct: 100, status: 'Done!', log: 'Ready to compile.', type: 'success' }
        ];
    }

    let currentStep = 0;
    

    const interval = setInterval(() => {
        if (currentStep >= steps.length) {
            clearInterval(interval);
            statusText.style.color = '#10b981';
            closeModalBtn.style.display = 'block';
            return;
        }

        const step = steps[currentStep];
        

        progressBar.style.width = `${step.pct}%`;
        statusText.textContent = step.status;
        logToConsole(step.log, step.type);

        currentStep++;
    }, 800);
}



const highlightVix = (code) => {

    let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');


    html = html.replace(/("([^"\\]*(\\.[^"\\]*)*)")|('([^'\\]*(\\.[^'\\]*)*)')/g, (match) => {
        return `<span class="code-string">${match}</span>`;
    });


    html = html.replace(/(\/\/.*)|(#.*)/g, '<span class="code-comment">$1$2</span>');


    const keywords = [
        "func", "end", "struct", "enum", "impl", "match", "case", 
        "mut", "ref", "brw", "unsafe", "pub", "public", "private", "scope",
        "return", "if", "elif", "else", "while", "for", "forever", 
        "do", "break", "continue", "import", "from", "as", "use", 
        "const", "let", "create", "mod", "module", "package",
        "true", "false", "None", "Some", "Ok", "Err", "Result", "Option"
    ];
    
    keywords.sort((a, b) => b.length - a.length);
    
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    html = html.replace(keywordPattern, '<span class="code-keyword">$1</span>');


    const types = ["int", "uint", "float", "str", "char", "bool", "void", "any", "ptr", "usize", "isize", "i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64"];
    const typePattern = new RegExp(`\\b(${types.join('|')})\\d*\\b`, 'g');
    html = html.replace(typePattern, '<span class="code-type">$1</span>');


    html = html.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="code-numeric">$1</span>');


    html = html.replace(/\b([a-zA-Z_]\w*)(?=\()/g, (match) => {
        if (keywords.includes(match)) return match;
        return `<span class="code-function">${match}</span>`;
    });

    return html;
};

const highlightPowerShell = (code) => {
    let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/(#[^\n]*)/g, '<span class="code-comment">$1</span>');
    html = html.replace(/("([^"]*)")/g, '<span class="code-string">$1</span>');
    html = html.replace(/(\$[a-zA-Z0-9_]+)/g, '<span class="code-const">$1</span>');
    const commands = ["Write-Host", "Invoke-Expression", "iex", "Invoke-RestMethod", "irm", "Get-Command", "pacman"];
    const cmdPattern = new RegExp(`\\b(${commands.join('|')})\\b`, 'gi');
    html = html.replace(cmdPattern, '<span class="code-function">$1</span>');
    return html;
};

const highlightBash = (code) => {
    let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/(#[^\n]*)/g, '<span class="code-comment">$1</span>');
    html = html.replace(/(--?[a-zA-Z0-9\-]+)/g, '<span class="code-attribute">$1</span>');
    const commands = ["curl", "wget", "bash", "git", "npm", "make", "gcc", "clang", "vix", "rm", "cp", "mv", "mkdir", "sudo", "apt", "dnf", "pacman", "xcode-select"];
    const cmdPattern = new RegExp(`^\\s*(${commands.join('|')})`, 'gm');
    html = html.replace(cmdPattern, '<span class="code-function">$1</span>');
    return html;
};


function convertSidebarToCollapsible() {
    const sidebarSections = document.querySelectorAll('.sidebar .sidebar-section');
    
    sidebarSections.forEach(section => {
        const h3 = section.querySelector('h3');
        if (!h3) return;
        

        const h3Text = h3.textContent;
        const button = document.createElement('button');
        button.className = 'sidebar-h2';
        button.innerHTML = `<span class="arrow">›</span> ${h3Text}`;
        

        const links = section.querySelectorAll('.sidebar-link');
        if (links.length > 0) {
            const subList = document.createElement('div');
            subList.className = 'sidebar-sublist';
            
            links.forEach(link => {
                link.classList.add('sidebar-h3');
                link.classList.remove('sidebar-link');
                subList.appendChild(link);
            });
            

            h3.replaceWith(button);
            

            button.after(subList);
            

            section.classList.add('expanded');
            

            button.addEventListener('click', (e) => {
                e.preventDefault();
                section.classList.toggle('expanded');
            });
        }
    });
    

    document.querySelectorAll('.sidebar-h3').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            

            document.querySelectorAll('.sidebar-h3').forEach(l => l.classList.remove('active'));
            

            link.classList.add('active');
            

            const parentSection = link.closest('.sidebar-section');
            if (parentSection) {
                parentSection.classList.add('expanded');
            }
            
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {

    convertSidebarToCollapsible();
    document.querySelectorAll('.code-block').forEach(block => {
        const codeEl = block.querySelector('code');
        if (!codeEl) return;
        
        const lang = block.getAttribute('data-lang');
        const text = codeEl.textContent;

        let highlighted = '';
        if (lang === 'vix') highlighted = highlightVix(text);
        else if (lang === 'powershell') highlighted = highlightPowerShell(text);
        else if (lang === 'bash') highlighted = highlightBash(text);
        else highlighted = text;

        codeEl.innerHTML = highlighted;
    });


    document.querySelectorAll('.code-block').forEach(block => {
        if (block.querySelector('.copy-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> Copy`;
        
        btn.addEventListener('click', () => {
            const text = block.querySelector('code').innerText;
            navigator.clipboard.writeText(text).then(() => {
                btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Copied!`;
                btn.style.color = '#10b981'; 
                setTimeout(() => {
                    btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> Copy`;
                    btn.style.color = '';
                }, 2000);
            });
        });
        block.appendChild(btn);
    });


    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                

                document.querySelectorAll('.sidebar-h3').forEach(link => {
                    link.classList.remove('active');
                });
                

                const matchingLink = document.querySelector(`.sidebar-h3[href="#${id}"]`);
                if (matchingLink) {
                    matchingLink.classList.add('active');
                    

                    const parentSection = matchingLink.closest('.sidebar-section');
                    if (parentSection) {
                        parentSection.classList.add('expanded');
                    }
                }
            }
        });
    }, { threshold: 0.2, rootMargin: "-80px 0px -80% 0px" });
    sections.forEach(section => observer.observe(section));
});


window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});