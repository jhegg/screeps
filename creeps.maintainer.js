var roomFinders = require('room.finders');

var creepsMaintainer = {
  run: function() {
    cleanOldCreepMemory();
    spawnNewCreeps();
  }
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
  // Note: check cost against max available energy of:
  // Game.spawns.Spawn1.room.energyCapacityAvailable
  const startingBody = [WORK, CARRY, MOVE]; // cost: 200

  const harvesterRole = 'harvester';
  const harvesterBody = [
    WORK, WORK,
    CARRY,
    MOVE, MOVE, MOVE
  ]; // cost: 400

  const builderRole = 'builder';
  const builderBody = [
    WORK, WORK, WORK, WORK,
    CARRY, CARRY,
    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
  ]; // cost: 800

  const upgraderRole = 'upgrader';
  const upgraderBody = [
    WORK, WORK, WORK,
    CARRY, CARRY, CARRY,
    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
  ]; // cost: 750

  const harvesters = findCreepsHavingRole(harvesterRole);
  if (harvesters.length < 4 && canCreateCreep(harvesterBody)) {
    createCreep(harvesterBody, harvesterRole);
    return;
  }

  const builders = findCreepsHavingRole(builderRole);
  if (builders.length < 4 && canCreateCreep(builderBody)) {
    createCreep(builderBody, builderRole);
    return;
  }

  const upgraders = findCreepsHavingRole(upgraderRole);
  if (upgraders.length < 4 && canCreateCreep(upgraderBody)) {
    createCreep(upgraderBody, upgraderRole);
    return;
  }
}

function findCreepsHavingRole(role) {
  return _.filter(Game.creeps, (creep) =>
    creep.memory.role == role
  );
}

function canCreateCreep(body) {
  return Game.spawns.Spawn1.canCreateCreep(body) == OK;
}

function createCreep(body, role) {
  const spawnedCreep = Game.spawns.Spawn1.createCreep(body, undefined, {
    role: role
  });
  console.log('Spawning new ' + role + ': ' + spawnedCreep);
}

module.exports = creepsMaintainer;
