var roleAttack = {
  run: function(creep) {
    const enemyStructures = _.filter(creep.room.getAllStructures(),
      (structure) => structure.my === false &&
      structure.structureType !== STRUCTURE_CONTROLLER);
    if (enemyStructures.length) {
      const enemyStructuresByRange = enemyStructures.sort(function(a, b) {
        const distanceA = Math.hypot(creep.pos.x - a.pos.x, creep.pos.y - a.pos.y);
        const distanceB = Math.hypot(creep.pos.x - b.pos.x, creep.pos.y - b.pos.y);
        return distanceA - distanceB;
      });
      if (creep.attack(enemyStructuresByRange[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(enemyStructuresByRange[0]);
        creep.attack(enemyStructuresByRange[0]);
      }
      return;
    }

    const hostiles = creep.room.getHostiles();
    if (hostiles.length) {
      const hostilesByRange = hostiles.sort(function(a, b) {
        const distanceA = Math.hypot(creep.pos.x - a.pos.x, creep.pos.y - a.pos.y);
        const distanceB = Math.hypot(creep.pos.x - b.pos.x, creep.pos.y - b.pos.y);
        return distanceA - distanceB;
      });
      const hostileToAttack = hostilesByRange[0];
      if (creep.attack(hostileToAttack) === ERR_NOT_IN_RANGE) {
        creep.moveTo(hostileToAttack);
        creep.attack(hostileToAttack);
      }
    }
  }
};

module.exports = roleAttack;
