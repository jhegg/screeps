var roomFinders = require('room.finders');

const harvesterRole = 'harvester';
const builderRole = 'builder';
const upgraderRole = 'upgrader';

var creepsSpawner = {
  spawnSmallCreeps: function(spawn) {
    const startingBody = [WORK, CARRY, MOVE, MOVE]; // cost: 250
    const creepTemplates = [
      { role: harvesterRole,
        body: startingBody,
        maxCreepsOfType: 4},
      { role: builderRole,
        body: startingBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: startingBody,
        maxCreepsOfType: 4},
    ];
    spawnCreepFromTemplate(spawn, creepTemplates);
  },

  spawnMediumCreeps: function(spawn) {
    const mediumBody = [
      WORK, WORK,
      CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE
    ]; // cost: 500
    const creepTemplates = [
      { role: harvesterRole,
        body: mediumBody,
        maxCreepsOfType: 4},
      { role: builderRole,
        body: mediumBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: mediumBody,
        maxCreepsOfType: 4},
    ];
    spawnCreepFromTemplate(spawn, creepTemplates);
  },

  spawnLargeCreeps: function(spawn) {
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
    const creepTemplates = [
      { role: harvesterRole,
        body: harvesterBody,
        maxCreepsOfType: 6},
      { role: builderRole,
        body: builderBody,
        maxCreepsOfType: 4},
      { role: upgraderRole,
        body: upgraderBody,
        maxCreepsOfType: 6},
    ];
    spawnCreepFromTemplate(spawn, creepTemplates);
  },
};

function spawnCreepFromTemplate(spawn, creepTemplates) {
  for (var template of creepTemplates) {
    const numCreeps = findCreepsHavingRole(spawn.room, template.role);
    if (shouldCreateCreep(spawn, numCreeps.length, template)) {
      createCreep(spawn, template);
      break;
    }
  }
}

function findCreepsHavingRole(room, role) {
  return _.filter(Game.creeps, (creep) =>
    creep.memory.role === role &&
    creep.room.name === room.name
  );
}

function shouldCreateCreep(spawn, numCurrentCreepsOfType, creepTemplate) {
  return numCurrentCreepsOfType < creepTemplate.maxCreepsOfType &&
      canCreateCreep(spawn, creepTemplate.body);
}

function canCreateCreep(spawn, body) {
  return spawn.canCreateCreep(body) == OK;
}

function createCreep(spawn, creepTemplate) {
  const spawnedCreep = spawn.createCreep(creepTemplate.body,
    undefined,
    { role: creepTemplate.role }
  );
  console.log('Spawning new ' + creepTemplate.role + ': ' + spawnedCreep);
}

module.exports = creepsSpawner;
