import os
import torch
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from torchvision import transforms
from app import DisasterCNN, disaster_types, transform

# Define paths
UPLOADS_TMP_PATH = '../uploads/tmp'
MODEL_PATH = 'best_model.pth'

# Check if model exists
model_exists = os.path.exists(MODEL_PATH)
print(f"Model file exists: {model_exists}")

# Initialize model
model = DisasterCNN(num_classes=len(disaster_types))

# Load model weights if available
if model_exists:
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
        print("Model loaded successfully!")
        model.eval()
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Using untrained model for testing...")
else:
    print("No trained model found. Using untrained model for testing...")
    model.eval()

# Function to make predictions
def predict_image(image_path):
    try:
        # Load and preprocess image
        img = Image.open(image_path).convert('RGB')
        img_tensor = transform(img).unsqueeze(0)  # Add batch dimension
        
        # Make prediction
        with torch.no_grad():
            class_outputs, severity_output = model(img_tensor)
            
            # Get class probabilities
            probs = torch.nn.functional.softmax(class_outputs, dim=1)[0]
            confidence, predicted_class = torch.max(probs, 0)
            
            disaster_type = disaster_types[predicted_class.item()]
            severity_score = severity_output.item()  # Value between 0-1
            severity_level = max(1, min(10, round(severity_score * 9) + 1))  # Convert to 1-10 scale
            
            # Get top 3 predictions
            top_probs, top_classes = torch.topk(probs, 3)
            top_predictions = [(disaster_types[idx.item()], prob.item() * 100) for idx, prob in zip(top_classes, top_probs)]
            
            return {
                'disaster_type': disaster_type,
                'severity': severity_level,
                'confidence': confidence.item() * 100,  # Convert to percentage
                'top_predictions': top_predictions
            }
    except Exception as e:
        return {'error': str(e)}

# Test with sample images
def test_with_samples(num_samples=5):
    if not os.path.exists(UPLOADS_TMP_PATH):
        print(f"Error: Upload directory {UPLOADS_TMP_PATH} not found.")
        return
    
    # Get list of image files
    image_files = [f for f in os.listdir(UPLOADS_TMP_PATH) 
                  if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    
    if not image_files:
        print("No image files found in the uploads directory.")
        return
    
    # Select a subset of images for testing
    if len(image_files) > num_samples:
        # Try to get diverse samples by selecting files with different names
        selected_files = []
        earthquake_files = [f for f in image_files if 'earthquake' in f.lower()]
        flood_files = [f for f in image_files if 'flood' in f.lower()]
        other_files = [f for f in image_files if 'earthquake' not in f.lower() and 'flood' not in f.lower()]
        
        # Add at least one of each type if available
        if earthquake_files:
            selected_files.append(earthquake_files[0])
        if flood_files:
            selected_files.append(flood_files[0])
        
        # Fill the rest with other files
        remaining_slots = num_samples - len(selected_files)
        if remaining_slots > 0:
            selected_files.extend(other_files[:remaining_slots])
        
        # If we still need more, add random files
        if len(selected_files) < num_samples:
            remaining_files = [f for f in image_files if f not in selected_files]
            selected_files.extend(np.random.choice(remaining_files, 
                                                 min(num_samples - len(selected_files), len(remaining_files)), 
                                                 replace=False))
    else:
        selected_files = image_files
    
    # Create a figure for displaying results
    fig, axes = plt.subplots(len(selected_files), 2, figsize=(12, 4 * len(selected_files)))
    if len(selected_files) == 1:
        axes = [axes]  # Make it iterable for a single image
    
    # Process each selected image
    for i, filename in enumerate(selected_files):
        image_path = os.path.join(UPLOADS_TMP_PATH, filename)
        result = predict_image(image_path)
        
        # Display image
        img = Image.open(image_path).convert('RGB')
        axes[i][0].imshow(img)
        axes[i][0].set_title(f"File: {filename}")
        axes[i][0].axis('off')
        
        # Display prediction results
        if 'error' in result:
            axes[i][1].text(0.5, 0.5, f"Error: {result['error']}", 
                           ha='center', va='center', fontsize=12)
        else:
            result_text = f"Prediction: {result['disaster_type']}\n"
            result_text += f"Severity: {result['severity']}/10\n"
            result_text += f"Confidence: {result['confidence']:.1f}%\n\n"
            result_text += "Top 3 Predictions:\n"
            for disaster, prob in result['top_predictions']:
                result_text += f"  {disaster}: {prob:.1f}%\n"
            
            axes[i][1].text(0.1, 0.5, result_text, 
                           ha='left', va='center', fontsize=12)
        
        axes[i][1].axis('off')
    
    plt.tight_layout()
    plt.savefig('test_results.png')
    print(f"Test results saved to 'test_results.png'")
    
    # Also print results to console
    print("\nPrediction Results:")
    print("-" * 50)
    for filename in selected_files:
        image_path = os.path.join(UPLOADS_TMP_PATH, filename)
        result = predict_image(image_path)
        print(f"File: {filename}")
        if 'error' in result:
            print(f"  Error: {result['error']}")
        else:
            print(f"  Prediction: {result['disaster_type']}")
            print(f"  Severity: {result['severity']}/10")
            print(f"  Confidence: {result['confidence']:.1f}%")
            print("  Top 3 Predictions:")
            for disaster, prob in result['top_predictions']:
                print(f"    {disaster}: {prob:.1f}%")
        print("-" * 50)

if __name__ == "__main__":
    print("Testing model with sample images...")
    test_with_samples(5)
    print("\nDone!")