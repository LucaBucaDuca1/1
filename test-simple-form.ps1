# Minimal form test - just open a window to prove the concept works

$ErrorActionPreference = "Stop"

Write-Host "Creating minimal test form..."

try {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "HomeFlix Uploader Test"
    $form.Size = New-Object System.Drawing.Size(400,300)
    $form.StartPosition = "CenterScreen"
    $form.BackColor = [System.Drawing.Color]::FromArgb(20,20,20)

    $label = New-Object System.Windows.Forms.Label
    $label.Text = "If you see this, the form works!"
    $label.ForeColor = [System.Drawing.Color]::White
    $label.AutoSize = $true
    $label.Location = New-Object System.Drawing.Point(80,120)
    $form.Controls.Add($label)

    $button = New-Object System.Windows.Forms.Button
    $button.Text = "Close"
    $button.Location = New-Object System.Drawing.Point(150,180)
    $button.Add_Click({ $form.Close() })
    $form.Controls.Add($button)

    Write-Host "Form created successfully. Opening..."
    Write-Host ""

    [void]$form.ShowDialog()

    Write-Host ""
    Write-Host "Form closed normally."

} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Stack trace:"
    Write-Host $_.Exception.StackTrace
}

Write-Host ""
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
