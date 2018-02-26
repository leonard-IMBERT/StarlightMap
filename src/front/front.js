import Drawer from './drawer/Drawer'
import Images from './drawer/Images'
import Hexagon from './hexagon/hexagon'
import Card from './manipulator/manipulator'

const canvas = document.querySelector("canvas#map")

const drawer = new Drawer(canvas);
const map = new Images()

const data = document.querySelector("div#data")
const dataBlueprint = document.querySelector("div.data")

const stats = document.querySelector("div#stats")

const MetadataRequest = new Request('/metadata', {
  method: 'GET',
  headers: (new Headers()).append('Accept','application/json')
})

const InfoRequest = (hexa) => new Request(`/info?col=${hexa.coord.x}&row=${hexa.coord.y}`, {
  method: 'GET',
  headers: (new Headers()).append('Accept', 'application/json')
})

const StatsRequest = new Request('/stats', {
  method: 'GET',
  headers: (new Headers()).append('Accept','application/json')
})

function translateCoordinate (x, y) {
  return {
    x: map.width/canvas.clientWidth * x,
    y: map.height/canvas.clientHeight * y
  }
}

function fetchMetadata() {
  return fetch(MetadataRequest).then(d => d.json())
}

function templatingData(inhabitants) {
  const span = document.createElement('span', {

  });
}

const HexagonColor = "#000000"


map.load('/map', 962, 924, 0, 0).then(_ => {

  console.log("Map loaded");
  drawer.setSize(map.width, map.height);
  drawer.drawImageScale(0,0,1,map);
  console.log("Map drawed");


  const hexagons = []

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

    canvas.addEventListener('click', e => {
      const { x, y } = translateCoordinate(e.offsetX, e.offsetY)
      let hexa = hexagons.find(h => h.active)
      if(hexa) {
        fetch(InfoRequest(hexa))
          .then(d => d.json())
          .then(d => {
            while(data.firstChild) {
              data.removeChild(data.firstChild);
            }
            for(const inhab of d) {
              console.log(inhab)
              new Card(dataBlueprint)
                .fill({
                  Name: inhab.Name,
                  Description: inhab.Description,
                  Postion: `${inhab.Position.x},${inhab.Position.y}`,
                  Health: `${inhab.Health}/${inhab.MaxHealth}`,
                  Items: inhab.items.toString(),
                  Conditions: inhab.condition.toString()
                }).appendIn(data)
            }
          })
      }
    })
  })
}, e => console.error(e));

fetch(StatsRequest).then(d => d.json()).then(d => {
  let table = document.createElement("table")
  table.className = "resourceCounts"
  let caption = document.createElement("caption")
  caption.innerText = "Total Resources Among All Survivors"

  table.appendChild(caption)

  for (const resource in d) {
    let rescount = document.createElement("tr")
    rescount.className = "resourceCounts"
    let name = document.createElement("td")
    name.className = "resourceCounts"
    let count = document.createElement("td")
    count.className = "resourceCounts"

    name.innerText = `${resource}:`
    count.innerText = `${d[resource]}`
    rescount.appendChild(name)
    rescount.appendChild(count)
    table.appendChild(rescount)
  }
  stats.appendChild(table)
})
