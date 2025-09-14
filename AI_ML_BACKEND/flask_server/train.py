import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def create_sample_data():
    """Create sample disaster data for training"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate random features (5 features per sample)
    features = np.random.rand(n_samples, 5)
    
    # Create disaster types: 0=Earthquake, 1=Flood, 2=Hurricane, 3=Tornado, 4=Wildfire
    disaster_types = np.random.randint(0, 5, n_samples)
    
    return features, disaster_types

def train_model():
    """Train a simple disaster classification model"""
    print("Creating sample disaster data...")
    X, y = create_sample_data()
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    print(f"Training accuracy: {train_score:.3f}")
    print(f"Test accuracy: {test_score:.3f}")
    
    # Save model and scaler
    os.makedirs("dataset", exist_ok=True)
    joblib.dump(model, "dataset/model.pkl")
    joblib.dump(scaler, "dataset/scaler.pkl")
    print("Model and scaler saved to dataset/")
    
    return model, scaler

if __name__ == "__main__":
    train_model()