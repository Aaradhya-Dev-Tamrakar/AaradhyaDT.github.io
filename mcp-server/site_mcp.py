#!/usr/bin/env python3
"""
site_mcp.py — Model Context Protocol (MCP) Server for Aaradhya-Dev-Tamrakar.github.io

Exposes site resources, developer tools, knowledge graph insights, and automation tools
to AI assistants (Antigravity IDE, Claude Desktop, Cursor, Gemini) via MCP stdio JSON-RPC 2.0 protocol.

Resources exposed:
- site://projects      : Parsed portfolio project entries
- site://achievements  : Certifications, badges, and verification links
- site://tracker       : Portfolio tracker release history & state of play
- site://graph         : Codebase knowledge graph analysis (God nodes, communities)
- site://health        : Structural verification status (24 check categories)
- site://stats         : Structured site metrics and telemetry

Tools exposed:
- run_verification     : Executes verify.py suite
- rebuild_search_index : Regenerates CMDK static search index
- update_knowledge_graph: Updates AST knowledge graph (graphify)
- sync_site_metadata   : Updates Service Worker cache and sitemap timestamps
- update_dev_tracker   : Appends new release notes to PortfolioWebsite_TRACKER.md
- get_site_telemetry   : Returns live site statistics

Standard Usage:
  python mcp-server/site_mcp.py
"""

import importlib.util
import json
import os
import re
import sys
from pathlib import Path

# Resolve absolute root and scripts paths relative to this file
ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = ROOT / "scripts"
SITE_AUTO_PATH = SCRIPTS_DIR / "site_automation.py"

site_automation = None
if SITE_AUTO_PATH.exists():
    try:
        spec = importlib.util.spec_from_file_location("site_automation", str(SITE_AUTO_PATH))
        if spec and spec.loader:
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            site_automation = mod
    except Exception as e:
        sys.stderr.write(f"Warning: Failed loading site_automation directly: {e}\n")

if site_automation is None:
    if str(SCRIPTS_DIR) not in sys.path:
        sys.path.insert(0, str(SCRIPTS_DIR))
    try:
        import site_automation
    except ImportError:
        site_automation = None

manage_payloads = None
PAYLOADS_PATH = SCRIPTS_DIR / "manage_payloads.py"
if PAYLOADS_PATH.exists():
    try:
        spec_p = importlib.util.spec_from_file_location("manage_payloads", str(PAYLOADS_PATH))
        if spec_p and spec_p.loader:
            mod_p = importlib.util.module_from_spec(spec_p)
            spec_p.loader.exec_module(mod_p)
            manage_payloads = mod_p
    except Exception as e:
        sys.stderr.write(f"Warning: Failed loading manage_payloads directly: {e}\n")

if manage_payloads is None:
    if str(SCRIPTS_DIR) not in sys.path:
        sys.path.insert(0, str(SCRIPTS_DIR))
    try:
        import manage_payloads
    except ImportError:
        manage_payloads = None

# MCP Server Metadata
SERVER_NAME = "site-mcp"
SERVER_VERSION = "1.0.0"

# Resources definitions
RESOURCES = [
    {
        "uri": "site://projects",
        "name": "Portfolio Projects",
        "description": "Parsed list of portfolio projects, tags, links, and categories.",
        "mimeType": "application/json"
    },
    {
        "uri": "site://achievements",
        "name": "Certifications & Achievements",
        "description": "List of verified achievements, certificates, badges, and download URLs.",
        "mimeType": "application/json"
    },
    {
        "uri": "site://tracker",
        "name": "Portfolio Dev Tracker",
        "description": "Release history, state of play, and open items from PortfolioWebsite_TRACKER.md.",
        "mimeType": "text/markdown"
    },
    {
        "uri": "site://graph",
        "name": "Codebase Knowledge Graph",
        "description": "AST knowledge graph report, god nodes, and community structures.",
        "mimeType": "text/markdown"
    },
    {
        "uri": "site://health",
        "name": "Verification Health Check",
        "description": "Live status of the 24-category diagnostic verification suite.",
        "mimeType": "application/json"
    },
    {
        "uri": "site://stats",
        "name": "Site Telemetry & Metrics",
        "description": "Live counts of HTML pages, projects, achievements, service worker version, and graph metrics.",
        "mimeType": "application/json"
    },
    {
        "uri": "site://payloads",
        "name": "Encrypted Access Control Payloads",
        "description": "Decrypted overview of all VIP and Master payloads from access.js.",
        "mimeType": "application/json"
    }
]

# Tools definitions
TOOLS = [
    {
        "name": "run_verification",
        "description": "Executes the 24-category site verification suite (scripts/verify.py).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "verbose": {
                    "type": "boolean",
                    "description": "Include passing checks in output"
                }
            }
        }
    },
    {
        "name": "rebuild_search_index",
        "description": "Regenerates the static search index in assets/js/modules/cmdk.js using extract_index.py.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "update_knowledge_graph",
        "description": "Updates the codebase AST knowledge graph via graphify update .",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "sync_site_metadata",
        "description": "Syncs Service Worker cache version tag and updates sitemap.xml timestamps.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "version": {
                    "type": "string",
                    "description": "Version string e.g. v47"
                }
            },
            "required": ["version"]
        }
    },
    {
        "name": "update_dev_tracker",
        "description": "Appends a new release version item to dev-logs/PortfolioWebsite_TRACKER.md.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "version": {
                    "type": "string",
                    "description": "Version string (e.g. v47)"
                },
                "title": {
                    "type": "string",
                    "description": "Title of release"
                },
                "highlights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of key features or bug fixes shipped"
                }
            },
            "required": ["version", "title", "highlights"]
        }
    },
    {
        "name": "get_site_telemetry",
        "description": "Returns current site metrics, total pages, SW cache version, graph nodes, and card counts.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "list_encrypted_payloads",
        "description": "Lists all 25 encrypted payload keys in access.js with their tier, character length, and preview.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "read_encrypted_payload",
        "description": "Decrypts and returns the plaintext content of an encrypted payload in access.js.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "description": "Payload key ID (e.g. 'index-vip', 'proj-gcsbr', 'index-master')"
                },
                "passcode": {
                    "type": "string",
                    "description": "Optional passcode override (defaults to 'vip2026' or 'master2026')"
                }
            },
            "required": ["key"]
        }
    },
    {
        "name": "write_encrypted_payload",
        "description": "Encrypts a plaintext string and updates the payload in access.js.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "description": "Payload key ID (e.g. 'index-vip', 'proj-gcsbr')"
                },
                "content": {
                    "type": "string",
                    "description": "Plaintext content to encrypt and store"
                },
                "passcode": {
                    "type": "string",
                    "description": "Optional passcode override"
                }
            },
            "required": ["key", "content"]
        }
    },
    {
        "name": "verify_encrypted_payloads",
        "description": "Tests decryption across all payloads in access.js to guarantee cryptographic integrity.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    }
]

# Prompts definitions
PROMPTS = [
    {
        "name": "draft-release-notes",
        "description": "Generate standard release notes formatted for PortfolioWebsite_TRACKER.md.",
        "arguments": [
            {
                "name": "version",
                "description": "Target version string e.g. v47",
                "required": True
            },
            {
                "name": "changes",
                "description": "Summary of changes made",
                "required": True
            }
        ]
    },
    {
        "name": "audit-seo-metadata",
        "description": "Review and verify SEO tags, JSON-LD schemas, and OpenGraph metadata across site pages.",
        "arguments": []
    }
]


def handle_resource_read(uri):
    """Fetches resource content based on URI."""
    if uri == "site://stats":
        stats = site_automation.get_site_stats() if site_automation else {}
        return json.dumps(stats, indent=2), "application/json"

    elif uri == "site://health":
        health = site_automation.audit() if site_automation else {}
        return json.dumps(health, indent=2), "application/json"

    elif uri == "site://tracker":
        tracker_path = ROOT / "dev-logs" / "PortfolioWebsite_TRACKER.md"
        content = tracker_path.read_text(encoding="utf-8") if tracker_path.exists() else "Tracker not found."
        return content, "text/markdown"

    elif uri == "site://graph":
        graph_path = ROOT / "graphify-out" / "GRAPH_REPORT.md"
        content = graph_path.read_text(encoding="utf-8") if graph_path.exists() else "Graph report not found."
        return content, "text/markdown"

    elif uri == "site://projects":
        proj_path = ROOT / "projects.html"
        content = proj_path.read_text(encoding="utf-8") if proj_path.exists() else ""
        cards = []
        for match in re.finditer(r'<h3[^>]*class="[^"]*project-title[^"]*"[^>]*>(.*?)</h3>', content, re.DOTALL):
            title = re.sub(r'<[^>]+>', '', match.group(1)).strip()
            cards.append({"title": title})
        return json.dumps({"count": len(cards), "projects": cards}, indent=2), "application/json"

    elif uri == "site://achievements":
        ach_path = ROOT / "achievements.html"
        content = ach_path.read_text(encoding="utf-8") if ach_path.exists() else ""
        certs = []
        for match in re.finditer(r'<h3[^>]*class="[^"]*achievement-title[^"]*"[^>]*>(.*?)</h3>', content, re.DOTALL):
            title = re.sub(r'<[^>]+>', '', match.group(1)).strip()
            certs.append({"title": title})
        return json.dumps({"count": len(certs), "achievements": certs}, indent=2), "application/json"

    elif uri == "site://payloads":
        if not manage_payloads:
            return json.dumps({"error": "manage_payloads module unavailable"}, indent=2), "application/json"
        payloads = manage_payloads.read_access_payloads()
        out = {}
        for key, hex_str in payloads.items():
            code = manage_payloads.get_default_passcode_for_key(key)
            try:
                out[key] = {
                    "tier": "master" if key in manage_payloads.KNOWN_MASTER_KEYS else "vip",
                    "content": manage_payloads.decrypt_payload(hex_str, code)
                }
            except Exception as e:
                out[key] = {"error": str(e), "raw_hex": hex_str}
        return json.dumps(out, indent=2), "application/json"

    else:
        return None, None


def handle_tool_call(name, args):
    """Executes requested tool and returns output."""
    if name == "run_verification":
        verbose = args.get("verbose", False)
        res = site_automation.audit(verbose=verbose) if site_automation else {"error": "Automation module unavailable"}
        return json.dumps(res, indent=2)

    elif name == "rebuild_search_index":
        res = site_automation.rebuild_search_index() if site_automation else {"error": "Automation module unavailable"}
        return json.dumps(res, indent=2)

    elif name == "update_knowledge_graph":
        res = site_automation.update_knowledge_graph() if site_automation else {"error": "Automation module unavailable"}
        return json.dumps(res, indent=2)

    elif name == "sync_site_metadata":
        version = args.get("version", "")
        res = site_automation.sync_metadata(version) if site_automation else {"error": "Automation module unavailable"}
        return json.dumps(res, indent=2)

    elif name == "update_dev_tracker":
        version = args.get("version", "")
        title = args.get("title", "")
        highlights = args.get("highlights", [])
        res = site_automation.update_tracker(version, title, highlights) if site_automation else {"error": "Automation module unavailable"}
        return json.dumps(res, indent=2)

    elif name == "get_site_telemetry":
        res = site_automation.get_site_stats() if site_automation else {"error": "Automation module unavailable"}
        return json.dumps(res, indent=2)

    elif name == "list_encrypted_payloads":
        if not manage_payloads:
            return json.dumps({"error": "manage_payloads module unavailable"}, indent=2)
        payloads = manage_payloads.read_access_payloads()
        result = []
        for key, hex_str in payloads.items():
            code = manage_payloads.get_default_passcode_for_key(key)
            tier = "master" if key in manage_payloads.KNOWN_MASTER_KEYS else "vip"
            try:
                dec = manage_payloads.decrypt_payload(hex_str, code)
                preview = dec.replace("\n", " ").strip()[:60]
                status = "ok"
            except Exception as e:
                preview = str(e)
                status = "decrypt_failed"
            result.append({"key": key, "tier": tier, "length": len(hex_str), "status": status, "preview": preview})
        return json.dumps(result, indent=2)

    elif name == "read_encrypted_payload":
        if not manage_payloads:
            return json.dumps({"error": "manage_payloads module unavailable"}, indent=2)
        key = args.get("key")
        code = args.get("passcode") or manage_payloads.get_default_passcode_for_key(key)
        payloads = manage_payloads.read_access_payloads()
        if key not in payloads:
            return json.dumps({"error": f"Payload key '{key}' not found"}, indent=2)
        try:
            content = manage_payloads.decrypt_payload(payloads[key], code)
            return json.dumps({"key": key, "content": content}, indent=2)
        except Exception as e:
            return json.dumps({"error": f"Decryption failed: {e}"}, indent=2)

    elif name == "write_encrypted_payload":
        if not manage_payloads:
            return json.dumps({"error": "manage_payloads module unavailable"}, indent=2)
        key = args.get("key")
        content = args.get("content")
        code = args.get("passcode") or manage_payloads.get_default_passcode_for_key(key)
        payloads = manage_payloads.read_access_payloads()
        new_hex = manage_payloads.encrypt_payload(content, code)
        payloads[key] = new_hex
        manage_payloads.write_access_payloads(payloads)
        return json.dumps({"status": "success", "key": key, "hex_length": len(new_hex)}, indent=2)

    elif name == "verify_encrypted_payloads":
        if not manage_payloads:
            return json.dumps({"error": "manage_payloads module unavailable"}, indent=2)
        payloads = manage_payloads.read_access_payloads()
        verified = 0
        failed = []
        for key, hex_str in payloads.items():
            code = manage_payloads.get_default_passcode_for_key(key)
            try:
                dec = manage_payloads.decrypt_payload(hex_str, code)
                if dec:
                    verified += 1
                else:
                    failed.append(key)
            except Exception:
                failed.append(key)
        return json.dumps({"total": len(payloads), "verified": verified, "failed": failed}, indent=2)

    else:
        return None


def process_request(request):
    """Routes JSON-RPC request to appropriate handler."""
    method = request.get("method")
    req_id = request.get("id")
    params = request.get("params", {})

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "resources": {},
                    "tools": {},
                    "prompts": {}
                },
                "serverInfo": {
                    "name": SERVER_NAME,
                    "version": SERVER_VERSION
                }
            }
        }

    elif method == "notifications/initialized":
        return None  # Notifications do not return a response

    elif method == "ping":
        return {"jsonrpc": "2.0", "id": req_id, "result": {}}

    elif method == "resources/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"resources": RESOURCES}
        }

    elif method == "resources/read":
        uri = params.get("uri", "")
        content, mime = handle_resource_read(uri)
        if content is None:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32602,
                    "message": f"Resource URI '{uri}' not found"
                }
            }
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "contents": [
                    {
                        "uri": uri,
                        "mimeType": mime,
                        "text": content
                    }
                ]
            }
        }

    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"tools": TOOLS}
        }

    elif method == "tools/call":
        tool_name = params.get("name")
        arguments = params.get("arguments", {})
        tool_def = next((t for t in TOOLS if t["name"] == tool_name), None)
        if not tool_def:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32601,
                    "message": f"Tool '{tool_name}' not found"
                }
            }
        required = tool_def.get("inputSchema", {}).get("required", [])
        missing = [r for r in required if r not in arguments]
        if missing:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32602,
                    "message": f"Missing required argument(s): {', '.join(missing)}"
                }
            }
        result_text = handle_tool_call(tool_name, arguments)
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "content": [
                    {
                        "type": "text",
                        "text": result_text
                    }
                ]
            }
        }

    elif method == "prompts/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"prompts": PROMPTS}
        }

    elif method == "prompts/get":
        prompt_name = params.get("name")
        if prompt_name == "draft-release-notes":
            v = params.get("arguments", {}).get("version", "v47")
            c = params.get("arguments", {}).get("changes", "Details of update")
            prompt_text = f"Draft a detailed release note for {v} covering:\n{c}\nFormat as standard PortfolioWebsite_TRACKER.md entry."
        elif prompt_name == "audit-seo-metadata":
            prompt_text = "Perform SEO and structured metadata audit across HTML files."
        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32602,
                    "message": f"Prompt '{prompt_name}' not found"
                }
            }
            
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "messages": [
                    {
                        "role": "user",
                        "content": {"type": "text", "text": prompt_text}
                    }
                ]
            }
        }

    else:
        if req_id is not None:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32601,
                    "message": f"Method '{method}' not found"
                }
            }
        return None


def run_stdio_server():
    """Reads JSON-RPC messages from stdin and writes responses to stdout."""
    # Ensure stdout/stdin are UTF-8 encoded
    if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
            sys.stdin.reconfigure(encoding='utf-8', errors='replace')
        except AttributeError:
            pass

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
            response = process_request(request)
            if response is not None:
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
        except json.JSONDecodeError:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": "Parse error"}
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()
        except Exception as e:
            req_id = request.get("id") if (request and isinstance(request, dict)) else None
            err_resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32603, "message": f"Internal error: {str(e)}"}
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    run_stdio_server()
