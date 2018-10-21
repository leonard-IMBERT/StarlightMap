const { StatusMongoose } = require('./Schemes');

/**
 * An helpher object to get the latest object returned by the query
 */
const getAllSortedByDate = {
  skip: 0,
  limit: 1,
  sort: {
    date: -1,
  },
};

/**
 * Get informations about the current turn
 * @returns {Promise<String[]>} - An array with one status post
 */
function getTurnInfo() {
  return StatusMongoose.find({}, 'Turn', getAllSortedByDate).exec();
}

/**
 * Get all the survivors of a turn
 * @returns {Promise<any[]>}
 */
async function getAllInfo() {
  const results = (await StatusMongoose.find({}, ['Survivors'], getAllSortedByDate).exec())[0];
  if (results == null || results.Survivors == null) throw new Error('There was an error when queriying the mongo (getAllInfo)');
  return results.Survivors;
}

/**
 * Get all the entity in the specified coordinate
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @returns {Promise<any[]>} An array of inhabitant
 */
async function getInfoByCoord(x, y) {
  const results = (await StatusMongoose.find({}, ['Survivors'], getAllSortedByDate).exec())[0];
  if (results == null || results.Survivors == null) throw new Error('There was an error when queriying the mongo (getInfoByCoord)');
  return results.Survivors
    .filter(i => i != null)
    .filter(i => Number(i.Position.x) === Number(x) && Number(i.Position.y) === Number(y));
}

/**
 * Get the items counts
 * @return {Promise<Object>} A map containing the object and how many of them there are
 */
async function getCounts() {
  const results = (await StatusMongoose.find({}, ['Survivors.items',
    'Survivors.conditions',
    'Survivors.jobs'], getAllSortedByDate).exec())[0];

  if (results == null || results.Survivors == null) throw new Error('There was an error when queriying the mongo (getCounts)');
  return results.Survivors
    .reduce((acc, cur) => {
      cur.items
        .concat(cur.conditions)
        .concat(cur.jobs)
        .filter(item => item != null)
        .forEach((item) => {
          if (item in acc) acc[item] += 1;
          else acc[item] = 1;
        });
      return acc;
    }, {});
}

/**
 * Get all the survivor having the designated stat
 * @param {string} stat - The stat to query
 * @returns {Promise<any[]>} All the inhabitant having the stat
 */
async function getDetailsAboutStat(stat) {
  const results = (await StatusMongoose.find({}, ['Survivors'], getAllSortedByDate).exec())[0];

  if (results == null || results.Survivors == null) throw new Error('There was an error when queriying the mongo (getDetailsAboutStat)');

  const details = [];
  results.Survivors.forEach((survivor) => {
    const count = [...survivor.items, ...survivor.conditions, ...survivor.jobs]
      .filter(elem => elem === stat)
      .length;

    if (count !== 0) {
      details.push([survivor.Name, survivor.Position.x, survivor.Position.y, count]);
    }
  });
  return details;
}

module.exports = {
  getTurnInfo,
  getDetailsAboutStat,
  getCounts,
  getInfoByCoord,
  getAllInfo,
};
