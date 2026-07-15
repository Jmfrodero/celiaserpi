// Supabase Client Initialization
// REEMPLAZA ESTAS CLAVES CON LAS DE TU PROPIO PROYECTO DE SUPABASE
const SUPABASE_URL = "https://cmlohjjivrmwavwdwbtv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbG9oamppdnJtd2F2d2R3YnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNDEzMDMsImV4cCI6MjA5OTcxNzMwM30.NEH874ZBoyAIktmG2c9q5CzcAgXOmgTy2bHPIuB81MA";

let supabaseClient = null;

// Initialize Supabase if keys are provided
if (SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const loginStatus = document.getElementById('login-status');
    const loginSubmit = document.getElementById('login-submit');
    const logoutBtn = document.getElementById('logout-btn');
    
    const postForm = document.getElementById('post-form');
    const postStatus = document.getElementById('post-status');
    const postSubmit = document.getElementById('post-submit');
    const postCancelEdit = document.getElementById('post-cancel-edit');
    const postsList = document.getElementById('posts-list');
    const sortPostsSelect = document.getElementById('sort-posts');

    // Estado global de la aplicación
    let editingPostId = null;
    let loadedPosts = [];

    // 1. Check if Supabase keys are configured
    if (!supabaseClient) {
        showStatus(loginStatus, "Error: Supabase no está configurado. Por favor, añade las credenciales de tu proyecto en admin.js.", "error");
        if (loginSubmit) loginSubmit.disabled = true;
        return;
    }

    // 2. Check current session on load
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (session) {
            showDashboard();
        } else {
            showLogin();
        }
    } catch (err) {
        console.error("Session check error:", err);
        showLogin();
    }

    // 3. Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Show loading state
            setBtnLoading(loginSubmit, "Iniciando sesión...");
            hideStatus(loginStatus);
            
            // Convert simple username to a fake email for Supabase Auth backend
            const email = `${username.toLowerCase()}@celiaserpi.com`;
            
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                
                showStatus(loginStatus, "¡Inicio de sesión correcto! Redirigiendo...", "success");
                setTimeout(() => {
                    showDashboard();
                }, 800);
                
            } catch (err) {
                console.error("Login error:", err);
                showStatus(loginStatus, err.message || "Usuario o contraseña incorrectos.", "error");
            } finally {
                resetBtnState(loginSubmit, "Iniciar Sesión", "fa-solid fa-right-to-bracket");
            }
        });
    }

    // 4. Logout Button Click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await supabaseClient.auth.signOut();
                showLogin();
            } catch (err) {
                console.error("Logout error:", err);
            }
        });
    }

    // 5. Post Form Submit (Maneja Insertar y Modificar)
    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const caption = document.getElementById('post-caption').value.trim();
            const link = document.getElementById('post-link').value.trim();
            const image = document.getElementById('post-image').value.trim();
            const displayOrder = parseInt(document.getElementById('post-order').value) || 0;
            
            const isEditing = editingPostId !== null;
            setBtnLoading(postSubmit, isEditing ? "Guardando..." : "Publicando...");
            hideStatus(postStatus);
            
            try {
                if (isEditing) {
                    // Consulta UPDATE para modificar post existente
                    const { error } = await supabaseClient
                        .from('posts')
                        .update({
                            caption: caption,
                            link: link || null,
                            image: image || null,
                            display_order: displayOrder
                        })
                        .eq('id', editingPostId);
                        
                    if (error) throw error;
                    showStatus(postStatus, "¡Publicación modificada con éxito!", "success");
                    cancelEditing();
                } else {
                    // Consulta INSERT para nuevo post
                    const { error } = await supabaseClient
                        .from('posts')
                        .insert([
                            {
                                caption: caption,
                                link: link || null,
                                image: image || null,
                                display_order: displayOrder,
                                created_at: new Date().toISOString()
                            }
                        ]);
                        
                    if (error) throw error;
                    showStatus(postStatus, "¡Publicado con éxito! Se mostrará en la web de inmediato.", "success");
                    postForm.reset();
                    document.getElementById('post-order').value = 0; // Reset a valor por defecto
                }
                
                loadPosts(); // Recargar lista
                
            } catch (err) {
                console.error("Submit post error:", err);
                showStatus(postStatus, err.message || "Error al procesar el post. Verifica los permisos de tu base de datos.", "error");
            } finally {
                resetBtnState(
                    postSubmit, 
                    editingPostId !== null ? "Guardando Cambios" : "Publicar en la Web", 
                    editingPostId !== null ? "fa-solid fa-check" : "fa-solid fa-paper-plane"
                );
            }
        });
    }

    // 6. Cancel Edit Button Click
    if (postCancelEdit) {
        postCancelEdit.addEventListener('click', () => {
            cancelEditing();
        });
    }

    // 7. Sort Dropdown Change
    if (sortPostsSelect) {
        sortPostsSelect.addEventListener('change', () => {
            renderSortedPosts();
        });
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    function showLogin() {
        if (loginContainer) loginContainer.style.display = 'flex';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
        hideStatus(loginStatus);
    }
    
    function showDashboard() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'block';
        loadPosts();
    }
    
    async function loadPosts() {
        if (!postsList) return;
        
        postsList.innerHTML = '<div class="admin-loading-spinner text-center"><i class="fa-solid fa-spinner fa-spin"></i> Cargando publicaciones...</div>';
        
        try {
            const { data: posts, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            loadedPosts = posts || [];
            renderSortedPosts();
            
        } catch (err) {
            console.error("Load posts error:", err);
            postsList.innerHTML = `<p class="text-center text-error">Error al cargar publicaciones: ${err.message || 'Verifica RLS.'}</p>`;
        }
    }

    function renderSortedPosts() {
        if (!postsList) return;
        
        if (loadedPosts.length === 0) {
            postsList.innerHTML = '<p class="text-center text-muted">No tienes publicaciones activas aún.</p>';
            return;
        }

        const sortType = sortPostsSelect ? sortPostsSelect.value : 'web';
        let sorted = [...loadedPosts];

        // Lógica de ordenamiento
        if (sortType === 'web') {
            sorted.sort((a, b) => {
                const orderA = a.display_order !== undefined && a.display_order !== null ? a.display_order : 0;
                const orderB = b.display_order !== undefined && b.display_order !== null ? b.display_order : 0;
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            });
        } else if (sortType === 'newest') {
            sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        } else if (sortType === 'oldest') {
            sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        } else if (sortType === 'alphabetical') {
            sorted.sort((a, b) => (a.caption || '').localeCompare(b.caption || ''));
        }

        postsList.innerHTML = '';
        
        sorted.forEach(post => {
            const item = document.createElement('div');
            item.className = 'admin-post-item';
            
            const captionText = post.caption || 'Sin texto';
            const hasImage = !!post.image;
            const platformIcon = post.link && post.link.includes('tiktok.com') ? 'fa-brands fa-tiktok' : 'fa-brands fa-instagram';
            const displayOrderText = post.display_order !== undefined && post.display_order !== null ? ` | Orden: ${post.display_order}` : '';
            
            item.innerHTML = `
                <div class="admin-post-meta">
                    <span class="admin-post-icon"><i class="${platformIcon}"></i></span>
                    <div class="admin-post-details">
                        <p class="admin-post-text">${captionText}</p>
                        <span class="admin-post-info">
                            ${post.date || new Date(post.created_at).toLocaleDateString('es-ES')}${displayOrderText} 
                            ${hasImage ? '• 🖼️ Con Imagen' : '• 📝 Solo Texto'}
                        </span>
                    </div>
                </div>
                <div class="admin-post-actions" style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                    <button class="btn-edit-post" data-id="${post.id}" title="Editar publicación" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 1.1rem; padding: 0.5rem; border-radius: 50%; transition: var(--transition); display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-delete" data-id="${post.id}" title="Eliminar publicación">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            
            // Event listener para editar
            const editBtn = item.querySelector('.btn-edit-post');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    startEditing(post);
                });
            }
            
            // Event listener para eliminar
            const deleteBtn = item.querySelector('.btn-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    const id = deleteBtn.getAttribute('data-id');
                    if (confirm('¿Estás segura de que quieres eliminar esta publicación?')) {
                        await deletePost(id);
                    }
                });
            }
            
            postsList.appendChild(item);
        });
    }
    
    function startEditing(post) {
        editingPostId = post.id;
        document.getElementById('post-caption').value = post.caption;
        document.getElementById('post-link').value = post.link || '';
        document.getElementById('post-image').value = post.image || '';
        document.getElementById('post-order').value = post.display_order !== undefined && post.display_order !== null ? post.display_order : 0;
        
        // Actualizar título y textos del formulario
        document.querySelector('.admin-form-section h3').textContent = "Editar Publicación";
        document.querySelector('.admin-form-section .admin-form-desc').textContent = "Modifica los campos del post y guarda los cambios.";
        postSubmit.querySelector('.btn-text').textContent = "Guardar Cambios";
        postSubmit.querySelector('i').className = "fa-solid fa-check";
        
        // Mostrar botón de cancelar
        if (postCancelEdit) postCancelEdit.style.display = 'block';
        
        // Hacer scroll hasta el formulario en móviles
        document.querySelector('.admin-form-section').scrollIntoView({ behavior: 'smooth' });
    }
    
    function cancelEditing() {
        editingPostId = null;
        postForm.reset();
        document.getElementById('post-order').value = 0;
        
        // Restaurar título y textos originales del formulario
        document.querySelector('.admin-form-section h3').textContent = "Nueva Publicación";
        document.querySelector('.admin-form-section .admin-form-desc').textContent = "Crea una nota de texto para tu comunidad, opcionalmente enlazada a tus redes.";
        postSubmit.querySelector('.btn-text').textContent = "Publicar en la Web";
        postSubmit.querySelector('i').className = "fa-solid fa-paper-plane";
        
        // Ocultar botón de cancelar
        if (postCancelEdit) postCancelEdit.style.display = 'none';
        hideStatus(postStatus);
    }
    
    async function deletePost(id) {
        try {
            const { error } = await supabaseClient
                .from('posts')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            // Si el post eliminado se estaba editando, cancelamos la edición
            if (editingPostId === id) {
                cancelEditing();
            }
            
            loadPosts();
        } catch (err) {
            console.error("Delete post error:", err);
            alert(`Error al eliminar la publicación: ${err.message}`);
        }
    }
    
    function showStatus(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = `form-status ${type}`;
            element.style.display = 'block';
        }
    }
    
    function hideStatus(element) {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
    
    function setBtnLoading(button, text) {
        if (button) {
            button.disabled = true;
            const btnText = button.querySelector('.btn-text');
            const icon = button.querySelector('i');
            if (btnText) btnText.textContent = text;
            if (icon) icon.className = 'fa-solid fa-spinner fa-spin';
        }
    }
    
    function resetBtnState(button, text, iconClass) {
        if (button) {
            button.disabled = false;
            const btnText = button.querySelector('.btn-text');
            const icon = button.querySelector('i');
            if (btnText) btnText.textContent = text;
            if (icon) icon.className = iconClass;
        }
    }
});
