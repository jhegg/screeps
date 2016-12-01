var roomFinders = require('room.finders');

const harvesterRole = 'harvester';
const builderRole = 'builder';
const upgraderRole = 'upgrader';

var creepsSpawner = {
  spawnSmallCreeps: function() {
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
    spawnCreepFromTemplate(creepTemplates);
  },

  spawnMediumCreeps: function() {
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
    spawnCreepFromTemplate(creepTemplates);
  },

  spawnLargeCreeps: function() {
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
    spawnCreepFromTemplate(creepTemplates);
  },
};

function spawnCreepFromTemplate(creepTemplates) {
  for (var template of creepTemplates) {
    const numCreeps = findCreepsHavingRole(template.role);
    if (shouldCreateCreep(numCreeps.length, template)) {
      createCreep(template);
      break;
    }
  }
}

function findCreepsHavingRole(role) {
  return _.filter(Game.creeps, (creep) =>
    creep.memory.role == role
  );
}

function shouldCreateCreep(numCurrentCreepsOfType, creepTemplate) {
  return numCurrentCreepsOfType < creepTemplate.maxCreepsOfType &&
      canCreateCreep(creepTemplate.body);
}

function canCreateCreep(body) {
  return Game.spawns.Spawn1.canCreateCreep(body) == OK;
}

function createCreep(creepTemplate) {
  const spawnedCreep = Game.spawns.Spawn1.createCreep(creepTemplate.body,
    undefined,
    { role: creepTemplate.role }
  );
  console.log('Spawning new ' + creepTemplate.role + ': ' + spawnedCreep);
}

module.exports = creepsSpawner;
