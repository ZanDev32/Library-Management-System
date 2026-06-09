"""Seed dummy books for development/demo."""

import random

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import Book

ADJECTIVES = [
    "Hidden", "Silent", "Broken", "Eternal", "Lost", "Golden", "Crimson",
    "Ancient", "Distant", "Sacred", "Forgotten", "Burning", "Frozen",
    "Secret", "Wandering", "Shattered", "Endless", "Whispering", "Rising",
    "Falling", "Midnight", "Crystal", "Shadow", "Iron", "Velvet",
]

NOUNS = [
    "Garden", "Empire", "River", "Mountain", "Promise", "Kingdom", "Storm",
    "Journey", "Mirror", "Throne", "Forest", "Ocean", "Star", "Dream",
    "Legacy", "Code", "Machine", "Algorithm", "Network", "Cipher",
    "Horizon", "Labyrinth", "Chronicle", "Prophecy", "Covenant",
]

SUBJECTS = [
    "of Time", "of the North", "and the Sea", "in Winter", "of Souls",
    "Reborn", "Unbound", "of Tomorrow", "of Glass", "of Ash", "of Light",
    "of the Damned", "of Echoes", "of the Fallen", "of Dawn",
]

FIRST_NAMES = [
    "Maya", "Liam", "Sofia", "Noah", "Aria", "Kai", "Elena", "Omar",
    "Ravi", "Yuki", "Ingrid", "Diego", "Amara", "Lukas", "Nadia",
    "Tariq", "Chloe", "Mateo", "Priya", "Hassan",
]

LAST_NAMES = [
    "Sato", "Okafor", "Nguyen", "Petrova", "Khan", "Andersson", "Silva",
    "Mwangi", "Kim", "Rossi", "Haddad", "Larsson", "Cohen", "Reyes",
    "Patel", "Dubois", "Novak", "Costa", "Bauer", "Ali",
]

PUBLISHERS = [
    "Penguin Press", "Oxford House", "Riverstone", "Nimbus Books",
    "Granite Hall", "Lighthouse Media", "Acacia Publishing",
    "Northwind Books", "Cedar & Co", "Vanguard Press",
]


def _make_isbn(seq: int) -> str:
    # Deterministic, unique 13-digit-ish ISBN string
    return f"978-{(seq // 1000) % 10}-{(seq // 100) % 100:02d}-{seq % 100000:05d}-{seq % 10}"


async def seed_books(db: AsyncSession, target: int = 1000) -> None:
    """Insert dummy books until the table reaches `target` rows."""
    count_result = await db.execute(select(func.count()).select_from(Book))
    existing = count_result.scalar_one()
    if existing >= target:
        return

    to_create = target - existing
    rng = random.Random(42)  # deterministic for reproducible demo data

    books: list[Book] = []
    for i in range(existing, existing + to_create):
        title_parts = [rng.choice(ADJECTIVES), rng.choice(NOUNS)]
        if rng.random() < 0.5:
            title_parts.append(rng.choice(SUBJECTS))
        title = "The " + " ".join(title_parts)
        author = f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)}"
        quantity = rng.randint(1, 10)
        books.append(
            Book(
                title=title,
                author=author,
                isbn=_make_isbn(i + 1),
                publisher=rng.choice(PUBLISHERS),
                year=rng.randint(1950, 2025),
                quantity=quantity,
                available_quantity=quantity,
            )
        )

    db.add_all(books)
    await db.commit()
    print(f"[seed] Inserted {to_create} dummy books (total target {target})")
