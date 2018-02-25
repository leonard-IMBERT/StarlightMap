const Nightmare = require('nightmare');
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/Starlight');

const nightmare = Nightmare({
  gotoTimeout: 120000, // in ms
  executionTimeout: 120000 // in ms
})

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  valueOf() {
    return {
      x: this.x,
      y: this.y
    }
  }
}

class Inhabitant {
  constructor(name, des, posX, posY, currentHealth, maxHealth, items, conditions) {
    this.Name = name;
    this.Description = des
    this.Position = new Position(posX, posY);
    this.Health = currentHealth;
    this.MaxHealth = maxHealth;
    this.items = items;
    this.condition = conditions
  }

  valueOf() {
    return {
      Name: this.Name,
      Description: this.Description,
      Postision: this.Position.valueOf(),
      Health: this.Health,
      MaxHealth: this.MaxHealth,
      items: this.items,
      condition: this.condition
    }
  }
}
const PositionSchema = new Schema({ x: 'number', y: 'number' })
const InhabitantSchema = new Schema({
  Name: 'string',
  Description: 'string',
  Position: {
    type: PositionSchema
  },
  Health: 'number',
  MaxHealth: 'number',
  items: ['string'],
  condition: ['string']
})
const StatusMongoose = mongoose.model('Status', {
  date: Date,
  Humans: [InhabitantSchema],
  Halflings: [InhabitantSchema],
  Dwarves: [InhabitantSchema],
  Elves: [InhabitantSchema],
  Craft: String,
  Magic: String
})


function parser(data) {
  const ConditionsRegex = /Conditions: *((?:\w*[, ]?)*)/
  const ItemsRegex = /Items: *((?:\w*[, ]?)*)/
  const PosRegex = /Position: *(\d+), *(\d+)/
  const HealthRegex = /Health: *(\d+)\/(\d+)/

  const Inhabitants = new Array();
  const persoMatch = data.split(/\n ?\n/)

  for(let inhabitant of persoMatch) {
    const details = inhabitant.split(/\n/)

    const position = details[2].match(PosRegex)
    const health = details[3].match(HealthRegex)
    const items = details[4].match(ItemsRegex)
    const conditions = details[5].match(ConditionsRegex)

    /*
     * 1: Name
     * 2: Def
     * 3: posx
     * 4: posy
     * 5: Health
     * 6: HealthMax
     * 7: Items
     * 8: Conditions
     */

    Inhabitants.push(new Inhabitant(
      details[0],
      details[1],
      position[1],
      position[2],
      health[1],
      health[2],
      items[1].split(/, */),
      conditions[1].split(/, */)
    ))
  }
  return Inhabitants
}

function refresh() {
  return nightmare
    .goto('http://willsaveworldforgold.com/forum/viewtopic.php?f=11&t=243')
    .wait(5000)
    .evaluate(function() {

      const Posts = document.getElementsByClassName("post");
      const StatusPost = {
        post: Posts[0],
        Status: {},
        MapUrl: '',
        Crafting: '',
        Magic: ''
      }

      StatusPost.content = StatusPost.post.getElementsByClassName("content")[0];
      StatusPost.MapUrl = Array.from(StatusPost.content.children).find(element => element.tagName === 'IMG').src
      const StatusNode = Array.from(StatusPost.content.childNodes).filter(elem => elem.tagName !== "BR")

      for(let content in StatusNode) {
        content = Number(content)
        try {
          if(StatusNode[content].nodeType === Node.TEXT_NODE
            && StatusNode[content + 1].tagName === 'DIV'
          ) {
            const dataDiv = Array.from(StatusNode[content + 1].children).find(elem => elem.className === 'quotecontent')
            StatusPost.Status[StatusNode[content].data] = dataDiv.firstElementChild.innerText
          }
        } catch(e) {}
      }


      const CraftingPost = Posts[1];
      StatusPost.Crafting = Array.from(CraftingPost.getElementsByClassName("content")[0].childNodes).find(elem => elem.nodeType === Node.TEXT_NODE).data

      const MagicPost = Posts[2];
      StatusPost.Magic = Array.from(MagicPost.getElementsByClassName("content")[0].childNodes).find(elem => elem.nodeType === Node.TEXT_NODE).data

      return JSON.stringify(StatusPost)
    }).run((error, result) => {
      if(error) console.error(error)
      result = JSON.parse(result);
      for(race in result.Status) {
        result.Status[race] = parser(result.Status[race])
      }
      request(result.MapUrl).pipe(fs.createWriteStream('save/map.png'));

      (new StatusMongoose({
        date: new Date(),
        Humans: result.Status.Humans,
        Halflings: result.Status.Halflings,
        Dwarves: result.Status.Dwarves,
        Elves: result.Status.Elves,
        Craft: result.Crafting,
        Magic: result.Magic
      })).save().then(_ => console.log("Updated"));
    }).end()
}

function getInfoByCoord(x, y) {
  return new Promise((resolve, reject) => {
    StatusMongoose.find({}, ['Humans', 'Halflings', 'Elves', 'Dwarves'], {
      skip:0,
      limit: 1,
      sort: {
        date: -1
      },
    }, (err, stat) => {
      if(err) { reject(err) }
      stat = stat[0]
      const inhab = [...stat.Humans, ...stat.Halflings, ...stat.Elves, ...stat.Dwarves]
        .filter(i => i !== null && i !== undefined)
        .filter(i => i.Position.x == x && i.Position.y == y)
      resolve(inhab)
    })
  })
}

module.exports = {
  getInfoByCoord,
  Position,
  Inhabitant,
  refresh,
}
