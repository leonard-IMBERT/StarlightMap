const Position = require('./Position');

/**
 * Class representing an Inhabitant of the island
 */
class Inhabitant {
  /**
   * The default constructor for an Inhabitant of the island.
   * @param {String} name The name of the inhabitant
   * @param {String} des The description of the inhabitant
   * @param {Number} posX The x position of the inhabitant
   * @param {Number} posY The y position of the inhabitant
   * @param {Number} currentHealth The currant health of the inhabitant
   * @param {Number} maxHealth The maximum health of the inhabitant
   * @param {String[]} items An array containing the items of the inhabitant
   * @param {String[]} conditions An array containing the different status of the inhabitant
   * @param {[{ Name: string, Level: string }]} jobs An array containing the jobs of the inhabitant
   */
  constructor(name, des, posX, posY, currentHealth, maxHealth, items, conditions, jobs) {
    this.Name = name;
    this.Description = des;
    this.Position = new Position(posX, posY);
    this.Health = currentHealth;
    this.MaxHealth = maxHealth;
    this.items = items;
    this.conditions = conditions;
    this.jobs = jobs;
  }

  /**
   * Return a simple representation of the inhabitant
   */
  valueOf() {
    return {
      Name: this.Name,
      Description: this.Description,
      Postision: this.Position.valueOf(),
      Health: this.Health,
      MaxHealth: this.MaxHealth,
      items: this.items,
      conditions: this.conditions,
      jobs: this.jobs,
    };
  }
}

module.exports = Inhabitant;
