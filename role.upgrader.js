var roleUtility = require('role.utility');

Creep.prototype.upgrading = function() {
  if (this.memory.upgrading && this.carry.energy === 0) {
    this.memory.upgrading = false;
    this.say('harvesting');
  }

  if (!this.memory.upgrading && this.carry.energy == this.carryCapacity) {
    this.memory.upgrading = true;
    this.memory.containerId = undefined;
    this.say('upgrading');
  }

  if (this.memory.upgrading) {
    if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
      this.moveTo(this.room.controller);
      this.upgradeController(this.room.controller);
    }
  } else {
    if (this.memory.containerId !== undefined) {
      const container = Game.getObjectById(this.memory.containerId);
      const withdrawResult = this.withdraw(container, RESOURCE_ENERGY);
      switch (withdrawResult) {
        case OK:
          this.memory.pickupWasEmptyCounter = undefined;
          this.upgradeController(this.room.controller);
          break;
        case ERR_NOT_OWNER:
          console.log(`${this.room} Error: upgrader unable to transfer from ${container}
            due to ownership/rampart`);
          break;
        case ERR_BUSY:
          // still spawning
          break;
        case ERR_NOT_ENOUGH_RESOURCES:
          if (!this.memory.pickupWasEmptyCounter) {
            this.memory.pickupWasEmptyCounter = 1;
          } else {
            this.memory.pickupWasEmptyCounter += 1;
          }
          if (this.memory.pickupWasEmptyCounter > 4) {
            this.memory.containerId = undefined;
            this.memory.pickupWasEmptyCounter = undefined;
          }
          break;
        case ERR_INVALID_TARGET:
          console.log(`${this.room} Error: upgrader ${this} tried to harvest from
            ${container} which is invalid`);
          break;
        case ERR_FULL:
          console.log(`${this.room} Warning: upgrader ${this} was full but tried to harvest
            anyway`);
          break;
        case ERR_NOT_IN_RANGE:
          this.moveTo(container);
          this.withdraw(container, RESOURCE_ENERGY);
          break;
        case ERR_INVALID_ARGS:
          console.log(`${this.room} Error: upgrader ${this} tried to withdraw from
             ${container} but resource amount or type was incorrect`);
          break;
        default:
          console.log(`${this.room} Warning: unknown result ${withdrawResult} from upgrader
             withdraw`);
      }
      return;
    }

    const pickupStructure = this.room.prioritizePickupsByPosition(this.pos)[0];
    if (pickupStructure) {
      this.memory.containerId = pickupStructure.id;
      if (this.withdraw(pickupStructure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(pickupStructure);
        this.withdraw(pickupStructure, RESOURCE_ENERGY);
      }
      return;
    }

    const source = Game.getObjectById(this.memory.sourceId);
    if (this.harvest(source) == ERR_NOT_IN_RANGE) {
      this.moveTo(source);
      this.harvest(source);
    }
  }
};
