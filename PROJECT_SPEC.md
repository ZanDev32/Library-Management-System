# Library Management System — Universitas XYZ

## Background

The library at Universitas XYZ runs on paper. Borrow records live in ledgers and the occasional spreadsheet, so a student who wants to know whether a book is on the shelf has to walk to the front desk and ask. Librarians, meanwhile, lose hours each week copying lending data back and forth and chasing down books that were never returned. Nobody has a reliable picture of what's overdue.

We want to replace this with a single web application that the whole campus can use from a browser or a phone.

## What we're building

A web-based Library Management System. Students log in to search the catalog, request to borrow a book, and keep track of what they've borrowed and when it's due. Librarians log in to manage the collection, approve borrow requests, record returns, and watch a dashboard that tells them what needs attention — pending requests, active loans, and anything overdue.

There are two kinds of people who use the system. **Students** mostly read and request: they search, browse, borrow, and check their own history. **Librarians** do the heavy lifting: they own the catalog, decide who gets what, and keep the lending cycle honest.

## What it should do

The system should let users register and sign in securely. Students should be able to search the catalog by title, author, or ISBN and immediately see what's available. When they find a book they want, they should be able to request it, and a librarian should be able to approve or reject that request. When the book comes back, the librarian records the return and the catalog updates itself. If a book is late, both the student and the librarians should be told about it. On top of all that, librarians get a dashboard that pulls everything together, and the tools to add, edit, and remove books as the collection changes.

## What we're deliberately leaving out

We are not building online fine payment — the system will track who owes what, but money is handled elsewhere. We are not doing inter-library loans with other universities, and we are not delivering e-books or any digital content. There is no native mobile app; the web app will simply be responsive enough to work well on a phone.

## How we'll build it

The backend will be a FastAPI service in Python, talking to a PostgreSQL database. The frontend will be a React application. Everything runs in Docker so it deploys cleanly onto the university's existing servers.

A few things matter beyond the features themselves: the app needs to feel fast (pages and searches under two seconds), it needs to be secure (login and permissions enforced with JWT), and it needs to work on whatever screen a student happens to be holding.

---

*This is the human-written project brief — the "before" document. The structured, ID-tagged version used for planning lives in `.planning/PROJECT.md`.*
