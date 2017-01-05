Creep.prototype.moveByWaypointToFlag = function(flag) {
  const waypoints = _.sortBy(_.filter(Game.flags,
    (waypointFlag) => waypointFlag.name.startsWith(`WP-${flag.name}-`)), 'name');
  const flags = [...waypoints, flag];

  if (this.memory.currentWaypoint === undefined) {
    this.memory.currentWaypoint = 1;
  }

  if (this.memory.currentWaypoint > flags.length) {
    console.log(`${this.room} Error: ${this} wants waypoint ${this.memory.currentWaypoint}, but flags length is ${flags.length}`);
    this.memory.currentWaypoint = flags.length;
  }

  if (this.pos.isEqualTo(flags[this.memory.currentWaypoint - 1])) {
    this.memory.currentWaypoint++;
  }

  this.moveTo(flags[this.memory.currentWaypoint - 1]);
};
