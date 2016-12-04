var creepsTemplates = require('creeps.templates');
var roomFinders = require('room.finders');

var creepsSpawner = {
  spawnSmallCreeps: function(spawn) {
    const template = creepsTemplates.startingBodyTemplate();
    spawnCreepFromTemplate(spawn, template);
  },
  spawnSmallCreepsWithTrucks: function(spawn) {
    const template = creepsTemplates.smallBodyWithTrucksTemplate();
    spawnCreepFromTemplate(spawn, template);
  },

  spawnMediumCreeps: function(spawn) {
    const template = creepsTemplates.mediumBodyTemplate();
    spawnCreepFromTemplate(spawn, template);
  },
  spawnMediumCreepsWithTrucks: function(spawn) {
    const template = creepsTemplates.mediumBodyWithTrucksTemplate();
    spawnCreepFromTemplate(spawn, template);
  },

  spawnLargeCreeps: function(spawn) {
    const template = creepsTemplates.largeBodyTemplate();
    spawnCreepFromTemplate(spawn, template);
  },
  spawnLargeCreepsWithTrucks: function(spawn) {
    const template = creepsTemplates.largeBodyWithTrucksTemplate();
    spawnCreepFromTemplate(spawn, template);
  },

  spawnExtraLargeCreepsWithTrucks: function(spawn) {
    const template = creepsTemplates.extraLargeBodyWithTrucksTemplate();
    spawnCreepFromTemplate(spawn, template);
  },
};

function spawnCreepFromTemplate(spawn, creepTemplates) {
  for (var template of creepTemplates) {
    const numCreeps = findCreepsHavingRole(spawn.room, template.role);
    if (shouldCreateCreep(spawn, numCreeps.length, template)) {
      createCreep(spawn, template);
      break;
    } else if (template.role === 'harvester' &&
      numCreeps.length === 0 &&
      spawn.room.energyAvailable >= 200) {
        console.log('Emergency harvester spawn! Zero other harvesters present.');
        createCreep(spawn, { role: 'harvester', body: [WORK, CARRY, MOVE] });
        break;
    } else if (template.role === 'harvester' &&
      numCreeps.length < template.maxCreepsOfType) {
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
  return (numCurrentCreepsOfType < creepTemplate.maxCreepsOfType) &&
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
