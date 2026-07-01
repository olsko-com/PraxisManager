# Abrechnungs- und Rechnungsmodul Status & Dokumentation

Diese Datei dokumentiert den aktuellen Implementierungsstand, die Datenbankstrukturen sowie die rechtlichen Grundlagen des Rechnungsmoduls für Entwickler.

---

## ⚖️ Rechtliche Compliance-Vorgaben & Umsetzung

Das Modul wurde nach den Vorgaben von **§ 14 UStG**, **§ 19 UStG (Kleinunternehmer)** und **§ 286 BGB** umgesetzt:

| Vorgabe | Rechtliche Grundlage | Status | Beschreibung / technische Umsetzung |
| :--- | :--- | :---: | :--- |
| **Vollständige Anschrift** | § 14 Abs. 4 Nr. 1 UStG | **Erledigt** | Anschrift des Therapeuten (leistender Unternehmer) und des Klienten (Leistungsempfänger) werden aufgedruckt. |
| **Steuernummer / USt-IdNr.** | § 14 Abs. 4 Nr. 2 UStG | **Erledigt** | Steuernummer und (falls vorhanden) USt-IdNr. des Therapeuten werden in den Einstellungen gepflegt und aufgedruckt. |
| **Ausstellungsdatum** | § 14 Abs. 4 Nr. 3 UStG | **Erledigt** | Rechnungsdatum wird erfasst und aufgedruckt. |
| **Fortlaufende Nummer** | § 14 Abs. 4 Nr. 4 UStG | **Erledigt** | Einmalige, fortlaufende Rechnungsnummer (z. B. `RE-2026-0001`) wird automatisch berechnet oder manuell vergeben. |
| **Menge & Leistungsbeschreibung** | § 14 Abs. 4 Nr. 5 UStG | **Erledigt** | Einzelne Rechnungspositionen werden mit Beschreibung und Betrag im Editor gepflegt. |
| **Leistungszeitpunkt** | § 14 Abs. 4 Nr. 6 UStG | **Erledigt** | Separates Feld für den Leistungszeitraum (z. B. "Juni 2026"), da dieser vom Rechnungsdatum abweichen kann. |
| **Umsatzsteuerausweis / -befreiung** | § 14 Abs. 4 Nr. 7/8 UStG | **Erledigt** | **Standard:** Ausweis von Netto, USt. (0%, 7%, 19%) und Brutto.<br>**Kleinunternehmer:** Keine Steuerberechnung, Ausblendung aller USt-Spalten und Andruck des Hinweistextes nach § 19 UStG. |
| **Verbraucherhinweis (Verzug)** | § 286 Abs. 3 BGB | **Erledigt** | Automatischer Andruck des gesetzlichen Hinweistextes zur 30-Tage-Zahlungsfrist für Verbraucherrechnungen. |
| **Unveränderbarkeit (GoBD)** | GoBD | **Erledigt** | Bei der Rechnungserstellung wird ein **Client-Snapshot** (Name, Anschrift, Kontaktdaten) erzeugt und in der Rechnung eingefroren. Spätere Änderungen der Klienten-Stammdaten beeinflussen bereits erstellte Rechnungen nicht. |
| **Sperrung gegen Löschen** | GoBD | **Erledigt** | Rechnungen sind nach Erstellung gesperrt und nicht mehr manuell löschbar. |
| **Storno-Workflow** | GoBD | **Erledigt** | Stornierung erzeugt eine verknüpfte negative Rechnung mit Bezug (`related_invoice_id`). |

---

## 🗄️ Datenbank-Schema (Supabase / PostgreSQL)

Die Tabellen wurden um folgende Spalten erweitert:

### 1. Tabelle `practices` (Stammdaten des Therapeuten)
```sql
ALTER TABLE public.practices
  ADD COLUMN tax_number TEXT,                 -- Steuernummer
  ADD COLUMN vat_id TEXT,                     -- Umsatzsteuer-Identifikationsnummer (USt-IdNr.)
  ADD COLUMN iban TEXT,                       -- Bankverbindung: IBAN
  ADD COLUMN bic TEXT,                        -- Bankverbindung: BIC
  ADD COLUMN is_small_business BOOLEAN DEFAULT false; -- Kleinunternehmer-Flag (§ 19 UStG)
```

### 2. Tabelle `invoices` (Rechnungen & Snapshots)
```sql
ALTER TABLE public.invoices
  ADD COLUMN due_date DATE,                   -- Fälligkeitsdatum
  ADD COLUMN service_date TEXT,               -- Leistungszeitpunkt / -zeitraum
  ADD COLUMN client_snapshot JSONB,           -- Historischer Klienten-Snapshot (Name, Adresse zum Erstellungszeitpunkt)
  ADD COLUMN line_items JSONB DEFAULT '[]'::jsonb, -- Array von Rechnungspositionen (id, description, price, taxRate)
  ADD COLUMN is_small_business BOOLEAN DEFAULT false, -- Status des Ausstellers bei Rechnungserstellung
  ADD COLUMN notes TEXT DEFAULT '',           -- Zahlungshinweise / Notizen
  ADD COLUMN related_invoice_id UUID REFERENCES public.invoices(id); -- Für Storno-Bezug
```

### 3. Check Constraint für den Status
Der `status`-Constraint in Postgres muss angepasst werden, um `'cancelled'` zu erlauben:
```sql
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('paid', 'open', 'overdue', 'cancelled'));
```

---

## 📂 Relevante Dateien & Code-Struktur

- **[`types.ts`](file:///Users/ivenruether/Downloads/PraxisManager/src/lib/types.ts)**:
  - `Invoice`: Erweitert um `dueDate`, `serviceDate`, `clientSnapshot`, `lineItems`, `isSmallBusiness`, `relatedInvoiceId` und `notes`.
  - `InvoiceLineItem`: Definiert Struktur einer Zeile (`id`, `description`, `price`, `taxRate`).
  - `ClientSnapshot`: Sichert Klientenadresse (`name`, `email`, `phone`, `street`, `houseNumber`, `zipCode`, `city`).
- **[`context.tsx`](file:///Users/ivenruether/Downloads/PraxisManager/src/app/dashboard/context.tsx)**:
  - Lädt Stammdaten (`practices`) und ordnet sie dem aktuellen Therapeuten zu.
  - Verwaltet das Speichern von Profiländerungen in den Settings.
  - `handleCreateInvoice`: Erzeugt den JSONB-Snapshot und fügt ihn in die Datenbank ein.
  - `cancelInvoice`: Implementiert den GoBD-konformen Stornierungsprozess. Aktualisiert den Status auf `'cancelled'` und erzeugt eine verknüpfte negative Stornorechnung (`ST-XXXX`).
  - `printInvoice`: Generiert das barrierefreie und druckoptimierte DIN-A4-HTML-Template mit allen rechtlichen Pflichtangaben (und passt Titel/Notizen bei Storno an).
- **[`settings/page.tsx`](file:///Users/ivenruether/Downloads/PraxisManager/src/app/dashboard/settings/page.tsx)**:
  - Einstellungsmaske für Steuernummer, USt-IdNr, IBAN, BIC und Kleinunternehmer-Status.
- **[`NewInvoiceSheet.tsx`](file:///Users/ivenruether/Downloads/PraxisManager/src/app/dashboard/components/NewInvoiceSheet.tsx)**:
  - Rechnungs-Erstellungs-Wizard mit interaktiver DIN-A4-Vorschau und dynamic client validation checklist.
- **[`invoices/page.tsx`](file:///Users/ivenruether/Downloads/PraxisManager/src/app/dashboard/invoices/page.tsx)**:
  - Listet Rechnungen auf, zeigt Storno-Verknüpfungen an und leitet den Kopier-Workflow nach der Stornierung ein.
- **[`clients/page.tsx`](file:///Users/ivenruether/Downloads/PraxisManager/src/app/dashboard/clients/page.tsx)**:
  - Schnellrechnungserstellung aus Klientenkarten (erzeugt ebenfalls standardmäßig vollkompatible Invoices).

---

## 🔮 Zukünftige Erweiterungen (GoBD-Roadmap)

Um eine vollständige GoBD-Zertifizierung oder strenge Wirtschaftsprüfung zu erfüllen, sollten folgende Punkte als Nächstes umgesetzt werden:

1. **Festschreibung (Locking)**:
   - Rechnungen können als "Entwurf" bearbeitet werden, müssen aber beim Export/Druck festgeschrieben (locked) werden.
