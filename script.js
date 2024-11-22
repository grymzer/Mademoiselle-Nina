// Tableau pour stocker les articles sélectionnés
let selectedArticles = [];

// Fonction pour gérer la sélection et la désélection d'articles
function toggleArticle(articleName, checkbox) {
    const selectedCountElement = document.getElementById('selected-count');

    if (checkbox.checked) {
        // Ajouter l'article à la liste si la case est cochée
        selectedArticles.push(articleName);
    } else {
        // Retirer l'article de la liste si la case est décochée
        const index = selectedArticles.indexOf(articleName);
        if (index > -1) {
            selectedArticles.splice(index, 1);
        }
    }

    // Mettre à jour le compteur d'articles sélectionnés
    selectedCountElement.textContent = selectedArticles.length;

    // Debug : Afficher la liste dans la console
    console.log("Articles sélectionnés :", selectedArticles);
}

// Fonction pour envoyer l'email de la commande
document.getElementById('send-email-button').addEventListener('click', function () {
    if (selectedArticles.length === 0) {
        alert("Vous n'avez sélectionné aucun article !");
        return;
    }

    // Créer le corps du message avec tous les articles sélectionnés
    const orderMessage = `Commande de Mademoiselle Nina :\n\nArticles sélectionnés :\n${selectedArticles.join("\n")}\n\nMerci de bien vouloir traiter cette commande.`;

    // Simuler l'envoi par e-mail
    window.location.href = `mailto:gaelle.dallongevile@gmail.com?subject=Demande de réservation&body=${encodeURIComponent(orderMessage)}`;
});

// Fonction pour passer à l'image suivante dans le carrousel
function nextImage(button) {
    const carousel = button.parentElement; // Le conteneur du carrousel
    const imagesContainer = carousel.querySelector('.carousel-images');
    const images = imagesContainer.querySelectorAll('img');
    const currentTransform = getComputedStyle(imagesContainer).transform;

    // Calcul de la position actuelle
    let translateX = currentTransform !== 'none' ? parseFloat(currentTransform.split(',')[4]) : 0;

    // Largeur d'une image
    const imageWidth = images[0].clientWidth;

    // Nouvelle position
    translateX -= imageWidth;

    // Vérifie si on dépasse la dernière image
    if (Math.abs(translateX) >= imageWidth * images.length) {
        translateX = 0; // Revenir à la première image
    }

    imagesContainer.style.transform = `translateX(${translateX}px)`;
}

// Fonction pour passer à l'image précédente dans le carrousel
function prevImage(button) {
    const carousel = button.parentElement; // Le conteneur du carrousel
    const imagesContainer = carousel.querySelector('.carousel-images');
    const images = imagesContainer.querySelectorAll('img');
    const currentTransform = getComputedStyle(imagesContainer).transform;

    // Calcul de la position actuelle
    let translateX = currentTransform !== 'none' ? parseFloat(currentTransform.split(',')[4]) : 0;

    // Largeur d'une image
    const imageWidth = images[0].clientWidth;

    // Nouvelle position
    translateX += imageWidth;

    // Vérifie si on dépasse la première image
    if (translateX > 0) {
        translateX = -(imageWidth * (images.length - 1)); // Revenir à la dernière image
    }

    imagesContainer.style.transform = `translateX(${translateX}px)`;
}

// Fonction pour ouvrir la modale avec une image zoomée
function openModal(image) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const caption = document.getElementById('caption');

    modal.style.display = "flex";
    modalImage.src = image.src;
    caption.textContent = image.alt;
}

// Fonction pour fermer la modale
function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = "none";
}

// Fonction pour charger les articles depuis un fichier JSON
document.addEventListener('DOMContentLoaded', () => {
    const timestamp = new Date().getTime();
    fetch('https://raw.githubusercontent.com/grymzer/Mademoiselle-NIna-/refs/heads/main/stocks.json') // Charger les articles depuis le JSON
        .then(response => response.json())
        .then(data => {
            const productGrid = document.getElementById('product-grid');

            // Parcourir chaque article dans le JSON
            data.forEach(product => {
                const productElement = document.createElement('div');
                productElement.classList.add('product');

                // Vérifier si le stock est épuisé
                const isOutOfStock = product.stock === 0;

                // Ajouter le HTML pour un article
                productElement.innerHTML = `
                    <div class="carousel">
                        <button class="prev" onclick="prevImage(this)">&#10094;</button>
                        <div class="carousel-images">
                            ${product.images
                                .map(
                                    (image, index) =>
                                        `<img src="${image}" alt="${product.name} - Image ${index + 1}" onclick="openModal(this)">`
                                )
                                .join('')}
                        </div>
                        <button class="next" onclick="nextImage(this)">&#10095;</button>
                    </div>
                    <h2>${product.name}</h2>
                    <p class="price">€${product.price.toFixed(2)}</p>
                    <p>${isOutOfStock ? '<span style="color: red;">Rupture de stock</span>' : `Stock : ${product.stock}`}</p>
                    <label>
                        <input type="checkbox" ${isOutOfStock ? 'disabled' : ''} onchange="toggleArticle('${product.name}', this)"> Sélectionner
                    </label>
                `;

                // Ajouter l'article au conteneur
                productGrid.appendChild(productElement);
            });
        })
        .catch(error => console.error('Erreur lors du chargement des produits :', error));
});