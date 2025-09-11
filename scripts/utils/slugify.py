import re

def slugify(s: str) -> str:
    """Convert a string to a URL-friendly slug."""
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')