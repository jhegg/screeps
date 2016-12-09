var newSpawnBuilder = {
  run: function(creep) {
    const flag = Game.flags[creep.memory.targetFlag];
    if (flag === undefined) {
      creep.memory.role = 'builder';
      creep.memory.sourceId = undefined;
      creep.memory.upgrading = undefined;
    }

    if (creep.pos.isNearTo(flag)) {
      creep.room.createConstructionSite(flag.pos, STRUCTURE_SPAWN);
      creep.memory.role = 'builder';
      creep.memory.sourceId = undefined;
      creep.memory.upgrading = undefined;
    } else {
      creep.moveTo(flag);
    }
  }
};

module.exports = newSpawnBuilder;
