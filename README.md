# EMS Incident Manager

A static web application for managing and viewing EMS incident records, built for Martinsville Rescue Squad.

## Architecture

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Hosting**: GitHub Pages (static site)
- **Browser Integration**: Tampermonkey userscript

## Project Structure

```
mrs_incident_manager/
├── index.html                  # Login page
├── incident-list.html          # Incident list with search/pagination
├── incident-details.html       # Incident timeline details
├── css/
│   └── styles.css             # Main stylesheet
├── js/
│   ├── config.js              # Supabase credentials (UPDATE THIS!)
│   ├── supabase-client.js     # Supabase client and query functions
│   ├── login.js               # Login page logic
│   ├── incident-list.js       # Incident list page logic
│   └── incident-details.js    # Incident details page logic
├── tampermonkey/
│   └── ems-incident-integration.user.js  # Tampermonkey userscript
├── ai/
│   ├── prompts/
│   │   └── EMSIncidentWebApp.md  # Original requirements
│   └── screenshots/           # UI mockups
└── styles/
    └── globals.css            # Design system reference
```

## Setup Instructions

### 1. Configure Supabase Credentials

Edit `js/config.js` and replace the placeholder values with your actual Supabase credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 2. Deploy to GitHub Pages

1. Create a new GitHub repository (or use existing)
2. Push this project to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: EMS Incident Manager"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Select "main" branch as source
   - Click Save
4. Your app will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### 3. Install Tampermonkey Script

1. Install Tampermonkey browser extension:
   - [Chrome/Edge](https://chrome.google.com/webstore/detail/tampermonkey/)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Safari](https://apps.apple.com/app/tampermonkey/id1482490089)

2. Update the script's @match directive:
   - Open `tampermonkey/ems-incident-integration.user.js`
   - Update line with `@match` to match your GitHub Pages URL:
     ```javascript
     // @match        https://YOUR_USERNAME.github.io/YOUR_REPO/*
     ```

3. Install the script:
   - Open Tampermonkey dashboard
   - Click "+" to create new script
   - Paste the contents of `ems-incident-integration.user.js`
   - Save (Ctrl+S or Cmd+S)

### 4. Set Up Supabase Database

Ensure your Supabase database has the following table:

```sql
create table public.rip_and_runs (
  incident_number   bigint        not null,
  unit_id           text          not null,
  created_date      timestamptz   not null default now(),
  content           text          not null,
  incident_date     timestamptz   not null,
  location          varchar(300),
  incident_type     varchar(20),

  constraint rip_and_runs_pkey primary key (incident_number, unit_id)
);
```

Enable Row Level Security (RLS) and create appropriate policies for authenticated users.

## Usage

### Login

1. Navigate to your GitHub Pages URL
2. Enter your email and password (configured in Supabase Auth)
3. Click "Log In"

### View Incidents

- **Default view**: Shows incidents from the past 7 days, most recent first
- **20 incidents per page** with pagination controls
- Click any row to view detailed timeline

### Search/Filter

- **By Date**: Select a date to view all incidents from that specific day
- **By Incident Number**: Enter an incident number to view all units for that incident
- Click "Clear" to return to default 7-day view

### View Incident Details

- Click on any incident row to view details
- Shows summary: Unit ID, Address, Incident Type
- Displays timeline of events (sorted chronologically)
- Click "← Incidents" to return to list

### Select Incident for ImageTrend Elite

1. On the incident details page, click "Select This Incident"
2. The incident data is saved via Tampermonkey
3. You're automatically redirected to ImageTrend Elite
4. The incident data is available for form auto-fill (if implemented)

### Console Helpers

When on ImageTrend Elite with the Tampermonkey script active:

```javascript
// View saved incident data
viewEMSIncidentData()

// Clear saved incident data
clearEMSIncidentData()

// Access incident data object
console.log(window.EMSIncidentData)
```

## Database Schema

### `content` Field Structure

The `content` field stores incident details as JSON:

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

## Customization

### Styling

The app uses CSS variables for theming. To customize colors:

1. Edit `css/styles.css`
2. Modify the `:root` CSS variables at the top of the file

### Auto-fill ImageTrend Elite Forms

To implement auto-fill functionality:

1. Open `tampermonkey/ems-incident-integration.user.js`
2. Customize the `fillIncidentForm()` function
3. Map incident data fields to ImageTrend Elite form inputs
4. Save and reload

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (with Tampermonkey)
- Mobile: ✅ Responsive design (table converts to cards on mobile)

## Security Notes

- Never commit `js/config.js` with real credentials to a public repository
- Use environment-specific config files or GitHub Secrets for production
- Supabase credentials are client-side visible - use Row Level Security (RLS)
- The anon key should only have read access to the `rip_and_runs` table

## Troubleshooting

### "Supabase library not loaded"
- Check your internet connection
- Verify the Supabase CDN script is loading (check browser DevTools Network tab)

### "Tampermonkey is not detected"
- Ensure Tampermonkey extension is installed and enabled
- Verify the userscript is active for your GitHub Pages URL
- Check the @match directive in the script

### Pagination not working
- Check browser console for errors
- Verify Supabase queries are returning count correctly
- Ensure you're authenticated

### Timeline not displaying
- Verify the `content` field contains valid JSON
- Check browser console for parsing errors
- Ensure the JSON structure matches the expected format

## Development

To test locally:

```bash
# Serve with any static file server
python -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`

**Note**: Update the Tampermonkey script @match to include localhost for local testing:
```javascript
// @match        http://localhost:*/*
```

## License

Proprietary - Martinsville Rescue Squad

## Support

For issues or questions, contact your system administrator.
