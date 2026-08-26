import os
import re

# Define common code files to scan (Add or remove extensions based on your stack)
ALLOWED_EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.yaml', '.yml', '.md'}
IGNORE_DIRS = {'node_modules', '.git', 'build', 'dist', '.next', 'out'}

# Regular expressions to catch credentials before they reach the model
SENSITIVE_PATTERNS = {
    'GITHUB_TOKEN': r'(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}',
    'OPENROUTER_KEY': r'sk-or-v1-[A-Za-z0-9]{64}',
    'GENERIC_SECRET': r'(?i)(secret|password|passwd|auth_token|api_key)\s*[:=]\s*["\'][A-Za-z0-9_\-\.\+\/=]{16,}["\']',
    'PRIVATE_KEY': r'-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+ PRIVATE KEY-----'
}

def sanitize_content(content):
    for label, pattern in SENSITIVE_PATTERNS.items():
        content = re.sub(pattern, f"[REDACTED_{label}]", content)
    return content

def generate_payload():
    output_payload = []
    print("Scanning codebase for target files...")

    for root, dirs, files in os.walk('.'):
        # Skip completely non-essential or large compiled directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            _, ext = os.path.splitext(file)
            if ext in ALLOWED_EXTENSIONS and file != 'sanitize_and_payload.py':
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        raw_text = f.read()
                        clean_text = sanitize_content(raw_text)
                        
                        # Format the payload for Ox Alpha
                        output_payload.append(f"\n--- FILE: {file_path} ---")
                        output_payload.append(clean_text)
                except Exception as e:
                    print(f"Skipping {file_path} due to error: {e}")

    # Save the combined payload to a single text document
    with open('clean_codebase_payload.txt', 'w', encoding='utf-8') as out_f:
        out_f.write("\n".join(output_payload))
    
    print("\nSuccess! Your clean file is ready: 'clean_codebase_payload.txt'")
    print("You can safely upload or paste this file directly into Ox Alpha.")

if __name__ == '__main__':
    generate_payload()
