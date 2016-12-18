Creep.prototype.attacking = function() {
  const enemyStructures = _.filter(this.room.getAllStructures(),
    (structure) => structure.my === false &&
    structure.structureType !== STRUCTURE_CONTROLLER);
  if (enemyStructures.length) {
    const enemyStructuresByRange = enemyStructures.sort(function(a, b) {
      const distanceA = Math.hypot(this.pos.x - a.pos.x, this.pos.y - a.pos.y);
      const distanceB = Math.hypot(this.pos.x - b.pos.x, this.pos.y - b.pos.y);
      return distanceA - distanceB;
    });
    if (this.attack(enemyStructuresByRange[0]) === ERR_NOT_IN_RANGE) {
      this.moveTo(enemyStructuresByRange[0]);
      this.attack(enemyStructuresByRange[0]);
    }
    return;
  }

  const hostiles = this.room.getHostiles();
  if (hostiles.length) {
    const myPosition = this.pos;
    const hostilesByRange = hostiles.sort(function(a, b) {
      const distanceA = Math.hypot(myPosition.x - a.pos.x, myPosition.y - a.pos.y);
      const distanceB = Math.hypot(myPosition.x - b.pos.x, myPosition.y - b.pos.y);
      return distanceA - distanceB;
    });
    const hostileToAttack = hostilesByRange[0];
    if (this.attack(hostileToAttack) === ERR_NOT_IN_RANGE) {
      this.moveTo(hostileToAttack);
      this.attack(hostileToAttack);
    }
  }
};
