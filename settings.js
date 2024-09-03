// settings.js
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // Load saved API key
    chrome.storage.sync.get('apiKey', function(data) {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }
    });

    // Save API key
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value;
        chrome.storage.sync.set({apiKey: apiKey}, function() {
            statusDiv.textContent = 'API key saved successfully!';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        });
    });
});