# PowerShell script to test the disaster classification model

# Define the Flask server URL
$serverUrl = "http://localhost:5000/predict"

# Check if an image path was provided as an argument
if ($args.Count -lt 1) {
    Write-Host "Usage: .\test_model.ps1 <image_path>"
    Write-Host "Example: .\test_model.ps1 ..\uploads\tmp\example.jpg"
    exit 1
}

$imagePath = $args[0]

# Check if the image file exists
if (-not (Test-Path $imagePath)) {
    Write-Host "Error: Image file '$imagePath' not found."
    exit 1
}

Write-Host "Sending image '$imagePath' to prediction API..."

try {
    # Create a boundary for multipart/form-data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    # Read the file content
    $fileBytes = [System.IO.File]::ReadAllBytes($imagePath)
    $fileName = [System.IO.Path]::GetFileName($imagePath)
    
    # Create the multipart/form-data content
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=\"file\"; filename=\"$fileName\"",
        "Content-Type: image/jpeg",
        "",
        [System.Text.Encoding]::Default.GetString($fileBytes),
        "--$boundary--"
    )
    
    $body = $bodyLines -join $LF
    
    # Send the request
    $response = Invoke-RestMethod -Uri $serverUrl -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $body
    
    # Display the results
    Write-Host "`nPrediction Results:"
    Write-Host "Disaster Type: $($response.disaster_type)"
    Write-Host "Confidence: $($response.confidence)"
    Write-Host "Severity Level: $($response.disaster_level) ($($response.severity_category))"
    Write-Host "File Processed: $($response.file_processed)"
    Write-Host "Status: $($response.status)"
    
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Message -like "*Unable to connect*") {
        Write-Host "Make sure the Flask server is running on http://localhost:5000"
    }
}