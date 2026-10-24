"""Package tracked public runtime files for GitHub Pages."""

from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_ROOT_FILES = {
    "site.webmanifest", "robots.txt", "sitemap.xml", "sw.js",
    "llms.txt", "llms-full.txt",
}
PUBLIC_DATA_FILES = {
    "data/ecosystem.json", "data/output-captures.json",
    "data/project-narratives.json", "data/quantitative-claims.json",
}


def is_public(path: str) -> bool:
    """Select runtime files without publishing development directories."""
    item = Path(path)
    if item.is_absolute() or ".." in item.parts:
        return False
    return (
        (len(item.parts) == 1 and item.suffix == ".html")
        or path in PUBLIC_ROOT_FILES
        or path in PUBLIC_DATA_FILES
        or path.startswith("assets/")
    )


def build_site(root: Path, destination: Path) -> int:
    """Copy only tracked runtime files; never replace an existing build."""
    tracked = subprocess.run(
        ["git", "ls-files", "-z"], cwd=root, check=True, capture_output=True
    ).stdout.decode("utf-8").split("\0")
    destination.mkdir(parents=True, exist_ok=False)
    count = 0
    for relative in tracked:
        if not relative or not is_public(relative):
            continue
        source = root / relative
        if source.is_symlink() or not source.is_file():
            raise ValueError(f"Runtime file must be a regular file: {relative}")
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        count += 1
    print(f"Packaged {count} public files into {destination}")
    return count


if __name__ == "__main__":
    build_site(ROOT, ROOT / ".site-build")
