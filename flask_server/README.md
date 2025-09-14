# Enhanced Disaster Classification and Severity Prediction Model

This directory contains an improved PyTorch-based CNN model for disaster image classification and severity prediction on a scale of 1-10.

## Model Architecture

The model uses an enhanced multi-head CNN architecture:
- ResNet-like convolutional layers with batch normalization for better feature extraction
- Adaptive pooling for handling various image sizes
- Fully connected layers with batch normalization
- Multi-head output for both disaster type classification and severity prediction (1-10 scale)
- Dropout layers for regularization

## Disaster Types

The model can classify images into the following disaster types:
- Wildfire
- Flood
- Earthquake
- Hurricane
- Tornado

## Setup and Installation

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Create a dataset directory structure:
   ```
   mkdir -p dataset/{Wildfire,Flood,Earthquake,Hurricane,Tornado}
   ```

3. Add training images to the respective disaster type folders.
   - The system can also use images from the uploads/tmp directory
   - Severity levels (1-10) are determined from image properties:
     - Edge intensity (more edges often indicate more severe damage)
     - Color variance (higher variance can indicate more chaotic scenes)
     - Average intensity (darker images may indicate more severe conditions)
   - If no images are available, the training script will create dummy data for testing purposes.

## Training the Model

To train the model, run:
```
python train.py
```

This will:
- Load the dataset from both dataset folders and uploads/tmp directory
- Determine severity levels from image properties
- Train the enhanced CNN model with both classification and regression tasks
- Save the best model to `best_model.pth`
- Generate training curves and a confusion matrix

## Testing the Model

To test the model with sample images:
```
python test_model_with_samples.py
```

This will:
- Load the trained model
- Select sample images from the uploads/tmp directory
- Make predictions on these images
- Display results in a figure saved as `test_results.png`
- Print prediction results to the console

## Using the Model

The Flask app (`app.py`) will automatically use the trained model if `best_model.pth` exists. If not, it will fall back to a deterministic approach based on filename hashing.

## API Endpoint

The model is accessible via the `/predict` endpoint:

```
POST /predict
Content-Type: multipart/form-data

file: [image file]
```

Response format:
```json
{
  "disaster_type": "Wildfire",
  "confidence": 0.92,
  "disaster_level": 8,
  "severity_category": "High",
  "file_processed": "example.jpg",
  "status": "success"
}
```

Severity levels range from 1-10 and are categorized as:
- 1-3: Low
- 4-6: Medium
- 7-8: High
- 9-10: Extreme
```

## Fallback Mechanism

If the model fails to load or an error occurs during prediction, the system will automatically fall back to an improved deterministic approach that:

1. Determines disaster type by checking for keywords in the filename first
2. Falls back to filename hash if no keywords are found
3. Calculates severity (1-10) based on image properties:
   - Average intensity
   - Color variance
   - Edge detection
4. Falls back to file size-based severity if image analysis fails

This ensures consistent and meaningful results even when the trained model is unavailable.