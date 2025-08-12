# Simple PowerShell HTTP Server for EDU project
# Run this script to start a local server

$port = 8000
$path = Get-Location

Write-Host "Starting HTTP server on port $port..." -ForegroundColor Green
Write-Host "Serving files from: $path" -ForegroundColor Yellow
Write-Host "Open your browser and go to: http://localhost:$port" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

try {
    # Create a simple HTTP listener
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    
    Write-Host "Server started successfully!" -ForegroundColor Green
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        $filePath = Join-Path $path $localPath.TrimStart('/')
        
        if ($localPath -eq "/") {
            $filePath = Join-Path $path "index.html"
        }
        
        try {
            if (Test-Path $filePath -PathType Leaf) {
                $content = Get-Content $filePath -Raw -Encoding UTF8
                $extension = [System.IO.Path]::GetExtension($filePath)
                
                # Set content type based on file extension
                switch ($extension) {
                    ".html" { $contentType = "text/html" }
                    ".css"  { $contentType = "text/css" }
                    ".js"   { $contentType = "application/javascript" }
                    ".json" { $contentType = "application/json" }
                    ".png"  { $contentType = "image/png" }
                    ".jpg"  { $contentType = "image/jpeg" }
                    ".jpeg" { $contentType = "image/jpeg" }
                    ".gif"  { $contentType = "image/gif" }
                    ".ico"  { $contentType = "image/x-icon" }
                    default { $contentType = "text/plain" }
                }
                
                $response.ContentType = $contentType
                $response.StatusCode = 200
                
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                
                Write-Host "Served: $localPath" -ForegroundColor Green
            } else {
                $response.StatusCode = 404
                $notFound = "<html><body><h1>404 - File Not Found</h1><p>Requested file: $localPath</p></body></html>"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFound)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                
                Write-Host "404: $localPath" -ForegroundColor Red
            }
        } catch {
            $response.StatusCode = 500
            $error = "<html><body><h1>500 - Internal Server Error</h1><p>Error: $($_.Exception.Message)</p></body></html>"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($error)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            
            Write-Host "Error serving $localPath : $($_.Exception.Message)" -ForegroundColor Red
        }
        
        $response.Close()
    }
} catch {
    Write-Host "Error starting server: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    if ($listener) {
        $listener.Stop()
        Write-Host "Server stopped." -ForegroundColor Yellow
    }
}
