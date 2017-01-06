require('role.attack');
require('role.builder');
require('role.claimer');
require('role.harasser');
require('role.harvester');
require('role.miner');
require('role.newSpawnBuilder');
require('role.raider');
require('role.truck');
require('role.upgrader');
require('role.utility');
require('room');
require('spawn');
require('tower');

var creepsMaintainer = require('creeps.maintainer');

module.exports.loop = function() {
  creepsMaintainer.cleanOldCreepMemory();
  cleanOldSpawnFlags();

  for (var spawnName in Game.spawns) {
    const spawn = Game.spawns[spawnName];
    if (spawn.spawning === null) {
      spawn.spawnNewCreeps(spawn);
    }
  }

  for (var roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller.my === true) {
      room.activateSafeModeIfNecessary();
      room.getTowers().forEach((tower) => tower.run());
    }
  }

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    assignSourceToCreep(creep);
    if (shouldRetire(creep)) {
      creepsMaintainer.retireOldCreep(creep);
    } else {
      try {
        putCreepToWork(creep);
      } catch (e) {
        console.log(e.stack);
        Game.notify(e.stack);
      }
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
  }
}

function shouldRetire(creep) {
  return creep.memory.role !== 'retired' &&
    creep.ticksToLive < 5;
}

function putCreepToWork(creep) {
  if (creep.memory.role == 'harvester') {
    if (creep.room.getEnergyStorageStructures().length) {
      creep.harvesting();
    } else if (creep.room.getConstructionSites().length) {
      creep.building();
    } else {
      creep.upgrading();
    }
  }

  if (creep.memory.role == 'truck') {
    creep.trucking();
  }

  if (creep.memory.role == 'upgrader') {
    creep.upgrading();
  }

  if (creep.memory.role == 'builder') {
    if (creep.room.getConstructionSites().length) {
      creep.building();
    } else {
      creep.upgrading();
    }
  }

  if (creep.memory.role === 'attack' || creep.memory.role === 'defender') {
    creep.attacking();
  }

  if (creep.memory.role === 'raider') {
    creep.raiding();
  }

  if (creep.memory.role === 'harasser') {
    creep.harassing();
  }

  if (creep.memory.role === 'claimer') {
    creep.claiming();
  }

  if (creep.memory.role === 'newSpawnBuilder') {
    creep.newSpawnBuilding();
  }

  if (creep.memory.role === 'miner') {
    creep.mining();
  }
}
