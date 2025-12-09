## Overview:
Create a clean, modern static web app with three frames: a login screen, an incident list screen, and an incident detail screen. The login screen should show a centered card with User ID, Password, and a Login button, with minimal styling and a professional EMS look. After login, design a screen showing EMS incidents from the past 7 days in a scrollable table with columns for Incident Number, Unit ID, Date/Time, Address, and Incident Type. Include a small search area with a date picker and an incident number field. Each row should be selectable. The detail screen should show a header with a back button and a table listing incident status times, with columns for Date/Time and Status (about 5–10 rows).

## Pages:

### Login: 
prototype image: /Users/george.nowakowski/Projects/webpages/mrs_incident_manager/ai/screenshots/login.png
- A small panel with authentication fields and a login button.
User
Password

Pressing Login should call Supabase for authentication


### Main incident list
prototype image: /Users/george.nowakowski/Projects/webpages/mrs_incident_manager/ai/screenshots/main_incident_list.png
title: EMS Incidents - Last 7 Days
Search bar: contains magnifying glass image, date entry input (with date picker), Incident number input
Result table: columns: [INCIDENT NUMBER, UNIT ID, DATE/TIME, ADDRESS, INCIDENT TYPE]
- table shows  30 incidents
text centered at the bottom: 'Showing 21 of 21 Incidents' (not shown on image, but should have a way to page next/previous)
- Table should highlight rows as I hover over them
- Clicking on a row will bring up Incident Details page

### Incident details page
prototype: /Users/george.nowakowski/Projects/webpages/mrs_incident_manager/ai/screenshots/incident_details.png
- shows a link at the top with a back arrow "Back to incidents"
- Title: Incident Details - <incident number>
- Panel with title Incident Information.
	- Incident Number
	- Unit ID
	- Date/Time
	- Incident Type
	- Address

- Panel with title:  Status History
	- table with columns: [DATE/TIME, STATUS]
	- table will show up to 20 rows