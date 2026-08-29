#!/usr/bin/env python3
"""
manage_payloads.py — Developer & Agent Utility for Encrypted Sections (access.js)
Zero-leak AES-256-GCM encryption/decryption manager with PBKDF2 key derivation.

Usage:
  python scripts/manage_payloads.py list
  python scripts/manage_payloads.py get <key> [--passcode <code>]
  python scripts/manage_payloads.py set <key> --content "<text>" [--passcode <code>]
  python scripts/manage_payloads.py set <key> --file <path> [--passcode <code>]
  python scripts/manage_payloads.py export [--out <file.json>]
  python scripts/manage_payloads.py import --file <file.json>
  python scripts/manage_payloads.py verify
  python scripts/manage_payloads.py encrypt "<plaintext>" [--passcode <code>]
  python scripts/manage_payloads.py decrypt "<hex>" [--passcode <code>]
"""

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parent.parent
ACCESS_JS = ROOT / "assets" / "js" / "modules" / "access.js"

# Cryptography
SALT = b"adt_salt_2026"
ITERATIONS = 100000
KEY_LENGTH = 32

DEFAULT_PASSCODES = {
    "vip": "vip2026",
    "master": "master2026"
}

KNOWN_MASTER_KEYS = {"index-master", "proj-claude-desktop"}


def get_crypto_engine():
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        return AESGCM
    except ImportError:
        sys.stderr.write("Error: 'cryptography' package is required. Run: pip install cryptography\n")
        sys.exit(1)


def derive_key(passcode: str, salt: bytes = SALT, iterations: int = ITERATIONS) -> bytes:
    norm = (passcode or "").strip().lower().encode("utf-8")
    return hashlib.pbkdf2_hmac("sha256", norm, salt, iterations, KEY_LENGTH)


def encrypt_payload(plain_text: str, passcode: str) -> str:
    AESGCM = get_crypto_engine()
    key = derive_key(passcode)
    aesgcm = AESGCM(key)
    iv = os.urandom(12)
    # Encrypt: AESGCM produces ciphertext + 16-byte tag
    ciphertext_with_tag = aesgcm.encrypt(iv, plain_text.encode("utf-8"), None)
    ciphertext = ciphertext_with_tag[:-16]
    tag = ciphertext_with_tag[-16:]

    # Layout expected by access.js: IV (12B) + Tag (16B) + Ciphertext
    out_bytes = iv + tag + ciphertext
    return out_bytes.hex()


def decrypt_payload(hex_str: str, passcode: str) -> str:
    AESGCM = get_crypto_engine()
    raw = bytes.fromhex(hex_str.strip())
    if len(raw) < 28:
        raise ValueError("Invalid payload: shorter than minimum IV + Tag header length (28 bytes)")

    iv = raw[:12]
    tag = raw[12:28]
    ciphertext = raw[28:]

    key = derive_key(passcode)
    aesgcm = AESGCM(key)
    # AESGCM expects ciphertext + tag
    data = aesgcm.decrypt(iv, ciphertext + tag, None)
    return data.decode("utf-8")


def read_access_payloads() -> dict:
    if not ACCESS_JS.exists():
        raise FileNotFoundError(f"access.js not found at {ACCESS_JS}")

    content = ACCESS_JS.read_text(encoding="utf-8")
    m = re.search(r"const ACCESS_CONTROL_PAYLOADS = (\{[\s\S]*?\n\};)", content)
    if not m:
        raise ValueError("Could not find ACCESS_CONTROL_PAYLOADS declaration in access.js")

    # Clean JSON-like object string
    raw_dict_str = m.group(1).rstrip(";")
    # Strip trailing commas if any
    cleaned = re.sub(r",\s*([\}\]])", r"\1", raw_dict_str)
    # Strip inline comments
    cleaned = re.sub(r"//.*", "", cleaned)
    return json.loads(cleaned)


def write_access_payloads(payloads: dict) -> None:
    content = ACCESS_JS.read_text(encoding="utf-8")
    formatted = json.dumps(payloads, indent=2)
    replacement = f"const ACCESS_CONTROL_PAYLOADS = {formatted};"
    new_content = re.sub(
        r"const ACCESS_CONTROL_PAYLOADS = \{[\s\S]*?\n\};",
        replacement,
        content
    )
    ACCESS_JS.write_text(new_content, encoding="utf-8")


def get_default_passcode_for_key(key: str) -> str:
    return DEFAULT_PASSCODES["master"] if key in KNOWN_MASTER_KEYS else DEFAULT_PASSCODES["vip"]


def cmd_list():
    payloads = read_access_payloads()
    print(f"\nFound {len(payloads)} encrypted payloads in {ACCESS_JS.name}:\n")
    print(f"  {'KEY':<22s} {'TIER':<8s} {'CHARS':<8s} {'PREVIEW'}")
    print("  " + "-" * 75)

    for key, hex_str in payloads.items():
        passcode = get_default_passcode_for_key(key)
        tier = "MASTER" if key in KNOWN_MASTER_KEYS else "VIP"
        try:
            decrypted = decrypt_payload(hex_str, passcode)
            preview = decrypted.replace("\n", " ").strip()
            if len(preview) > 42:
                preview = preview[:39] + "..."
            status = preview
        except Exception as e:
            status = f"[DECRYPT FAILED: {e}]"

        print(f"  {key:<22s} {tier:<8s} {len(hex_str):<8d} {status}")
    print()


def cmd_get(key: str, passcode: str = None):
    payloads = read_access_payloads()
    if key not in payloads:
        print(f"Error: Payload key '{key}' not found.", file=sys.stderr)
        sys.exit(1)

    code = passcode or get_default_passcode_for_key(key)
    try:
        dec = decrypt_payload(payloads[key], code)
        print(dec)
    except Exception as e:
        print(f"Decryption failed: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_set(key: str, content: str, passcode: str = None):
    payloads = read_access_payloads()
    code = passcode or get_default_passcode_for_key(key)
    new_hex = encrypt_payload(content, code)
    payloads[key] = new_hex
    write_access_payloads(payloads)
    print(f"Successfully updated and re-encrypted '{key}' ({len(content)} chars -> {len(new_hex)} hex bytes) in access.js.")


def cmd_export(out_file: Path):
    payloads = read_access_payloads()
    exported = {}
    for key, hex_str in payloads.items():
        code = get_default_passcode_for_key(key)
        try:
            exported[key] = {
                "tier": "master" if key in KNOWN_MASTER_KEYS else "vip",
                "content": decrypt_payload(hex_str, code)
            }
        except Exception as e:
            exported[key] = {"error": str(e), "raw_hex": hex_str}

    out_file.write_text(json.dumps(exported, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Exported {len(payloads)} decrypted payloads to {out_file}.")


def cmd_import(in_file: Path):
    if not in_file.exists():
        print(f"Error: File '{in_file}' not found.", file=sys.stderr)
        sys.exit(1)

    data = json.loads(in_file.read_text(encoding="utf-8"))
    payloads = read_access_payloads()
    updated = 0

    for key, val in data.items():
        if isinstance(val, dict) and "content" in val:
            content = val["content"]
            tier = val.get("tier", "vip")
            code = DEFAULT_PASSCODES.get(tier, DEFAULT_PASSCODES["vip"])
            payloads[key] = encrypt_payload(content, code)
            updated += 1
        elif isinstance(val, str):
            code = get_default_passcode_for_key(key)
            payloads[key] = encrypt_payload(val, code)
            updated += 1

    write_access_payloads(payloads)
    print(f"Successfully imported and re-encrypted {updated} payloads into access.js.")


def cmd_verify():
    payloads = read_access_payloads()
    all_ok = True
    print(f"Verifying {len(payloads)} payloads in access.js...")

    for key, hex_str in payloads.items():
        code = get_default_passcode_for_key(key)
        try:
            dec = decrypt_payload(hex_str, code)
            if not dec:
                print(f"  [FAIL] {key}: Empty decrypted string")
                all_ok = False
            else:
                print(f"  [PASS] {key} ({len(dec)} chars)")
        except Exception as e:
            print(f"  [FAIL] {key}: Decryption failed ({e})")
            all_ok = False

    if all_ok:
        print("\nAll encrypted payloads verified successfully.")
        sys.exit(0)
    else:
        print("\nSome payloads failed decryption.", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Encrypted Payload Manager for access.js")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # list
    subparsers.add_parser("list", help="List all payloads with decrypted preview")

    # get
    p_get = subparsers.add_parser("get", help="Print decrypted plaintext of a payload")
    p_get.add_argument("key", help="Payload ID (e.g. index-vip, proj-spark)")
    p_get.add_argument("--passcode", "-p", help="Passcode override")

    # set
    p_set = subparsers.add_parser("set", help="Encrypt and update a payload in access.js")
    p_set.add_argument("key", help="Payload ID")
    p_set.add_argument("--content", "-c", help="Plaintext string content")
    p_set.add_argument("--file", "-f", type=Path, help="File containing plaintext content")
    p_set.add_argument("--passcode", "-p", help="Passcode override")

    # export
    p_export = subparsers.add_parser("export", help="Export all decrypted payloads to JSON")
    p_export.add_argument("--out", "-o", type=Path, default=ROOT / "dev-logs" / "payloads_plaintext.json")

    # import
    p_import = subparsers.add_parser("import", help="Import & re-encrypt payloads from JSON")
    p_import.add_argument("--file", "-f", type=Path, required=True)

    # verify
    subparsers.add_parser("verify", help="Verify decryption of all payloads")

    # encrypt / decrypt
    p_enc = subparsers.add_parser("encrypt", help="Encrypt a plaintext string")
    p_enc.add_argument("text", help="Plaintext to encrypt")
    p_enc.add_argument("--passcode", "-p", default="vip2026")

    p_dec = subparsers.add_parser("decrypt", help="Decrypt a hex payload string")
    p_dec.add_argument("hex", help="Hex string")
    p_dec.add_argument("--passcode", "-p", default="vip2026")

    args = parser.parse_args()

    if args.command == "list":
        cmd_list()
    elif args.command == "get":
        cmd_get(args.key, args.passcode)
    elif args.command == "set":
        content = args.content
        if args.file:
            content = args.file.read_text(encoding="utf-8")
        if content is None:
            print("Error: Specify either --content or --file", file=sys.stderr)
            sys.exit(1)
        cmd_set(args.key, content, args.passcode)
    elif args.command == "export":
        cmd_export(args.out)
    elif args.command == "import":
        cmd_import(args.file)
    elif args.command == "verify":
        cmd_verify()
    elif args.command == "encrypt":
        print(encrypt_payload(args.text, args.passcode))
    elif args.command == "decrypt":
        print(decrypt_payload(args.hex, args.passcode))


if __name__ == "__main__":
    main()

