// Configuration
let config = {
    apiUrl: window.location.origin,
    apiKey: ''
};

// Load config from localStorage
function loadConfig() {
    const saved = localStorage.getItem('igdm-config');
    if (saved) {
        config = JSON.parse(saved);
        document.getElementById('apiUrl').value = config.apiUrl;
        document.getElementById('apiKey').value = config.apiKey;
    } else {
        document.getElementById('apiUrl').value = config.apiUrl;
    }
}

// Save config to localStorage
function saveConfig() {
    localStorage.setItem('igdm-config', JSON.stringify(config));
}

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (config.apiKey) {
        headers['X-API-Key'] = config.apiKey;
    }

    const response = await fetch(`${config.apiUrl}${endpoint}`, {
        ...options,
        headers
    });

    return response.json();
}

// Check Server Status
async function checkServerStatus() {
    const statusIndicator = document.getElementById('serverStatus');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');

    try {
        const response = await fetch(`${config.apiUrl}/health`);
        const data = await response.json();

        if (data.status === 'ok') {
            statusDot.classList.add('online');
            statusText.textContent = 'Online';
        } else {
            statusDot.classList.add('offline');
            statusText.textContent = 'Offline';
        }
    } catch (error) {
        statusDot.classList.add('offline');
        statusText.textContent = 'Offline';
    }
}

// Tab Switching
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            if (targetTab === 'sessions') {
                loadSessions();
            }
        });
    });
}

// Character Counter
function setupCharCounter() {
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('charCount');

    messageInput.addEventListener('input', () => {
        charCount.textContent = messageInput.value.length;
    });
}

// Format Selector
function setupFormatSelector() {
    const formatBtns = document.querySelectorAll('.format-btn');
    const bulkDataInput = document.getElementById('bulkData');
    const formatHelp = document.getElementById('formatHelp');

    const examples = {
        json: `[
  {"username": "user1", "message": "Personalized message 1"},
  {"username": "user2", "message": "Personalized message 2"}
]`,
        csv: `username,message
user1,"Personalized message 1"
user2,"Personalized message 2"`
    };

    const helpTexts = {
        json: 'Format: JSON array with username and message fields',
        csv: 'Format: CSV with username,message headers'
    };

    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bulkDataInput.placeholder = examples[format];
            formatHelp.textContent = helpTexts[format];
        });
    });
}

// Single DM Form
function setupSingleDmForm() {
    const form = document.getElementById('singleDmForm');
    const btn = document.getElementById('sendSingleBtn');
    const result = document.getElementById('singleResult');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        result.style.display = 'none';

        try {
            const data = await apiRequest('/api/send-dm', {
                method: 'POST',
                body: JSON.stringify({
                    username: document.getElementById('singleUsername').value,
                    password: document.getElementById('singlePassword').value,
                    recipient: document.getElementById('recipient').value,
                    message: document.getElementById('message').value,
                    sessionId: document.getElementById('singleSessionId').value || undefined
                })
            });

            if (data.success) {
                showResult(result, 'success', 'DM Sent Successfully!', data.data);

                // Update session ID field
                if (data.data.sessionId) {
                    document.getElementById('singleSessionId').value = data.data.sessionId;
                }
            } else {
                showResult(result, 'error', 'Failed to Send DM', { error: data.error });
            }
        } catch (error) {
            showResult(result, 'error', 'Request Failed', { error: error.message });
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

// Bulk DM Form
function setupBulkDmForm() {
    const form = document.getElementById('bulkDmForm');
    const btn = document.getElementById('sendBulkBtn');
    const result = document.getElementById('bulkResult');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        result.style.display = 'none';

        try {
            const bulkDataText = document.getElementById('bulkData').value;
            let recipients;

            // Parse data (JSON or CSV)
            const activeFormat = document.querySelector('.format-btn.active').dataset.format;
            if (activeFormat === 'json') {
                recipients = JSON.parse(bulkDataText);
            } else {
                recipients = parseCSV(bulkDataText);
            }

            const data = await apiRequest('/api/send-bulk-dm', {
                method: 'POST',
                body: JSON.stringify({
                    username: document.getElementById('bulkUsername').value,
                    password: document.getElementById('bulkPassword').value,
                    recipients,
                    sessionId: document.getElementById('bulkSessionId').value || undefined,
                    delayMs: parseInt(document.getElementById('delayMs').value)
                })
            });

            if (data.success) {
                showBulkResult(result, data.data);
            } else {
                showResult(result, 'error', 'Failed to Send Bulk DMs', { error: data.error });
            }
        } catch (error) {
            showResult(result, 'error', 'Request Failed', { error: error.message });
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

// Parse CSV to JSON
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    return lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] ? values[i].trim().replace(/^"|"$/g, '') : '';
        });
        return obj;
    });
}

// Show Result
function showResult(element, type, title, data) {
    element.className = `result ${type}`;
    element.innerHTML = `
        <h3>${type === 'success' ? '✓' : '✗'} ${title}</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
    element.style.display = 'block';
}

// Show Bulk Result
function showBulkResult(element, data) {
    const successRate = ((data.successful / data.total) * 100).toFixed(1);

    let html = `
        <div class="result success">
            <h3>✓ Bulk Send Complete</h3>
            <p>
                <strong>Total:</strong> ${data.total} |
                <strong>Successful:</strong> ${data.successful} |
                <strong>Failed:</strong> ${data.failed} |
                <strong>Success Rate:</strong> ${successRate}%
            </p>
        </div>
        <div class="bulk-results">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Recipient</th>
                        <th>Status</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.results.forEach((r, i) => {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>@${r.recipient}</td>
                <td class="status-${r.success ? 'success' : 'error'}">
                    ${r.success ? '✓ Sent' : '✗ Failed'}
                </td>
                <td>${r.success ? `Thread: ${r.threadId}` : r.error}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    element.innerHTML = html;
    element.style.display = 'block';
}

// Load Sessions
async function loadSessions() {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '<p class="text-muted">Loading sessions...</p>';

    try {
        const data = await apiRequest('/api/sessions');

        if (data.success && data.data.count > 0) {
            let html = '';
            data.data.sessions.forEach(session => {
                const isExpired = session.isExpired;
                html += `
                    <div class="session-item">
                        <div class="session-info">
                            <h4>@${session.username}</h4>
                            <div class="session-meta">
                                ID: ${session.sessionId.substring(0, 16)}... |
                                Expires: ${new Date(session.expiresAt).toLocaleString()}
                            </div>
                        </div>
                        <div class="session-actions">
                            <span class="session-badge ${isExpired ? 'expired' : 'active'}">
                                ${isExpired ? 'Expired' : 'Active'}
                            </span>
                            <button class="btn-icon" onclick="copySessionId('${session.sessionId}')">📋</button>
                            <button class="btn-icon" onclick="deleteSession('${session.sessionId}')">🗑️</button>
                        </div>
                    </div>
                `;
            });
            sessionsList.innerHTML = html;
        } else {
            sessionsList.innerHTML = '<p class="text-muted">No active sessions found</p>';
        }
    } catch (error) {
        sessionsList.innerHTML = `<p class="text-muted">Error loading sessions: ${error.message}</p>`;
    }
}

// Copy Session ID
function copySessionId(sessionId) {
    navigator.clipboard.writeText(sessionId);
    alert('Session ID copied to clipboard!');
}

// Delete Session
async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) {
        return;
    }

    try {
        await apiRequest(`/api/session/${sessionId}`, { method: 'DELETE' });
        loadSessions();
    } catch (error) {
        alert('Failed to delete session: ' + error.message);
    }
}

// Settings Form
function setupSettingsForm() {
    const form = document.getElementById('settingsForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        config.apiUrl = document.getElementById('apiUrl').value.replace(/\/$/, '');
        config.apiKey = document.getElementById('apiKey').value;

        saveConfig();
        checkServerStatus();

        alert('Settings saved successfully!');
    });
}

// Refresh Sessions Button
function setupRefreshButton() {
    document.getElementById('refreshSessions').addEventListener('click', loadSessions);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    checkServerStatus();
    setupTabs();
    setupCharCounter();
    setupFormatSelector();
    setupSingleDmForm();
    setupBulkDmForm();
    setupSettingsForm();
    setupRefreshButton();

    // Check server status every 30 seconds
    setInterval(checkServerStatus, 30000);
});
