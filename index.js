// OC Style Boxes - Simple JSON to styled HTML transformer

(function() {
    // ============================================
    // TEMPLATES - Add your own here!
    // ============================================
    
    const templates = {
        
        "TaskManager": (data) => `
            <div class="oc-box tm-window">
                <div class="tm-titlebar">
                    <div class="tm-titlebar-icon">♡</div>
                    <span>Task Manager</span>
                </div>
                <div class="tm-content">
                    <div class="tm-stat">
                        <div class="tm-stat-icon">👤</div>
                        <div class="tm-stat-content">
                            <div class="tm-stat-label">Followers</div>
                            <div class="tm-stat-value-big">${data.followers ?? 0}</div>
                        </div>
                    </div>
                    <div class="tm-stat">
                        <div class="tm-stat-icon">😓</div>
                        <div class="tm-stat-content">
                            <div class="tm-stat-label">Stress</div>
                            <div class="tm-stat-row">
                                <span class="tm-stat-value">${data.stress ?? 0}<small>/100</small></span>
                                <div class="tm-bar"><div class="tm-bar-fill stress" style="width:${data.stress ?? 0}%"></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="tm-stat">
                        <div class="tm-stat-icon">💗</div>
                        <div class="tm-stat-content">
                            <div class="tm-stat-label">Affection</div>
                            <div class="tm-stat-row">
                                <span class="tm-stat-value">${data.affection ?? 0}<small>/100</small></span>
                                <div class="tm-bar"><div class="tm-bar-fill affection" style="width:${data.affection ?? 0}%"></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="tm-stat">
                        <div class="tm-stat-icon">🌑</div>
                        <div class="tm-stat-content">
                            <div class="tm-stat-label">Mental Darkness</div>
                            <div class="tm-stat-row">
                                <span class="tm-stat-value">${data.mentalDarkness ?? 0}<small>/100</small></span>
                                <div class="tm-bar"><div class="tm-bar-fill darkness" style="width:${data.mentalDarkness ?? 0}%"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
    };

    // ============================================
    // CORE LOGIC
    // ============================================
    
    const templateNames = Object.keys(templates);
    
    function processMessage(messageElement) {
        if (!messageElement) return;
        
        // Method 1: Look for <pre><code class="language-XXX">
        messageElement.querySelectorAll('pre code').forEach(code => {
            // Check class name (e.g., "language-TaskManager" or "language-taskmanager")
            for (const templateName of templateNames) {
                if (code.classList.contains(`language-${templateName}`) || 
                    code.classList.contains(`language-${templateName.toLowerCase()}`)) {
                    try {
                        const jsonStr = code.textContent.trim();
                        const data = JSON.parse(jsonStr);
                        const html = templates[templateName](data);
                        const container = document.createElement('div');
                        container.innerHTML = html;
                        code.closest('pre').replaceWith(container);
                        console.log(`[OC Style Boxes] Rendered ${templateName}`);
                        return;
                    } catch (e) {
                        console.error('[OC Style Boxes] Parse error:', e);
                    }
                }
            }
            
            // Check content starts with template name
            const text = code.textContent.trim();
            for (const templateName of templateNames) {
                if (text.startsWith(templateName)) {
                    try {
                        const jsonStr = text.slice(templateName.length).trim();
                        const data = JSON.parse(jsonStr);
                        const html = templates[templateName](data);
                        const container = document.createElement('div');
                        container.innerHTML = html;
                        code.closest('pre').replaceWith(container);
                        console.log(`[OC Style Boxes] Rendered ${templateName}`);
                        return;
                    } catch (e) {
                        console.error('[OC Style Boxes] Parse error:', e);
                    }
                }
            }
        });
    }

    function processAllMessages() {
        document.querySelectorAll('.mes_text').forEach(processMessage);
    }

    function init() {
        console.log('[OC Style Boxes] Initializing...');
        
        try {
            const context = SillyTavern.getContext();
            
            context.eventSource.on(context.eventTypes.CHARACTER_MESSAGE_RENDERED, (messageIndex) => {
                console.log(`[OC Style Boxes] Message rendered: ${messageIndex}`);
                setTimeout(() => {
                    const messageElement = document.querySelector(`.mes[mesid="${messageIndex}"] .mes_text`);
                    processMessage(messageElement);
                }, 100);
            });
            
            context.eventSource.on(context.eventTypes.USER_MESSAGE_RENDERED, (messageIndex) => {
                setTimeout(() => {
                    const messageElement = document.querySelector(`.mes[mesid="${messageIndex}"] .mes_text`);
                    processMessage(messageElement);
                }, 100);
            });
            
            context.eventSource.on(context.eventTypes.CHAT_CHANGED, () => {
                console.log('[OC Style Boxes] Chat changed, processing all messages');
                setTimeout(processAllMessages, 500);
            });
            
            // Process existing messages
            setTimeout(processAllMessages, 1000);
            
            console.log('[OC Style Boxes] Loaded successfully!');
            
        } catch (e) {
            console.error('[OC Style Boxes] Failed to initialize:', e);
        }
    }

    // Wait for page to be ready
    if (document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }
    
})();