// OC Style Boxes - Simple JSON to styled HTML transformer
console.log('[OC Style Boxes] Script file loaded');

(function() {
    const PLUGIN_NAME = 'oc-style-boxes';

    // ============================================
    // CUSTOM TEMPLATES (user-defined, persisted)
    // ============================================

    let customTemplates = {};
    let customStyleElement = null;

    function renderTemplate(templateDef, data) {
        try {
            // Replace ${data.xxx} patterns with actual values
            let html = templateDef.html;
            html = html.replace(/\$\{data\.(\w+)(?:\s*\?\?\s*([^}]+))?\}/g, (match, key, defaultVal) => {
                if (data[key] !== undefined) {
                    return data[key];
                }
                if (defaultVal !== undefined) {
                    // Remove quotes if it's a string default
                    return defaultVal.replace(/^['"]|['"]$/g, '').trim();
                }
                return '';
            });
            return html;
        } catch (e) {
            console.error('[OC Style Boxes] Template render error:', e);
            return null;
        }
    }

    // ============================================
    // STORAGE
    // ============================================

    function loadCustomTemplates() {
        try {
            const context = SillyTavern.getContext();
            const saved = context.extensionSettings[PLUGIN_NAME];
            if (saved && saved.customTemplates) {
                customTemplates = saved.customTemplates;
                applyCustomCSS();
                console.log('[OC Style Boxes] Loaded custom templates:', Object.keys(customTemplates));
            }
        } catch (e) {
            console.error('[OC Style Boxes] Failed to load custom templates:', e);
        }
    }

    function saveCustomTemplates() {
        try {
            const context = SillyTavern.getContext();
            if (!context.extensionSettings[PLUGIN_NAME]) {
                context.extensionSettings[PLUGIN_NAME] = {};
            }
            context.extensionSettings[PLUGIN_NAME].customTemplates = customTemplates;
            context.saveSettingsDebounced();
            console.log('[OC Style Boxes] Saved custom templates');
        } catch (e) {
            console.error('[OC Style Boxes] Failed to save custom templates:', e);
        }
    }

    function applyCustomCSS() {
        // Remove old style element if exists
        if (customStyleElement) {
            customStyleElement.remove();
        }

        // Create new style element with all custom CSS
        const allCSS = Object.values(customTemplates)
            .map(t => t.css || '')
            .filter(css => css.trim())
            .join('\n\n');

        if (allCSS) {
            customStyleElement = document.createElement('style');
            customStyleElement.id = 'oc-style-boxes-custom-css';
            customStyleElement.textContent = allCSS;
            document.head.appendChild(customStyleElement);
        }
    }

    // ============================================
    // SETTINGS UI
    // ============================================

    function createSettingsUI() {
        const settingsHtml = `
            <div id="oc-style-boxes-settings">
                <div class="inline-drawer">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>OC Style Boxes</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                    </div>
                    <div class="inline-drawer-content">
                        <div class="oc-boxes-info">
                            Create custom codeblock styles. Use <code>\${data.fieldName}</code> in HTML for JSON values.
                            <br>Example: <code>\`\`\`MyStyle {"name": "Test"}\`\`\`</code>
                        </div>

                        <div class="oc-boxes-form">
                            <div class="oc-boxes-row">
                                <label>Template Key:</label>
                                <input type="text" id="oc-boxes-key" placeholder="MyCustomBox" />
                            </div>
                            <div class="oc-boxes-row">
                                <label>HTML Template:</label>
                                <textarea id="oc-boxes-html" placeholder='<div class="my-box">\n  <h3>\${data.title}</h3>\n  <p>\${data.content}</p>\n</div>'></textarea>
                            </div>
                            <div class="oc-boxes-row">
                                <label>CSS Styles:</label>
                                <textarea id="oc-boxes-css" placeholder=".my-box {\n  background: #333;\n  padding: 10px;\n  border-radius: 8px;\n}"></textarea>
                            </div>
                            <div class="oc-boxes-buttons">
                                <button id="oc-boxes-save" class="menu_button">Save Template</button>
                                <button id="oc-boxes-clear" class="menu_button">Clear Form</button>
                            </div>
                        </div>

                        <hr>

                        <div class="oc-boxes-list-header">
                            <b>Your Custom Templates:</b>
                        </div>
                        <div id="oc-boxes-list" class="oc-boxes-list"></div>
                    </div>
                </div>
            </div>
        `;

        // Add settings styles
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            #oc-style-boxes-settings .oc-boxes-info {
                font-size: 12px;
                color: #aaa;
                margin-bottom: 15px;
                padding: 8px;
                background: rgba(0,0,0,0.2);
                border-radius: 4px;
            }
            #oc-style-boxes-settings .oc-boxes-info code {
                background: rgba(255,255,255,0.1);
                padding: 2px 5px;
                border-radius: 3px;
            }
            #oc-style-boxes-settings .oc-boxes-form {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            #oc-style-boxes-settings .oc-boxes-row {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            #oc-style-boxes-settings .oc-boxes-row label {
                font-size: 12px;
                font-weight: bold;
            }
            #oc-style-boxes-settings .oc-boxes-row input {
                padding: 8px;
                border-radius: 4px;
                border: 1px solid #555;
                background: #222;
                color: #fff;
            }
            #oc-style-boxes-settings .oc-boxes-row textarea {
                padding: 8px;
                border-radius: 4px;
                border: 1px solid #555;
                background: #222;
                color: #fff;
                font-family: monospace;
                min-height: 120px;
                resize: vertical;
            }
            #oc-style-boxes-settings .oc-boxes-buttons {
                display: flex;
                gap: 10px;
            }
            #oc-style-boxes-settings .oc-boxes-list-header {
                margin: 10px 0;
            }
            #oc-style-boxes-settings .oc-boxes-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 300px;
                overflow-y: auto;
            }
            #oc-style-boxes-settings .oc-boxes-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                border: 1px solid #444;
            }
            #oc-style-boxes-settings .oc-boxes-item-name {
                font-weight: bold;
                font-family: monospace;
            }
            #oc-style-boxes-settings .oc-boxes-item-actions {
                display: flex;
                gap: 6px;
            }
            #oc-style-boxes-settings .oc-boxes-item-actions button {
                padding: 4px 8px;
                font-size: 11px;
            }
            #oc-style-boxes-settings .oc-boxes-empty {
                color: #666;
                font-style: italic;
                padding: 10px;
            }
        `;
        document.head.appendChild(styleEl);

        return settingsHtml;
    }

    function renderTemplateList() {
        const listEl = document.getElementById('oc-boxes-list');
        if (!listEl) return;

        const keys = Object.keys(customTemplates);

        if (keys.length === 0) {
            listEl.innerHTML = '<div class="oc-boxes-empty">No custom templates yet. Create one above!</div>';
            return;
        }

        listEl.innerHTML = keys.map(key => `
            <div class="oc-boxes-item" data-key="${key}">
                <span class="oc-boxes-item-name">\`\`\`${key}</span>
                <div class="oc-boxes-item-actions">
                    <button class="menu_button oc-boxes-edit" data-key="${key}">Edit</button>
                    <button class="menu_button oc-boxes-delete" data-key="${key}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        listEl.querySelectorAll('.oc-boxes-edit').forEach(btn => {
            btn.addEventListener('click', () => editTemplate(btn.dataset.key));
        });
        listEl.querySelectorAll('.oc-boxes-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteTemplate(btn.dataset.key));
        });
    }

    function clearForm() {
        document.getElementById('oc-boxes-key').value = '';
        document.getElementById('oc-boxes-html').value = '';
        document.getElementById('oc-boxes-css').value = '';
        document.getElementById('oc-boxes-key').removeAttribute('data-editing');
    }

    function editTemplate(key) {
        const template = customTemplates[key];
        if (!template) return;

        document.getElementById('oc-boxes-key').value = key;
        document.getElementById('oc-boxes-html').value = template.html || '';
        document.getElementById('oc-boxes-css').value = template.css || '';
        document.getElementById('oc-boxes-key').setAttribute('data-editing', key);
    }

    function deleteTemplate(key) {
        if (!confirm(`Delete template "${key}"?`)) return;

        delete customTemplates[key];
        saveCustomTemplates();
        applyCustomCSS();
        renderTemplateList();

        // Clear form if we were editing this one
        const keyInput = document.getElementById('oc-boxes-key');
        if (keyInput.getAttribute('data-editing') === key) {
            clearForm();
        }
    }

    function saveTemplate() {
        const keyInput = document.getElementById('oc-boxes-key');
        const htmlInput = document.getElementById('oc-boxes-html');
        const cssInput = document.getElementById('oc-boxes-css');

        const key = keyInput.value.trim();
        const html = htmlInput.value;
        const css = cssInput.value;

        if (!key) {
            alert('Please enter a template key');
            return;
        }

        if (!html.trim()) {
            alert('Please enter HTML template');
            return;
        }

        const editingKey = keyInput.getAttribute('data-editing');

        // If renaming, delete old key
        if (editingKey && editingKey !== key) {
            delete customTemplates[editingKey];
        }

        customTemplates[key] = { html, css };

        saveCustomTemplates();
        applyCustomCSS();
        renderTemplateList();
        clearForm();

        console.log(`[OC Style Boxes] Saved template: ${key}`);
    }

    function initSettingsUI() {
        // Register settings
        const settingsHtml = createSettingsUI();
        const container = document.createElement('div');
        container.innerHTML = settingsHtml;

        // Find the extensions settings area
        const extensionsSettings = document.getElementById('extensions_settings');
        if (extensionsSettings) {
            extensionsSettings.appendChild(container);
        } else {
            // Fallback: try extensions_settings2
            const extensionsSettings2 = document.getElementById('extensions_settings2');
            if (extensionsSettings2) {
                extensionsSettings2.appendChild(container);
            }
        }

        // Setup event listeners
        setTimeout(() => {
            const saveBtn = document.getElementById('oc-boxes-save');
            const clearBtn = document.getElementById('oc-boxes-clear');

            if (saveBtn) saveBtn.addEventListener('click', saveTemplate);
            if (clearBtn) clearBtn.addEventListener('click', clearForm);

            renderTemplateList();
        }, 100);
    }

    // ============================================
    // CORE LOGIC
    // ============================================

    function processMessage(messageElement) {
        if (!messageElement) return;

        const templateNames = Object.keys(customTemplates);
        if (templateNames.length === 0) return;

        // Look for <pre><code class="language-XXX">
        messageElement.querySelectorAll('pre code').forEach(code => {
            const preElement = code.closest('pre');
            if (!preElement) return;

            // Skip if already processed
            if (preElement.dataset.ocProcessed) return;

            // Check class name (SillyTavern uses various formats)
            for (const templateName of templateNames) {
                const lowerName = templateName.toLowerCase();
                if (code.classList.contains(`language-${templateName}`) ||
                    code.classList.contains(`language-${lowerName}`) ||
                    code.classList.contains(`custom-language-${templateName}`) ||
                    code.classList.contains(`custom-language-${lowerName}`) ||
                    code.classList.contains(`custom-${templateName}`) ||
                    code.classList.contains(`custom-${lowerName}`)) {
                    try {
                        const jsonStr = code.textContent.trim();
                        const data = JSON.parse(jsonStr);
                        const html = renderTemplate(customTemplates[templateName], data);
                        if (html) {
                            // Mark as processed and hide
                            preElement.dataset.ocProcessed = 'true';
                            preElement.dataset.ocTemplate = templateName;
                            preElement.dataset.ocJson = jsonStr;
                            preElement.style.display = 'none';

                            // Remove any existing rendered version
                            const existingRender = preElement.nextElementSibling;
                            if (existingRender && existingRender.classList.contains('oc-rendered')) {
                                existingRender.remove();
                            }

                            // Insert rendered HTML after the hidden pre
                            const container = document.createElement('div');
                            container.className = 'oc-rendered';
                            container.innerHTML = html;
                            preElement.after(container);
                            console.log(`[OC Style Boxes] Rendered ${templateName}`);
                        }
                        return;
                    } catch (e) {
                        // JSON not complete yet, skip silently during streaming
                    }
                }
            }

            // Check if content starts with template name
            const text = code.textContent.trim();
            for (const templateName of templateNames) {
                if (text.startsWith(templateName)) {
                    try {
                        const jsonStr = text.slice(templateName.length).trim();
                        const data = JSON.parse(jsonStr);
                        const html = renderTemplate(customTemplates[templateName], data);
                        if (html) {
                            // Mark as processed and hide
                            preElement.dataset.ocProcessed = 'true';
                            preElement.dataset.ocTemplate = templateName;
                            preElement.dataset.ocJson = jsonStr;
                            preElement.style.display = 'none';

                            // Remove any existing rendered version
                            const existingRender = preElement.nextElementSibling;
                            if (existingRender && existingRender.classList.contains('oc-rendered')) {
                                existingRender.remove();
                            }

                            // Insert rendered HTML after the hidden pre
                            const container = document.createElement('div');
                            container.className = 'oc-rendered';
                            container.innerHTML = html;
                            preElement.after(container);
                            console.log(`[OC Style Boxes] Rendered ${templateName}`);
                        }
                        return;
                    } catch (e) {
                        // JSON not complete yet, skip silently during streaming
                    }
                }
            }
        });

        // Also check for any pre elements that were processed but JSON changed (edit case)
        messageElement.querySelectorAll('pre[data-oc-processed]').forEach(preElement => {
            const code = preElement.querySelector('code');
            if (!code) return;

            const templateName = preElement.dataset.ocTemplate;
            const oldJson = preElement.dataset.ocJson;
            const currentText = code.textContent.trim();

            // Extract current JSON
            let currentJson = currentText;
            if (currentText.startsWith(templateName)) {
                currentJson = currentText.slice(templateName.length).trim();
            }

            // If JSON changed, re-render
            if (currentJson !== oldJson) {
                try {
                    const data = JSON.parse(currentJson);
                    const html = renderTemplate(customTemplates[templateName], data);
                    if (html) {
                        preElement.dataset.ocJson = currentJson;

                        // Update the rendered version
                        const existingRender = preElement.nextElementSibling;
                        if (existingRender && existingRender.classList.contains('oc-rendered')) {
                            existingRender.innerHTML = html;
                        } else {
                            const container = document.createElement('div');
                            container.className = 'oc-rendered';
                            container.innerHTML = html;
                            preElement.after(container);
                        }
                        console.log(`[OC Style Boxes] Updated ${templateName}`);
                    }
                } catch (e) {
                    // Invalid JSON, ignore
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

            // Load saved custom templates
            loadCustomTemplates();

            // Initialize settings UI
            initSettingsUI();

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

            // Listen for message edits/updates
            if (context.eventTypes.MESSAGE_EDITED) {
                context.eventSource.on(context.eventTypes.MESSAGE_EDITED, (messageIndex) => {
                    console.log(`[OC Style Boxes] Message edited: ${messageIndex}`);
                    setTimeout(() => {
                        const messageElement = document.querySelector(`.mes[mesid="${messageIndex}"] .mes_text`);
                        processMessage(messageElement);
                    }, 100);
                });
            }

            if (context.eventTypes.MESSAGE_UPDATED) {
                context.eventSource.on(context.eventTypes.MESSAGE_UPDATED, (messageIndex) => {
                    console.log(`[OC Style Boxes] Message updated: ${messageIndex}`);
                    setTimeout(() => {
                        const messageElement = document.querySelector(`.mes[mesid="${messageIndex}"] .mes_text`);
                        processMessage(messageElement);
                    }, 100);
                });
            }

            if (context.eventTypes.MESSAGE_SWIPED) {
                context.eventSource.on(context.eventTypes.MESSAGE_SWIPED, (messageIndex) => {
                    console.log(`[OC Style Boxes] Message swiped: ${messageIndex}`);
                    setTimeout(() => {
                        const messageElement = document.querySelector(`.mes[mesid="${messageIndex}"] .mes_text`);
                        processMessage(messageElement);
                    }, 100);
                });
            }

            // Fallback: MutationObserver to catch any DOM changes in messages
            const chatContainer = document.getElementById('chat');
            if (chatContainer) {
                // Track what we've already processed to re-apply instantly
                const processedCache = new Map();

                const observer = new MutationObserver((mutations) => {
                    // Batch process all affected messages
                    const affectedMessages = new Set();

                    for (const mutation of mutations) {
                        let target = mutation.target;
                        if (target.nodeType === Node.TEXT_NODE) {
                            target = target.parentElement;
                        }
                        if (!target || !target.closest) continue;

                        const mesElement = target.closest('.mes');
                        if (mesElement) {
                            affectedMessages.add(mesElement);
                        }
                    }

                    // Process each affected message immediately
                    for (const mesElement of affectedMessages) {
                        const mesText = mesElement.querySelector('.mes_text');
                        if (!mesText) continue;

                        const codeBlocks = mesText.querySelectorAll('pre code');
                        if (codeBlocks.length > 0) {
                            // Process immediately - no debounce
                            processMessage(mesText);
                        }
                    }
                });

                observer.observe(chatContainer, {
                    childList: true,
                    subtree: true
                });
                console.log('[OC Style Boxes] MutationObserver active');
            }

            // Also listen for streaming completion as backup
            if (context.eventTypes.GENERATION_ENDED) {
                context.eventSource.on(context.eventTypes.GENERATION_ENDED, () => {
                    setTimeout(processAllMessages, 100);
                });
            }
            if (context.eventTypes.GENERATION_STOPPED) {
                context.eventSource.on(context.eventTypes.GENERATION_STOPPED, () => {
                    setTimeout(processAllMessages, 100);
                });
            }

            // Process existing messages
            setTimeout(processAllMessages, 1000);

            console.log('[OC Style Boxes] Loaded successfully!');

        } catch (e) {
            console.error('[OC Style Boxes] Failed to initialize:', e);
        }
    }

    // Wait for SillyTavern to be ready
    function waitForSillyTavern() {
        if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {
            init();
        } else {
            console.log('[OC Style Boxes] Waiting for SillyTavern...');
            setTimeout(waitForSillyTavern, 500);
        }
    }

    if (document.readyState === 'complete') {
        waitForSillyTavern();
    } else {
        window.addEventListener('load', waitForSillyTavern);
    }

})();
