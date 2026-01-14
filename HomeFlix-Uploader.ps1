# HomeFlix Smart Uploader for Windows
# drop movies or entire show folders and they'll auto-organize
# handles stuff like:
#   - single movie files: "Inception (2010).mp4"
#   - show folders: "Breaking Bad/Season 1/Episode 1.mp4"
# - zeloz

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# config
$SERVER_PATH = Join-Path $PSScriptRoot "server"
$UPLOADS_PATH = Join-Path $SERVER_PATH "media\uploads"
$MOVIES_PATH = Join-Path $SERVER_PATH "media\movies"
$SHOWS_PATH = Join-Path $SERVER_PATH "media\shows"

# main form
$form = New-Object System.Windows.Forms.Form
$form.Text = "HomeFlix Smart Uploader"
$form.Size = New-Object System.Drawing.Size(700,600)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(20,20,20)
$form.ForeColor = [System.Drawing.Color]::White

# title
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "HomeFlix Smart Uploader"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI",18,[System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(229,9,20)
$titleLabel.AutoSize = $true
$titleLabel.Location = New-Object System.Drawing.Point(20,15)
$form.Controls.Add($titleLabel)

# subtitle
$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Text = "by zeloz"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI",10)
$subtitleLabel.ForeColor = [System.Drawing.Color]::Gray
$subtitleLabel.AutoSize = $true
$subtitleLabel.Location = New-Object System.Drawing.Point(22,50)
$form.Controls.Add($subtitleLabel)

# instructions
$instructLabel = New-Object System.Windows.Forms.Label
$instructLabel.Text = @"
Drop files or folders here:
  - Movies: Drop video files directly
  - Shows: Drop show folder (with seasons inside)
"@
$instructLabel.Font = New-Object System.Drawing.Font("Segoe UI",10)
$instructLabel.AutoSize = $true
$instructLabel.Location = New-Object System.Drawing.Point(20,80)
$form.Controls.Add($instructLabel)

# drop zone
$dropZone = New-Object System.Windows.Forms.Panel
$dropZone.Location = New-Object System.Drawing.Point(20,140)
$dropZone.Size = New-Object System.Drawing.Size(640,220)
$dropZone.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$dropZone.BackColor = [System.Drawing.Color]::FromArgb(30,30,30)
$dropZone.AllowDrop = $true
$form.Controls.Add($dropZone)

# drop label
$dropLabel = New-Object System.Windows.Forms.Label
$dropLabel.Text = @"
>> Drop Files Here <<

Movies: Inception.mp4, The Matrix (1999).mkv
Shows: Breaking Bad/Season 1/E01.mp4

Supported: MP4, MKV, AVI, MOV, WEBM
"@
$dropLabel.Font = New-Object System.Drawing.Font("Segoe UI",11)
$dropLabel.AutoSize = $false
$dropLabel.Size = New-Object System.Drawing.Size(620,200)
$dropLabel.Location = New-Object System.Drawing.Point(10,10)
$dropLabel.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$dropLabel.ForeColor = [System.Drawing.Color]::Gray
$dropZone.Controls.Add($dropLabel)

# log output
$logBox = New-Object System.Windows.Forms.RichTextBox
$logBox.Location = New-Object System.Drawing.Point(20,370)
$logBox.Size = New-Object System.Drawing.Size(640,120)
$logBox.BackColor = [System.Drawing.Color]::FromArgb(15,15,15)
$logBox.ForeColor = [System.Drawing.Color]::LightGray
$logBox.Font = New-Object System.Drawing.Font("Consolas",9)
$logBox.ReadOnly = $true
$logBox.Text = "Ready. Drop files or folders to begin...`n"
$form.Controls.Add($logBox)

# process button
$processButton = New-Object System.Windows.Forms.Button
$processButton.Text = "Process Files"
$processButton.Font = New-Object System.Drawing.Font("Segoe UI",11,[System.Drawing.FontStyle]::Bold)
$processButton.Size = New-Object System.Drawing.Size(150,40)
$processButton.Location = New-Object System.Drawing.Point(20,505)
$processButton.BackColor = [System.Drawing.Color]::FromArgb(229,9,20)
$processButton.ForeColor = [System.Drawing.Color]::White
$processButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$processButton.Enabled = $false
$form.Controls.Add($processButton)

# clear button
$clearButton = New-Object System.Windows.Forms.Button
$clearButton.Text = "Clear"
$clearButton.Size = New-Object System.Drawing.Size(100,40)
$clearButton.Location = New-Object System.Drawing.Point(180,505)
$clearButton.BackColor = [System.Drawing.Color]::FromArgb(50,50,50)
$clearButton.ForeColor = [System.Drawing.Color]::White
$clearButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$form.Controls.Add($clearButton)

# status label
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Ready"
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI",10,[System.Drawing.FontStyle]::Bold)
$statusLabel.ForeColor = [System.Drawing.Color]::LightGreen
$statusLabel.AutoSize = $true
$statusLabel.Location = New-Object System.Drawing.Point(560,515)
$form.Controls.Add($statusLabel)

# store items to process
$itemsToProcess = @()

# logging function
function Log-Message {
    param($message, $color = "LightGray")
    $logBox.SelectionStart = $logBox.TextLength
    $logBox.SelectionLength = 0
    $logBox.SelectionColor = [System.Drawing.Color]::$color
    $logBox.AppendText("$message`n")
    $logBox.ScrollToCaret()
    $logBox.Refresh()
}

# parse movie filename
function Parse-MovieName {
    param($fileName)

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)

    # try to extract year
    if ($baseName -match '(.+?)\s*\((\d{4})\)') {
        return @{
            title = $matches[1].Trim()
            year = $matches[2]
        }
    } elseif ($baseName -match '(.+?)\s+(\d{4})') {
        return @{
            title = $matches[1].Trim()
            year = $matches[2]
        }
    } else {
        return @{
            title = $baseName.Trim()
            year = (Get-Date).Year
        }
    }
}

# parse episode filename
function Parse-EpisodeName {
    param($fileName)

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)

    # patterns: S01E01, s01e01, 1x01, Episode 1, E01, etc
    if ($baseName -match '[Ss](\d+)[Ee](\d+)') {
        return @{
            season = [int]$matches[1]
            episode = [int]$matches[2]
        }
    } elseif ($baseName -match '(\d+)[xX](\d+)') {
        return @{
            season = [int]$matches[1]
            episode = [int]$matches[2]
        }
    } elseif ($baseName -match '[Ee]pisode\s*(\d+)') {
        return @{
            season = 1
            episode = [int]$matches[1]
        }
    } elseif ($baseName -match '^(\d+)') {
        return @{
            season = 1
            episode = [int]$matches[1]
        }
    } else {
        return $null
    }
}

# process dropped items
function Process-Items {
    param($items)

    $script:itemsToProcess = @()
    $dropLabel.ForeColor = [System.Drawing.Color]::White

    foreach ($item in $items) {
        if (Test-Path $item -PathType Leaf) {
            # single file - assume movie
            $ext = [System.IO.Path]::GetExtension($item).ToLower()
            if ($ext -match '\.(mp4|mkv|avi|mov|webm)$') {
                $script:itemsToProcess += @{
                    type = "movie"
                    path = $item
                    name = [System.IO.Path]::GetFileName($item)
                }
            }
        } elseif (Test-Path $item -PathType Container) {
            # directory - check if it's a show
            $showName = [System.IO.Path]::GetFileName($item)
            $seasons = Get-ChildItem -Path $item -Directory | Where-Object { $_.Name -match 'Season|S\d+' }

            if ($seasons) {
                # looks like a TV show
                foreach ($season in $seasons) {
                    $seasonNum = 1
                    if ($season.Name -match 'Season\s*(\d+)') {
                        $seasonNum = [int]$matches[1]
                    } elseif ($season.Name -match 'S(\d+)') {
                        $seasonNum = [int]$matches[1]
                    }

                    $episodes = Get-ChildItem -Path $season.FullName -File | Where-Object {
                        $_.Extension -match '\.(mp4|mkv|avi|mov|webm)$'
                    }

                    foreach ($episode in $episodes) {
                        $episodeInfo = Parse-EpisodeName $episode.Name
                        if ($episodeInfo) {
                            $script:itemsToProcess += @{
                                type = "episode"
                                path = $episode.FullName
                                showName = $showName
                                season = $seasonNum
                                episode = $episodeInfo.episode
                                fileName = $episode.Name
                            }
                        }
                    }
                }
            } else {
                # flat directory of videos - treat as movies
                $files = Get-ChildItem -Path $item -File | Where-Object {
                    $_.Extension -match '\.(mp4|mkv|avi|mov|webm)$'
                }
                foreach ($file in $files) {
                    $script:itemsToProcess += @{
                        type = "movie"
                        path = $file.FullName
                        name = $file.Name
                    }
                }
            }
        }
    }

    if ($script:itemsToProcess.Count -gt 0) {
        $movies = ($script:itemsToProcess | Where-Object { $_.type -eq "movie" }).Count
        $episodes = ($script:itemsToProcess | Where-Object { $_.type -eq "episode" }).Count

        $summary = ""
        if ($movies -gt 0) { $summary += "$movies movie(s)" }
        if ($episodes -gt 0) {
            if ($summary) { $summary += ", " }
            $summary += "$episodes episode(s)"
        }

        $dropLabel.Text = "[OK] Found: $summary`n`nClick 'Process Files' to upload"
        $processButton.Enabled = $true
        Log-Message "Found $summary ready to process" "LightGreen"
    } else {
        $dropLabel.Text = "No valid video files found`n`nTry again"
        $dropLabel.ForeColor = [System.Drawing.Color]::Orange
    }
}

# upload and organize files
function Upload-Files {
    $processButton.Enabled = $false
    $clearButton.Enabled = $false
    $statusLabel.Text = "Processing..."
    $statusLabel.ForeColor = [System.Drawing.Color]::Yellow

    Log-Message "`n=== Starting Upload ===" "Cyan"

    # create directories if needed
    @($UPLOADS_PATH, $MOVIES_PATH, $SHOWS_PATH) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
        }
    }

    $successCount = 0
    $failCount = 0

    foreach ($item in $script:itemsToProcess) {
        try {
            if ($item.type -eq "movie") {
                # handle movie
                $movieInfo = Parse-MovieName $item.name
                $ext = [System.IO.Path]::GetExtension($item.path)
                $safeTitle = $movieInfo.title -replace '[^\w\s-]', ''
                $newFileName = "$safeTitle ($($movieInfo.year))$ext"
                $destPath = Join-Path $MOVIES_PATH $newFileName

                Log-Message "Movie: $($movieInfo.title) ($($movieInfo.year))" "White"
                Copy-Item -Path $item.path -Destination $destPath -Force
                Log-Message "  [OK] Copied to movies/" "Green"

                $successCount++
            }
            elseif ($item.type -eq "episode") {
                # handle TV episode
                $showDir = Join-Path $SHOWS_PATH $item.showName
                $seasonDir = Join-Path $showDir "Season $($item.season)"

                if (-not (Test-Path $seasonDir)) {
                    New-Item -ItemType Directory -Path $seasonDir -Force | Out-Null
                }

                $ext = [System.IO.Path]::GetExtension($item.path)
                $newFileName = "S$($item.season.ToString('00'))E$($item.episode.ToString('00'))$ext"
                $destPath = Join-Path $seasonDir $newFileName

                Log-Message "$($item.showName) - S$($item.season)E$($item.episode)" "White"
                Copy-Item -Path $item.path -Destination $destPath -Force
                Log-Message "  [OK] Copied to shows/$($item.showName)/Season $($item.season)/" "Green"

                $successCount++
            }
        }
        catch {
            Log-Message "  [X] Error: $_" "Red"
            $failCount++
        }
    }

    Log-Message "`n=== Complete ===" "Cyan"
    Log-Message "Success: $successCount | Failed: $failCount" "Yellow"

    if ($successCount -gt 0) {
        Log-Message "`nFiles are organized in server/media/" "LightGreen"
        Log-Message "Use the web interface (http://localhost:5173) to add metadata" "Gray"
        $statusLabel.Text = "[DONE]"
        $statusLabel.ForeColor = [System.Drawing.Color]::LightGreen
    }

    if ($failCount -gt 0) {
        $statusLabel.Text = "[WARNING] Done with errors"
        $statusLabel.ForeColor = [System.Drawing.Color]::Orange
    }

    $script:itemsToProcess = @()
    $dropLabel.Text = @"
>> Drop Files Here <<

Movies: Inception.mp4, The Matrix (1999).mkv
Shows: Breaking Bad/Season 1/E01.mp4

Supported: MP4, MKV, AVI, MOV, WEBM
"@
    $dropLabel.ForeColor = [System.Drawing.Color]::Gray
    $processButton.Enabled = $false
    $clearButton.Enabled = $true
}

# drag events
$dropZone.Add_DragEnter({
    if ($_.Data.GetDataPresent([Windows.Forms.DataFormats]::FileDrop)) {
        $_.Effect = [Windows.Forms.DragDropEffects]::Copy
        $dropZone.BackColor = [System.Drawing.Color]::FromArgb(40,40,40)
    }
})

$dropZone.Add_DragLeave({
    $dropZone.BackColor = [System.Drawing.Color]::FromArgb(30,30,30)
})

$dropZone.Add_DragDrop({
    $dropZone.BackColor = [System.Drawing.Color]::FromArgb(30,30,30)
    $items = $_.Data.GetData([Windows.Forms.DataFormats]::FileDrop)
    Process-Items -items $items
})

# button events
$processButton.Add_Click({
    Upload-Files
})

$clearButton.Add_Click({
    $logBox.Clear()
    $logBox.AppendText("Ready. Drop files or folders to begin...`n")
    $statusLabel.Text = "Ready"
    $statusLabel.ForeColor = [System.Drawing.Color]::LightGreen
})

# show form
$form.Add_Shown({
    Log-Message "HomeFlix Smart Uploader initialized" "Cyan"
    Log-Message "Drop movies or show folders to begin" "Gray"
    Log-Message "`nExample structures:" "Gray"
    Log-Message "  Movies: Inception.mp4" "DarkGray"
    Log-Message "  Shows: Breaking Bad/Season 1/S01E01.mp4" "DarkGray"
})

[void]$form.ShowDialog()
