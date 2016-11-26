var creepsMaintainer = {
  run: function() {
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log('Clearing non-existing creep memory:', name);
      }
    }

    // Note: check cost against max available energy of:
    // Game.spawns.Spawn1.room.energyCapacityAvailable
    // Current cost: 100 + 100 + 100 + 50 + 50 + 50 + 50 + 50 + 50 + 50 = 650
    var standardBody = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if (harvesters.length < 4 && Game.spawns.Spawn1.canCreateCreep(standardBody) == OK) {
      var spawnedCreep = Game.spawns.Spawn1.createCreep(standardBody, undefined, {
        role: 'harvester'
      });
      console.log('Spawning new harvester: ' + spawnedCreep);
      return;
    }

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if (builders.length < 4 && Game.spawns.Spawn1.canCreateCreep(standardBody) == OK) {
      var builderCreep = Game.spawns.Spawn1.createCreep(standardBody, undefined, {
        role: 'builder'
      });
      console.log('Spawning new builder: ' + builderCreep);
      return;
    }

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if (upgraders.length < 4 && Game.spawns.Spawn1.canCreateCreep(standardBody) == OK) {
      var upgraderCreep = Game.spawns.Spawn1.createCreep(standardBody, undefined, {
        role: 'upgrader'
      });
      console.log('Spawning new upgrader: ' + upgraderCreep);
      return;
    }
  }
};

module.exports = creepsMaintainer;
