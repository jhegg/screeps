Creep.prototype.mining = function() {
  if (this.memory.mining && _.sum(this.carry) === this.carryCapacity) {
    this.memory.mining = false;
    this.say('delivering');
  }

  if (!this.memory.mining && _.sum(this.carry) === 0) {
    this.memory.mining = true;
    this.say('mining');
  }

  if (this.memory.mining) {
    harvestFromMineralDeposit(this);
  } else {
    deliverMineralsToStorage(this);
  }
};

function harvestFromMineralDeposit(creep) {
  const minerals = creep.room.getMinerals();
  if (minerals.length) {
    const targetMineral = minerals[0];
    const harvestResult = creep.harvest(targetMineral);
    switch (harvestResult) {
      case OK:
        break;
      case ERR_NOT_IN_RANGE:
        creep.moveTo(targetMineral);
        creep.harvest(targetMineral);
        break;
      case ERR_NOT_ENOUGH_RESOURCES:
        break;
      case ERR_TIRED:
        break;
      case ERR_BUSY:
        break;
      default:
        console.log(`${creep.room} ${creep} mining harvestResult: ${harvestResult}, from ${targetMineral}`);
        break;
    }
  }
}

function deliverMineralsToStorage(creep) {
  const storage = creep.room.storage;
  if (storage !== undefined) {
    const resource = _.findKey(creep.carry, function(resource) {
      return resource > 0;
    });
    if (creep.transfer(storage, resource) === ERR_NOT_IN_RANGE) {
      creep.moveTo(storage);
      creep.transfer(storage, resource);
    }
  }
}
