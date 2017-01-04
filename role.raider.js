Creep.prototype.raiding = function() {
  // this.memory.raidingTargetFlag = RaidingFlag1 (W58S73)
  const flag = Game.flags[this.memory.raidingTargetFlag];
  if (flag === undefined) {
    return;
  }

  if (flag.pos.roomName !== this.room.name) {
    this.moveTo(flag);
    return;
  }

  const target = getPrioritizedTarget(this);
  if (target !== undefined) {
    if (this.attack(target) === ERR_NOT_IN_RANGE) {
      this.moveTo(target);
      this.attack(target);
    }
  }
};

function getPrioritizedTarget(creep) {
  const enemySpawns = creep.room.find(FIND_HOSTILE_SPAWNS);
  if (enemySpawns.length > 0) {
    return _.sortByOrder(enemySpawns, 'hits')[0];
  }

  const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
  if (enemyStructures.length > 0) {
    const enemyTowersAndExtensions = _.filter(enemyStructures,
      (structure) => structure.structureType === STRUCTURE_EXTENSION ||
        structure.structureType === STRUCTURE_TOWER);
    if (enemyTowersAndExtensions.length > 0) {
      return _.sortBy(enemyTowersAndExtensions, (structure) => Math.hypot(
        creep.pos.x - structure.pos.x, creep.pos.y - structure.pos.y))[0];
    }
  }

  const enemyCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
  if (enemyCreeps.length > 0) {
    return _.sortBy(enemyCreeps, (enemy) => Math.hypot(
      creep.pos.x - enemy.pos.x, creep.pos.y - enemy.pos.y))[0];
  }

  return undefined;
}
