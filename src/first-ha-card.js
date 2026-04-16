console.info('%c FIRST-HA-CARD v3 loaded ', 'background: #03a9f4; color: #fff; font-weight: bold;');

// ===================== VISUAL EDITOR =====================
class FirstHACardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...config };
    // Migrate old format
    if (!this._config.sensors && this._config.entity) {
      this._config.sensors = [{
        name: this._config.name || '',
        temperature: this._config.entity,
        humidity: this._config.humidity_entity || '',
      }];
    }
    if (!this._config.sensors) {
      this._config.sensors = [];
    }
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    if (!this._config) return;

    const sensors = this._config.sensors || [];

    this.innerHTML = `
      <style>
        .editor {
          padding: 8px;
        }
        .editor label {
          display: block;
          font-weight: 500;
          margin: 8px 0 4px;
        }
        .editor input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #000);
        }
        .sensor-block {
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
          position: relative;
        }
        .sensor-block .sensor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .sensor-block .sensor-header strong {
          font-size: 0.95em;
        }
        .btn-remove {
          background: none;
          border: none;
          color: var(--error-color, #db4437);
          cursor: pointer;
          font-size: 1.2em;
          padding: 4px 8px;
        }
        .btn-add {
          display: block;
          width: 100%;
          padding: 10px;
          margin-top: 12px;
          background: var(--primary-color, #03a9f4);
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.95em;
        }
      </style>
      <div class="editor">
        <label>Titel</label>
        <input type="text" id="title" value="${this._config.title || ''}" placeholder="z.B. Sensoren" />

        <label>Sensoren</label>
        ${sensors.map((s, i) => `
          <div class="sensor-block">
            <div class="sensor-header">
              <strong>Sensor ${i + 1}</strong>
              <button class="btn-remove" data-index="${i}" title="Entfernen">✕</button>
            </div>
            <label>Name</label>
            <input type="text" data-index="${i}" data-field="name" value="${s.name || ''}" placeholder="z.B. Wohnzimmer" />
            <label>Temperatur Entity</label>
            <input type="text" data-index="${i}" data-field="temperature" value="${s.temperature || ''}" placeholder="sensor.temperatur_..." />
            <label>Luftfeuchtigkeit Entity</label>
            <input type="text" data-index="${i}" data-field="humidity" value="${s.humidity || ''}" placeholder="sensor.luftfeuchtigkeit_..." />
          </div>
        `).join('')}

        <button class="btn-add" id="add-sensor">+ Sensor hinzufügen</button>
      </div>
    `;

    // Title change
    this.querySelector('#title').addEventListener('input', (e) => {
      this._config = { ...this._config, title: e.target.value };
      this._fireChanged();
    });

    // Sensor field changes
    this.querySelectorAll('.sensor-block input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const field = e.target.dataset.field;
        const sensors = [...this._config.sensors];
        sensors[idx] = { ...sensors[idx], [field]: e.target.value };
        this._config = { ...this._config, sensors };
        this._fireChanged();
      });
    });

    // Remove sensor
    this.querySelectorAll('.btn-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const sensors = [...this._config.sensors];
        sensors.splice(idx, 1);
        this._config = { ...this._config, sensors };
        this._fireChanged();
        this.render();
      });
    });

    // Add sensor
    this.querySelector('#add-sensor').addEventListener('click', () => {
      const sensors = [...(this._config.sensors || []), { name: '', temperature: '', humidity: '' }];
      this._config = { ...this._config, sensors };
      this._fireChanged();
      this.render();
    });
  }

  _fireChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('first-ha-card-editor', FirstHACardEditor);

// ===================== CARD =====================
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
    const cfg = { ...config };
    // Migrate old format
    if (!cfg.sensors && cfg.entity) {
      cfg.sensors = [{
        name: cfg.name || '',
        temperature: cfg.entity,
        humidity: cfg.humidity_entity || '',
      }];
    }
    if (!cfg.sensors || !Array.isArray(cfg.sensors) || cfg.sensors.length === 0) {
      throw new Error('Please define at least one sensor in the sensors array');
    }
    this.config = cfg;
  }

  getCardSize() {
    return 1 + (this.config ? this.config.sensors.length : 1);
  }

  static getConfigElement() {
    return document.createElement('first-ha-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'Sensoren',
      sensors: [
        { name: 'Schlafzimmer', temperature: 'sensor.temperature_76', humidity: 'sensor.temperature_77' },
        { name: 'Wohnzimmer', temperature: 'sensor.wohnzimmer_innen_2', humidity: 'sensor.wohnzimmer_innen' },
        { name: 'Flur', temperature: 'sensor.temperature_63', humidity: 'sensor.temperature_64' },
      ],
    };
  }
}

customElements.define('first-ha-card', FirstHACard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'first-ha-card',
  name: 'First HA Card',
  description: 'Sensor-Tabelle mit Temperatur und Luftfeuchtigkeit',
  preview: true,
  documentationURL: 'https://github.com/Mario-333/first-HA-Card',
});
