let iocData = {
  ips: [],
  domains: [],
  hashes: [],
  emails: [],
  paths: [],
  registry: [],
  cves: []
};

document.addEventListener("DOMContentLoaded", () => {
  const extractBtn = document.getElementById('extractBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const resultsArea = document.getElementById('resultsArea');

  extractBtn.addEventListener('click', extractIoCs);
  exportCsvBtn.addEventListener('click', exportAsCsv);
  exportJsonBtn.addEventListener('click', exportAsJson);

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
              const { ips, domains, hashes, emails, paths, registry, cves } = response;
              updateList('ips', ips);
              updateList('domains', domains);
              updateList('hashes', hashes);
              updateList('emails', emails);
              updateList('paths', paths);
              updateList('registry', registry);
              updateList('cves', cves);
            }
          });
        });
        return;
      }
      
      if (response) {
        const { ips, domains, hashes, emails, paths, registry, cves } = response;
        updateList('ips', ips);
        updateList('domains', domains);
        updateList('hashes', hashes);
        updateList('emails', emails);
        updateList('paths', paths);
        updateList('registry', registry);
        updateList('cves', cves);
      }
    });
  });
});

function getEnabledFilters() {
  return {
    ips: document.getElementById('filter-ips').checked,
    domains: document.getElementById('filter-domains').checked,
    hashes: document.getElementById('filter-hashes').checked,
    emails: document.getElementById('filter-emails').checked,
    paths: document.getElementById('filter-paths').checked,
    registry: document.getElementById('filter-registry').checked,
    cves: document.getElementById('filter-cves').checked
  };
}

function extractIoCs() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "scrapeIoC" }, handleScrapeResponse);
  });
}

function handleScrapeResponse(response) {
  if (response) {
    iocData = response;
    updateResults();
  }
}

function updateResults() {
  const filters = getEnabledFilters();
  const resultsArea = document.getElementById('resultsArea');
  let output = '';

  const formatSection = (type, items) => {
    if (items && items.length > 0) {
      return `=== ${type.toUpperCase()} ===\n${[...new Set(items)].join('\n')}\n\n`;
    }
    return '';
  };

  for (const [type, enabled] of Object.entries(filters)) {
    if (enabled && iocData[type] && iocData[type].length > 0) {
      output += formatSection(type, iocData[type]);
    }
  }

  resultsArea.value = output || 'No IoCs found';
}

function exportAsCsv() {
  const filters = getEnabledFilters();
  let csv = 'Type,Value\n';
  
  for (const [type, enabled] of Object.entries(filters)) {
    if (enabled && iocData[type]) {
      iocData[type].forEach(value => {
        csv += `${type},"${value}"\n`;
      });
    }
  }

  downloadFile('iocs.csv', csv, 'text/csv');
}

function exportAsJson() {
  const filters = getEnabledFilters();
  const filteredData = {};
  
  for (const [type, enabled] of Object.entries(filters)) {
    if (enabled && iocData[type]) {
      filteredData[type] = iocData[type];
    }
  }

  downloadFile('iocs.json', JSON.stringify(filteredData, null, 2), 'application/json');
}

function downloadFile(filename, content, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
