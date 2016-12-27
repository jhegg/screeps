Creep.prototype.attacking = function() {
  this.recycleIdleDefender();

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

Creep.prototype.recycleIdleDefender = function() {
  if (this.memory.role === 'defender') {
    const hostiles = this.room.getHostiles();
    if (hostiles.length) {
      this.memory.hostileLastSeen = Game.time;
      return;
    } else if (this.memory.hostileLastSeen === undefined) {
      this.memory.hostileLastSeen = Game.time;
      return;
    } else if ((this.memory.hostileLastSeen + 10) > Game.time) {
      const spawns = _.filter(this.room.getSpawns(),
        (spawn) => Math.hypot(this.pos.x - spawn.pos.x,
          this.pos.y - spawn.pos.y));
      if (spawns.length) {
        const spawn = spawns[0];
        if (spawn.recycleCreep(this) === ERR_NOT_IN_RANGE) {
          this.moveTo(spawn);
          spawn.recycleCreep(this);
        }
      }
    }
  }
};
