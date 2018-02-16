const express = require('express');
const Nightmare = require('nightmare');
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/Starlight');

const app = express();
const nightmare = Nightmare({
  gotoTimeout: 120000, // in ms
  executionTimeout: 120000, // in ms
  show: true
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
  constructor(name, posX, posY, currentHealth, maxHealth, items, conditions) {
    this.Name = name;
    this.Position = new Position(posX, posY);
    this.Health = currentHealth;
    this.MaxHealth = maxHealth;
    this.items = items;
    this.condition = conditions
  }

  valueOf() {
    return {
      Name: this.Name,
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
  const IndividualRegex = /(\w*) *\n.*: *(\d+),(\d+) *\n.*: *(\d+)\/(\d+) *\n.*: *((?:\w*[, ]?)*) *\n.*: *((?:\w*[, ]?)*)/
  const PersoRegex = /((?:.+[\s\S])*)(?:\n ?\n|\n ?$])|$/

  const Inhabitants = new Array();
  const persoMatch = data.split(/\n ?\n/)
  for(let inhabitant of persoMatch) {
    const details = inhabitant.match(IndividualRegex)

    /*
     * 1: Name
     * 2: posx
     * 3: posy
     * 4: Health
     * 5: HealthMax
     * 6: Items
     * 7: Conditions
     */

    Inhabitants.push(new Inhabitant(
      details[1],
      details[2],
      details[3],
      details[4],
      details[5],
      details[6].split(', '),
      details[7].split(', ')
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

      alert('done');
      return JSON.stringify(StatusPost)
    }).run((error, result) => {
      if(error) console.error(error)
      console.log(result)
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



refresh()

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(3000, _ => console.log("Server listening on 3000"));
