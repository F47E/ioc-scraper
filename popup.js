document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "scrapeIoC" }, (response) => {
      if (chrome.runtime.lastError) {
        // If content script is not ready, inject it
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['content.js']
        }, () => {
          // Retry the message after injection
          chrome.tabs.sendMessage(activeTab.id, { action: "scrapeIoC" }, (response) => {
            if (response) {
              const { ips, domains, hashes } = response;
              updateList('ips', ips);
              updateList('domains', domains);
              updateList('hashes', hashes);
            }
          });
        });
        return;
      }
      
      if (response) {
        const { ips, domains, hashes } = response;
        updateList('ips', ips);
        updateList('domains', domains);
        updateList('hashes', hashes);
      }
    });
  });
});

function updateList(elementId, items) {
  const list = document.getElementById(elementId);
  list.innerHTML = ''; // Clear existing items
  
  if (items && items.length > 0) {
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No items found";
    list.appendChild(li);
  }
}
