const fs = require('fs');

// Mock localStorage and window
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.window = {
  GRADIE_DATA: { products: [] }
};
global.document = {
  addEventListener: () => {}
};

// Load data-store.js
const code = fs.readFileSync('/Users/huynhthaonhi/Downloads/Gradie/gradie-website/js/data-store.js', 'utf8');
eval(code);

console.log("Categories:", window.GradieStore.getCategories());
