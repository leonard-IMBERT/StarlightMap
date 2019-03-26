import Survivor from '../types/Survivor';

class Card {
  static get ElementName() { return 'data-card'; }

  static set ElementName(data) { throw new Error('The ElementName property cannot be written'); }

  public div: HTMLElement;
  public ul: HTMLUListElement;
  public data: Survivor;

  constructor() {
    this.div = document.createElement('data-card', { is: 'div' });

    this.ul = document.createElement('ul');


    const style = document.createElement('style');


    style.textContent = `
    ul {
      color: inherit;
      list-style: none;
      font-family: inherit;
    }`;

    this.div.append(style);
    this.div.append(this.ul);
  }

  hide(value: boolean | null): Card {
    if (value != null) this.div.hidden = value;
    else this.div.hidden = !this.div.hidden;
    return this;
  }

  fill(data: Survivor) {
    this.data = data;
    new Map<string, string>()
      .set('Name', data.Name)
      .set('Description', data.Description)
      .set('Health', data.Health)
      .set('Position', data.Position)
      .set('Items', data.Items)
      .forEach((value, key) => {
        if (value) {
          const li = document.createElement('li');
          li.classList.add(key);
          li.textContent = `${key}: ${value}`;
          this.ul.append(li);
        }
      })
    return this;
  }
}

export default Card;