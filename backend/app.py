import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import base64
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

# USDA API Key
USDA_API_KEY = os.getenv('USDA_API_KEY', 'YOUR_KEY_HERE')

# Load your trained model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

checkpoint_path = 'food_model.pth'
checkpoint = torch.load(checkpoint_path, map_location=device)

num_classes = checkpoint['num_classes']
model = models.resnet50(weights=None)
model.fc = nn.Linear(model.fc.in_features, num_classes)
model.load_state_dict(checkpoint['model_state_dict'])
model.to(device)
model.eval()

class_to_idx = checkpoint['class_to_idx']
idx_to_class = {v: k for k, v in class_to_idx.items()}

preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def get_default_nutrition(food_name):
    """Default nutrition values if USDA lookup fails"""
    defaults = {
        "fried rice": {"calories": 200, "protein": 8, "carbs": 25, "fats": 8},
        "nachos": {"calories": 350, "protein": 10, "carbs": 35, "fats": 15},
        "tacos": {"calories": 300, "protein": 15, "carbs": 30, "fats": 12},
        "huevos rancheros": {"calories": 400, "protein": 20, "carbs": 35, "fats": 15},
        "red velvet cake": {"calories": 450, "protein": 5, "carbs": 55, "fats": 20},
        "paella": {"calories": 280, "protein": 10, "carbs": 35, "fats": 10},
        "chinese soup": {"calories": 100, "protein": 5, "carbs": 12, "fats": 2},
    }
    return defaults.get(food_name.lower(), {"calories": 200, "protein": 10, "carbs": 25, "fats": 8})

def lookup_nutrition_usda(food_name):
    """Lookup nutrition from USDA FoodData Central"""
    try:
        print(f"🔍 Looking up {food_name} in USDA database...")
        
        response = requests.get(
            f'https://api.nal.usda.gov/fdc/v1/foods/search?query={food_name}&pageSize=1&api_key={USDA_API_KEY}',
            timeout=5
        )
        results = response.json()
        
        if not results.get('foods'):
            print(f"❌ Not found in USDA, using defaults")
            return get_default_nutrition(food_name)
        
        food = results['foods'][0]
        nutrition = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fats': 0
        }
        
        for nutrient in food.get('foodNutrients', []):
            nutrient_name = nutrient.get('nutrientName', '')
            value = nutrient.get('value', 0)
            
            if nutrient_name == 'Energy':
                # Convert kJ to kcal (1 kcal = 4.184 kJ)
                nutrition['calories'] = int(value / 4.184)
            elif nutrient_name == 'Protein':
                nutrition['protein'] = round(value, 1)
            elif nutrient_name == 'Carbohydrate, by difference':
                nutrition['carbs'] = round(value, 1)
            elif nutrient_name == 'Total lipid (fat)':
                nutrition['fats'] = round(value, 1)
        
        print(f"✅ Found nutrition data for {food_name}")
        return nutrition
    except Exception as e:
        print(f"⚠️ USDA lookup failed: {e}, using defaults")
        return get_default_nutrition(food_name)

@app.route('/api/analyze-food', methods=['POST'])
def analyze_food():
    """Analyze food image and return nutrition info"""
    try:
        data = request.json
        image_base64 = data.get('image')
        
        if not image_base64:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 to image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Preprocess image
        tensor = preprocess(image).unsqueeze(0).to(device)
        
        # Run inference
        with torch.no_grad():
            outputs = model(tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, pred_idx = torch.max(probabilities, 1)
        
        # Get food name
        pred_idx = pred_idx.item()
        food_name = idx_to_class.get(pred_idx, f"Unknown (Class {pred_idx})")
        confidence = confidence.item()
        
        # Clean up food name
        food_name = food_name.replace('food101_', '').replace('uec256_', '').replace('_', ' ').title()
        
        print(f"🔍 Detected: {food_name} (confidence: {confidence*100:.2f}%)")
        
        # 🆕 Lookup nutrition from USDA
        nutrition = lookup_nutrition_usda(food_name)
        
        # Return result
        result = {
            'food_name': food_name,
            'confidence': float(confidence),
            'confidence_percent': float(confidence * 100),
            'calories': nutrition['calories'],
            'protein_g': nutrition['protein'],
            'carbs_g': nutrition['carbs'],
            'fats_g': nutrition['fats'],
            'success': True,
            'source': 'USDA'
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_classes': num_classes,
        'device': str(device),
        'model_accuracy': 0.708
    })

if __name__ == '__main__':
    print("="*60)
    print("🍽️ Food Recognition API with USDA Nutrition")
    print("="*60)
    print(f"Model Classes: {num_classes}")
    print(f"Device: {device}")
    print(f"Model Accuracy: 70.8%")
    print("="*60)
    print("\n✅ Server starting on http://localhost:5000")
    print("📸 Send POST to /api/analyze-food with base64 image")
    print("="*60)
    
    app.run(debug=True, port=5000)