class FirstHACard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .card-container {
              padding: 16px;
            }
            .sensor-name {
              font-size: 1.2em;
              font-weight: bold;
              text-align: center;
              margin-bottom: 12px;
            }
            .values-row {
              display: flex;
              justify-content: space-between;
            }
            .value-box {
              flex: 1;
              text-align: center;
            }
            .value-label {
              font-size: 0.85em;
              color: var(--secondary-text-color);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            }
            .value-label ha-icon {
              --mdc-icon-size: 18px;
            }
            .value {
              font-size: 1.8em;
              font-weight: bold;
            }
          </style>
          <div class="card-container">
            <div class="sensor-name"></div>
            <div class="values-row">
              <div class="value-box">
                <div class="value-label"><ha-icon icon="mdi:thermometer"></ha-icon></div>
                <div class="value temp-value"></div>
              </div>
              <div class="value-box">
                <div class="value-label"><ha-icon icon="mdi:water-percent"></ha-icon></div>
                <div class="value hum-value"></div>
              </div>
            </div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector('.card-container');
    }

    const tempEntity = hass.states[this.config.entity];
    const humEntity = hass.states[this.config.humidity_entity];

    const name = this.config.name || (tempEntity ? tempEntity.attributes.friendly_name : this.config.entity);
    const temp = tempEntity ? tempEntity.state : 'N/A';
    const tempUnit = tempEntity ? tempEntity.attributes.unit_of_measurement || '°C' : '°C';
    const hum = humEntity ? humEntity.state : 'N/A';
    const humUnit = humEntity ? humEntity.attributes.unit_of_measurement || '%' : '%';

    this.querySelector('.sensor-name').textContent = name;
    this.querySelector('.temp-value').textContent = `${temp} ${tempUnit}`;
    this.querySelector('.hum-value').textContent = `${hum} ${humUnit}`;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity (temperature sensor)');
    }
    if (!config.humidity_entity) {
      throw new Error('Please define a humidity_entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 2;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.temperature',
      humidity_entity: 'sensor.humidity',
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
