require('role.attack');
require('role.builder');
require('role.claimer');
require('role.harasser');
require('role.harvester');
require('role.miner');
require('role.newSpawnBuilder');
require('role.raider');
require('role.remoteHarvester');
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
  updateRemoteHarvestingFlagMemory();

  for (var spawnName in Game.spawns) {
    const spawn = Game.spawns[spawnName];
    if (spawn.spawning === null) {
      spawn.spawnNewCreeps(spawn);
    }
  }

  for (var roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller && room.controller.my === true) {
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

  updateStats();
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

function updateRemoteHarvestingFlagMemory() {
  _.each(Game.flags, (flag) => {
    if (flag.name.startsWith('RemoteHarvesting') &&
      flag.memory.spawnRoom === undefined) {
      const spawnsSortedByDistance = _.sortBy(Game.spawns, (spawn) =>
        _.keys(Game.map.findRoute(flag.pos.roomName, spawn.room.name)).length
      );
      if (spawnsSortedByDistance.length) {
        flag.memory.spawnRoom = spawnsSortedByDistance[0].room.name;
      }
    }
  });
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
  if (creep.spawning) {
    return;
  }
  switch(creep.memory.role) {
    case 'attack':
      creep.attacking();
      break;
    case 'builder':
      if (creep.room.getConstructionSites().length) {
        creep.building();
      } else {
        creep.upgrading();
      }
      break;
    case 'claimer':
      creep.claiming();
      break;
    case 'defender':
      creep.attacking();
      break;
    case 'harasser':
      creep.harassing();
      break;
    case 'harvester':
      if (creep.room.getEnergyStorageStructures().length) {
        creep.harvesting();
      } else if (creep.room.getConstructionSites().length) {
        creep.building();
      } else {
        creep.upgrading();
      }
      break;
    case 'miner':
      creep.mining();
      break;
    case 'newSpawnBuilder':
      creep.newSpawnBuilding();
      break;
    case 'raider':
      creep.raiding();
      break;
    case 'remoteHarvester':
      creep.remoteHarvesting();
      break;
    case 'remoteReserver':
      creep.remoteReserving();
      break;
    case 'remoteTrucking':
      creep.remoteTrucking();
      break;
    case 'truck':
      creep.trucking();
      break;
    case 'upgrader':
      creep.upgrading();
      break;
    default:
      // creep has no role or unknown role
  }
}

function updateStats() {
  if (Memory.stats === undefined) {
    Memory.stats = {};
  }

  var rooms = Game.rooms;
  var spawns = Game.spawns;
  for (let roomKey in rooms) {
    let room = Game.rooms[roomKey];
    var isMyRoom = (room.controller ? room.controller.my : 0);
    if (isMyRoom) {
      Memory.stats['room.' + room.name + '.myRoom'] = 1;
      Memory.stats['room.' + room.name + '.energyAvailable'] = room.energyAvailable;
      Memory.stats['room.' + room.name + '.energyCapacityAvailable'] = room.energyCapacityAvailable;
      Memory.stats['room.' + room.name + '.controllerProgress'] = room.controller.progress;
      Memory.stats['room.' + room.name + '.controllerProgressTotal'] = room.controller.progressTotal;
      var stored = 0;
      var storedTotal = 0;

      if (room.storage) {
        stored = room.storage.store[RESOURCE_ENERGY];
        storedTotal = room.storage.storeCapacity[RESOURCE_ENERGY];
      } else {
        stored = 0;
        storedTotal = 0;
      }

      Memory.stats['room.' + room.name + '.storedEnergy'] = stored;
    } else {
      Memory.stats['room.' + room.name + '.myRoom'] = undefined;
    }
  }
  Memory.stats['gcl.progress'] = Game.gcl.progress;
  Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal;
  Memory.stats['gcl.level'] = Game.gcl.level;
  for (let spawnKey in spawns) {
    let spawn = Game.spawns[spawnKey];
    Memory.stats['spawn.' + spawn.name + '.defenderIndex'] = spawn.memory.defenderIndex;
  }

  Memory.stats['cpu.bucket'] = Game.cpu.bucket;
  Memory.stats['cpu.limit'] = Game.cpu.limit;
  Memory.stats['cpu.getUsed'] = Game.cpu.getUsed();
}
