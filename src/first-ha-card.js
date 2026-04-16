class FirstHACard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <ha-card header="First HA Card">
          <div class="card-content"></div>
        </ha-card>
      `;
      this.content = this.querySelector('.card-content');
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = state ? state.state : 'unavailable';

    this.content.innerHTML = `
      <p><strong>${entityId}:</strong> ${stateStr}</p>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 1;
  }

  static getStubConfig() {
    return { entity: 'sun.sun' };
  }
}

customElements.define('first-ha-card', FirstHACard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'first-ha-card',
  name: 'First HA Card',
  description: 'My first custom Home Assistant card',
});
