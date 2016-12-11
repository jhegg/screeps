require('room');

var creepsMaintainer = require('creeps.maintainer');
var roleAttack = require('role.attack');
var roleClaimer = require('role.claimer');
var roleHarvester = require('role.harvester');
var roleMiner = require('role.miner');
var roleNewSpawnBuilder = require('role.newSpawnBuilder');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTruck = require('role.truck');
var towerController = require('tower.controller');

module.exports.loop = function() {
  creepsMaintainer.cleanOldCreepMemory();
  cleanOldSpawnFlags();

  for (var spawnName in Game.spawns) {
    const spawn = Game.spawns[spawnName];
    if (spawn.spawning === null) {
      creepsMaintainer.spawnNewCreeps(spawn);
    }
  }

  for (var roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    room.activateSafeModeIfNecessary();
    towerController.run(room);
  }

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    assignSourceToCreep(creep);
    if (shouldRetire(creep)) {
      creepsMaintainer.retireOldCreep(creep);
    } else {
      putCreepToWork(creep);
    }
  }
};

function cleanOldSpawnFlags() {
  const newSpawnFlags = _.filter(Game.flags, (flag) =>
   flag.name.startsWith('NewSpawnFlag')
  );
  for (var flag of newSpawnFlags) {
    if (flag.room.getSpawns().length) {
      console.log(`Clearing ${flag} in room ${flag.room} due to spawn.`);
      flag.remove();
    }
  }
}

function assignSourceToCreep(creep) {
  if (!creep.memory.sourceId && creep.memory.role !== 'attack') {
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

function putCreepToWork(creep) {
  if (creep.memory.role == 'harvester') {
    if (creep.room.getEnergyStorageStructures().length) {
      roleHarvester.run(creep);
    } else if (creep.room.getConstructionSites().length) {
      roleBuilder.run(creep);
    } else {
      roleUpgrader.run(creep);
    }
  }

  if (creep.memory.role == 'truck') {
    roleTruck.run(creep, creep.room.getEnergyStorageStructures());
  }

  if (creep.memory.role == 'upgrader') {
    roleUpgrader.run(creep);
  }

  if (creep.memory.role == 'builder') {
    if (creep.room.getConstructionSites().length) {
      roleBuilder.run(creep);
    } else {
      roleUpgrader.run(creep);
    }
  }

  if (creep.memory.role === 'attack') {
    roleAttack.run(creep);
  }

  if (creep.memory.role === 'claimer') {
    roleClaimer.run(creep);
  }

  if (creep.memory.role === 'newSpawnBuilder') {
    roleNewSpawnBuilder.run(creep);
  }

  if (creep.memory.role === 'miner') {
    creep.mining();
  }
}
