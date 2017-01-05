Creep.prototype.newSpawnBuilding = function() {
  const flag = Game.flags[this.memory.targetFlag];
  if (flag === undefined) {
    this.memory.role = 'builder';
    this.memory.sourceId = undefined;
    this.memory.upgrading = undefined;
  }

  if (this.pos.isNearTo(flag)) {
    this.room.createConstructionSite(flag.pos, STRUCTURE_SPAWN);
    this.memory.role = 'builder';
    this.memory.sourceId = undefined;
    this.memory.upgrading = undefined;
  } else {
    this.moveByWaypointToFlag(flag);
  }
};
