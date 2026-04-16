# First HA Card

A custom Home Assistant Lovelace card.

## Installation

1. Copy `src/first-ha-card.js` to your `config/www/` folder.
2. Add the resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Add `/local/first-ha-card.js` as **JavaScript Module**

## Usage

Add the card to your dashboard:

```yaml
type: custom:first-ha-card
entity: sun.sun
```

## Configuration

| Option   | Type   | Required | Description              |
|----------|--------|----------|--------------------------|
| `entity` | string | Yes      | The entity ID to display |
