// Supabase Client Initialization
// REEMPLAZA ESTAS CLAVES CON LAS DE TU PROPIO PROYECTO DE SUPABASE
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";

let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. MOBILE MENU TOGGLE
    // ==========================================
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const isOpen = navMenu.classList.contains('open');
            menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });
        
        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }

    // ==========================================
    // 2. SCROLL EVENTS: STICKY HEADER & ACTIVE LINKS
    // ==========================================
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        
        // Sticky Header class
        if (header) {
            if (scrollPos > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Highlight active link in navigation
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    });

    // ==========================================
    // 3. CONTACT FORM HANDLER (WEB3FORMS)
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const formSubmit = document.getElementById('form-submit');
    const submitText = formSubmit ? formSubmit.querySelector('.btn-text') : null;
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading state
            if (formSubmit && submitText) {
                formSubmit.disabled = true;
                submitText.textContent = 'Enviando...';
                const submitIcon = formSubmit.querySelector('i');
                if (submitIcon) {
                    submitIcon.className = 'fa-solid fa-spinner fa-spin';
                }
            }
            
            const formData = new FormData(contactForm);
            
            // If the user hasn't configured their Web3Forms API Key, we show a helpful message
            const accessKey = formData.get('access_key');
            if (accessKey === 'YOUR_ACCESS_KEY_HERE') {
                // Mock success for development if key is default
                setTimeout(() => {
                    showFormStatus('¡Mensaje enviado con éxito! (Modo de demostración: Por favor, introduce tu clave de Web3Forms en index.html para habilitar envíos reales).', 'success');
                    resetFormState();
                }, 1000);
                return;
            }
            
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);
            
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });
                
                const result = await response.json();
                
                if (response.status === 200) {
                    showFormStatus('¡Muchas gracias! Tu mensaje ha sido enviado correctamente. Celia te responderá lo antes posible.', 'success');
                    contactForm.reset();
                } else {
                    console.error(result);
                    showFormStatus(result.message || 'Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.', 'error');
                }
            } catch (error) {
                console.error(error);
                showFormStatus('Hubo un error de conexión al enviar el formulario. Por favor, inténtalo de nuevo.', 'error');
            } finally {
                resetFormState();
            }
        });
    }
    
    function showFormStatus(message, type) {
        if (formStatus) {
            formStatus.textContent = message;
            formStatus.className = `form-status ${type}`;
        }
    }
    
    function resetFormState() {
        if (formSubmit && submitText) {
            formSubmit.disabled = false;
            submitText.textContent = 'Enviar Mensaje';
            const submitIcon = formSubmit.querySelector('i');
            if (submitIcon) {
                submitIcon.className = 'fa-solid fa-paper-plane';
            }
        }
    }

    // ==========================================
    // 4. INSTAGRAM DYNAMIC LOADER
    // ==========================================
    const instagramGrid = document.getElementById('instagram-grid');
    
    async function loadInstagramFeed() {
        if (!instagramGrid) return;
        
        // 1. Try to load from Supabase if configured
        if (supabaseClient) {
            try {
                const { data: posts, error } = await supabaseClient
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(6);
                    
                if (error) throw error;
                
                if (posts && posts.length > 0) {
                    instagramGrid.innerHTML = '';
                    posts.forEach(post => {
                        const card = createInstagramCard(post);
                        instagramGrid.appendChild(card);
                    });
                    console.log("Feed loaded in real-time from Supabase.");
                    return;
                }
            } catch (err) {
                console.warn("Supabase database fetch error, falling back to JSON:", err);
            }
        }
        
        // 2. Fallback to local JSON file
        try {
            const response = await fetch('instagram.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar instagram.json');
            }
            const posts = await response.json();
            
            if (!posts || posts.length === 0) {
                showFallbackFeed();
                return;
            }
            
            instagramGrid.innerHTML = '';
            posts.slice(0, 6).forEach(post => {
                const card = createInstagramCard(post);
                instagramGrid.appendChild(card);
            });
            console.log("Feed loaded from local instagram.json.");
            
        } catch (error) {
            console.warn('Cargando feed de respaldo (Local):', error);
            showFallbackFeed();
        }
    }
    
    function createInstagramCard(post) {
        const card = document.createElement('article');
        card.className = 'instagram-card';
        
        // Format date beautifully (simple string conversion)
        let formattedDate = 'Reciente';
        if (post.date) {
            try {
                const d = new Date(post.date);
                if (!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                } else {
                    formattedDate = post.date;
                }
            } catch (e) {
                formattedDate = post.date;
            }
        }
        
        const caption = post.caption || '';
        const link = post.link || 'https://www.instagram.com/celiaserpi/';
        const image = (post.image && !post.image.includes('unsplash.com') && !post.image.includes('picsum.photos')) ? post.image : null;
        
        const isTikTok = link.includes('tiktok.com');
        const iconClass = isTikTok ? 'fa-brands fa-tiktok' : 'fa-brands fa-instagram';
        const platformName = isTikTok ? 'TikTok' : 'Instagram';
        
        if (image) {
            card.className = 'instagram-card';
            card.innerHTML = `
                <a href="${link}" target="_blank" aria-label="Ver publicación en ${platformName}">
                    <div class="instagram-img-wrapper">
                        <img src="${image}" alt="${caption.slice(0, 80)}" class="instagram-img" loading="lazy">
                        <div class="instagram-overlay">
                            <i class="${iconClass}"></i>
                        </div>
                    </div>
                    <div class="instagram-body">
                        <p class="instagram-caption">${caption || 'Sin pie de foto'}</p>
                        <span class="instagram-date">${formattedDate}</span>
                    </div>
                </a>
            `;
        } else {
            card.className = 'instagram-card text-only';
            card.innerHTML = `
                <a href="${link}" target="_blank" aria-label="Ver publicación en ${platformName}">
                    <div class="instagram-body">
                        <div class="instagram-text-header">
                            <i class="${iconClass}"></i>
                            <span class="instagram-platform">${platformName}</span>
                        </div>
                        <p class="instagram-caption">${caption || 'Sin pie de foto'}</p>
                        <span class="instagram-date">${formattedDate}</span>
                    </div>
                </a>
            `;
        }
        return card;
    }
    
    function showFallbackFeed() {
        if (!instagramGrid) return;
        
        // Curated backup posts for Celia's literary profile without stock photos
        const backupPosts = [
            {
                caption: '📖 Recomendación del mes: El Imperio del Vampiro. Una obra maestra de la fantasía oscura con un ritmo brutal y personajes inolvidables. ¿Quién más está esperando la tercera parte? 🧛‍♂️✨',
                date: '2026-07-10',
                link: 'https://www.instagram.com/celiaserpi/'
            },
            {
                caption: '✍️ ¿Cómo corregir la redundancia en tus textos? Uno de los errores más comunes al escribir ficción es repetir conceptos innecesariamente. Aquí te dejo 3 trucos rápidos de estilo editorial. #consejosdeescritura',
                date: '2026-07-05',
                link: 'https://www.instagram.com/celiaserpi/'
            },
            {
                caption: '📚 Detrás de las cámaras de un informe de lectura. Así es como analizo una novela: estructura, ritmo, construcción del worldbuilding y la verosimilitud de la trama. ¡Pronto más consejos!',
                date: '2026-06-28',
                link: 'https://www.instagram.com/celiaserpi/'
            },
            {
                caption: '❓ ¿Sabías que "sino" y "si no" significan cosas totalmente distintas? Aprender a diferenciarlos es clave para que tus textos no pierdan profesionalidad. Desliza para ver ejemplos. #gramatica',
                date: '2026-06-20',
                link: 'https://www.instagram.com/celiaserpi/'
            },
            {
                caption: '✨ "Un libro debe ser el hacha que rompa el mar helado dentro de nosotros". Escribir es un acto de valentía, y mi labor es ayudarte a que esa voz suene clara y potente. ¡Feliz semana! 🍂',
                date: '2026-06-15',
                link: 'https://www.instagram.com/celiaserpi/'
            },
            {
                caption: '📢 ¿Dudas sobre qué tipo de corrección necesita tu manuscrito? Cuéntame tu proyecto en el formulario y te daré un presupuesto detallado sin compromiso. ✍️',
                date: '2026-06-08',
                link: 'https://www.instagram.com/celiaserpi/'
            }
        ];
        
        instagramGrid.innerHTML = '';
        backupPosts.forEach(post => {
            const card = createInstagramCard(post);
            instagramGrid.appendChild(card);
        });
    }
    
    // Run loading
    loadInstagramFeed();
});
