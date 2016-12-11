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
          console.log(`Error: upgrader unable to transfer from ${container}
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
          console.log(`Error: upgrader ${this} tried to harvest from
            ${container} which is invalid`);
          break;
        case ERR_FULL:
          console.log(`Warning: upgrader ${this} was full but tried to harvest
            anyway`);
          break;
        case ERR_NOT_IN_RANGE:
          this.moveTo(container);
          this.withdraw(container, RESOURCE_ENERGY);
          break;
        case ERR_INVALID_ARGS:
          console.log(`Error: upgrader ${this} tried to withdraw from
             ${container} but resource amount or type was incorrect`);
          break;
        default:
          console.log(`Warning: unknown result ${withdrawResult} from upgrader
             withdraw`);
      }
      return;
    }

    const controllerContainer = Game.getObjectById(this.room.memory.ControllerContainer);
    const spawnContainer = Game.getObjectById(this.room.memory.SpawnContainer);
    const towerContainer = Game.getObjectById(this.room.memory.TowerContainer);
    const roomStorage = this.room.storage;
    const source1Container = Game.getObjectById(this.room.memory.Source1Container);
    const source2Container = Game.getObjectById(this.room.memory.Source2Container);
    const containers = [
      controllerContainer,
      spawnContainer,
      towerContainer,
      roomStorage,
      source1Container,
      source2Container,
    ];

    for (var container of containers) {
      if (container && container.store[RESOURCE_ENERGY] > 150) {
        this.memory.containerId = container.id;
        if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.moveTo(container);
          this.withdraw(container, RESOURCE_ENERGY);
        }
        return;
      }
    }

    const source = Game.getObjectById(this.memory.sourceId);
    if (this.harvest(source) == ERR_NOT_IN_RANGE) {
      this.moveTo(source);
      this.harvest(source);
    }
  }
};
