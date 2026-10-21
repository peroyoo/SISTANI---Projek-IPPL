from datetime import datetime, timezone


def sekarang() -> datetime:
    return datetime.now(timezone.utc)


def ke_aware(dt: datetime | None) -> datetime | None:
    """SQLite mengembalikan waktu tanpa zona; anggap UTC supaya bisa dibandingkan."""
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
