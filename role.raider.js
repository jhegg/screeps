Creep.prototype.raiding = function() {
  this.notifyWhenAttacked(false);

  const flag = Game.flags[this.memory.raidingTargetFlag];
  if (flag === undefined) {
    const remainingFlags = _.filter(Game.flags, (flag) =>
      flag.name.startsWith('RaidingFlag'));
    if (remainingFlags.length > 0) {
      const newFlag = remainingFlags[0].name;
      console.log(`${this.room} Reassigning raider ${this} to flag ${newFlag}`);
      this.memory.raidingTargetFlag = newFlag;
    }
    return;
  }

  if (flag.pos.roomName !== this.room.name) {
    this.moveTo(flag);
    return;
  }

  if (this.room.controller.safeMode > 0) {
    console.log(`${this.room} flag ${flag} now under safe mode, removing.`);
    Game.notify(`${this.room} flag ${flag} now under safe mode, removing.`);
    this.memory.raidingTargetFlag = undefined;
    flag.remove();
  }

  const waypointFlags = _.filter(Game.flags, (waypointFlag) =>
    waypointFlag.name.startsWith(`WP${flag.name}-`));
  if (waypointFlags.length > 0) {
    const nextWaypointFlag = _.sortBy(waypointFlags, 'name')[0];
    if (this.pos.isEqualTo(nextWaypointFlag)) {
      console.log(`${this.room} removing ${nextWaypointFlag} since creep moved on it.`);
      nextWaypointFlag.remove();
    } else if (this.pos.isNearTo(nextWaypointFlag)) {
      console.log(`${this.room} using waypoint ${nextWaypointFlag} and near to it!`);
      this.moveTo(nextWaypointFlag, {ignoreDestructibleStructures: true});
      return;
    } else {
      console.log(`${this.room} using waypoint ${nextWaypointFlag}.`);
      this.moveTo(nextWaypointFlag);
      return;
    }
  }

  const target = getPrioritizedTarget(this);
  if (target !== undefined) {
    if (this.attack(target) === ERR_NOT_IN_RANGE) {
      this.moveTo(target, {ignoreDestructibleStructures: true});
      this.attack(target);
    }
  } else {
    console.log(`${this.room} flag ${flag} no longer has targets, removing.`);
    this.memory.raidingTargetFlag = undefined;
    flag.remove();
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
