var creepsMaintainer = {
  cleanOldCreepMemory: function() {
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }
  },
  retireOldCreep(creep) {
    creep.say('retiring');
    console.log(`${creep.room} Creep ${creep.name} (${creep.memory.role}) is now retired`);
    creep.memory.role = 'retired';
    for (var resourceType in creep.carry) {
      creep.drop(resourceType);
    }
    creep.suicide();
  },
};

module.exports = creepsMaintainer;
