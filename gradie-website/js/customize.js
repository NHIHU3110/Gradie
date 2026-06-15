document.addEventListener('DOMContentLoaded', () => {
  const sashPreview = document.getElementById('sash-preview-text');
  const sashInput = document.getElementById('sash-name-input');
  const sashColor = document.getElementById('sash-color-select');
  const addCustomBtn = document.getElementById('add-custom-btn');
  
  if (sashInput && sashPreview) {
    sashInput.addEventListener('input', (e) => {
      sashPreview.textContent = e.target.value || 'Your Name';
    });
  }
  
  if (sashColor && sashPreview) {
    sashColor.addEventListener('change', (e) => {
      sashPreview.style.color = e.target.value;
    });
  }
  
  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
      if(window.addToCart) {
        window.addToCart('custom', 1, {
          name: 'Custom DIY Sash',
          price: 450000,
          details: `Name: ${sashInput ? sashInput.value : 'N/A'}`
        });
      }
    });
  }
});