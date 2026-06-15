const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const htmlDir = path.join(rootDir, 'html');

if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
}

// Find all HTML files in the root dir
const files = fs.readdirSync(rootDir);
const htmlFiles = files.filter(f => f.endsWith('.html'));

console.log(`Syncing ${htmlFiles.length} HTML files from root to html/ folder...`);

htmlFiles.forEach(filename => {
    const rootPath = path.join(rootDir, filename);
    const destPath = path.join(htmlDir, filename);
    
    let content = fs.readFileSync(rootPath, 'utf8');
    
    // Replace resource paths to point one level up
    // Match href="css/..., href='css/..., src="js/..., src="images/...
    content = content.replace(/href=["']css\//g, 'href="../css/');
    content = content.replace(/src=["']js\//g, 'src="../js/');
    content = content.replace(/src=["']images\//g, 'src="../images/');
    
    // Write to html/ folder
    fs.writeFileSync(destPath, content, 'utf8');
});

console.log("Sync completed successfully via Node.js!");
