// Preloader
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    preloader.classList.add('fade-out');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
    
    // Cargar la galería desde el Worker
    loadGalleryFromWorker();
});

// URL base del Worker de Cloudflare (actualiza esto con tu dominio real)
const WORKER_BASE_URL = 'https://crimson-bar-7cc2.entitydh.workers.dev/';

// Función para cargar la galería desde el Worker
function loadGalleryFromWorker() {
    // Hacemos fetch al endpoint público del worker que devuelve los datos de la galería
    fetch(`${WORKER_BASE_URL}/gallery-data.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar los datos de la galería');
            }
            return response.json();
        })
        .then(data => {
            renderGallery(data.images);
            setupGalleryEvents();
        })
        .catch(error => {
            console.error('Error cargando la galería:', error);
            document.querySelector('.gallery-items').innerHTML = '<p class="error-message">No se pudieron cargar las imágenes. Por favor, inténtalo de nuevo más tarde.</p>';
        });
}

// Función para renderizar la galería
function renderGallery(images) {
    const galleryContainer = document.querySelector('.gallery-items');
    galleryContainer.innerHTML = ''; // Limpiar contenedor
    
    if (!images || images.length === 0) {
        galleryContainer.innerHTML = '<p class="info-message">No hay imágenes disponibles en este momento.</p>';
        return;
    }
    
    images.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-category', image.category);
        galleryItem.setAttribute('data-id', image.id);
        
        galleryItem.innerHTML = `
            <img src="${image.src}" alt="${image.alt || image.title}" class="gallery-img">
            <div class="gallery-overlay">
                <h3 class="gallery-title">${image.title}</h3>
                <span class="gallery-category">${image.category}</span>
                <a href="#" class="btn gallery-btn">Ver Detalles</a>
            </div>
        `;
        
        galleryContainer.appendChild(galleryItem);
    });
}

// Configurar eventos de la galería después de cargarla
function setupGalleryEvents() {
    // Gallery Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Active button
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            const filter = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || filter === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Gallery Modal
    const galleryLinks = document.querySelectorAll('.gallery-overlay .btn');
    const modal = document.querySelector('#gallery-modal');
    const modalClose = document.querySelector('#modal-close');
    const modalImg = document.querySelector('.modal-img');
    const modalTitle = document.querySelector('.modal-title');
    const modalCategory = document.querySelector('.modal-category');
    const modalDesc = document.querySelector('.modal-desc');
    const modalDetails = document.querySelector('.modal-details');

    galleryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const item = this.closest('.gallery-item');
            const itemId = parseInt(item.getAttribute('data-id'));
            
            // Buscar la imagen en los datos del Worker
            fetch(`${WORKER_BASE_URL}/gallery-data.json`)
                .then(response => response.json())
                .then(data => {
                    const imageData = data.images.find(img => img.id === itemId);
                    
                    if (imageData) {
                        modalImg.src = imageData.src;
                        modalTitle.textContent = imageData.title;
                        modalCategory.textContent = imageData.category;
                        modalDesc.textContent = imageData.description || 'Sin descripción disponible';
                        
                        // Actualizar los detalles del modal
                        modalDetails.innerHTML = `
                            <div class="detail-item">
                                <i class="fas fa-map-marker-alt detail-icon"></i>
                                <span>${imageData.location || 'No especificado'}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-users detail-icon"></i>
                                <span>${imageData.guests || 'No especificado'}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-paint-brush detail-icon"></i>
                                <span>${imageData.theme || 'No especificado'}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar-alt detail-icon"></i>
                                <span>${imageData.date || 'No especificado'}</span>
                            </div>
                        `;
                        
                        modal.classList.add('open');
                        document.body.style.overflow = 'hidden';
                    }
                })
                .catch(error => {
                    console.error('Error al cargar detalles de la imagen:', error);
                });
        });
    });

    modalClose.addEventListener('click', function() {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    });
}

// Sticky Header
window.addEventListener('scroll', function() {
    const header = document.querySelector('#header');
    const backToTop = document.querySelector('#back-to-top');
    
    if (window.scrollY > 100) {
        header.classList.add('sticky');
        backToTop.classList.add('active');
    } else {
        header.classList.remove('sticky');
        backToTop.classList.remove('active');
    }
});

// Mobile Menu
const burger = document.querySelector('#burger');
const nav = document.querySelector('#nav');

burger.addEventListener('click', function() {
    this.classList.toggle('active');
    nav.classList.toggle('active');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        if (nav.classList.contains('active')) {
            burger.classList.remove('active');
            nav.classList.remove('active');
        }

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Active Navigation Link
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', function() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Form Submission
const reservationForm = document.querySelector('#reservation-form');

if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Recopilar los datos del formulario
        const nombre = document.getElementById('nombre').value;
        const tipoEvento = document.getElementById('tipo-evento').value;
        const fechaEvento = document.getElementById('fecha-evento').value;
        const paquete = document.getElementById('paquete').value;
        const mensaje = document.getElementById('mensaje').value;
        
        // Número de WhatsApp fijo donde se enviarán los datos (sin espacios ni caracteres especiales)
        const numeroWhatsapp = "18623358729";
        
        // Crear el mensaje para WhatsApp
        let mensajeWhatsapp = `*Nueva Reservación*%0A%0A`;
        mensajeWhatsapp += `*Nombre:* ${nombre}%0A`;
        mensajeWhatsapp += `*Tipo de Evento:* ${tipoEvento}%0A`;
        mensajeWhatsapp += `*Fecha del Evento:* ${fechaEvento}%0A`;
        mensajeWhatsapp += `*Paquete:* ${paquete}%0A`;
        mensajeWhatsapp += `*Mensaje:* ${mensaje}%0A`;
        
        // Generar la URL de WhatsApp
        const whatsappURL = `https://wa.me/${numeroWhatsapp}?text=${mensajeWhatsapp}`;
        
        // Abrir WhatsApp en una nueva ventana
        window.open(whatsappURL, '_blank');
        
        // Resetear el formulario después del envío
        this.reset();
    });
}

// Contacto form (si existe)
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Here you would normally send the form data to your server
        alert('¡Gracias por tu mensaje! Te responderemos a la brevedad.');
        this.reset();
    });
}

// Animaciones al hacer scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.about-content, .section-title, .gallery-items, .pricing-container, .reservation-container, .contact-container');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.classList.add('animate');
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
// Ejecutar una vez al cargar para animar elementos visibles
window.addEventListener('load', animateOnScroll);

// Inicializar fechas mínimas en los inputs de tipo fecha
const dateInputs = document.querySelectorAll('input[type="date"]');
if (dateInputs.length > 0) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const minDate = `${yyyy}-${mm}-${dd}`;
    
    dateInputs.forEach(input => {
        input.setAttribute('min', minDate);
    });
}