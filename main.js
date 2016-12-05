require('room');

var creepsMaintainer = require('creeps.maintainer');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTruck = require('role.truck');
var towerController = require('tower.controller');

// https://github.com/gdborton/screeps-profiler
const profiler = require('screeps-profiler');
profiler.registerObject(creepsMaintainer, 'creepsMaintainer');
profiler.registerObject(roleBuilder, 'roleBuilder');
profiler.registerObject(roleHarvester, 'roleHarvester');
profiler.registerObject(roleTruck, 'roleTruck');
profiler.registerObject(roleUpgrader, 'roleUpgrader');
profiler.registerObject(towerController, 'towerController');
//profiler.enable();

module.exports.loop = function() {
  profiler.wrap(function() {
    creepsMaintainer.cleanOldCreepMemory();

    for (var spawnName in Game.spawns) {
      const room = Game.spawns[spawnName].room;
      const roadsToRepair = room.getRoadsNeedingRepair();
      const hostileCreeps = room.getHostiles();
      const constructionSites = room.getConstructionSites();
      const droppedResources = room.getDroppedResources();
      const energyStorageStructures = room.getEnergyStorageStructures();
      const creepWorkData = {
        constructionSites: constructionSites,
        droppedResources: droppedResources,
        energyStorageStructures: energyStorageStructures,
      };

      creepsMaintainer.spawnNewCreeps(Game.spawns[spawnName]);

      room.activateSafeModeIfNecessary();

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
    const sources = creep.room.getSourcesMinusBlacklist();
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
