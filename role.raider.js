Creep.prototype.raiding = function() {
  this.notifyWhenAttacked(false);

  if (this.room.getHostiles().length > 0 && !this.room.controller.safeMode) {
    this.raiderAttacking();
    return;
  }

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
    this.moveByWaypointToFlag(flag);
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

  if (this.raiderAttacking() === -1) {
    console.log(`${this.room} flag ${flag} no longer has targets, removing.`);
    this.memory.raidingTargetFlag = undefined;
    flag.remove();
  }
};

Creep.prototype.raiderAttacking = function() {
  const target = this.getPrioritizedTarget();
  if (target !== undefined) {
    if (_.any(this.body, (body) => body.type === HEAL)) {
      this.heal(this);
      if (this.rangedAttack(target) === ERR_NOT_IN_RANGE) {
        this.moveTo(target);
        this.rangedAttack(target);
      }
      return 0;
    }

    if (this.attack(target) === ERR_NOT_IN_RANGE) {
      this.moveTo(target);
      this.attack(target);
    }
    return 0;
  } else {
    return -1;
  }
};
