#!/usr/bin/env python3
"""
Generate Ayush_Panda_Complete_Guide_TUF+_July2026_Dec2026.pdf
Updated Complete Interview Readiness Planner aligned to TUF+ (435) + FAANG OA Gap Pack (45) = 480.
"""
from __future__ import annotations

import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    ListFlowable,
    ListItem,
)

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
OUT = Path(r"C:\Users\panda\Desktop\Interview-Guider") / "Ayush_Panda_Complete_Guide_TUF+_July2026_Dec2026.pdf"

# Colors matching a clean planner look
NAVY = colors.HexColor("#1B2A4A")
ACCENT = colors.HexColor("#C45C26")
CREAM = colors.HexColor("#F7F1E8")
SOFT = colors.HexColor("#E8DFD0")
GREEN = colors.HexColor("#2A9D8F")
MUTED = colors.HexColor("#5C5C5C")
WHITE = colors.white
BLACK = colors.HexColor("#1A1A1A")


def load_weeks():
    """Import week definitions from generate-planner.js via the generated JSON."""
    tasks = json.loads((DATA / "daily-tasks.json").read_text(encoding="utf-8"))
    cps = json.loads((DATA / "checkpoints.json").read_text(encoding="utf-8"))
    topics = json.loads((DATA / "tuf-topics.json").read_text(encoding="utf-8"))
    # Group tasks by week (exclude Dec buffer weeks 19-20 for main planner display separately)
    by_week = {}
    for t in tasks:
        w = t["weekNumber"]
        by_week.setdefault(w, []).append(t)
    return by_week, cps, topics


def styles():
    base = getSampleStyleSheet()
    s = {
        "cover_title": ParagraphStyle(
            "cover_title", parent=base["Title"], fontName="Helvetica-Bold",
            fontSize=22, textColor=NAVY, alignment=TA_CENTER, spaceAfter=6, leading=26
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub", parent=base["Normal"], fontName="Helvetica",
            fontSize=11, textColor=MUTED, alignment=TA_CENTER, spaceAfter=4, leading=14
        ),
        "h1": ParagraphStyle(
            "h1", parent=base["Heading1"], fontName="Helvetica-Bold",
            fontSize=14, textColor=NAVY, spaceBefore=10, spaceAfter=8, leading=18
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], fontName="Helvetica-Bold",
            fontSize=11, textColor=ACCENT, spaceBefore=8, spaceAfter=4, leading=14
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"], fontName="Helvetica",
            fontSize=9, textColor=BLACK, leading=12, spaceAfter=3
        ),
        "small": ParagraphStyle(
            "small", parent=base["Normal"], fontName="Helvetica",
            fontSize=8, textColor=MUTED, leading=10, spaceAfter=2
        ),
        "cell": ParagraphStyle(
            "cell", parent=base["Normal"], fontName="Helvetica",
            fontSize=7.5, textColor=BLACK, leading=9
        ),
        "cell_b": ParagraphStyle(
            "cell_b", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=7.5, textColor=BLACK, leading=9
        ),
        "bullet": ParagraphStyle(
            "bullet", parent=base["Normal"], fontName="Helvetica",
            fontSize=9, textColor=BLACK, leading=12, leftIndent=8, spaceAfter=2
        ),
        "footer": ParagraphStyle(
            "footer", parent=base["Normal"], fontName="Helvetica",
            fontSize=7, textColor=MUTED, alignment=TA_CENTER
        ),
        "meta_label": ParagraphStyle(
            "meta_label", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=8, textColor=ACCENT, alignment=TA_CENTER, spaceAfter=1
        ),
        "meta_value": ParagraphStyle(
            "meta_value", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=10, textColor=NAVY, alignment=TA_CENTER, spaceAfter=6
        ),
    }
    return s


def table(data, col_widths, header=True):
    t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
    style_cmds = [
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("TEXTCOLOR", (0, 0), (-1, -1), BLACK),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("GRID", (0, 0), (-1, -1), 0.4, SOFT),
        ("BACKGROUND", (0, 0), (-1, 0), NAVY) if header else ("BACKGROUND", (0, 0), (-1, 0), CREAM),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE) if header else ("TEXTCOLOR", (0, 0), (-1, 0), NAVY),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, CREAM]),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t


def bullets(items, s):
    return [
        Paragraph(f"• {item}", s["bullet"]) for item in items
    ]


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    page = canvas.getPageNumber()
    canvas.drawCentredString(A4[0] / 2, 10 * mm, f"Page {page}  |  Ayush Panda — Interview Planner 2026 (TUF+)")
    canvas.setStrokeColor(SOFT)
    canvas.line(15 * mm, 14 * mm, A4[0] - 15 * mm, 14 * mm)
    canvas.restoreState()


def build():
    by_week, cps, topics = load_weeks()
    s = styles()
    story = []

    # ── COVER ──
    story.append(Spacer(1, 18 * mm))
    story.append(Paragraph("AYUSH PANDA", s["cover_title"]))
    story.append(Paragraph(
        "Complete Interview Readiness Planner — TUF+ Edition",
        s["cover_sub"]
    ))
    story.append(Paragraph(
        "Startup &amp; Service-Based → FAANG Ready  |  180+ Companies",
        s["cover_sub"]
    ))
    story.append(Spacer(1, 8 * mm))

    meta = [
        ["Start Date", "Target Phase 1", "Target Phase 2"],
        ["July 30, 2026 (Thursday)", "Interview Ready by September 2026", "FAANG Ready by December 2026"],
        ["DSA Sheet", "Current Progress", "University"],
        ["TUF+ 435 + FAANG OA Pack (480)", "23 / 480 (~5%)", "VSSUT Burla — 5th Sem CS"],
        ["CGPA", "Portfolio", "App"],
        ["8.27 / 10", "ayushdev-five.vercel.app", "Interview Command Center"],
    ]
    meta_t = Table(meta, colWidths=[58 * mm, 62 * mm, 55 * mm])
    meta_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("BACKGROUND", (0, 2), (-1, 2), NAVY),
        ("BACKGROUND", (0, 4), (-1, 4), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("TEXTCOLOR", (0, 2), (-1, 2), WHITE),
        ("TEXTCOLOR", (0, 4), (-1, 4), WHITE),
        ("BACKGROUND", (0, 1), (-1, 1), CREAM),
        ("BACKGROUND", (0, 3), (-1, 3), CREAM),
        ("BACKGROUND", (0, 5), (-1, 5), CREAM),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
        ("FONTNAME", (0, 4), (-1, 4), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("BOX", (0, 0), (-1, -1), 0.8, NAVY),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, SOFT),
    ]))
    story.append(meta_t)
    story.append(Spacer(1, 10 * mm))

    phases = [
        [Paragraph("<b>Phase</b>", s["cell_b"]), Paragraph("<b>Month</b>", s["cell_b"]),
         Paragraph("<b>Goal</b>", s["cell_b"]), Paragraph("<b>Focus</b>", s["cell_b"])],
        ["PHASE 1", "Aug 2026", "Startup/Service Sprint", "Basic + Arrays/BS/Hashing + Core CS"],
        ["PHASE 2", "Sep 2026", "Interview Ready + Apply", "Recursion→Trees (~230/480) + 8 Mocks"],
        ["PHASE 3", "Oct 2026", "FAANG Foundation", "BST/Heaps/Graphs + System Design"],
        ["PHASE 4", "Nov 2026", "FAANG Advanced", "DP/Tries/Strings/Maths + FAANG Apps"],
        ["PHASE 5", "Dec 2026", "FAANG Ready", "Full revision + mocks + offers"],
    ]
    story.append(table(phases, [28 * mm, 28 * mm, 50 * mm, 69 * mm]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(
        "This edition uses your paid <b>TUF+ Basic to Advanced</b> sheet plus a researched "
        "<b>FAANG OA Gap Pack</b> (Blind 75 / NeetCode 150 / 2025–26 OA reports) — <b>480 problems total</b>. "
        "Track A (Sep): startup/service-ready. Track B (Dec): full sheet + OA pack + timed mocks.",
        s["body"]
    ))
    story.append(PageBreak())

    # ── 1. Profile ──
    story.append(Paragraph("1. Profile Snapshot &amp; Competitive Edge", s["h1"]))
    story.append(Paragraph("Your Current Strengths", s["h2"]))
    story.extend(bullets([
        "<b>Production-Grade Portfolio:</b> ShipFlow AI, Relvion AI, EdinForm, Votora — live products with real users.",
        "<b>Modern Full-Stack Stack:</b> Next.js, TypeScript, tRPC, Prisma, PostgreSQL, Redis, Kafka, Docker, Socket.io.",
        "<b>Strong Academics:</b> 8.27 CGPA at VSSUT — clears all service-based cutoffs (TCS 6.0, Infosys 6.0, Accenture 6.5).",
        "<b>20+ Projects:</b> End-to-end products with auth, data models, realtime, and deployment — not tutorial clones.",
        "<b>Technical Writing:</b> Hashnode posts on JWT, Node.js, authentication.",
    ], s))
    story.append(Paragraph("Gaps to Close (This Planner Addresses)", s["h2"]))
    story.extend(bullets([
        "<b>DSA:</b> 23/480 done (TUF+ + OA pack) — need ~457 more in 5 months (~3–4/day sustainable).",
        "<b>Core CS:</b> OS, DBMS, CN, OOP — required for service-based HR + technical rounds.",
        "<b>System Design:</b> Needed for FAANG L4/L5 and senior startup roles by Dec 2026.",
        "<b>Mock Interviews:</b> Timed coding + behavioral practice — no substitute.",
        "<b>Application Pipeline:</b> Structured tracking of 50+ company applications via Interview Command Center.",
    ], s))
    story.append(PageBreak())

    # ── 2. Roadmap ──
    story.append(Paragraph("2. Five-Month Roadmap Overview", s["h1"]))
    roadmap = [
        ("MONTH 1: Jul 30 – Aug 28, 2026 — STARTUP / SERVICE SPRINT",
         "Focus: Basic Maths/Arrays/Hashing/Strings/Recursion + Sorting + Arrays + Binary Search + Hashing "
         "(progress → ~127/480; OA pack P0 starts mid-Aug). Core CS: OS + DBMS basics. Resume polish. Apply to 15 startups. "
         "Eligible for ~35 companies after this month."),
        ("MONTH 2: Aug 29 – Sep 28, 2026 — INTERVIEW READY",
         "Focus: Recursion PatternWise → Linked List → Bit Manipulation → Greedy → Sliding Window → "
         "Stack/Queues → Binary Trees (progress → ~230/480). Core CS: CN + OOP. 8 mock interviews. "
         "Apply to 25+ companies. Eligible for ~60+ (TCS NQT, Wipro NLTH, Infosys, Cognizant + startups)."),
        ("MONTH 3: Sep 29 – Oct 28, 2026 — FAANG FOUNDATION",
         "Focus: BST + Heaps + Graphs (progress → ~312/480). System Design basics. Amazon/Google prep. "
         "Apply Microsoft/Amazon. Timed OA drills weekly. Eligible for ~75+ companies."),
        ("MONTH 4: Oct 29 – Nov 28, 2026 — FAANG ADVANCED",
         "Focus: DP (1D/2D/Subsequences/LIS/Strings/MCM) + Tries + Strings Advanced + Maths "
         "(progress → ~370–400/480). Intermediate SD. 12+ mocks. FAANG OA finish. Eligible for ~85+."),
        ("MONTH 5: Nov 29 – Dec 28, 2026 — FAANG READY",
         "Focus: Finish remaining problems to 480/480 + full revision. Advanced SD. 15 mocks. Offer negotiation. "
         "Eligible for 90+ companies — complete sheet, SD-ready, mock-tested, offer-ready."),
    ]
    for title, body in roadmap:
        story.append(Paragraph(title, s["h2"]))
        story.append(Paragraph(body, s["body"]))
    story.append(PageBreak())

    # ── 3. TUF+ Schedule ──
    story.append(Paragraph("3. TUF+ Basic to Advanced — Complete Problem Schedule", s["h1"]))
    story.append(Paragraph(
        "457 remaining problems ÷ 5 months ≈ 91/month | ~19–20/week | ~3–4/day (Mon–Sat). "
        "TUF+ core 435 + researched FAANG OA Gap Pack 45 (Blind 75 / NeetCode / 2025–26 OA reports).",
        s["body"]
    ))
    header = [
        Paragraph("<b>#</b>", s["cell"]),
        Paragraph("<b>Topic (TUF+ Sheet Step)</b>", s["cell"]),
        Paragraph("<b>Problems</b>", s["cell"]),
        Paragraph("<b>Month</b>", s["cell"]),
        Paragraph("<b>Week</b>", s["cell"]),
        Paragraph("<b>Track</b>", s["cell"]),
    ]
    rows = [header]
    # Track heuristic by topic order
    for t in topics:
        track = "Sep" if t["month"] <= 2 else ("Both" if "Binary Trees" in t["name"] else "FAANG")
        if "Binary Trees" in t["name"]:
            track = "Both"
        rows.append([
            str(t["sheetStep"]),
            Paragraph(t["name"], s["cell"]),
            str(t["totalProblems"]),
            f"M{t['month']}",
            f"W{t['week']}",
            track,
        ])
    total_probs = sum(int(t.get("totalProblems") or 0) for t in topics)
    rows.append(["", Paragraph("<b>TOTAL</b>", s["cell_b"]), Paragraph(f"<b>{total_probs}</b>", s["cell_b"]), "", "", ""])
    story.append(table(rows, [10 * mm, 95 * mm, 18 * mm, 15 * mm, 15 * mm, 22 * mm]))
    story.append(PageBreak())

    # ── 3b. FAANG OA Gap Pack ──
    oa_path = DATA / "faang-oa-pack.json"
    readiness_path = DATA / "faang-readiness.json"
    if oa_path.exists():
        oa = json.loads(oa_path.read_text(encoding="utf-8"))
        story.append(Paragraph("3b. FAANG OA Gap Pack — Real Interview Gaps", s["h1"]))
        story.append(Paragraph(
            "These are <b>not filler</b>. Each title is a Blind 75 / NeetCode 150 / 2025–26 OA staple that was "
            "missing (or under-covered) on TUF+. Scheduled into your planner from mid-August; finish P0 before Nov mocks.",
            s["body"]
        ))
        oa_rows = [[
            Paragraph("<b>#</b>", s["cell"]),
            Paragraph("<b>Problem</b>", s["cell"]),
            Paragraph("<b>Diff</b>", s["cell"]),
            Paragraph("<b>Pri</b>", s["cell"]),
            Paragraph("<b>Why / Companies</b>", s["cell"]),
        ]]
        for i, p in enumerate(oa, 1):
            why = (p.get("why") or "")[:90]
            cos = ", ".join((p.get("companies") or [])[:3])
            oa_rows.append([
                str(i),
                Paragraph(p.get("name") or "", s["cell"]),
                p.get("difficulty") or "",
                p.get("priority") or "",
                Paragraph(f"{why} — {cos}", s["cell"]),
            ])
        story.append(table(oa_rows, [10 * mm, 48 * mm, 16 * mm, 12 * mm, 89 * mm]))
        if readiness_path.exists():
            ready = json.loads(readiness_path.read_text(encoding="utf-8"))
            story.append(Spacer(1, 4 * mm))
            story.append(Paragraph(
                f"<b>Dec-ready definition:</b> {ready.get('decReadyDefinition', '')}",
                s["body"]
            ))
        story.append(PageBreak())

    # ── 4. Week-by-week ──
    story.append(Paragraph("4. Week-by-Week Daily Planner (TUF+ + OA Pack)", s["h1"]))
    story.append(Paragraph(
        "Daily DSA focus names match your paid TUF+ sheet plus the FAANG OA Gap Pack. Sundays are rest/revision. "
        "Use Interview Command Center Daily Planner to tick tasks.",
        s["body"]
    ))

    for cp in cps:
        w = cp["weekNumber"]
        if w > 18:
            continue
        days = by_week.get(w, [])
        # Prefer the Jul–Nov planner days (have rawPlan from weeks), skip pure Dec buffer if mixed
        block = []
        block.append(Paragraph(
            f"Week {w} — {cp.get('theme','')}  |  Phase {cp.get('phase','')}  |  "
            f"DSA target {cp['dsaTarget']}/480  |  Ends {cp['date']}",
            s["h2"]
        ))
        must = ", ".join(cp.get("mustHaveDone") or [])
        red = ", ".join(cp.get("redFlags") or [])
        block.append(Paragraph(f"<b>Must-have:</b> {must}", s["small"]))
        block.append(Paragraph(f"<b>Red flags:</b> {red}", s["small"]))

        day_rows = [[
            Paragraph("<b>Day</b>", s["cell"]),
            Paragraph("<b>Plan</b>", s["cell"]),
        ]]
        for d in days:
            # Skip Dec buffer-style rows inside early weeks (shouldn't happen)
            plan = d.get("rawPlan") or d.get("dsaFocus") or ""
            day_rows.append([
                Paragraph(d.get("dayLabel") or "", s["cell_b"]),
                Paragraph(plan.replace("&", "&amp;"), s["cell"]),
            ])
        block.append(table(day_rows, [28 * mm, 147 * mm]))
        block.append(Spacer(1, 3 * mm))
        story.append(KeepTogether(block))
        if w in (4, 8, 12, 16):
            story.append(PageBreak())

    story.append(PageBreak())

    # Dec buffer
    story.append(Paragraph("December Buffer (Weeks 19–20)", s["h2"]))
    story.append(Paragraph(
        "Dec 1–14: 2 revision problems + 1 SD practice daily; keep interview pipeline warm. "
        "Dec 15–28: 1 timed problem + follow-ups; target 1+ offer in hand. DSA target remains 480/480.",
        s["body"]
    ))
    story.append(PageBreak())

    # ── 5. Core CS ──
    story.append(Paragraph("5. Core CS Fundamentals — Basics to Advanced", s["h1"]))
    story.append(Paragraph(
        "1 hour/day Mon–Sat alongside DSA. Alternate OS/DBMS and CN/OOP; System Design from Phase 3.",
        s["body"]
    ))
    cs = [
        [Paragraph("<b>Subject</b>", s["cell"]), Paragraph("<b>Basics</b>", s["cell"]),
         Paragraph("<b>Intermediate</b>", s["cell"]), Paragraph("<b>Advanced</b>", s["cell"]),
         Paragraph("<b>Resource</b>", s["cell"])],
        ["OS", "What is OS, Types, Process", "Scheduling, Memory Mgmt", "Deadlocks, Virtual Memory", "Gate Smashers"],
        ["DBMS", "ER Model, Normalization", "SQL, Indexing, Joins", "Transactions, ACID, Concurrency", "Gate Smashers"],
        ["CN", "OSI, TCP/IP, HTTP", "DNS, DHCP, Routing", "Congestion, Security, CDN", "Neso Academy"],
        ["OOP", "Classes, Encapsulation", "Inheritance, Polymorphism", "Design Patterns", "GFG"],
        ["System Design", "—", "URL Shortener, Rate Limiter", "Instagram, Uber, Netflix", "Gaurav Sen / Alex Xu"],
        ["Aptitude", "Numbers, Percentages", "Time & Work, Probability", "Permutations, Series", "PrepInsta"],
    ]
    story.append(table(cs, [22 * mm, 38 * mm, 40 * mm, 42 * mm, 28 * mm]))
    story.append(Spacer(1, 4 * mm))
    story.extend(bullets([
        "Mon/Wed/Fri: OS or DBMS (alternate weeks) — 30 min lecture + 30 min notes",
        "Tue/Thu: Computer Networks or OOP — 30 min lecture + 30 min notes",
        "Saturday: System Design (Phase 3+) — 1 design problem (45 min) + review",
        "Sunday: REST or 15-min flashcard revision of the week's CS topics",
    ], s))
    story.append(PageBreak())

    # ── 6. Companies ──
    story.append(Paragraph("6. Company Eligibility &amp; Application Windows", s["h1"]))
    story.append(Paragraph(
        "CGPA 8.27 ✓ | 5th Sem (Pre-final) ✓ | CS ✓ | No backlogs ✓ | Full-stack portfolio ✓ | 2028 batch ✓",
        s["body"]
    ))
    story.append(Paragraph("A. Startups — Apply Immediately", s["h2"]))
    startups = [
        [Paragraph("<b>Company</b>", s["cell"]), Paragraph("<b>Role</b>", s["cell"]),
         Paragraph("<b>Deadline</b>", s["cell"]), Paragraph("<b>Mode</b>", s["cell"]),
         Paragraph("<b>Match</b>", s["cell"])],
        ["Better", "SWE Intern", "Aug 9, 2026", "Remote", "95%"],
        ["GharPayy", "Full Stack Intern", "Aug 13, 2026", "Bangalore", "98%"],
        ["BITCS", "SWE Intern", "Aug 14, 2026", "Remote", "95%"],
        ["Singularium", "Full Stack Intern", "Aug 15, 2026", "Bangalore", "90%"],
        ["Accredian", "Full Stack Intern", "Aug 19, 2026", "Remote", "98%"],
        ["Almanet", "Full Stack Intern", "Aug 23, 2026", "Remote", "92%"],
        ["Integral Solution", "Full Stack Intern", "Aug 24, 2026", "Remote", "85%"],
        ["Morfiction (SnapX)", "Founding FS Intern", "Aug 27, 2026", "Remote", "99%"],
        ["DocStox", "Full Stack Intern", "Aug 27, 2026", "Remote", "97%"],
    ]
    story.append(table(startups, [38 * mm, 40 * mm, 32 * mm, 28 * mm, 22 * mm]))
    story.append(Paragraph("B. Service-Based — You Clear Cutoffs", s["h2"]))
    service = [
        [Paragraph("<b>Company</b>", s["cell"]), Paragraph("<b>Min CGPA</b>", s["cell"]),
         Paragraph("<b>Eligible?</b>", s["cell"]), Paragraph("<b>Window</b>", s["cell"]),
         Paragraph("<b>CTC</b>", s["cell"])],
        ["TCS NQT/Ninja", "6.0", "YES", "Aug–Sep 2026", "3.36–7 LPA"],
        ["TCS Digital / Prime", "6.0 / 7.0", "YES", "With NQT", "7–12 LPA"],
        ["Infosys DSE / SP", "6.0 / 7.0", "YES", "Sep–Oct 2026", "3.6–9.5 LPA"],
        ["Wipro Elite NLTH", "6.0", "YES", "Aug–Oct 2026", "3.5–6.5 LPA"],
        ["Cognizant GenC", "6.0", "YES", "Sep–Oct 2026", "4–6.75 LPA"],
        ["Accenture", "6.5", "YES", "Campus / off-campus", "4.5–6.5 LPA"],
    ]
    story.append(table(service, [40 * mm, 28 * mm, 25 * mm, 40 * mm, 32 * mm]))
    story.append(Paragraph("C. Product / FAANG — Track B (Oct–Dec)", s["h2"]))
    story.extend(bullets([
        "Microsoft SWE Intern — rolling; apply early in Phase 3.",
        "Amazon SDE Intern — watch Aug–Oct postings; OA practice from Week 11.",
        "Google / Meta / Apple — Phase 4–5 once DP + mocks are strong.",
        "Product: Flipkart, Swiggy, Razorpay, PhonePe, CRED — apply as OAs open.",
        "Live openings auto-sync in Interview Command Center via Greenhouse / Lever / Ashby / Remotive + Internshala / Wellfound / Unstop / LinkedIn hubs.",
    ], s))
    story.append(PageBreak())

    # ── 7. Tracking ──
    story.append(Paragraph("7. Tracking Sheets &amp; Daily Routine", s["h1"]))
    story.extend(bullets([
        "<b>DSA Tracker:</b> Mark Done / In Progress / Revisit in Interview Command Center — 480 total (TUF+ 435 + OA pack 45).",
        "<b>Daily Planner:</b> Tick DSA, Core CS, Tech Revision, Application, English for each day.",
        "<b>Checkpoints:</b> Weekly 'Am I On The Right Path?' page compares DSA actual vs target.",
        "<b>Companies:</b> Status pipeline (Not Applied → Applied → OA → Interview → Offer).",
        "<b>Notion (optional):</b> Mirror weekly themes; ICC is source of truth for counts.",
    ], s))
    story.append(Paragraph("Suggested weekday block (college evenings)", s["h2"]))
    routine = [
        [Paragraph("<b>Time</b>", s["cell"]), Paragraph("<b>Block</b>", s["cell"]), Paragraph("<b>Duration</b>", s["cell"])],
        ["6:00–7:00 PM", "DSA (2–4 TUF+ problems)", "60–90 min"],
        ["7:00–8:00 PM", "Core CS lecture + notes", "60 min"],
        ["8:00–8:30 PM", "Dinner / break", "30 min"],
        ["8:30–9:15 PM", "Tech stack / portfolio OR applications", "45 min"],
        ["9:15–9:45 PM", "English / explain-aloud / STAR", "30 min"],
        ["Sunday", "REST + light revision + tracker update", "—"],
    ]
    story.append(table(routine, [35 * mm, 95 * mm, 40 * mm]))
    story.append(PageBreak())

    # ── 8. Resources ──
    story.append(Paragraph("8. Resources, Tips &amp; Success Metrics", s["h1"]))
    story.extend(bullets([
        "<b>DSA:</b> TUF+ Basic to Advanced (435) + FAANG OA Gap Pack (45) = 480. LeetCode for contests/timed OAs.",
        "<b>Core CS:</b> Gate Smashers (OS/DBMS), Neso Academy (CN), GFG OOP, PrepInsta aptitude.",
        "<b>System Design:</b> Gaurav Sen, Alex Xu Vol 1 (lite for intern).",
        "<b>Mocks:</b> Pramp, Interviewing.io, peer mocks; aim 20+ by late November.",
        "<b>Sep success:</b> ~230/480 + 8 mocks + 25+ apps + Core CS basics = Interview Ready.",
        "<b>Dec success:</b> 480/480 + SD + 20+ mocks + FAANG/product pipeline = FAANG Ready.",
    ], s))
    story.append(PageBreak())

    # ── 9. College timetable note ──
    story.append(Paragraph("9. College Timetable — Realistic Daily Schedule", s["h1"]))
    story.append(Paragraph(
        "Protect lecture hours; treat evenings as the interview job. 4+ evening hours × 6 days ≈ 24h/week — "
        "enough to finish TUF+ and Core CS if you show up. Skip doom-scrolling after 6 PM. "
        "One skipped DSA day is recoverable; three in a row is a red flag (see §16).",
        s["body"]
    ))
    story.append(PageBreak())

    # ── 10. Syllabus phases ──
    story.append(Paragraph("10. Complete Syllabus — Phase-by-Phase (DSA Priority)", s["h1"]))
    syllabus = [
        [Paragraph("<b>Phase</b>", s["cell"]), Paragraph("<b>DSA (P0)</b>", s["cell"]),
         Paragraph("<b>Core / Other</b>", s["cell"]), Paragraph("<b>Hrs/wk DSA</b>", s["cell"])],
        ["P1 Jul 30–Aug 28", "Basics + Sorting + Arrays + BS + Hashing → ~127", "OS + DBMS basics, resume, 15 startup apps", "14h"],
        ["P2 Aug 29–Sep 28", "Recursion → LL → Bit → Greedy → SW → Stack → BT → ~230", "CN + OOP, 8 mocks, 25+ apps", "14h"],
        ["P3 Sep 29–Oct 28", "BST + Heaps + Graphs → ~312", "SD intro, Amazon/Microsoft apps", "14h"],
        ["P4 Oct 29–Nov 28", "DP + Tries + Strings Adv + Maths → ~370+", "SD intermediate, FAANG OAs, 12 mocks", "14h"],
        ["P5 Nov 29–Dec 28", "Finish 480 + full revision", "Advanced SD, mock marathon, offers", "12h"],
    ]
    story.append(table(syllabus, [32 * mm, 58 * mm, 58 * mm, 22 * mm]))
    story.append(Paragraph("Topic checklists (track with checkboxes in ICC / Notion)", s["h2"]))
    story.extend(bullets([
        "<b>LLD:</b> SOLID, UML, Creational/Structural/Behavioural patterns, concurrency, DI, interview problems 1–3.",
        "<b>OOP:</b> Principles → advanced features → relationships → design &amp; lifecycle.",
        "<b>CN:</b> Modules 1–15 (foundations through situation-based).",
        "<b>DBMS:</b> ER → SQL → NoSQL → transactions → indexing → distributed / security / warehousing.",
    ], s))
    story.append(PageBreak())

    # ── 11. Tech stack ──
    story.append(Paragraph("11. Tech Stack Revision Schedule (Your ChaiCode Path)", s["h1"]))
    story.append(Paragraph(
        "You already build with this stack in production. Revision = interview fluency — explain each topic in 2 minutes.",
        s["body"]
    ))
    tech = [
        [Paragraph("<b>Week</b>", s["cell"]), Paragraph("<b>Focus</b>", s["cell"]), Paragraph("<b>Interview Q</b>", s["cell"])],
        ["W1–2", "DNS, TCP/IP, HTTP, Client–Server", "What happens when you type google.com?"],
        ["W3–4", "JS: Closures, Promises, Event Loop", "Event loop with microtask example"],
        ["W5–6", "TypeScript: Generics, Interfaces", "Why TypeScript for large apps?"],
        ["W7–8", "Node.js, Express, REST", "Design a rate-limited REST API"],
        ["W9–10", "Auth: JWT, OAuth, RBAC", "Walk through login + refresh tokens"],
        ["W11–12", "React Hooks, memoization, Context", "useMemo vs useCallback?"],
        ["W13–14", "Next.js SSR/SSG/ISR, Server Actions", "When SSR over CSR?"],
        ["W15–16", "WebSockets / Socket.io / SSE", "Polling vs WebSocket?"],
        ["W17–18", "Redis, Kafka, rate limiting", "Build a rate limiter — approach?"],
        ["W19–20", "Docker, CI/CD, AWS, monitoring", "How do you deploy ShipFlow?"],
    ]
    story.append(table(tech, [22 * mm, 70 * mm, 83 * mm]))
    story.append(PageBreak())

    # ── 12. Platforms ──
    story.append(Paragraph("12. Best Platforms + Application Strategy", s["h1"]))
    plats = [
        [Paragraph("<b>Platform</b>", s["cell"]), Paragraph("<b>Best For</b>", s["cell"]),
         Paragraph("<b>Action</b>", s["cell"]), Paragraph("<b>Cadence</b>", s["cell"])],
        ["Internshala", "Indian startups, WFH", "Apply within 48h", "Daily 9 AM"],
        ["LinkedIn Jobs", "All + referrals", "Alerts: intern + full stack", "Daily"],
        ["Wellfound", "Funded startups", "Apply ~10/week", "Mon + Thu"],
        ["Unstop", "Hackathons → hiring", "1 hackathon/month", "Weekly"],
        ["TCS NextStep", "NQT + internships", "Register profile NOW", "Weekly"],
        ["Greenhouse/Lever boards", "Product companies", "Synced in ICC live", "Auto every 6h"],
        ["Remotive", "Remote SWE", "Filter junior/intern", "Synced in ICC"],
    ]
    story.append(table(plats, [35 * mm, 40 * mm, 55 * mm, 30 * mm]))
    story.append(PageBreak())

    # ── 13. Company list note ──
    story.append(Paragraph("13. Master Company List — 180+ Targets", s["h1"]))
    story.append(Paragraph(
        "The full 180+ company list (Batches A–F + Live hubs) lives in Interview Command Center → Companies, "
        "seeded from your planner and refreshed with real ATS openings (Greenhouse, Lever, Ashby) plus Remotive "
        "and platform hubs (Internshala, Wellfound, Unstop, LinkedIn). Prioritize High matchScore + open roles + deadlines ≤14 days.",
        s["body"]
    ))
    story.extend(bullets([
        "Batch A–B: FAANG + top product (Microsoft, Amazon, Razorpay, CRED, …)",
        "Batch C–D: Product / unicorns with Greenhouse/Lever wiring where available",
        "Batch E–F: Broader service + startup watchlist with Wellfound/Internshala search URLs",
        "LiveHub cards: always-open boards — refresh often; apply from the live listing page",
    ], s))
    story.append(PageBreak())

    # ── 14. Interview by company type ──
    story.append(Paragraph("14. Interview Prep by Topic — What They Actually Ask", s["h1"]))
    story.append(Paragraph("Prep plan per company type", s["h2"]))
    story.append(Paragraph("<b>Startup (best bet NOW)</b>", s["body"]))
    story.extend(bullets([
        "Lead with ShipFlow AI or Relvion AI — live demo.",
        "Expect: architecture walkthrough + 1 LC medium from TUF+ Arrays/Hashing/BT.",
        "Stack: Next.js SSR, PostgreSQL vs MongoDB, JWT auth flow.",
        "Show GitHub commits, not just finished READMEs.",
    ], s))
    story.append(Paragraph("<b>Service-based (TCS / Wipro / Infosys)</b>", s["body"]))
    story.extend(bullets([
        "Aptitude 30 min/day from Month 2 (PrepInsta).",
        "DSA: Arrays, Strings, basic SQL — easy–medium from early TUF+ steps.",
        "Core CS: 20 must-know Qs per subject.",
        "HR: 2-min Tell me about yourself + strengths/weaknesses.",
    ], s))
    story.append(Paragraph("<b>FAANG / Product (Month 3+)</b>", s["body"]))
    story.extend(bullets([
        "OA: 2–3 medium in 90 min — HackerRank / AMCAT practice.",
        "Phone: 1 medium + behavioral (Amazon LPs, Googleyness).",
        "Onsite: 3–4 DSA + 1 SD lite + 1 behavioral.",
        "8 STAR stories from projects; Amazon: map to 14 Leadership Principles.",
    ], s))
    story.append(PageBreak())

    # ── 15. English ──
    story.append(Paragraph("15. English &amp; Communication — Fluency Guide", s["h1"]))
    eng = [
        [Paragraph("<b>Level</b>", s["cell"]), Paragraph("<b>Required For</b>", s["cell"]),
         Paragraph("<b>Target</b>", s["cell"]), Paragraph("<b>By</b>", s["cell"])],
        ["Basic", "Service HR", "Already there", "—"],
        ["Conversational", "Startup tech + HR", "Clear over perfect", "Aug 15"],
        ["Professional", "Product / FAANG", "Explain complex ideas", "Oct 1"],
        ["Fluent", "US remote / clients", "Confident depth", "Dec"],
    ]
    story.append(table(eng, [30 * mm, 45 * mm, 50 * mm, 30 * mm]))
    story.append(Paragraph("Daily 30-min communication (evening slot)", s["h2"]))
    story.extend(bullets([
        "Mon: Explain 1 DSA solution out loud (record).",
        "Tue: Read 1 engineering blog aloud.",
        "Wed: 2-min project pitch (ShipFlow → Relvion → EdinForm).",
        "Thu: STAR story — 3 min max.",
        "Fri: Watch 1 mock interview; repeat answers.",
        "Sat: Pramp mock OR explain one SD problem out loud.",
        "Sun: REST — optional podcast while walking.",
    ], s))
    story.append(PageBreak())

    # ── 16. Checkpoints ──
    story.append(Paragraph("16. Am I On The Right Path? — Weekly Checkpoints", s["h1"]))
    story.append(Paragraph(
        "Compare your ICC DSA done count to the target each Sunday. Red flags mean course-correct that week — "
        "cut optional work, not DSA + applications.",
        s["body"]
    ))
    cp_rows = [[
        Paragraph("<b>Week</b>", s["cell"]),
        Paragraph("<b>Date</b>", s["cell"]),
        Paragraph("<b>DSA Target</b>", s["cell"]),
        Paragraph("<b>Must-Have</b>", s["cell"]),
        Paragraph("<b>Red Flag</b>", s["cell"]),
    ]]
    for cp in cps:
        cp_rows.append([
            f"W{cp['weekNumber']}",
            str(cp.get("date", "")),
            f"{cp['dsaTarget']}/480",
            Paragraph(", ".join(cp.get("mustHaveDone") or []), s["cell"]),
            Paragraph(", ".join(cp.get("redFlags") or []), s["cell"]),
        ])
    story.append(table(cp_rows, [14 * mm, 24 * mm, 22 * mm, 62 * mm, 53 * mm]))
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph(
        "<b>Key milestones:</b> W8 (~230/480) = Startup/Service Interview Ready · "
        "W16 (480/480) = Sheet + OA pack complete · W18–20 = Offer season &amp; maintenance.",
        s["body"]
    ))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(
        "Generated from your Interview Command Center current plan (TUF+ 435 + FAANG OA Gap Pack 45 = 480; Jul–Dec 2026). "
        "Open the app for live company sync and day-to-day tracking.",
        s["small"]
    ))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=14 * mm,
        bottomMargin=18 * mm,
        title="Ayush Panda — Complete Interview Readiness Planner (TUF+)",
        author="Ayush Panda / Interview Command Center",
    )
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"Wrote {OUT}")
    print(f"Size: {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    build()
