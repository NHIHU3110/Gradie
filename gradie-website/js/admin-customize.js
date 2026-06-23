// js/admin-customize.js
document.addEventListener('DOMContentLoaded', () => {
    if(!window.GradieStore) return;
    
    // Local copy of options to manipulate
    let currentOptions = window.GradieStore.getCustomizationOptions();
    
    window.renderVisualOptions = function() {
        // 1. Render embroideryColors
        const embContainer = document.getElementById('embroidery-colors-list');
        if (embContainer && currentOptions.embroideryColors) {
            embContainer.innerHTML = currentOptions.embroideryColors.map((c, i) => `
                <div class="option-row" style="display:flex; gap:15px; align-items:center; background:#faf9f6; padding:12px; border-radius:8px; border:1px solid #eee;">
                    <input type="color" value="${c.hex}" onchange="currentOptions.embroideryColors[${i}].hex = this.value" style="width:50px; height:38px; border:1px solid #ccc; border-radius:4px; padding:0; cursor:pointer;">
                    <input type="text" value="${c.name}" placeholder="Color Name (e.g. Metallic Gold)" onchange="currentOptions.embroideryColors[${i}].name = this.value" style="flex:1; height:38px; padding:0 12px; border:1px solid #ccc; border-radius:6px; background:#fff;">
                    <button type="button" class="btn-danger" onclick="removeCustomOption('embroideryColors', ${i})" style="height:38px; width:38px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:0.9rem; cursor:pointer;">X</button>
                </div>
            `).join('') || '<p style="color:var(--admin-muted); font-style:italic;">No thread colors added yet.</p>';
        }

        // 2. Render boxColors
        const boxContainer = document.getElementById('box-colors-list');
        if (boxContainer && currentOptions.boxColors) {
            boxContainer.innerHTML = currentOptions.boxColors.map((c, i) => `
                <div class="option-row" style="display:flex; gap:15px; align-items:center; background:#faf9f6; padding:12px; border-radius:8px; border:1px solid #eee;">
                    <input type="color" value="${c.hex}" onchange="currentOptions.boxColors[${i}].hex = this.value" style="width:50px; height:38px; border:1px solid #ccc; border-radius:4px; padding:0; cursor:pointer;">
                    <input type="text" value="${c.name}" placeholder="Box Name (e.g. Classic Kraft)" onchange="currentOptions.boxColors[${i}].name = this.value" style="flex:1; height:38px; padding:0 12px; border:1px solid #ccc; border-radius:6px; background:#fff;">
                    <button type="button" class="btn-danger" onclick="removeCustomOption('boxColors', ${i})" style="height:38px; width:38px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:0.9rem; cursor:pointer;">X</button>
                </div>
            `).join('') || '<p style="color:var(--admin-muted); font-style:italic;">No box colors added yet.</p>';
        }

        // 3. Render ribbonColors
        const ribbonContainer = document.getElementById('ribbon-colors-list');
        if (ribbonContainer && currentOptions.ribbonColors) {
            ribbonContainer.innerHTML = currentOptions.ribbonColors.map((c, i) => `
                <div class="option-row" style="display:flex; gap:15px; align-items:center; background:#faf9f6; padding:12px; border-radius:8px; border:1px solid #eee;">
                    <input type="color" value="${c.hex}" onchange="currentOptions.ribbonColors[${i}].hex = this.value" style="width:50px; height:38px; border:1px solid #ccc; border-radius:4px; padding:0; cursor:pointer;">
                    <input type="text" value="${c.name}" placeholder="Ribbon Name (e.g. Royal Blue)" onchange="currentOptions.ribbonColors[${i}].name = this.value" style="flex:1; height:38px; padding:0 12px; border:1px solid #ccc; border-radius:6px; background:#fff;">
                    <button type="button" class="btn-danger" onclick="removeCustomOption('ribbonColors', ${i})" style="height:38px; width:38px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:0.9rem; cursor:pointer;">X</button>
                </div>
            `).join('') || '<p style="color:var(--admin-muted); font-style:italic;">No ribbon colors added yet.</p>';
        }

        // 4. Render waxSeals
        const waxContainer = document.getElementById('wax-seals-list');
        if (waxContainer && currentOptions.waxSeals) {
            waxContainer.innerHTML = currentOptions.waxSeals.map((s, i) => `
                <div class="option-row" style="display:flex; gap:15px; align-items:center; background:#faf9f6; padding:12px; border-radius:8px; border:1px solid #eee;">
                    <input type="text" value="${s.emoji}" placeholder="Motif/Symbol" onchange="currentOptions.waxSeals[${i}].emoji = this.value" style="width:60px; height:38px; text-align:center; font-size:1.2rem; border:1px solid #ccc; border-radius:6px; background:#fff; padding:0;">
                    <input type="text" value="${s.name}" placeholder="Motif Name (e.g. Signature Monogram)" onchange="currentOptions.waxSeals[${i}].name = this.value" style="flex:1; height:38px; padding:0 12px; border:1px solid #ccc; border-radius:6px; background:#fff;">
                    <button type="button" class="btn-danger" onclick="removeCustomOption('waxSeals', ${i})" style="height:38px; width:38px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:0.9rem; cursor:pointer;">X</button>
                </div>
            `).join('') || '<p style="color:var(--admin-muted); font-style:italic;">No wax seal motifs added yet.</p>';
        }

        // 5. Render services list
        const servicesContainer = document.getElementById('services-list');
        if (servicesContainer && currentOptions.services) {
            servicesContainer.innerHTML = currentOptions.services.map((s, i) => `
                <div class="option-row" style="display:flex; flex-direction:column; gap:12px; background:#faf9f6; padding:20px; border-radius:8px; border:1px solid #eee; align-items: stretch;">
                    <div style="font-weight:600; color:var(--admin-primary); border-bottom:1px dashed #ddd; padding-bottom:6px; display:flex; justify-content:space-between;">
                        <span>Card #${i + 1}: ${s.title || 'Untitled Service'}</span>
                        <span style="font-size:0.8rem; font-weight:normal; color:#888;">Link: ${s.link}</span>
                    </div>
                    <div style="display:grid; grid-template-columns:120px 1fr; gap:12px; align-items:center;">
                        <label style="font-size:0.85rem; font-weight:500; color:#555;">Title:</label>
                        <input type="text" value="${s.title}" onchange="currentOptions.services[${i}].title = this.value; renderVisualOptions();" style="height:36px; padding:0 10px; border:1px solid #ccc; border-radius:6px; background:#fff;">
                    </div>
                    <div style="display:grid; grid-template-columns:120px 1fr; gap:12px; align-items:start;">
                        <label style="font-size:0.85rem; font-weight:500; color:#555; margin-top:6px;">Description:</label>
                        <textarea onchange="currentOptions.services[${i}].desc = this.value" style="height:60px; padding:8px 10px; border:1px solid #ccc; border-radius:6px; background:#fff; font-family:inherit; font-size:0.9rem; resize:vertical;">${s.desc}</textarea>
                    </div>
                    <div style="display:grid; grid-template-columns:120px 1fr; gap:12px; align-items:center;">
                        <label style="font-size:0.85rem; font-weight:500; color:#555;">Image Link/Path:</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" value="${s.img}" onchange="currentOptions.services[${i}].img = this.value; renderVisualOptions();" style="flex:1; height:36px; padding:0 10px; border:1px solid #ccc; border-radius:6px; background:#fff;">
                            <div style="width:36px; height:36px; border-radius:6px; background:url('${s.img}') center/cover; border:1px solid #ddd;" title="Image Preview"></div>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:120px 1fr; gap:12px; align-items:center;">
                        <label style="font-size:0.85rem; font-weight:500; color:#555;">Button Text:</label>
                        <input type="text" value="${s.btnText}" onchange="currentOptions.services[${i}].btnText = this.value" style="height:36px; padding:0 10px; border:1px solid #ccc; border-radius:6px; background:#fff;">
                    </div>
                </div>
            `).join('') || '<p style="color:var(--admin-muted); font-style:italic;">No services added yet.</p>';
        }
    };

    window.addCustomOption = function(key) {
        if (!currentOptions[key]) currentOptions[key] = [];
        if (key === 'waxSeals') {
            currentOptions[key].push({ name: 'New Motif', emoji: '✦' });
        } else {
            currentOptions[key].push({ name: 'New Color', hex: '#d8a94f' });
        }
        renderVisualOptions();
    };

    window.removeCustomOption = function(key, index) {
        if (currentOptions[key]) {
            currentOptions[key].splice(index, 1);
            renderVisualOptions();
        }
    };

    window.saveCustomizationVisual = function() {
        try {
            window.GradieStore.saveCustomizationOptions(currentOptions);
            alert("Customization settings successfully updated!");
        } catch (e) {
            console.error(e);
            showToast('Lỗi khi lưu dữ liệu Customization!', 'error');
        }
    };

    // Initial render
    renderVisualOptions();
});
