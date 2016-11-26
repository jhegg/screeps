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
    const harvesterBody = [
      WORK, WORK,
      CARRY,
      MOVE, MOVE, MOVE
    ]; // cost: 400

    const builderBody = [
      WORK, WORK, WORK, WORK,
      CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
    ]; // cost: 800

    const upgraderBody = [
      WORK, WORK, WORK,
      CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
    ]; // cost: 750

    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if (harvesters.length < 4 && Game.spawns.Spawn1.canCreateCreep(harvesterBody) == OK) {
      const spawnedCreep = Game.spawns.Spawn1.createCreep(harvesterBody, undefined, {
        role: 'harvester'
      });
      console.log('Spawning new harvester: ' + spawnedCreep);
      return;
    }

    const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if (builders.length < 4 && Game.spawns.Spawn1.canCreateCreep(builderBody) == OK) {
      const builderCreep = Game.spawns.Spawn1.createCreep(builderBody, undefined, {
        role: 'builder'
      });
      console.log('Spawning new builder: ' + builderCreep);
      return;
    }

    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if (upgraders.length < 4 && Game.spawns.Spawn1.canCreateCreep(upgraderBody) == OK) {
      const upgraderCreep = Game.spawns.Spawn1.createCreep(upgraderBody, undefined, {
        role: 'upgrader'
      });
      console.log('Spawning new upgrader: ' + upgraderCreep);
      return;
    }
  }
};

module.exports = creepsMaintainer;
