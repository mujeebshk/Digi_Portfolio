"""
Python companion for assets/js/resume-viewer.js.

The browser modal uses PDF.js for rendering. This module provides equivalent
resume-file state, page navigation, metadata inspection, and download-copy
behavior using only Python's standard library.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import argparse
import re
import shutil
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_RESUME = PROJECT_ROOT / "assets" / "resume.pdf"
DEFAULT_DOWNLOAD_NAME = "Shaik_Mujeeb_Software-Dev_Resume.pdf"


def _count_pdf_pages(pdf_path: Path) -> int:
    data = pdf_path.read_bytes()
    matches = re.findall(rb"/Type\s*/Page\b", data)
    return len(matches)


@dataclass
class ResumeViewer:
    """Server-side model of the resume viewer controls."""

    pdf_path: Path = DEFAULT_RESUME
    current_page: int = 1
    total_pages: int = 0
    is_open: bool = False

    def load_pdf(self) -> int:
        self.pdf_path = self.pdf_path.resolve()
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"Resume PDF not found: {self.pdf_path}")
        self.total_pages = _count_pdf_pages(self.pdf_path)
        if self.total_pages < 1:
            raise ValueError(f"No pages found in PDF: {self.pdf_path}")
        self.current_page = min(max(self.current_page, 1), self.total_pages)
        return self.total_pages

    def open_modal(self) -> None:
        self.is_open = True
        if self.total_pages == 0:
            self.load_pdf()

    def close_modal(self) -> None:
        self.is_open = False

    def go_to_page(self, page_number: int) -> int:
        if self.total_pages == 0:
            self.load_pdf()
        if page_number < 1 or page_number > self.total_pages:
            raise ValueError(f"Page must be between 1 and {self.total_pages}")
        self.current_page = page_number
        return self.current_page

    def previous_page(self) -> int:
        return self.go_to_page(max(1, self.current_page - 1))

    def next_page(self) -> int:
        if self.total_pages == 0:
            self.load_pdf()
        return self.go_to_page(min(self.total_pages, self.current_page + 1))

    def navigation_state(self) -> dict[str, int | bool]:
        if self.total_pages == 0:
            self.load_pdf()
        return {
            "current_page": self.current_page,
            "total_pages": self.total_pages,
            "has_previous": self.current_page > 1,
            "has_next": self.current_page < self.total_pages,
            "is_open": self.is_open,
        }

    def download_resume(self, destination_dir: Path | None = None) -> Path:
        if not self.pdf_path.exists():
            self.load_pdf()
        destination = (destination_dir or Path.cwd()) / DEFAULT_DOWNLOAD_NAME
        shutil.copy2(self.pdf_path, destination)
        return destination.resolve()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Python companion for resume-viewer.js")
    parser.add_argument("--pdf", default=str(DEFAULT_RESUME), help="Path to resume PDF")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("info", help="Show resume page/navigation state")

    page_parser = subparsers.add_parser("page", help="Validate and select a page")
    page_parser.add_argument("number", type=int)

    download_parser = subparsers.add_parser("download", help="Copy resume with download name")
    download_parser.add_argument("--to", default=".", help="Destination directory")

    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    viewer = ResumeViewer(pdf_path=Path(args.pdf))

    if args.command == "info":
        viewer.open_modal()
        print(viewer.navigation_state())
        return 0

    if args.command == "page":
        viewer.open_modal()
        viewer.go_to_page(args.number)
        print(viewer.navigation_state())
        return 0

    if args.command == "download":
        copied_to = viewer.download_resume(Path(args.to))
        print(copied_to)
        return 0

    parser.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
