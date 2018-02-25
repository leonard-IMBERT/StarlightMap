export default class Card {
  constructor(card) {
    this.blueprint = card
    this.card = card.cloneNode(true);
  }

  fill(data) {
    for(let entry in data) {
      this.card.querySelector(`li.${entry}`).innerText = `${entry}: ${data[entry]}`
    }
    return this
  }

  appendIn(element) {
    this.card.hidden = false
    element.appendChild(this.card)
    return this
  }

  remove() {
    this.card.remove();
    delete this;
  }
}
