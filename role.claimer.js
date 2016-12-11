Creep.prototype.claiming = function() {
  const flag = Game.flags[this.memory.claimFlag];
  if (flag !== undefined && flag.pos.roomName === this.room.name) {
    const roomController = this.room.controller;
    if (roomController && roomController.my === false || roomController.my === undefined) {
      if (roomController.level > 0) {
        // TODO: if this has less than 5 CLAIM parts, can't attack.
        if (this.attackController(roomController) === ERR_NOT_IN_RANGE) {
          this.moveTo(roomController);
          this.attackController(roomController);
        }
        return;
      } else {
        if (this.memory.claimFailed === undefined) {
          const claimResult = this.claimController(roomController);
          switch (claimResult) {
            case OK:
              console.log(`${this.memory.role} ${this} successfully claimed ${roomController} in ${this.room.name}!`);
              Game.notify(`${this.memory.role} ${this} successfully claimed ${roomController} in ${this.room.name}!`);
              flag.room.createFlag(flag.pos, `NewSpawnFlag${flag.room.name}`);
              flag.remove();
              break;
            case ERR_NOT_IN_RANGE:
              this.moveTo(roomController);
              this.claimController(roomController);
              break;
            case ERR_FULL:
              console.log(`${this.memory.role} ${this} unable to claim ${roomController} due to Novice Area limit.`);
              this.memory.claimFailed = true;
              break;
            case ERR_GCL_NOT_ENOUGH:
              console.log(`${this.memory.role} ${this} unable to claim ${roomController} due to GCL too low.`);
              this.memory.claimFailed = true;
              break;
            default:
              console.log(`${this.memory.role} ${this} unable to claim ${roomController} due to error: ${claimResult}`);
              break;
          }
        } else {
          if (this.reserveController(roomController) === ERR_NOT_IN_RANGE) {
            this.moveTo(roomController);
            this.reserveController(roomController);
          }
        }
      }
    }
  } else {
    this.moveTo(flag);
  }
};
