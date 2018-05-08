export default class CardComponent extends HTMLElement {

  static get ElementName() { return 'data-card' }
  static set ElementName(data) { throw new Error('The ElementName property cannot be written') }

  constructor() {
    super();

    //Attach shadow DOM
    this.shadow = this.attachShadow({mode: 'open'})

    this.ul = document.createElement('ul')


    const style = document.createElement('style')


    style.textContent = `
    ul {
      color: inherit;
      list-style: none;
      font-family: inherit;
    }`

    this.shadow.append(style)
    this.shadow.append(this.ul)

  }


  fill(data) {
    this.data = data
    for(let entry in data) {
      const li = document.createElement('li')
      li.classList.add(entry)
      li.textContent = `${entry}: ${data[entry]}`
      this.ul.append(li)
    }
    return this
  }
}

export class Card {

  static get ElementName() { return 'data-card' }
  static set ElementName(data) { throw new Error('The ElementName property cannot be written') }

  constructor() {
    this.div = document.createElement('data-card', { is: 'div' });

    this.ul = document.createElement('ul')


    const style = document.createElement('style')


    style.textContent = `
    ul {
      color: inherit;
      list-style: none;
      font-family: inherit;
    }`

    this.div.append(style)
    this.div.append(this.ul)
  }


  fill(data) {
    this.data = data
    for(let entry in data) {
      const li = document.createElement('li')
      li.classList.add(entry)
      li.textContent = `${entry}: ${data[entry]}`
      this.ul.append(li)
    }
    return this
  }
}
