"""Exercise actual PowerShell branch guards without running Git or network calls."""

import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PWSH = shutil.which('pwsh')


@unittest.skipUnless(PWSH, 'PowerShell 7 is required for sync branch tests')
class SyncBranchTests(unittest.TestCase):
    def test_branch_selection_and_feature_push_do_not_target_main(self):
        script = r'''
param([string]$Source)
$ErrorActionPreference = 'Stop'
$tokens = $null
$parseErrors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($Source, [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count) { throw ($parseErrors | Out-String) }
foreach ($name in @('Get-SyncPushBranch', 'Push-GitCommits')) {
    $function = $ast.Find({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $name }, $true)
    . ([scriptblock]::Create($function.Extent.Text))
}
if ((Get-SyncPushBranch -ActiveBranch 'main') -ne 'main') { throw 'Main target changed' }
if ((Get-SyncPushBranch -ActiveBranch 'feat/ecosystem-#20' -PublishBranch) -ne 'feat/ecosystem-#20') { throw 'Wrong feature target' }
foreach ($branch in @('main', '')) {
    $rejected = $false
    try { Get-SyncPushBranch -ActiveBranch $branch -PublishBranch | Out-Null }
    catch { $rejected = $true }
    if (-not $rejected) { throw 'Unsafe PublishBranch accepted' }
}
$rejected = $false
try { Get-SyncPushBranch -ActiveBranch 'feat/ecosystem-#20' | Out-Null }
catch { $rejected = $true }
if (-not $rejected) { throw 'Feature branch can accidentally push main' }
Get-SyncPushBranch -ActiveBranch 'feat/ecosystem-#20' -NoPush | Out-Null
Get-SyncPushBranch -ActiveBranch 'feat/ecosystem-#20' -PullOnly | Out-Null
Get-SyncPushBranch -ActiveBranch 'feat/ecosystem-#20' -WhatIf | Out-Null
$script:networkCalls = @()
function Invoke-GitNetwork { param([string[]]$Arguments) $script:networkCalls += ,$Arguments; $global:LASTEXITCODE = 0 }
function git { throw 'Feature publication must not enter the main mirror policy' }
if (-not (Push-GitCommits -Branch 'feat/ecosystem-#20')) { throw 'Feature push failed' }
if ($script:networkCalls.Count -ne 1 -or ($script:networkCalls[0] -join ' ') -ne 'push origin feat/ecosystem-#20') { throw 'Wrong publication command' }
'Branch isolation and feature publication checks passed.'
'''
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'check_sync_branch.ps1'
            path.write_text(script, encoding='utf-8')
            result = subprocess.run(
                [PWSH, '-NoProfile', '-File', str(path), '-Source', str(ROOT / 'sync.ps1')],
                capture_output=True, text=True, timeout=30, check=False,
            )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
