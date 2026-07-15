# Celia Serpi - Portfolio & Landing Editorial

Este repositorio contiene la página web profesional de **Celia Serpi**, correctora y editora editorial. El diseño tiene una estética de tonos beige y crema, con una tipografía en marrón oscuro, proporcionando una lectura relajada y elegante que imita el papel físico de un libro.

## 🚀 Características
- **Totalmente Responsive:** Optimizado para ordenadores de escritorio, tabletas y teléfonos móviles.
- **Formulario de Contacto Inteligente:** Utiliza **Web3Forms** para recibir los mensajes de clientes directamente en el correo electrónico de Celia sin costes ni servidores.
- **Feed de Comunidad Automatizado:** Un script en Python actualiza diariamente las publicaciones (reseñas de libros, novedades editoriales, consejos de escritura) en el archivo `instagram.json` mediante GitHub Actions, permitiendo que la web se actualice sola de forma 100% estática.

---

## 🛠️ Estructura del Proyecto
- `index.html`: Estructura semántica del sitio web.
- `style.css`: Estilos, tipografías y efectos visuales (incluyendo una ilustración interactiva de un libro en 3D en el Hero).
- `app.js`: Lógica del cliente, animaciones y carga dinámica de las publicaciones.
- `instagram.json`: Archivo de datos donde se guardan los posts recientes (imágenes, enlaces y textos).
- `scrape_instagram.py`: Script en Python encargado de realizar el scraping seguro y tolerante a fallos.
- `.github/workflows/scrape_instagram.yml`: Pipeline de integración continua que ejecuta el scraping de forma automatizada todas las noches.

---

## 💻 Ejecución Local

### 1. Previsualizar la Web
Puedes abrir directamente el archivo `index.html` en tu navegador, o levantar un servidor web local sencillo.
- **Opción con Python:**
  ```bash
  python -m http.server 8000
  ```
  Luego, abre en tu navegador `http://localhost:8000`.

- **Opción con Node/npm:**
  ```bash
  npx serve
  ```

### 2. Ejecutar el Scraper de Redes
Si deseas forzar una actualización del feed de forma manual en tu máquina local:
```bash
python scrape_instagram.py
```
*Asegúrate de que el script actualiza el archivo `instagram.json` correctamente.*

---

## ⚙️ Configuración del Formulario (Web3Forms)
Para que los clientes puedan enviar mensajes y Celia los reciba en su email, sigue estos pasos:
1. Ve a [web3forms.com](https://web3forms.com/) y pon tu correo electrónico para generar una **Access Key** gratuita (se crea al instante).
2. Abre `index.html` y busca la línea donde se encuentra el formulario de contacto (alrededor de la línea 197):
   ```html
   <input type="hidden" name="access_key" value="TU_ACCESS_KEY_AQUI">
   ```
3. Reemplaza `YOUR_ACCESS_KEY_HERE` por tu clave de acceso. ¡Listo! Los correos llegarán directamente a la bandeja de entrada de Celia.

---

## 🌐 Subir a GitHub y Configurar Dominio Personalizado

### 1. Subir el Repositorio a GitHub
1. Crea un nuevo repositorio **público** en tu cuenta de GitHub (ej. `PortfolioCelia`).
2. Sube el código local ejecutando los siguientes comandos en tu terminal:
   ```bash
   git add .
   git commit -m "feat: initial commit with beige portfolio template and automated scraper"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

### 2. Habilitar GitHub Pages (Hosting Gratuito)
1. En tu repositorio en GitHub, ve a **Settings** (Configuración) -> **Pages**.
2. Bajo la sección **Build and deployment**, selecciona:
   - **Source:** *Deploy from a branch*
   - **Branch:** *main* | * / (root)*
3. Haz clic en **Save**. En un par de minutos tu web estará activa en `https://TU_USUARIO.github.io/TU_REPOSITORIO/`.

### 3. Vincular su Dominio Comprado
Para que la web cargue usando tu propio dominio (ej. `www.celiaserpi.com`), sigue estos pasos:

#### Paso A: Configurar DNS en tu proveedor de dominio
Ve al panel de administración del dominio que compraste (donde lo compraste: GoDaddy, Namecheap, DonDominio, etc.) y añade los siguientes registros en la sección **DNS**:

1. **Registros A (Apuntan a las IPs de GitHub Pages):**
   Crea 4 registros de tipo `A` que apunten a las siguientes direcciones IP de GitHub:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`

2. **Registro CNAME (Para el subdominio www):**
   Crea o edita un registro tipo `CNAME` con el nombre `www` y apunta su valor a tu dirección de GitHub Pages (ej. `TU_USUARIO.github.io.`). *No olvides el punto final si el proveedor lo requiere.*

#### Paso B: Configurar el dominio en GitHub
1. En tu repositorio en GitHub, ve a **Settings** -> **Pages**.
2. En el campo **Custom domain**, escribe tu dominio (ej. `www.celiaserpi.com` o `celiaserpi.com`) y haz clic en **Save**.
3. Activa la casilla **Enforce HTTPS** para garantizar que tu sitio web sea seguro (esto puede tardar unos minutos en estar disponible mientras GitHub solicita el certificado SSL gratuito).
