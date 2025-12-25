// OC Style Boxes - Simple JSON to styled HTML transformer

(function() {
    // ============================================
    // TEMPLATES - Add your own here!
    // ============================================
    // Each key is the code block identifier (e.g., ```TaskManager)
    // The function receives parsed JSON and returns HTML string
    
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
        
        // ============================================
        // ADD MORE TEMPLATES BELOW
        // ============================================
        
        // Example: Another character's status box
        // "AnotherOC": (data) => `<div class="some-other-style">${data.whatever}</div>`,
        
    };

    // ============================================
    // CORE LOGIC - Don't need to touch this
    // ============================================
    
    function processMessage(messageElement) {
        // Find all code blocks
        const codeBlocks = messageElement.querySelectorAll('pre code, code');
        
        codeBlocks.forEach(code => {
            const text = code.textContent.trim();
            
            // Check each template name
            for (const [templateName, templateFn] of Object.entries(templates)) {
                // Check if code block starts with the template name
                if (text.startsWith(templateName)) {
                    try {
                        // Extract JSON (everything after the template name)
                        const jsonStr = text.slice(templateName.length).trim();
                        const data = JSON.parse(jsonStr);
                        
                        // Generate HTML from template
                        const html = templateFn(data);
                        
                        // Replace the code block with styled HTML
                        const container = document.createElement('div');
                        container.innerHTML = html;
                        
                        // Replace pre>code or just code
                        const toReplace = code.closest('pre') || code;
                        toReplace.replaceWith(container);
                        
                    } catch (e) {
                        console.error('[OC Style Boxes] Failed to parse:', e);
                    }
                    break;
                }
            }
        });
    }

    // Hook into SillyTavern's event system
    function init() {
        const context = SillyTavern.getContext();
        
        // Process messages when they're rendered
        context.eventSource.on(context.eventTypes.CHARACTER_MESSAGE_RENDERED, (messageIndex) => {
            const messageElement = document.querySelector(`.mes[mesid="${messageIndex}"] .mes_text`);
            if (messageElement) {
                processMessage(messageElement);
            }
        });
        
        // Also process user messages if needed
        context.eventSource.on(context.eventTypes.USER_MESSAGE_RENDERED, (messageIndex) => {
            const messageElement = document.querySelector(`.mes[mesid="${messageIndex}"] .mes_text`);
            if (messageElement) {
                processMessage(messageElement);
            }
        });
        
        // Process existing messages on load
        document.querySelectorAll('.mes .mes_text').forEach(processMessage);
        
        console.log('[OC Style Boxes] Loaded!');
    }

    // Wait for SillyTavern to be ready
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
    
})();
