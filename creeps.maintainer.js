var creepsSpawner = require('creeps.spawner');
var roomUtility = require('room.utility');

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
  if (roomUtility.hasSourceContainers(spawn.room)) {
    creepsSpawner.spawnSmallCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnSmallCreeps(spawn);
  }
}

function mediumEnergyCapacitySpawning(spawn) {
  if (roomUtility.hasSourceContainers(spawn.room)) {
    creepsSpawner.spawnMediumCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnMediumCreeps(spawn);
  }
}

function largeEnergyCapacitySpawning(spawn) {
  if (roomUtility.hasSourceContainers(spawn.room)) {
    creepsSpawner.spawnLargeCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnLargeCreeps(spawn);
  }
}

module.exports = creepsMaintainer;
