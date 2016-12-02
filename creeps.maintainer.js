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
      creepsSpawner.spawnSmallCreeps(spawn);
    } else if (energyCapacity < largeEnergyCapacity) {
      creepsSpawner.spawnMediumCreeps(spawn);
    } else {
      creepsSpawner.spawnLargeCreeps(spawn);
    }
  },
};

module.exports = creepsMaintainer;
