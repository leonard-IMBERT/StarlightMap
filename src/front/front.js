import Drawer from './drawer/Drawer'
import Images from './drawer/Images'
import Hexagon from './hexagon/hexagon'

import Requests from './init.js'


const canvas = document.querySelector("canvas#map")

const drawer = new Drawer(canvas);
const map = new Images()

const data = document.querySelector("div#data")
const dataBlueprint = document.querySelector("div.data")
const dataButton = document.querySelector("button#dataButton")

const stats = document.querySelector("div#stats")

const table = document.querySelector('table#resources')

const tableDetails = document.querySelector('table#resourceDetails')

const hexagons = []

function translateCoordinate (x, y) {
  return {
    x: map.width/canvas.clientWidth * x,
    y: map.height/canvas.clientHeight * y
  }
}

function fetchMetadata() {
  return fetch(Requests.MetadataRequest()).then(d => d.json())
}

function getSurvivors(x,y) {
  ((x && y) ? fetch(Requests.InfoRequest(x,y)) : fetch(Requests.AllInfoRequest()))
  .then(d => d.json())
  .then(d => {
    while(data.firstChild) {
      data.removeChild(data.firstChild);
    }
    for(const inhab of d) {
      const card = document.createElement('data-card')
      card.fill({
        Name: inhab.Name,
        Description: inhab.Description,
        Position: `${inhab.Position.x},${inhab.Position.y}`,
        Health: `${inhab.Health}/${inhab.MaxHealth}`,
        Items: inhab.items.toString().replace(/,/g,', '),
        Conditions: inhab.condition.toString().replace(/,/g,', ')
      })
      card.addEventListener('click', e => {
        let hexa = hexagons.find(hexa => hexa.coord.x === inhab.Position.x && hexa.coord.y === inhab.Position.y)
        if(hexa) {
          drawer.clean()
          drawer.drawImageScale(0,0,1,map)
          hexa.draw(drawer)
        }
      })
      data.append(card)
    }
  })
}

dataButton.addEventListener('click', e => getSurvivors());

map.load('/map', 962, 924, 0, 0).then(_ => {

  console.log("Map loaded");
  drawer.setSize(map.width, map.height);
  drawer.drawImageScale(0,0,1,map);
  console.log("Map drawed");



  fetchMetadata().then(metadata => {
    for(let row = 1; row <= 71; row++) {
      for(let col = 0; col < metadata["row-length"][`${row}`]; col++) {
        hexagons.push(new Hexagon(
          metadata["left-offset"][`${row}`] + col * metadata["horizontal-step"],
          metadata["bottom-offset"] + row * metadata["vertical-step"] - Math.round(metadata["flatten"] * row),
          10,
          10,
          row,
          col+1,
        ))
      }
    }

    canvas.addEventListener('mousemove', e => {
      const { x, y } = translateCoordinate(e.offsetX, e.offsetY)

      let hexa = hexagons.find(h => h.isIn(x, y))
      if(hexa) {
        drawer.clean()
        drawer.drawImageScale(0,0,1,map)
        hexa.draw(drawer)
      }
    })

    canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 1) { return; }
      e.preventDefault()
    })

    canvas.addEventListener('touchmove', e => {
      if (e.touches.length > 1) { return; }
      e.preventDefault()
      const touch = e.changedTouches[0]

      const { x, y } = translateCoordinate(touch.pageX, touch.pageY)

      let hexa = hexagons.find(h => h.isIn(x, y))
      if(hexa) {
        drawer.clean()
        drawer.drawImageScale(0,0,1,map)
        hexa.draw(drawer, 80 + touch.radiusY)
      }
    })

    canvas.addEventListener('touchend', e => {
      if (e.touches.length > 1) { return; }
      const touch = e.changedTouches[0]

      const { x, y } = translateCoordinate(touch.pageX, touch.pageY)

      let hexa = hexagons.find(h => h.isIn(x, y))
      if(hexa) {
        drawer.clean()
        drawer.drawImageScale(0,0,1,map)
        hexa.draw(drawer)
        getSurvivors(hexa.coord.x, hexa.coord.y)
      }
    })

    canvas.addEventListener('click', e => {
      let hexa = hexagons.find(h => h.active)
      if(hexa) {
        getSurvivors(hexa.coord.x, hexa.coord.y)
      }
    })
  })
}, e => console.error(e));

fetch(Requests.StatsRequest()).then(d => d.json()).then(d => {

  for (const resource in d) {
    const rescount = table.insertRow()
    rescount.className = "resourceCounts"
    const name = rescount.insertCell()
    name.className = "resourceCounts"
    name.appendChild(document.createTextNode(`${resource}`))

    const count = rescount.insertCell()
    count.appendChild(document.createTextNode(`${d[resource]}`))
    count.className = "resourceCounts"

    rescount.addEventListener('click', e => {
      fetch(Requests.DetailsRequest(resource)).then(f => f.json()).then(details => {
        details.sort((a, b) => {
          if(a[3] === b[3]) return 0
          else if(a[3] > b[3]) return 1
          else return -1
        }).reverse()

        while(tableDetails.rows.length != 0) {
          tableDetails.deleteRow(0)
        }

        for(const detail of details) {
          const row = tableDetails.insertRow()
          const surName = row.insertCell()
          surName.appendChild(document.createTextNode(`${detail[0]}`))

          const surPos = row.insertCell()
          surPos.appendChild(document.createTextNode(
            `(${detail[1]},${detail[2]})`))
            surPos.addEventListener('click',
            e => getSurvivors(detail[1],detail[2]))
            surPos.className = "location"

            const surCount = row.insertCell()
            surCount.appendChild(document.createTextNode(`${detail[3]}`))
          }
        })
      })
    }
  })
