class FirstHACard extends HTMLElement {
  set hass(hass) {
    const sensors = this.config.sensors || [];

    if (!this._built) {
      this.innerHTML = `
        <ha-card>
          <style>
            .card-container {
              padding: 16px;
            }
            .card-title {
              font-size: 1.2em;
              font-weight: bold;
              text-align: center;
              margin-bottom: 12px;
            }
            .sensor-table {
              width: 100%;
              border-collapse: collapse;
            }
            .sensor-table tr {
              border-bottom: 1px solid var(--divider-color, #e0e0e0);
            }
            .sensor-table tr:last-child {
              border-bottom: none;
            }
            .sensor-table td {
              padding: 8px 4px;
              vertical-align: middle;
            }
            .sensor-name {
              font-weight: 500;
              flex: 1;
            }
            .sensor-value {
              display: flex;
              align-items: center;
              gap: 6px;
              white-space: nowrap;
            }
            .sensor-value ha-icon {
              --mdc-icon-size: 20px;
              color: var(--secondary-text-color);
            }
            .sensor-value span {
              font-size: 1.1em;
              font-weight: bold;
            }
            td.col-name {
              width: 40%;
            }
            td.col-temp, td.col-hum {
              width: 30%;
            }
            .table-header {
              font-size: 0.85em;
              color: var(--secondary-text-color);
              padding: 4px;
              text-align: left;
            }
            .table-header .sensor-value {
              justify-content: flex-start;
            }
          </style>
          <div class="card-container">
            <div class="card-title"></div>
            <table class="sensor-table">
              <thead>
                <tr class="table-header">
                  <td class="col-name"></td>
                  <td class="col-temp">
                    <div class="sensor-value">
                      <ha-icon icon="mdi:thermometer"></ha-icon>
                    </div>
                  </td>
                  <td class="col-hum">
                    <div class="sensor-value">
                      <ha-icon icon="mdi:water-percent"></ha-icon>
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody class="sensor-rows"></tbody>
            </table>
          </div>
        </ha-card>
      `;
      this._built = true;
    }

    // Title
    const titleEl = this.querySelector('.card-title');
    titleEl.textContent = this.config.title || '';
    titleEl.style.display = this.config.title ? '' : 'none';

    // Build rows
    const tbody = this.querySelector('.sensor-rows');
    tbody.innerHTML = '';

    for (const sensor of sensors) {
      const tempState = hass.states[sensor.temperature];
      const humState = hass.states[sensor.humidity];

      const name = sensor.name
        || (tempState ? tempState.attributes.friendly_name : sensor.temperature);
      const temp = tempState ? tempState.state : 'N/A';
      const tempUnit = tempState ? tempState.attributes.unit_of_measurement || '°C' : '°C';
      const hum = humState ? humState.state : 'N/A';
      const humUnit = humState ? humState.attributes.unit_of_measurement || '%' : '%';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-name sensor-name">${name}</td>
        <td class="col-temp">
          <div class="sensor-value">
            <ha-icon icon="mdi:thermometer"></ha-icon>
            <span>${temp} ${tempUnit}</span>
          </div>
        </td>
        <td class="col-hum">
          <div class="sensor-value">
            <ha-icon icon="mdi:water-percent"></ha-icon>
            <span>${hum} ${humUnit}</span>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  setConfig(config) {
    if (!config.sensors || !Array.isArray(config.sensors) || config.sensors.length === 0) {
      throw new Error('Please define at least one sensor in the sensors array');
    }
    for (const s of config.sensors) {
      if (!s.temperature) throw new Error('Each sensor needs a temperature entity');
      if (!s.humidity) throw new Error('Each sensor needs a humidity entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 1 + (this.config ? this.config.sensors.length : 1);
  }

  static getStubConfig() {
    return {
      title: 'Sensoren',
      sensors: [
        { name: 'Wohnzimmer', temperature: 'sensor.temp_wohnzimmer', humidity: 'sensor.hum_wohnzimmer' },
      ],
    };
  }
}

customElements.define('first-ha-card', FirstHACard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'first-ha-card',
  name: 'First HA Card',
  description: 'My first custom Home Assistant card',
});
