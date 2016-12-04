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
    const largeEnergyCapacity = 1000;
    const extraLargeEnergyCapacity = 1500;

    if (!spawn.room.memory.emergencyMode &&
      energyCapacity >= largeEnergyCapacity &&
      Object.keys(Game.creeps).length <= 5) {
      console.log(`Creep numbers too low! Engaging emergency mode.`);
      Game.notify(`Creep numbers too low! Engaging emergency mode.`);
      spawn.room.memory.emergencyMode = true;
    }

    if (spawn.room.memory.emergencyMode === true) {
      if (Object.keys(Game.creeps).length >= 10) {
        console.log(`Exiting emergency mode.`);
        Game.notify(`Exiting emergency mode.`);
        spawn.room.memory.emergencyMode = undefined;
      } else {
        lowEnergyCapacitySpawning(spawn);
        return;
      }
    }

    if (energyCapacity < mediumEnergyCapacity) {
      lowEnergyCapacitySpawning(spawn);
    } else if (energyCapacity < largeEnergyCapacity) {
      mediumEnergyCapacitySpawning(spawn);
    } else if (energyCapacity < extraLargeEnergyCapacity) {
      largeEnergyCapacitySpawning(spawn);
    } else {
      extraLargeEnergyCapacitySpawning(spawn);
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

function extraLargeEnergyCapacitySpawning(spawn) {
  if (roomUtility.hasSourceContainers(spawn.room)) {
    creepsSpawner.spawnExtraLargeCreepsWithTrucks(spawn);
  } else {
    creepsSpawner.spawnLargeCreeps(spawn);
  }
}

module.exports = creepsMaintainer;
