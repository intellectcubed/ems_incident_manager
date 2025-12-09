# EMS Incident Web App (Static Pages + Supabase Auth)

## Architecture Overview
This is a **static web application** served via GitHub Pages with **no backend or web server**. It uses:
- **Vanilla JavaScript** for all functionality
- **Supabase** for authentication and database queries (client-side)
- **Tampermonkey userscript** for browser integration (generate separate script file)

Design a static web application with two primary screens. The UI should be clean, modern, responsive, and optimized for desktop and mobile. Use clear layout hierarchy, consistent spacing, and easy-to-read typography.

Create the necessary directory structure for all files/assets. The resulting project will be stored in GitHub and served as a static page from GitHub Pages. Supabase credentials should be stored in a separate config file (create placeholder).

---

## Database Schema

```sql
create table public.rip_and_runs (
  incident_number   bigint        not null,
  unit_id           text          not null,
  created_date      timestamptz   not null default now(),
  content           text          not null,

  incident_date     timestamptz not null,
  location          varchar(300),
  incident_type     varchar(20),

  -- Composite primary key
  constraint rip_and_runs_pkey primary key (incident_number, unit_id)
);
```

**Important Notes:**
- The `content` field contains a JSON object with detailed incident information including timeline data
- Example content JSON structure:
```json
{
  "incidentTimes": {
    "cad": "25387463",
    "unit_dispatched": "43C1",
    "incident_type": "STROKE",
    "times": {
      "notifiedByDispatch": {"date": "11/06/2025", "time": "18:32:08"},
      "enRoute": {"date": "11/06/2025", "time": "18:45:12"},
      "backInService": {"date": "11/06/2025", "time": "18:58:39"}
    }
  },
  "incidentLocation": {
    "raw": "BRIDGEWATER TWP FINDERNE AV & FOOTHILL RD",
    "territory": "BRIDGEWATER TWP",
    "street_address": "FINDERNE AV & FOOTHILL RD"
  }
}
```

---

## 1. Login Page

**Purpose:** Authenticate user with Supabase using email + password.
**Prototype image:** /Users/george.nowakowski/Projects/webpages/mrs_incident_manager/ai/screenshots/login.png

**Design Requirements:**
- Centered login card.
- Fields:
  - Email address
  - Password
- "Log In" primary button.
- Error placeholder area under the login button.
- Footer text: "Martinsville Rescue Squad"
- Background should be simple and professional (solid color, subtle gradient, or soft illustration).

**Behavior Notes (for layout guidance only):**
- After successful login, transition to the Incident List page.

---

## 2. Incident List Page (Past Week)

**Purpose:** Display EMS incidents from the past 7 days, starting with today and moving backward.
**Prototype image:** /Users/george.nowakowski/Projects/webpages/mrs_incident_manager/ai/screenshots/main_incident_list.png

### JavaScript Implementation:
**Default Query** (past 7 days, paginated):
```sql
SELECT *
FROM rip_and_runs
WHERE incident_date > NOW() - INTERVAL '7 days'
ORDER BY incident_date DESC
LIMIT 20
OFFSET (page_number - 1) * 20;
```

**Search Behavior:**
- **Date Search:** If a date is entered in the date-picker, query all incidents from that specific date:
  ```sql
  WHERE DATE(incident_date) = '[selected_date]'
  ```
- **Incident Number Search:** If an incident number is entered, query by incident_number (retrieves all units for that incident):
  ```sql
  WHERE incident_number = [entered_incident_number]
  ```

**Layout Requirements:**
- Header with:
  - Title: "EMS Incidents"
  - Logout button
- Filter bar:
  - Date-picker (single date selection for querying specific date)
  - Search field for entering an Incident Number
  - "Search" button
- Table with pagination controls:
  - Display 20 incidents per page
  - Next/Previous buttons
  - Page numbers
- Each row should display:
  - **incident_number**
  - **unit_id**
  - **incident_date** (formatted as Date/Time)
  - **location** (Address)
  - **incident_type**
- Rows should be clickable/selectable.
- Use a clean table layout with alternating row shading.

**Interaction:**
- Clicking a row navigates to the Incident Details page (new page).

---

## 3. Incident Details Page (Times Table)

**Purpose:** Show incident timeline data for the selected incident (new page with back navigation).
**Prototype image:** /Users/george.nowakowski/Projects/webpages/mrs_incident_manager/ai/screenshots/incident_details.png

### JavaScript Implementation:
**Data Source:**
- Parse the `content` field (JSON) from the selected incident
- Extract timeline data from `incidentTimes.times` object
- Display all timeline entries (no limit - all entries will fit on screen)

Example: From the content JSON, extract times like:
```json
{
  "notifiedByDispatch": {"date": "11/06/2025", "time": "18:32:08"},
  "enRoute": {"date": "11/06/2025", "time": "18:45:12"},
  "backInService": {"date": "11/06/2025", "time": "18:58:39"}
}
```

**Layout Requirements:**
- Header with:
  - Back button ("← Incidents") - navigates back to Incident List page
  - Title showing the incident number
- Summary box showing:
  - Address (from `location` field)
  - Unit ID (from `unit_id` field)
  - Incident Type (from `incident_type` field)
- Table showing all timeline entries:
  - **DateTime** (combine date + time from JSON)
  - **Status** (key name, formatted for display: e.g., "notifiedByDispatch" → "Notified By Dispatch")
- Clear distinction between timestamps and statuses.
- Blue "Select" button

**Select Button Behavior:**
1. Save the incident's `content` field (the original JSON string) to Tampermonkey storage:
   ```javascript
   GM_setValue("incident_json", content);
   ```
2. Navigate to: `https://newjersey.imagetrendelite.com/Elite/Organizationnewjersey/`
---

## Design Style

- Clean, professional layout suitable for emergency services.
- Balanced use of whitespace.
- Light or dark theme acceptable; emphasize readability.
- Buttons and inputs should follow consistent styling.
- Tables should be clear and easy to scan.
- Responsive layout that adapts to mobile:
  - Table rows become card-style on small screens.
- Reference /Users/george.nowakowski/Projects/webpages/mrs_incident_manager/styles/globals.css for fonts and color palette guidance. If the styles are not directly usable with vanilla JS/HTML, extract font families, colors, and spacing values as guidelines.

---

## Tampermonkey Script

Generate a separate Tampermonkey userscript file that:
- Provides the `GM_setValue()` and `GM_getValue()` functions used by the web application
- Ensures compatibility with the incident selection workflow
- Include appropriate metadata block with @grant directives for GM_setValue and GM_getValue

---

## Configuration File

Create a `config.js` file with placeholders for Supabase credentials:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
```

