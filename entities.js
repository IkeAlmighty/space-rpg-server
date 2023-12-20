// entity.js

class EntityFactory {
  static createEntity(subtype, initialValues = {}) {
    switch (subtype) {
      case "star":
        return new Entity(
          Entity.generateUniqueId("star"),
          initialValues.name || "Unnamed Star",
          initialValues.position || {x: 0, y: 0, z: 0},
          "star",
          initialValues.mass || 1e30,
          Infinity,
          initialValues.resources || 0
        );
      case "planet":
        return new Entity(
          Entity.generateUniqueId("planet"),
          initialValues.name || "Unnamed Planet",
          initialValues.position || {x: 0, y: 0, z: 0},
          "planet",
          initialValues.mass || 1e25,
          Infinity,
          initialValues.resources || 0
        );
      case "ship":
        return new Entity(
          Entity.generateUniqueId("ship"),
          initialValues.name || "Unnamed Ship",
          initialValues.position || {x: 0, y: 0, z: 0},
          "ship",
          initialValues.mass || 1e5,
          initialValues.storageCapacity || 10,
          initialValues.resources || 0
        );
      case "ship component":
        return new Entity(
          Entity.generateUniqueId("component"),
          initialValues.name || "Unnamed Component",
          null,
          "ship component",
          initialValues.mass || 500,
          Infinity,
          initialValues.resources || 0
        );
      default:
        throw new Error(`Unknown entity subtype: ${subtype}`);
    }
  }
}

// // Usage example:
// const star = EntityFactory.createEntity("star", {
//   name: "Sun",
//   mass: 2e30,
//   resources: 5000,
// });
// console.log(star);

// const ship = EntityFactory.createEntity("ship", {
//   name: "Explorer-1",
//   storageCapacity: 20,
// });
// console.log(ship);

class Entity {
  constructor(
    name,
    position,
    subtype,
    mass,
    storageCapacity,
    resources = {},
    thrustVectors = [],
    gravityInfluences = []
  ) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.lastPositionUpdateTimeStamp = Date.now();
    this.subtype = subtype;
    this.mass = mass;
    this.storageCapacity = storageCapacity;
    this.resources = resources;
    this.entitiesInside = [];
    this.thrustVectors = thrustVectors;
    this.gravityInfluences = gravityInfluences;
  }

  static generateUniqueId(prefix = "entity") {
    // Generate a random number or use a more sophisticated method for production
    const uniqueNumber = Math.floor(Math.random() * 1000000);
    return `${prefix}-${uniqueNumber}`;
  }

  updatePosition(timeStamp = Date.now()) {
    //if the timestamp given is before the last recorded position's timestamp, then throw an error:
    if (timeStamp < this.lastPositionUpdateTimeStamp) {
      throw new Error(
        "invalid timestamp: the last update was after the timestamp provided."
      );
    }

    // use recursion make sure this updatePosition has been called in
    // increments of 'step' ms all the way up to the provided timestamp.
    const step = 250;
    let timeElapsed = timeStamp - this.lastPositionUpdateTimeStamp;
    if (timeElapsed > step) {
      this.updatePosition(timeStamp - step);
      timeElapsed = step;
    }

    const resultantVector = {x: 0, y: 0, z: 0};

    // first, add gravityVectors to the resultant vector at this timestamp
    this.gravityInfluences.forEach((influentialEntity) => {
      // make sure the position of the influential enitity is up to date:
      influentialEntity.updatePosition(timestamp);
      const {x, y, z} = this.position;
      const dx = x - influentialEntity.position.x;
      const dy = y - influentialEntity.position.y;
      const dz = z - influentialEntity.position.z;
      const r = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
      const G = 6.6743e-11;
      const M = influentialEntity.mass;
      const gravityForce = (G * M * m) / r ** 2;
      const unitVector = {
        x: dx / r,
        y: dy / r,
        z: dz / r,
      };

      resultantVector.x += gravityForce * unitVector.x;
      resultantVector.y += gravityForce * unitVector.y;
      resultantVector.z += gravityForce * unitVector.z;
    });

    // then, add thrustVectors to the resultant vector at this timestamp
    this.gravityVectors.forEach((vector) => {
      resultantVector.x += vector.x;
      resultantVector.y += vector.y;
      resultantVector.z += vector.z;
    });

    // finally, detemine the new location of the entity based on the resultant force vector
    this.position.x = (resultantVector.x * timeElapsed ** 2) / this.mass;
    this.position.y = (resultantVector.y * timeElapsed ** 2) / this.mass;
    this.position.z = (resultantVector.z * timeElapsed ** 2) / this.mass;
    this.lastPositionUpdateTimeStamp = Date.now();
  }

  addEntityInside(entity) {
    if (this.entitiesInside.length < this.storageCapacity) {
      this.entitiesInside.push(entity);
      return true; // Entity successfully added
    } else {
      console.log(`Storage capacity of ${this.name} is full.`);
      return false; // Entity could not be added due to full capacity
    }
  }

  addGravityInfluence(entity) {
    // create and add a gravity vector, if the mass of the entity
    // is notable enough to warrant it.
    const threshold = 9.3 * 1020; // the mass of the asteroid Ceres
    if (entity.mass >= threshold) {
      this.gravityInfluences.push(entity);
    }
  }
}

// // Sample celestial bodies
// const celestialBodies = {
//   earth: new Entity("Earth", {x: 0, y: 0, z: 0}, "star", 5e24, Infinity, 1000),
//   mars: new Entity(
//     "Mars",
//     {x: 10, y: 5, z: 0},
//     "planet",
//     6.39e23,
//     Infinity,
//     500
//   ),
//   // Add more celestial bodies as needed
// };

// // Sample ships
// const ships = {
//   explorer1: new Entity("Explorer-1", {x: 2, y: 3, z: 0}, "ship", 1e4, 10, 0),
//   cargoShip1: new Entity(
//     "Cargo-Ship-1",
//     {x: 8, y: 10, z: 0},
//     "ship",
//     5e4,
//     20,
//     0
//   ),
//   // Add more ships as needed
// };

// // Sample ship components
// const shipComponents = {
//   cargoBay: new Entity("Cargo Bay", null, "ship component", 1e3, Infinity),
//   thrusters: new Entity("Thrusters", null, "ship component", 500, Infinity),
//   // Add more ship components as needed
// };

// celestialBodies.earth.addEntityInside(shipComponents.thrusters);
// ships.explorer1.addEntityInside(shipComponents.cargoBay);
// ships.explorer1.addEntityInside(shipComponents.thrusters);

// Export entities
module.exports = {
  EntityFactory,
};
