// Tableau pour stocker les articles sélectionnés
let selectedArticles = [];

// Fonction pour gérer la sélection et la désélection d'articles
function toggleArticle(article, checkbox) {
    const selectedCountElement = document.getElementById('selected-count');

    if (checkbox.checked) {
        selectedArticles.push(article); // Ajouter l'article (objet entier)
    } else {
        const index = selectedArticles.findIndex(item => item.name === article.name);
        if (index > -1) {
            selectedArticles.splice(index, 1); // Retirer l'article
        }
    }

    selectedCountElement.textContent = selectedArticles.length;
    console.log("Articles sélectionnés :", selectedArticles);
}


   // Fonction pour envoyer l'email de la commande
document.getElementById('send-email-button').addEventListener('click', function () {
    console.log("Articles sélectionnés pour l'envoi :", selectedArticles); // Debug

    if (selectedArticles.length === 0) {
        alert("Vous n'avez sélectionné aucun article !");
        return;
    }

    // Génération de la commande
    let orderDetails = selectedArticles.map(article => {
        if (article.name && article.price) {
            return `- ${article.name} : ${article.price.toFixed(2)} €`;
        } else {
            console.error("Article mal formé :", article);
            return "- Article invalide";
        }
    }).join("\n");

    let totalPrice = selectedArticles.reduce((total, article) => total + (article.price || 0), 0);

    const orderMessage = `
Bonjour,

Un grand merci pour ta commande et pour ton soutien à l’association.

Voici le récapitulatif de ta commande :
${orderDetails}

Pour un total de : ${totalPrice.toFixed(2)} € (le prix parfait pour une bonne action).

Pour régler cette belle commande, tu peux :

1. M'envoyer un chèque à l’ordre de l’Association Aidons Agathe (promis, il sera encaissé avec un grand sourire).
2. Ou me payer en liquide (mais attention, je n'accepte pas les chocolats en guise de monnaie, sauf exception...).

Encore merci et à bientôt,
Gaëlle
07 87 48 22 09
    `;

    // Envoi de l'email
    window.location.href = `mailto:gaelle.dallongeville@gmail.com?subject=Demande de réservation&body=${encodeURIComponent(orderMessage)}`;
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

// Fonction pour ouvrir un zoom avec animation (image uniquement)
function openModal(image) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');

    // Charger l'image dans la modale
    modalImage.src = image.src;
    modalImage.style.transform = "scale(0)"; // Départ pour l'animation

    modal.style.display = "flex";

    // Animation de zoom
    setTimeout(() => {
        modalImage.style.transform = "scale(1)";
        modalImage.style.transition = "transform 0.3s ease";
    }, 10);

    // Fermer la modale en cliquant sur le fond sombre
    modal.addEventListener('click', function closeModalOnOutsideClick(event) {
        if (event.target === modal) {
            closeModal();
            modal.removeEventListener('click', closeModalOnOutsideClick); // Retirer l'écouteur après fermeture
        }
    });
}

// Fonction pour fermer la modale
function closeModal() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');

    // Animation de fermeture
    modalImage.style.transform = "scale(0)";
    modalImage.style.transition = "transform 0.3s ease";

    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
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
                                        `<img src="${image}" alt="Zoom" onclick="openModal(this)">`
                                )
                                .join('')}
                        </div>
                        <button class="next" onclick="nextImage(this)">&#10095;</button>
                    </div>
                    <h2>${product.name}</h2>
                    <p class="price">€${product.price.toFixed(2)}</p>
                    <p>${isOutOfStock ? '<span style="color: red;">Rupture de stock</span>' : `Stock : ${product.stock}`}</p>
                    <label>
                    <input type="checkbox" ${isOutOfStock ? 'disabled' : ''} 
                   onchange="toggleArticle({ name: '${product.name}', price: ${product.price} }, this)"> 
            Sélectionner
            </label>
                `;

                // Ajouter l'article au conteneur
                productGrid.appendChild(productElement);
            });
        })
        .catch(error => console.error('Erreur lors du chargement des produits :', error));
});
