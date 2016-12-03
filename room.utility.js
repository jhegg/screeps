var roomUtility = {
  activateSafeMode: function(room, hostileCreep) {
    if (room.controller.safeMode === undefined &&
        room.controller.safeModeAvailable > 0 &&
        room.controller.safeModeCooldown === undefined) {
      const safeModeResult = room.controller.activateSafeMode();
      switch (safeModeResult) {
        case OK:
          const message = `Safe mode activated due to ${JSON.stringify(hostileCreep)}`;
          console.log(message);
          Game.notify(message);
          break;
        case ERR_NOT_ENOUGH_RESOURCES:
          console.log(`Error: no safe modes available!`);
          break;
        case ERR_BUSY:
          // another room is in safe mode already, too bad
          break;
        case ERR_TIRED:
          // safe mode is on cooldown
          break;
        default:
          console.log(`Warning: unknown result ${safeModeResult} from
            attempt to activate safe mode`);
      }
    }
  },
  getSourceContainers(room) {
    return _.map(room.memory.sourceContainers, function(sourceContainer) {
      return Game.getObjectById(sourceContainer.id);
    });
  },
  hasSourceContainers(room) {
    return room.memory.sourceContainers &&
      room.memory.sourceContainers.length > 0;
  },
};

module.exports = roomUtility;
