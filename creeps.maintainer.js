var creepsSpawner = require('creeps.spawner');

var creepsMaintainer = {
  cleanOldCreepMemory: function() {
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log('Cleaning old creep memory from:', name);
      }
    }
  },
  retireOldCreep(creep) {
    creep.memory.role = 'retired';
    creep.say('retiring');
    for (var resourceType in creep.carry) {
      creep.drop(resourceType);
    }
    console.log(creep + ' is now retired');
    creep.suicide();
  },
  spawnNewCreeps: function(spawn) {
    const energyCapacity = spawn.room.energyCapacityAvailable;
    const mediumEnergyCapacity = 550;
    const largeEnergyCapacity = 800;

    if (energyCapacity < mediumEnergyCapacity) {
      lowEnergyCapacitySpawning(spawn);
    } else if (energyCapacity < largeEnergyCapacity) {
      mediumEnergyCapacitySpawning(spawn);
    } else {
      largeEnergyCapacitySpawning(spawn);
    }
  },
};

function lowEnergyCapacitySpawning(spawn) {
  if (roomHasSourceContainers(spawn)) {
    creepsSpawner.spawnSmallCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnSmallCreeps(spawn);
  }
}

function roomHasSourceContainers(room) {
  return room.memory.sourceContainers &&
    room.memory.sourceContainers.length > 0;
}

function mediumEnergyCapacitySpawning(spawn) {
  if (roomHasSourceContainers(spawn)) {
    creepsSpawner.spawnMediumCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnMediumCreeps(spawn);
  }
}

function largeEnergyCapacitySpawning(spawn) {
  if (roomHasSourceContainers(spawn)) {
    creepsSpawner.spawnLargeCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnLargeCreeps(spawn);
  }
}

module.exports = creepsMaintainer;
