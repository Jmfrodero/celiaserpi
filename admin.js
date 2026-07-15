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
    const postsList = document.getElementById('posts-list');

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

    // 5. Post Form Submit
    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const caption = document.getElementById('post-caption').value.trim();
            const link = document.getElementById('post-link').value.trim();
            const image = document.getElementById('post-image').value.trim();
            
            setBtnLoading(postSubmit, "Publicando...");
            hideStatus(postStatus);
            
            try {
                // Insert new row into the 'posts' table
                const { error } = await supabaseClient
                    .from('posts')
                    .insert([
                        {
                            caption: caption,
                            link: link || null,
                            image: image || null,
                            created_at: new Date().toISOString()
                        }
                    ]);
                    
                if (error) throw error;
                
                showStatus(postStatus, "¡Publicado con éxito! Se mostrará en la web de inmediato.", "success");
                postForm.reset();
                loadPosts(); // Reload active list
                
            } catch (err) {
                console.error("Publish error:", err);
                showStatus(postStatus, err.message || "Error al publicar. Verifica los permisos de tu base de datos.", "error");
            } finally {
                resetBtnState(postSubmit, "Publicar en la Web", "fa-solid fa-paper-plane");
            }
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
            // Fetch posts ordered by created_at descending
            const { data: posts, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            if (!posts || posts.length === 0) {
                postsList.innerHTML = '<p class="text-center text-muted">No tienes publicaciones activas aún.</p>';
                return;
            }
            
            postsList.innerHTML = '';
            
            posts.forEach(post => {
                const item = document.createElement('div');
                item.className = 'admin-post-item';
                
                // Format text snippet
                const captionText = post.caption || 'Sin texto';
                const hasImage = !!post.image;
                const platformIcon = post.link && post.link.includes('tiktok.com') ? 'fa-brands fa-tiktok' : 'fa-brands fa-instagram';
                
                item.innerHTML = `
                    <div class="admin-post-meta">
                        <span class="admin-post-icon"><i class="${platformIcon}"></i></span>
                        <div class="admin-post-details">
                            <p class="admin-post-text">${captionText}</p>
                            <span class="admin-post-info">
                                ${post.date || new Date(post.created_at).toLocaleDateString('es-ES')} 
                                ${hasImage ? '• 🖼️ Con Imagen' : '• 📝 Solo Texto'}
                            </span>
                        </div>
                    </div>
                    <button class="btn-delete" data-id="${post.id}" title="Eliminar publicación">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                
                // Add delete event handler
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
            
        } catch (err) {
            console.error("Load posts error:", err);
            postsList.innerHTML = `<p class="text-center text-error">Error al cargar publicaciones: ${err.message || 'Verifica RLS.'}</p>`;
        }
    }
    
    async function deletePost(id) {
        try {
            const { error } = await supabaseClient
                .from('posts')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            loadPosts(); // Reload list
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
