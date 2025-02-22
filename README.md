# IoC Scraper Extension

Browser extension that identifies and extracts Indicators of Compromise (IoCs) from web pages, including:
- IPv4 and IPv6 addresses (normal and defanged)
- Domain names (normal and defanged)
- File hashes (MD5, SHA1, SHA256)
- Email addresses (normal and defanged)
- File paths (Windows and Unix)
- Registry keys
- CVE identifiers

## Installation

### Chrome/Chromium-based Browsers (Chrome, Edge, Brave, etc.)

1. Open your browser and navigate to `chrome://extensions`
2. Enable "Developer mode" using the toggle in the top right
3. Click "Load unpacked"
4. Select the `ioc-scraper-2` directory containing the extension files
5. The extension icon should appear in your browser toolbar

### Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the `ioc-scraper` directory and select the `manifest.json` file
5. The extension icon should appear in your browser toolbar

Note: For permanent installation in Firefox, the extension needs to be signed by Mozilla. For development, it can be loaded temporarily as described above.

## Usage

1. Navigate to any webpage containing potential IoCs
2. Click the extension icon in your toolbar
3. The popup will display all discovered:
   - IP addresses (both normal and defanged)
   - Domain names (both normal and defanged)
   - File hashes (MD5, SHA1, SHA256)

## Testing

A `demo.html` file is included for testing the extension's functionality. To use it:

1. Open `demo.html` in your browser
2. Click the extension icon
3. Verify that it correctly identifies all test cases including:
   - Normal and defanged IPv4/IPv6 addresses
   - Normal and defanged domain names
   - Various hash formats
   - Mixed context examples

## Supported IoC Formats

### IP Addresses
- Normal: `192.168.1.1`
- Defanged: `192[.]168[.]1[.]1`, `192(.)168(.)1(.)1`, `192{.}168{.}1{.}1`
- IPv6: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`

### Domains
- Normal: `example.com`
- Defanged: `example[.]com`, `example(.)com`, `example[dot]com`

### File Hashes
- MD5 (32 characters)
- SHA1 (40 characters)
- SHA256 (64 characters)

### Email Addresses
- Normal: `user@example.com`
- Defanged: `user[at]example[.]com`, `user(at)example(.)com`

### File Paths
- Windows: `C:\Windows\System32\cmd.exe`
- Unix: `/etc/passwd`, `/var/www/html`

### Registry Keys
- `HKEY_LOCAL_MACHINE\Software`
- `HKLM\SYSTEM\CurrentControlSet`
- `HKU\Software\Microsoft`

### CVEs
- `CVE-2021-44228`
- `CVE-2020-1234`

## Browser Compatibility

- Chrome/Chromium 88+
- Firefox 78+
- Microsoft Edge 88+ (Chromium-based)
- Brave 1.0+

## Development

To modify the extension:
1. Edit the source files as needed
2. Reload the extension in your browser:
   - Chrome: Click the refresh icon on the extension card
   - Firefox: Click "Reload" next to the temporary extension
3. Test changes using the provided `demo.html`
