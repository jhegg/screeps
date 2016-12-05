var creepsMaintainer = require('creeps.maintainer');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTruck = require('role.truck');
var roomFinders = require('room.finders');
var roomUtility = require('room.utility');
var towerController = require('tower.controller');

// https://github.com/gdborton/screeps-profiler
const profiler = require('screeps-profiler');

profiler.enable();
module.exports.loop = function() {
  profiler.wrap(function() {
    creepsMaintainer.cleanOldCreepMemory();

    for (var spawnName in Game.spawns) {
      const room = Game.spawns[spawnName].room;
      const roadsToRepair = roomFinders.findRoadsToRepair(room);
      const hostileCreeps = roomFinders.findHostiles(room);
      const constructionSites = roomFinders.findConstructionSites(room);
      const droppedResources = roomFinders.findDroppedResources(room);
      const energyStorageStructures = roomFinders.findEnergyStorageStructures(room);
      const creepWorkData = {
        constructionSites: constructionSites,
        droppedResources: droppedResources,
        energyStorageStructures: energyStorageStructures,
      };

      creepsMaintainer.spawnNewCreeps(Game.spawns[spawnName]);

      for (var hostileCreep of hostileCreeps) {
        // if any hostile creep is beyond 5 spaces of 50x50 room edges, activate
        if (hostileCreep.pos.x > 5 ||
          hostileCreep.pos.x < 45 ||
          hostileCreep.pos.y > 5 ||
          hostileCreep.pos.y < 45) {
            roomUtility.activateSafeMode(room, hostileCreep);
        }
      }

      towerController.run(room, hostileCreeps, roadsToRepair);

      for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        assignSourceToCreep(creep);
        if (shouldRetire(creep)) {
          creepsMaintainer.retireOldCreep(creep);
        }
        putCreepToWork(creep, creepWorkData);
      }
    }
  });
};

function assignSourceToCreep(creep) {
  if (!creep.memory.sourceId) {
    const sources = creep.room.find(FIND_SOURCES, {
      filter: (source) => {
        return !_.includes(source.room.memory.blacklistedSources, source.id);
      }
    });
    const desiredSource = sources[Math.floor(Math.random() * sources.length)];
    creep.memory.sourceId = desiredSource.id;
    console.log('Setting sourceId to ' + desiredSource.id + ' for creep: ' + creep);
  }
}

function shouldRetire(creep) {
  return creep.memory.role !== 'retired' &&
    creep.ticksToLive < 5;
}

function putCreepToWork(creep, creepWorkData) {
  if (creep.memory.role == 'harvester') {
    if (creepWorkData.energyStorageStructures.length) {
      roleHarvester.run(creep, creepWorkData.energyStorageStructures);
    } else if (creepWorkData.constructionSites.length) {
      roleBuilder.run(creep, creepWorkData);
    } else {
      roleUpgrader.run(creep, creepWorkData);
    }
  }

  if (creep.memory.role == 'truck') {
    roleTruck.run(creep, creepWorkData.energyStorageStructures);
  }

  if (creep.memory.role == 'upgrader') {
    roleUpgrader.run(creep, creepWorkData);
  }

  if (creep.memory.role == 'builder') {
    if (creepWorkData.constructionSites.length) {
      roleBuilder.run(creep, creepWorkData);
    } else {
      roleUpgrader.run(creep, creepWorkData);
    }
  }
}
