param([int]$Port = 8080)

$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }

$mime = @{
    ".html"        = "text/html; charset=utf-8"
    ".js"          = "application/javascript; charset=utf-8"
    ".css"         = "text/css; charset=utf-8"
    ".json"        = "application/json; charset=utf-8"
    ".webmanifest" = "application/manifest+json"
    ".png"         = "image/png"
    ".ico"         = "image/x-icon"
    ".svg"         = "image/svg+xml"
    ".jpg"         = "image/jpeg"
    ".jpeg"        = "image/jpeg"
    ".woff2"       = "font/woff2"
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)

try {
    $listener.Start()
} catch {
    exit 1
}

$PID | Out-File -FilePath (Join-Path $root "server.pid") -Encoding ascii

$ascii = [System.Text.Encoding]::ASCII

while ($true) {
    $client = $null
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $stream.ReadTimeout = 4000

        $buffer = New-Object byte[] 8192
        $read = $stream.Read($buffer, 0, $buffer.Length)
        if ($read -le 0) { continue }

        $headerText = $ascii.GetString($buffer, 0, $read)
        $firstLine = ($headerText -split "`r`n")[0]
        $parts = $firstLine -split " "
        $url = "/"
        if ($parts.Length -ge 2) { $url = $parts[1] }

        $path = $url
        $queryIndex = $path.IndexOf("?")
        if ($queryIndex -ge 0) { $path = $path.Substring(0, $queryIndex) }
        $path = [System.Uri]::UnescapeDataString($path)
        if ([string]::IsNullOrEmpty($path) -or $path -eq "/") { $path = "/index.html" }

        $relative = ($path.TrimStart("/") -replace "/", "\")
        $file = Join-Path $root $relative

        if (Test-Path -LiteralPath $file -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($file)
            $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
            if ($mime.ContainsKey($ext)) { $type = $mime[$ext] } else { $type = "application/octet-stream" }

            $header = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
            $headerBytes = $ascii.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = $ascii.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($body, 0, $body.Length)
        }

        $stream.Flush()
    } catch {
    } finally {
        if ($client) { $client.Close() }
    }
}
