var creepsSpawner = require('creeps.spawner');

var creepsMaintainer = {
  run: function() {
    cleanOldCreepMemory();
    spawnNewCreeps();
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
};

function cleanOldCreepMemory() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Cleaning old creep memory from:', name);
    }
  }
}

function spawnNewCreeps() {
  const energyCapacity = Game.spawns.Spawn1.room.energyCapacityAvailable;
  const mediumEnergyCapacity = 550;
  const largeEnergyCapacity = 800;

  if (energyCapacity < mediumEnergyCapacity) {
    creepsSpawner.spawnSmallCreeps();
  } else if (energyCapacity < largeEnergyCapacity) {
    creepsSpawner.spawnMediumCreeps();
  } else {
    creepsSpawner.spawnLargeCreeps();
  }
}

module.exports = creepsMaintainer;
