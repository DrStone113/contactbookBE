# PowerShell script to test rate limiting with curl
# Sends 25 requests to the API root endpoint, which has a limit of 20 requests per minute

for ($i=1; $i -le 25; $i++) {
  Write-Host "Request #$i"
  curl http://localhost:3000/ -UseBasicParsing
  Write-Host "`n"
  Start-Sleep -Seconds 1
}
