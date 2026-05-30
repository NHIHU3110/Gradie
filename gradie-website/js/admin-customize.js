// js/admin-customize.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
    const customizeJson = document.getElementById('admin-customize-json');
    if (customizeJson) {
        const opts = window.GradieStore.getCustomizationOptions();
        customizeJson.value = JSON.stringify(opts, null, 2);
        
        window.saveCustomization = function() {
            try {
                const updated = JSON.parse(customizeJson.value);
                window.GradieStore.saveCustomizationOptions(updated);
                alert("Customization settings saved successfully!");
            } catch(e) {
                alert("Invalid JSON format! Please fix syntax errors.");
            }
        };
    }
});
