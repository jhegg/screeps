var roomUtility = {
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
