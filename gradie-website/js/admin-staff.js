// js/admin-staff.js

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderStaffTable();
    renderActivityLogs();

    // Setup Modal
    const modal = document.getElementById('staff-modal');
    const closeBtns = modal.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.classList.remove('active');
    }));

    // Form Submit
    document.getElementById('staff-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('staff-id').value;
        const role = document.getElementById('staff-role').value;
        const commissionRate = parseFloat(document.getElementById('staff-commission').value) || 0;
        const kpi = parseFloat(document.getElementById('staff-kpi').value) || 0;

        let staffList = window.GradieStore.getStaff();
        const index = staffList.findIndex(s => s.id === id);
        if(index !== -1) {
            staffList[index].role = role;
            staffList[index].commissionRate = commissionRate;
            staffList[index].kpi = kpi;
            window.GradieStore.saveStaff(staffList);
            
            // Log Activity
            window.GradieStore.addActivityLog(
                "Cập nhật phân quyền",
                `Đã cập nhật chức vụ/KPIs cho nhân viên: ${staffList[index].name} (${role})`
            );
            
            modal.classList.remove('active');
            renderStaffTable();
            renderActivityLogs();
        }
    });
});

window.renderStaffTable = function() {
    const staffList = window.GradieStore.getStaff();
    const tbody = document.getElementById('admin-staff-list');
    
    if(!tbody) return;

    if (!staffList || staffList.length === 0) {
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

    const rows = staffList.map(s => {
        const rc = roleColors[s.role] || { bg: '#e2e8f0', text: '#475569' };
        
        let kpiText = '-';
        if(s.role === 'Sales') {
            kpiText = `Hoa hồng: ${s.commissionRate}%<br><span style="font-size:0.8rem; color:#64748b;">KPI: ${s.kpi.toLocaleString('vi-VN')}đ</span>`;
        } else if(s.kpi > 0) {
            kpiText = `KPI: ${s.kpi.toLocaleString('vi-VN')}đ`;
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
                <button class="outline-button" onclick="editStaff('${s.id}')" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #d8a94f; color: #d8a94f; background: transparent; cursor: pointer; font-weight: 500;">
                    Phân Quyền
                </button>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = rows.join('');
};

window.renderActivityLogs = function() {
    const logs = window.GradieStore.getActivityLogs();
    const tbody = document.getElementById('admin-activity-logs');
    
    if(!tbody) return;

    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #64748b;">Chưa có lịch sử thao tác.</td></tr>';
        return;
    }

    const rows = logs.slice(0, 50).map(log => {
        const d = new Date(log.timestamp);
        const timeStr = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        return `
        <tr>
            <td style="color:#64748b; font-size:0.85rem;">${timeStr}</td>
            <td style="font-weight:500;">${log.user}</td>
            <td style="color:#0f172a; font-weight:600;">${log.action}</td>
            <td style="color:#475569; font-size:0.9rem;">${log.details}</td>
        </tr>
        `;
    });

    tbody.innerHTML = rows.join('');
};

window.editStaff = function(id) {
    const staffList = window.GradieStore.getStaff();
    const s = staffList.find(x => x.id === id);
    if(s) {
        document.getElementById('staff-id').value = s.id;
        document.getElementById('staff-name').value = s.name;
        document.getElementById('staff-role').value = s.role || 'Sales';
        document.getElementById('staff-commission').value = s.commissionRate || 0;
        document.getElementById('staff-kpi').value = s.kpi || 0;
        
        document.getElementById('staff-modal').classList.add('active');
    }
};
