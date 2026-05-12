$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = [System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'HardwareERP.lnk')
$TargetPath = [System.IO.Path]::Combine($args[0], 'start.bat')
$IconPath = [System.IO.Path]::Combine($args[0], 'public', 'pwa-192x192.png')

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = 'cmd.exe'
$Shortcut.Arguments = "/c `"$TargetPath`""
$Shortcut.WorkingDirectory = $args[0]
$Shortcut.IconLocation = $IconPath
$Shortcut.Description = 'HardwarePro ERP - Inventory Management'
$Shortcut.Save()
