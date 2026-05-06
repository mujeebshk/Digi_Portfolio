"""
Python companion for assets/js/app.js.

The JavaScript file still controls the browser UI. This module mirrors the
same portfolio rules in Python so the project also has a backend-friendly,
testable representation of section switching, hash routing, mobile drawer
state, contact validation, and local static serving.
"""

from __future__ import annotations

from dataclasses import dataclass
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import json
import os
import re
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[2]
VALID_SECTIONS = ("intro", "education", "interests", "projects", "goals", "contact")
FORM_ENDPOINT = "https://formspree.io/f/mlgaazdv"
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


@dataclass(frozen=True)
class ContactMessage:
    """Validated contact form payload matching the browser form fields."""

    name: str
    email: str
    message: str

    @classmethod
    def from_values(cls, name: str, email: str, message: str) -> "ContactMessage":
        payload = cls(name=name.strip(), email=email.strip(), message=message.strip())
        errors = payload.validation_errors()
        if errors:
            raise ValueError("; ".join(errors))
        return payload

    def validation_errors(self) -> list[str]:
        errors: list[str] = []
        if not self.name or not self.email or not self.message:
            errors.append("Please fill in all fields.")
        if self.email and not EMAIL_RE.fullmatch(self.email):
            errors.append("Please enter a valid email address.")
        return errors

    def to_formspree_payload(self) -> dict[str, str]:
        return {
            "name": self.name,
            "email": self.email,
            "message": self.message,
            "_subject": f"New Message from {self.name} (Portfolio)",
        }


@dataclass
class PortfolioState:
    """Small state machine equivalent to the app.js UI controller."""

    sections: tuple[str, ...] = VALID_SECTIONS
    active_section: str = "intro"
    drawer_open: bool = False
    is_mobile: bool = False

    def activate_section(self, section_id: str) -> str:
        if section_id not in self.sections:
            raise ValueError(f"Unknown section: {section_id}")
        self.active_section = section_id
        if self.is_mobile:
            self.close_mobile_drawer()
        return self.hash

    def open_mobile_drawer(self) -> None:
        self.drawer_open = True

    def close_mobile_drawer(self) -> None:
        self.drawer_open = False

    def toggle_mobile_drawer(self) -> bool:
        self.drawer_open = not self.drawer_open
        return self.drawer_open

    def load_section_from_hash(self, hash_value: str) -> str:
        section_id = hash_value.lstrip("#")
        if section_id in self.sections:
            return self.activate_section(section_id)
        return self.hash

    def nav_buttons(self) -> list[dict[str, str | bool]]:
        return [
            {
                "section": section,
                "active": section == self.active_section,
                "aria_selected": "true" if section == self.active_section else "false",
            }
            for section in self.sections
        ]

    @property
    def hash(self) -> str:
        return f"#{self.active_section}"


def validate_email(email: str) -> bool:
    return EMAIL_RE.fullmatch(email.strip()) is not None


def contact_status(name: str, email: str, message: str) -> tuple[bool, str]:
    try:
        ContactMessage.from_values(name, email, message)
    except ValueError as exc:
        return False, str(exc)
    return True, "Message is ready to send."


class PortfolioRequestHandler(SimpleHTTPRequestHandler):
    """Static server with a tiny JSON contact-validation endpoint."""

    def __init__(self, *args, directory: str | None = None, **kwargs) -> None:
        super().__init__(*args, directory=directory or str(PROJECT_ROOT), **kwargs)

    def do_POST(self) -> None:
        if self.path != "/api/contact/validate":
            self.send_error(404, "Endpoint not found")
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length)
        try:
            body = json.loads(raw_body or b"{}")
            message = ContactMessage.from_values(
                str(body.get("name", "")),
                str(body.get("email", "")),
                str(body.get("message", "")),
            )
        except (json.JSONDecodeError, ValueError) as exc:
            self._send_json({"ok": False, "status": str(exc)}, status=400)
            return

        self._send_json(
            {
                "ok": True,
                "status": "Message is valid.",
                "formspree_endpoint": FORM_ENDPOINT,
                "payload": message.to_formspree_payload(),
            }
        )

    def _send_json(self, payload: dict[str, object], status: int = 200) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def run_server(port: int = 3000, host: str = "127.0.0.1") -> None:
    os.chdir(PROJECT_ROOT)
    server = ThreadingHTTPServer((host, port), PortfolioRequestHandler)
    print(f"Serving portfolio at http://{host}:{port}")
    print("Contact validation endpoint: /api/contact/validate")
    server.serve_forever()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Python companion for app.js")
    subparsers = parser.add_subparsers(dest="command")

    server_parser = subparsers.add_parser("serve", help="Serve the portfolio locally")
    server_parser.add_argument("--host", default="127.0.0.1")
    server_parser.add_argument("--port", default=3000, type=int)

    state_parser = subparsers.add_parser("state", help="Show section/navigation state")
    state_parser.add_argument("section", nargs="?", default="intro")
    state_parser.add_argument("--mobile", action="store_true")

    validate_parser = subparsers.add_parser("validate-contact", help="Validate contact data")
    validate_parser.add_argument("--name", required=True)
    validate_parser.add_argument("--email", required=True)
    validate_parser.add_argument("--message", required=True)

    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "serve":
        run_server(port=args.port, host=args.host)
        return 0

    if args.command == "state":
        state = PortfolioState(is_mobile=args.mobile)
        try:
            state.activate_section(args.section)
        except ValueError as exc:
            parser.error(str(exc))
        print(json.dumps({"hash": state.hash, "nav": state.nav_buttons()}, indent=2))
        return 0

    if args.command == "validate-contact":
        ok, status = contact_status(args.name, args.email, args.message)
        print(json.dumps({"ok": ok, "status": status}, indent=2))
        return 0 if ok else 1

    parser.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
