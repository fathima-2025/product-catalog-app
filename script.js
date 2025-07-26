const productList = document.getElementById("product-list");
const addProductForm = document.getElementById("add-product-form");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");
const submitButton = addProductForm.querySelector('button[type="submit"]');

let currentProductId = null; // To store the ID of the product being edited


function fetchProducts() {
    fetch("http://localhost:5000/products")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); 
        })
        .then(products => {
            productList.innerHTML = ''; 
            
           
            if (products.length === 0) {
                const noProductsItem = document.createElement("li");
                noProductsItem.textContent = "No products available. Add one!";
                noProductsItem.classList.add("text-center", "text-gray-500"); 
                productList.appendChild(noProductsItem);
            } else {
                products.forEach(product => {
                    const productListItem = document.createElement("li");
                    
                    
                    productListItem.innerHTML = `
                        <div class="product-details-wrapper">
                            <div class="product-info">
                                <span>${product.name}</span>
                                <p>${product.description || 'No description'}</p>
                            </div>
                            <div class="product-price">
                                $${parseFloat(product.price).toFixed(2)}
                            </div>
                        </div>
                        <div class="product-actions">
                            <button class="edit-button" data-product-id="${product.id}">Edit</button>
                            <button class="delete-button" data-product-id="${product.id}">Delete</button>
                        </div>
                    `;
                    productList.appendChild(productListItem);
                });
                
                attachDeleteListeners();
                attachEditListeners(); 
            }
        })
        .catch(error => {
            console.error("Error fetching products:", error);
            productList.innerHTML = '<li class="text-red-500 text-center">Error loading products. Please ensure the Flask server is running.</li>';
        });
}

function attachDeleteListeners() {
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId; 
            if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) { 
                deleteProduct(productId);
            }
        });
    });
}


function attachEditListeners() {
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            fetch(`http://localhost:5000/products/${productId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(product => {
                 
                    nameInput.value = product.name;
                    priceInput.value = product.price;
                    descriptionInput.value = product.description;
                    currentProductId = product.id; 

                    
                    submitButton.textContent = 'Update Product';
                    submitButton.classList.remove('bg-green-500', 'hover:bg-green-600');
                    submitButton.classList.add('bg-blue-500', 'hover:bg-blue-600');

           
                    addProductForm.scrollIntoView({ behavior: 'smooth' });
                })
                .catch(error => {
                    console.error("Error fetching product for edit:", error);
                    alert(`Failed to load product for editing: ${error.message || 'Unknown error'}`);
                });
        });
    });
}

// --- Function to send a DELETE request to the Flask API ---
function deleteProduct(productId) {
    fetch(`http://localhost:5000/products/${productId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || `HTTP error! status: ${response.status}`); });
        }
        if (response.status === 204) {
            return null; 
        }
        return response.json(); 
    })
    .then(() => {
        console.log(`Product ${productId} deleted successfully.`);
        alert('Product deleted successfully!');
        fetchProducts(); // Re-fetch the product list to update the UI
        resetForm(); // Reset form in case it was in edit mode
    })
    .catch(error => {
        console.error("Error deleting product:", error);
        alert(`Failed to delete product: ${error.message || 'Unknown error'}`);
    });
}

// --- Function to reset the form to "Add Product" mode ---
function resetForm() {
    addProductForm.reset();
    currentProductId = null;
    submitButton.textContent = 'Add Product';
    submitButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    submitButton.classList.add('bg-green-500', 'hover:bg-green-600');
}

// --- Event listener for adding/updating a product ---
addProductForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const description = descriptionInput.value.trim();

    if (!name || isNaN(price) || price <= 0) {
        alert("Please enter a valid product name and a positive price.");
        return;
    }

    const productData = {
        name: name,
        price: price,
        description: description
    };

    let url = "http://localhost:5000/products";
    let method = "POST";

    if (currentProductId) { // If currentProductId is set, we are in edit mode
        url = `http://localhost:5000/products/${currentProductId}`;
        method = "PUT";
    }

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || `HTTP error! status: ${response.status}`); });
        }
        return response.json();
    })
    .then(product => {
        console.log(`Product ${currentProductId ? 'updated' : 'added'} successfully:`, product);
        alert(`Product "${product.name}" ${currentProductId ? 'updated' : 'added'} successfully!`);
        resetForm(); // Reset form after successful operation
        fetchProducts(); // Re-fetch the product list to display the changes
    })
    .catch(error => {
        console.error(`Error ${currentProductId ? 'updating' : 'adding'} product:`, error);
        alert(`Failed to ${currentProductId ? 'update' : 'add'} product: ${error.message || 'Unknown error'}`);
    });
});

// Initial call to fetch products when the web page loads for the first time
fetchProducts();
