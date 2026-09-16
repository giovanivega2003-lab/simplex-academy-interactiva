# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, no build step, no framework, no backend. Deploy target is GitHub Pages
(user-confirmed), which forbids server code and rules out any server-side booking, email, or
database. Vanilla ES modules and plain CSS so the owner can open, read and edit the files
without tooling.

## Users

**Primary — the client.** A woman in Santa Cruz de la Sierra, on a phone, usually on mobile
data, deciding in an idle moment ("me hago las uñas el sábado"). She wants to know what a
service costs before she commits, pick a day and time that suits her, and hand the request
over without a phone call. She is not logged in and will not create an account.

**Secondary — Verónica Ribera, the owner.** One person, running the studio and the agenda at
once, between clients, on her own phone or a laptop. She needs to see the day, confirm or
move a request, and not lose the record.

## Product Purpose

A price catalogue and appointment request for a one-woman beauty studio. Success is a client
who knows the price before she writes, and a request that reaches Verónica on WhatsApp with
everything she needs to confirm it in one reply — no back-and-forth to establish service,
length, date, time or price.

## Positioning

Prices are published, itemised and honest about their variability — including the ranges that
depend on hair length and the surcharges for elaborate nail art. Most competing salons in the
city publish a phone number and a photo. The studio's catalogue is its own printed price list,
photographed and shown alongside the digital one, so the two can be checked against each other.

## Operating Context

- The studio is inside the **Mercado Estación Argentina**, Cuarto anillo, sector Tres Pasos al
  Frente, Santa Cruz de la Sierra. A market, not a mall — the surrounding visual world is
  market signage, painted stall numbers and printed price boards.
- Everything real happens on **WhatsApp**: +591 75323254. The site prepares the message; the
  client sends it; Verónica answers. No automatic sending is possible or claimed.
- Opening hours, Bolivia time (`America/La_Paz`, UTC−4, no DST): Monday 08:00–20:00,
  Tuesday to Saturday 09:00–20:00, Sunday closed.
- Currency is the boliviano (Bs). Language is Spanish as spoken in Bolivia (es-BO): "clienta",
  "uñas", "planchado", "agendar".
- Clients overwhelmingly arrive on phones; the owner's agenda is used on a phone too.

## Capabilities and Constraints

**Confirmed functionality**
- 24 services across four categories: Uñas (11), Cabello (5), Maquillaje (4), Peinados (4).
- Hair and styling services carry length variants (corto / mediano / largo) with distinct
  prices; the rest are single-price. Prices range 30–350 Bs.
- Elaborate nail art or rhinestones adds 20 Bs and 30 minutes of reference time.
- Each service carries a reference duration the owner can adjust; durations drive the agenda,
  not the price.
- The owner can register appointments, confirm, complete, reschedule and cancel them, block
  time off, filter and search the day, export XLSX, and export/import a JSON backup.

**Technical constraints**
- No server, no database, no accounts, no payments. There is no deposit and none is claimed.
- The owner's agenda lives in her browser's `localStorage`. It is not shared between devices
  and not visible to clients. A client's browser cannot know real availability, so the client
  view must never present a time as confirmed — it requests a time.
- Calendar integration is link-based only: an `.ics` download (the path that works on iPhone
  and Apple Calendar) and a Google Calendar template URL. Real email invitations happen when
  the owner creates the event in her own Google Calendar with the client's address as a guest;
  the site cannot send email itself.
- The owner view is protected by a locally-set access code. Without a server this stops a
  casual visitor, not a technical one, and must say so.

**Undecided**
- Custom domain: none chosen.
- Whether the owner will later want a real shared backend (Apps Script or similar). Declined
  for now in favour of the no-server path.

## Brand Commitments

- Name: **Bendita Belleza**, descriptor **Beauty Studio**. Owner named as Verónica Ribera.
- The studio's own logo image is supplied and binding.
- The three photographed printed price lists are real studio material and must remain
  reachable from the catalogue — clients cross-check them.
- Clients are addressed in the feminine ("clienta", "bienvenida"), matching the existing voice.

## Evidence on Hand

- `Bendita_Belleza.html` — the incumbent single-file site: full service catalogue with real
  prices and durations, real address, phone, maps link and opening hours. Product truth, not
  visual authority.
- Four real JPEG assets embedded in that file: the studio logo (228 KB) and photographs of the
  printed price lists for uñas (304 KB), cabello (326 KB) and maquillaje (325 KB).
- No testimonials, no client photographs, no ratings, no press, no case studies exist. None may
  be invented. There is no photography of the studio interior or of finished work; any imagery
  beyond the four supplied assets must be authored as clearly non-photographic material.

## Product Principles

1. **The price is the product.** Never hide a number behind "consultar". Where a price genuinely
   varies, publish the range and say what moves it.
2. **Never promise what WhatsApp has to deliver.** A request is a request until Verónica
   answers. Every confirmation-shaped word in the client view is a lie the studio has to
   absorb.
3. **The phone is the real device.** Composition, tap targets and weight are decided at 390px
   first; the desktop layout is the adaptation.
4. **The owner's agenda is hers alone.** It is never mixed into the public surface, and its
   data never leaves her device except through an export she asks for.
5. **Say the limitation out loud.** Local storage, unshared availability, no email, weak access
   code — each is stated where it matters, in plain words, not in a footnote.

## Accessibility & Inclusion

- Spanish (es-BO) throughout; no English strings in the interface.
- Used one-handed on a phone, frequently outdoors in strong daylight — contrast and tap target
  size are functional requirements, not compliance checkboxes.
- Keyboard operation and visible focus are already present in the incumbent and must survive.
- Range of ages and technical confidence among clients; the primary action must never depend on
  a gesture or a hidden affordance.
