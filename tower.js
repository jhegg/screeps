StructureTower.prototype.attackHostile = function(hostile) {
  const attackResult = this.attack(hostile);
  switch (attackResult) {
    case OK:
      console.log(`${this.room} Successful attack on hostile ${hostile} by tower ${this}`);
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      console.log(`${this.room} Warning! Tower ${this} does not have enough resources for attacking`);
      break;
    case ERR_INVALID_TARGET:
      console.log(`${this.room} Error: Tower ${this} attempted to attack an invalid target ${hostile}`);
      break;
    case ERR_RCL_NOT_ENOUGH:
      console.log(`${this.room} Error: Room Controller Level insufficient for tower`);
      break;
    default:
      console.log(`${this.room} Unknown result ${attackResult} of attack from ${this}`);
  }
};

StructureTower.prototype.healCreep = function(creep) {
  const result = this.heal(creep);
  switch (result) {
    case OK:
      console.log(`${this.room} Successful heal on ${creep} by tower ${this}`);
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      console.log(`${this.room} Warning! Tower ${this} does not have enough resources for healing`);
      break;
    case ERR_INVALID_TARGET:
      console.log(`${this.room} Error: Tower ${this} attempted to heal an invalid target ${creep}`);
      break;
    case ERR_RCL_NOT_ENOUGH:
      console.log(`${this.room} Error: Room Controller Level insufficient for tower`);
      break;
    default:
      console.log(`${this.room} Unknown result ${result} of heal from ${this}`);
  }
};

StructureTower.prototype.repairStructure = function(structureToRepair) {
  const result = this.repair(structureToRepair);
  switch (result) {
    case OK:
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      console.log(`${this.room} Warning! ${this} does not have enough resources for repairing`);
      break;
    case ERR_INVALID_TARGET:
      console.log(`${this.room} Error: ${this} attempted to repair an invalid target ${structureToRepair}`);
      break;
    case ERR_RCL_NOT_ENOUGH:
      console.log(`${this.room} Error: Room Controller Level insufficient for tower`);
      break;
    default:
      console.log(`${this.room} Unknown result ${result} of heal from ${this}`);
  }
};

StructureTower.prototype.run = function() {
  const hostileCreeps = this.room.getHostiles();
  if (hostileCreeps.length > 0) {
    this.attackHostile(hostileCreeps[0]);
    return;
  }

  if (this.energy <= 300) {
    return;
  }

  const creepsNeedingHealing = this.room.getCreepsNeedingHealing();
  if (creepsNeedingHealing.length > 0) {
    this.healCreep(creepsNeedingHealing[0]);
    return;
  }

  const containersToRepair = this.room.getContainersNeedingRepair();
  if (containersToRepair.length > 0) {
    const containersToRepairSortedByHits = containersToRepair.sort(function(a,b) {
      return a.hits - b.hits;
    });
    this.repairStructure(containersToRepairSortedByHits[0]);
    return;
  }

  const structuresToRepair = this.room.getStructuresNeedingRepair();
  if (structuresToRepair.length > 0) {
    this.repairStructure(structuresToRepair[0]);
    return;
  }

  const roadsToRepair = this.room.getRoadsNeedingRepair();
  if (roadsToRepair.length > 0) {
    this.repairStructure(roadsToRepair[0]);
    return;
  }

  const wallsToRepair = this.room.getRampartsAndWallsNeedingRepair();
  if (wallsToRepair.length > 0) {
    const sortedWallsByHits = _.sortByOrder(wallsToRepair, function(wall) {
      return wall.hits;
    }, ['asc']);
    this.repairStructure(sortedWallsByHits[0]);
    return;
  }
};
