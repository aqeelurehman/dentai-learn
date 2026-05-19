"""
ocr_extract.py — PaddleOCR-based PDF text extraction
Usage: python ocr_extract.py <path_to_pdf>
Outputs: JSON with extracted text to stdout
"""
import sys
import os
import io
import json
import tempfile
import logging
import warnings

# ── Force UTF-8 stdout on Windows (fixes charmap encoding errors) ────────────
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ── Silence ALL loggers before any imports pollute stdout/stderr ──────────────
logging.disable(logging.CRITICAL)
warnings.filterwarnings("ignore")
os.environ["GLOG_minloglevel"] = "3"          # PaddlePaddle C++ logs
os.environ["FLAGS_minloglevel"] = "3"
os.environ["PPOCR_LOG_LEVEL"] = "ERROR"
os.environ["KMP_WARNINGS"] = "0"

# Redirect both stderr AND stdout during imports to suppress model-download
# progress messages and PaddlePaddle banner. We capture our output at the end.
_real_stdout = sys.stdout
_real_stderr = sys.stderr
sys.stderr = open(os.devnull, "w")
sys.stdout = open(os.devnull, "w")


def extract_text(pdf_path):
    """Extract text from a PDF using PaddleOCR."""
    import fitz  # PyMuPDF
    from paddleocr import PaddleOCR

    # Restore stdout/stderr for our own output
    sys.stdout = _real_stdout
    sys.stderr = _real_stderr

    # Initialize PaddleOCR (English mode, no GPU for portability)
    ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False, use_gpu=False)

    doc = fitz.open(pdf_path)
    all_text = []

    for page_num in range(min(len(doc), 20)):  # Cap at 20 pages
        page = doc[page_num]

        # First try native text extraction (for text-based PDFs)
        native_text = page.get_text("text").strip()

        if len(native_text) > 50:
            # PDF has embedded text — use native extraction (faster, more accurate)
            all_text.append(native_text)
        else:
            # Scanned/image PDF — render to image and run OCR
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better OCR accuracy
            pix = page.get_pixmap(matrix=mat)

            # Save to temp image
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                pix.save(tmp.name)
                tmp_path = tmp.name

            try:
                result = ocr.ocr(tmp_path, cls=True)
                if result and result[0]:
                    page_lines = []
                    for line in result[0]:
                        if line and len(line) >= 2:
                            text = line[1][0] if isinstance(line[1], (list, tuple)) else str(line[1])
                            page_lines.append(text)
                    all_text.append("\n".join(page_lines))
            finally:
                os.unlink(tmp_path)

    doc.close()

    full_text = "\n\n".join(all_text)
    return full_text


def main():
    if len(sys.argv) < 2:
        # Restore stdout in case we hit this branch before extract_text()
        sys.stdout = _real_stdout
        print(json.dumps({"error": "Usage: python ocr_extract.py <pdf_path>"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        sys.stdout = _real_stdout
        print(json.dumps({"error": f"File not found: {pdf_path}"}))
        sys.exit(1)

    try:
        text = extract_text(pdf_path)
        # Return first 12000 chars (enough for AI analysis)
        result = {
            "text": text[:12000],
            "pages": len(text.split("\n\n")),
            "chars": len(text),
            "method": "paddleocr"
        }
        # Use ensure_ascii=True so Windows charmap encoding never fails
        print(json.dumps(result, ensure_ascii=True))
    except Exception as e:
        # Make sure stdout is restored even on error
        sys.stdout = _real_stdout
        print(json.dumps({"error": str(e)}, ensure_ascii=True))
        sys.exit(1)


if __name__ == "__main__":
    main()
