# Job Portal Frontend

Angular-based frontend for the Job Portal application.

## Features

- **Dashboard**: View job statistics over the last 30 days with an interactive chart
- **Multi-page Application**: Clean navigation between Dashboard and Settings
- **Settings Management**: Configure API URL and API key
- **Local Storage**: All settings are persisted in browser localStorage
- **Hidden Companies**: Support for hidden companies with API key permissions

## Development

### Prerequisites

- Node.js 18+ and npm
- Backend API running (default: http://localhost:8000)

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Configuration

### API Settings

The frontend needs to connect to the Backend API. You can configure this in the Settings page:

1. Navigate to Settings (click "Settings" in the navigation)
2. Set the API URL (default: `http://localhost:8000`)
3. Optionally, enter an API key for authenticated access
4. Click "Save Settings"

### API Key Permissions

- **No API Key**: Public access only (hidden companies are filtered out)
- **Read Permission**: View job listings and statistics
- **Read + Read_Hidden Permission**: Access hidden company data
- **Admin**: Full access to all features

## Pages

### Dashboard (`/`)

- Displays a line chart showing total open positions across all accessible companies
- Shows data from the last 30 days up to today
- Automatically refreshes data when loaded
- Manual refresh button available

### Settings (`/settings`)

- Configure API URL
- Set API key (stored securely in localStorage)
- Test connection to the API
- Clear all settings

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── home/          # Dashboard component
│   │   └── settings/      # Settings component
│   ├── services/
│   │   ├── api.service.ts      # Backend API communication
│   │   └── settings.service.ts # LocalStorage management
│   ├── app.routes.ts      # Routing configuration
│   ├── app.config.ts      # App configuration
│   └── app.ts             # Root component
├── assets/                # Static assets
├── index.html            # Main HTML file
└── styles.css           # Global styles
```

## Technologies

- **Angular 21**: Frontend framework
- **Chart.js**: Data visualization
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming
- **LocalStorage API**: Client-side data persistence

## Notes

- All settings are stored in browser localStorage under the key `jobportal_settings`
- API keys are stored in plain text in localStorage (consider your security requirements)
- The chart aggregates data across all companies the user has access to
- Hidden companies require an API key with `read_hidden` permission
