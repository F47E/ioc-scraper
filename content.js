chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeIoC") {
    // Regular IOC patterns
    const ipRegex = /(\b\d{1,3}\.){3}\d{1,3}\b|([a-fA-F0-9:]+:+)+[a-fA-F0-9]+/g;
    const domainRegex = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b(?!\.(?:exe|dll|php|bat|sh|ps1))/gi;
    const hashRegex = /\b[A-Fa-f0-9]{32}\b|\b[A-Fa-f0-9]{40}\b|\b[A-Fa-f0-9]{64}\b/g;

    // Defanged IOC patterns
    const defangedIpRegex = /\b\d{1,3}(?:\[\.\]|\(\.\)|\{\.})\d{1,3}(?:\[\.\]|\(\.\)|\{\.})\d{1,3}(?:\[\.\]|\(\.\)|\{\.})\d{1,3}\b/g;
    const defangedDomainRegex = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\[\.\]|\(\.\)|\{\.}|\[dot\]|\(dot\)|\{dot\})){1,}[a-zA-Z]{2,}\b(?!\.(?:exe|dll|php|bat|sh|ps1))/gi;

    // Additional IOC patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const defangedEmailRegex = /\b[A-Za-z0-9._%+-]+(?:\[at\]|\(at\)|\{at\})[A-Za-z0-9.-]+(?:\[\.\]|\(\.\)|\{\.})[A-Z|a-z]{2,}\b/g;
    const windowsPathRegex = /\b[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n,]+\\)*[^\\/:*?"<>|\r\n,]+\b/g;
    const unixPathRegex = /\b\/(?:[^\/\0\r\n,]+\/)*[^\/\0\r\n,]+\b/g;
    const registryRegex = /\b(?:HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|HKEY_USERS|HKEY_CLASSES_ROOT|HKLM|HKCU|HKU|HKCR)\\[A-Za-z0-9\s\\-_]+(?:\\[A-Za-z0-9\s-_]+)*\b/g;
    const cveRegex = /\bCVE-\d{4}-\d{4,7}\b/g;

    const refangIP = (ip) => {
      return ip.replace(/\[\.\]|\(\.\)|\{\.}/g, '.');
    };

    const refangDomain = (domain) => {
      return domain.replace(/\[\.\]|\(\.\)|\{\.}|\[dot\]|\(dot\)|\{dot\}/g, '.');
    };

    const refangEmail = (email) => {
      return email
        .replace(/\[at\]|\(at\)|\{at\}/g, '@')
        .replace(/\[\.\]|\(\.\)|\{\.}/g, '.');
    };

    const textContent = document.body.innerText;
    
    // Get and refang all IOCs
    const ips = [...new Set([
      ...Array.from(textContent.matchAll(ipRegex) || []).map(m => m[0]),
      ...Array.from(textContent.matchAll(defangedIpRegex) || []).map(m => refangIP(m[0]))
    ])];

    const domains = [...new Set([
      ...Array.from(textContent.matchAll(domainRegex) || []).map(m => m[0].toLowerCase()),
      ...Array.from(textContent.matchAll(defangedDomainRegex) || []).map(m => refangDomain(m[0]).toLowerCase())
    ])];

    const emails = [...new Set([
      ...Array.from(textContent.matchAll(emailRegex) || []).map(m => m[0]),
      ...Array.from(textContent.matchAll(defangedEmailRegex) || []).map(m => refangEmail(m[0]))
    ])];

    const paths = [...new Set([
      ...Array.from(textContent.matchAll(windowsPathRegex) || []).map(m => m[0]),
      ...Array.from(textContent.matchAll(unixPathRegex) || []).map(m => m[0])
    ])];

    const registry = [...new Set(Array.from(textContent.matchAll(registryRegex) || []).map(m => m[0]))];
    const hashes = [...new Set(Array.from(textContent.matchAll(hashRegex) || []).map(m => m[0]))];
    const cves = [...new Set(Array.from(textContent.matchAll(cveRegex) || []).map(m => m[0]))];

    sendResponse({ 
      ips, 
      domains,
      hashes,
      emails,
      paths,
      registry,
      cves
    });
  }
});
