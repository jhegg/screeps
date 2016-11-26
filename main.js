var creepsMaintainer = require('creeps.maintainer');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function() {
  creepsMaintainer.run();

  const spawn = Game.spawns.Spawn1;
  const spawnRoom = spawn.room;
  const constructionSites = spawnRoom.find(FIND_CONSTRUCTION_SITES);
  const droppedResources = spawnRoom.find(FIND_DROPPED_RESOURCES);
  const sources = spawnRoom.find(FIND_SOURCES);

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep, sources);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep, sources);
    }
    if (creep.memory.role == 'builder') {
      if (constructionSites.length) {
        roleBuilder.run(creep, constructionSites, droppedResources, sources);
      } else {
        roleUpgrader.run(creep, sources);
      }
    }
  }
};
