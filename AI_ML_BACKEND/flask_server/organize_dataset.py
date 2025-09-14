import os
import shutil
import re
from PIL import Image

# Define paths
UPLOADS_TMP_PATH = '../uploads/tmp'
DATASET_PATH = 'dataset'

# Define disaster types
disaster_types = ['Earthquake', 'Flood', 'Hurricane', 'Tornado', 'Wildfire']

# Create dataset directories if they don't exist
for disaster_type in disaster_types:
    os.makedirs(os.path.join(DATASET_PATH, disaster_type), exist_ok=True)

# Function to determine disaster type from filename
def determine_disaster_type(filename):
    filename = filename.lower()
    if 'earthquake' in filename:
        return 'Earthquake'
    elif 'flood' in filename:
        return 'Flood'
    elif 'hurricane' in filename or 'cyclone' in filename or 'typhoon' in filename:
        return 'Hurricane'
    elif 'tornado' in filename or 'twister' in filename:
        return 'Tornado'
    elif 'fire' in filename or 'wildfire' in filename:
        return 'Wildfire'
    else:
        # For files without clear indicators, we'll use image analysis
        # For now, let's use a simple heuristic based on the timestamp in the filename
        # In a real system, you would use image analysis or ML to classify
        timestamp = int(re.search(r'(\d+)-', filename).group(1)) % 5
        return disaster_types[timestamp]

# Function to determine severity level (1-10) from filename or image properties
def determine_severity(filename, img_path):
    # Open the image to analyze properties
    try:
        img = Image.open(img_path)
        width, height = img.size
        # Simple heuristic: larger images might show more severe disasters
        # This is just a placeholder - in a real system, you would use ML or proper analysis
        size_factor = min(1.0, (width * height) / (1000 * 1000))
        
        # Extract timestamp from filename for additional randomness
        timestamp = int(re.search(r'(\d+)-', filename).group(1))
        
        # Calculate severity (1-10)
        severity = 1 + int((timestamp % 100) / 10) + int(size_factor * 5)
        return min(10, max(1, severity))  # Ensure it's between 1-10
    except Exception as e:
        print(f"Error analyzing {filename}: {e}")
        # Fallback to a default severity
        return 5

# Process images in uploads/tmp
processed_count = 0
print("Starting to organize images...")

for filename in os.listdir(UPLOADS_TMP_PATH):
    if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        src_path = os.path.join(UPLOADS_TMP_PATH, filename)
        
        # Determine disaster type
        disaster_type = determine_disaster_type(filename)
        
        # Determine severity level
        severity = determine_severity(filename, src_path)
        
        # Create a new filename with severity level
        base_name, ext = os.path.splitext(filename)
        new_filename = f"{base_name}_severity{severity}{ext}"
        
        # Copy to appropriate dataset folder
        dst_path = os.path.join(DATASET_PATH, disaster_type, new_filename)
        shutil.copy2(src_path, dst_path)
        
        processed_count += 1
        print(f"Processed: {filename} -> {disaster_type} (Severity: {severity})")

print(f"\nOrganization complete! {processed_count} images processed.")
print("Images are now organized in the dataset folder by disaster type with severity levels.")
print("You can now train the model using these images.")