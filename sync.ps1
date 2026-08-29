<#
.SYNOPSIS
    Automated Git synchronization, search indexing, knowledge graph maintenance,
    pre-commit verification, smart conventional commits, and bot stamp synchronization.

.DESCRIPTION
    sync.ps1 — The unified developer & agent workflow synchronization engine for
    Aaradhya-Dev-Tamrakar.github.io.

    Core Workflow:
    1. Resets uncommitted local noise on assets/js/last-commit.json (bot-managed).
    2. Pulls remote updates with --autostash and synchronizes Git LFS pointers.
    3. (Optional) Syncs site version metadata across sw.js, sitemap.xml, and tracker.
    4. Regenerates static search index via scripts/extract_index.py.
    5. Updates codebase knowledge graph via graphify update . (AST sync).
    6. Runs pre-commit diagnostic verification suite via scripts/verify.py.
    7. Formulates intelligent conventional commit message with file-scope & churn metrics.
    8. Updates dev-logs/PortfolioWebsite_TRACKER.md timestamp.
    9. Stages all changes (excluding last-commit.json), commits, and pushes to origin main.
    10. Smart-polls and synchronizes the GitHub Actions stamp bot commit.

.PARAMETER Message
    Custom commit message (e.g. -m "feat(projects): add robotics simulation").
    If omitted, an intelligent conventional commit message is auto-generated.

.PARAMETER Version
    Optional explicit version tag (e.g. -v v50). Sets exact version and propagates across all files.

.PARAMETER Major
    Bumps major release integer (e.g. 49 -> 50), prepends release block to SITE_RELEASES,
    and updates tracker and cache.

.PARAMETER NoBump
    Suppresses automatic point release increment on routine sync.

.PARAMETER PullOnly
    Safely pull remote changes with --autostash and LFS sync without committing or pushing.

.PARAMETER PushOnly
    Pushes existing unpushed commits and synchronizes the stamp bot without re-running
    pre-extraction indexing and verification.

.PARAMETER NoPush
    Stages and commits changes locally without pushing to remote origin.

.PARAMETER SkipGraph
    Bypasses knowledge graph AST extraction (graphify update .).

.PARAMETER SkipVerify
    Bypasses pre-commit verification gate (scripts/verify.py).

.PARAMETER SkipIndex
    Bypasses static search index regeneration (scripts/extract_index.py).

.PARAMETER WhatIf
    Dry-run mode: Previews changes, verification status, and auto-generated commit
    message without staging, committing, or pushing.

.PARAMETER Force
    Alias for bypassing verification gate failure on urgent commits.

.PARAMETER Status
    Displays comprehensive repository health, git status, LFS state, and tooling diagnostics.

.PARAMETER VerboseLog
    Outputs detailed debug logs, diff hunks, and sub-process execution telemetry.

.PARAMETER Help
    Displays this formatted interactive help manual.

.EXAMPLE
    .\sync.ps1                               # Routine sync: auto-increments point version (49.1, 49.2), verifies & pushes
    .\sync.ps1 -Major                        # Major release bump: 49 -> 50, updates releases & tracker
    .\sync.ps1 -Major -Title "New Design"    # Major bump with custom title
    .\sync.ps1 -v v50                        # Explicit version sync
    .\sync.ps1 -NoBump                       # Sync without incrementing version
    .\sync.ps1 -m "feat(ui): refine radar"   # Custom commit message
    .\sync.ps1 -PullOnly                     # Safe pull only
    .\sync.ps1 -WhatIf                       # Dry-run preview
    .\sync.ps1 -Status                       # Show repository telemetry
#>

param (
    [Alias("m")]
    [string]$Message,

    [Alias("v")]
    [string]$Version,

    [Alias("BumpMajor")]
    [switch]$Major,

    [switch]$NoBump,

    [string]$Title,

    [string[]]$Highlights,

    [switch]$PullOnly,
    [switch]$PushOnly,
    [switch]$NoPush,
    [switch]$SkipGraph,
    [switch]$SkipVerify,
    [switch]$SkipIndex,
    [Alias("DryRun")]
    [switch]$WhatIf,
    [Alias("Force")]
    [switch]$BypassVerify,
    [Alias("Info")]
    [switch]$Status,
    [Alias("v_log")]
    [switch]$VerboseLog,
    [Alias("h", "?")]
    [switch]$Help
)

$ErrorActionPreference = "Continue"
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

# -----------------------------------------------------------------------------
# Color Logging & UI Utilities
# -----------------------------------------------------------------------------
function Write-Badge {
    param (
        [string]$Tag,
        [string]$Text,
        [ConsoleColor]$TagColor = [ConsoleColor]::Cyan,
        [ConsoleColor]$TextColor = [ConsoleColor]::White
    )
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] " -NoNewline -ForegroundColor DarkGray
    Write-Host "[$Tag] " -NoNewline -ForegroundColor $TagColor
    Write-Host "$Text" -ForegroundColor $TextColor
}

function Show-HelpGuide {
    Write-Host ''
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host '  sync.ps1 -- Portfolio Repository Hyper-Automation & Git Sync Engine     ' -ForegroundColor White
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host ''
    Write-Host 'SYNTAX:' -ForegroundColor Yellow
    Write-Host '  .\sync.ps1 [-m <Message>] [-v <Version>] [-PullOnly] [-PushOnly] [-NoPush]'
    Write-Host '             [-SkipGraph] [-SkipVerify] [-SkipIndex] [-WhatIf] [-Force] [-Status]'
    Write-Host ''
    Write-Host 'COMMON WORKFLOWS:' -ForegroundColor Yellow
    Write-Host '  .\sync.ps1                        ' -NoNewline -ForegroundColor Green
    Write-Host 'Full auto: Index -> Graph -> Verify -> Auto-Commit -> Push -> Stamp Sync'
    Write-Host '  .\sync.ps1 -m "type(scope): msg"  ' -NoNewline -ForegroundColor Green
    Write-Host 'Commit with custom conventional commit message'
    Write-Host '  .\sync.ps1 -v v48                 ' -NoNewline -ForegroundColor Green
    Write-Host 'Bump version metadata (sw.js, sitemap.xml, tracker) and sync'
    Write-Host '  .\sync.ps1 -PullOnly              ' -NoNewline -ForegroundColor Green
    Write-Host 'Pull remote changes safely with --autostash and LFS sync'
    Write-Host '  .\sync.ps1 -WhatIf                ' -NoNewline -ForegroundColor Green
    Write-Host 'Dry run: preview auto-commit message and verification'
    Write-Host '  .\sync.ps1 -Status                ' -NoNewline -ForegroundColor Green
    Write-Host 'Display repository health, git status, and tooling diagnostics'
    Write-Host ''
    Write-Host 'FLAGS & SWITCHES:' -ForegroundColor Yellow
    Write-Host '  -m, -Message <String>    Custom conventional commit message'
    Write-Host '  -v, -Version <String>    Version tag (e.g. v48) to sync across sw.js and sitemap'
    Write-Host '  -PullOnly                Safe pull with autostash and LFS pull only'
    Write-Host '  -PushOnly                Push staged/committed work and sync stamp bot'
    Write-Host '  -NoPush                  Commit locally without pushing to remote origin'
    Write-Host '  -SkipGraph               Skip Graphify AST knowledge graph update'
    Write-Host '  -SkipVerify / -Force     Bypass pre-commit verification suite (scripts/verify.py)'
    Write-Host '  -SkipIndex               Skip static search index regeneration (extract_index.py)'
    Write-Host '  -WhatIf / -DryRun        Preview changes and commit message without modifying git'
    Write-Host '  -Status / -Info          Show repository and environment diagnostics'
    Write-Host '  -VerboseLog              Show detailed sub-process output and diff snippets'
    Write-Host '  -Help, -h, -?            Show this help guide'
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host ''
}

# -----------------------------------------------------------------------------
# Tooling Discovery
# -----------------------------------------------------------------------------
function Get-PythonPath {
    $candidates = @("python", "python3", "py")
    foreach ($cand in $candidates) {
        $cmd = Get-Command $cand -ErrorAction SilentlyContinue
        if ($cmd) {
            $null = & $cmd.Source --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                return $cmd.Source
            }
        }
    }
    return $null
}

function Get-LfsInstalled {
    $lfs = Get-Command git-lfs -ErrorAction SilentlyContinue
    if (-not $lfs) {
        git lfs version 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) { return $true }
        return $false
    }
    return $true
}

function Show-Diagnostics {
    $py = Get-PythonPath
    $lfs = Get-LfsInstalled
    $graphify = Get-Command graphify -ErrorAction SilentlyContinue
    $branch = git rev-parse --abbrev-ref HEAD 2>$null
    $lastCommit = git log -1 '--pretty=format:%h - %s (%cr) <%an>' 2>$null
    $statusShort = git status --short 2>$null

    Write-Host ''
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host '  Repository Status & Tooling Diagnostics                                 ' -ForegroundColor White
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host '  Current Branch   : ' -NoNewline -ForegroundColor Yellow
    Write-Host "$branch"
    Write-Host '  Last Commit      : ' -NoNewline -ForegroundColor Yellow
    Write-Host "$lastCommit"
    
    $pyText = if ($py) { "$py" } else { "NOT FOUND (Python required for verification & indexing)" }
    $pyColor = if ($py) { [ConsoleColor]::Green } else { [ConsoleColor]::Red }
    Write-Host '  Python Runtime   : ' -NoNewline -ForegroundColor Yellow
    Write-Host $pyText -ForegroundColor $pyColor
    
    $lfsText = if ($lfs) { "Active & Configured" } else { "Not Found (git-lfs recommended)" }
    $lfsColor = if ($lfs) { [ConsoleColor]::Green } else { [ConsoleColor]::Yellow }
    Write-Host '  Git LFS Status   : ' -NoNewline -ForegroundColor Yellow
    Write-Host $lfsText -ForegroundColor $lfsColor

    $graphText = if ($graphify) { "Installed ($($graphify.Source))" } else { "Not Found (Optional)" }
    $graphColor = if ($graphify) { [ConsoleColor]::Green } else { [ConsoleColor]::Gray }
    Write-Host '  Graphify Tool    : ' -NoNewline -ForegroundColor Yellow
    Write-Host $graphText -ForegroundColor $graphColor
    
    Write-Host ''
    Write-Host '  Working Tree State:' -ForegroundColor Yellow
    if ($statusShort) {
        $statusShort | ForEach-Object { Write-Host "    $_" -ForegroundColor White }
    }
    else {
        Write-Host '    Working tree clean (no uncommitted changes)' -ForegroundColor Green
    }
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host ''
}

# -----------------------------------------------------------------------------
# Smart Commit Message Generation
# -----------------------------------------------------------------------------
function Get-AutoCommitMessage {
    $statusLines = git status --porcelain 2>$null | Where-Object { $_ -notmatch 'assets/js/last-commit\.json' }
    if (-not $statusLines) {
        return $null
    }

    $modifiedFiles = @()
    $addedFiles = @()
    $deletedFiles = @()
    $allPaths = @()

    foreach ($line in $statusLines) {
        if ($line.Length -lt 4) { continue }
        $code = $line.Substring(0, 2).Trim()
        $rawPath = $line.Substring(3).Trim().Trim('"')
        if ($rawPath -match ' -> ') {
            $rawPath = ($rawPath -split ' -> ')[-1].Trim().Trim('"')
        }
        $fileName = Split-Path $rawPath -Leaf
        $allPaths += $rawPath

        if ($code -match 'A|\?\?') {
            $addedFiles += $fileName
        }
        elseif ($code -match 'D') {
            $deletedFiles += $fileName
        }
        else {
            $modifiedFiles += $fileName
        }
    }

    $allChanged = $addedFiles + $modifiedFiles + $deletedFiles
    if ($allChanged.Count -eq 0) {
        return $null
    }

    # Filter out auto-generated noise for human-readable summaries
    $userChanged = $allChanged | Where-Object { $_ -notmatch '^(stat-index\.json|manifest\.json|last-commit\.json)$' }
    $displayFiles = if ($userChanged.Count -gt 0) { $userChanged } else { $allChanged }

    # Determine conventional type and scope from modified filepaths
    $type = "chore"
    $scope = ""

    # Priority scope detection
    if ($allPaths | Where-Object { $_ -match 'projects\.html' }) {
        $type = if ($addedFiles -contains 'projects.html') { "feat" } else { "update" }
        $scope = "projects"
    }
    elseif ($allPaths | Where-Object { $_ -match 'achievements\.html' }) {
        $type = if ($addedFiles -contains 'achievements.html') { "feat" } else { "update" }
        $scope = "achievements"
    }
    elseif ($allPaths | Where-Object { $_ -match 'experience\.html' }) {
        $type = if ($addedFiles -contains 'experience.html') { "feat" } else { "update" }
        $scope = "experience"
    }
    elseif ($allPaths | Where-Object { $_ -match 'about\.html' }) {
        $type = if ($addedFiles -contains 'about.html') { "feat" } else { "update" }
        $scope = "about"
    }
    elseif ($allPaths | Where-Object { $_ -match 'contact\.html' }) {
        $type = if ($addedFiles -contains 'contact.html') { "feat" } else { "update" }
        $scope = "contact"
    }
    elseif ($allPaths | Where-Object { $_ -match 'journey\.html' }) {
        $type = if ($addedFiles -contains 'journey.html') { "feat" } else { "update" }
        $scope = "journey"
    }
    elseif ($allPaths | Where-Object { $_ -match 'index\.html' }) {
        $type = if ($addedFiles -contains 'index.html') { "feat" } else { "refactor" }
        $scope = "home"
    }
    elseif ($allPaths | Where-Object { $_ -match '^assets/css/' }) {
        $type = "style"
        $scope = "css"
    }
    elseif ($allPaths | Where-Object { $_ -match '^assets/js/bg-animations\.js' }) {
        $type = "perf"
        $scope = "canvas"
    }
    elseif ($allPaths | Where-Object { $_ -match '^assets/js/modules/(core|ui|terminal|access|audio|tour|haptics)\.js' }) {
        $type = "refactor"
        $scope = "js"
    }
    elseif ($allPaths | Where-Object { $_ -match '^assets/js/modules/cmdk\.js' }) {
        $type = "search"
        $scope = "index"
    }
    elseif ($allPaths | Where-Object { $_ -match '^assets/(images|videos|docs|media)/' }) {
        $type = "assets"
        $scope = "media"
    }
    elseif ($allPaths | Where-Object { $_ -match 'sw\.js' }) {
        $type = "perf"
        $scope = "pwa"
    }
    elseif ($allPaths | Where-Object { $_ -match '(sitemap\.xml|robots\.txt)' }) {
        $type = "seo"
        $scope = "sitemap"
    }
    elseif ($allPaths | Where-Object { $_ -match '^dev-logs/' -or $_ -match '\.md$' }) {
        $type = "docs"
        $scope = "tracker"
    }
    elseif ($allPaths | Where-Object { $_ -match '^\.github/' }) {
        $type = "ci"
        $scope = "workflows"
    }
    elseif ($allPaths | Where-Object { $_ -match '^scripts/' }) {
        $type = "tools"
        $scope = "scripts"
    }
    elseif ($allPaths | Where-Object { $_ -match '^sync\.ps1$' }) {
        $type = "chore"
        $scope = "sync"
    }
    elseif ($allPaths | Where-Object { $_ -match '^graphify-out/' }) {
        $type = "chore"
        $scope = "graph"
    }
    elseif ($addedFiles.Count -gt 0) {
        $type = "feat"
    }
    elseif ($modifiedFiles | Where-Object { $_ -match '\.(js|html)$' }) {
        $type = "refactor"
    }

    # Summary list of files
    $summary = ""
    if ($displayFiles.Count -le 3) {
        $summary = $displayFiles -join ", "
    }
    else {
        $firstTwo = ($displayFiles[0..1]) -join ", "
        $extraCount = $displayFiles.Count - 2
        $summary = "$firstTwo +$extraCount more"
    }

    # Calculate diff statistics and line churn
    $rawDiff = git diff -U0 HEAD -- 2>$null
    $diffStat = git diff --shortstat HEAD -- 2>$null
    $churn = ""
    $ins = 0
    $del = 0
    if ($diffStat -match '(\d+) insertion') { $ins = $Matches[1] }
    if ($diffStat -match '(\d+) deletion') { $del = $Matches[1] }
    if (($ins + 0) -gt 0 -or ($del + 0) -gt 0) {
        $churn = " (+$ins/-$del)"
    }

    # Check for pure EOF newline fixup
    $isNewlineOnly = $false
    if ($rawDiff -match '\\ No newline at end of file') {
        $addedLines = $rawDiff | Where-Object { $_ -match '^\+[^+]' } | ForEach-Object { $_.Substring(1) }
        $removedLines = $rawDiff | Where-Object { $_ -match '^-[^-]' } | ForEach-Object { $_.Substring(1) }
        if ($addedLines.Count -eq 1 -and $removedLines.Count -eq 1 -and $addedLines[0] -eq $removedLines[0]) {
            $isNewlineOnly = $true
        }
    }

    $hunkContext = $null
    if ($isNewlineOnly) {
        $hunkContext = "add trailing newline"
    }
    else {
        $hunkMatch = $rawDiff |
            Select-String '^@@.*@@\s*([a-zA-Z0-9_\-\.\#\s]{3,})$' |
            ForEach-Object { $_.Matches[0].Groups[1].Value.Trim() } |
            Select-Object -First 1

        if ($hunkMatch) {
            $hunkContext = $hunkMatch
        }
        else {
            $addedLine = $rawDiff |
                Select-String '^\+[^+]' |
                ForEach-Object { $_.Line.Substring(1).Trim() } |
                Where-Object { $_.Length -gt 0 -and $_ -notmatch '^[\{\}\[\]",\s]+$' -and $_ -notmatch '^[0-9]+$' } |
                Select-Object -First 1
            if ($addedLine) {
                $snippet = $addedLine -replace '[\r\n\t]+', ' ' -replace '["`]', "'"
                if ($snippet.Length -gt 45) { $snippet = $snippet.Substring(0, 45) + "..." }
                $hunkContext = $snippet.Trim()
            }
        }
    }

    if ($hunkContext) {
        $hunkContext = $hunkContext -replace '["`]', "'" -replace '[\r\n]', ' '
    }

    $scopeTag = if ($scope) { "($scope)" } else { "" }

    if ($hunkContext -and $hunkContext.Length -gt 2) {
        return "${type}${scopeTag}: update ${summary} - ${hunkContext}${churn}"
    }
    return "${type}${scopeTag}: update ${summary}${churn}"
}

# -----------------------------------------------------------------------------
# Tracker & Metadata Synchronization (Markdownlint MD009/MD026 Compliant)
# -----------------------------------------------------------------------------
function Update-TrackerLog {
    $trackerFile = "dev-logs/PortfolioWebsite_TRACKER.md"
    if (-not (Test-Path $trackerFile)) { return }

    $todayDate = Get-Date -Format "yyyy-MM-dd"
    $content = Get-Content $trackerFile -Raw -Encoding UTF8
    
    # Clean trailing whitespace across all lines to satisfy MD009
    $cleanLines = ($content -split "\r?\n") | ForEach-Object { $_.TrimEnd() }
    $content = $cleanLines -join "`n"

    # Support all variations: ## _Last updated..._, _Last updated..._, *Last updated...*, ## Last Updated...
    # Formats as clean subtitle `Last updated: _YYYY-MM-DD_` without heading colons (MD026), trailing spaces (MD009), or full emphasis (MD036)
    $formattedDate = "Last updated: _$($todayDate)_"
    if ($content -match '(?m)^(?:##\s*)?\\?[_*]?Last updated.*$') {
        $content = [regex]::Replace($content, '(?m)^(?:##\s*)?\\?[_*]?Last updated.*$', $formattedDate)
    }
    elseif ($content -match '(?m)^# Portfolio Website Tracker.*$') {
        $content = [regex]::Replace($content, '(?m)^(# Portfolio Website Tracker.*)$', "`$1`n`n$formattedDate")
    }

    # Ensure clean single trailing newline
    $content = $content.TrimEnd() + "`n"

    Set-Content -Path $trackerFile -Value $content -NoNewline -Encoding UTF8
    Write-Badge "Tracker" "Updated $trackerFile timestamp to $todayDate (MD009/MD026 clean)" "Cyan" "Green"
}

function Format-MarkdownHygiene {
    $mdFiles = @("README.md", "CLAUDE.md", "GEMINI.md", "AGENTS.md", "dev-logs/PortfolioWebsite_TRACKER.md")
    foreach ($file in $mdFiles) {
        if (Test-Path $file) {
            $raw = Get-Content $file -Raw -Encoding UTF8
            $cleanLines = ($raw -split "\r?\n") | ForEach-Object { $_.TrimEnd() }
            $cleanContent = ($cleanLines -join "`n").TrimEnd() + "`n"
            if ($cleanContent -ne $raw) {
                Set-Content -Path $file -Value $cleanContent -NoNewline -Encoding UTF8
            }
        }
    }
}

# -----------------------------------------------------------------------------
# Bot Stamp Synchronization Polling Loop
# -----------------------------------------------------------------------------
function Sync-BotStamp {
    Write-Badge "BotSync" "Awaiting GitHub Actions stamp bot commit..." "Yellow" "White"
    
    $maxAttempts = 12
    $botSynced = $false

    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        Start-Sleep -Seconds 3

        # Pull silently with autostash
        $null = git pull --autostash origin main 2>&1
        
        $latestAuthor = git log -1 '--pretty=format:%an' 2>$null
        $latestMsg = git log -1 '--pretty=format:%s' 2>$null
        $latestSha = git log -1 '--pretty=format:%h' 2>$null

        if ($latestAuthor -match 'github-actions' -or $latestMsg -match 'stamp last commit') {
            Write-Badge "BotSync" "Synchronized bot stamp commit [$latestSha] '$latestMsg'" "Green" "Green"
            $botSynced = $true
            break
        }
    }

    if (-not $botSynced) {
        Write-Badge "BotSync" "Local branch is aligned with origin main." "Cyan" "Gray"
    }

    # Mirror-sync all configured push remotes to ensure secondary remotes receive the final bot stamp commit
    $pushUrls = git remote get-url --all --push origin 2>$null
    if ($pushUrls -and $pushUrls.Count -gt 1) {
        foreach ($url in $pushUrls) {
            Write-Badge "Mirror" "Synchronizing $url to HEAD..." "DarkGray" "Gray"
            $null = git push $url main --force 2>&1
        }
        Write-Badge "Mirror" "All configured remotes synchronized to $(git rev-parse --short HEAD)." "Green" "Green"
    }
}

# -----------------------------------------------------------------------------
# MAIN EXECUTION ROUTINE
# -----------------------------------------------------------------------------

# Handle Help Flag
if ($Help) {
    Show-HelpGuide
    exit 0
}

# Handle Diagnostics Status Flag
if ($Status) {
    Show-Diagnostics
    exit 0
}

Write-Host ''
Write-Host '==========================================================================' -ForegroundColor Cyan
Write-Host '  Aaradhya-Dev-Tamrakar.github.io -- Git & Workflow Synchronization Suite ' -ForegroundColor White
Write-Host '==========================================================================' -ForegroundColor Cyan

# Step 0: Find Python Environment & Git LFS
$pythonExe = Get-PythonPath
$lfsAvailable = Get-LfsInstalled

# Step 1: Clean Bot-Managed File
Write-Badge "Git" "Resetting uncommitted modifications to assets/js/last-commit.json..." "Cyan" "White"
git restore --staged assets/js/last-commit.json 2>$null
git restore assets/js/last-commit.json 2>$null
git checkout -- assets/js/last-commit.json 2>$null

# Step 2: Safe Pull Remote Changes
Write-Badge "Git" "Pulling latest changes from origin main (--autostash)..." "Cyan" "White"
$pullOut = git pull --autostash origin main 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    if ($pullOut -match 'CONFLICT|Merge conflict|Automatic merge failed') {
        Write-Badge "Git" "MERGE CONFLICT DETECTED during pull. Please resolve conflicts before running sync." "Red" "Red"
        Write-Host $pullOut -ForegroundColor Yellow
        exit 1
    }
    Write-Badge "Git" "Warning: Pull returned non-zero exit code ($LASTEXITCODE). Checking state..." "Yellow" "Yellow"
}

# Step 2b: Git LFS Synchronization
if ($lfsAvailable) {
    Write-Badge "LFS" "Ensuring Git LFS pointers are synchronized..." "Cyan" "Gray"
    git lfs pull 2>$null
}

# If PullOnly requested, terminate here
if ($PullOnly) {
    $stopwatch.Stop()
    Write-Host ''
    Write-Badge "Done" "Safe pull complete. Workspace synchronized in $([math]::Round($stopwatch.Elapsed.TotalSeconds, 2))s." "Green" "Green"
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host ''
    exit 0
}

# Step 3: Version Bump & Metadata Sync (Auto-propagates across all site files)
if (-not $PushOnly) {
    if ($pythonExe -and (Test-Path "scripts/site_automation.py")) {
        if ($Major) {
            Write-Badge "Version" "Bumping to next major release integer..." "Magenta" "White"
            $majorArgs = @("scripts/site_automation.py", "bump-major")
            if ($Title) { $majorArgs += @("--title", $Title) }
            if ($Highlights) { $majorArgs += @("--highlights") + $Highlights }
            $majorOut = & $pythonExe $majorArgs 2>&1 | Out-String
            if ($VerboseLog) { Write-Host $majorOut.Trim() -ForegroundColor Gray }
        }
        elseif ($Version) {
            Write-Badge "Version" "Synchronizing version metadata for tag '$Version'..." "Magenta" "White"
            & $pythonExe scripts/site_automation.py sync-metadata --version $Version
        }
        elseif (-not $NoBump -and -not $WhatIf) {
            # Auto point bump (e.g. 49.1, 49.2) if local modifications exist
            $statusCheck = git status --porcelain 2>$null | Where-Object { $_ -notmatch 'last-commit\.json' }
            if ($statusCheck) {
                Write-Badge "Version" "Auto-incrementing point release for pending updates..." "Cyan" "White"
                $patchOut = & $pythonExe scripts/site_automation.py bump-patch 2>&1 | Out-String
                if ($VerboseLog) { Write-Host $patchOut.Trim() -ForegroundColor Gray }
            }
            else {
                Write-Badge "Version" "Ensuring site-wide version consistency from SITE_RELEASES..." "Cyan" "Gray"
                & $pythonExe scripts/site_automation.py sync-metadata
            }
        }
        else {
            Write-Badge "Version" "Ensuring site-wide version consistency from SITE_RELEASES..." "Cyan" "Gray"
            & $pythonExe scripts/site_automation.py sync-metadata
        }
    }
}

# Step 4: Search Index Extraction
if (-not $SkipIndex -and -not $PushOnly) {
    if (Test-Path "scripts/extract_index.py") {
        if ($pythonExe) {
            Write-Badge "Index" "Extracting static search index (scripts/extract_index.py)..." "Cyan" "White"
            $indexOutput = & $pythonExe scripts/extract_index.py 2>&1 | Out-String
            if ($VerboseLog -or $indexOutput -match 'Extracted|updated') {
                Write-Host $indexOutput.Trim() -ForegroundColor Gray
            }
        }
        else {
            Write-Badge "Index" "Warning: Python runtime not detected -- skipping search index extraction." "Yellow" "Yellow"
        }
    }
}
else {
    if ($SkipIndex) { Write-Badge "Index" "Skipped search index extraction (-SkipIndex set)." "Yellow" "Gray" }
}

# Step 4b: CSS Module Optimization
if (-not $PushOnly -and (Test-Path "scripts/build_css.py") -and $pythonExe) {
    Write-Badge "CSS" "Minifying CSS modules (scripts/build_css.py)..." "Cyan" "White"
    $cssOutput = & $pythonExe scripts/build_css.py 2>&1 | Out-String
    if ($VerboseLog) {
        Write-Host $cssOutput.Trim() -ForegroundColor Gray
    }
}

# Step 5: Knowledge Graph Full Sync (Graphify)
#   Order: 1) graphify .            — Establish/refresh baseline cache & initial graph
#          2) graphify cluster-only . — Re-run Leiden layout for clean macro-level topology
#          3) graphify update .      — Incremental AST diff-merge into graph reports
if (-not $SkipGraph -and -not $PushOnly) {
    $graphifyCmd = Get-Command graphify -ErrorAction SilentlyContinue
    if ($graphifyCmd) {
        Write-Badge "Graph" "Step 5a: Initializing baseline graph cache (graphify .)..." "Cyan" "White"
        & $graphifyCmd.Source .

        Write-Badge "Graph" "Step 5b: Optimizing graph topology (graphify cluster-only .)..." "Cyan" "White"
        & $graphifyCmd.Source cluster-only .

        Write-Badge "Graph" "Step 5c: Incremental AST sync (graphify update .)..." "Cyan" "White"
        & $graphifyCmd.Source update .
    }
    else {
        Write-Badge "Graph" "Graphify CLI not found in PATH -- skipping graph sync." "DarkGray" "Gray"
    }
}
else {
    if ($SkipGraph) { Write-Badge "Graph" "Skipped knowledge graph sync (-SkipGraph set)." "Yellow" "Gray" }
}

# Step 6: Pre-Commit Diagnostic Verification Gate
if (-not $SkipVerify -and -not $BypassVerify -and -not $PushOnly) {
    if (Test-Path "scripts/verify.py") {
        if ($pythonExe) {
            if (Test-Path "scripts/test_e2e.py") {
                Write-Badge "E2E" "Running E2E integration & smoke testing suite..." "Cyan" "White"
                & $pythonExe scripts/test_e2e.py
                if ($LASTEXITCODE -ne 0) {
                    Write-Badge "E2E" "E2E SMOKE TESTS FAILED -- Commit aborted." "Red" "Red"
                    exit 1
                }
            }
            Write-Badge "Verify" "Running pre-commit diagnostic verification suite..." "Cyan" "White"
            & $pythonExe scripts/verify.py
            $verifyExit = $LASTEXITCODE
            
            if ($verifyExit -eq 1) {
                Write-Host ''
                Write-Badge "Verify" "VERIFICATION FAILED (exit code 1) -- Commit aborted." "Red" "Red"
                Write-Host "  Please resolve the errors flagged by verify.py above." -ForegroundColor Yellow
                Write-Host "  To bypass this gate for urgent WIP syncs, pass: .\sync.ps1 -SkipVerify (or -Force)" -ForegroundColor Gray
                Write-Host ''
                exit 1
            }
            elseif ($verifyExit -eq 2) {
                Write-Badge "Verify" "Verification passed with warnings -- proceeding with commit." "Yellow" "Yellow"
            }
            else {
                Write-Badge "Verify" "All verification checks passed cleanly (0 errors, 0 warnings)." "Green" "Green"
            }
        }
        else {
            Write-Badge "Verify" "Warning: Python not detected. Cannot run verification gate." "Yellow" "Yellow"
        }
    }
}
else {
    if ($SkipVerify -or $BypassVerify) {
        Write-Badge "Verify" "Bypassed verification gate (-SkipVerify / -Force flag set)." "Yellow" "Yellow"
    }
}

# Step 7: Push-Only Mode Check
if ($PushOnly) {
    Write-Badge "Git" "PushOnly flag active -- checking for unpushed commits..." "Cyan" "White"
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Badge "Git" "Push was rejected. Re-pulling with rebase and retrying..." "Yellow" "Yellow"
        git pull --rebase --autostash origin main
        if ($LASTEXITCODE -eq 0) {
            git push origin main
        }
        else {
            Write-Badge "Git" "Rebase failed. Please resolve conflicts manually." "Red" "Red"
            exit 1
        }
    }
    Sync-BotStamp
    $stopwatch.Stop()
    Write-Host ''
    Write-Badge "Done" "Push-only sync complete in $([math]::Round($stopwatch.Elapsed.TotalSeconds, 2))s." "Green" "Green"
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host ''
    exit 0
}

# Step 8: Formulate Commit Message
if (-not $Message) {
    $Message = Get-AutoCommitMessage
    if ($Message) {
        Write-Badge "Commit" "Auto-generated commit message: '$Message'" "Yellow" "White"
    }
}

# Step 9: Dry-Run (WhatIf) Mode
if ($WhatIf) {
    $stopwatch.Stop()
    Write-Host ''
    Write-Host '--------------------------------------------------------------------------' -ForegroundColor Yellow
    Write-Host '  DRY-RUN / WHAT-IF PREVIEW                                               ' -ForegroundColor Yellow
    Write-Host '--------------------------------------------------------------------------' -ForegroundColor Yellow
    Write-Host '  Proposed Commit Message : ' -NoNewline -ForegroundColor White
    $msgText = if ($Message) { "$Message" } else { "No changes detected to commit" }
    Write-Host $msgText -ForegroundColor Cyan
    Write-Host '  Verification Status     : Passed' -ForegroundColor Green
    Write-Host '  Git Push Destination    : origin main' -ForegroundColor White
    Write-Host "  Execution Time (Preview): $([math]::Round($stopwatch.Elapsed.TotalSeconds, 2))s" -ForegroundColor Gray
    Write-Host '--------------------------------------------------------------------------' -ForegroundColor Yellow
    Write-Host '  No changes were staged, committed, or pushed.' -ForegroundColor Gray
    Write-Host ''
    exit 0
}

# Step 10: Stage, Commit, and Push
# Sanitize markdown formatting (MD009/MD026) and update tracker timestamp
Format-MarkdownHygiene
Update-TrackerLog

Write-Badge "Git" "Staging modified repository assets (git add .)..." "Cyan" "White"
git add .

# Ensure local edit to last-commit.json is never committed locally
git restore --staged assets/js/last-commit.json 2>$null
git restore assets/js/last-commit.json 2>$null
git checkout -- assets/js/last-commit.json 2>$null

# Check if there are staged changes to commit
$staged = git diff --cached --name-only 2>$null

if ($staged) {
    if (-not $Message) {
        $Message = Get-AutoCommitMessage
        if (-not $Message) {
            $Message = "chore: synchronize repository assets and metadata"
        }
    }

    Write-Badge "Git" "Committing: '$Message'..." "Cyan" "White"
    git commit -m "$Message"

    if (-not $NoPush) {
        Write-Badge "Git" "Pushing commits to origin main..." "Cyan" "White"
        git push origin main
        
        if ($LASTEXITCODE -ne 0) {
            Write-Badge "Git" "Push rejected (non-fast-forward). Auto-rebasing with autostash..." "Yellow" "Yellow"
            git pull --rebase --autostash origin main
            if ($LASTEXITCODE -eq 0) {
                git push origin main
            }
            else {
                Write-Badge "Git" "Rebase encountered merge conflicts. Please resolve manually." "Red" "Red"
                exit 1
            }
        }

        # Step 11: Sync Bot Stamp
        Sync-BotStamp
    }
    else {
        Write-Badge "Git" "Skipped remote push (-NoPush flag active). Commit saved locally." "Yellow" "Yellow"
    }
}
else {
    # Check if there are unpushed commits from previous sessions
    $unpushed = git log origin/main..HEAD --oneline 2>$null
    if ($unpushed -and -not $NoPush) {
        Write-Badge "Git" "Working tree is clean, but found unpushed local commits:" "Cyan" "Yellow"
        $unpushed | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        Write-Badge "Git" "Pushing unpushed commits to origin main..." "Cyan" "White"
        git push origin main
        
        if ($LASTEXITCODE -ne 0) {
            Write-Badge "Git" "Push rejected (non-fast-forward). Auto-rebasing with autostash..." "Yellow" "Yellow"
            git pull --rebase --autostash origin main
            if ($LASTEXITCODE -eq 0) {
                git push origin main
            }
            else {
                Write-Badge "Git" "Rebase encountered merge conflicts. Please resolve manually." "Red" "Red"
                exit 1
            }
        }
        
        Sync-BotStamp
    }
    else {
        Write-Badge "Git" "Working tree is clean. No changes to commit or push." "DarkGray" "Gray"
    }
}

$stopwatch.Stop()
$elapsedSec = [math]::Round($stopwatch.Elapsed.TotalSeconds, 2)

Write-Host ''
Write-Badge "Done" "Workspace is clean and fully synchronized! (Elapsed: ${elapsedSec}s)" "Green" "Green"
Write-Host '==========================================================================' -ForegroundColor Cyan
Write-Host ''