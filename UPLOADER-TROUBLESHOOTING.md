# HomeFlix Uploader Troubleshooting

## Quick Fix (Most Common Issue)

If the uploader won't open, it's usually a PowerShell execution policy issue.

### Solution 1: Use the Launcher (Easiest)

Double-click: **`launch-uploader.bat`**

This will automatically check and fix the execution policy for you.

### Solution 2: Manual Fix

1. Open PowerShell as Administrator
2. Run:
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` and press Enter
4. Try running the uploader again

---

## Common Issues

### Issue 1: "Cannot be loaded because running scripts is disabled"

**Error Message:**
```
HomeFlix-Uploader.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Cause:** PowerShell execution policy is set to Restricted.

**Solutions:**

**Option A - Use the launcher:**
```cmd
launch-uploader.bat
```
The launcher will prompt to fix the policy automatically.

**Option B - Fix manually:**
```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run the uploader
.\HomeFlix-Uploader.ps1
```

**Option C - Bypass for one time:**
```powershell
powershell -ExecutionPolicy Bypass -File .\HomeFlix-Uploader.ps1
```

---

### Issue 2: "HomeFlix server folder not found"

**Error:** A message box says the server folder wasn't found.

**Cause:** You're running the script from the wrong location.

**Solution:**
- The uploader must be run from the HomeFlix root directory (the folder that contains the `server` folder)
- Make sure your directory structure looks like:
  ```
  HomeFlix/
  ├── HomeFlix-Uploader.ps1
  ├── launch-uploader.bat
  └── server/
      └── media/
          ├── movies/
          ├── shows/
          └── uploads/
  ```

---

### Issue 3: "Failed to load required components"

**Error:** Message about missing .NET Framework or System.Windows.Forms.

**Cause:** Missing or outdated .NET Framework.

**Solution:**
1. Download and install .NET Framework 4.8:
   https://dotnet.microsoft.com/download/dotnet-framework/net48
2. Restart your computer
3. Try the uploader again

---

### Issue 4: Nothing happens when double-clicking

**Cause:** PowerShell scripts don't run by default on double-click.

**Solutions:**

**Best:** Use the launcher instead:
```cmd
launch-uploader.bat
```

**Alternative:** Right-click the script:
1. Right-click `HomeFlix-Uploader.ps1`
2. Select "Run with PowerShell"

**Advanced:** Set .ps1 files to run with PowerShell:
1. Right-click `HomeFlix-Uploader.ps1` → Properties
2. Next to "Opens with:", click Change
3. Select "PowerShell"
4. Check "Always use this app"
5. Click OK

---

### Issue 5: "Access to the path is denied"

**Error:** Permission error when trying to create directories or copy files.

**Cause:** Insufficient permissions.

**Solutions:**

1. **Run as Administrator:**
   - Right-click `launch-uploader.bat`
   - Select "Run as administrator"

2. **Check folder permissions:**
   - Right-click the HomeFlix folder → Properties → Security
   - Make sure your user account has "Modify" permissions

3. **Disable read-only:**
   - Right-click the HomeFlix folder → Properties
   - Uncheck "Read-only"
   - Click Apply → Apply to all files and folders

---

### Issue 6: Uploader opens but drag-and-drop doesn't work

**Cause:** Windows security or the app running without proper permissions.

**Solutions:**

1. **Run as Administrator:**
   - Right-click `launch-uploader.bat` → Run as administrator

2. **Check UAC settings:**
   - Apps running with different privilege levels can't drag-drop between each other
   - Either run File Explorer as admin, or run the uploader without admin

3. **Try the Upload button:**
   - Instead of drag-drop, use the "Upload Files" button
   - Browse to your files manually

---

## Testing Your Setup

### Quick Test:

1. Open PowerShell in the HomeFlix folder
2. Run:
   ```powershell
   Get-ExecutionPolicy -List
   ```
3. Check that at least one of these is NOT "Restricted":
   - CurrentUser
   - LocalMachine

### Full Test:

1. Run the launcher:
   ```cmd
   launch-uploader.bat
   ```
2. The uploader window should open
3. Try dragging a video file onto the drop zone
4. Check that it appears in the log

---

## Alternative: Manual Upload Method

If the uploader still won't work, you can manually organize files:

### For Movies:
1. Copy your movie file to: `server/media/movies/`
2. Name it like: `MovieName (Year).mp4`
3. Example: `Inception (2010).mp4`

### For TV Shows:
1. Create folder structure: `server/media/shows/ShowName/Season X/`
2. Name episodes like: `S01E01 - Episode Name.mp4`
3. Example:
   ```
   server/media/shows/
   └── Breaking Bad/
       └── Season 1/
           ├── S01E01 - Pilot.mp4
           ├── S01E02 - Cat's in the Bag.mp4
           └── ...
   ```

### Scan for New Files:
1. Login to HomeFlix as admin
2. Go to Admin Dashboard
3. Click "Scan Library for New Files"
4. Your manually organized files will be added to the database

---

## Still Having Issues?

### Get Detailed Error Info:

Run the uploader from PowerShell to see full error messages:

```powershell
cd C:\path\to\HomeFlix
.\HomeFlix-Uploader.ps1
```

Any errors will appear in the PowerShell window.

### System Requirements:

- **OS:** Windows 10 or higher
- **.NET Framework:** 4.5 or higher (4.8 recommended)
- **PowerShell:** Version 5.0 or higher (built into Windows 10+)
- **Permissions:** Write access to HomeFlix folder

### Check PowerShell Version:

```powershell
$PSVersionTable.PSVersion
```

Should show version 5.0 or higher.

---

## Using the Web Upload Instead

If the PowerShell uploader doesn't work for you, use the web interface:

1. Start HomeFlix: `npm run dev` or `start.bat`
2. Open browser: http://localhost:5173
3. Login (demo/demo123)
4. Click "Upload" in the navigation bar
5. Fill in the form and select your files
6. Click Upload

The web upload works exactly the same, just without the drag-and-drop Windows interface.
