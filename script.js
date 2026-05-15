// Smooth scroll navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add active class to nav link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    
    const sections = document.querySelectorAll('.subject-section, #home');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add hover effect to cards
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.cursor = 'pointer';
    });
});

// Search functionality (optional enhancement)
function searchContent(searchTerm) {
    const cards = document.querySelectorAll('.card');
    let found = 0;

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
            found++;
        } else {
            card.style.display = 'none';
        }
    });

    return found;
}

// Log welcome message
console.log('%cWelcome to Zakariya\'s Learning Hub! 📚', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cHappy learning!', 'color: #764ba2; font-size: 14px;');

// Intersection Observer for fade-in animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// Print functionality for studying
function printSection(sectionId) {
    const element = document.querySelector(sectionId);
    if (element) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(element.innerHTML);
        printWindow.document.close();
        printWindow.print();
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Could implement a search modal here
    }
    
    // Escape to scroll to top
    if (e.key === 'Escape') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Simple tip system
const tips = [
    "Use Ctrl+F to search on this page!",
    "Click on any subject in the navigation to jump to it.",
    "Hover over cards for a nice effect!",
    "Use Escape key to quickly scroll to top.",
    "All topics are organized by subject for easy studying."
];

// Display a random tip on page load
window.addEventListener('load', () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    console.log('%c💡 Tip: ' + randomTip, 'color: #f093fb; font-size: 12px; padding: 5px;');
});

// Page visibility - track study time
let studyStartTime = Date.now();
let totalStudyTime = 0;

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        totalStudyTime += Date.now() - studyStartTime;
    } else {
        studyStartTime = Date.now();
    }
});

// Logout warning
window.addEventListener('beforeunload', () => {
    totalStudyTime += Date.now() - studyStartTime;
    localStorage.setItem('totalStudyTime', totalStudyTime);
});

// ---------------- Math Genie ----------------
// Lightweight expression parser -> RPN -> evaluator that emits step-by-step notes
(() => {
    function formatNumber(n) {
        if (Number.isInteger(n)) return String(n);
        return parseFloat(n.toFixed(10)).toString();
    }

    function tokenize(inp) {
        const s = inp.replace(/\s+/g, '');
        const tokens = [];
        let numBuf = '';
        const isOp = c => /[+\-*/^()]/.test(c);

        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if ((ch >= '0' && ch <= '9') || ch === '.') {
                numBuf += ch;
                continue;
            }

            if (numBuf) { tokens.push(numBuf); numBuf = ''; }

            if (ch === '-' ) {
                const prev = tokens.length ? tokens[tokens.length-1] : null;
                if (prev === null || isOp(prev) && prev !== ')' ) {
                    // unary minus -> treat as 0 - x
                    tokens.push('0');
                }
            }

            if (isOp(ch)) tokens.push(ch);
            else throw new Error('Unexpected character: ' + ch);
        }
        if (numBuf) tokens.push(numBuf);
        return tokens;
    }

    function toRPN(tokens) {
        const out = [];
        const ops = [];
        const prec = { '^': 4, '*': 3, '/': 3, '+': 2, '-': 2 };
        const rightAssoc = { '^': true };

        const isOperator = t => /^[+\-*/^]$/.test(t);

        tokens.forEach(t => {
            if (!isNaN(Number(t))) {
                out.push(t);
            } else if (isOperator(t)) {
                while (ops.length) {
                    const top = ops[ops.length-1];
                    if (isOperator(top) && ((rightAssoc[t] && prec[t] < prec[top]) || (!rightAssoc[t] && prec[t] <= prec[top]))) {
                        out.push(ops.pop());
                    } else break;
                }
                ops.push(t);
            } else if (t === '(') {
                ops.push(t);
            } else if (t === ')') {
                while (ops.length && ops[ops.length-1] !== '(') out.push(ops.pop());
                if (!ops.length) throw new Error('Mismatched parentheses');
                ops.pop();
            } else {
                throw new Error('Unknown token: ' + t);
            }
        });

        while (ops.length) {
            const t = ops.pop();
            if (t === '(' || t === ')') throw new Error('Mismatched parentheses');
            out.push(t);
        }

        return out;
    }

    function evalRPNWithSteps(rpn) {
        const stack = [];
        const steps = [];

        const apply = (op, a, b) => {
            a = Number(a); b = Number(b);
            let res;
            if (op === '+') res = a + b;
            else if (op === '-') res = a - b;
            else if (op === '*') res = a * b;
            else if (op === '/') {
                if (b === 0) throw new Error('Division by zero');
                res = a / b;
            } else if (op === '^') res = Math.pow(a, b);
            else throw new Error('Unknown operator: ' + op);
            return res;
        };

        rpn.forEach(tok => {
            if (!isNaN(Number(tok))) {
                stack.push(tok);
            } else {
                const b = stack.pop();
                const a = stack.pop();
                if (a === undefined || b === undefined) throw new Error('Invalid expression');
                const res = apply(tok, a, b);
                steps.push(`${formatNumber(Number(a))} ${tok} ${formatNumber(Number(b))} = ${formatNumber(res)}`);
                stack.push(String(res));
            }
        });

        if (stack.length !== 1) throw new Error('Invalid expression');
        return { result: Number(stack[0]), steps };
    }

    function explainExpression(expr) {
        const notes = [];
        notes.push('Expression: ' + expr);
        const tokens = tokenize(expr);
        notes.push('Tokens: ' + tokens.join(' '));
        const rpn = toRPN(tokens);
        notes.push('RPN (postfix): ' + rpn.join(' '));
        notes.push('--- Step-by-step evaluation ---');
        const { result, steps } = evalRPNWithSteps(rpn);
        steps.forEach((s, i) => notes.push((i+1) + '. ' + s));
        notes.push('Result: ' + formatNumber(result));
        return { result, notes: notes.join('\n') };
    }

    // UI hookup
    window.addEventListener('load', () => {
        const exprEl = document.getElementById('expr');
        const evalBtn = document.getElementById('evalBtn');
        const clearBtn = document.getElementById('clearBtn');
        const copyBtn = document.getElementById('copyBtn');
        const resultEl = document.getElementById('result');
        const notesEl = document.getElementById('notes');

        if (!exprEl) return; // math genie not present

        function showError(msg) {
            resultEl.textContent = 'Error';
            notesEl.textContent = msg;
        }

        evalBtn.addEventListener('click', () => {
            const expr = exprEl.value.trim();
            if (!expr) { showError('Please enter an expression.'); return; }
            try {
                const out = explainExpression(expr);
                resultEl.textContent = out.result;
                notesEl.textContent = out.notes;
            } catch (err) {
                showError(err.message || String(err));
            }
        });

        clearBtn.addEventListener('click', () => {
            exprEl.value = '';
            resultEl.textContent = '—';
            notesEl.textContent = 'Enter an expression and press Evaluate.';
        });

        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(notesEl.textContent);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = 'Copy Notes', 1500);
            } catch (e) {
                copyBtn.textContent = 'Copy Failed';
                setTimeout(() => copyBtn.textContent = 'Copy Notes', 1500);
            }
        });
    });

})();
