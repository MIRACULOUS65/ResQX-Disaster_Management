import requests
import json

resp = requests.post("http://localhost:5001/predict", json={"features": [0.1, 0.2, 0.3]})
print(resp.status_code, resp.json())