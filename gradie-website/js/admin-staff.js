// js/admin-staff.js

let globalStaffList = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchStaffFromMongo();
    if(window.renderActivityLogs) window.renderActivityLogs();

    // Setup Modal
    const modal = document.getElementById('staff-modal');
    const closeBtns = modal.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.style.display = 'none';
    }));

    // Form Submit
    document.getElementById('staff-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('staff-id').value;
        const name = document.getElementById('staff-name').value;
        const email = document.getElementById('staff-email').value;
        const phone = document.getElementById('staff-phone').value;
        const passwordInput = document.getElementById('staff-password').value;
        const role = document.getElementById('staff-role').value;
        const commissionRate = parseFloat(document.getElementById('staff-commission').value) || 0;
        const kpi = parseFloat(document.getElementById('staff-kpi').value) || 0;

        // Keep existing password if editing and left blank
        let finalPassword = passwordInput;
        if (id && !passwordInput) {
            const existingStaff = globalStaffList.find(s => s.id === id);
            finalPassword = existingStaff ? existingStaff.password : '123456';
        } else if (!id && !passwordInput) {
            finalPassword = '123456'; // Default password for new staff if not provided
        }

        const staffData = {
            id: id || ('s-' + Date.now()),
            name,
            email,
            phone,
            password: finalPassword,
            role,
            commissionRate,
            kpi,
            avatar: id ? globalStaffList.find(s => s.id === id)?.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=fff`
        };

        try {
            const method = id ? 'PUT' : 'POST';
            let apiSuccess = false;
            try {
                const res = await fetch('/api/staff', {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(staffData)
                });
                if (res.ok) apiSuccess = true;
            } catch (e) {
                console.warn('Network error when fetching /api/staff', e);
            }

            if (!apiSuccess) {
                console.warn('API save failed or unavailable, falling back to Local Storage.');
                if (window.GradieStore) {
                    let staffList = window.GradieStore.getStaff() || [];
                    if (id) {
                        const index = staffList.findIndex(s => s.id === id);
                        if (index !== -1) staffList[index] = { ...staffList[index], ...staffData };
                    } else {
                        staffList.push(staffData);
                    }
                    window.GradieStore.saveStaff(staffList);
                }
            }

            if (window.GradieStore && window.GradieStore.addActivityLog) {
                window.GradieStore.addActivityLog(
                    id ? "Cập nhật nhân sự" : "Thêm nhân sự",
                    `Đã ${id ? 'cập nhật' : 'thêm mới'} nhân viên: ${name} (${role})`
                );
            }

            modal.style.display = 'none';
            showToast('Lưu thông tin nhân sự thành công!', 'success');
            fetchStaffFromMongo();
            if(window.renderActivityLogs) window.renderActivityLogs();
        } catch (error) {
            console.error('Error saving staff:', error);
            showToast('Lỗi hệ thống khi lưu nhân sự!', 'error');
        }
    });
});

async function fetchStaffFromMongo() {
    try {
        const res = await fetch('/api/staff');
        if (!res.ok) throw new Error('API fetch failed');
        globalStaffList = await res.json();
        renderStaffTable();
    } catch (e) {
        console.warn('Fetch staff API failed (likely running locally without vercel dev). Falling back to Local Storage.', e);
        if (window.GradieStore) {
            globalStaffList = window.GradieStore.getStaff() || [];
            renderStaffTable();
        } else {
            const tbody = document.getElementById('admin-staff-list');
            if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Lỗi tải dữ liệu. Vui lòng chạy qua vercel dev hoặc thử lại.</td></tr>';
        }
    }
}

window.renderStaffTable = function() {
    const tbody = document.getElementById('admin-staff-list');
    if(!tbody) return;

    if (!globalStaffList || globalStaffList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: #64748b;">Chưa có dữ liệu nhân viên.</td></tr>';
        return;
    }

    const roleColors = {
        'Admin': { bg: '#fee2e2', text: '#b91c1c' },
        'Manager': { bg: '#fef3c7', text: '#b45309' },
        'Sales': { bg: '#dbeafe', text: '#1d4ed8' },
        'Warehouse': { bg: '#d1fae5', text: '#047857' },
        'Accountant': { bg: '#f3e8ff', text: '#7e22ce' }
    };

    const rows = globalStaffList.map(s => {
        const rc = roleColors[s.role] || { bg: '#e2e8f0', text: '#475569' };
        
        let kpiText = '-';
        if(s.role === 'Sales') {
            kpiText = `Hoa hồng: ${s.commissionRate}%<br><span style="font-size:0.8rem; color:#64748b;">KPI: ${(s.kpi||0).toLocaleString('vi-VN')}đ</span>`;
        } else if(s.kpi > 0) {
            kpiText = `KPI: ${(s.kpi||0).toLocaleString('vi-VN')}đ`;
        }

        return `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${s.avatar}" alt="${s.name}" style="width:40px; height:40px; border-radius:50%;">
                    <div style="font-weight:600; color:#1e293b;">${s.name}</div>
                </div>
            </td>
            <td>
                <div>${s.email}</div>
                <div style="font-size:0.85rem; color:#64748b;">${s.phone}</div>
            </td>
            <td>
                <span style="background:${rc.bg}; color:${rc.text}; padding:4px 10px; border-radius:12px; font-size:0.8rem; font-weight:600;">
                    ${s.role}
                </span>
            </td>
            <td>${kpiText}</td>
            <td>
                <div style="display:flex; gap: 10px;">
                    <button class="outline-button" onclick="editStaff('${s.id}')" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #d8a94f; color: #d8a94f; background: transparent; cursor: pointer; font-weight: 500;">
                        Phân Quyền
                    </button>
                    <button class="outline-button" onclick="deleteStaff('${s.id}')" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #dc2626; color: #dc2626; background: transparent; cursor: pointer; font-weight: 500;">
                        Xóa
                    </button>
                </div>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = rows.join('');
};

window.openAddStaffModal = function() {
    document.getElementById('staff-id').value = '';
    document.getElementById('staff-name').value = '';
    document.getElementById('staff-email').value = '';
    document.getElementById('staff-phone').value = '';
    document.getElementById('staff-password').value = '';
    document.getElementById('staff-role').value = 'Sales';
    document.getElementById('staff-commission').value = '0';
    document.getElementById('staff-kpi').value = '0';
    document.getElementById('staff-modal').style.display = 'block';
};

window.editStaff = function(id) {
    const s = globalStaffList.find(x => x.id === id);
    if(s) {
        document.getElementById('staff-id').value = s.id;
        document.getElementById('staff-name').value = s.name || '';
        document.getElementById('staff-email').value = s.email || '';
        document.getElementById('staff-phone').value = s.phone || '';
        document.getElementById('staff-password').value = '';
        document.getElementById('staff-role').value = s.role || 'Sales';
        document.getElementById('staff-commission').value = s.commissionRate || 0;
        document.getElementById('staff-kpi').value = s.kpi || 0;
        
        document.getElementById('staff-modal').style.display = 'block';
    }
};

window.deleteStaff = async function(id) {
    if(confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống? Dữ liệu không thể khôi phục!')) {
        try {
            let apiSuccess = false;
            try {
                const res = await fetch('/api/staff?id=' + id, { method: 'DELETE' });
                if (res.ok) apiSuccess = true;
            } catch (e) {
                console.warn('Network error deleting staff', e);
            }

            if (!apiSuccess) {
                console.warn('API delete failed, falling back to Local Storage.');
                if (window.GradieStore) {
                    let staffList = window.GradieStore.getStaff() || [];
                    staffList = staffList.filter(s => s.id !== id);
                    window.GradieStore.saveStaff(staffList);
                }
            }
            showToast('Đã xóa nhân viên thành công!', 'success');
            
            if (window.GradieStore && window.GradieStore.addActivityLog) {
                window.GradieStore.addActivityLog("Xóa nhân sự", `Đã xóa nhân viên ID: ${id}`);
                if(window.renderActivityLogs) window.renderActivityLogs();
            }

            fetchStaffFromMongo();
        } catch (e) {
            console.error(e);
            showToast('Lỗi khi xóa nhân viên!', 'error');
        }
    }
};
