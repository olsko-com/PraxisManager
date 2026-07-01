# Datenbank- & Schema-Dokumentation

Diese Datei dokumentiert das Supabase-Datenbankschema für den **PraxisManager** sowie die Strategien zur Client-seitigen Datenverarbeitung und -speicherung.

---

## 🏗️ Tabellenübersicht & Typen

Alle Primärschlüssel (`id`) werden clientseitig per `crypto.randomUUID()` generiert und als strenge UUIDv4-Typen in Postgres gespeichert. Row-Level Security (RLS) ist auf allen Tabellen aktiv und filtert Abfragen über die Spalte `user_id` (gekoppelt an die Supabase-Session des Therapeuten).

### 1. `practices`
Speichert grundlegende Praxiseinstellungen.
* **`id`** `uuid` (PK)
* **`user_id`** `uuid` (FK to auth.users)
* **`name`** `text` (Name der Praxis)
* **`currency`** `text` (Standardwährung, z.B. `EUR`)
* **`created_at`** `timestamptz`

---

### 2. `clients`
Speichert Patientenstammdaten.
* **`id`** `uuid` (PK)
* **`user_id`** `uuid` (FK to auth.users)
* **`name`** `text` 
  > ⚠️ **Custom-Format zur Namensspaltung:** 
  > Um Vorname, Nachname und Anrede für personalisierte E-Mail-Templates sauber zu trennen, ohne das Supabase-Schema zu ändern, speichern wir die Daten serialisiert als:
  > `Anrede|Vorname|Nachname` (z.B. `Frau|Sarah|Müller` oder `Keine|Max|Mustermann`).
  > Clientseitig wird dies beim Laden automatisch geparst und in `salutation`, `firstName`, `lastName` sowie `name` (formatiert für die UI) übersetzt.
* **`birthday`** `date` (Geburtsdatum)
* **`email`** `text`
* **`phone`** `text`
* **`emergency_contact`** `text`
* **`notes`** `text` (Allgemeine Patientennotizen / Anamnese)
* **`created_at`** `timestamptz`
* **`gdpr_accepted`** `boolean` (Gibt an, ob die DSGVO-Zustimmung erteilt wurde)
* **`gdpr_token`** `text` (Eindeutiger Verifizierungs-Token für das Patientenportal)
* **`gdpr_token_expires_at`** `timestamptz` (Gültigkeit des Tokens - i.d.R. 7 Tage)
* **`gdpr_signature`** `text` (Base64-repräsentierte Unterschrift des Patienten)
* **`gdpr_signed_at`** `timestamptz` (Zeitpunkt der digitalen Signatur)

* **Lokale Felder (localStorage):**
  Die UI-Flags `isFavorite` und `isFlagged` existieren nicht in der Datenbank und werden lokal auf dem Gerät des Therapeuten synchronisiert unter:
  - `client_favs_${therapistId}` (Array aus Client-UUIDs)
  - `client_flags_${therapistId}` (Array aus Client-UUIDs)
  *(Hinweis: `client_gdpr_${therapistId}` dient als Legacy-Fallback; die primäre Einwilligung ist in den DB-Spalten hinterlegt).*

---

### 3. `services`
Praxisleistungen und Tarife.
* **`id`** `uuid` (PK)
* **`user_id`** `uuid` (FK to auth.users)
* **`name`** `text` (Leistungsname)
* **`duration`** `integer` (Dauer in Minuten)
* **`price`** `numeric` (Preis in EUR)

---

### 4. `appointments`
Kalendertermine.
* **`id`** `uuid` (PK)
* **`user_id`** `uuid` (FK to auth.users)
* **`client_id`** `uuid` (FK to clients)
* **`service_id`** `uuid` (FK to services)
* **`start_time`** `timestamptz`
* **`end_time`** `timestamptz`
* **`status`** `text` (`booked`, `confirmed`, `cancelled`, `noshow`)
* **`created_at`** `timestamptz`

* **Lokale Felder (localStorage):**
  - **`notes`** (Terminnotizen): Da es keine `notes`-Spalte in der `appointments`-Tabelle gibt, werden private Notizen im `localStorage` unter `app_notes_${appointmentId}` gesichert. Um Schreibzugriffe zu minimieren, wird erst bei `onBlur` des Textfeldes gespeichert.
* **Dynamische Joins (Clientside):**
  Die relationalen Felder `clientName`, `serviceName` und `price` werden zur Laufzeit clientseitig über die zugehörigen IDs gemappt, um Datenbank-Rundreisen einzusparen.

---

### 5. `soap_notes`
Therapieberichte nach dem SOAP-Standard.
* **`id`** `uuid` (PK)
* **`user_id`** `uuid` (FK to auth.users)
* **`client_id`** `uuid` (FK to clients)
* **`appointment_id`** `uuid` (FK to appointments, nullable)
* **`date`** `date` (Datum des Eintrags)
* **`subjective`** `text` (Subjektive Beschwerden des Patienten)
* **`objective`** `text` (Objektive Befunde des Therapeuten)
* **`assessment`** `text` (Beurteilung/Diagnose)
* **`plan`** `text` (Weiteres Vorgehen/Übungen)
* **`created_at`** `timestamptz`

---

### 6. `invoices`
Rechnungsdaten.
* **`id`** `uuid` (PK)
* **`user_id`** `uuid` (FK to auth.users)
* **`client_id`** `uuid` (FK to clients)
* **`appointment_id`** `uuid` (FK to appointments, nullable)
* **`invoice_number`** `text` (Rechnungsnummer, z.B. `RE-2026-0001`)
* **`amount`** `numeric` (Rechnungsbetrag)
* **`date`** `date` (Rechnungsdatum)
* **`status`** `text` (`open`, `paid`, `overdue`, `cancelled`)
* **`due_date`** `date` (Fälligkeitsdatum)
* **`service_date`** `text` (Leistungszeitraum)
* **`client_snapshot`** `jsonb` (GoBD-konformer Adress-Snapshot des Klienten)
* **`line_items`** `jsonb` (Rechnungspositionen)
* **`is_small_business`** `boolean` (True, wenn Kleinunternehmer nach § 19 UStG)
* **`is_reverse_charge`** `boolean` (True, wenn Steuerschuldumkehr nach § 13b UStG)
* **`notes`** `text` (Zahlungshinweise)
* **`related_invoice_id`** `uuid` (Verweis auf Ursprungsrechnung bei Storno)
* **`created_at`** `timestamptz`

* **Dynamische Joins (Clientside):**
  - `clientName` (wird über `client_id` aus den geladenen Clients aufgelöst).

---

## 🛠️ Datenfluss & Synchronisation

1. **Mount-Phasen**: 
   Sobald `therapistId` geladen ist (über `supabase.auth.getSession()`), lädt `fetchDashboardData` in [context.tsx](file:///Users/ivenruether/Downloads/PraxisManager/src/app/dashboard/context.tsx) alle Datensätze parallel. 
2. **Daten-Mapping**:
   Die rohen Datenbankzeilen werden in die TypeScript-Interfaces (`Client`, `Appointment`, etc.) überführt, indem:
   - Relationale Joins Client-seitig aufgelöst werden.
   - Lokale Browserdaten (`localStorage`) für Notizen, Favoriten und Flags injiziert werden.
3. **Schreibzugriffe**:
   Alle Mutationen im Kontext (`handleCreateClient`, `addAppointment`, `updateAppointment`, `deleteClient` etc.) führen das Insert/Update/Delete synchron in Supabase aus und aktualisieren bei Erfolg sofort den lokalen React-State (`setClients`, `setAppointments`), um ein extrem flüssiges Apple-typisches App-Gefühl zu erzielen.

---

## 🔒 Sichere DSGVO-Verifizierung & Datenbank-Funktionen (RPC)

Um gesundheitsbezogene Daten der Patienten konform und sicher zu verarbeiten, läuft die Verifizierung über ein mehrstufiges, token-basiertes Authentifizierungsverfahren (Gated Magic Link). Die Datenabfrage und -manipulation erfolgt über zwei PostgreSQL-Funktionen mit `SECURITY DEFINER`-Rechten. Dadurch können unauthentifizierte Patienten (ohne Supabase-Account) auf das Portal zugreifen, während Datenlecks durch RLS-Umgehungen komplett ausgeschlossen sind.

### 1. `verify_gdpr_birthday(token_val text, birthday_val text)`
* **Zweck**: Überprüft das eingegebene Geburtsdatum des Patienten gegen den in der DB hinterlegten Wert, der dem aktiven Token zugeordnet ist.
* **Sicherheit**: 
  * Bietet Schutz vor Brute-Force-Angriffen (wird nach 5 Fehlversuchen clientseitig gesperrt).
  * Gibt den Namen des Patienten nur dann zurück, wenn das Geburtsdatum korrekt ist. Keine Datenübertragung bei falscher Eingabe.
  * Unterstützt diverse Datumsformate (`YYYY-MM-DD`, `DD.MM.YYYY`, `FMDD.FMMM.YYYY` für deutsche Kurzformate ohne führende Nullen wie `19.2.2008`).

### 2. `submit_gdpr_signature(token_val text, birthday_val text, signature_val text)`
* **Zweck**: Trägt die digitale Unterschrift (Base64 PNG aus HTML5 Canvas) in die Spalte `gdpr_signature` ein, setzt `gdpr_accepted` auf `true` und entwertet zeitgleich den Token (`gdpr_token = NULL`).
* **Sicherheit**:
  * Der Token wird nach erfolgreicher Ausführung sofort ungültig gemacht, sodass der Link kein zweites Mal geöffnet werden kann.
