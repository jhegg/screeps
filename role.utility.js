Creep.prototype.moveByWaypointToFlag = function(flag) {
  const waypoints = _.sortBy(_.filter(Game.flags,
    (waypointFlag) => waypointFlag.name.startsWith(`WP-${flag.name}-`)), 'name');
  const flags = [...waypoints, flag];

  if (this.memory.currentWaypoint === undefined) {
    this.memory.currentWaypoint = 1;
  }

  if (this.memory.currentWaypoint > flags.length) {
    console.log(`${this.room} Error: ${this} wants waypoint ${this.memory.currentWaypoint}, but flags length is ${flags.length}`);
    this.memory.currentWaypoint = flags.length;
  }

  if (this.pos.isEqualTo(flags[this.memory.currentWaypoint - 1])) {
    this.memory.currentWaypoint++;
  }

  this.moveTo(flags[this.memory.currentWaypoint - 1]);
};

Creep.prototype.getPrioritizedTarget = function() {
  const enemyCreeps = this.room.find(FIND_HOSTILE_CREEPS);
  const enemyCreepsWithAttackParts = _.filter(enemyCreeps, (enemyCreep) => _.any(enemyCreep.body, (body) => body.type === ATTACK || body.type === RANGED_ATTACK));
  if (enemyCreepsWithAttackParts.length > 0) {
    return _.sortBy(enemyCreepsWithAttackParts, (enemy) => Math.hypot(
      this.pos.x - enemy.pos.x, this.pos.y - enemy.pos.y))[0];
  }

  const enemySpawns = this.room.find(FIND_HOSTILE_SPAWNS);
  if (enemySpawns.length > 0) {
    return _.sortByOrder(enemySpawns, 'hits')[0];
  }

  if (enemyCreeps.length > 0) {
    return _.sortBy(enemyCreeps, (enemy) => Math.hypot(
      this.pos.x - enemy.pos.x, this.pos.y - enemy.pos.y))[0];
  }

  const enemyStructures = _.filter(this.room.find(FIND_HOSTILE_STRUCTURES),
    (structure) => structure.structureType !== STRUCTURE_CONTROLLER);
  if (enemyStructures.length > 0) {
    const enemyTowers = _.filter(enemyStructures,
      (structure) => structure.structureType === STRUCTURE_TOWER);
    if (enemyTowers.length > 0) {
      return _.sortBy(enemyTowers, (structure) => Math.hypot(
        this.pos.x - structure.pos.x, this.pos.y - structure.pos.y))[0];
    } else {
      return _.sortBy(enemyStructures, (structure) => Math.hypot(
        this.pos.x - structure.pos.x, this.pos.y - structure.pos.y))[0];
    }
  }

  return undefined;
};
