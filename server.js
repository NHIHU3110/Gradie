const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const PRODUCTS_JSON_PATH = path.join(PUBLIC_DIR, 'data', 'products.json');
const GLOBAL_DATA_JS_PATH = path.join(PUBLIC_DIR, 'js', 'global-data.js');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    // Enable CORS for local testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Handle local API endpoints to write directly to JSON files
    if (req.url.startsWith('/api/products') && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const updatedProduct = JSON.parse(body);
                
                // Read current products
                const currentData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8'));
                
                // Update product
                const index = currentData.findIndex(p => p.id === updatedProduct.id);
                if (index !== -1) {
                    currentData[index] = { ...currentData[index], ...updatedProduct };
                } else {
                    currentData.push(updatedProduct);
                }
                
                // Write back to products.json
                fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(currentData, null, 2), 'utf8');
                
                // Update global-data.js as well
                let globalDataStr = fs.readFileSync(GLOBAL_DATA_JS_PATH, 'utf8');
                // We'll replace the products array inside global-data.js
                // This is a bit tricky, but we know it's a valid object
                try {
                    // Extract the window.GRADIE_DATA object
                    const match = globalDataStr.match(/window\.GRADIE_DATA\s*=\s*(\{[\s\S]*?\});\s*$/);
                    if (match) {
                        let globalDataObj = JSON.parse(match[1]);
                        globalDataObj.products = currentData;
                        fs.writeFileSync(GLOBAL_DATA_JS_PATH, "window.GRADIE_DATA = " + JSON.stringify(globalDataObj, null, 2) + ";", 'utf8');
                    }
                } catch(e) {
                    console.error("Could not update global-data.js automatically", e);
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Saved successfully to products.json!' }));
            } catch (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }
    
    // Serve static files
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    
    // If no extension, assume it's an API call not handled or a route
    if (req.url.startsWith('/api/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, dummy: true }));
        return;
    }

    try {
        const content = fs.readFileSync(filePath);
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.writeHead(404);
            res.end(`File ${req.url} not found!`);
        } else {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
        }
    }
});

server.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 BẬT SERVER THÀNH CÔNG!`);
    console.log(`🌍 Hãy mở link này trên trình duyệt: http://localhost:${PORT}`);
    console.log(`💾 Bất cứ lúc nào bạn nhấn Save, nó sẽ lưu THẲNG vào file data/products.json!`);
    console.log('====================================================');
});
