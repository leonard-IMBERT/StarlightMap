const Nightmare = require('nightmare');
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/Starlight');

function getNightmare() {
  return Nightmare({
    gotoTimeout: 120000, // in ms
    executionTimeout: 120000 // in ms
  })
}

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
  constructor(name, des, posX, posY, currentHealth, maxHealth, items, conditions, profession) {
    this.Name = name;
    this.Description = des
    this.Position = new Position(posX, posY);
    this.Health = currentHealth;
    this.MaxHealth = maxHealth;
    this.items = items;
    this.condition = conditions;
    this.profession = profession;
  }

  valueOf() {
    return {
      Name: this.Name,
      Description: this.Description,
      Postision: this.Position.valueOf(),
      Health: this.Health,
      MaxHealth: this.MaxHealth,
      items: this.items,
      condition: this.condition,
      profession: this.profession,
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
  condition: ['string'],
  profession: ['string'],
})
const StatusMongoose = mongoose.model('Status', {
  date: Date,
  Turn: String,
  Survivors: [InhabitantSchema],
  Craft: String,
  Magic: String
})


function survivorParser(data) {
  const ConditionsRegex = /Conditions: *((?:\w*[, ]?)*)/
  const ItemsRegex = /Items: *((?:\w*[, ]?)*)/
  const PosRegex = /Position: *(\d+), *(\d+)/
  const HealthRegex = /Health: *(\d+)\/(\d+)/
  const ProfessionRegex = /Profession: *(([\w?]*[, ]?)*)/

  const Inhabitants = new Array();
  const persoMatch = data.trim().split(/\n ?\n/)

  for(let inhabitant of persoMatch) {
    
    const details = inhabitant.split(/\n/)
    //TODO: clean temporary fix
    if(!(details.length < 2)) {
      if(
        details[1].match(PosRegex) ||
        details[1].match(HealthRegex) ||
        details[1].match(ItemsRegex) ||
        details[1].match(ConditionsRegex)) details[1] = ""

      const position = inhabitant.match(PosRegex)
      const health = inhabitant.match(HealthRegex)
      const items = inhabitant.match(ItemsRegex)
      const conditions = inhabitant.match(ConditionsRegex)
      const profession = inhabitant.match(ProfessionRegex)

    /*
     * 1: Name
     * 2: Def
     * 3: posx
     * 4: posy
     * 5: Health
     * 6: HealthMax
     * 7: Items
     * 8: Conditions
     * 9: Profession
     */

      Inhabitants.push(new Inhabitant(
        details[0],
        details[1],
        position[1],
        position[2],
        health[1],
        health[2],
        items[1].split(/, */),
        conditions[1].split(/, */),
        profession ? profession[1].split(/, */) : [""],
      ))
    }
  }
  return Inhabitants
}

function looseParser(data) {
  const LooseItems = new Array();
  const PosRegex = /(\d+), *(\d+) *:/;
  const ItemsRegex = /\d+ [\w *]+,?/g;
  const ItemRegex = /(\d+) ([\w *]+)/;

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
        ["Loose"],
        [""],
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
  const HealthRegex = /(\d+)\/(\d+) health/;

  const lines = data.split(/\n/);
  for (const line of lines) {
    try {
      const position = line.match(PosRegex);
      const name = line.split(/:/)[1];
      const health = line.match(HealthRegex);
      Structures.push(new Inhabitant (
        name,
        "Structure",
        position[1],
        position[2],
        health ? health[1] : 0,
        health ? health[2] : 0,
        [""],
        ["Structure"],
        [""]
      ));
    } catch (e) {
      console.error(e);
      console.error(line);
    }
  }
  return Structures;
}

function refreshTurn(turn) {
  console.info("Current turn update started: " + turn.designation);
  const postid = turn.url.split('#')[1];
  return getNightmare()
    .goto(turn.url)
    .wait(5000)
    .evaluate(function(id) {
      const MapUrl = document.querySelector(`#${id} .content > img`).src
      return JSON.stringify(MapUrl);
    }, postid).run((error, result) => {
      if(error) console.error(error);
      result = JSON.parse(result);
      request(result).pipe(fs.createWriteStream('save/map.png'));
      console.info("Current turn update finished");
    }).end();
}

function refresh() {
  console.info("Update started")
  return getNightmare()
    .goto('http://willsaveworldforgold.com/forum/viewtopic.php?f=11&t=243')
    .wait(5000)
    .evaluate(function() {

      const CrawlStatus = {
        BEGINNING: 0,
        TURN_LIST: 1,
        STATUS_LIST: 2,
        MAP_LIST: 3,
        LOOSE_ITEMS: 4,
        STRUCTURE: 5,
      }

      const Posts = document.getElementsByClassName('post');
      const StatusPost = {
        post: Posts[0],
        MapUrl: '',
        Crafting: '',
        Magic: '',
        Survivors: '',
        Turns: [],
        LooseItems:'',
        Structures: '',
      }

      StatusPost.content = StatusPost.post.getElementsByClassName('content')[0];
      StatusPost.MapUrl = StatusPost.content.querySelector('img').src
      const StatusNode =
        Array.from(StatusPost.content.querySelectorAll('.content > :not(br)'))


      let status = CrawlStatus.BEGINNING

      for(let content of StatusNode) {
        if(content.tagName === 'SPAN') status ++
        else {
          switch (status) {
            case CrawlStatus.TURN_LIST:
                for(let a of content.querySelectorAll('.quotecontent a')) {
                  StatusPost.Turns.push({designation: a.text, url: a.href})
                }
              break;
            case CrawlStatus.STATUS_LIST:
                StatusPost.Survivors += (content.querySelector('.quotecontent > div').innerText + `\n\n`)
              break;
            case CrawlStatus.MAP_LIST:
                StatusPost.MapUrl = content.src
              break;
            case CrawlStatus.LOOSE_ITEMS:
                StatusPost.LooseItems = content.querySelector('.quotecontent > div').innerText
                status ++
              break;
            case CrawlStatus.STRUCTURE:
                StatusPost.Structures = content.querySelector('.quotecontent > div').innerText
              break;
            default:
              break;
          }
        }
      }


      //TODO: Proprely parse the craft and the magic
      const CraftingPost = Posts[1];
      StatusPost.Crafting = Array.from(CraftingPost.getElementsByClassName("content")[0].childNodes).find(elem => elem.nodeType === Node.TEXT_NODE).data

      const MagicPost = Posts[2];
      StatusPost.Magic = Array.from(MagicPost.getElementsByClassName("content")[0].childNodes).find(elem => elem.nodeType === Node.TEXT_NODE).data

      return JSON.stringify(StatusPost)
    })
    .run((error, result) => {
      if(error) console.error(error)
      result = JSON.parse(result);
      result.Survivors = survivorParser(result.Survivors)
      result.LooseItems = looseParser(result.LooseItems)
      result.Structures = structureParser(result.Structures)
      refreshTurn(result.Turns[result.Turns.length - 1]);

      request(result.MapUrl).pipe(fs.createWriteStream('save/blankmap.png'));

      (new StatusMongoose({
        date: new Date(),
        Turn: result.Turns[result.Turns.length - 1].designation,
        Survivors: [...result.Survivors,
                    ...result.LooseItems,
                    ...result.Structures],
        Craft: result.Crafting,
        Magic: result.Magic
      })).save().then(_ => console.info("Updated"));
    }).end()
}

function getTurnInfo() {
  return new Promise((resolve, reject) => {
    StatusMongoose.find({}, 'Turn', {
      skip:0,
      limit: 1,
      sort: {
        date: -1
      },
    }, (err, stat) => {
      if(err) { reject(err) }
      resolve(stat)
    })
  })
}

function getAllInfo() {
  return new Promise((resolve, reject) => {
    StatusMongoose.find({}, ['Survivors'], {
      skip:0,
      limit: 1,
      sort: {
        date: -1
      },
    }, (err, stat) => {
      if(err) { reject(err) }
      resolve(stat[0].Survivors)
    })
  })
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
    StatusMongoose.find({}, ['Survivors.items',
                             'Survivors.condition',
                             'Survivors.profession'], {
      skip:0,
      limit: 1,
      sort: {
        date: -1
      },
    }).exec( (err, stat) => {
      if(err) { reject(err) }
      const count = stat[0].Survivors
        .reduce((acc, cur) => {
          const counting = cur.items
                   .concat(cur.condition)
                   .concat(cur.profession)
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
        const search = survivor.items
               .concat(survivor.condition)
               .concat(survivor.profession)
        if(search.find(e => e === stat)) {
          const count = search
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
  getTurnInfo,
  getDetailsAboutStat,
  getCounts,
  getInfoByCoord,
  getAllInfo,
  Position,
  Inhabitant,
  refresh,
}
