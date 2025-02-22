chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeIoC") {
    // Regular IOC patterns
    const ipRegex = /(\b\d{1,3}\.){3}\d{1,3}\b|([a-fA-F0-9:]+:+)+[a-fA-F0-9]+/g;
    const domainRegex = /\b((?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))\b/g;
    const hashRegex = /\b[A-Fa-f0-9]{32}\b|\b[A-Fa-f0-9]{40}\b|\b[A-Fa-f0-9]{64}\b/g;

    // Defanged IOC patterns
    const defangedIpRegex = /\b\d{1,3}(?:\[\.\]|\(\.\)|\{\.})\d{1,3}(?:\[\.\]|\(\.\)|\{\.})\d{1,3}(?:\[\.\]|\(\.\)|\{\.})\d{1,3}\b/g;
    const defangedDomainRegex = /\b(?:(?:[a-zA-Z0-9-]+(?:\[\.\]|\(\.\)|\{\.}|\[dot\]|(\(dot\))|\{dot\}))+[a-zA-Z]{2,})\b/g;

    const refangIP = (ip) => {
      return ip.replace(/\[\.\]|\(\.\)|\{\.}/g, '.');
    };

    const refangDomain = (domain) => {
      return domain.replace(/\[\.\]|\(\.\)|\{\.}|\[dot\]|\(dot\)|\{dot\}/g, '.');
    };

    const textContent = document.body.innerText;
    
    // Get regular IOCs
    const ips = Array.from(textContent.matchAll(ipRegex) || []).map(m => m[0]);
    const domains = Array.from(textContent.matchAll(domainRegex) || []).map(m => m[0]);
    const hashes = Array.from(textContent.matchAll(hashRegex) || []).map(m => m[0]);

    // Get and refang defanged IOCs
    const defangedIps = Array.from(textContent.matchAll(defangedIpRegex) || [])
      .map(m => refangIP(m[0]));
    const defangedDomains = Array.from(textContent.matchAll(defangedDomainRegex) || [])
      .map(m => refangDomain(m[0]));

    // Combine and deduplicate results
    const uniqueIps = [...new Set([...ips, ...defangedIps])];
    const uniqueDomains = [...new Set([...domains, ...defangedDomains])];

    sendResponse({ 
      ips: uniqueIps, 
      domains: uniqueDomains, 
      hashes 
    });
  }
});
