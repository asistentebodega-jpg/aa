param(
    [string]$DownloadsPath = '',
    [int]$Port = 9237,
    [string]$AccessToken = 'novapet-downloads-helper-v1'
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($AccessToken)) {
    $AccessToken = 'novapet-downloads-helper-v1'
}

function Get-CandidateLatestExcel {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        return $null
    }

    Get-ChildItem -LiteralPath $Path -File -Filter '*.xlsx' -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Name -like 'GridViewSolicitudDespacho - *.xlsx' -and
            -not $_.Name.StartsWith('~$') -and
            $_.Length -gt 0
        } |
        Sort-Object LastWriteTimeUtc, Length |
        Select-Object -Last 1
}

function Resolve-DownloadsPath {
    param([string]$PreferredPath)

    $profilePath = $env:USERPROFILE
    $downloadsPath = Join-Path $profilePath 'Downloads'

    $candidatePaths = @()
    if (-not [string]::IsNullOrWhiteSpace($PreferredPath)) {
        $candidatePaths += $PreferredPath
    }

    $candidatePaths += @(
        (Join-Path $downloadsPath 'DESCARGA'),
        (Join-Path $profilePath 'DESCARGA'),
        (Join-Path $profilePath 'Descargas'),
        $downloadsPath,
        (Join-Path (Join-Path $profilePath 'Documents') 'DESCARGA'),
        (Join-Path (Join-Path $profilePath 'Desktop') 'DESCARGA')
    )

    $existingPaths = @()
    foreach ($path in $candidatePaths) {
        if ([string]::IsNullOrWhiteSpace($path)) { continue }
        $fullPath = [System.IO.Path]::GetFullPath($path)
        if ($existingPaths -contains $fullPath) { continue }
        if (Test-Path -LiteralPath $fullPath -PathType Container) {
            $existingPaths += $fullPath
        }
    }

    $bestMatch = $null
    foreach ($path in $existingPaths) {
        $latest = Get-CandidateLatestExcel -Path $path
        if (-not $latest) { continue }

        if (-not $bestMatch -or $latest.LastWriteTimeUtc -gt $bestMatch.Latest.LastWriteTimeUtc) {
            $bestMatch = [pscustomobject]@{
                Path = $path
                Latest = $latest
            }
        }
    }

    if ($bestMatch) {
        return $bestMatch.Path
    }

    if ($existingPaths.Count -gt 0) {
        return $existingPaths[0]
    }

    return $downloadsPath
}

$DownloadsPath = Resolve-DownloadsPath -PreferredPath $DownloadsPath

function Get-UnixMilliseconds {
    param([datetime]$Date)
    return ([DateTimeOffset]::new($Date.ToUniversalTime())).ToUnixTimeMilliseconds()
}

function Get-LatestExcelFile {
    if (-not (Test-Path -LiteralPath $DownloadsPath)) {
        return $null
    }

    Get-ChildItem -LiteralPath $DownloadsPath -File -Filter '*.xlsx' |
        Where-Object {
            $_.Name -like 'GridViewSolicitudDespacho - *.xlsx' -and
            -not $_.Name.StartsWith('~$') -and
            $_.Length -gt 0
        } |
        Sort-Object LastWriteTimeUtc, Length |
        Select-Object -Last 1
}

function Get-FileKey {
    param([System.IO.FileInfo]$File)
    $modified = Get-UnixMilliseconds -Date $File.LastWriteTimeUtc
    return "$($File.Name)|$($File.Length)|$modified"
}

function ConvertTo-QueryMap {
    param([string]$Query)
    $map = @{}
    if ([string]::IsNullOrWhiteSpace($Query)) {
        return $map
    }

    $clean = $Query.TrimStart('?')
    foreach ($pair in $clean.Split('&')) {
        if ([string]::IsNullOrWhiteSpace($pair)) { continue }
        $parts = $pair.Split('=', 2)
        $key = [uri]::UnescapeDataString($parts[0])
        $value = ''
        if ($parts.Length -gt 1) {
            $value = [uri]::UnescapeDataString($parts[1])
        }
        $map[$key] = $value
    }
    return $map
}

function ConvertTo-HeaderMap {
    param([string]$RequestText)

    $headers = @{}
    foreach ($line in ($RequestText -split "`r`n" | Select-Object -Skip 1)) {
        if ([string]::IsNullOrWhiteSpace($line)) { break }
        $separatorIndex = $line.IndexOf(':')
        if ($separatorIndex -lt 1) { continue }
        $key = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1).Trim()
        $headers[$key] = $value
    }
    return $headers
}

function Get-CorsOrigin {
    param(
        [hashtable]$Headers,
        [int]$Port
    )

    if (-not $Headers.ContainsKey('Origin')) {
        return $null
    }

    $origin = [string]$Headers['Origin']
    if ($origin -eq 'null') {
        return 'null'
    }

    if ($origin -match '^https?://(localhost|127\.0\.0\.1)(:\d+)?$') {
        return $origin
    }

    return $null
}

function Test-HelperToken {
    param(
        [hashtable]$Headers,
        [string]$ExpectedToken
    )

    if ([string]::IsNullOrWhiteSpace($ExpectedToken)) {
        return $true
    }

    if (-not $Headers.ContainsKey('X-NovaPet-Helper-Token')) {
        return $false
    }

    return [string]$Headers['X-NovaPet-Helper-Token'] -eq $ExpectedToken
}

function Write-HttpResponse {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$Reason,
        [byte[]]$Body = [byte[]]::new(0),
        [string]$ContentType = 'text/plain; charset=utf-8',
        [hashtable]$Headers = @{},
        [string]$CorsOrigin = $null
    )

    $defaultHeaders = [ordered]@{
        'Access-Control-Allow-Methods' = 'GET, OPTIONS'
        'Access-Control-Allow-Headers' = 'Content-Type, X-NovaPet-Helper-Token'
        'Access-Control-Expose-Headers' = 'X-NovaPet-File-Name, X-NovaPet-File-Key, X-NovaPet-File-Modified, X-NovaPet-File-Size'
        'Cache-Control' = 'no-store'
        'Content-Type' = $ContentType
        'Content-Length' = $Body.Length
        'Connection' = 'close'
    }

    if (-not [string]::IsNullOrWhiteSpace($CorsOrigin)) {
        $defaultHeaders['Access-Control-Allow-Origin'] = $CorsOrigin
        $defaultHeaders['Vary'] = 'Origin'
    }

    foreach ($key in $Headers.Keys) {
        $defaultHeaders[$key] = $Headers[$key]
    }

    $headerText = "HTTP/1.1 $StatusCode $Reason`r`n"
    foreach ($entry in $defaultHeaders.GetEnumerator()) {
        $headerText += "$($entry.Key): $($entry.Value)`r`n"
    }
    $headerText += "`r`n"

    $headerBytes = [Text.Encoding]::UTF8.GetBytes($headerText)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
}

function Read-HttpRequest {
    param([System.Net.Sockets.NetworkStream]$Stream)

    $buffer = [byte[]]::new(8192)
    $memory = [System.IO.MemoryStream]::new()
    do {
        $read = $Stream.Read($buffer, 0, $buffer.Length)
        if ($read -le 0) { break }
        $memory.Write($buffer, 0, $read)
        $text = [Text.Encoding]::ASCII.GetString($memory.ToArray())
    } while ($text -notmatch "`r`n`r`n" -and $memory.Length -lt 65536)

    return [Text.Encoding]::ASCII.GetString($memory.ToArray())
}

function Write-Json {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [hashtable]$Payload,
        [int]$StatusCode = 200,
        [string]$Reason = 'OK',
        [string]$CorsOrigin = $null
    )

    $json = $Payload | ConvertTo-Json -Compress
    $body = [Text.Encoding]::UTF8.GetBytes($json)
    Write-HttpResponse -Stream $Stream -StatusCode $StatusCode -Reason $Reason -Body $body -ContentType 'application/json; charset=utf-8' -CorsOrigin $CorsOrigin
}

$address = [System.Net.IPAddress]::Parse('127.0.0.1')
$listener = [System.Net.Sockets.TcpListener]::new($address, $Port)
$listener.Start()

Write-Host ''
Write-Host 'NovaPet - Vigilancia de Descargas'
Write-Host "Carpeta: $DownloadsPath"
Write-Host "Servicio: http://127.0.0.1:$Port"
Write-Host 'Deja esta ventana abierta mientras uses la app.'
Write-Host ''

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $requestText = Read-HttpRequest -Stream $stream
            $requestHeaders = ConvertTo-HeaderMap -RequestText $requestText
            $corsOrigin = Get-CorsOrigin -Headers $requestHeaders -Port $Port
            $requestLine = ($requestText -split "`r`n")[0]
            $parts = $requestLine -split ' '
            if ($parts.Length -lt 2) {
                Write-HttpResponse -Stream $stream -StatusCode 400 -Reason 'Bad Request' -CorsOrigin $corsOrigin
                continue
            }

            $method = $parts[0].ToUpperInvariant()
            $target = $parts[1]

            if ($requestHeaders.ContainsKey('Origin') -and [string]::IsNullOrWhiteSpace($corsOrigin)) {
                Write-HttpResponse -Stream $stream -StatusCode 403 -Reason 'Forbidden'
                continue
            }

            if ($method -eq 'OPTIONS') {
                Write-HttpResponse -Stream $stream -StatusCode 204 -Reason 'No Content' -CorsOrigin $corsOrigin
                continue
            }

            if ($method -ne 'GET') {
                Write-HttpResponse -Stream $stream -StatusCode 405 -Reason 'Method Not Allowed' -CorsOrigin $corsOrigin
                continue
            }

            if (-not (Test-HelperToken -Headers $requestHeaders -ExpectedToken $AccessToken)) {
                Write-HttpResponse -Stream $stream -StatusCode 401 -Reason 'Unauthorized' -CorsOrigin $corsOrigin
                continue
            }

            $uri = [uri]::new("http://127.0.0.1:$Port$target")
            $path = $uri.AbsolutePath
            $query = ConvertTo-QueryMap -Query $uri.Query
            $latest = Get-LatestExcelFile

            if ($path -eq '/status' -or $path -eq '/') {
                $payload = @{
                    ok = $true
                    downloadsPath = $DownloadsPath
                    latestName = if ($latest) { $latest.Name } else { '' }
                    latestKey = if ($latest) { Get-FileKey -File $latest } else { '' }
                    time = (Get-Date).ToString('s')
                }
                Write-Json -Stream $stream -Payload $payload -CorsOrigin $corsOrigin
                continue
            }

            if ($path -eq '/latest-excel') {
                if (-not $latest) {
                    Write-HttpResponse -Stream $stream -StatusCode 204 -Reason 'No Content' -CorsOrigin $corsOrigin
                    continue
                }

                $key = Get-FileKey -File $latest
                if ($query.ContainsKey('since') -and $query['since'] -eq $key) {
                    Write-HttpResponse -Stream $stream -StatusCode 204 -Reason 'No Content' -CorsOrigin $corsOrigin
                    continue
                }

                $body = [System.IO.File]::ReadAllBytes($latest.FullName)
                $modified = Get-UnixMilliseconds -Date $latest.LastWriteTimeUtc
                $headers = @{
                    'X-NovaPet-File-Name' = [uri]::EscapeDataString($latest.Name)
                    'X-NovaPet-File-Key' = [uri]::EscapeDataString($key)
                    'X-NovaPet-File-Modified' = $modified
                    'X-NovaPet-File-Size' = $latest.Length
                }
                Write-HttpResponse -Stream $stream -StatusCode 200 -Reason 'OK' -Body $body -ContentType 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' -Headers $headers -CorsOrigin $corsOrigin
                continue
            }

            Write-HttpResponse -Stream $stream -StatusCode 404 -Reason 'Not Found' -CorsOrigin $corsOrigin
        } catch {
            try {
                $message = [Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
                Write-HttpResponse -Stream $stream -StatusCode 500 -Reason 'Internal Server Error' -Body $message -CorsOrigin $corsOrigin
            } catch {}
        } finally {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
