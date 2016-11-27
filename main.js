var creepsMaintainer = require('creeps.maintainer');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function() {
  creepsMaintainer.run();

  const room = Game.spawns.Spawn1.room;
  const constructionSites = findConstructionSites(room);
  const droppedResources = findDroppedResources(room);
  const energyStorageStructures = findEnergyStorageStructures(room);
  const roadsToRepair = findRoadsToRepair(room);

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    assignSourceToCreep(creep);
    if (creep.memory.role == 'harvester') {
      if (energyStorageStructures.length) {
        roleHarvester.run(creep, energyStorageStructures);
      } else if (constructionSites.length) {
        roleBuilder.run(creep, constructionSites, droppedResources);
      } else {
        roleUpgrader.run(creep);
      }
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      if (constructionSites.length || roadsToRepair.length) {
        roleBuilder.run(creep, constructionSites, droppedResources, roadsToRepair);
      } else {
        roleUpgrader.run(creep);
      }
    }
  }
};

function findConstructionSites(room) {
  return room.find(FIND_CONSTRUCTION_SITES);
}

function findDroppedResources(room) {
  return room.find(FIND_DROPPED_RESOURCES);
}

function findEnergyStorageStructures(room) {
  return room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER) &&
        structure.energy < structure.energyCapacity;
    }
  });
}

function findRoadsToRepair(room) {
  return room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType === STRUCTURE_ROAD &&
        (structure.hits < structure.hitsMax / 3);
    }
  });
}

function assignSourceToCreep(creep) {
  if (!creep.memory.sourceId) {
    const sources = creep.room.find(FIND_SOURCES);
    const desiredSource = sources[Math.floor(Math.random() * sources.length)];
    creep.memory.sourceId = desiredSource.id;
    console.log('Setting sourceId to ' + desiredSource.id + ' for creep: ' + creep);
  }
}
