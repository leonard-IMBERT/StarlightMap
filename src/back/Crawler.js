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
  Survivors: [InhabitantSchema],
  Craft: String,
  Magic: String
})


function survivorParser(data) {
  const ConditionsRegex = /Conditions: *((?:\w*[, ]?)*)/
  const ItemsRegex = /Items: *((?:\w*[, ]?)*)/
  const PosRegex = /Position: *(\d+), *(\d+)/
  const HealthRegex = /Health: *(\d+)\/(\d+)/

  const Inhabitants = new Array();
  const persoMatch = data.split(/\n ?\n/)

  for(let inhabitant of persoMatch) {
    const details = inhabitant.split(/\n/)

    //TODO: clean temporary fix
    if(
      details[1].match(PosRegex) ||
      details[1].match(HealthRegex) ||
      details[1].match(ItemsRegex) ||
      details[1].match(ConditionsRegex)) details[1] = ""

    const position = inhabitant.match(PosRegex)
    const health = inhabitant.match(HealthRegex)
    const items = inhabitant.match(ItemsRegex)
    const conditions = inhabitant.match(ConditionsRegex)

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

function looseParser(data) {
  const LooseItems = new Array();
  const PosRegex = /(\d+), *(\d+) *:/;
  const ItemsRegex = /\d+ [\w ]+,?/g;
  const ItemRegex = /(\d+) ([\w ]+)/;

  const lines = data.split(/\n/);
  for (const line of lines) {
    try {
      const position = line.match(PosRegex);
      const items = [];
      for (const item of line.match(ItemsRegex)) {
        const itemMatch = item.match(ItemRegex);
        for (let count = 0; count < Number(itemMatch[1]); count++) {
          items.push(itemMatch[2]);
        }
      }
      LooseItems.push(new Inhabitant (
        "Loose Items",
        "",
        position[1],
        position[2],
        0, 0, // Health, not valid
        items,
        ["Loose"]
      ));
    } catch (e) {
      console.error(e);
      console.error(line);
    }
  }
  return LooseItems;
}

function structureParser(data) {
  const Structures = new Array();
  const PosRegex = /(\d+), *(\d+) *:/;

  const lines = data.split(/\n/);
  for (const line of lines) {
    try {
      const position = line.match(PosRegex);
      const name = line.split(/:/)[1];
      Structures.push(new Inhabitant (
        name,
        "Structure",
        position[1],
        position[2],
        0, 0, // TODO: Parse health once we have example
        [""],
        ["Structure"]
      ));
    } catch (e) {
      console.error(e);
      console.error(line);
    }
  }
  return Structures;
}

function refresh() {
  console.info("Update started")
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
      for(race of ["Humans", "Halflings", "Dwarves", "Elves"]) {
        result.Status[race] = survivorParser(result.Status[race])
      }
      result.Status.LooseItems = looseParser(result.Status["Loose Items"])
      result.Status.Structures = structureParser(result.Status["Structures"])
      request(result.MapUrl).pipe(fs.createWriteStream('save/map.png'));

      (new StatusMongoose({
        date: new Date(),
        Survivors: [...result.Status.Humans,
                    ...result.Status.Halflings,
                    ...result.Status.Dwarves,
                    ...result.Status.Elves,
                    ...result.Status.LooseItems,
                    ...result.Status.Structures],
        Craft: result.Crafting,
        Magic: result.Magic
      })).save().then(_ => console.info("Updated"));
    }).end()
}

function getInfoByCoord(x, y) {
  return new Promise((resolve, reject) => {
    StatusMongoose.find({}, ['Survivors'], {
      skip:0,
      limit: 1,
      sort: {
        date: -1
      },
    }, (err, stat) => {
      if(err) { reject(err) }
      const inhab = stat[0].Survivors
        .filter(i => i !== null && i !== undefined)
        .filter(i => i.Position.x == x && i.Position.y == y)
      resolve(inhab)
    })
  })
}

function getCounts() {
  return new Promise((resolve, reject) => {
    StatusMongoose.find({}, ['Survivors.items', 'Survivors.condition'], {
      skip:0,
      limit: 1,
      sort: {
        date: -1
      },
    }).exec( (err, stat) => {
      if(err) { reject(err) }
      const count = stat[0].Survivors
        .reduce((acc, cur) => {
          const counting = cur.items.concat(cur.condition)
          for (const item of counting) {
            if (!item) continue
            if (item in acc) acc[item]++
            else acc[item] = 1
          }
          return acc
        }, {})
      resolve(count)
    })
  })
}

function getDetailsAboutStat(stat) {
  return new Promise((resolve, reject) => {
    StatusMongoose.find({}, ['Survivors'], {
      skip: 0,
      limit: 1,
      sort: {
        date: -1
      }
    }).exec((err, d) => {
      if(err) { reject(err) }
      const details = []
      const survivors = d[0].Survivors;
      for(const survivor of survivors) {
        if(survivor.items.find(e => e === stat)
          || survivor.condition.find(e => e === stat)) {
          const count = [...survivor.items, ...survivor.condition]
            .filter(elem => elem === stat)
            .length
          details.push([survivor.Name,
                        survivor.Position.x,
                        survivor.Position.y,
                        count])
        }
      }
      resolve(details)
    })
  })
}

module.exports = {
  getDetailsAboutStat,
  getCounts,
  getInfoByCoord,
  Position,
  Inhabitant,
  refresh,
}
