from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS 

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///products.db"
db = SQLAlchemy(app)
CORS(app)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=True)

   
    def __repr__(self):
        return f'<Product {self.name}>'


@app.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([{"id": p.id, "name": p.name, "price": p.price, "description": p.description} for p in products])

@app.route("/products", methods=["POST"])
def create_product():
    data = request.json
  
    if "name" not in data or "price" not in data:
        return jsonify({"error": "Name and Price are required fields"}), 400
    new_product = Product(name=data["name"], price=data["price"], description=data.get("description"))
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"id": new_product.id, "name": new_product.name, "price": new_product.price, "description": new_product.description}), 201

@app.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"id": product.id, "name": product.name, "price": product.price, "description": product.description})

@app.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404

    data = request.json
    product.name = data.get("name", product.name)
    product.price = data.get("price", product.price)
    product.description = data.get("description", product.description)
    
  
    db.session.commit()
    return jsonify({"id": product.id, "name": product.name, "price": product.price, "description": product.description})

@app.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404
    
    db.session.delete(product)
    db.session.commit()
    return jsonify({}), 204 

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

    
