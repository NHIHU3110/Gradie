const categories = [ 'Hoa hồng gấu bông', 'Hộp quà', 'Sash' ];
const products = [];
try {
const html = categories.map(c => {
                    const count = products.filter(p => p.category === c).length;
                    return `
                        <tr>
                            <td><strong>${c}</strong></td>
                            <td>${count} products</td>
                            <td>
                                <button class="btn-primary" onclick="openAssignModal('${c.replace(/'/g, "\\'")}')">Assign Products</button>
                                <button class="btn-danger" onclick="if(confirm('Delete category?')){ window.GradieStore.deleteCategory('${c.replace(/'/g, "\\'")}'); renderAdminCategories(); }">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('');
console.log("HTML OK:", html.length);
} catch (e) { console.error("Error:", e); }
