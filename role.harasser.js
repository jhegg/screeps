Creep.prototype.harassing = function() {
  if (this.spawning) {
    return;
  }
  this.notifyWhenAttacked(false);

  const flag = Game.flags[this.memory.harasserTargetFlag];
  if (flag === undefined) {
    const remainingFlags = _.filter(Game.flags, (flag) =>
      flag.name.startsWith('HarasserFlag'));
    if (remainingFlags.length > 0) {
      const newFlag = remainingFlags[0].name;
      console.log(`${this.room} Reassigning harasser ${this} to flag ${newFlag}`);
      this.memory.harasserTargetFlag = newFlag;
    }
    return;
  }

  if (this.hits < this.hitsMax) {
    this.heal(this);
  }

  if (this.memory.healing && this.hits === this.hitsMax) {
    this.memory.healing = false;
  }

  if (this.memory.healing) {
    if (this.memory.exit.count > 0) {
      console.log(`${this.room} ${this} trying to exit room by moving one more time in direction ${this.memory.exit.direction}`);
      this.move(this.memory.exit.direction);
      this.memory.exit.count = 0;
      return;
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
    this.memory.harasserTargetFlag = undefined;
    flag.remove();
  }

  const towersWithEnergy = _.filter(this.room.find(FIND_HOSTILE_STRUCTURES),
    (structure) => structure.structureType === STRUCTURE_TOWER &&
      (structure.energy > 9 && structure.energy < structure.energyCapacity));
  if (towersWithEnergy.length > 0 && flag.memory.brokenTowers !== true) {
    if (this.hitsMax - this.hits > 700) {
      const exitDirection = getBestExitDirection(this);
      if (exitDirection) {
        console.log(`${this.room} ${this} trying to exit room in direction ${exitDirection}`);
        this.move(exitDirection);
        this.memory.healing = true;
        this.memory.exit = {direction: exitDirection, count: 1};
        return;
      }
    } else {
      return;
    }
  }

  const target = this.getPrioritizedTarget();
  if (target !== undefined) {
    if (this.attack(target) === ERR_NOT_IN_RANGE) {
      this.moveTo(target);
      this.attack(target);
    }
  } else {
    console.log(`${this.room} flag ${flag} no longer has targets, removing.`);
    this.memory.harasserTargetFlag = undefined;
    flag.remove();
  }
};

function getBestExitDirection(creep) {
  const pos = creep.pos;
  if (pos.x === 0) {
    return LEFT;
  } else if (pos.x === 49) {
    return RIGHT;
  } else if (pos.y === 0) {
    return TOP;
  } else if (pos.y === 49) {
    return BOTTOM;
  } else {
    console.log(`${creep.room} ${creep} unable to determine exit! Position: ${JSON.stringify(pos)}`);
    return undefined;
  }
}
